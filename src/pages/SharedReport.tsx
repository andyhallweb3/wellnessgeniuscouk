import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, AlertTriangle, Calendar, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

interface PillarScore {
  pillar: string;
  score: number;
  status: string;
}

interface ReportData {
  overallScore: number;
  scoreBand: string;
  pillarScores: PillarScore[];
  userInfo: {
    name: string;
    company: string;
  };
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

const SharedReport = () => {
  const { token } = useParams();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!token) {
        setError("Invalid share link");
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase.functions.invoke(
          "manage-report-shares",
          { body: { action: "get", shareToken: token } }
        );

        if (fetchError) throw fetchError;
        if (data.error) throw new Error(data.error);

        const completion = data.completion;

        const pillarScores: PillarScore[] = [
          { pillar: "Leadership & Strategy", score: completion.leadership_score || 0 },
          { pillar: "Data & Infrastructure", score: completion.data_score || 0 },
          { pillar: "People & Skills", score: completion.people_score || 0 },
          { pillar: "Process & Operations", score: completion.process_score || 0 },
          { pillar: "Risk, Ethics & Governance", score: completion.risk_score || 0 },
        ].map(p => ({
          ...p,
          status: p.score < 40 ? "Critical" : p.score < 60 ? "Needs Work" : p.score < 80 ? "Healthy" : "Strong"
        }));

        setReportData({
          overallScore: completion.overall_score,
          scoreBand: getScoreBandLabel(completion.overall_score),
          pillarScores,
          userInfo: {
            name: completion.name || "User",
            company: completion.company || "Company",
          },
        });
      } catch (err: any) {
        console.error("Failed to fetch shared report:", err);
        setError(err.message || "Failed to load report");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-accent" />
          <p className="text-muted-foreground">Loading shared report...</p>
        </div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container-narrow section-padding text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-heading mb-2">Report Not Available</h1>
            <p className="text-muted-foreground mb-6">{error || "This share link is invalid or has expired."}</p>
            <Link to="/ai-readiness">
              <Button variant="accent">Take the Assessment</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>AI Readiness Report | {reportData.userInfo.company}</title>
        <meta name="description" content="View the AI Readiness diagnostic report." />
      </Helmet>
      
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container-narrow section-padding">
          {/* Shared Banner */}
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-8 text-center">
            <p className="text-sm text-accent">
              This is a shared AI Readiness Report. <Link to="/ai-readiness" className="underline font-medium">Take your own assessment →</Link>
            </p>
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

          {/* CTA */}
          <div className="bg-card rounded-xl p-8 border border-border shadow-elegant text-center">
            <h3 className="text-xl font-heading mb-2">Want your own AI Readiness Report?</h3>
            <p className="text-muted-foreground mb-6">
              Take the free 5-minute assessment to get personalised insights for your business.
            </p>
            <Link to="/ai-readiness">
              <Button variant="accent" size="lg">
                Take the Assessment
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SharedReport;
