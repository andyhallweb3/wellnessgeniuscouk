import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Brain, TrendingUp, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

interface SubscriptionPaywallProps {
  onManageSubscription?: () => void;
}

const features = [
  { icon: Brain, text: "Personalised AI strategic advisor" },
  { icon: TrendingUp, text: "Real-time business signals & insights" },
  { icon: Sparkles, text: "Unlimited decision support" },
  { icon: Shield, text: "Priority focus & risk alerts" },
];

export default function SubscriptionPaywall({ onManageSubscription }: SubscriptionPaywallProps) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-agent-checkout');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Error creating checkout:", err);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className="max-w-md w-full border-primary/20 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Founder Agent Pro</CardTitle>
          <CardDescription>
            Your personal AI strategic advisor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold">£49</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <Badge variant="secondary" className="mt-2">
              Cancel anytime
            </Badge>
          </div>

          <ul className="space-y-3">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm">{feature.text}</span>
              </li>
            ))}
          </ul>

          <Button 
            onClick={handleSubscribe} 
            className="w-full" 
            size="lg"
            disabled={loading}
          >
            {loading ? "Loading..." : "Start Free Trial"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Secure payment powered by Stripe. Cancel anytime.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
