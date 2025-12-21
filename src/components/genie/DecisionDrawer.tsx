import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb,
  ArrowRight,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export interface DecisionContext {
  topic: string;
  whyItMatters: string;
  options: {
    label: string;
    pros: string[];
    cons: string[];
  }[];
  recommendation: string;
  riskOfActing: string;
  riskOfNotActing: string;
}

interface DecisionDrawerProps {
  open: boolean;
  onClose: () => void;
  context: DecisionContext | null;
  onAskMore: (question: string) => void;
}

const DecisionDrawer = ({ open, onClose, context, onAskMore }: DecisionDrawerProps) => {
  if (!context) return null;

  const handleQuickQuestion = (q: string) => {
    onAskMore(q);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-1 mb-6">
          <SheetTitle className="text-xl font-heading">{context.topic}</SheetTitle>
          <Badge variant="secondary" className="w-fit">Decision Support</Badge>
        </SheetHeader>

        <div className="space-y-6">
          {/* Why It Matters */}
          <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
            <div className="flex items-center gap-2 text-xs font-medium text-accent mb-2">
              <Lightbulb size={14} />
              Why This Matters
            </div>
            <p className="text-sm">{context.whyItMatters}</p>
          </div>

          {/* Options */}
          {context.options.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                Options to Consider
              </h3>
              <div className="space-y-4">
                {context.options.map((option, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-border bg-card">
                    <h4 className="font-medium text-sm mb-3">{option.label}</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-green-600 mb-2">
                          <ThumbsUp size={12} />
                          Pros
                        </div>
                        <ul className="space-y-1">
                          {option.pros.map((pro, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <span className="text-green-500 mt-0.5">•</span>
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-red-500 mb-2">
                          <ThumbsDown size={12} />
                          Cons
                        </div>
                        <ul className="space-y-1">
                          {option.cons.map((con, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <span className="text-red-400 mt-0.5">•</span>
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendation */}
          <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
            <div className="flex items-center gap-2 text-xs font-medium text-green-600 mb-2">
              <CheckCircle2 size={14} />
              What I Would Do
            </div>
            <p className="text-sm">{context.recommendation}</p>
          </div>

          {/* Risk Assessment */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 mb-2">
                <AlertTriangle size={12} />
                Risk of Acting
              </div>
              <p className="text-xs text-muted-foreground">{context.riskOfActing}</p>
            </div>
            
            <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
              <div className="flex items-center gap-1.5 text-xs font-medium text-red-500 mb-2">
                <AlertTriangle size={12} />
                Risk of NOT Acting
              </div>
              <p className="text-xs text-muted-foreground">{context.riskOfNotActing}</p>
            </div>
          </div>

          {/* Quick Follow-ups */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Ask More
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => handleQuickQuestion(`Explain why this matters for ${context.topic}`)}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary border border-border/50 transition-colors text-left text-sm group"
              >
                <span>Explain why this matters</span>
                <ArrowRight size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
              <button
                onClick={() => handleQuickQuestion(`What would you do instead for ${context.topic}?`)}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary border border-border/50 transition-colors text-left text-sm group"
              >
                <span>What would you do instead?</span>
                <ArrowRight size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
              <button
                onClick={() => handleQuickQuestion(`Turn this into a board slide: ${context.topic}`)}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary border border-border/50 transition-colors text-left text-sm group"
              >
                <span>Turn this into a board slide</span>
                <ArrowRight size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DecisionDrawer;
