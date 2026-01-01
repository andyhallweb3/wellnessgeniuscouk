import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Mic, Sparkles, Coins, MessageSquare, BarChart3, MessageCircle, Search, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ADVISOR_MODES } from "@/components/advisor/AdvisorModes";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Map icon names to components
const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  BarChart3,
  MessageCircle,
  Brain,
  Search,
};

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
              AI-Powered Business Advisor
            </div>
            
            <h2 className="text-3xl lg:text-4xl xl:text-5xl tracking-tight mb-4">
              Ask anything about your{" "}
              <span className="text-accent">wellness business.</span>
            </h2>
            
            <p className="text-muted-foreground text-lg mb-8">
              "Should I raise prices?" "Why is retention dropping?" "What should I focus on this quarter?" 
              Get strategic answers in 60 seconds, not 6 weeks.
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

            <div className="flex flex-wrap items-center gap-3">
              <Button variant="accent" size="lg" asChild>
                <Link to="/advisor">
                  <Brain size={18} />
                  Learn More
                  <ArrowRight size={16} />
                </Link>
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Info size={14} />
                    What can I do with 10 credits?
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-popover border border-border">
                  <p className="text-sm">
                    <strong>10 credits gets you:</strong>
                    <br />
                    • 10 quick questions (1 credit each)
                    <br />
                    • 5 daily briefings (2 credits each)
                    <br />
                    • 2 deep decision analyses (4-5 credits each)
                    <br />
                    <span className="text-muted-foreground">Mix and match as needed.</span>
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Right - Mode Cards */}
          <div className="grid grid-cols-2 gap-3">
            {featuredModes.map((mode) => {
              const IconComponent = iconMap[mode.icon] || Brain;
              return (
                <Link
                  key={mode.id}
                  to="/advisor"
                  className="group p-4 rounded-xl bg-background border border-border hover:border-accent/50 transition-all hover:shadow-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <IconComponent size={20} className="text-accent" />
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      {mode.creditCost} credit{mode.creditCost > 1 ? "s" : ""}
                    </span>
                  </div>
                  <h3 className="font-medium text-sm mb-1 group-hover:text-accent transition-colors">
                    {mode.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {mode.tagline}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIAdvisorSection;
