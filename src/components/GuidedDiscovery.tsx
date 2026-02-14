import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Gauge, Sparkles, CheckCircle2, ClipboardCheck, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { FREE_TRIAL_CREDITS } from "@/components/advisor/AdvisorModes";

interface Option {
  label: string;
  value: string;
  icon: React.ReactNode;
}

interface Recommendation {
  title: string;
  description: string;
  cta: string;
  link: string;
  secondary?: { label: string; link: string };
  badge?: string;
}

const challenges: Option[] = [
  { label: "Retention is dropping", value: "retention", icon: <Target size={20} /> },
  { label: "Revenue growth has stalled", value: "revenue", icon: <Gauge size={20} /> },
  { label: "I need to adopt AI / tech", value: "ai", icon: <Sparkles size={20} /> },
  { label: "I'm not sure — help me find out", value: "unsure", icon: <Brain size={20} /> },
];

const stages: Option[] = [
  { label: "Just exploring", value: "exploring", icon: <span className="text-lg">🔍</span> },
  { label: "Ready to act", value: "ready", icon: <span className="text-lg">🚀</span> },
  { label: "Already using AI/tools", value: "advanced", icon: <span className="text-lg">⚙️</span> },
];

const getRecommendation = (challenge: string, stage: string, isLoggedIn: boolean): Recommendation => {
  // Unsure users always go to free assessment
  if (challenge === "unsure") {
    return {
      title: "Start with our free AI Readiness Assessment",
      description: "Answer 10 quick questions to discover where you stand and what to focus on first.",
      cta: "Take Free Assessment",
      link: "/ai-readiness",
      secondary: { label: "Or try the AI Advisor free", link: isLoggedIn ? "/genie" : "/auth?redirect=/genie" },
      badge: "Free • 3 minutes",
    };
  }

  // Exploring stage → assessment first
  if (stage === "exploring") {
    return {
      title: "Get your baseline with a free assessment",
      description: `You're concerned about ${challenge === "retention" ? "retention" : challenge === "revenue" ? "revenue growth" : "AI readiness"}. Start with a quick diagnostic to identify your biggest gaps.`,
      cta: "Take Free Assessment",
      link: "/ai-readiness",
      secondary: { label: `Then try the AI Advisor (${FREE_TRIAL_CREDITS} free credits)`, link: isLoggedIn ? "/genie" : "/auth?redirect=/genie" },
      badge: "Free • 3 minutes",
    };
  }

  // Ready to act → advisor with mode pre-selected
  if (stage === "ready") {
    const modeMap: Record<string, string> = { retention: "diagnose", revenue: "plan", ai: "plan" };
    const mode = modeMap[challenge] || "diagnose";
    return {
      title: `Get a ${challenge === "retention" ? "retention diagnosis" : challenge === "revenue" ? "growth plan" : "90-day AI roadmap"} in 60 seconds`,
      description: `The AI Advisor will analyse your situation and give you a prioritised action plan. ${FREE_TRIAL_CREDITS} free credits to start.`,
      cta: "Start AI Advisor Free",
      link: isLoggedIn ? `/genie?mode=${mode}` : `/auth?redirect=/genie?mode=${mode}`,
      secondary: { label: "View credit packs from £9", link: isLoggedIn ? "/genie" : "/auth?redirect=/genie" },
      badge: `${FREE_TRIAL_CREDITS} free credits`,
    };
  }

  // Advanced → advisor + products
  return {
    title: "Accelerate with the AI Advisor + Operator Playbooks",
    description: "You're already ahead. Use the Advisor for ongoing strategic decisions, and grab the playbooks for proven frameworks.",
    cta: "Open AI Advisor",
    link: isLoggedIn ? "/genie?mode=operate" : "/auth?redirect=/genie?mode=operate",
    secondary: { label: "Browse playbooks from £29", link: "/products" },
    badge: "Best value",
  };
};

interface GuidedDiscoveryProps {
  onDiscoveryComplete?: (challenge: string, stage: string) => void;
}

const GuidedDiscovery = ({ onDiscoveryComplete }: GuidedDiscoveryProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [challenge, setChallenge] = useState<string | null>(null);
  const [stage, setStage] = useState<string | null>(null);

  const recommendation = challenge && stage ? getRecommendation(challenge, stage, !!user) : null;

  const handleChallengeSelect = (value: string) => {
    setChallenge(value);
    setStep(1);
  };

  const handleStageSelect = (value: string) => {
    setStage(value);
    setStep(2);
    if (challenge) {
      onDiscoveryComplete?.(challenge, value);
    }
  };

  const handleReset = () => {
    setStep(0);
    setChallenge(null);
    setStage(null);
  };

  return (
    <section className="section-padding bg-gradient-to-b from-card/50 to-background">
      <div className="container-wide">
        <div className="text-center mb-10">
          <h2 className="text-2xl lg:text-3xl tracking-tight mb-3 font-bold">
            Where should you start?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Answer two quick questions and we'll point you to the fastest path to results.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[0, 1, 2].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s <= step ? "bg-accent w-10" : "bg-border w-6"
                }`}
              />
            ))}
          </div>

          {/* Step 0: Challenge */}
          {step === 0 && (
            <div className="animate-fade-up">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 text-center">
                What's your biggest challenge?
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {challenges.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleChallengeSelect(opt.value)}
                    className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-accent hover:bg-accent/5 transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors text-accent">
                      {opt.icon}
                    </div>
                    <span className="font-medium text-sm">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Stage */}
          {step === 1 && (
            <div className="animate-fade-up">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 text-center">
                How far along are you?
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                {stages.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleStageSelect(opt.value)}
                    className="flex flex-col items-center gap-3 p-5 rounded-xl bg-card border border-border hover:border-accent hover:bg-accent/5 transition-all text-center group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      {opt.icon}
                    </div>
                    <span className="font-medium text-sm">{opt.label}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => { setStep(0); setChallenge(null); }}
                className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto block"
              >
                ← Change answer
              </button>
            </div>
          )}

          {/* Step 2: Recommendation */}
          {step === 2 && recommendation && (
            <div className="animate-fade-up">
              <div className="bg-card border-2 border-accent/30 rounded-2xl p-6 sm:p-8 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold mb-4">
                  <CheckCircle2 size={14} />
                  {recommendation.badge}
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold mb-3">
                  {recommendation.title}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm sm:text-base">
                  {recommendation.description}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button variant="accent" size="xl" asChild className="shadow-glow w-full sm:w-auto">
                    <Link to={recommendation.link}>
                      {recommendation.cta}
                      <ArrowRight size={18} />
                    </Link>
                  </Button>
                </div>

                {recommendation.secondary && (
                  <Link
                    to={recommendation.secondary.link}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors mt-4"
                  >
                    {recommendation.secondary.label}
                    <ArrowRight size={14} />
                  </Link>
                )}

                <button
                  onClick={handleReset}
                  className="mt-6 text-xs text-muted-foreground hover:text-foreground transition-colors block mx-auto"
                >
                  Start over
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default GuidedDiscovery;
