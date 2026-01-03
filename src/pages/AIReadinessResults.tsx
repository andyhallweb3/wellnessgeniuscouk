import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Lock, ArrowRight, CheckCircle, BarChart3, Save, Loader2, Lightbulb, Sparkles, Gift, Download } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { PILLARS, getScoreBand as getScoreBandFromData, getPillarStatus } from "@/data/aiReadinessQuestions";
import { generateReadinessReport } from "@/lib/pdf-generators";

interface ResultData {
  overallScore: number;
  scoreBand: string;
  scoreBandDescription: string;
  pillarScores: {
    pillar: string;
    shortName: string;
    score: number;
    status: string;
    statusVariant: "critical" | "warning" | "healthy" | "strong";
    insight: string;
  }[];
  headline: string;
  subheadline: string;
}

interface LocationState {
  overallScore?: number;
  scoreBand?: string;
  scoreBandDescription?: string;
  pillarScores?: {
    leadership_score: number;
    data_score: number;
    people_score: number;
    process_score: number;
    risk_score: number;
  };
}

const getHeadline = (score: number) => {
  if (score < 40) return "Your business isn't ready for AI — and that's okay.";
  if (score < 60) return "You're AI-curious — but the foundations need work.";
  if (score < 80) return "Your business is ready for AI pilots — but not for scale.";
  return "You're in the top tier of AI readiness.";
};

const getSubheadline = (score: number) => {
  if (score < 40) return "There are some foundational steps to take first. The full report shows you exactly where to start.";
  if (score < 60) return "Good awareness, but gaps remain. Unlock your report to see the specific blockers holding you back.";
  if (score < 80) return "Strong foundations in place. Your report reveals how to accelerate from here.";
  return "You're ahead of most. Your report shows how to maximise your advantage.";
};

const getStatusColor = (variant: "critical" | "warning" | "healthy" | "strong") => {
  switch (variant) {
    case "critical": return "text-red-500 bg-red-500/10";
    case "warning": return "text-yellow-500 bg-yellow-500/10";
    case "healthy": return "text-accent bg-accent/10";
    case "strong": return "text-green-500 bg-green-500/10";
    default: return "text-muted-foreground bg-secondary";
  }
};

const lockedFeatures = [
  "Conservative revenue upside range",
  "Top 3 blockers identified by pillar",
  "90-day priority action plan",
  "AI architecture recommendations",
  "Governance gap analysis",
  "Downloadable PDF report",
];

const buildPillarScores = (scores: { leadership_score: number; data_score: number; people_score: number; process_score: number; risk_score: number }) => {
  return [
    { pillarInfo: PILLARS[0], score: scores.leadership_score || 0 },
    { pillarInfo: PILLARS[1], score: scores.data_score || 0 },
    { pillarInfo: PILLARS[2], score: scores.people_score || 0 },
    { pillarInfo: PILLARS[3], score: scores.process_score || 0 },
    { pillarInfo: PILLARS[4], score: scores.risk_score || 0 },
  ].map(p => {
    const statusResult = getPillarStatus(p.score);
    return {
      pillar: p.pillarInfo.name,
      shortName: p.pillarInfo.shortName,
      score: p.score,
      status: statusResult.label,
      statusVariant: statusResult.variant,
      insight: p.pillarInfo.insight,
    };
  });
};

const AIReadinessResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const initResults = async () => {
      if (!id) {
        navigate("/ai-readiness");
        return;
      }

      const state = location.state as LocationState | null;

      // If we have state from navigation, use it directly (avoids RLS issues)
      if (state?.overallScore !== undefined && state?.pillarScores) {
        const scoreBandResult = getScoreBandFromData(state.overallScore);
        setResultData({
          overallScore: state.overallScore,
          scoreBand: state.scoreBand || scoreBandResult.label,
          scoreBandDescription: state.scoreBandDescription || scoreBandResult.description,
          pillarScores: buildPillarScores(state.pillarScores),
          headline: getHeadline(state.overallScore),
          subheadline: getSubheadline(state.overallScore),
        });
        setLoading(false);
        return;
      }

      // Otherwise try to fetch from DB (works for authenticated users with matching email)
      try {
        const { data, error } = await supabase
          .from("ai_readiness_completions")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error || !data) {
          console.error("Failed to fetch results:", error);
          toast.error("Could not load results. Please try the assessment again.");
          navigate("/ai-readiness");
          return;
        }

        const scoreBandResult = getScoreBandFromData(data.overall_score);
        setResultData({
          overallScore: data.overall_score,
          scoreBand: scoreBandResult.label,
          scoreBandDescription: scoreBandResult.description,
          pillarScores: buildPillarScores({
            leadership_score: data.leadership_score || 0,
            data_score: data.data_score || 0,
            people_score: data.people_score || 0,
            process_score: data.process_score || 0,
            risk_score: data.risk_score || 0,
          }),
          headline: getHeadline(data.overall_score),
          subheadline: getSubheadline(data.overall_score),
        });
      } catch (err) {
        console.error("Error fetching results:", err);
        navigate("/ai-readiness");
      } finally {
        setLoading(false);
      }
    };

    initResults();
  }, [id, navigate, location.state]);

  // Check if already saved
  useEffect(() => {
    const checkIfSaved = async () => {
      if (!user || !id) return;
      const { data } = await supabase
        .from("user_saved_outputs")
        .select("id")
        .eq("user_id", user.id)
        .eq("output_type", "ai-readiness")
        .eq("data->>completion_id", id)
        .maybeSingle();
      if (data) setIsSaved(true);
    };
    checkIfSaved();
  }, [user, id]);

  const handleSaveToHub = async () => {
    if (!user || !id || !resultData) return;
    
    setIsSaving(true);
    try {
      // Save to user_saved_outputs
      const { error } = await supabase.from("user_saved_outputs").insert({
        user_id: user.id,
        output_type: "ai-readiness",
        title: `AI Readiness Score: ${resultData.overallScore}/100`,
        data: {
          completion_id: id,
          overall_score: resultData.overallScore,
          score_band: resultData.scoreBand,
          pillar_scores: resultData.pillarScores,
        },
      });
      
      if (error) throw error;
      
      // Also save to product_downloads so the AI Advisor can see it
      const userEmail = user.email;
      if (userEmail) {
        await supabase.from("product_downloads").insert({
          email: userEmail,
          name: user.user_metadata?.full_name || null,
          product_id: "readiness-score",
          product_name: `AI Readiness Score: ${resultData.overallScore}/100 (${resultData.scoreBand})`,
          download_type: "free",
          product_type: "free",
        });
      }
      
      setIsSaved(true);
      toast.success("Assessment saved to your hub!");
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Failed to save assessment");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!resultData) return;
    
    try {
      const doc = generateReadinessReport({
        overallScore: resultData.overallScore,
        scoreBand: resultData.scoreBand,
        scoreBandDescription: resultData.subheadline,
        pillarScores: resultData.pillarScores,
        completedAt: new Date().toLocaleDateString('en-GB'),
        userName: user?.user_metadata?.full_name || undefined,
        companyName: undefined,
      });
      
      doc.save(`ai-readiness-score-${resultData.overallScore}.pdf`);
      toast.success("PDF downloaded!");
      
      // Track download if user is logged in
      if (user?.email) {
        supabase.from("product_downloads").insert({
          email: user.email,
          name: user.user_metadata?.full_name || null,
          product_id: "readiness-score-pdf",
          product_name: `AI Readiness Report PDF (Score: ${resultData.overallScore})`,
          download_type: "free",
          product_type: "free",
        }).then(({ error }) => {
          if (error) console.log("Failed to track PDF download:", error);
        });
      }
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    }
  };

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
          <h2 className="text-xl font-heading mb-6">Pillar Breakdown</h2>
            <div className="space-y-6">
              {resultData.pillarScores.map((pillar) => (
                <div key={pillar.pillar} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{pillar.shortName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(pillar.statusVariant)}`}>
                        {pillar.status}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{pillar.score}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent transition-all duration-500"
                      style={{ width: `${pillar.score}%` }}
                    />
                  </div>
                  {pillar.statusVariant === "critical" && (
                    <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <Lightbulb size={12} className="mt-0.5 shrink-0 text-yellow-500" />
                      {pillar.insight}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Actions - Save & Download */}
            <div className="mt-6 pt-6 border-t border-border space-y-3">
              {/* Download PDF - available to everyone */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPDF}
                className="w-full"
              >
                <Download size={14} />
                Download PDF Report
              </Button>
              
              {/* Save to Hub Button - for logged in users */}
              {user && (
                <Button
                  variant={isSaved ? "outline" : "accent"}
                  size="sm"
                  onClick={handleSaveToHub}
                  disabled={isSaving || isSaved}
                  className="w-full"
                >
                  {isSaving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : isSaved ? (
                    <CheckCircle size={14} />
                  ) : (
                    <Save size={14} />
                  )}
                  {isSaved ? "Saved to Hub" : "Save to My Hub"}
                </Button>
              )}
            </div>
          </div>

          {/* Free Account Prompt - for non-authenticated users */}
          {!user && (
            <div className="bg-gradient-to-br from-accent/10 to-primary/5 rounded-xl p-8 border border-accent/20 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                  <Gift size={24} className="text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-heading mb-2 flex items-center gap-2">
                    Create a Free Account
                    <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-medium">
                      Free
                    </span>
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Save your assessment results and get <strong>10 free AI Advisor sessions</strong> to help you take action on your score.
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle size={14} className="text-accent" />
                      Save and track your AI readiness progress
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle size={14} className="text-accent" />
                      10 free AI Advisor sessions (14-day trial)
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle size={14} className="text-accent" />
                      Access to downloadable resources
                    </li>
                  </ul>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="accent" asChild>
                      <Link to={`/auth?redirect=/ai-readiness/results/${id}`}>
                        <Sparkles size={16} />
                        Create Free Account
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to={`/auth?redirect=/ai-readiness/results/${id}&mode=login`}>
                        Already have an account? Sign in
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Locked Premium Content */}
          <div className="bg-secondary/30 rounded-xl p-8 border border-border relative overflow-hidden mb-8">
            {/* Blur overlay */}
            <div className="absolute inset-0 backdrop-blur-sm bg-background/60 flex flex-col items-center justify-center z-10">
              <Lock size={32} className="text-muted-foreground mb-4" />
              <h3 className="text-xl font-heading mb-2">Unlock Full Report</h3>
              <p className="text-muted-foreground text-sm mb-6 text-center max-w-md">
                {resultData.subheadline}
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

          {/* Browse other products */}
          <div className="mt-12 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Looking for other resources?
            </p>
            <Button variant="outline" asChild>
              <Link to="/products">
                Browse All Products
                <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AIReadinessResults;
