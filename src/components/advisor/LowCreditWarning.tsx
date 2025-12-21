import { AlertTriangle, Coins, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CreditPurchase from "./CreditPurchase";

interface LowCreditWarningProps {
  balance: number;
  threshold?: number;
  onPurchase: (packId: string) => void;
  compact?: boolean;
}

const LowCreditWarning = ({ 
  balance, 
  threshold = 5, 
  onPurchase,
  compact = false 
}: LowCreditWarningProps) => {
  // Don't show if above threshold
  if (balance > threshold) return null;

  // Critical - 0 credits
  if (balance === 0) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between gap-4">
          <span className="text-sm">
            <strong>No credits remaining.</strong> Buy credits to continue using the AI Advisor.
          </span>
          <CreditPurchase currentCredits={balance} onPurchase={onPurchase} />
        </AlertDescription>
      </Alert>
    );
  }

  // Low - under threshold
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
        <AlertTriangle size={14} />
        <span className="text-xs font-medium">{balance} credits left</span>
      </div>
    );
  }

  return (
    <Alert className="mb-4 border-amber-500/30 bg-amber-500/5">
      <Coins className="h-4 w-4 text-amber-500" />
      <AlertDescription className="flex items-center justify-between gap-4">
        <span className="text-sm text-amber-700 dark:text-amber-300">
          <strong>Running low:</strong> Only {balance} credits remaining.
        </span>
        <CreditPurchase currentCredits={balance} onPurchase={onPurchase} />
      </AlertDescription>
    </Alert>
  );
};

export default LowCreditWarning;
