import { ReactNode, useState, useEffect } from "react";
import { ChevronRight, X, Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TooltipStep {
  id: string;
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  highlight?: string;
}

interface GuidedOnboardingTooltipProps {
  step: TooltipStep;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
  onComplete: () => void;
  isLast: boolean;
  children: ReactNode;
}

export const GuidedOnboardingTooltip = ({
  step,
  currentStep,
  totalSteps,
  onNext,
  onSkip,
  onComplete,
  isLast,
  children,
}: GuidedOnboardingTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, [step.id]);

  const positionClasses = {
    top: "bottom-full mb-3",
    bottom: "top-full mt-3",
    left: "right-full mr-3",
    right: "left-full ml-3",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-accent border-x-transparent border-b-transparent border-8",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-accent border-x-transparent border-t-transparent border-8",
    left: "left-full top-1/2 -translate-y-1/2 border-l-accent border-y-transparent border-r-transparent border-8",
    right: "right-full top-1/2 -translate-y-1/2 border-r-accent border-y-transparent border-l-transparent border-8",
  };

  return (
    <div className="relative">
      {children}
      
      <div
        className={cn(
          "absolute z-50 w-72 transition-all duration-300",
          positionClasses[step.position || "bottom"],
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}
      >
        <div className="bg-accent text-accent-foreground rounded-lg shadow-lg p-4 relative">
          {/* Arrow */}
          <div className={cn("absolute w-0 h-0", arrowClasses[step.position || "bottom"])} />
          
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Lightbulb size={16} className="shrink-0" />
              <span className="text-xs font-medium opacity-80">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <button
              onClick={onSkip}
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>

          {/* Content */}
          <h4 className="font-semibold mb-1">{step.title}</h4>
          <p className="text-sm opacity-90 mb-3">{step.content}</p>

          {/* Progress dots */}
          <div className="flex items-center gap-1 mb-3">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i + 1 === currentStep
                    ? "w-4 bg-accent-foreground"
                    : i + 1 < currentStep
                    ? "w-1.5 bg-accent-foreground/80"
                    : "w-1.5 bg-accent-foreground/30"
                )}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={onSkip}
              className="text-xs opacity-70 hover:opacity-100 transition-opacity"
            >
              Skip tour
            </button>
            <Button
              size="sm"
              variant="secondary"
              onClick={isLast ? onComplete : onNext}
              className="gap-1"
            >
              {isLast ? "Got it" : "Next"}
              {!isLast && <ChevronRight size={14} />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Floating progress indicator
interface OnboardingProgressFloatProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export const OnboardingProgressFloat = ({
  currentStep,
  totalSteps,
  stepLabels,
}: OnboardingProgressFloatProps) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="bg-card border shadow-lg rounded-full px-4 py-2 flex items-center gap-3">
        {stepLabels.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-all",
                i + 1 === currentStep
                  ? "bg-accent text-accent-foreground scale-110"
                  : i + 1 < currentStep
                  ? "bg-accent/20 text-accent"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {i + 1 < currentStep ? "✓" : i + 1}
            </div>
            <span
              className={cn(
                "text-xs hidden sm:block transition-colors",
                i + 1 === currentStep
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              {label}
            </span>
            {i < stepLabels.length - 1 && (
              <ArrowRight size={12} className="text-muted-foreground/50 hidden sm:block" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
