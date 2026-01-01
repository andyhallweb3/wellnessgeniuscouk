import { Link } from "react-router-dom";
import { Zap, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CreditsExhaustedPromptProps {
  isFreeTrial: boolean;
  freeTrialExpiresAt: string | null;
  onClose?: () => void;
}

const CreditsExhaustedPrompt = ({ isFreeTrial, freeTrialExpiresAt, onClose }: CreditsExhaustedPromptProps) => {
  const trialExpired = freeTrialExpiresAt && new Date(freeTrialExpiresAt) < new Date();

  return (
    <div className="p-6 text-center space-y-4">
      <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
        {trialExpired ? (
          <Clock className="w-8 h-8 text-accent" />
        ) : (
          <Zap className="w-8 h-8 text-accent" />
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-heading">
          {isFreeTrial 
            ? trialExpired 
              ? "Free Trial Expired"
              : "Free Credits Used"
            : "Credits Exhausted"
          }
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          {isFreeTrial
            ? trialExpired
              ? "Your 14-day free trial has ended. Upgrade to continue using the AI Advisor."
              : "You've used all 10 free credits. Upgrade to Pro for 40 credits per month."
            : "You've used all your credits this month. Upgrade to Expert for 120 credits per month, or wait for your credits to reset."
          }
        </p>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <Button variant="accent" asChild className="w-full">
          <Link to="/products">
            <Zap size={16} />
            {isFreeTrial ? "Upgrade to Pro — £19/mo" : "Upgrade to Expert — £49/mo"}
            <ArrowRight size={16} />
          </Link>
        </Button>
        
        {!isFreeTrial && (
          <Button variant="outline" asChild className="w-full">
            <Link to="/products">
              Buy credit top-ups
            </Link>
          </Button>
        )}
      </div>

      <div className="pt-4 border-t border-border">
        <h4 className="text-sm font-medium mb-2">What you get with Pro:</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>✓ 40 credits per month</li>
          <li>✓ All advisor modes</li>
          <li>✓ Document analysis</li>
          <li>✓ Session history</li>
          <li>✓ Priority support</li>
        </ul>
      </div>
    </div>
  );
};

export default CreditsExhaustedPrompt;
