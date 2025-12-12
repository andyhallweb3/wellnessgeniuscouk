import { Button } from "@/components/ui/button";
import { ArrowRight, Compass, GraduationCap, Bot } from "lucide-react";

const services = [
  {
    icon: Compass,
    step: "01",
    title: "AI Readiness Sprint",
    tagline: "Are you actually ready for AI — or just talking about it?",
    description: "A short, paid diagnostic that tells leadership where AI will (and won't) work, fast.",
    price: "£1,500 – £2,500",
    timeline: "1-2 weeks",
    whoItsFor: [
      "CEOs, Founders, MDs",
      "Heads of Ops, Growth, Digital",
      "10–500 employee organisations",
    ],
    deliverables: [
      "AI Readiness Scorecard (People, Data, Process, Risk)",
      "Top 5 AI use cases ranked by ROI & risk",
      '"Do not automate" list',
      "90-day AI action plan (build / buy / ignore)",
    ],
    format: "60–90 min workshop + pre-survey + PDF & Loom walkthrough",
    popular: false,
  },
  {
    icon: GraduationCap,
    step: "02",
    title: "AI Literacy for Leaders",
    tagline: "If your team doesn't understand AI, they'll resist it.",
    description: "Practical AI education focused on decision-making, not prompts. Align your humans before you automate.",
    price: "£3,000 – £10,000",
    timeline: "Half-day to 2 sessions",
    whoItsFor: [
      "Leadership teams",
      "Ops, Marketing, Product, HR",
      "Regulated industries",
    ],
    deliverables: [
      "How AI actually works (plain English)",
      "Use cases per function",
      "Governance + ethics basics",
      "Live demos with real agents",
      "Role-specific guardrails & best practice",
    ],
    format: "Leadership track (2 × 90 min) or Team workshop (half-day, up to 20 people)",
    popular: true,
  },
  {
    icon: Bot,
    step: "03",
    title: "AI Agent Build",
    tagline: "One agent. One job. Real ROI.",
    description: "I design and deploy a working AI agent inside your business. No theory. No decks. Something that runs.",
    price: "From £8,000",
    timeline: "4-8 weeks",
    whoItsFor: [
      "Companies past the AI-curious phase",
      "Teams drowning in admin, sales ops, support",
      "Organisations ready to prove ROI",
    ],
    deliverables: [
      "Use case definition + success metric",
      "Working AI agent (web / internal tool)",
      "Integrations (CRM, calendar, email, forms)",
      "Documentation + handover",
      "Optional ongoing support (£750–£1,500/month)",
    ],
    format: "MVP deployment with optional maintenance retainer",
    popular: false,
  },
];

const Services = () => {
  return (
    <section id="services" className="section-padding bg-secondary/30">
      <div className="container-wide">
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <p className="text-sm font-medium text-accent uppercase tracking-wider mb-3">
            Services
          </p>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-heading mb-4">
            A ladder, not a lucky dip
          </h2>
          <p className="text-muted-foreground text-lg">
            Diagnose → Align → Build. Each step de-risks the next.
          </p>
        </div>

        {/* Progression indicator */}
        <div className="hidden lg:flex items-center justify-center gap-4 mb-12">
          <span className="text-sm text-muted-foreground">Diagnose</span>
          <div className="h-px w-16 bg-accent/50" />
          <span className="text-sm text-muted-foreground">Align</span>
          <div className="h-px w-16 bg-accent/50" />
          <span className="text-sm text-muted-foreground">Build</span>
        </div>

        {/* Service Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className={`relative bg-card rounded-xl p-8 shadow-elegant transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 ${
                service.popular ? "ring-2 ring-accent" : "border border-border"
              }`}
            >
              {service.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
                  Most Popular
                </div>
              )}

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <service.icon className="w-6 h-6 text-accent" />
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Step {service.step}
                </span>
              </div>

              <h3 className="text-xl font-heading font-medium mb-2">
                {service.title}
              </h3>
              <p className="text-accent text-sm font-medium mb-3">
                {service.tagline}
              </p>
              <p className="text-muted-foreground text-sm mb-6">
                {service.description}
              </p>

              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-heading font-medium">
                  {service.price}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Timeline: {service.timeline}
              </p>

              {/* Who it's for */}
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Who it's for
                </p>
                <ul className="space-y-1">
                  {service.whoItsFor.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <div className="w-1 h-1 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Deliverables */}
              <div className="mb-6">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  What you get
                </p>
                <ul className="space-y-2">
                  {service.deliverables.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-xs text-muted-foreground mb-6 border-t border-border pt-4">
                {service.format}
              </p>

              <Button
                variant={service.popular ? "accent" : "outline"}
                className="w-full"
                asChild
              >
                <a href="#contact">
                  Get Started
                  <ArrowRight size={16} />
                </a>
              </Button>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-muted-foreground text-sm mt-12 max-w-2xl mx-auto">
          Not sure where to start? Most clients begin with the AI Readiness Sprint — it tells us exactly what to do next.
        </p>
      </div>
    </section>
  );
};

export default Services;
