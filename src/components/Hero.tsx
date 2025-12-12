import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, ClipboardCheck } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 lg:pt-0 overflow-hidden">
      {/* Background gradient - Apple style */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card -z-10" />
      
      {/* Decorative glow orbs */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] -z-10 animate-pulse-glow" />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] -z-10" />

      <div className="container-wide px-6 lg:px-12 py-12 lg:py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge - tech style */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-8 animate-fade-up">
            <Zap size={14} className="fill-accent" />
            <span>AI-Powered Automation</span>
          </div>

          {/* Main Headline - Clean, bold */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.05] mb-6 animate-fade-up animation-delay-100 tracking-tight">
            AI agents that{" "}
            <span className="text-accent">automate growth</span>{" "}
            <br className="hidden sm:block" />
            and operations
          </h1>

          {/* Subheadline */}
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up animation-delay-200">
            Wellness Genius helps wellness, fitness, and hospitality businesses scale faster with intelligent automation—without hiring more headcount.
          </p>

          {/* CTAs - Apple style buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 animate-fade-up animation-delay-300">
            <Button variant="accent" size="xl" asChild>
              <a href="#contact">
                Book a Call
                <ArrowRight size={18} />
              </a>
            </Button>
            <Button variant="heroOutline" size="xl" asChild>
              <a href="#services">View Packages</a>
            </Button>
          </div>

          {/* AI Readiness CTA - Free Product */}
          <div className="animate-fade-up animation-delay-350">
            <Link 
              to="/ai-readiness"
              className="inline-flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                <ClipboardCheck size={16} className="text-accent" />
              </div>
              <span className="text-sm">
                Start with the free AI Readiness Index + 30-min strategy call
              </span>
              <ArrowRight size={14} className="text-accent group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;