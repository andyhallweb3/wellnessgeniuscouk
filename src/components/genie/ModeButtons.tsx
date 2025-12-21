import { cn } from "@/lib/utils";
import { ADVISOR_MODES, getModeById } from "@/components/advisor/AdvisorModes";
import { Badge } from "@/components/ui/badge";

interface ModeButtonsProps {
  selectedMode: string | null;
  onSelectMode: (mode: string) => void;
  credits: number;
  compact?: boolean;
}

// Primary modes to show as main buttons
const PRIMARY_MODES = ["daily_briefing", "weekly_review", "decision_support", "board_mode", "build_mode"];

const ModeButtons = ({ selectedMode, onSelectMode, credits, compact }: ModeButtonsProps) => {
  const primaryModes = PRIMARY_MODES.map(id => getModeById(id));
  const secondaryModes = ADVISOR_MODES.filter(m => !PRIMARY_MODES.includes(m.id));

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {primaryModes.map((mode) => {
          const canAfford = credits >= mode.creditCost;
          const isSelected = selectedMode === mode.id;
          
          return (
            <button
              key={mode.id}
              onClick={() => canAfford && onSelectMode(mode.id)}
              disabled={!canAfford}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                isSelected
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary hover:bg-secondary/80 text-foreground",
                !canAfford && "opacity-50 cursor-not-allowed"
              )}
            >
              <span>{mode.icon}</span>
              <span>{mode.name}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Primary Mode Buttons - Large */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {primaryModes.map((mode) => {
          const canAfford = credits >= mode.creditCost;
          const isSelected = selectedMode === mode.id;
          
          return (
            <button
              key={mode.id}
              onClick={() => canAfford && onSelectMode(mode.id)}
              disabled={!canAfford}
              className={cn(
                "p-4 rounded-xl text-left transition-all border-2",
                isSelected
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-accent/50 bg-card hover:bg-card/80",
                !canAfford && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="text-2xl mb-2">{mode.icon}</div>
              <h3 className="font-medium text-sm mb-1">{mode.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">{mode.tagline}</p>
              <Badge 
                variant="secondary" 
                className={cn(
                  "mt-3 text-xs",
                  isSelected && "bg-accent/20"
                )}
              >
                {mode.creditCost} credits
              </Badge>
            </button>
          );
        })}
      </div>

      {/* Secondary Modes - Compact Row */}
      {secondaryModes.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">More Modes</p>
          <div className="flex flex-wrap gap-2">
            {secondaryModes.map((mode) => {
              const canAfford = credits >= mode.creditCost;
              const isSelected = selectedMode === mode.id;
              
              return (
                <button
                  key={mode.id}
                  onClick={() => canAfford && onSelectMode(mode.id)}
                  disabled={!canAfford}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 border",
                    isSelected
                      ? "border-accent bg-accent/10"
                      : "border-border bg-card hover:border-accent/50",
                    !canAfford && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <span>{mode.icon}</span>
                  <span>{mode.name}</span>
                  <span className="text-xs text-muted-foreground">({mode.creditCost})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeButtons;
