import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Play, CheckCircle, Brain, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const HeroNew = () => {
  const { user } = useAuth();

  return (
    <section className="relative min-h-[85vh] flex items-center pt-20 lg:pt-0 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] -z-10 animate-pulse-glow" />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] -z-10" />

      <div className="container-wide px-6 lg:px-12 py-12 lg:py-16">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium animate-fade-up">
              <Sparkles size={14} className="fill-accent" />
              <span>Free tools for wellness operators</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.05] mb-6 animate-fade-up animation-delay-100 tracking-tight text-center">
            AI that runs your{" "}
            <span className="text-accent">wellness business</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up animation-delay-200 text-center">
            Strategic AI advisor, ready-to-use playbooks, and operator tools — built for gyms, spas, studios, and wellness brands.
          </p>

          {/* Primary CTA - Try AI Advisor */}
          <div className="flex flex-col items-center gap-6 mb-12 animate-fade-up animation-delay-300">
            <Button variant="accent" size="xl" asChild className="shadow-glow">
              <Link to={user ? "/genie" : "/auth?redirect=/genie"}>
                <Brain size={20} />
                Try AI Advisor Free
                <ArrowRight size={18} />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <CheckCircle size={14} className="text-green-500" />
              10 free credits on signup • No card required
            </p>
          </div>

          {/* Quick Start Cards */}
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto animate-fade-up animation-delay-400">
            <Link 
              to="/ai-readiness"
              className="group p-5 rounded-xl bg-card border border-border hover:border-accent/50 transition-all hover:shadow-lg"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Zap size={18} className="text-accent" />
                </div>
                <span className="text-xs font-semibold text-accent uppercase tracking-wider">Free</span>
              </div>
              <h3 className="font-semibold mb-1 group-hover:text-accent transition-colors">AI Readiness Score</h3>
              <p className="text-sm text-muted-foreground">2-min assessment. Find out if you're ready for AI.</p>
            </Link>

            <Link 
              to="/products"
              className="group p-5 rounded-xl bg-card border border-border hover:border-accent/50 transition-all hover:shadow-lg"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Play size={18} className="text-purple-400" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">From £29</span>
              </div>
              <h3 className="font-semibold mb-1 group-hover:text-accent transition-colors">Operator Playbooks</h3>
              <p className="text-sm text-muted-foreground">90-day action plans for retention, engagement, AI.</p>
            </Link>

            <Link 
              to={user ? "/genie" : "/auth?redirect=/genie"}
              className="group p-5 rounded-xl bg-card border border-border hover:border-accent/50 transition-all hover:shadow-lg"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Brain size={18} className="text-green-400" />
                </div>
                <span className="text-xs font-semibold text-green-500 uppercase tracking-wider">10 Free</span>
              </div>
              <h3 className="font-semibold mb-1 group-hover:text-accent transition-colors">AI Advisor</h3>
              <p className="text-sm text-muted-foreground">Your on-demand strategic business partner.</p>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroNew;
