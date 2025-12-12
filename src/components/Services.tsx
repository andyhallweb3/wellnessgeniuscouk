import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Zap, Users } from "lucide-react";

const services = [
  {
    icon: Bot,
    title: "AI Agent Starter",
    description: "Perfect for businesses ready to test AI automation with a focused, high-impact project.",
    price: "From £2,500",
    timeline: "2-3 weeks",
    features: [
      "1 custom AI agent",
      "Integration with your existing tools",
      "Training and handover",
      "30 days support",
    ],
    popular: false,
  },
  {
    icon: Zap,
    title: "Growth Accelerator",
    description: "End-to-end automation for lead generation, engagement, and conversion workflows.",
    price: "From £7,500",
    timeline: "4-6 weeks",
    features: [
      "3 interconnected AI agents",
      "Full CRM integration",
      "Custom dashboards",
      "90 days support",
      "Monthly optimisation calls",
    ],
    popular: true,
  },
  {
    icon: Users,
    title: "Enterprise Partnership",
    description: "Strategic AI transformation for larger organisations seeking competitive advantage.",
    price: "Custom",
    timeline: "Ongoing",
    features: [
      "Unlimited AI agents",
      "Dedicated account manager",
      "Priority support",
      "Quarterly strategy reviews",
      "Team training workshops",
    ],
    popular: false,
  },
];

const Services = () => {
  return (
    <section id="services" className="section-padding bg-secondary/30">
      <div className="container-wide">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <p className="text-sm font-medium text-accent uppercase tracking-wider mb-3">
            Services
          </p>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-heading mb-4">
            Packages designed to deliver results
          </h2>
          <p className="text-muted-foreground text-lg">
            Choose the engagement level that matches your goals. All packages include strategy, implementation, and ongoing support.
          </p>
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

              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-6">
                <service.icon className="w-6 h-6 text-accent" />
              </div>

              <h3 className="text-xl font-heading font-medium mb-2">
                {service.title}
              </h3>
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

              <ul className="space-y-3 mb-8">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

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
      </div>
    </section>
  );
};

export default Services;
