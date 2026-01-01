import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const PricingSimple = () => {
  const { user } = useAuth();

  return (
    <section className="section-padding bg-background">
      <div className="container-wide">
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl tracking-tight mb-3">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground">
            No subscriptions. No lock-in. Pay only when you use it.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free */}
          <div className="bg-card border border-border rounded-2xl p-8">
            <h3 className="text-xl font-semibold mb-1">Free</h3>
            <p className="text-sm text-muted-foreground mb-4">Try it risk-free</p>
            <p className="text-4xl font-bold mb-6">£0</p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-sm">
                <Check size={16} className="text-green-500" />
                10 free credits
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check size={16} className="text-green-500" />
                All 8 advisor modes
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check size={16} className="text-green-500" />
                AI Readiness Assessment
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check size={16} className="text-green-500" />
                No card required
              </li>
            </ul>

            <Button variant="outline" className="w-full" asChild>
              <Link to={user ? "/genie" : "/auth?redirect=/genie"}>
                Start Free
                <ArrowRight size={16} />
              </Link>
            </Button>
          </div>

          {/* Pay As You Go */}
          <div className="bg-accent/5 border-2 border-accent rounded-2xl p-8 relative">
            <div className="absolute -top-3 left-6 px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
              Most Popular
            </div>
            
            <h3 className="text-xl font-semibold mb-1">Pay As You Go</h3>
            <p className="text-sm text-muted-foreground mb-4">Buy credits when needed</p>
            <p className="text-4xl font-bold mb-1">
              £0.36
              <span className="text-base font-normal text-muted-foreground">/credit</span>
            </p>
            <p className="text-xs text-muted-foreground mb-6">From £9 for 25 credits</p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-sm">
                <Check size={16} className="text-green-500" />
                Everything in Free
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check size={16} className="text-green-500" />
                Voice mode
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check size={16} className="text-green-500" />
                Business memory (AI learns your context)
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check size={16} className="text-green-500" />
                Priority responses
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check size={16} className="text-green-500" />
                Downloadable reports
              </li>
            </ul>

            <Button variant="accent" className="w-full" asChild>
              <Link to={user ? "/genie" : "/auth?redirect=/genie"}>
                Get Credits
                <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </div>

        {/* Consulting note */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Need hands-on implementation?{" "}
          <a href="#contact" className="text-accent hover:underline">
            Book a consulting call
          </a>
        </p>
      </div>
    </section>
  );
};

export default PricingSimple;