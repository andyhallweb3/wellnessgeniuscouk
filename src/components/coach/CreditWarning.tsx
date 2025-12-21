import { AlertTriangle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface CreditWarningProps {
  creditCost: number;
  currentBalance: number;
  onProceed?: () => void;
  onCancel?: () => void;
  showUpgrade?: boolean;
}

const CreditWarning = ({
  creditCost,
  currentBalance,
  onProceed,
  onCancel,
  showUpgrade = true,
}: CreditWarningProps) => {
  const hasEnoughCredits = currentBalance >= creditCost;
  const isLowCredits = currentBalance <= 10;
  const isCriticalCredits = currentBalance <= 5;

  if (hasEnoughCredits && !isLowCredits) {
    return null;
  }

  return (
    <div
      className={`rounded-lg border p-4 ${
        !hasEnoughCredits
          ? "border-destructive/50 bg-destructive/10"
          : isCriticalCredits
          ? "border-orange-500/50 bg-orange-500/10"
          : "border-yellow-500/50 bg-yellow-500/10"
      }`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className={`h-5 w-5 shrink-0 mt-0.5 ${
            !hasEnoughCredits
              ? "text-destructive"
              : isCriticalCredits
              ? "text-orange-500"
              : "text-yellow-500"
          }`}
        />
        <div className="flex-1">
          {!hasEnoughCredits ? (
            <>
              <p className="text-sm font-medium text-destructive">
                Insufficient credits
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                This question requires {creditCost} credits, but you only have{" "}
                {currentBalance} remaining.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium">
                {isCriticalCredits ? "Credits running low" : "Low credits"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                This question would benefit from deeper analysis. Proceeding will use{" "}
                <strong>{creditCost} credits</strong>. You have {currentBalance}{" "}
                remaining.
              </p>
            </>
          )}

          {showUpgrade && (
            <div className="mt-3 flex items-center gap-2">
              {hasEnoughCredits && onProceed && (
                <Button variant="outline" size="sm" onClick={onProceed}>
                  Proceed ({creditCost} credits)
                </Button>
              )}
              {onCancel && (
                <Button variant="ghost" size="sm" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button variant="accent" size="sm" asChild>
                <Link to="/products">
                  <Sparkles size={14} />
                  Upgrade
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreditWarning;
