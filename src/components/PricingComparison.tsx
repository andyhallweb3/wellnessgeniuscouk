import { Check, X, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const tiers = [
  {
    name: "Free",
    price: "£0",
    description: "Get started and explore",
    highlight: false,
    cta: "Start Free",
    ctaLink: "/auth?redirect=/genie",
    features: [
      { name: "AI Readiness Assessment", included: true },
      { name: "10 AI Advisor credits", included: true },
      { name: "Basic business insights", included: true },
      { name: "Email support", included: true },
      { name: "Voice mode", included: false },
      { name: "Business memory", included: false },
      { name: "Priority responses", included: false },
      { name: "Downloadable reports", included: false },
    ],
  },
  {
    name: "Pay As You Go",
    price: "From £9",
    description: "Buy credits when you need them",
    highlight: true,
    cta: "Get Credits",
    ctaLink: "/auth?redirect=/genie",
    features: [
      { name: "AI Readiness Assessment", included: true },
      { name: "25-200 AI Advisor credits", included: true },
      { name: "All 8 expert modes", included: true },
      { name: "Voice mode", included: true },
      { name: "Business memory", included: true },
      { name: "Priority responses", included: true },
      { name: "Downloadable reports", included: true },
      { name: "Email + chat support", included: true },
    ],
  },
  {
    name: "Consulting",
    price: "From £1,500",
    description: "Hands-on implementation",
    highlight: false,
    cta: "Book a Call",
    ctaLink: "#contact",
    features: [
      { name: "Everything in Pay As You Go", included: true },
      { name: "1:1 strategy sessions", included: true },
      { name: "Custom AI agent builds", included: true },
      { name: "Team training workshops", included: true },
      { name: "Integration support", included: true },
      { name: "Dedicated account manager", included: true },
      { name: "SLA guarantees", included: true },
      { name: "White-label options", included: true },
    ],
  },
];

const PricingComparison = () => {
  const { user } = useAuth();

  return (
    <section className="section-padding bg-card">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
            Simple Pricing
          </p>
          <h2 className="text-3xl lg:text-4xl mb-4 tracking-tight">
            Start free, scale as you grow
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            No subscriptions required. Use credits when you need them, or get hands-on help with consulting.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl p-6 lg:p-8 ${
                tier.highlight
                  ? "bg-accent/5 border-2 border-accent"
                  : "bg-background border border-border"
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                    <Sparkles size={12} />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-1">{tier.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{tier.description}</p>
                <p className="text-3xl font-bold">
                  {tier.price}
                  {tier.name === "Pay As You Go" && (
                    <span className="text-base font-normal text-muted-foreground">/pack</span>
                  )}
                </p>
              </div>

              <Button
                variant={tier.highlight ? "accent" : "outline"}
                className="w-full mb-6"
                asChild
              >
                {tier.ctaLink.startsWith("#") ? (
                  <a href={tier.ctaLink}>
                    {tier.cta}
                    <ArrowRight size={16} />
                  </a>
                ) : (
                  <Link to={user && tier.name !== "Free" ? "/genie" : tier.ctaLink}>
                    {tier.cta}
                    <ArrowRight size={16} />
                  </Link>
                )}
              </Button>

              <ul className="space-y-3">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X size={18} className="text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                    )}
                    <span
                      className={
                        feature.included ? "text-foreground" : "text-muted-foreground/50"
                      }
                    >
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Credit Packs Detail */}
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="bg-background rounded-xl border border-border p-6">
            <h3 className="font-semibold mb-4 text-center">Credit Pack Options</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold">25</p>
                <p className="text-sm text-muted-foreground mb-1">credits</p>
                <p className="font-semibold">£9</p>
                <p className="text-xs text-muted-foreground">£0.36/credit</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-accent/10 border border-accent/20">
                <p className="text-2xl font-bold text-accent">75</p>
                <p className="text-sm text-muted-foreground mb-1">credits</p>
                <p className="font-semibold">£19</p>
                <p className="text-xs text-accent">Save 24%</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold">200</p>
                <p className="text-sm text-muted-foreground mb-1">credits</p>
                <p className="font-semibold">£39</p>
                <p className="text-xs text-green-500">Save 46%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingComparison;
