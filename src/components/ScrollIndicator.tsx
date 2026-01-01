import { ChevronDown } from "lucide-react";

interface ScrollIndicatorProps {
  label?: string;
  variant?: "subtle" | "prominent";
}

const ScrollIndicator = ({ label, variant = "subtle" }: ScrollIndicatorProps) => {
  return (
    <div className="flex flex-col items-center py-8 bg-background">
      {label && (
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3 animate-fade-in">
          {label}
        </p>
      )}
      <div className="relative">
        {/* Animated chevrons */}
        <div className="flex flex-col items-center gap-0">
          <ChevronDown 
            size={variant === "prominent" ? 24 : 20} 
            className="text-accent/40 animate-bounce-slow" 
            style={{ animationDelay: "0ms" }}
          />
          <ChevronDown 
            size={variant === "prominent" ? 24 : 20} 
            className="text-accent/60 -mt-3 animate-bounce-slow" 
            style={{ animationDelay: "150ms" }}
          />
          <ChevronDown 
            size={variant === "prominent" ? 24 : 20} 
            className="text-accent -mt-3 animate-bounce-slow" 
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
};

export default ScrollIndicator;
