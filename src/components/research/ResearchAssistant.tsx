import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp,
  Users,
  FileText,
  DollarSign,
  Shield,
  BarChart3,
  Search,
  Lightbulb,
  AlertTriangle,
  Target,
  Clock,
  ExternalLink,
  Loader2,
  BookOpen,
  Sparkles
} from "lucide-react";

type ResearchCategory = 'market_trends' | 'competitive' | 'evidence' | 'roi' | 'policy' | 'demographics';

interface KeyFinding {
  title: string;
  data: string;
  change: string | null;
  source: string | null;
  confidence: 'high' | 'medium' | 'low';
  supporting_evidence: string[];
}

interface StrategicInsight {
  insight_type: 'opportunity' | 'risk' | 'trend' | 'benchmark' | 'evidence' | 'caution';
  title: string;
  text: string;
  impact: 'high' | 'medium' | 'low';
  timeframe: 'immediate' | 'short_term' | 'long_term';
  recommended_actions: string[];
}

interface ResearchSource {
  title: string;
  url: string | null;
  source_date: string;
  credibility_score: number;
  source_type: 'academic' | 'industry_report' | 'news' | 'blog' | 'government';
}

interface ResearchResult {
  report_id: string;
  query: string;
  category: ResearchCategory;
  executive_summary: string;
  key_findings: KeyFinding[];
  strategic_insights: StrategicInsight[];
  sources: ResearchSource[];
  confidence_score: number;
  research_plan: {
    steps: Array<{ step: number; action: string; agent: string }>;
    data_sources: string[];
  };
  generated_at: string;
}

const categories: { id: ResearchCategory; label: string; icon: typeof TrendingUp; description: string }[] = [
  { id: 'market_trends', label: 'Market Trends', icon: TrendingUp, description: 'Market size, growth projections, and industry forecasts' },
  { id: 'competitive', label: 'Competitive', icon: Users, description: 'Competitor analysis, positioning, and market gaps' },
  { id: 'evidence', label: 'Evidence', icon: FileText, description: 'Peer-reviewed studies and clinical evidence' },
  { id: 'roi', label: 'ROI Analysis', icon: DollarSign, description: 'Cost-benefit analysis and financial projections' },
  { id: 'policy', label: 'Policy', icon: Shield, description: 'Regulatory requirements and compliance' },
  { id: 'demographics', label: 'Demographics', icon: BarChart3, description: 'Population trends and customer segmentation' }
];

const insightTypeIcons: Record<string, typeof Lightbulb> = {
  opportunity: Lightbulb,
  risk: AlertTriangle,
  trend: TrendingUp,
  benchmark: BarChart3,
  evidence: FileText,
  caution: AlertTriangle
};

const insightTypeColors: Record<string, string> = {
  opportunity: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  risk: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  trend: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  benchmark: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  evidence: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  caution: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
};

export default function ResearchAssistant() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ResearchCategory>('market_trends');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [currentStep, setCurrentStep] = useState<string | null>(null);

  const conductResearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Query required",
        description: "Please enter a research query",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to use the Research Assistant",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    setCurrentStep("Initialising research agents...");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("No active session");
      }

      setCurrentStep("Creating research plan...");
      
      const response = await supabase.functions.invoke('research-assistant', {
        body: { query, category: selectedCategory }
      });

      if (response.error) {
        throw new Error(response.error.message || "Research failed");
      }

      if (!response.data?.success) {
        throw new Error(response.data?.error || "Research failed");
      }

      setResult(response.data);
      setCurrentStep(null);

      toast({
        title: "Research complete",
        description: `Found ${response.data.key_findings?.length || 0} findings and ${response.data.strategic_insights?.length || 0} insights`
      });

    } catch (error) {
      console.error("Research error:", error);
      toast({
        title: "Research failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setCurrentStep(null);
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    const colors: Record<string, string> = {
      high: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      low: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[confidence] || colors.medium;
  };

  const getImpactBadge = (impact: string) => {
    const colors: Record<string, string> = {
      high: 'bg-primary/10 text-primary',
      medium: 'bg-muted text-muted-foreground',
      low: 'bg-muted/50 text-muted-foreground'
    };
    return colors[impact] || colors.medium;
  };

  const getTimeframeBadge = (timeframe: string) => {
    const labels: Record<string, string> = {
      immediate: 'Now',
      short_term: '1-3 months',
      long_term: '6+ months'
    };
    return labels[timeframe] || timeframe;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Research Assistant</h2>
          <p className="text-muted-foreground">AI-powered research for wellness executives</p>
        </div>
      </div>

      {/* Category Selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedCategory === cat.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Icon className={`h-5 w-5 mb-2 ${selectedCategory === cat.id ? 'text-primary' : 'text-muted-foreground'}`} />
              <div className="font-medium text-sm">{cat.label}</div>
              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{cat.description}</div>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter your research query..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && conductResearch()}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
            <Button onClick={conductResearch} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Research
                </>
              )}
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && currentStep && (
            <div className="mt-4 p-4 rounded-lg bg-muted/50 flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm">{currentStep}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Executive Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Executive Summary
                </CardTitle>
                <Badge variant="outline">
                  Confidence: {Math.round(result.confidence_score * 100)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">{result.executive_summary}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>Category: {categories.find(c => c.id === result.category)?.label}</span>
                <span>•</span>
                <span>Generated: {new Date(result.generated_at).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Tabbed Results */}
          <Tabs defaultValue="findings" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="findings">
                Findings ({result.key_findings?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="insights">
                Insights ({result.strategic_insights?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="sources">
                Sources ({result.sources?.length || 0})
              </TabsTrigger>
            </TabsList>

            {/* Key Findings Tab */}
            <TabsContent value="findings" className="mt-6">
              <div className="grid gap-4">
                {result.key_findings?.map((finding, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{finding.title}</h4>
                          <div className="mt-2 flex items-center gap-4">
                            <span className="text-2xl font-bold text-primary">{finding.data}</span>
                            {finding.change && (
                              <Badge variant="secondary" className="text-sm">
                                {finding.change}
                              </Badge>
                            )}
                          </div>
                          {finding.source && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Source: {finding.source}
                            </p>
                          )}
                          {finding.supporting_evidence?.length > 0 && (
                            <ul className="mt-3 space-y-1">
                              {finding.supporting_evidence.map((ev, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-primary">•</span>
                                  {ev}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <Badge className={getConfidenceBadge(finding.confidence)}>
                          {finding.confidence} confidence
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Strategic Insights Tab */}
            <TabsContent value="insights" className="mt-6">
              <div className="grid gap-4">
                {result.strategic_insights?.map((insight, index) => {
                  const Icon = insightTypeIcons[insight.insight_type] || Lightbulb;
                  return (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${insightTypeColors[insight.insight_type]}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold text-lg">{insight.title}</h4>
                              <Badge className={getImpactBadge(insight.impact)}>
                                {insight.impact} impact
                              </Badge>
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {getTimeframeBadge(insight.timeframe)}
                              </Badge>
                            </div>
                            <p className="mt-2 text-muted-foreground">{insight.text}</p>
                            
                            {insight.recommended_actions?.length > 0 && (
                              <div className="mt-4">
                                <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                                  <Target className="h-4 w-4" />
                                  Recommended Actions
                                </h5>
                                <ul className="space-y-2">
                                  {insight.recommended_actions.map((action, i) => (
                                    <li key={i} className="text-sm flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                                      <span className="text-primary font-medium">{i + 1}.</span>
                                      {action}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Sources Tab */}
            <TabsContent value="sources" className="mt-6">
              <div className="grid gap-3">
                {result.sources?.map((source, index) => (
                  <Card key={index}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{source.title}</h4>
                            {source.url && (
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <Badge variant="outline" className="capitalize">
                              {source.source_type?.replace('_', ' ')}
                            </Badge>
                            <span>{source.source_date}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {Math.round(source.credibility_score * 100)}%
                          </div>
                          <div className="text-xs text-muted-foreground">credibility</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Research Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Research Methodology</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {result.research_plan?.steps?.map((step, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {step.step}. {step.action}
                  </Badge>
                ))}
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Sources consulted: {result.research_plan?.data_sources?.join(', ')}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!result && !isLoading && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Start Your Research</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Select a category and enter a query to generate AI-powered research insights
              for wellness industry executives.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
