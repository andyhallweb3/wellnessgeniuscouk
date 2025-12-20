import { cn } from "@/lib/utils";

export interface CoachMode {
  id: string;
  icon: string;
  name: string;
  description: string;
  cost: number;
  example: string;
}

export const COACH_MODES: CoachMode[] = [
  {
    id: "diagnostic",
    icon: "🔍",
    name: "Diagnostic Mode",
    description: "Surface weak assumptions, missing inputs, and hidden risks",
    cost: 3,
    example: "Why isn't our engagement converting?",
  },
  {
    id: "decision",
    icon: "🧠",
    name: "Decision Coach",
    description: "Help choose between options with clear trade-offs",
    cost: 3,
    example: "Should we build in-house or partner?",
  },
  {
    id: "commercial",
    icon: "📈",
    name: "Commercial Lens",
    description: "Translate ideas into financial or risk implications",
    cost: 4,
    example: "What's the ROI of this AI feature?",
  },
  {
    id: "foundations",
    icon: "🧱",
    name: "Foundations First",
    description: "Decide if an idea should proceed now or be paused",
    cost: 3,
    example: "Are we ready to add AI coaching?",
  },
  {
    id: "planner",
    icon: "📋",
    name: "90-Day Planner",
    description: "Create a realistic, prioritised action plan",
    cost: 5,
    example: "Plan our retention improvement project",
  },
  {
    id: "general",
    icon: "💬",
    name: "Quick Question",
    description: "Simple questions and clarifications",
    cost: 1,
    example: "What metrics should I track?",
  },
];

interface ModeSelectorProps {
  selectedMode: string;
  onSelectMode: (mode: string) => void;
  credits: number;
}

const ModeSelector = ({ selectedMode, onSelectMode, credits }: ModeSelectorProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {COACH_MODES.map((mode) => {
        const isSelected = selectedMode === mode.id;
        const canAfford = credits >= mode.cost;

        return (
          <button
            key={mode.id}
            onClick={() => canAfford && onSelectMode(mode.id)}
            disabled={!canAfford}
            className={cn(
              "p-4 rounded-xl border text-left transition-all",
              isSelected
                ? "border-accent bg-accent/5 ring-2 ring-accent/20"
                : "border-border bg-card hover:border-accent/50",
              !canAfford && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-2xl">{mode.icon}</span>
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  isSelected
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {mode.cost} {mode.cost === 1 ? "credit" : "credits"}
              </span>
            </div>
            <h3 className="font-medium text-sm mb-1">{mode.name}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {mode.description}
            </p>
          </button>
        );
      })}
    </div>
  );
};

export default ModeSelector;
