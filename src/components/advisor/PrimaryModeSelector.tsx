import { cn } from "@/lib/utils";
import { getPrimaryModes, AdvisorMode } from "./AdvisorModes";
import { Search, ClipboardList, Scale, Settings } from "lucide-react";

interface PrimaryModeSelectorProps {
  selectedMode: string;
  onSelectMode: (mode: string) => void;
  credits: number;
}

const ICONS: Record<string, React.ReactNode> = {
  diagnose: <Search className="h-5 w-5" />,
  plan: <ClipboardList className="h-5 w-5" />,
  compare: <Scale className="h-5 w-5" />,
  operate: <Settings className="h-5 w-5" />,
};

const PrimaryModeSelector = ({ selectedMode, onSelectMode, credits }: PrimaryModeSelectorProps) => {
  const primaryModes = getPrimaryModes();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {primaryModes.map((mode) => {
        const isSelected = selectedMode === mode.id;
        const canAfford = credits >= mode.creditCost;

        return (
          <button
            key={mode.id}
            onClick={() => canAfford && onSelectMode(mode.id)}
            disabled={!canAfford}
            className={cn(
              "p-4 rounded-xl border text-left transition-all",
              isSelected
                ? "border-accent bg-accent/10 ring-2 ring-accent/30"
                : "border-border bg-card hover:border-accent/50 hover:bg-card/80",
              !canAfford && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={cn(
                "p-2 rounded-lg",
                isSelected ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground/70"
              )}>
                {ICONS[mode.id] || <Search className="h-5 w-5" />}
              </div>
              <h3 className="font-medium">{mode.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {mode.tagline}
            </p>
          </button>
        );
      })}
    </div>
  );
};

export default PrimaryModeSelector;
