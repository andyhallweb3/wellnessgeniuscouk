import { MessageSquare, Brain, Zap } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    step: "1",
    title: "Ask any business question",
    description: "Retention, pricing, staffing, marketing, competition — anything about running your wellness business.",
  },
  {
    icon: Brain,
    step: "2", 
    title: "AI analyses with industry context",
    description: "Draws from 10+ years of wellness industry data, benchmarks, and patterns from 500+ operators.",
  },
  {
    icon: Zap,
    step: "3",
    title: "Get actionable answers in 60 seconds",
    description: "Specific recommendations, not generic advice. With reasoning you can verify.",
  },
];

const HowItWorksSimple = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-wide">
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl tracking-tight mb-3">
            How it works
          </h2>
          <p className="text-muted-foreground">
            From question to answer in under 2 minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 mb-4">
                <step.icon size={28} className="text-accent" />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
                  {step.step}
                </span>
              </div>
              <h3 className="font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSimple;