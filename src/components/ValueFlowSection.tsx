import { Lightbulb, ClipboardCheck, Zap, TrendingUp, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Lightbulb,
    label: "Insight",
    description: "Spot what's changing before competitors do",
    example: "\"Your members are 3x more likely to churn after week 6\"",
  },
  {
    icon: ClipboardCheck,
    label: "Readiness",
    description: "Know exactly where you stand",
    example: "\"Data infrastructure: strong. Team capability: needs work\"",
  },
  {
    icon: Zap,
    label: "Activation",
    description: "Turn insight into action — fast",
    example: "\"Here's a 4-week retention playbook for your gym\"",
  },
  {
    icon: TrendingUp,
    label: "Revenue",
    description: "Measure what actually matters",
    example: "\"Members using AI insights have 40% higher LTV\"",
  },
];

const ValueFlowSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-wide">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
            How It Works
          </p>
          <h2 className="text-3xl lg:text-4xl mb-4 tracking-tight">
            From insight to revenue in four steps
          </h2>
          <p className="text-muted-foreground text-lg">
            The same framework used by the most AI-ready wellness operators.
          </p>
        </div>

        {/* Flow Diagram */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-16 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-accent/20 via-accent/50 to-accent/20" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
            {steps.map((step, index) => (
              <div key={step.label} className="relative group">
                {/* Card */}
                <div className="bg-card border border-border rounded-2xl p-6 h-full hover:border-accent/30 transition-all duration-300 hover:-translate-y-1">
                  {/* Step Number & Icon */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center relative z-10">
                      <step.icon size={24} className="text-accent" />
                    </div>
                    <div className="text-2xl font-bold text-accent/20">
                      0{index + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-2">{step.label}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{step.description}</p>

                  {/* Example Quote */}
                  <div className="bg-secondary/50 rounded-lg p-3 border-l-2 border-accent/30">
                    <p className="text-xs text-muted-foreground italic">{step.example}</p>
                  </div>
                </div>

                {/* Arrow - Mobile/Tablet */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center py-2">
                    <ArrowRight size={20} className="text-accent/40 rotate-90 md:rotate-0" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Not sure where you are? Start with a free diagnostic.
          </p>
          <a
            href="/ai-readiness"
            className="inline-flex items-center gap-2 text-accent font-medium hover:gap-3 transition-all"
          >
            Take the AI Readiness Assessment
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default ValueFlowSection;
