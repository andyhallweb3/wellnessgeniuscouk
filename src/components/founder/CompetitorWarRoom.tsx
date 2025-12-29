import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Crosshair, 
  RefreshCw, 
  Target, 
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  ExternalLink 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DifferentiationStrategy {
  strategy: string;
  why_it_works: string;
  messaging_example: string;
}

interface CompetitorAnalysis {
  competitor_summary: string;
  strengths_identified: string[];
  differentiation_strategies: DifferentiationStrategy[];
  competitive_gaps: string[];
  action_items: string[];
  analyzed_url: string;
  analyzed_at: string;
}

export default function CompetitorWarRoom() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<CompetitorAnalysis | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast.error("Please enter a competitor URL");
      return;
    }

    // Basic URL validation
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    setLoading(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-url', {
        body: { url: formattedUrl }
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      setAnalysis(data);
      toast.success("Competitor analysis complete!");
    } catch (err) {
      console.error("Error analyzing competitor:", err);
      toast.error(err instanceof Error ? err.message : "Failed to analyze competitor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50/50 to-transparent dark:from-violet-950/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Crosshair className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          Competitor War Room
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Paste a competitor's landing page URL to get AI-powered differentiation strategies.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* URL Input */}
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://competitor.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
            disabled={loading}
          />
          <Button 
            onClick={handleAnalyze} 
            disabled={loading || !url.trim()}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                Analyze
              </>
            )}
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {/* Analysis Results */}
        {analysis && !loading && (
          <div className="space-y-4 pt-2">
            {/* Competitor Summary */}
            <div className="p-3 rounded-lg bg-violet-100/50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-violet-800 dark:text-violet-200">
                  Competitor Summary
                </span>
                <a 
                  href={analysis.analyzed_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-violet-600 hover:underline flex items-center gap-1"
                >
                  View Page <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <p className="text-sm text-muted-foreground">{analysis.competitor_summary}</p>
            </div>

            {/* Competitive Gaps */}
            {analysis.competitive_gaps?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Competitive Gaps to Exploit
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.competitive_gaps.map((gap, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {gap}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Differentiation Strategies */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                Differentiation Strategies
              </h4>
              {analysis.differentiation_strategies?.map((strategy, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-lg border bg-card space-y-2"
                >
                  <div className="flex items-start gap-2">
                    <span className="h-5 w-5 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center text-xs font-medium text-violet-700 dark:text-violet-300 shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{strategy.strategy}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {strategy.why_it_works}
                      </p>
                    </div>
                  </div>
                  <div className="ml-7 p-2 rounded bg-muted/50 border-l-2 border-violet-400">
                    <p className="text-xs italic text-muted-foreground">
                      "{strategy.messaging_example}"
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Items */}
            {analysis.action_items?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Immediate Action Items
                </h4>
                <div className="space-y-1">
                  {analysis.action_items.map((action, idx) => (
                    <div 
                      key={idx}
                      className="flex items-start gap-2 text-sm p-2 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <span className="text-green-500 shrink-0">→</span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamp */}
            <p className="text-xs text-muted-foreground text-right">
              Analyzed {new Date(analysis.analyzed_at).toLocaleString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
