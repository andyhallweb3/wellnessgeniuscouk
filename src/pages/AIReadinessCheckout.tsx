import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, CheckCircle, CreditCard } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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

  const handleCheckout = async () => {
    // TODO: Implement Stripe checkout
    console.log("Stripe checkout for result ID:", id);
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
            >
              <CreditCard size={16} />
              Pay £99
            </Button>

            {/* Security note */}
            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
              <Lock size={12} />
              <span>Secure payment powered by Stripe</span>
            </div>

            {/* Stripe not connected notice */}
            <div className="mt-8 p-4 bg-secondary/50 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                Payment integration pending. Contact us to access your full report.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AIReadinessCheckout;
