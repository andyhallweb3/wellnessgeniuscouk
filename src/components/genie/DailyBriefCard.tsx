import { useState } from "react";
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Volume2,
  Pause
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface BriefData {
  headline: string;
  changes: {
    text: string;
    direction: "up" | "down" | "neutral";
    severity?: "good" | "warning" | "neutral";
  }[];
  actions: string[];
  confidence: "high" | "medium" | "low";
  generatedAt: Date;
}

interface DailyBriefCardProps {
  brief: BriefData | null;
  isLoading: boolean;
  isPlaying: boolean;
  onGenerateBrief: () => void;
  onPlayVoice: () => void;
  onStopVoice: () => void;
  onActionClick: (action: string) => void;
  businessName?: string;
}

const ConfidenceBadge = ({ level }: { level: "high" | "medium" | "low" }) => {
  const config = {
    high: { label: "High confidence", className: "bg-green-500/10 text-green-600 border-green-500/20" },
    medium: { label: "Medium confidence", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    low: { label: "Low confidence", className: "bg-red-500/10 text-red-600 border-red-500/20" },
  };
  return (
    <Badge variant="outline" className={cn("text-xs", config[level].className)}>
      {config[level].label}
    </Badge>
  );
};

const ChangeItem = ({ change }: { change: BriefData["changes"][0] }) => {
  const Icon = change.direction === "up" ? TrendingUp : change.direction === "down" ? TrendingDown : CheckCircle2;
  const colorClass = 
    change.severity === "warning" ? "text-amber-500" :
    change.severity === "good" ? "text-green-500" :
    "text-muted-foreground";
  
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon size={16} className={cn("mt-0.5 shrink-0", colorClass)} />
      <span className="text-sm">{change.text}</span>
    </div>
  );
};

const DailyBriefCard = ({
  brief,
  isLoading,
  isPlaying,
  onGenerateBrief,
  onPlayVoice,
  onStopVoice,
  onActionClick,
  businessName,
}: DailyBriefCardProps) => {
  const today = new Date().toLocaleDateString("en-GB", { 
    weekday: "long", 
    day: "numeric",
    month: "long"
  });

  if (isLoading) {
    return (
      <Card className="border-accent/20 bg-gradient-to-br from-background to-accent/5">
        <CardContent className="p-8 flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-accent mb-4" />
          <p className="text-muted-foreground">Preparing your briefing...</p>
        </CardContent>
      </Card>
    );
  }

  if (!brief) {
    return (
      <Card className="border-accent/20 bg-gradient-to-br from-background to-accent/5">
        <CardContent className="p-8 flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-heading mb-2">Good morning{businessName ? `, ${businessName}` : ""}</h2>
            <p className="text-muted-foreground mb-6">
              Ready to see what matters today?
            </p>
            <Button variant="accent" size="lg" onClick={onGenerateBrief}>
              Generate Today's Brief
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-accent/20 bg-gradient-to-br from-background to-accent/5">
      <CardContent className="p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Today's Brief</p>
            <p className="text-sm font-medium">{today}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={isPlaying ? onStopVoice : onPlayVoice}
              className="gap-2"
            >
              {isPlaying ? <Pause size={14} /> : <Volume2 size={14} />}
              {isPlaying ? "Stop" : "Listen"}
            </Button>
          </div>
        </div>

        {/* Headline */}
        <div className="mb-8">
          <h1 className="text-xl md:text-2xl font-heading leading-relaxed">
            {brief.headline}
          </h1>
        </div>

        {/* What Changed */}
        <div className="mb-8">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
            <AlertTriangle size={12} />
            What Changed
          </h3>
          <div className="divide-y divide-border/50">
            {brief.changes.slice(0, 3).map((change, idx) => (
              <ChangeItem key={idx} change={change} />
            ))}
          </div>
        </div>

        {/* What To Do Next */}
        <div className="mb-8">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
            <CheckCircle2 size={12} />
            What To Do Next
          </h3>
          <div className="space-y-2">
            {brief.actions.slice(0, 3).map((action, idx) => (
              <button
                key={idx}
                onClick={() => onActionClick(action)}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary border border-border/50 transition-colors text-left group"
              >
                <span className="text-sm">{action}</span>
                <ChevronRight size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Confidence Note */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            Insight confidence based on available data
          </p>
          <ConfidenceBadge level={brief.confidence} />
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyBriefCard;
