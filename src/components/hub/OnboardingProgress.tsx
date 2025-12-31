import { useEffect } from "react";
import { Check, Sparkles, BookOpen, BarChart3, Package, CircleDot, ArrowRight } from "lucide-react";
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

const STEP_ACTIONS: Record<OnboardingStepId, { label: string; href?: string; action?: string; description?: string }> = {
  welcome: { label: "Start Tour", action: "tour", description: "Take a quick tour of the platform" },
  genie: { label: "Try AI Advisor", href: "/genie", description: "Get AI-powered business guidance" },
  hub: { label: "You're here!", href: "/hub", description: "Your central intelligence dashboard" },
  assessment: { label: "Take Assessment", href: "/ai-readiness", description: "Check your AI readiness score" },
  products: { label: "View Products", href: "/products", description: "Download playbooks and guides" },
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

  // Auto-mark hub as visited when this component mounts (in useEffect to avoid render-cycle issues)
  useEffect(() => {
    if (!isStepCompleted("hub")) {
      markStepCompleted("hub");
    }
  }, [isStepCompleted, markStepCompleted]);

  if (percentage === 100) {
    return (
      <div className="rounded-xl border border-accent/30 bg-gradient-to-br from-accent/10 to-accent/5 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-accent/20">
              <Check size={20} className="text-accent" />
            </div>
            <div>
              <h3 className="font-heading text-lg">All Set!</h3>
              <p className="text-sm text-muted-foreground">You've explored all features</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={restartOnboarding}
          >
            Retake Tour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-background p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-heading text-lg">Getting Started</h3>
          <p className="text-sm text-muted-foreground">Complete these steps to get the most from your hub</p>
        </div>
        <span className="text-sm font-medium text-accent">
          {completedSteps.length}/{totalSteps}
        </span>
      </div>

      <Progress value={percentage} className="h-2 mb-6" />

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {ONBOARDING_STEP_IDS.map((step) => {
          const completed = isStepCompleted(step.id as OnboardingStepId);
          const action = STEP_ACTIONS[step.id as OnboardingStepId];
          
          return (
            <div
              key={step.id}
              className={`relative rounded-xl p-4 transition-all ${
                completed 
                  ? "bg-accent/10 border border-accent/30" 
                  : "bg-card border border-border hover:border-accent/30"
              }`}
            >
              <div className={`p-2 rounded-full w-fit mb-3 ${completed ? "bg-accent/20" : "bg-muted"}`}>
                {completed ? (
                  <Check size={16} className="text-accent" />
                ) : (
                  <span className="text-muted-foreground">{STEP_ICONS[step.id as OnboardingStepId]}</span>
                )}
              </div>
              <p className={`font-medium text-sm mb-1 ${completed ? "text-accent" : ""}`}>
                {step.title}
              </p>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {action.description}
              </p>
              {!completed && action.href && (
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs w-full" asChild>
                  <Link to={action.href}>
                    {action.label}
                    <ArrowRight size={12} />
                  </Link>
                </Button>
              )}
              {!completed && action.action === "tour" && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-xs w-full"
                  onClick={restartOnboarding}
                >
                  {action.label}
                  <ArrowRight size={12} />
                </Button>
              )}
              {completed && (
                <span className="text-xs text-accent font-medium">Completed</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OnboardingProgress;