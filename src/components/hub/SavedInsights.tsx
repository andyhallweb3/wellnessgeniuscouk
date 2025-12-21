import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Download, 
  Trash2, 
  MessageCircle, 
  Calendar,
  Loader2,
  Sparkles,
  FileText,
  Copy,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import jsPDF from "jspdf";

interface SavedSession {
  id: string;
  mode: string;
  prompt_input: string;
  output_text: string | null;
  created_at: string;
  credit_cost: number;
}

const MODE_LABELS: Record<string, string> = {
  "app-builder": "App Builder",
  "strategy-advisor": "Strategy Advisor",
  "retention-coach": "Retention Coach",
  "revenue-optimiser": "Revenue Optimiser",
  "risk-navigator": "Risk Navigator",
};

const MODE_COLORS: Record<string, string> = {
  "app-builder": "bg-blue-500/10 text-blue-500",
  "strategy-advisor": "bg-purple-500/10 text-purple-500",
  "retention-coach": "bg-green-500/10 text-green-500",
  "revenue-optimiser": "bg-amber-500/10 text-amber-500",
  "risk-navigator": "bg-red-500/10 text-red-500",
};

const SavedInsights = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSavedSessions();
    }
  }, [user]);

  const fetchSavedSessions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("agent_sessions")
        .select("*")
        .eq("saved", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error("Error fetching saved sessions:", error);
      toast.error("Failed to load saved insights");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsave = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from("agent_sessions")
        .update({ saved: false })
        .eq("id", sessionId);

      if (error) throw error;
      
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast.success("Insight removed from saved");
    } catch (error) {
      console.error("Error unsaving session:", error);
      toast.error("Failed to remove insight");
    }
  };

  const handleCopy = async (text: string, sessionId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(sessionId);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleExportPDF = (session: SavedSession) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - margin * 2;
      let yPos = 20;

      // Title
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("AI Coach Insight", margin, yPos);
      yPos += 10;

      // Mode badge
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(`Mode: ${MODE_LABELS[session.mode] || session.mode}`, margin, yPos);
      yPos += 6;
      doc.text(`Date: ${format(new Date(session.created_at), "dd MMM yyyy, HH:mm")}`, margin, yPos);
      yPos += 15;

      // Prompt section
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.text("YOUR QUESTION", margin, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const promptLines = doc.splitTextToSize(session.prompt_input, maxWidth);
      doc.text(promptLines, margin, yPos);
      yPos += promptLines.length * 5 + 15;

      // Response section
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("AI COACH RESPONSE", margin, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const responseText = session.output_text || "No response recorded";
      const responseLines = doc.splitTextToSize(responseText, maxWidth);
      
      // Handle page breaks
      responseLines.forEach((line: string) => {
        if (yPos > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, margin, yPos);
        yPos += 5;
      });

      // Footer
      yPos += 10;
      if (yPos > doc.internal.pageSize.getHeight() - 30) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text("Generated by Wellness Genius AI Coach", margin, yPos);

      doc.save(`ai-coach-insight-${format(new Date(session.created_at), "yyyy-MM-dd")}.pdf`);
      toast.success("PDF exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export PDF");
    }
  };

  const handleExportAll = () => {
    if (filteredSessions.length === 0) {
      toast.error("No insights to export");
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - margin * 2;
      let yPos = 20;

      // Title page
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("My AI Coach Insights", margin, yPos);
      yPos += 10;
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(`${filteredSessions.length} saved insights`, margin, yPos);
      doc.text(`Exported: ${format(new Date(), "dd MMM yyyy")}`, margin, yPos + 6);
      yPos += 25;

      filteredSessions.forEach((session, index) => {
        // Check if we need a new page
        if (yPos > doc.internal.pageSize.getHeight() - 60) {
          doc.addPage();
          yPos = 20;
        }

        // Session header
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text(`${index + 1}. ${MODE_LABELS[session.mode] || session.mode}`, margin, yPos);
        yPos += 6;

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);
        doc.text(format(new Date(session.created_at), "dd MMM yyyy, HH:mm"), margin, yPos);
        yPos += 10;

        // Question
        doc.setFontSize(10);
        doc.setTextColor(0);
        const promptLines = doc.splitTextToSize(`Q: ${session.prompt_input}`, maxWidth);
        promptLines.slice(0, 3).forEach((line: string) => {
          doc.text(line, margin, yPos);
          yPos += 5;
        });
        if (promptLines.length > 3) {
          doc.text("...", margin, yPos);
          yPos += 5;
        }
        yPos += 5;

        // Response preview
        const responseText = session.output_text || "No response";
        const responseLines = doc.splitTextToSize(`A: ${responseText}`, maxWidth);
        responseLines.slice(0, 4).forEach((line: string) => {
          if (yPos > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(line, margin, yPos);
          yPos += 5;
        });
        if (responseLines.length > 4) {
          doc.text("...", margin, yPos);
          yPos += 5;
        }
        
        yPos += 15;
      });

      doc.save(`all-ai-coach-insights-${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast.success("All insights exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export insights");
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      session.prompt_input.toLowerCase().includes(query) ||
      (session.output_text?.toLowerCase().includes(query)) ||
      MODE_LABELS[session.mode]?.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-heading flex items-center gap-2">
            <Sparkles size={20} className="text-accent" />
            Saved Insights
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {sessions.length} bookmarked AI Coach session{sessions.length !== 1 ? "s" : ""}
          </p>
        </div>
        
        {sessions.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleExportAll}>
            <Download size={14} />
            Export All
          </Button>
        )}
      </div>

      {/* Search */}
      {sessions.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search insights by keyword, question, or mode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Empty State */}
      {sessions.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-heading mb-2">No saved insights yet</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            When using AI Coach, bookmark valuable responses to save them here for easy reference and export.
          </p>
          <Button variant="accent" asChild>
            <a href="/hub/coach">Open AI Coach</a>
          </Button>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-heading mb-2">No results found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              {/* Session Header */}
              <div 
                className="p-5 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg shrink-0 ${MODE_COLORS[session.mode] || "bg-accent/10 text-accent"}`}>
                    <MessageCircle size={18} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${MODE_COLORS[session.mode] || "bg-accent/10 text-accent"}`}>
                        {MODE_LABELS[session.mode] || session.mode}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar size={12} />
                        {format(new Date(session.created_at), "dd MMM yyyy, HH:mm")}
                      </span>
                    </div>
                    
                    <p className="text-sm line-clamp-2">
                      {session.prompt_input}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(session.output_text || session.prompt_input, session.id);
                      }}
                    >
                      {copiedId === session.id ? (
                        <Check size={14} className="text-green-500" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportPDF(session);
                      }}
                    >
                      <FileText size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnsave(session.id);
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === session.id && session.output_text && (
                <div className="border-t border-border bg-muted/20 p-5">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    AI Coach Response
                  </div>
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">
                    {session.output_text}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedInsights;
