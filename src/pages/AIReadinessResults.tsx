import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Lock, ArrowRight, CheckCircle, BarChart3 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

interface ResultData {
  overallScore: number;
  scoreBand: string;
  pillarScores: {
    pillar: string;
    score: number;
    status: string;
  }[];
  headline: string;
  unlocked: boolean;
}

const getScoreBandLabel = (score: number) => {
  if (score < 40) return "AI-Unready";
  if (score < 60) return "AI-Curious";
  if (score < 80) return "AI-Ready";
  return "AI-Native";
};

const getHeadline = (score: number) => {
  if (score < 40) return "Your business isn't ready for AI — and that's okay.";
  if (score < 60) return "You're AI-curious — but the foundations need work.";
  if (score < 80) return "Your business is ready for AI pilots — but not for scale.";
  return "You're in the top tier of AI readiness.";
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

const lockedFeatures = [
  "Revenue upside range (conservative)",
  "Top 3 blockers identified",
  "90-day priority action plan",
  "Monetisation paths",
  "Downloadable PDF report",
];

const AIReadinessResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
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
          console.error("Failed to fetch results:", error);
          navigate("/ai-readiness");
          return;
        }

        const pillarScores = [
          { pillar: "Leadership & Strategy", score: data.leadership_score || 0 },
          { pillar: "Data & Infrastructure", score: data.data_score || 0 },
          { pillar: "People & Skills", score: data.people_score || 0 },
          { pillar: "Process & Operations", score: data.process_score || 0 },
          { pillar: "Risk, Ethics & Governance", score: data.risk_score || 0 },
        ].map(p => ({
          ...p,
          status: p.score < 40 ? "Critical" : p.score < 60 ? "Needs Work" : p.score < 80 ? "Healthy" : "Strong"
        }));

        setResultData({
          overallScore: data.overall_score,
          scoreBand: getScoreBandLabel(data.overall_score),
          pillarScores,
          headline: getHeadline(data.overall_score),
          unlocked: false, // TODO: Check payment status
        });
      } catch (err) {
        console.error("Error fetching results:", err);
        navigate("/ai-readiness");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!resultData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Your AI Readiness Score | Wellness Genius</title>
        <meta name="description" content="View your AI Readiness Score and unlock the full diagnostic report." />
      </Helmet>
      
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container-narrow section-padding">
          {/* Score Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-muted-foreground text-sm mb-6">
              <BarChart3 size={16} />
              <span>AI Readiness Score</span>
            </div>
            
            {/* Score Display */}
            <div className="mb-6">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="hsl(var(--secondary))"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="hsl(var(--accent))"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(resultData.overallScore / 100) * 440} 440`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold">{resultData.overallScore}</span>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                </div>
              </div>
            </div>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
              {resultData.scoreBand}
            </div>
            
            <h1 className="text-2xl md:text-3xl font-heading mb-4">
              {resultData.headline}
            </h1>
          </div>

          {/* Pillar Scores */}
          <div className="bg-card rounded-xl p-8 border border-border shadow-elegant mb-8">
            <h2 className="text-xl font-heading mb-6">Section Breakdown</h2>
            <div className="space-y-4">
              {resultData.pillarScores.map((pillar) => (
                <div key={pillar.pillar} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{pillar.pillar}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(pillar.status)}`}>
                        {pillar.status}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent transition-all duration-500"
                        style={{ width: `${pillar.score}%` }}
                      />
                    </div>
                  </div>
                  <span className="ml-4 text-sm font-medium w-12 text-right">{pillar.score}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Locked Premium Content */}
          {!resultData.unlocked && (
            <div className="bg-secondary/30 rounded-xl p-8 border border-border relative overflow-hidden mb-8">
              {/* Blur overlay */}
              <div className="absolute inset-0 backdrop-blur-sm bg-background/60 flex flex-col items-center justify-center z-10">
                <Lock size={32} className="text-muted-foreground mb-4" />
                <h3 className="text-xl font-heading mb-2">Unlock Full Report</h3>
                <p className="text-muted-foreground text-sm mb-6 text-center max-w-md">
                  Get your complete diagnostic with revenue upside, blockers, and 90-day action plan.
                </p>
                <Button variant="accent" size="lg" asChild>
                  <Link to={`/ai-readiness/checkout/${id}`}>
                    Unlock for £99
                    <ArrowRight size={16} />
                  </Link>
                </Button>
              </div>
              
              {/* Preview content (blurred) */}
              <div className="space-y-4 opacity-50">
                <div className="h-24 bg-card rounded-lg" />
                <div className="h-32 bg-card rounded-lg" />
                <div className="h-48 bg-card rounded-lg" />
              </div>
            </div>
          )}

          {/* What's included in the report */}
          <div className="bg-card rounded-xl p-8 border border-border shadow-elegant mb-8">
            <h2 className="text-xl font-heading mb-6">What's in the full report</h2>
            <ul className="space-y-3">
              {lockedFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckCircle size={16} className="text-accent mt-0.5 shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button variant="accent" size="lg" asChild>
              <Link to={`/ai-readiness/checkout/${id}`}>
                Unlock Full Report — £99
                <ArrowRight size={16} />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Secure payment. Instant access.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AIReadinessResults;
