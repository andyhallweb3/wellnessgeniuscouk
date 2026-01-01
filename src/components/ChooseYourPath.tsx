import { Building2, Rocket, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const paths = [
  {
    id: "operator",
    icon: Building2,
    label: "I'm a brand / operator",
    description: "Run a gym, studio, spa, or wellness business",
    cta: "See how AI saves you 10+ hours/week",
    link: "/advisor",
    accent: true,
  },
  {
    id: "founder",
    icon: Rocket,
    label: "I'm a founder / investor",
    description: "Building or backing wellness ventures",
    cta: "Explore strategic AI tools",
    link: "/ai-readiness",
  },
  {
    id: "explorer",
    icon: Sparkles,
    label: "I'm exploring AI in wellness",
    description: "Curious about what's possible",
    cta: "Start with the free assessment",
    link: "/ai-readiness",
  },
];

const ChooseYourPath = () => {
  return (
    <section className="section-padding bg-background border-t border-border/50">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
            Choose Your Path
          </p>
          <h2 className="text-2xl lg:text-3xl mb-4 tracking-tight">
            Where are you on your AI journey?
          </h2>
          <p className="text-muted-foreground">
            Everyone starts somewhere. Pick what fits — we'll guide you from there.
          </p>
        </div>

        {/* Path Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {paths.map((path) => (
            <Link
              key={path.id}
              to={path.link}
              className={`group relative p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${
                path.accent
                  ? "bg-accent/5 border-accent/30 hover:border-accent hover:shadow-[0_0_40px_-12px_hsl(var(--accent)/0.4)]"
                  : "bg-card border-border hover:border-accent/30"
              }`}
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${
                  path.accent ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground"
                }`}
              >
                <path.icon size={24} />
              </div>

              {/* Label */}
              <h3 className="text-xl font-semibold mb-2">{path.label}</h3>
              <p className="text-sm text-muted-foreground mb-6">{path.description}</p>

              {/* CTA */}
              <div className="flex items-center gap-2 text-sm font-medium text-accent group-hover:gap-3 transition-all">
                <span>{path.cta}</span>
                <ArrowRight size={16} />
              </div>

              {/* Popular badge for operator */}
              {path.accent && (
                <div className="absolute -top-3 right-6 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ChooseYourPath;
