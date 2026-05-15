import { usePoints } from "@/hooks/usePoints";
import { Loader2, Star, Zap, Trophy, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const TIER_CONFIG = {
  Starter: { icon: Star, color: "text-muted-foreground", bg: "bg-muted/50", border: "border-border", next: 500 },
  Bronze: { icon: Zap, color: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-500/30", next: 1500 },
  Silver: { icon: Trophy, color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-400/30", next: 5000 },
  Gold: { icon: Crown, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30", next: null },
} as const;

const REWARDS = [
  { points: 500, label: "5 free Genie sessions", tier: "Bronze" },
  { points: 1500, label: "15 free sessions + early feature access", tier: "Silver" },
  { points: 5000, label: "1 free Pro month + priority support", tier: "Gold" },
];

const EARN_GUIDE = [
  { label: "Use the AI Advisor", points: 10, suffix: "per session" },
  { label: "First session ever", points: 100, suffix: "one-time" },
  { label: "Add a Knowledge Base note", points: 5, suffix: "per note" },
  { label: "Upload a document", points: 30, suffix: "per upload" },
  { label: "Complete AI Assessment", points: 100, suffix: "one-time" },
  { label: "Refer an operator", points: 500, suffix: "per referral" },
];

export default function PointsCard() {
  const { total, tier, nextTierPoints, nextTierProgress, recentEvents, loading } = usePoints();
  const config = TIER_CONFIG[tier as keyof typeof TIER_CONFIG];
  const TierIcon = config.icon;

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 flex items-center gap-2 text-muted-foreground text-sm">
        <Loader2 size={14} className="animate-spin" />Loading points…
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border p-6 space-y-5", config.border, config.bg)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TierIcon size={16} className={config.color} />
            <span className={cn("text-xs font-semibold uppercase tracking-wider", config.color)}>{tier} Operator</span>
          </div>
          <p className="text-3xl font-heading">{total.toLocaleString("en-GB")}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Genius Points</p>
        </div>
        {nextTierPoints && (
          <div className="text-right text-xs text-muted-foreground">
            <p>{(nextTierPoints - total).toLocaleString("en-GB")} to next tier</p>
          </div>
        )}
      </div>

      {/* Progress to next tier */}
      {nextTierPoints && (
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>{tier}</span>
            <span>{Object.keys(TIER_CONFIG).find((_, i) => Object.keys(TIER_CONFIG)[i + 1] === Object.keys(TIER_CONFIG)[Object.keys(TIER_CONFIG).indexOf(tier) + 1])}</span>
          </div>
          <div className="h-1.5 rounded-full bg-border overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", config.color.replace("text-", "bg-"))}
              style={{ width: `${nextTierProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* How to earn */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">How to earn</p>
        <div className="space-y-1.5">
          {EARN_GUIDE.map(e => (
            <div key={e.label} className="flex justify-between text-xs">
              <span className="text-muted-foreground">{e.label}</span>
              <span className="font-medium">+{e.points} <span className="text-muted-foreground font-normal">{e.suffix}</span></span>
            </div>
          ))}
        </div>
      </div>

      {/* Rewards */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Rewards</p>
        <div className="space-y-1.5">
          {REWARDS.map(r => (
            <div key={r.tier} className={cn(
              "flex items-center gap-2 text-xs rounded-lg px-3 py-2",
              total >= r.points ? "bg-accent/10 text-accent font-medium" : "text-muted-foreground bg-border/30"
            )}>
              {total >= r.points ? "✓" : "·"}
              <span className="font-semibold">{r.points.toLocaleString("en-GB")} pts</span>
              <span>— {r.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      {recentEvents.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recent activity</p>
          <div className="space-y-1">
            {recentEvents.slice(0, 4).map((e, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-muted-foreground truncate">{e.description}</span>
                <span className="text-accent font-medium ml-2 shrink-0">+{e.points}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
