import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertTriangle, TrendingUp, CheckCircle, Sparkles } from "lucide-react";
import { AssessmentAnswers, UserInfo } from "@/pages/AIReadinessIndex";

interface Question {
  id: string;
  pillar: string;
  text: string;
}

interface AssessmentResultsProps {
  answers: AssessmentAnswers;
  questions: Question[];
  userInfo: UserInfo;
}

const pillarConfig = {
  "Leadership & Strategy": { color: "bg-blue-500", icon: "📊" },
  "Data & Infrastructure": { color: "bg-purple-500", icon: "🗄️" },
  "People & Skills": { color: "bg-green-500", icon: "👥" },
  "Process & Operations": { color: "bg-orange-500", icon: "⚙️" },
  "Risk, Ethics & Governance": { color: "bg-red-500", icon: "🛡️" },
};

const getBand = (score: number) => {
  if (score < 40) return {
    label: "AI-Unready",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    icon: AlertTriangle,
    description: "High risk. Stop buying tools.",
    insight: "Your biggest risk isn't technology — it's unclear ownership and undocumented processes. Rushing into AI now will waste budget and create frustration.",
    recommendation: "AI Readiness Sprint",
    recommendationDesc: "You need a diagnostic to identify exactly what's blocking you before any tool investment.",
  };
  if (score < 60) return {
    label: "AI-Curious",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    icon: TrendingUp,
    description: "Opportunity exists, but foundations are weak.",
    insight: "You have some building blocks in place, but gaps in data access or team alignment will cause pilots to stall. Focus on education before execution.",
    recommendation: "AI Literacy for Leaders",
    recommendationDesc: "Align your team on what AI can (and can't) do before committing to builds.",
  };
  if (score < 80) return {
    label: "AI-Ready (Selective)",
    color: "text-accent",
    bgColor: "bg-accent/10",
    icon: CheckCircle,
    description: "You can deploy task-specific agents safely.",
    insight: "Your organisation has solid foundations. You're ready to deploy focused AI agents on well-defined problems. Start with one high-impact use case.",
    recommendation: "AI Agent Build",
    recommendationDesc: "You're ready to ship. Let's identify the highest-ROI agent and build it.",
  };
  return {
    label: "AI-Native Potential",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    icon: Sparkles,
    description: "Time to scale and differentiate.",
    insight: "You're in the top tier of AI readiness. The question isn't whether to use AI, but how to use it as a competitive moat. Think systems, not tools.",
    recommendation: "AI Agent Build",
    recommendationDesc: "Let's build a multi-agent system that creates lasting competitive advantage.",
  };
};

const AssessmentResults = ({ answers, questions, userInfo }: AssessmentResultsProps) => {
  const results = useMemo(() => {
    // Calculate pillar scores
    const pillarScores: { [key: string]: { total: number; count: number } } = {};
    
    questions.forEach((q) => {
      const answer = answers[q.id] || 3;
      if (!pillarScores[q.pillar]) {
        pillarScores[q.pillar] = { total: 0, count: 0 };
      }
      pillarScores[q.pillar].total += answer;
      pillarScores[q.pillar].count += 1;
    });

    const pillarResults = Object.entries(pillarScores).map(([pillar, { total, count }]) => ({
      pillar,
      score: Math.round((total / (count * 5)) * 100),
      average: total / count,
    }));

    // Calculate overall score
    const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
    const maxScore = questions.length * 5;
    const overallScore = Math.round((totalScore / maxScore) * 100);

    return { pillarResults, overallScore };
  }, [answers, questions]);

  const band = getBand(results.overallScore);
  const BandIcon = band.icon;

  // Find weakest pillar
  const weakestPillar = results.pillarResults.reduce((min, p) => 
    p.score < min.score ? p : min
  , results.pillarResults[0]);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Score Header */}
      <div className="text-center mb-12">
        <p className="text-sm font-medium text-accent uppercase tracking-wider mb-3">
          Your AI Readiness Score
        </p>
        <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${band.bgColor} mb-4`}>
          <BandIcon className={`w-6 h-6 ${band.color}`} />
          <span className={`text-lg font-heading font-medium ${band.color}`}>
            {band.label}
          </span>
        </div>
        <div className="text-6xl lg:text-7xl font-heading font-medium mb-2">
          {results.overallScore}
          <span className="text-2xl text-muted-foreground">/100</span>
        </div>
        <p className="text-xl text-muted-foreground">
          {band.description}
        </p>
      </div>

      {/* Pillar Breakdown */}
      <div className="bg-card rounded-xl p-8 border border-border shadow-elegant mb-8">
        <h3 className="text-lg font-heading mb-6">Pillar Breakdown</h3>
        <div className="space-y-4">
          {results.pillarResults.map((pillar) => {
            const config = pillarConfig[pillar.pillar as keyof typeof pillarConfig];
            return (
              <div key={pillar.pillar}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{pillar.pillar}</span>
                  <span className="font-medium">{pillar.score}%</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${config?.color || 'bg-accent'} transition-all duration-500`}
                    style={{ width: `${pillar.score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Insight */}
      <div className="bg-card rounded-xl p-8 border border-border shadow-elegant mb-8">
        <h3 className="text-lg font-heading mb-4">What This Means</h3>
        <p className="text-muted-foreground mb-4">
          {band.insight}
        </p>
        <div className="p-4 bg-secondary/50 rounded-lg border border-border">
          <p className="text-sm">
            <span className="font-medium">Your weakest area:</span>{" "}
            {weakestPillar.pillar} ({weakestPillar.score}%)
          </p>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-accent/10 rounded-xl p-8 border border-accent/20 mb-8">
        <p className="text-sm font-medium text-accent uppercase tracking-wider mb-2">
          Recommended Next Step
        </p>
        <h3 className="text-2xl font-heading mb-2">{band.recommendation}</h3>
        <p className="text-muted-foreground mb-6">
          {band.recommendationDesc}
        </p>
        <Button variant="accent" size="lg" asChild>
          <a href="#book-call">
            Book a 30-Minute Review
            <ArrowRight size={16} />
          </a>
        </Button>
      </div>

      {/* Calendly Embed */}
      <div id="book-call" className="bg-card rounded-xl p-8 border border-border shadow-elegant">
        <h3 className="text-lg font-heading mb-2 text-center">
          Want a human to pressure-test this with you?
        </h3>
        <p className="text-muted-foreground text-center mb-6">
          Book a free 30-minute AI Readiness Review call.
        </p>
        <div 
          className="calendly-inline-widget rounded-lg overflow-hidden" 
          data-url="https://calendly.com/andy-wellnessgenius/30min?hide_gdpr_banner=1"
          style={{ minWidth: '320px', height: '700px' }}
        />
        <script 
          type="text/javascript" 
          src="https://assets.calendly.com/assets/external/widget.js" 
          async 
        />
      </div>
    </div>
  );
};

export default AssessmentResults;
