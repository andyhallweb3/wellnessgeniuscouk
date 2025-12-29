import { Button } from "@/components/ui/button";
import { ArrowRight, ClipboardCheck, Compass, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    icon: ClipboardCheck,
    step: "00",
    title: "AI Readiness Index",
    tagline: "Free assessment + 30-min strategy call",
    description: "Start here. A 10-minute diagnostic that shows whether your business is ready for AI — and where it will fail if you rush.",
    price: "Free",
    timeline: "10 minutes + call",
    whoItsFor: [
      "Anyone considering AI",
      "Leaders unsure where to start",
      "Teams wanting quick clarity",
    ],
    deliverables: [
      "5-pillar readiness score",
      "Personalised insights report",
      "30-min strategy call to discuss results",
      "Recommended next steps",
    ],
    format: "Online assessment + video call",
    popular: false,
    isFree: true,
  },
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
    isFree: false,
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
    isFree: false,
  },
];

const Services = () => {
  return (
    <section id="services" className="section-padding bg-card">
      <div className="container-wide">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
            Consulting Services
          </p>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl mb-4 tracking-tight">
            Hands-on AI guidance
          </h2>
          <p className="text-muted-foreground text-lg">
            Strategy, training, and roadmaps. For teams who want expert support before they build.
          </p>
        </div>

        {/* Progression indicator */}
        <div className="hidden lg:flex items-center justify-center gap-4 mb-16">
          {["Free Assessment", "Diagnose", "Align"].map((label, i) => (
            <div key={label} className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                  i === 0 ? "bg-accent text-accent-foreground" : "bg-secondary border border-border text-muted-foreground"
                }`}>
                  {i === 0 ? "✓" : i}
                </div>
                <span className={`text-sm font-medium ${i === 0 ? "text-accent" : "text-foreground"}`}>{label}</span>
              </div>
              {i < 2 && <div className="h-px w-8 bg-border" />}
            </div>
          ))}
        </div>

        {/* Service Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className={`relative bg-secondary/50 rounded-2xl p-8 transition-all duration-300 hover:bg-secondary group ${
                service.popular ? "ring-1 ring-accent shadow-glow-sm" : 
                service.isFree ? "ring-1 ring-accent/50 bg-accent/5" : 
                "border border-border/50"
              }`}
            >
              {service.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
                  Most Popular
                </div>
              )}
              {service.isFree && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
                  Start Here
                </div>
              )}

              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:bg-accent/20 transition-colors ${
                  service.isFree ? "bg-accent/20 border border-accent/30" : "bg-accent/10 border border-accent/20"
                }`}>
                  <service.icon className="w-6 h-6 text-accent" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Step {service.step}
                </span>
              </div>

              <h3 className="text-xl font-semibold mb-2 tracking-tight">
                {service.title}
              </h3>
              <p className="text-accent text-sm font-medium mb-3">
                {service.tagline}
              </p>
              <p className="text-muted-foreground text-sm mb-6">
                {service.description}
              </p>

              <div className="flex items-baseline gap-2 mb-1">
                <span className={`text-2xl font-semibold tracking-tight ${service.isFree ? "text-accent" : ""}`}>
                  {service.price}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Timeline: {service.timeline}
              </p>

              {/* Who it's for */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
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
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
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

              <p className="text-xs text-muted-foreground mb-6 border-t border-border/50 pt-4">
                {service.format}
              </p>

              {service.isFree ? (
                <Button
                  variant="accent"
                  className="w-full"
                  asChild
                >
                  <Link to="/ai-readiness">
                    Take Free Assessment
                    <ArrowRight size={16} />
                  </Link>
                </Button>
              ) : (
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
              )}
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-muted-foreground text-sm mt-16 max-w-2xl mx-auto">
          Not sure where to start? Take the free AI Readiness Index — it tells us exactly what to do next.
        </p>
      </div>
    </section>
  );
};

export default Services;