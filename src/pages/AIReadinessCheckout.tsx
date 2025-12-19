import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, CheckCircle, CreditCard, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const includedFeatures = [
  "Full diagnostic report",
  "Revenue upside range (conservative)",
  "Top 3 blockers identified",
  "90-day priority action plan",
  "Monetisation paths",
  "Downloadable PDF",
  "Email delivery",
];

const AIReadinessCheckout = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [fetchingEmail, setFetchingEmail] = useState(true);

  // Check for cancelled payment
  useEffect(() => {
    if (searchParams.get("payment") === "cancelled") {
      toast({
        title: "Payment cancelled",
        description: "Your payment was not completed. You can try again when ready.",
      });
    }
  }, [searchParams, toast]);

  // Fetch user email from completion record
  useEffect(() => {
    const fetchEmail = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from("ai_readiness_completions")
          .select("email")
          .eq("id", id)
          .single();

        if (error) throw error;
        setEmail(data?.email || null);
      } catch (err) {
        console.error("Failed to fetch email:", err);
      } finally {
        setFetchingEmail(false);
      }
    };

    fetchEmail();
  }, [id]);

  const handleCheckout = async () => {
    if (!id || !email) {
      toast({
        title: "Error",
        description: "Unable to process checkout. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-report-checkout", {
        body: { completionId: id, email },
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in new tab
        window.open(data.url, "_blank");
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast({
        title: "Checkout failed",
        description: "Unable to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Complete Your Purchase | AI Readiness Score</title>
        <meta name="description" content="Unlock your full AI Readiness diagnostic report." />
      </Helmet>
      
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container-narrow section-padding">
          <div className="max-w-lg mx-auto">
            {/* Back link */}
            <Link 
              to={`/ai-readiness/results/${id}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to results
            </Link>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-heading mb-2">Unlock Full Report</h1>
              <p className="text-muted-foreground">
                Complete diagnostic with actionable insights
              </p>
            </div>

            {/* Order summary */}
            <div className="bg-card rounded-xl p-6 border border-border shadow-elegant mb-6">
              <h2 className="font-heading mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                {includedFeatures.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-accent mt-0.5 shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total</span>
                  <span className="text-2xl font-heading">£99</span>
                </div>
              </div>
            </div>

            {/* Checkout button */}
            <Button 
              variant="accent" 
              size="lg" 
              className="w-full"
              onClick={handleCheckout}
              disabled={isLoading || fetchingEmail || !email}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard size={16} />
                  Pay £99
                </>
              )}
            </Button>

            {/* Security note */}
            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
              <Lock size={12} />
              <span>Secure payment powered by Stripe</span>
            </div>

            {email && (
              <p className="text-xs text-muted-foreground text-center mt-4">
                Receipt will be sent to {email}
              </p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AIReadinessCheckout;
