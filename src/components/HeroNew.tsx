import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Brain, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import aiAdvisorScreenshot from "@/assets/ai-advisor-screenshot.png";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const HeroNew = () => {
  const { user } = useAuth();

  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 lg:pt-0 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] -z-10 animate-pulse-glow" />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] -z-10" />

      <div className="container-wide px-6 lg:px-12 py-12 lg:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Main content grid */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text */}
            <div className="text-center lg:text-left">
              {/* Main Headline - More specific */}
              <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl leading-[1.1] mb-6 animate-fade-up tracking-tight">
                AI that answers questions, predicts churn, and{" "}
                <span className="text-accent">saves you 10+ hours/week</span>
              </h1>

              {/* Subheadline - More concrete */}
              <p className="text-lg lg:text-xl text-muted-foreground mb-8 animate-fade-up animation-delay-100">
                Strategic AI advisor for wellness operators. Get retention insights, 
                stress-test decisions, and build action plans — in minutes, not weeks.
              </p>

              {/* Primary CTA */}
              <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 mb-6 animate-fade-up animation-delay-200">
                <Button variant="accent" size="xl" asChild className="shadow-glow">
                  <Link to={user ? "/genie" : "/auth?redirect=/genie"}>
                    <Brain size={20} />
                    Try AI Advisor Free
                    <ArrowRight size={18} />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/ai-readiness">
                    Take Free Assessment
                  </Link>
                </Button>
              </div>

              {/* Credit explainer with tooltip */}
              <div className="flex items-center justify-center lg:justify-start gap-2 animate-fade-up animation-delay-300">
                <CheckCircle size={14} className="text-green-500" />
                <span className="text-sm text-muted-foreground">
                  10 free credits on signup
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <Info size={14} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs bg-popover border border-border">
                    <p className="text-sm">
                      <strong>10 credits = ~5-10 advisor sessions</strong>
                      <br />
                      <span className="text-muted-foreground">
                        Quick questions cost 1 credit. Deep analysis costs 4-5. 
                        No subscription required — buy more only when you need them.
                      </span>
                    </p>
                  </TooltipContent>
                </Tooltip>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">No card required</span>
              </div>
            </div>

            {/* Right - Screenshot */}
            <div className="relative animate-fade-up animation-delay-300">
              <div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl">
                <img
                  src={aiAdvisorScreenshot}
                  alt="AI Advisor interface showing strategic business insights"
                  className="w-full h-auto"
                />
                {/* Gradient overlay for polish */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-xl px-4 py-3 shadow-lg">
                <p className="text-xs text-muted-foreground mb-1">Used by</p>
                <p className="font-semibold">500+ wellness operators</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroNew;
