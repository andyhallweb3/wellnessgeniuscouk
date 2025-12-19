import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, CheckCircle, Check, X, BarChart3, TrendingUp, AlertTriangle, Calendar, Loader2, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PillarScore {
  pillar: string;
  score: number;
  status: string;
}

interface ReportData {
  overallScore: number;
  scoreBand: string;
  pillarScores: PillarScore[];
  headline: string;
  userInfo: {
    name: string;
    company: string;
    email: string;
    role: string;
    industry: string;
    companySize: string;
  };
}

interface AIInsights {
  headline: string;
  revenueUpside: {
    min: string;
    max: string;
    confidence: string;
    rationale?: string;
  };
  topBlockers: string[];
  priorityPlan: {
    action: string;
    effort: string;
    impact: string;
    week: string;
  }[];
  monetisationPaths: string[];
  doList?: string[];
  dontList?: string[];
  roleInsight?: string;
  nextStep?: string;
}

const getScoreBandLabel = (score: number) => {
  if (score < 40) return "AI-Unready";
  if (score < 60) return "AI-Curious";
  if (score < 80) return "AI-Ready";
  return "AI-Native";
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Critical": return "text-red-500 bg-red-500/10";
    case "Needs Work": return "text-yellow-500 bg-yellow-500/10";
    case "Healthy": return "text-accent bg-accent/10";
    case "Strong": return "text-green-500 bg-green-500/10";
    default: return "text-muted-foreground bg-secondary";
  }
};

// Fallback data if AI fails
const getFallbackInsights = (score: number): AIInsights => {
  const isLowScore = score < 60;
  
  return {
    headline: isLowScore 
      ? "Your business needs foundational work before AI adoption."
      : "Your business is positioned for AI implementation.",
    revenueUpside: isLowScore 
      ? { min: "£25,000", max: "£75,000", confidence: "Low" }
      : { min: "£100,000", max: "£350,000", confidence: "Medium" },
    topBlockers: isLowScore
      ? [
          "No clear AI ownership at executive level",
          "Siloed data across multiple systems",
          "Limited process documentation",
        ]
      : [
          "Scaling infrastructure for AI workloads",
          "Change management for AI adoption",
          "Measuring AI ROI consistently",
        ],
    priorityPlan: isLowScore
      ? [
          { action: "Assign executive AI sponsor", effort: "Low", impact: "High", week: "1-2" },
          { action: "Audit data sources and ownership", effort: "Medium", impact: "High", week: "2-4" },
          { action: "Document top 5 manual processes", effort: "Medium", impact: "Medium", week: "4-6" },
          { action: "Run AI literacy session for leadership", effort: "Low", impact: "High", week: "6-8" },
          { action: "Identify first pilot use case", effort: "Medium", impact: "High", week: "8-12" },
        ]
      : [
          { action: "Select high-impact pilot use case", effort: "Medium", impact: "High", week: "1-2" },
          { action: "Build AI agent for single workflow", effort: "High", impact: "High", week: "2-6" },
          { action: "Establish measurement framework", effort: "Medium", impact: "Medium", week: "4-6" },
          { action: "Train team on AI tool usage", effort: "Medium", impact: "Medium", week: "6-8" },
          { action: "Plan second phase rollout", effort: "Low", impact: "High", week: "8-12" },
        ],
    monetisationPaths: isLowScore
      ? [
          "Internal efficiency gains (cost reduction)",
          "Reduced manual processing time",
        ]
      : [
          "AI-powered premium service tier",
          "Automated lead qualification and conversion",
          "Personalised member engagement at scale",
          "Predictive retention interventions",
        ],
  };
};

const AIReadinessReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingInsights, setGeneratingInsights] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) {
        navigate("/ai-readiness");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("ai_readiness_completions")
          .select("*")
          .eq("id", id)
          .single();

        if (error || !data) {
          console.error("Failed to fetch report:", error);
          navigate("/ai-readiness");
          return;
        }

        const pillarScores: PillarScore[] = [
          { pillar: "Leadership & Strategy", score: data.leadership_score || 0 },
          { pillar: "Data & Infrastructure", score: data.data_score || 0 },
          { pillar: "People & Skills", score: data.people_score || 0 },
          { pillar: "Process & Operations", score: data.process_score || 0 },
          { pillar: "Risk, Ethics & Governance", score: data.risk_score || 0 },
        ].map(p => ({
          ...p,
          status: p.score < 40 ? "Critical" : p.score < 60 ? "Needs Work" : p.score < 80 ? "Healthy" : "Strong"
        }));

        const reportInfo: ReportData = {
          overallScore: data.overall_score,
          scoreBand: getScoreBandLabel(data.overall_score),
          pillarScores,
          headline: "",
          userInfo: {
            name: data.name || "User",
            company: data.company || "Company",
            email: data.email,
            role: data.role || "",
            industry: data.industry || "",
            companySize: data.company_size || "",
          },
        };

        setReportData(reportInfo);
        setLoading(false);

        // Generate AI insights
        setGeneratingInsights(true);
        try {
          const { data: insightData, error: insightError } = await supabase.functions.invoke(
            "generate-readiness-insights",
            {
              body: {
                businessType: "Wellness operator",
                companySize: data.company_size,
                industry: data.industry,
                overallScore: data.overall_score,
                pillarScores,
                role: data.role,
              },
            }
          );

          if (insightError) throw insightError;
          
          if (insightData?.insights) {
            setInsights(insightData.insights);
            setReportData(prev => prev ? { ...prev, headline: insightData.insights.headline } : null);
          } else {
            throw new Error("No insights returned");
          }
        } catch (insightErr) {
          console.error("Failed to generate AI insights:", insightErr);
          // Use fallback data
          const fallback = getFallbackInsights(data.overall_score);
          setInsights(fallback);
          setReportData(prev => prev ? { ...prev, headline: fallback.headline } : null);
          toast({
            title: "Using standard insights",
            description: "AI-generated insights unavailable. Showing standard recommendations.",
          });
        } finally {
          setGeneratingInsights(false);
        }
      } catch (err) {
        console.error("Error fetching report:", err);
        navigate("/ai-readiness");
      }
    };

    fetchReport();
  }, [id, navigate, toast]);

  const handleDownloadPDF = () => {
    // TODO: Implement PDF generation
    toast({
      title: "Coming soon",
      description: "PDF download will be available shortly.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your report...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>AI Readiness Report | {reportData.userInfo.company}</title>
        <meta name="description" content="Your complete AI Readiness diagnostic report with actionable insights." />
      </Helmet>
      
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container-narrow section-padding">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link 
              to="/ai-readiness"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} />
              Back
            </Link>
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download size={16} />
              Download PDF
            </Button>
          </div>

          {/* Report Header */}
          <div className="bg-card rounded-xl p-8 border border-border shadow-elegant mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">AI Readiness Report</p>
                <h1 className="text-2xl font-heading mb-1">{reportData.userInfo.company}</h1>
                <p className="text-sm text-muted-foreground">Prepared for {reportData.userInfo.name}</p>
              </div>
              <div className="text-center md:text-right">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-2">
                  <span className="text-2xl font-bold text-accent">{reportData.overallScore}</span>
                </div>
                <p className="text-sm font-medium">{reportData.scoreBand}</p>
              </div>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center mb-12">
            {generatingInsights ? (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Sparkles size={20} className="animate-pulse" />
                <span>Generating personalised insights...</span>
              </div>
            ) : (
              <h2 className="text-2xl font-heading">{reportData.headline}</h2>
            )}
          </div>

          {/* Pillar Scores */}
          <div className="bg-card rounded-xl p-8 border border-border shadow-elegant mb-8">
            <h3 className="text-xl font-heading mb-6 flex items-center gap-2">
              <BarChart3 size={20} className="text-accent" />
              Section Breakdown
            </h3>
            <div className="space-y-4">
              {reportData.pillarScores.map((pillar) => (
                <div key={pillar.pillar}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{pillar.pillar}</span>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(pillar.status)}`}>
                        {pillar.status}
                      </span>
                      <span className="text-sm font-medium w-12 text-right">{pillar.score}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent transition-all duration-500"
                      style={{ width: `${pillar.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {generatingInsights ? (
            <div className="bg-card rounded-xl p-12 border border-border shadow-elegant mb-8 text-center">
              <Loader2 size={32} className="animate-spin mx-auto mb-4 text-accent" />
              <p className="text-muted-foreground">Analysing your results with AI...</p>
              <p className="text-sm text-muted-foreground mt-2">This takes about 10-15 seconds</p>
            </div>
          ) : insights && (
            <>
              {/* Revenue Upside */}
              <div className="bg-accent/5 rounded-xl p-8 border border-accent/20 mb-8">
                <h3 className="text-xl font-heading mb-4 flex items-center gap-2">
                  <TrendingUp size={20} className="text-accent" />
                  Revenue Upside Range
                </h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-heading">{insights.revenueUpside.min}</span>
                  <span className="text-muted-foreground">to</span>
                  <span className="text-3xl font-heading">{insights.revenueUpside.max}</span>
                  <span className="text-sm text-muted-foreground">/ year</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Confidence: {insights.revenueUpside.confidence}
                  {insights.revenueUpside.rationale && ` — ${insights.revenueUpside.rationale}`}
                </p>
              </div>

              {/* Top Blockers */}
              <div className="bg-red-500/5 rounded-xl p-8 border border-red-500/20 mb-8">
                <h3 className="text-xl font-heading mb-4 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-red-500" />
                  Top Blockers
                </h3>
                <ul className="space-y-3">
                  {insights.topBlockers.map((blocker, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-sm shrink-0">
                        {idx + 1}
                      </span>
                      <span>{blocker}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Do / Don't Lists */}
              {(insights.doList || insights.dontList) && (
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {insights.doList && (
                    <div className="bg-accent/5 rounded-xl p-6 border border-accent/20">
                      <h3 className="font-heading font-medium mb-4 flex items-center gap-2">
                        <Check className="w-5 h-5 text-accent" />
                        What to do next
                      </h3>
                      <ul className="space-y-3">
                        {insights.doList.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {insights.dontList && (
                    <div className="bg-red-500/5 rounded-xl p-6 border border-red-500/20">
                      <h3 className="font-heading font-medium mb-4 flex items-center gap-2">
                        <X className="w-5 h-5 text-red-500" />
                        What NOT to do yet
                      </h3>
                      <ul className="space-y-3">
                        {insights.dontList.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Role-Specific Insight */}
              {insights.roleInsight && (
                <div className="bg-secondary/50 rounded-xl p-6 border border-border mb-8">
                  <p className="text-sm text-muted-foreground mb-2">Based on your role as {reportData.userInfo.role || "a decision-maker"}:</p>
                  <p className="text-foreground font-medium">{insights.roleInsight}</p>
                </div>
              )}

              {/* 90-Day Priority Plan */}
              <div className="bg-card rounded-xl p-8 border border-border shadow-elegant mb-8">
                <h3 className="text-xl font-heading mb-6 flex items-center gap-2">
                  <Calendar size={20} className="text-accent" />
                  90-Day Priority Plan
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 font-medium">Action</th>
                        <th className="text-center py-3 font-medium">Effort</th>
                        <th className="text-center py-3 font-medium">Impact</th>
                        <th className="text-right py-3 font-medium">Week</th>
                      </tr>
                    </thead>
                    <tbody>
                      {insights.priorityPlan.map((item, idx) => (
                        <tr key={idx} className="border-b border-border/50 last:border-0">
                          <td className="py-3">{item.action}</td>
                          <td className="py-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs ${
                              item.effort === "Low" ? "bg-green-500/10 text-green-500" :
                              item.effort === "Medium" ? "bg-yellow-500/10 text-yellow-500" :
                              "bg-red-500/10 text-red-500"
                            }`}>
                              {item.effort}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs ${
                              item.impact === "High" ? "bg-accent/10 text-accent" :
                              "bg-secondary text-muted-foreground"
                            }`}>
                              {item.impact}
                            </span>
                          </td>
                          <td className="py-3 text-right text-muted-foreground">{item.week}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Monetisation Paths */}
              <div className="bg-card rounded-xl p-8 border border-border shadow-elegant mb-8">
                <h3 className="text-xl font-heading mb-4">Monetisation Paths</h3>
                <ul className="space-y-2">
                  {insights.monetisationPaths.map((path, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle size={16} className="text-accent mt-0.5 shrink-0" />
                      <span>{path}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Next Step */}
              {insights.nextStep && (
                <div className="bg-accent/10 rounded-xl p-8 border border-accent/20 mb-8 text-center">
                  <p className="text-sm font-medium text-accent uppercase tracking-wider mb-2">
                    Your Next Step
                  </p>
                  <p className="text-lg font-heading">{insights.nextStep}</p>
                </div>
              )}
            </>
          )}

          {/* Disclaimer */}
          <div className="bg-secondary/30 rounded-xl p-6 border border-border text-center">
            <p className="text-xs text-muted-foreground">
              This report provides indicative guidance based on your assessment responses. Revenue estimates are conservative and based on industry benchmarks. Actual results will vary based on execution and market conditions. This is not financial advice.
            </p>
          </div>

          {/* Download CTA */}
          <div className="text-center mt-8">
            <Button variant="accent" size="lg" onClick={handleDownloadPDF}>
              <Download size={16} />
              Download PDF Report
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AIReadinessReport;
