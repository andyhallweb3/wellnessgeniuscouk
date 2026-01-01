import { TrendingUp, Clock, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const metrics = [
  {
    icon: TrendingUp,
    value: "23%",
    label: "Retention increase",
    context: "in 6 months",
  },
  {
    icon: Clock,
    value: "12hrs",
    label: "Saved weekly",
    context: "on operations",
  },
  {
    icon: Users,
    value: "3x",
    label: "Faster onboarding",
    context: "for new members",
  },
];

const CaseStudySection = () => {
  return (
    <section className="section-padding bg-gradient-to-b from-background to-card">
      <div className="container-wide">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
              Case Study
            </p>
            <h2 className="text-3xl lg:text-4xl mb-4 tracking-tight">
              How a 12-site fitness operator transformed with AI
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From scattered data and manual processes to automated insights and predictable growth.
            </p>
          </div>

          {/* Metrics */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-card border border-border text-center"
              >
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <metric.icon size={24} className="text-accent" />
                </div>
                <p className="text-4xl font-bold text-accent mb-1">{metric.value}</p>
                <p className="font-medium mb-1">{metric.label}</p>
                <p className="text-sm text-muted-foreground">{metric.context}</p>
              </div>
            ))}
          </div>

          {/* Story */}
          <div className="bg-card rounded-2xl border border-border p-8 lg:p-10">
            <h3 className="text-xl font-semibold mb-4">The Challenge</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              A regional fitness chain with 12 locations was drowning in data but starving for insights. 
              Member churn was unpredictable, class scheduling was reactive, and the team spent 15+ hours 
              weekly on manual reporting. Leadership knew AI could help but didn't know where to start.
            </p>

            <h3 className="text-xl font-semibold mb-4">The Solution</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-accent text-xs font-bold">1</span>
                </div>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">AI Readiness Assessment</strong> — Identified 3 high-impact automation opportunities
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-accent text-xs font-bold">2</span>
                </div>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Churn prediction agent</strong> — Flags at-risk members 2 weeks before they cancel
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-accent text-xs font-bold">3</span>
                </div>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Automated reporting</strong> — Daily briefings replace 12 hours of manual work
                </p>
              </li>
            </ul>

            <div className="flex flex-wrap gap-4">
              <Button variant="accent" asChild>
                <a href="#contact">
                  Get Similar Results
                  <ArrowRight size={16} />
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/ai-readiness">
                  Start with Free Assessment
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseStudySection;
