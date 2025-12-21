import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CREDIT_PACKS, CreditPack } from "./AdvisorModes";
import { Coins, Sparkles, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CreditPurchaseProps {
  currentCredits: number;
  onPurchase: (packId: string) => void;
  isLoading?: boolean;
}

const CreditPurchase = ({ currentCredits, onPurchase, isLoading }: CreditPurchaseProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Coins size={14} />
          Buy Credits
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles size={20} className="text-accent" />
            Top Up Your Credits
          </DialogTitle>
          <DialogDescription>
            Credits never expire. Use them for any AI Advisor conversation.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center justify-center gap-2 mb-6 p-3 rounded-lg bg-secondary">
            <Coins size={18} className="text-accent" />
            <span className="text-lg font-medium">{currentCredits} credits</span>
            <span className="text-muted-foreground text-sm">remaining</span>
          </div>

          <div className="grid gap-3">
            {CREDIT_PACKS.map((pack) => (
              <CreditPackCard
                key={pack.id}
                pack={pack}
                onSelect={() => onPurchase(pack.id)}
                isLoading={isLoading}
              />
            ))}
          </div>

          <div className="mt-6 space-y-2 text-xs text-muted-foreground">
            <p className="flex items-center gap-2">
              <Check size={12} className="text-green-500" />
              Credits never expire
            </p>
            <p className="flex items-center gap-2">
              <Check size={12} className="text-green-500" />
              Use across all modes
            </p>
            <p className="flex items-center gap-2">
              <Check size={12} className="text-green-500" />
              Cancel anytime, keep your credits
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CreditPackCard = ({
  pack,
  onSelect,
  isLoading,
}: {
  pack: CreditPack;
  onSelect: () => void;
  isLoading?: boolean;
}) => {
  const pricePerCredit = (pack.price / pack.credits).toFixed(2);

  return (
    <button
      onClick={onSelect}
      disabled={isLoading}
      className={cn(
        "relative w-full p-4 rounded-xl border text-left transition-all hover:border-accent/50",
        pack.popular
          ? "border-accent bg-accent/5 ring-1 ring-accent/20"
          : "border-border bg-card"
      )}
    >
      {pack.popular && (
        <span className="absolute -top-2 right-4 text-[10px] font-medium bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
          MOST POPULAR
        </span>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{pack.credits}</span>
            <span className="text-muted-foreground text-sm">credits</span>
          </div>
          <p className="text-xs text-muted-foreground">
            £{pricePerCredit} per credit
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-xl font-bold">£{pack.price}</div>
          {pack.savings && (
            <span className="text-xs text-green-600 font-medium">{pack.savings}</span>
          )}
        </div>
      </div>
    </button>
  );
};

export default CreditPurchase;
