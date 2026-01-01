import { Crown, Zap, ArrowUpRight, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TierBadgeProps {
  tier: "free" | "pro" | "expert" | null;
  monthlyAllowance: number;
  onUpgrade?: () => void;
  freeTrialExpiresAt?: string | null;
}

const TierBadge = ({ tier, monthlyAllowance, onUpgrade, freeTrialExpiresAt }: TierBadgeProps) => {
  const tierConfig = {
    free: {
      label: "Free Trial",
      icon: Gift,
      color: "bg-green-500/10 text-green-600 border-green-500/20",
      credits: 10,
    },
    pro: {
      label: "Pro",
      icon: Zap,
      color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      credits: 40,
    },
    expert: {
      label: "Expert",
      icon: Crown,
      color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      credits: 120,
    },
  };

  const config = tier ? tierConfig[tier] : null;

  if (!config) {
    return onUpgrade ? (
      <Button
        variant="outline"
        size="sm"
        onClick={onUpgrade}
        className="h-7 text-xs"
      >
        <Zap size={12} className="mr-1" />
        Upgrade
      </Button>
    ) : null;
  }

  const Icon = config.icon;
  const canUpgrade = tier === "free" || tier === "pro";

  // Calculate days remaining for free trial
  const daysRemaining = freeTrialExpiresAt 
    ? Math.max(0, Math.ceil((new Date(freeTrialExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={`${config.color} cursor-default font-medium`}
            >
              <Icon size={12} className="mr-1" />
              {config.label}
              {tier === "free" && daysRemaining !== null && (
                <span className="ml-1 opacity-70">({daysRemaining}d left)</span>
              )}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">
              {tier === "free" 
                ? `Free trial: ${monthlyAllowance} credits, expires in ${daysRemaining} days`
                : `${config.label} tier: ${monthlyAllowance} credits/month`
              }
            </p>
          </TooltipContent>
        </Tooltip>

        {canUpgrade && onUpgrade && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onUpgrade}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-accent"
              >
                Upgrade
                <ArrowUpRight size={12} className="ml-1" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">
                {tier === "free" 
                  ? "Upgrade to Pro for 40 credits/month"
                  : "Upgrade to Expert for 120 credits/month"
                }
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};

export default TierBadge;
