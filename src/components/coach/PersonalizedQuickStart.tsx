import { useMemo } from "react";
import { Sparkles, Target, TrendingUp, Brain, Shield, Users, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CoachProfile {
  business_type: string | null;
  business_name: string | null;
  business_size_band: string | null;
  team_size: string | null;
  role: string | null;
  primary_goal: string | null;
  frustration: string | null;
  current_tech: string | null;
  ai_experience: string | null;
  biggest_win: string | null;
  decision_style: string | null;
}

interface PersonalizedQuickStartProps {
  profile: CoachProfile | null;
  onSelectPrompt: (prompt: string) => void;
  onSelectMode: (mode: string) => void;
}

interface QuickPrompt {
  id: string;
  icon: React.ReactNode;
  label: string;
  prompt: string;
  mode: string;
  color: string;
}

const PersonalizedQuickStart = ({ profile, onSelectPrompt, onSelectMode }: PersonalizedQuickStartProps) => {
  const personalizedPrompts = useMemo<QuickPrompt[]>(() => {
    if (!profile) return getDefaultPrompts();

    const prompts: QuickPrompt[] = [];
    const businessName = profile.business_name || "my business";
    const businessType = getBusinessTypeLabel(profile.business_type);

    // Based on primary goal
    switch (profile.primary_goal) {
      case "retention":
        prompts.push({
          id: "retention-diagnostic",
          icon: <Users size={18} />,
          label: "Diagnose retention issues",
          prompt: `What are the most common reasons ${businessType} businesses like ${businessName} lose members in the first 90 days?`,
          mode: "diagnostic",
          color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        });
        prompts.push({
          id: "retention-quick-win",
          icon: <Zap size={18} />,
          label: "Quick retention wins",
          prompt: `What are 3 low-effort, high-impact changes I can make this week to improve member retention at ${businessName}?`,
          mode: "general",
          color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
        });
        break;
      case "monetisation":
        prompts.push({
          id: "pricing-review",
          icon: <TrendingUp size={18} />,
          label: "Review pricing strategy",
          prompt: `Help me evaluate if ${businessName}'s pricing is optimized. What should a ${businessType} charge for premium services?`,
          mode: "commercial",
          color: "bg-green-500/10 text-green-600 dark:text-green-400",
        });
        prompts.push({
          id: "revenue-streams",
          icon: <Sparkles size={18} />,
          label: "New revenue ideas",
          prompt: `What additional revenue streams could a ${businessType} like ${businessName} add without significant investment?`,
          mode: "commercial",
          color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
        });
        break;
      case "ai":
        prompts.push({
          id: "ai-readiness",
          icon: <Brain size={18} />,
          label: "Check AI readiness",
          prompt: `Is ${businessName} ready to implement AI personalisation? What foundations do we need first?`,
          mode: "foundations",
          color: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
        });
        prompts.push({
          id: "ai-quick-wins",
          icon: <Zap size={18} />,
          label: "AI quick wins",
          prompt: `What are the easiest AI implementations for a ${businessType} that would have immediate member impact?`,
          mode: "general",
          color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
        });
        break;
      case "risk":
        prompts.push({
          id: "risk-assessment",
          icon: <Shield size={18} />,
          label: "Risk assessment",
          prompt: `What are the biggest regulatory and compliance risks for a ${businessType} handling member health data?`,
          mode: "diagnostic",
          color: "bg-red-500/10 text-red-600 dark:text-red-400",
        });
        break;
      case "growth":
        prompts.push({
          id: "growth-strategy",
          icon: <TrendingUp size={18} />,
          label: "Growth strategy",
          prompt: `What are the most effective acquisition channels for a ${businessType} in ${profile.business_size_band === "startup" ? "early stage" : "growth phase"}?`,
          mode: "commercial",
          color: "bg-green-500/10 text-green-600 dark:text-green-400",
        });
        break;
      default:
        break;
    }

    // Based on frustration (if provided)
    if (profile.frustration && profile.frustration.length > 20) {
      prompts.push({
        id: "frustration-solve",
        icon: <Target size={18} />,
        label: "Address your challenge",
        prompt: `I'm struggling with this: "${profile.frustration.slice(0, 100)}${profile.frustration.length > 100 ? "..." : ""}". What's the root cause and how should I prioritize solving it?`,
        mode: "diagnostic",
        color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
      });
    }

    // Based on AI experience
    if (profile.ai_experience === "curious" || profile.ai_experience === "experimenting") {
      prompts.push({
        id: "ai-starter",
        icon: <Brain size={18} />,
        label: "AI starter guide",
        prompt: `I'm new to AI in wellness. What's the smartest first AI project for a ${businessType}?`,
        mode: "foundations",
        color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
      });
    }

    // Based on decision style
    if (profile.decision_style === "data") {
      prompts.push({
        id: "metrics-focus",
        icon: <TrendingUp size={18} />,
        label: "Key metrics to track",
        prompt: `What are the 5 most important metrics a ${businessType} should track weekly?`,
        mode: "general",
        color: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
      });
    }

    // 90-day plan based on role
    if (profile.role === "founder" || profile.role === "exec" || profile.role === "gm") {
      prompts.push({
        id: "quarterly-plan",
        icon: <Target size={18} />,
        label: "Build a 90-day plan",
        prompt: `Create a 90-day action plan for ${businessName} focused on ${getGoalLabel(profile.primary_goal)}.`,
        mode: "planner",
        color: "bg-accent/10 text-accent",
      });
    }

    // Ensure we have at least 4 prompts
    if (prompts.length < 4) {
      const defaults = getDefaultPrompts();
      const needed = 4 - prompts.length;
      for (let i = 0; i < needed && i < defaults.length; i++) {
        if (!prompts.find(p => p.id === defaults[i].id)) {
          prompts.push(defaults[i]);
        }
      }
    }

    return prompts.slice(0, 6);
  }, [profile]);

  const handlePromptClick = (prompt: QuickPrompt) => {
    onSelectMode(prompt.mode);
    setTimeout(() => onSelectPrompt(prompt.prompt), 100);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Sparkles size={14} className="text-accent" />
          Personalized for you
        </h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {personalizedPrompts.map((prompt) => (
          <button
            key={prompt.id}
            onClick={() => handlePromptClick(prompt)}
            className={cn(
              "group flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card hover:bg-secondary/50 transition-all text-left",
              "hover:border-accent/30 hover:shadow-sm"
            )}
          >
            <div className={cn("p-2 rounded-lg shrink-0", prompt.color)}>
              {prompt.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{prompt.label}</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {prompt.prompt.slice(0, 50)}...
              </p>
            </div>
            <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};

function getDefaultPrompts(): QuickPrompt[] {
  return [
    {
      id: "default-retention",
      icon: <Users size={18} />,
      label: "Improve retention",
      prompt: "What are the top 3 things I can do this month to improve member retention?",
      mode: "general",
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      id: "default-ai",
      icon: <Brain size={18} />,
      label: "Start with AI",
      prompt: "What's the smartest first AI project for a wellness business?",
      mode: "foundations",
      color: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    },
    {
      id: "default-revenue",
      icon: <TrendingUp size={18} />,
      label: "Boost revenue",
      prompt: "How can I increase revenue without raising prices or adding new services?",
      mode: "commercial",
      color: "bg-green-500/10 text-green-600 dark:text-green-400",
    },
    {
      id: "default-plan",
      icon: <Target size={18} />,
      label: "Create a plan",
      prompt: "Help me create a 90-day action plan for my wellness business.",
      mode: "planner",
      color: "bg-accent/10 text-accent",
    },
  ];
}

function getBusinessTypeLabel(type: string | null): string {
  const labels: Record<string, string> = {
    gym: "gym/fitness centre",
    app: "wellness app",
    hospitality: "spa/hospitality",
    corporate: "corporate wellness",
    studio: "boutique studio",
    platform: "wellness platform",
    coaching: "coaching/PT",
    retreat: "retreat/experience",
  };
  return labels[type || ""] || "wellness";
}

function getGoalLabel(goal: string | null): string {
  const labels: Record<string, string> = {
    retention: "improving retention",
    monetisation: "increasing revenue",
    ai: "implementing AI",
    risk: "managing risk",
    growth: "growing membership",
    product: "product development",
    operations: "operational efficiency",
    team: "team development",
  };
  return labels[goal || ""] || "business growth";
}

export default PersonalizedQuickStart;
