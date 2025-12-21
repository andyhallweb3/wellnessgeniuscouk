import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface ChangeEntry {
  id: string;
  text: string;
  delta: string; // e.g., "+8%", "-3%", "neutral"
  direction: "up" | "down" | "neutral";
  impact: "positive" | "negative" | "neutral";
  period: "today" | "this_week" | "last_week" | "this_month";
}

interface WhatChangedTimelineProps {
  changes: ChangeEntry[];
  isLoading?: boolean;
  onChangeClick?: (change: ChangeEntry) => void;
}

const PeriodLabel = ({ period }: { period: ChangeEntry["period"] }) => {
  const labels = {
    today: "Today",
    this_week: "This Week",
    last_week: "Last Week",
    this_month: "This Month",
  };
  return <span>{labels[period]}</span>;
};

const ChangeRow = ({ 
  change, 
  onClick 
}: { 
  change: ChangeEntry; 
  onClick?: (change: ChangeEntry) => void;
}) => {
  const Icon = change.direction === "up" ? TrendingUp : 
               change.direction === "down" ? TrendingDown : Minus;
  
  const deltaColor = 
    change.impact === "positive" ? "text-green-600" :
    change.impact === "negative" ? "text-red-500" :
    "text-muted-foreground";

  return (
    <button
      onClick={() => onClick?.(change)}
      className="w-full flex items-center justify-between py-3 px-4 hover:bg-secondary/50 rounded-lg transition-colors text-left group"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Icon size={16} className={deltaColor} />
        <span className="text-sm truncate">{change.text}</span>
      </div>
      <div className={cn("text-sm font-mono font-medium ml-4", deltaColor)}>
        {change.delta}
      </div>
    </button>
  );
};

const WhatChangedTimeline = ({ changes, isLoading, onChangeClick }: WhatChangedTimelineProps) => {
  const [expandedPeriods, setExpandedPeriods] = useState<Set<string>>(new Set(["this_week"]));

  const togglePeriod = (period: string) => {
    const next = new Set(expandedPeriods);
    if (next.has(period)) {
      next.delete(period);
    } else {
      next.add(period);
    }
    setExpandedPeriods(next);
  };

  // Group changes by period
  const groupedChanges = changes.reduce((acc, change) => {
    if (!acc[change.period]) acc[change.period] = [];
    acc[change.period].push(change);
    return acc;
  }, {} as Record<string, ChangeEntry[]>);

  const periods: ChangeEntry["period"][] = ["today", "this_week", "last_week", "this_month"];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-secondary rounded w-1/3" />
            <div className="h-10 bg-secondary rounded" />
            <div className="h-10 bg-secondary rounded" />
            <div className="h-10 bg-secondary rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (changes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">What Changed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No changes tracked yet. Start a conversation to begin tracking.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">What Changed</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        {periods.map((period) => {
          const periodChanges = groupedChanges[period];
          if (!periodChanges || periodChanges.length === 0) return null;
          
          const isExpanded = expandedPeriods.has(period);
          
          return (
            <div key={period} className="mb-2">
              <button
                onClick={() => togglePeriod(period)}
                className="w-full flex items-center justify-between px-4 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                <PeriodLabel period={period} />
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {periodChanges.length} change{periodChanges.length !== 1 ? "s" : ""}
                  </span>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </button>
              
              {isExpanded && (
                <div className="divide-y divide-border/50">
                  {periodChanges.map((change) => (
                    <ChangeRow 
                      key={change.id} 
                      change={change} 
                      onClick={onChangeClick}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default WhatChangedTimeline;
