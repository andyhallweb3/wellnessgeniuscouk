import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import FounderLayout from "@/components/founder/FounderLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { 
  Drawer, 
  DrawerClose, 
  DrawerContent, 
  DrawerDescription, 
  DrawerFooter, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerTrigger 
} from "@/components/ui/drawer";
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  Lightbulb, 
  RefreshCw,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Brain,
  Save
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface FocusItem {
  priority: string;
  why_now: string;
  if_ignored: string;
  next_step: string;
}

interface Signal {
  signal: string;
  direction: "up" | "down" | "neutral";
  meaning: string;
}

interface Decision {
  decision: string;
  context: string;
  recommended_option: string;
  confidence: string;
  tradeoffs: string;
}

interface Risk {
  item: string;
  reason: string;
}

interface Narrative {
  angle: string;
  why_it_matters: string;
  suggested_channel: string;
}

interface AgentData {
  founder_focus: FocusItem[];
  signals: Signal[];
  decisions_pending: Decision[];
  risks_and_distractions: Risk[];
  narrative_suggestions: Narrative[];
  meta: {
    generated_at: string;
    confidence_note: string;
  };
}

export default function CommandCentre() {
  const { user } = useAuth();
  const [data, setData] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  
  // Brain dump state
  const [brainDump, setBrainDump] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const fetchAgentData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: responseData, error: fetchError } = await supabase.functions.invoke('founder-agent', {
        body: { businessContext: null }
      });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (responseData.error) {
        throw new Error(responseData.error);
      }

      setData(responseData);
    } catch (err) {
      console.error("Error fetching agent data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch insights");
      toast.error("Failed to load insights");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!brainDump.trim() || !user) {
      toast.error("Please enter some text");
      return;
    }

    setSavingNote(true);
    try {
      const { error: insertError } = await supabase
        .from('founder_journal')
        .insert({
          user_id: user.id,
          content: brainDump.trim()
        });

      if (insertError) {
        throw insertError;
      }

      toast.success("Note saved! Refreshing insights...");
      setBrainDump("");
      
      // Auto-refresh the dashboard to show agent's reaction
      await fetchAgentData();
    } catch (err) {
      console.error("Error saving note:", err);
      toast.error("Failed to save note");
    } finally {
      setSavingNote(false);
    }
  };

  useEffect(() => {
    fetchAgentData();
  }, []);

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      high: "default",
      medium: "secondary",
      low: "outline"
    };
    return (
      <Badge variant={variants[confidence] || "outline"}>
        {confidence}
      </Badge>
    );
  };

  if (loading) {
    return (
      <FounderLayout>
        <Helmet>
          <title>Command Centre | Wellness Genius</title>
        </Helmet>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </FounderLayout>
    );
  }

  if (error) {
    return (
      <FounderLayout>
        <Helmet>
          <title>Command Centre | Wellness Genius</title>
        </Helmet>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchAgentData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </FounderLayout>
    );
  }

  return (
    <FounderLayout>
      <Helmet>
        <title>Command Centre | Wellness Genius</title>
        <meta name="description" content="Founder command centre with AI-powered strategic insights" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Command Centre</h1>
            {data?.meta?.generated_at && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" />
                Updated {new Date(data.meta.generated_at).toLocaleTimeString()}
              </p>
            )}
          </div>
          <Button onClick={fetchAgentData} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Focus Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-primary" />
                  Today's Focus
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data?.founder_focus?.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <p className="font-medium">{item.priority}</p>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Why now:</span> {item.why_now}
                        </p>
                        <p className="text-sm text-amber-600 dark:text-amber-400">
                          <span className="font-medium">If ignored:</span> {item.if_ignored}
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        {item.next_step}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Decisions Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Decisions Pending</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data?.decisions_pending?.map((decision, idx) => (
                  <Drawer key={idx}>
                    <DrawerTrigger asChild>
                      <button 
                        className="w-full p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-left flex items-center justify-between"
                        onClick={() => setSelectedDecision(decision)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">{idx + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium">{decision.decision}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {decision.context}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getConfidenceBadge(decision.confidence)}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>{decision.decision}</DrawerTitle>
                        <DrawerDescription>{decision.context}</DrawerDescription>
                      </DrawerHeader>
                      <div className="px-4 space-y-4">
                        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-800 dark:text-green-200">Recommended</span>
                            {getConfidenceBadge(decision.confidence)}
                          </div>
                          <p className="text-green-700 dark:text-green-300">{decision.recommended_option}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <span className="font-medium text-amber-800 dark:text-amber-200">Trade-offs</span>
                          </div>
                          <p className="text-amber-700 dark:text-amber-300">{decision.tradeoffs}</p>
                        </div>
                      </div>
                      <DrawerFooter>
                        <DrawerClose asChild>
                          <Button variant="outline">Close</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>
                ))}
              </CardContent>
            </Card>

            {/* Narrative Suggestions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Content Ideas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data?.narrative_suggestions?.map((narrative, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-lg border bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30"
                    >
                      <p className="font-medium text-sm">{narrative.angle}</p>
                      <p className="text-xs text-muted-foreground mt-1">{narrative.why_it_matters}</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {narrative.suggested_channel}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Brain Dump Section */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Brain className="h-5 w-5 text-primary" />
                  Brain Dump
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Share what's on your mind. The AI will factor this into its next analysis.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="What's on your mind? Any concerns, ideas, or context the AI should know about..."
                  value={brainDump}
                  onChange={(e) => setBrainDump(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveNote} 
                    disabled={savingNote || !brainDump.trim()}
                    size="sm"
                  >
                    {savingNote ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save & Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Column */}
          <div className="space-y-6">
            {/* Signals Ticker */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Live Signals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data?.signals?.map((signal, idx) => (
                  <div 
                    key={idx}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="mt-0.5">
                      {getDirectionIcon(signal.direction)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{signal.signal}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {signal.meaning}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Risks & Distractions */}
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                  Risks & Distractions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data?.risks_and_distractions?.map((risk, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900"
                  >
                    <div className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-sm text-red-800 dark:text-red-200">
                          {risk.item}
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          {risk.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Meta / Confidence */}
            {data?.meta?.confidence_note && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">AI Confidence:</span> {data.meta.confidence_note}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </FounderLayout>
  );
}
