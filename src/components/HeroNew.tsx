import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles, Brain, MessageSquare, Mic } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

// Import real client logos
import nuformaLogo from "@/assets/logos/nuforma.png";
import equesoulLogo from "@/assets/logos/equesoul.jpeg";
import leisureExpertsLogo from "@/assets/logos/the-leisure-experts.jpeg";

const HeroNew = () => {
  const { user } = useAuth();
  const [isTyping, setIsTyping] = useState(false);

  const exampleQuestions = [
    "Why is my January retention down 8%?",
    "Should I raise my membership prices?",
    "What should I focus on this quarter?",
    "How do I reduce staff turnover?",
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 lg:pt-0 overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 -z-10" />
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] -z-10" />
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-accent/15 rounded-full blur-[120px] -z-10" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] -z-10" />

      <div className="container-wide px-6 lg:px-12 py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Copy */}
          <div className="max-w-xl">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-fade-up">
              <Brain size={16} />
              AI Business Advisor for Wellness
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.08] mb-6 animate-fade-up tracking-tight font-bold">
              Your wellness business{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                questions answered
              </span>{" "}
              in 60 seconds
            </h1>

            {/* Subheadline */}
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 animate-fade-up animation-delay-100 leading-relaxed">
              Stop guessing. Ask about retention, pricing, staffing, growth — get strategic 
              answers trained on 10+ years of wellness industry data.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 mb-8 animate-fade-up animation-delay-150">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-sm">
                <MessageSquare size={14} className="text-primary" />
                8 Expert Modes
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-sm">
                <Mic size={14} className="text-primary" />
                Voice Input
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-sm">
                <Sparkles size={14} className="text-primary" />
                Remembers Your Business
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-8 animate-fade-up animation-delay-200">
              <Button variant="accent" size="xl" asChild className="shadow-glow text-base px-8 w-full sm:w-auto">
                <Link to={user ? "/genie" : "/auth?redirect=/genie"}>
                  Try Free — No Card Required
                  <ArrowRight size={18} />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild className="w-full sm:w-auto">
                <Link to="/advisor">
                  <Play size={16} />
                  See Demo
                </Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground animate-fade-up animation-delay-300">
              10 free credits • Start in under 2 minutes • No commitment
            </p>
          </div>

          {/* Right - Interactive Demo Preview */}
          <div className="relative animate-fade-up animation-delay-300">
            {/* Chat window mockup */}
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-sm font-medium">AI Business Advisor</span>
                </div>
                <div className="w-12" />
              </div>

              {/* Chat content */}
              <div className="p-5 space-y-4 min-h-[320px]">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="max-w-[80%] bg-primary text-primary-foreground rounded-2xl rounded-tr-md px-4 py-3">
                    <p className="text-sm">Why is my January retention down 8% vs last year?</p>
                  </div>
                </div>

                {/* AI response */}
                <div className="flex justify-start">
                  <div className="max-w-[90%] bg-muted rounded-2xl rounded-tl-md px-4 py-4">
                    <p className="text-sm mb-3">
                      <span className="font-semibold text-primary">Based on your profile, 3 likely causes:</span>
                    </p>
                    <div className="space-y-2 text-sm">
                      <p>1. <strong>Onboarding gap</strong> — Dec joiners had 40% fewer touchpoints</p>
                      <p>2. <strong>Price timing</strong> — Your increase hit during competitor promos</p>
                      <p>3. <strong>Schedule change</strong> — 23% of churned attended cut evening slots</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border">
                      <p className="text-sm text-primary font-medium">
                        → Reintroduce one evening class as a "limited run" test
                      </p>
                    </div>
                  </div>
                </div>

                {/* Typing indicator */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Response time: 47 seconds • 2 credits
                </div>
              </div>

              {/* Input bar */}
              <div className="border-t border-border px-4 py-3">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 border border-border">
                  <span className="text-muted-foreground text-sm">Ask anything about your business...</span>
                  <ArrowRight size={16} className="ml-auto text-primary" />
                </div>
              </div>
            </div>

            {/* Floating stats */}
            <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-xl px-4 py-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Sparkles size={16} className="text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold">2,847 questions</p>
                  <p className="text-xs text-muted-foreground">answered this month</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social proof strip */}
        <div className="mt-16 pt-8 border-t border-border/50 animate-fade-up animation-delay-400">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap items-center justify-center gap-8">
              <img src={nuformaLogo} alt="Nuforma" className="h-8 w-auto opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
              <img src={equesoulLogo} alt="Equesoul" className="h-8 w-auto opacity-60 hover:opacity-100 transition-opacity rounded grayscale hover:grayscale-0" />
              <img src={leisureExpertsLogo} alt="The Leisure Experts" className="h-8 w-auto opacity-60 hover:opacity-100 transition-opacity rounded grayscale hover:grayscale-0" />
            </div>
            <p className="text-sm text-muted-foreground">
              Trusted by wellness operators managing £10M+ in annual revenue
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroNew;
