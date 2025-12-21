import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, Users, Bot, Code } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    icon: Briefcase,
    title: "AI Readiness Sprint",
    price: "From £1,500",
    description: "1-2 week diagnostic that tells leadership where AI will (and won't) work.",
  },
  {
    icon: Users,
    title: "AI Literacy Training",
    price: "From £3,000",
    description: "Half-day to 2 sessions. Align your humans before you automate.",
  },
  {
    icon: Bot,
    title: "AI Agent Build",
    price: "From £8,000",
    description: "One working AI agent deployed in your business. 4-8 weeks.",
  },
  {
    icon: Code,
    title: "Custom Tech Build",
    price: "From £10,000",
    description: "Websites, apps, platforms — designed and built from scratch.",
  },
];

const ServicesTeaser = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-wide">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Need more support?
          </p>
          <h2 className="text-3xl lg:text-4xl tracking-tight mb-3">
            Consulting & Custom Builds
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            For operators who want hands-on help with AI strategy, team training, or custom builds.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {services.map((service) => (
            <div
              key={service.title}
              className="p-5 rounded-xl bg-card border border-border"
            >
              <div className="p-2 rounded-lg bg-accent/10 w-fit mb-3">
                <service.icon size={20} className="text-accent" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{service.title}</h3>
              <p className="text-xs text-accent font-medium mb-2">{service.price}</p>
              <p className="text-xs text-muted-foreground">{service.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" asChild>
            <Link to="/services">
              View All Services
              <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesTeaser;
