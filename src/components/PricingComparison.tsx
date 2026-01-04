import { Check, X, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

import { FREE_TRIAL_CREDITS, FREE_TRIAL_DAYS, CREDIT_PACKS } from "@/components/advisor/AdvisorModes";

const tiers = [
  {
    name: "Free Trial",
    price: "£0",
    description: `${FREE_TRIAL_DAYS} days to explore everything`,
    highlight: false,
    cta: "Start Free Trial",
    ctaLink: "/auth?redirect=/genie",
    features: [
      { name: `${FREE_TRIAL_CREDITS} free credits`, included: true },
      { name: "All 8 expert modes", included: true },
      { name: "Voice mode included", included: true },
      { name: "Business memory", included: true },
      { name: "AI Readiness Assessment", included: true },
      { name: "No card required", included: true },
    ],
  },
  {
    name: "Pay As You Go",
    price: `From £${CREDIT_PACKS[0].price}`,
    description: "Buy credits when you need them",
    highlight: true,
    cta: "Get Credits",
    ctaLink: "/auth?redirect=/genie",
    features: [
      { name: `${CREDIT_PACKS[0].credits}-${CREDIT_PACKS[2].credits} credits per pack`, included: true },
      { name: "1 credit per message", included: true },
      { name: "All 8 expert modes", included: true },
      { name: "Voice mode", included: true },
      { name: "Business memory", included: true },
      { name: "Priority responses", included: true },
      { name: "Downloadable reports", included: true },
      { name: "Credits never expire", included: true },
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
            <p className="text-sm text-muted-foreground text-center mb-4">1 credit = 1 message • Credits never expire</p>
            <div className="grid sm:grid-cols-3 gap-4">
              {CREDIT_PACKS.map((pack, i) => (
                <div key={pack.credits} className={`text-center p-4 rounded-lg ${i === 1 ? 'bg-accent/10 border border-accent/20' : 'bg-secondary/50'}`}>
                  <p className={`text-2xl font-bold ${i === 1 ? 'text-accent' : ''}`}>{pack.credits}</p>
                  <p className="text-sm text-muted-foreground mb-1">credits</p>
                  <p className="font-semibold">£{pack.price}</p>
                  <p className={`text-xs ${pack.savings ? (i === 1 ? 'text-accent' : 'text-green-500') : 'text-muted-foreground'}`}>
                    {pack.savings || `£${(pack.price / pack.credits).toFixed(2)}/credit`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingComparison;
