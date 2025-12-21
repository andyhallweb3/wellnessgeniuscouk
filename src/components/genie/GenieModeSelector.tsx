import { cn } from "@/lib/utils";
import { GENIE_MODES, GenieMode } from "./GenieModes";

interface GenieModeSelector {
  selectedMode: string;
  onSelectMode: (mode: string) => void;
  credits: number;
}

const GenieModeSelector = ({ selectedMode, onSelectMode, credits }: GenieModeSelector) => {
  return (
    <div className="space-y-3">
      {GENIE_MODES.map((mode) => {
        const isSelected = selectedMode === mode.id;
        const canAfford = credits >= mode.creditCost;

        return (
          <button
            key={mode.id}
            onClick={() => canAfford && onSelectMode(mode.id)}
            disabled={!canAfford}
            className={cn(
              "w-full p-4 rounded-xl border text-left transition-all",
              isSelected
                ? "border-accent bg-accent/5 ring-2 ring-accent/20"
                : "border-border bg-card hover:border-accent/50 hover:bg-card/80",
              !canAfford && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="flex items-start gap-4">
              <span className="text-2xl shrink-0">{mode.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium">{mode.name}</h3>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full shrink-0 ml-2",
                      isSelected
                        ? "bg-accent text-accent-foreground"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {mode.creditCost} credits
                  </span>
                </div>
                <p className="text-sm text-accent font-medium mb-1">"{mode.tagline}"</p>
                <p className="text-xs text-muted-foreground">
                  {mode.description}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default GenieModeSelector;
