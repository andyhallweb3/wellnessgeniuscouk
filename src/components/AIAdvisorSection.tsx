import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Mic, Sparkles, Coins, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ADVISOR_MODES } from "@/components/advisor/AdvisorModes";

const AIAdvisorSection = () => {
  const { user } = useAuth();
  const featuredModes = ADVISOR_MODES.slice(0, 4);

  return (
    <section className="section-padding bg-gradient-to-b from-card to-background">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium mb-6">
              <Brain size={12} />
              AI-Powered
            </div>
            
            <h2 className="text-3xl lg:text-4xl xl:text-5xl tracking-tight mb-4">
              Your AI business advisor.{" "}
              <span className="text-accent">On demand.</span>
            </h2>
            
            <p className="text-muted-foreground text-lg mb-8">
              Strategic guidance for wellness operators. Stress-test decisions, get board-ready analysis, and build 90-day action plans — in minutes, not weeks.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Mic size={16} className="text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Voice Mode</p>
                  <p className="text-xs text-muted-foreground">Talk hands-free</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Sparkles size={16} className="text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Business Memory</p>
                  <p className="text-xs text-muted-foreground">Remembers your context</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <MessageSquare size={16} className="text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">8 Expert Modes</p>
                  <p className="text-xs text-muted-foreground">From quick Q&A to planning</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Coins size={16} className="text-orange-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Pay As You Go</p>
                  <p className="text-xs text-muted-foreground">No subscription needed</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="accent" size="lg" asChild>
                <Link to={user ? "/genie" : "/auth?redirect=/genie"}>
                  <Brain size={18} />
                  Try Free (10 credits)
                  <ArrowRight size={16} />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right - Mode Cards */}
          <div className="grid grid-cols-2 gap-3">
            {featuredModes.map((mode) => (
              <Link
                key={mode.id}
                to={user ? `/genie?mode=${mode.id}` : `/auth?redirect=/genie?mode=${mode.id}`}
                className="group p-4 rounded-xl bg-background border border-border hover:border-accent/50 transition-all hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{mode.icon}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                    {mode.creditCost} credits
                  </span>
                </div>
                <h3 className="font-medium text-sm mb-1 group-hover:text-accent transition-colors">
                  {mode.name}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {mode.tagline}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIAdvisorSection;
