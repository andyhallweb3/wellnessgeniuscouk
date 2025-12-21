import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  ArrowRight, 
  AlertTriangle,
  CheckCircle,
  Database,
  Eye,
  Brain,
  Lock,
  FileText
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface PrivacyResults {
  overallScore: number;
  scoreBand: string;
  sections: {
    dataClassification: number;
    consent: number;
    aiGovernance: number;
    security: number;
    incidentPlanning: number;
  };
  userInfo: {
    name: string;
    email: string;
    company: string;
    role: string;
  };
  completedAt: string;
}

const sectionConfig = [
  { key: 'dataClassification', label: 'Data Classification', icon: Database },
  { key: 'consent', label: 'Consent & Transparency', icon: Eye },
  { key: 'aiGovernance', label: 'AI Governance', icon: Brain },
  { key: 'security', label: 'Security & Vendors', icon: Lock },
  { key: 'incidentPlanning', label: 'Incident Planning', icon: FileText },
];

const getBandConfig = (band: string) => {
  switch (band) {
    case 'Leading':
      return { color: 'text-green-600', bg: 'bg-green-500/10', border: 'border-green-500/30' };
    case 'Maturing':
      return { color: 'text-blue-600', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
    case 'Emerging':
      return { color: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    default:
      return { color: 'text-red-600', bg: 'bg-red-500/10', border: 'border-red-500/30' };
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-amber-600';
  return 'text-red-500';
};

const PrivacyReadinessResults = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<PrivacyResults | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('privacy_readiness_results');
    if (stored) {
      setResults(JSON.parse(stored));
    } else {
      navigate('/privacy-readiness');
    }
  }, [navigate]);

  if (!results) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  const bandConfig = getBandConfig(results.scoreBand);

  // Find lowest scoring sections for recommendations
  const sortedSections = Object.entries(results.sections)
    .map(([key, score]) => ({ key, score }))
    .sort((a, b) => a.score - b.score);
  const weakestAreas = sortedSections.slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Your Privacy Readiness Results | Wellness Genius</title>
        <meta name="description" content="Your AI Privacy Readiness Score and recommendations." />
      </Helmet>
      
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container-wide section-padding">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <Badge variant="secondary" className="mb-4">
                <Shield size={12} className="mr-1" />
                Privacy Readiness Results
              </Badge>
              <h1 className="text-3xl md:text-4xl font-heading mb-2">
                Your Privacy Readiness Score
              </h1>
              <p className="text-muted-foreground">
                {results.userInfo.company || 'Your business'} • Assessed {new Date(results.completedAt).toLocaleDateString()}
              </p>
            </div>

            {/* Main Score Card */}
            <Card className={`mb-8 ${bandConfig.border} border-2`}>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">
                      Overall Score
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-6xl font-heading ${getScoreColor(results.overallScore)}`}>
                        {results.overallScore}
                      </span>
                      <span className="text-2xl text-muted-foreground">/100</span>
                    </div>
                  </div>
                  <div className={`px-6 py-3 rounded-full ${bandConfig.bg} ${bandConfig.border} border`}>
                    <span className={`text-lg font-medium ${bandConfig.color}`}>
                      {results.scoreBand}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section Breakdown */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg">Section Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {sectionConfig.map(({ key, label, icon: Icon }) => {
                  const score = results.sections[key as keyof typeof results.sections];
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon size={16} className="text-muted-foreground" />
                          <span className="text-sm font-medium">{label}</span>
                        </div>
                        <span className={`text-sm font-mono ${getScoreColor(score)}`}>
                          {score}%
                        </span>
                      </div>
                      <Progress value={score} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Headline Diagnosis */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {results.overallScore >= 60 ? (
                    <CheckCircle size={20} className="text-green-500" />
                  ) : (
                    <AlertTriangle size={20} className="text-amber-500" />
                  )}
                  Headline Diagnosis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.overallScore >= 80 ? (
                  <p className="text-muted-foreground">
                    Your privacy and security posture is <strong>strong</strong>. You've built good foundations 
                    for responsible AI deployment. Focus on maintaining these standards and staying ahead of 
                    evolving regulations.
                  </p>
                ) : results.overallScore >= 60 ? (
                  <p className="text-muted-foreground">
                    You have <strong>emerging foundations</strong> but gaps remain. The main areas to address are 
                    {weakestAreas.map(a => ` ${sectionConfig.find(s => s.key === a.key)?.label}`).join(' and')}.
                    These could create liability if not addressed.
                  </p>
                ) : results.overallScore >= 40 ? (
                  <p className="text-muted-foreground">
                    <strong>Significant gaps exist</strong> in your privacy readiness. Priority attention needed on 
                    {weakestAreas.map(a => ` ${sectionConfig.find(s => s.key === a.key)?.label}`).join(' and')}.
                    Consider pausing AI expansion until foundations are stronger.
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    <strong>Critical gaps identified</strong>. Your current setup carries meaningful risk. 
                    Immediate action recommended before deploying or expanding AI capabilities.
                    Start with {sectionConfig.find(s => s.key === weakestAreas[0]?.key)?.label}.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Priority Areas */}
            <Card className="mb-8 border-amber-500/30 bg-amber-500/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle size={20} className="text-amber-500" />
                  Priority Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weakestAreas.map(({ key, score }) => {
                    const section = sectionConfig.find(s => s.key === key);
                    if (!section) return null;
                    const Icon = section.icon;
                    return (
                      <div key={key} className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                        <Icon size={16} className="text-amber-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">{section.label}</p>
                          <p className="text-xs text-muted-foreground">
                            Scored {score}% — this needs attention before scaling AI
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="accent" size="lg" asChild>
                <Link to="/privacy-playbook">
                  Read the Privacy Playbook
                  <ArrowRight size={16} />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/genie">
                  Ask AI Advisor
                </Link>
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-8">
              This is a diagnostic tool, not legal advice. Consult appropriate professionals for compliance decisions.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyReadinessResults;
