import { cn } from "@/lib/utils";
import { ADVISOR_MODES, AdvisorMode, getModesByCategory } from "./AdvisorModes";

interface AdvisorModeSelectorProps {
  selectedMode: string;
  onSelectMode: (mode: string) => void;
  credits: number;
}

const CategorySection = ({
  title,
  modes,
  selectedMode,
  onSelectMode,
  credits,
}: {
  title: string;
  modes: AdvisorMode[];
  selectedMode: string;
  onSelectMode: (mode: string) => void;
  credits: number;
}) => (
  <div className="space-y-2">
    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
      {title}
    </h4>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {modes.map((mode) => {
        const isSelected = selectedMode === mode.id;
        const canAfford = credits >= mode.creditCost;

        return (
          <button
            key={mode.id}
            onClick={() => canAfford && onSelectMode(mode.id)}
            disabled={!canAfford}
            className={cn(
              "p-3 rounded-lg border text-left transition-all",
              isSelected
                ? "border-accent bg-accent/5 ring-2 ring-accent/20"
                : "border-border bg-card hover:border-accent/50 hover:bg-card/80",
              !canAfford && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0">{mode.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="font-medium text-sm">{mode.name}</h3>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ml-2",
                      isSelected
                        ? "bg-accent text-accent-foreground"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {mode.creditCost}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {mode.tagline}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

const AdvisorModeSelector = ({
  selectedMode,
  onSelectMode,
  credits,
}: AdvisorModeSelectorProps) => {
  const dailyModes = getModesByCategory("daily");
  const strategicModes = getModesByCategory("strategic");
  const planningModes = getModesByCategory("planning");

  return (
    <div className="space-y-4">
      <CategorySection
        title="Daily Operations"
        modes={dailyModes}
        selectedMode={selectedMode}
        onSelectMode={onSelectMode}
        credits={credits}
      />
      <CategorySection
        title="Strategic Thinking"
        modes={strategicModes}
        selectedMode={selectedMode}
        onSelectMode={onSelectMode}
        credits={credits}
      />
      <CategorySection
        title="Planning & Building"
        modes={planningModes}
        selectedMode={selectedMode}
        onSelectMode={onSelectMode}
        credits={credits}
      />
    </div>
  );
};

export default AdvisorModeSelector;
