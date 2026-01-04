import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Sparkles, CheckCircle2, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AIAdvisorSection = () => {
  const { user } = useAuth();

  const benefits = [
    "Answers in 60 seconds, not 6 weeks",
    "Trained on 10+ years of wellness data",
    "Remembers your business context",
    "8 expert modes for every situation",
    "Voice mode for hands-free thinking",
    "Pay only for what you use",
  ];

  const questions = [
    "Why is my retention dropping?",
    "Should I raise membership prices?",
    "What should I focus on this quarter?",
    "How do I reduce staff turnover?",
    "Is my marketing spend working?",
    "When should I expand my space?",
  ];

  return (
    <section className="section-padding bg-gradient-to-b from-background via-card to-background overflow-hidden">
      <div className="container-wide">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Brain size={16} />
            The Core Product
          </div>
          <h2 className="text-3xl lg:text-5xl tracking-tight mb-6 font-bold">
            Stop guessing. Start{" "}
            <span className="text-primary">knowing.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your 24/7 strategic advisor that understands wellness businesses inside out. 
            Ask anything. Get action-ready answers.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Questions showcase */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl -z-10" />
            <div className="p-8 lg:p-10">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">
                Questions operators ask every day
              </p>
              <div className="space-y-3">
                {questions.map((question, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-xl bg-background/80 border border-border hover:border-primary/50 transition-all cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-medium text-primary">{i + 1}</span>
                    </div>
                    <p className="text-sm lg:text-base font-medium group-hover:text-primary transition-colors">
                      "{question}"
                    </p>
                    <ArrowRight size={16} className="ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  <span className="text-primary font-medium">2,847 questions</span> answered this month alone
                </p>
              </div>
            </div>
          </div>

          {/* Right - Benefits + CTA */}
          <div>
            <h3 className="text-2xl lg:text-3xl font-bold mb-6">
              Built for wellness operators, <br />
              <span className="text-muted-foreground">not generic business advice.</span>
            </h3>

            <div className="grid grid-cols-1 gap-3 mb-8">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-primary shrink-0" />
                  <p className="text-muted-foreground">{benefit}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="accent" size="xl" asChild className="shadow-glow">
                <Link to={user ? "/genie" : "/auth?redirect=/genie"}>
                  <Sparkles size={18} />
                  Try Free — 10 Credits
                  <ArrowRight size={18} />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/advisor">
                  <Play size={16} />
                  Watch Demo
                </Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              No card required • Credits never expire
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIAdvisorSection;
