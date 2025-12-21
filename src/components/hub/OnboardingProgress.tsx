import { Check, Sparkles, BookOpen, BarChart3, Package, CircleDot } from "lucide-react";
import { useOnboarding, ONBOARDING_STEP_IDS, OnboardingStepId } from "@/hooks/useOnboarding";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const STEP_ICONS: Record<OnboardingStepId, React.ReactNode> = {
  welcome: <CircleDot size={16} />,
  genie: <Sparkles size={16} />,
  hub: <BookOpen size={16} />,
  assessment: <BarChart3 size={16} />,
  products: <Package size={16} />,
};

const STEP_ACTIONS: Record<OnboardingStepId, { label: string; href?: string; action?: string }> = {
  welcome: { label: "Complete tour", action: "tour" },
  genie: { label: "Try it", action: "genie" },
  hub: { label: "You're here!", href: "/hub" },
  assessment: { label: "Start", href: "/ai-readiness" },
  products: { label: "Browse", href: "/products" },
};

const OnboardingProgress = () => {
  const { 
    completedSteps, 
    isStepCompleted, 
    getCompletionPercentage, 
    restartOnboarding,
    markStepCompleted,
    totalSteps 
  } = useOnboarding();

  const percentage = getCompletionPercentage();

  // Auto-mark hub as visited when this component mounts
  if (!isStepCompleted("hub")) {
    markStepCompleted("hub");
  }

  if (percentage === 100) {
    return (
      <div className="rounded-xl border border-accent/30 bg-gradient-to-br from-accent/10 to-accent/5 p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-full bg-accent/20">
            <Check size={20} className="text-accent" />
          </div>
          <div>
            <h3 className="font-heading text-sm">All Set!</h3>
            <p className="text-xs text-muted-foreground">You've explored all features</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full text-xs"
          onClick={restartOnboarding}
        >
          Retake Tour
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-sm">Getting Started</h3>
        <span className="text-xs text-muted-foreground">
          {completedSteps.length}/{totalSteps} complete
        </span>
      </div>

      <Progress value={percentage} className="h-2 mb-4" />

      <div className="space-y-2">
        {ONBOARDING_STEP_IDS.map((step) => {
          const completed = isStepCompleted(step.id as OnboardingStepId);
          const action = STEP_ACTIONS[step.id as OnboardingStepId];
          
          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                completed 
                  ? "bg-accent/10 text-accent" 
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <div className={`p-1.5 rounded-full ${completed ? "bg-accent/20" : "bg-muted"}`}>
                {completed ? (
                  <Check size={14} className="text-accent" />
                ) : (
                  STEP_ICONS[step.id as OnboardingStepId]
                )}
              </div>
              <span className={`flex-1 text-sm ${completed ? "line-through opacity-70" : ""}`}>
                {step.title}
              </span>
              {!completed && action.href && (
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" asChild>
                  <Link to={action.href}>{action.label}</Link>
                </Button>
              )}
              {!completed && action.action === "tour" && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs"
                  onClick={restartOnboarding}
                >
                  Start
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OnboardingProgress;
