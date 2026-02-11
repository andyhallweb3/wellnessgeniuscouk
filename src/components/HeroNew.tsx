import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles, Brain, MessageSquare, Mic, Users, Mail, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { FREE_TRIAL_CREDITS, FREE_TRIAL_DAYS } from "@/components/advisor/AdvisorModes";
import nuformaLogo from "@/assets/logos/nuforma.png";
import equesoulLogo from "@/assets/logos/equesoul.jpeg";
import leisureExpertsLogo from "@/assets/logos/the-leisure-experts.jpeg";
import fitterStockLogo from "@/assets/logos/fitter-stock.jpeg";
import awakeLogo from "@/assets/logos/awake-meditation.jpeg";

const HeroNew = () => {
  const { user } = useAuth();

  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 lg:pt-0 overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 -z-10" />
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] -z-10" />
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-accent/15 rounded-full blur-[120px] -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] -z-10" />

      <div className="container-wide px-6 lg:px-12 py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Copy */}
          <div className="max-w-xl">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-fade-up">
              <Brain size={16} />
              AI-Powered Business Intelligence
            </div>

            {/* Headline - AEO optimised */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.08] mb-6 animate-fade-up tracking-tight font-bold">
              AI business intelligence for{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                wellness operators
              </span>
            </h1>

            {/* Subheadline - Entity & query optimised */}
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 animate-fade-up animation-delay-100 leading-relaxed">
              Join 16,000+ industry leaders using data-driven insights to increase member retention, 
              optimise partnerships, and scale profitably.
            </p>

            {/* Trust metrics strip */}
            <div className="flex flex-wrap gap-6 mb-8 animate-fade-up animation-delay-150">
              <div className="flex items-center gap-2 text-sm">
                <Linkedin size={16} className="text-[#0A66C2]" />
                <span className="font-semibold">16,000+</span>
                <span className="text-muted-foreground">followers</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail size={16} className="text-primary" />
                <span className="font-semibold">2,600+</span>
                <span className="text-muted-foreground">subscribers</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users size={16} className="text-accent" />
                <span className="font-semibold">500+</span>
                <span className="text-muted-foreground">operators served</span>
              </div>
            </div>

            {/* Triple CTA - Intent matching */}
            <div className="flex flex-col sm:flex-row items-start gap-3 mb-6 animate-fade-up animation-delay-200">
              <Button variant="accent" size="xl" asChild className="shadow-glow text-base px-8 w-full sm:w-auto">
                <Link to="/ai-readiness">
                  Try Free AI Assessment
                  <ArrowRight size={18} />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild className="w-full sm:w-auto">
                <a href="#contact">
                  Book Strategy Call
                </a>
              </Button>
            </div>

            <div className="animate-fade-up animation-delay-250">
              <Link 
                to="/insights" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5"
              >
                Read success stories
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Telegram + Free trial note */}
            <div className="flex items-center gap-4 mt-6 animate-fade-up animation-delay-350">
              <a 
                href="https://t.me/Wellnessgenius_bot" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0088cc]/10 border border-[#0088cc]/30 text-[#0088cc] hover:bg-[#0088cc]/20 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Chat on Telegram
              </a>
              <span className="text-xs text-muted-foreground">
                {FREE_TRIAL_CREDITS} free AI credits • No card required
              </span>
            </div>
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
                <div className="flex justify-end">
                  <div className="max-w-[80%] bg-primary text-primary-foreground rounded-2xl rounded-tr-md px-4 py-3">
                    <p className="text-sm">Why is my January retention down 8% vs last year?</p>
                  </div>
                </div>

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

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Response time: 47 seconds • 1 credit
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

        {/* Client logos strip */}
        <div className="mt-16 pt-8 border-t border-border/50 animate-fade-up animation-delay-400">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap items-center justify-center gap-8">
              <img src={fitterStockLogo} alt="Fitter Stock" className="h-8 w-auto opacity-60 hover:opacity-100 transition-opacity rounded grayscale hover:grayscale-0" />
              <img src={nuformaLogo} alt="Nuforma" className="h-8 w-auto opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
              <img src={equesoulLogo} alt="Equesoul" className="h-8 w-auto opacity-60 hover:opacity-100 transition-opacity rounded grayscale hover:grayscale-0" />
              <img src={leisureExpertsLogo} alt="The Leisure Experts" className="h-8 w-auto opacity-60 hover:opacity-100 transition-opacity rounded grayscale hover:grayscale-0" />
              <img src={awakeLogo} alt="Awake Meditation" className="h-8 w-auto opacity-60 hover:opacity-100 transition-opacity rounded grayscale hover:grayscale-0" />
            </div>
            <p className="text-sm text-muted-foreground">
              Trusted by wellness operators across the UK
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroNew;
