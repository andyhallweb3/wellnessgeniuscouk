import { useState, useEffect } from "react";
import { 
  Download, 
  Clock, 
  FileText, 
  Calendar,
  Globe,
  Mail,
  Zap,
  BarChart3,
  BookOpen,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface DownloadRecord {
  id: string;
  product_id: string;
  product_name: string;
  download_type: string;
  product_type: string;
  created_at: string;
  email_opened: boolean | null;
  email_opened_at: string | null;
  email_clicked: boolean | null;
  email_clicked_at: string | null;
}

const PRODUCT_ICONS: Record<string, React.ReactNode> = {
  "prompt-pack": <Zap size={16} />,
  "revenue-framework": <BarChart3 size={16} />,
  "build-vs-buy": <BookOpen size={16} />,
  "activation-playbook": <BookOpen size={16} />,
  "engagement-playbook": <BarChart3 size={16} />,
  "gamification-playbook": <Zap size={16} />,
  "readiness-score": <Sparkles size={16} />,
  "reality-checklist": <FileText size={16} />,
  "myths-deck": <FileText size={16} />,
};

const DownloadHistory = () => {
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDownloadHistory();
  }, []);

  const fetchDownloadHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("product_downloads")
        .select("id, product_id, product_name, download_type, product_type, created_at, email_opened, email_opened_at, email_clicked, email_clicked_at")
        .order("created_at", { ascending: false })
        .limit(50);

      if (fetchError) {
        console.error("Error fetching download history:", fetchError);
        setError("Unable to load download history");
      } else {
        setDownloads(data || []);
      }
    } catch (err) {
      console.error("Download history error:", err);
      setError("Unable to load download history");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const getTypeLabel = (downloadType: string, productType: string) => {
    if (downloadType === "free" || productType === "free") {
      return { label: "Free", className: "bg-green-500/10 text-green-600" };
    }
    return { label: "Paid", className: "bg-accent/10 text-accent" };
  };

  const displayedDownloads = isExpanded ? downloads : downloads.slice(0, 5);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Clock size={20} className="text-blue-500" />
          </div>
          <h3 className="text-lg font-heading">Download History</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Clock size={20} className="text-blue-500" />
          </div>
          <h3 className="text-lg font-heading">Download History</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">{error}</p>
      </div>
    );
  }

  if (downloads.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Clock size={20} className="text-blue-500" />
          </div>
          <h3 className="text-lg font-heading">Download History</h3>
        </div>
        <div className="text-center py-6">
          <Download className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No downloads yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Clock size={20} className="text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-heading">Download History</h3>
            <p className="text-xs text-muted-foreground">{downloads.length} total downloads</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {displayedDownloads.map((download) => {
          const { date, time } = formatDateTime(download.created_at);
          const typeInfo = getTypeLabel(download.download_type, download.product_type);

          return (
            <div
              key={download.id}
              className="p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-background transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-md bg-muted shrink-0">
                  {PRODUCT_ICONS[download.product_id] || <FileText size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{download.product_name}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${typeInfo.className}`}>
                      {typeInfo.label}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar size={10} />
                      {date}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock size={10} />
                      {time}
                    </span>
                  </div>
                  
                  {/* Email engagement tracking */}
                  {(download.email_opened || download.email_clicked) && (
                    <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-border/30">
                      {download.email_opened && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-purple-500/10 text-purple-600">
                          <Mail size={10} />
                          Email opened
                          {download.email_opened_at && (
                            <span className="opacity-70">
                              {formatDateTime(download.email_opened_at).date}
                            </span>
                          )}
                        </span>
                      )}
                      {download.email_clicked && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-blue-500/10 text-blue-600">
                          <Globe size={10} />
                          Link clicked
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {downloads.length > 5 && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-4"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <ChevronUp size={14} />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown size={14} />
              Show All ({downloads.length})
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default DownloadHistory;
