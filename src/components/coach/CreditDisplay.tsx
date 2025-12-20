import { cn } from "@/lib/utils";
import { Coins, AlertTriangle } from "lucide-react";

interface CreditDisplayProps {
  balance: number;
  monthlyAllowance: number;
  compact?: boolean;
}

const CreditDisplay = ({ balance, monthlyAllowance, compact = false }: CreditDisplayProps) => {
  const percentage = (balance / monthlyAllowance) * 100;
  const isLow = percentage < 25;
  const isCritical = percentage < 10;

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
          isCritical
            ? "bg-destructive/10 text-destructive"
            : isLow
            ? "bg-yellow-500/10 text-yellow-600"
            : "bg-accent/10 text-accent"
        )}
      >
        {isCritical ? (
          <AlertTriangle size={14} />
        ) : (
          <Coins size={14} />
        )}
        {balance} credits
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Coins size={18} className="text-accent" />
          <span className="font-medium">Credits</span>
        </div>
        <span className="text-2xl font-bold">{balance}</span>
      </div>
      
      <div className="h-2 rounded-full bg-secondary overflow-hidden mb-2">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            isCritical
              ? "bg-destructive"
              : isLow
              ? "bg-yellow-500"
              : "bg-accent"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <p className="text-xs text-muted-foreground">
        {balance} of {monthlyAllowance} monthly credits remaining
      </p>

      {isLow && (
        <div className={cn(
          "mt-3 p-3 rounded-lg text-xs",
          isCritical ? "bg-destructive/10 text-destructive" : "bg-yellow-500/10 text-yellow-700"
        )}>
          {isCritical ? (
            <>
              <strong>Low credits.</strong> Consider simpler questions or top up.
            </>
          ) : (
            <>
              <strong>Credits running low.</strong> Use deeper modes strategically.
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CreditDisplay;
