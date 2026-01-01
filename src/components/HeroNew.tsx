import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// Real customer logos - replace with actual logos
const customerLogos = [
  { name: "Nuforma", src: "/placeholder.svg" },
  { name: "Equesoul", src: "/placeholder.svg" },
  { name: "The Leisure Experts", src: "/placeholder.svg" },
  { name: "Awake Meditation", src: "/placeholder.svg" },
];

const HeroNew = () => {
  const { user } = useAuth();

  return (
    <section className="relative min-h-[85vh] flex items-center pt-20 lg:pt-0 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-accent/15 rounded-full blur-[120px] -z-10" />

      <div className="container-wide px-6 lg:px-12 py-12 lg:py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Client credibility chip */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-8 animate-fade-up">
            Used by Nuforma, Equesoul & The Leisure Experts
          </div>

          {/* Main Headline - Clear, specific */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl leading-[1.1] mb-6 animate-fade-up tracking-tight">
            Get answers to your wellness{" "}
            <br className="hidden sm:block" />
            business questions{" "}
            <span className="text-accent">in 60 seconds.</span>
          </h1>

          {/* Subheadline - Specific outcomes */}
          <p className="text-lg lg:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-up animation-delay-100">
            AI advisor trained on 10+ years of industry data. Ask about retention, pricing, 
            staffing, marketing — get strategic answers, not generic advice.
          </p>

          {/* Single Primary CTA */}
          <div className="flex flex-col items-center gap-4 mb-12 animate-fade-up animation-delay-200">
            <Button variant="accent" size="xl" asChild className="shadow-glow text-base px-8">
              <Link to={user ? "/genie" : "/auth?redirect=/genie"}>
                Try Free — No Card Required
                <ArrowRight size={18} />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              10 free credits • Answer your first question in 2 minutes
            </p>
          </div>

          {/* Sample Output Preview */}
          <div className="max-w-2xl mx-auto mb-12 animate-fade-up animation-delay-300">
            <div className="bg-card border border-border rounded-2xl p-6 text-left">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Sample Insight
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                <span className="text-foreground font-medium">You asked:</span> "Why is my January retention down 8% vs last year?"
              </p>
              <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                <p className="text-sm leading-relaxed">
                  <span className="font-semibold text-accent">3 likely causes based on your profile:</span>
                  <br /><br />
                  1. <strong>Onboarding gap</strong> — New members who joined in Dec had 40% fewer touchpoints than Oct joiners
                  <br />
                  2. <strong>Price sensitivity timing</strong> — Your Jan price increase hit the same week as competing studio's new member promo
                  <br />
                  3. <strong>Class schedule change</strong> — You cut 2 evening slots; 23% of churned members attended those specifically
                  <br /><br />
                  <span className="text-accent font-medium">Recommended action:</span> Reintroduce one evening class as a "limited run" and track attendance.
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-right">
                Generated in 47 seconds • Cost: 2 credits (£0.72)
              </p>
            </div>
          </div>

          {/* Customer Logos */}
          <div className="animate-fade-up animation-delay-400">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Used by operators at
            </p>
            <div className="flex items-center justify-center gap-8 opacity-60">
              {customerLogos.map((logo) => (
                <div key={logo.name} className="h-8 w-auto flex items-center">
                  <span className="text-sm font-medium text-muted-foreground">{logo.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroNew;