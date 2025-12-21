import { Crown, Zap, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TierBadgeProps {
  tier: "pro" | "expert" | null;
  monthlyAllowance: number;
  onUpgrade?: () => void;
}

const TierBadge = ({ tier, monthlyAllowance, onUpgrade }: TierBadgeProps) => {
  const tierConfig = {
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
    return null;
  }

  const Icon = config.icon;
  const canUpgrade = tier === "pro";

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
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">
              {config.label} tier: {monthlyAllowance} credits/month
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
                Upgrade to Expert for 120 credits/month
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};

export default TierBadge;
