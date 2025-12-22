import { TrendingUp, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface GenieScore {
  overall: number;
  consistency: number;
  engagementDepth: number;
  dataHygiene: number;
  breakdown: {
    activeWeeks: number;
    uniqueModes: number;
    voiceBonus: boolean;
    profileCompleteness: number;
  };
}

interface GenieScoreBadgeProps {
  score: GenieScore;
  compact?: boolean;
}

const getScoreColor = (score: number) => {
  if (score >= 70) return { text: "text-green-600", bg: "bg-green-500/10", border: "border-green-500/20" };
  if (score >= 45) return { text: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-500/20" };
  return { text: "text-muted-foreground", bg: "bg-secondary", border: "border-border" };
};

const getScoreLabel = (score: number) => {
  if (score >= 70) return "Strong";
  if (score >= 45) return "Growing";
  return "Building";
};

const GenieScoreBadge = ({ score, compact = false }: GenieScoreBadgeProps) => {
  const colors = getScoreColor(score.overall);
  const label = getScoreLabel(score.overall);

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex items-center gap-1">
              <Activity size={12} className={colors.text} />
              <span className={cn("text-xs font-medium", colors.text)}>
                {score.overall}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium">Genie Score</span>
                <span className={cn("font-bold", colors.text)}>{score.overall}/100</span>
              </div>
              <div className="space-y-1 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Consistency</span>
                  <span>{score.consistency}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Engagement Depth</span>
                  <span>{score.engagementDepth}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Data Hygiene</span>
                  <span>{score.dataHygiene}%</span>
                </div>
              </div>
              <p className="pt-1 border-t border-border text-muted-foreground">
                Reflects how well you use the Genie, not business success.
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="p-3 rounded-lg border border-border/50 bg-secondary/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className={colors.text} />
          <span className="text-sm font-medium">Genie Score</span>
        </div>
        <Badge variant="outline" className={cn("text-xs", colors.bg, colors.border, colors.text)}>
          {score.overall}/100 • {label}
        </Badge>
      </div>
      
      {/* Score bars */}
      <div className="space-y-2">
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Consistency</span>
            <span>{score.consistency}%</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent rounded-full transition-all"
              style={{ width: `${score.consistency}%` }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Engagement Depth</span>
            <span>{score.engagementDepth}%</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent rounded-full transition-all"
              style={{ width: `${score.engagementDepth}%` }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Data Hygiene</span>
            <span>{score.dataHygiene}%</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent rounded-full transition-all"
              style={{ width: `${score.dataHygiene}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Breakdown chips */}
      <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-border/30">
        <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">
          {score.breakdown.activeWeeks}/4 weeks
        </span>
        <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">
          {score.breakdown.uniqueModes} modes
        </span>
        {score.breakdown.voiceBonus && (
          <span className="text-xs px-2 py-0.5 rounded bg-accent/10 text-accent">
            Voice +
          </span>
        )}
        <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">
          Profile {score.breakdown.profileCompleteness}%
        </span>
      </div>
      
      <p className="text-xs text-muted-foreground mt-2">
        Your score reflects how consistently and thoughtfully you use the Genie — not business success.
      </p>
    </div>
  );
};

export default GenieScoreBadge;
