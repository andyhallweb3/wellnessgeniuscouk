import { Flame, Award, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  hasMomentumBadge: boolean;
  momentumTier: "none" | "bronze" | "silver" | "gold" | "platinum";
  lastActiveWeek: string | null;
}

interface StreakBadgeProps {
  streak: StreakData;
  compact?: boolean;
}

const getTierColors = (tier: StreakData["momentumTier"]) => {
  switch (tier) {
    case "platinum":
      return { 
        bg: "bg-violet-500/10", 
        border: "border-violet-500/30", 
        text: "text-violet-400",
        flame: "text-violet-400"
      };
    case "gold":
      return { 
        bg: "bg-amber-500/10", 
        border: "border-amber-500/30", 
        text: "text-amber-400",
        flame: "text-amber-400"
      };
    case "silver":
      return { 
        bg: "bg-slate-400/10", 
        border: "border-slate-400/30", 
        text: "text-slate-300",
        flame: "text-slate-300"
      };
    case "bronze":
      return { 
        bg: "bg-orange-600/10", 
        border: "border-orange-600/30", 
        text: "text-orange-500",
        flame: "text-orange-500"
      };
    default:
      return { 
        bg: "bg-secondary", 
        border: "border-border", 
        text: "text-muted-foreground",
        flame: "text-muted-foreground"
      };
  }
};

const getTierLabel = (tier: StreakData["momentumTier"]) => {
  switch (tier) {
    case "platinum": return "Platinum Momentum";
    case "gold": return "Gold Momentum";
    case "silver": return "Silver Momentum";
    case "bronze": return "Bronze Momentum";
    default: return null;
  }
};

const getStreakMessage = (streak: number) => {
  if (streak >= 12) return "Exceptional consistency!";
  if (streak >= 8) return "Strong momentum building";
  if (streak >= 4) return "Great progress";
  if (streak >= 2) return "Keep it going";
  if (streak === 1) return "Streak started";
  return "Start your streak";
};

const StreakBadge = ({ streak, compact = false }: StreakBadgeProps) => {
  const tierColors = getTierColors(streak.momentumTier);
  const tierLabel = getTierLabel(streak.momentumTier);
  
  // Flame animation intensity based on streak
  const flameIntensity = streak.currentStreak >= 8 ? "animate-pulse" : "";

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex items-center gap-1">
              <Flame 
                size={14} 
                className={cn(tierColors.flame, flameIntensity)} 
                fill={streak.currentStreak > 0 ? "currentColor" : "none"}
              />
              <span className={cn("text-xs font-medium", tierColors.text)}>
                {streak.currentStreak}w
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Flame size={14} className={tierColors.flame} fill="currentColor" />
                <span className="font-medium">{streak.currentStreak} week streak</span>
              </div>
              {streak.hasMomentumBadge && tierLabel && (
                <div className="flex items-center gap-2">
                  <Award size={14} className={tierColors.text} />
                  <span className={tierColors.text}>{tierLabel}</span>
                </div>
              )}
              <p className="text-muted-foreground">{getStreakMessage(streak.currentStreak)}</p>
              {streak.longestStreak > streak.currentStreak && (
                <p className="text-muted-foreground">Best: {streak.longestStreak} weeks</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn(
      "p-3 rounded-lg border",
      tierColors.bg,
      tierColors.border
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Flame 
            size={18} 
            className={cn(tierColors.flame, flameIntensity)} 
            fill={streak.currentStreak > 0 ? "currentColor" : "none"}
          />
          <span className="text-sm font-medium">Weekly Streak</span>
        </div>
        <span className={cn("text-xl font-bold tabular-nums", tierColors.text)}>
          {streak.currentStreak}
        </span>
      </div>

      {/* Streak visualization - last 12 weeks */}
      <div className="flex gap-1 mb-3">
        {Array.from({ length: 12 }).map((_, i) => {
          const weekIndex = 11 - i; // Reverse so current week is on the right
          const isActive = weekIndex < streak.currentStreak;
          
          return (
            <div
              key={i}
              className={cn(
                "h-2 flex-1 rounded-sm transition-all",
                isActive 
                  ? cn(tierColors.bg, "border", tierColors.border, "bg-opacity-100")
                  : "bg-secondary/50"
              )}
              style={{
                backgroundColor: isActive ? `hsl(var(--accent) / ${0.3 + (weekIndex / 12) * 0.7})` : undefined
              }}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{getStreakMessage(streak.currentStreak)}</span>
        {streak.longestStreak > streak.currentStreak && (
          <span>Best: {streak.longestStreak}w</span>
        )}
      </div>

      {/* Momentum Badge */}
      {streak.hasMomentumBadge && tierLabel && (
        <div className="mt-3 pt-2 border-t border-border/30">
          <div className="flex items-center gap-2">
            <Award size={16} className={tierColors.text} />
            <Badge 
              variant="outline" 
              className={cn("text-xs", tierColors.bg, tierColors.border, tierColors.text)}
            >
              {tierLabel}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {streak.momentumTier === "platinum" && "1 year of consistent engagement"}
            {streak.momentumTier === "gold" && "6 months of consistent engagement"}
            {streak.momentumTier === "silver" && "4 months of consistent engagement"}
            {streak.momentumTier === "bronze" && "3 months of consistent engagement"}
          </p>
        </div>
      )}

      {/* Next milestone */}
      {!streak.hasMomentumBadge && streak.currentStreak > 0 && streak.currentStreak < 12 && (
        <div className="mt-3 pt-2 border-t border-border/30">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Zap size={12} />
            <span>{12 - streak.currentStreak} more weeks to Bronze Momentum</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreakBadge;
