import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ClipboardCheck } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center pt-20 lg:pt-0">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/30 -z-10" />
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl -z-10" />

      <div className="container-wide px-6 lg:px-12 py-12 lg:py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-8 animate-fade-up">
            <Sparkles size={16} />
            <span>AI-Powered Growth for Wellness Brands</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-heading leading-[1.1] mb-6 animate-fade-up animation-delay-100">
            AI agents that{" "}
            <span className="italic">automate growth</span>{" "}
            <br className="hidden sm:block" />
            and operations
          </h1>

          {/* Subheadline */}
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-up animation-delay-200">
            I help wellness, fitness, and hospitality businesses scale faster with intelligent automation—without hiring more headcount.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 animate-fade-up animation-delay-300">
            <Button variant="hero" size="xl" asChild>
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
              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors group"
            >
              <ClipboardCheck size={18} />
              <span className="underline underline-offset-4 decoration-accent/50 group-hover:decoration-accent">
                Start with the free AI Readiness Index + 30-min strategy call
              </span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
