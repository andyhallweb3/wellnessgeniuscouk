import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";
import { useState } from "react";

interface OnboardingBannerProps {
  onDismiss?: () => void;
}

const OnboardingBanner = ({ onDismiss }: OnboardingBannerProps) => {
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) return null;

  return (
    <div className="relative rounded-xl border-2 border-accent/30 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent p-6 mb-8">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 rounded-md hover:bg-accent/10 transition-colors"
        aria-label="Dismiss banner"
      >
        <X size={16} className="text-muted-foreground" />
      </button>

      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="p-3 rounded-xl bg-accent/20 shrink-0 self-start">
          <Sparkles className="h-6 w-6 text-accent" />
        </div>

        <div className="flex-1">
          <h2 className="text-lg font-heading mb-1">Use the stack in order</h2>
          <p className="text-muted-foreground">
            <strong className="text-foreground">Clarity before tools.</strong>{" "}
            <strong className="text-foreground">Behaviour before automation.</strong>{" "}
            <strong className="text-foreground">Control before scale.</strong>
          </p>
        </div>

        <Button variant="accent" asChild className="shrink-0 self-start md:self-center">
          <Link to="/ai-readiness">
            <Sparkles size={16} />
            Start with AI Readiness Score
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default OnboardingBanner;
