import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Dialog, 
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  BookOpen, 
  BarChart3, 
  Package, 
  ArrowRight, 
  Check,
  X
} from "lucide-react";
import wellnessGeniusLogo from "@/assets/wellness-genius-logo-teal.webp";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/hooks/useOnboarding";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    label: string;
    href: string;
  };
}

const steps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to Wellness Genius!",
    description: "Your AI-powered platform for growing and optimizing your wellness business. Let's take a quick tour of the key features.",
    icon: <img src={wellnessGeniusLogo} alt="" className="h-16 w-16 object-contain" />,
  },
  {
    id: "genie",
    title: "Meet Your AI Advisor",
    description: "Your personal AI advisor that understands the wellness industry. Ask questions, get strategies, and upload your business documents for personalised advice. Look for the floating button in the bottom-right corner!",
    icon: <Sparkles className="h-12 w-12 text-accent" />,
  },
  {
    id: "hub",
    title: "Your Personal Hub",
    description: "Access your dashboard, saved insights, and AI Advisor from My Hub in the top navigation. Everything you need in one place.",
    icon: <BookOpen className="h-12 w-12 text-accent" />,
  },
  {
    id: "assessment",
    title: "AI Readiness Assessment",
    description: "Discover how prepared your wellness business is for AI with our comprehensive assessment. Get a personalized report with actionable recommendations.",
    icon: <BarChart3 className="h-12 w-12 text-accent" />,
    action: {
      label: "Take Assessment",
      href: "/ai-readiness",
    },
  },
  {
    id: "products",
    title: "Resources & Products",
    description: "Explore our curated collection of guides, templates, and tools designed specifically for wellness business owners looking to leverage AI.",
    icon: <Package className="h-12 w-12 text-accent" />,
    action: {
      label: "Browse Products",
      href: "/products",
    },
  },
];

const SiteOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isOnboardingOpen, setIsOnboardingOpen, hasCompletedOnboarding, completeOnboarding } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!user) return;
    
    if (!hasCompletedOnboarding()) {
      // Show onboarding after a delay
      const timer = setTimeout(() => {
        setIsOnboardingOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, hasCompletedOnboarding, setIsOnboardingOpen]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const handleAction = (href: string) => {
    completeOnboarding();
    navigate(href);
  };

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  if (!user) return null;

  return (
    <Dialog open={isOnboardingOpen} onOpenChange={(open) => !open && handleSkip()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-accent/20">
        {/* Close button */}
        <button 
          onClick={handleSkip}
          className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Progress dots */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentStep 
                  ? "w-6 bg-accent" 
                  : index < currentStep 
                    ? "w-1.5 bg-accent/50" 
                    : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="pt-12 pb-6 px-6">
          <div className="flex flex-col items-center text-center">
            {/* Icon */}
            <div className="mb-6 p-4 bg-accent/10 rounded-2xl">
              {step.icon}
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-foreground mb-3">
              {step.title}
            </h2>

            {/* Description */}
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-sm">
              {step.description}
            </p>

            {/* Action button if exists */}
            {step.action && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mb-4"
                onClick={() => handleAction(step.action!.href)}
              >
                {step.action.label}
                <ArrowRight size={14} className="ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-muted/30 px-6 py-4 flex items-center justify-between">
          <button 
            onClick={handleSkip}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip tour
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Back
              </Button>
            )}
            <Button 
              variant="accent" 
              size="sm"
              onClick={handleNext}
            >
              {isLastStep ? (
                <>
                  <Check size={14} className="mr-1" />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ArrowRight size={14} className="ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SiteOnboarding;