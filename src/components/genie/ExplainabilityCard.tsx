import { Info, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExplainabilityCardProps {
  title: string;
  explanation: string;
  factors?: string[];
  howToChange?: string;
}

const ExplainabilityCard = ({
  title,
  explanation,
  factors = [],
  howToChange,
}: ExplainabilityCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-border/50 bg-secondary/30 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm">
          <Info size={14} className="text-muted-foreground" />
          <span className="font-medium">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp size={14} className="text-muted-foreground" />
        ) : (
          <ChevronDown size={14} className="text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-border/50">
          {/* Why you're seeing this */}
          <div className="pt-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Why you're seeing this
            </p>
            <p className="text-sm">{explanation}</p>
          </div>

          {/* What influenced this */}
          {factors.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                What influenced this suggestion
              </p>
              <ul className="space-y-1">
                {factors.map((factor, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-accent mt-1">•</span>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* How to change it */}
          {howToChange && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                How to change this
              </p>
              <p className="text-sm text-muted-foreground">{howToChange}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExplainabilityCard;
