import { useState, useEffect } from "react";
import { Trophy, Users, TrendingUp, Eye, EyeOff, Filter, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useLeaderboard, LeaderboardStats } from "@/hooks/useLeaderboard";
import { useBusinessMemory } from "@/hooks/useBusinessMemory";

interface GenieLeaderboardProps {
  currentScore?: number;
  currentStreak?: number;
}

const BUSINESS_TYPES = [
  { value: "gym", label: "Gym / Fitness Centre" },
  { value: "studio", label: "Boutique Studio" },
  { value: "spa", label: "Spa / Wellness Centre" },
  { value: "retreat", label: "Retreat / Resort" },
  { value: "online", label: "Online / Digital" },
  { value: "hybrid", label: "Hybrid Model" },
  { value: "other", label: "Other" },
];

const SIZE_BANDS = [
  { value: "solo", label: "Solo Operator" },
  { value: "small", label: "Small (2-10)" },
  { value: "medium", label: "Medium (11-50)" },
  { value: "large", label: "Large (51-200)" },
  { value: "enterprise", label: "Enterprise (200+)" },
];

const getScoreBandFromScore = (score: number): string => {
  if (score >= 70) return "strong";
  if (score >= 45) return "growing";
  return "building";
};

const getScoreBandColor = (band: string) => {
  switch (band) {
    case "strong":
      return { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-500" };
    case "growing":
      return { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-500" };
    default:
      return { bg: "bg-secondary", border: "border-border", text: "text-muted-foreground" };
  }
};

const getScoreBandLabel = (band: string) => {
  switch (band) {
    case "strong": return "Strong (70+)";
    case "growing": return "Growing (45-69)";
    default: return "Building (0-44)";
  }
};

// Group stats by business type and size band
const groupStats = (stats: LeaderboardStats[]) => {
  const grouped: Record<string, Record<string, LeaderboardStats[]>> = {};
  
  stats.forEach((stat) => {
    const bizType = stat.business_type || "unspecified";
    const sizeBand = stat.size_band || "unspecified";
    
    if (!grouped[bizType]) grouped[bizType] = {};
    if (!grouped[bizType][sizeBand]) grouped[bizType][sizeBand] = [];
    
    grouped[bizType][sizeBand].push(stat);
  });
  
  return grouped;
};

const GenieLeaderboard = ({ currentScore = 0, currentStreak = 0 }: GenieLeaderboardProps) => {
  const { 
    userEntry, 
    leaderboardStats, 
    loading, 
    statsLoading,
    toggleOptIn, 
    fetchLeaderboardStats 
  } = useLeaderboard();
  
  const { memory } = useBusinessMemory();
  
  const [filterBusinessType, setFilterBusinessType] = useState<string>("all");
  const [filterSizeBand, setFilterSizeBand] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Derive business type and size from memory
  const userBusinessType = memory?.business_type || null;
  const userSizeBand = memory?.team_size || null;

  const isOptedIn = userEntry?.opted_in || false;
  const scoreBand = getScoreBandFromScore(currentScore);

  // Fetch stats on mount and when filters change
  useEffect(() => {
    fetchLeaderboardStats(
      filterBusinessType === "all" ? null : filterBusinessType,
      filterSizeBand === "all" ? null : filterSizeBand
    );
  }, [fetchLeaderboardStats, filterBusinessType, filterSizeBand]);

  const handleOptInToggle = async (checked: boolean) => {
    await toggleOptIn(
      checked,
      scoreBand,
      userBusinessType || undefined,
      userSizeBand || undefined,
      currentStreak
    );
    // Refetch stats after toggle
    if (checked) {
      fetchLeaderboardStats(
        filterBusinessType === "all" ? null : filterBusinessType,
        filterSizeBand === "all" ? null : filterSizeBand
      );
    }
  };

  // Calculate totals
  const totalParticipants = leaderboardStats.reduce((acc, s) => acc + s.user_count, 0);
  const groupedStats = groupStats(leaderboardStats);

  if (loading) {
    return (
      <Card className="bg-secondary/30 border-border/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-secondary rounded w-1/3" />
            <div className="h-20 bg-secondary rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-secondary/30 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-accent" />
            <CardTitle className="text-base">Community Leaderboard</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            <Users size={12} className="mr-1" />
            {totalParticipants} operators
          </Badge>
        </div>
        <CardDescription className="text-xs">
          See how operators in your segment are engaging with the Genie. All data is anonymised.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Opt-in toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/30">
          <div className="flex items-center gap-3">
            {isOptedIn ? (
              <Eye size={16} className="text-accent" />
            ) : (
              <EyeOff size={16} className="text-muted-foreground" />
            )}
            <div>
              <Label htmlFor="leaderboard-opt-in" className="text-sm font-medium cursor-pointer">
                Show me on leaderboard
              </Label>
              <p className="text-xs text-muted-foreground">
                {isOptedIn 
                  ? "Your score band is visible (not your score)" 
                  : "Opt in to appear anonymously"
                }
              </p>
            </div>
          </div>
          <Switch
            id="leaderboard-opt-in"
            checked={isOptedIn}
            onCheckedChange={handleOptInToggle}
          />
        </div>

        {/* Current user's band */}
        {isOptedIn && (
          <div className="p-3 rounded-lg border border-accent/20 bg-accent/5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Your current band</span>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    getScoreBandColor(scoreBand).bg,
                    getScoreBandColor(scoreBand).border,
                    getScoreBandColor(scoreBand).text
                  )}
                >
                  {getScoreBandLabel(scoreBand)}
                </Badge>
                {currentStreak > 0 && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Flame size={12} className="text-amber-500" />
                    {currentStreak}w
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-xs text-muted-foreground"
          >
            <Filter size={12} className="mr-1" />
            {showFilters ? "Hide filters" : "Filter by segment"}
          </Button>
          
          {showFilters && (
            <div className="grid grid-cols-2 gap-2">
              <Select value={filterBusinessType} onValueChange={setFilterBusinessType}>
                <SelectTrigger className="text-xs h-8">
                  <SelectValue placeholder="Business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {BUSINESS_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterSizeBand} onValueChange={setFilterSizeBand}>
                <SelectTrigger className="text-xs h-8">
                  <SelectValue placeholder="Size band" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sizes</SelectItem>
                  {SIZE_BANDS.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Leaderboard stats */}
        {statsLoading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-16 bg-secondary rounded" />
            <div className="h-16 bg-secondary rounded" />
          </div>
        ) : totalParticipants === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Users size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No operators in this segment yet</p>
            <p className="text-xs">Be the first to opt in!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Summary cards by score band */}
            {["strong", "growing", "building"].map((band) => {
              const bandStats = leaderboardStats.filter(s => s.score_band === band);
              const bandTotal = bandStats.reduce((acc, s) => acc + s.user_count, 0);
              const avgStreak = bandStats.length > 0
                ? bandStats.reduce((acc, s) => acc + (s.avg_streak * s.user_count), 0) / bandTotal
                : 0;
              
              if (bandTotal === 0) return null;
              
              const colors = getScoreBandColor(band);
              const percentage = Math.round((bandTotal / totalParticipants) * 100);
              
              return (
                <div 
                  key={band}
                  className={cn(
                    "p-3 rounded-lg border",
                    colors.bg,
                    colors.border
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} className={colors.text} />
                      <span className={cn("text-sm font-medium", colors.text)}>
                        {getScoreBandLabel(band)}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {bandTotal} operator{bandTotal !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
                    <div 
                      className={cn("h-full rounded-full transition-all", colors.text.replace("text-", "bg-"))}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{percentage}% of participants</span>
                    {avgStreak > 0 && (
                      <span className="flex items-center gap-1">
                        <Flame size={10} className="text-amber-500" />
                        Avg {avgStreak.toFixed(1)}w streak
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Privacy note */}
        <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border/30">
          Community insight is anonymised and aggregated. No individual business data is shared.
        </p>
      </CardContent>
    </Card>
  );
};

export default GenieLeaderboard;
