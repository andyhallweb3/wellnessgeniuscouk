import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Copy, Check, BookOpen, X } from "lucide-react";
import { toast } from "sonner";

interface PromptTemplate {
  id: string;
  title: string;
  category: string;
  prompt: string;
  description: string;
}

const COACH_PROMPTS: PromptTemplate[] = [
  // Retention & Engagement
  {
    id: "retention-diagnostic",
    title: "Retention Diagnostic",
    category: "Retention",
    description: "Identify why members are leaving",
    prompt: "Our member retention has dropped. Help me diagnose why members might be disengaging. We are seeing [describe symptoms].",
  },
  {
    id: "engagement-strategy",
    title: "Engagement Strategy",
    category: "Retention",
    description: "Build a member engagement plan",
    prompt: "I want to increase member engagement without discounting. Currently our members [describe current engagement]. What strategies should I consider?",
  },
  {
    id: "churn-prevention",
    title: "Churn Prevention",
    category: "Retention",
    description: "Stop members from cancelling",
    prompt: "Members typically cancel after [timeframe]. What early warning signs should I look for and what interventions might help?",
  },

  // Monetisation
  {
    id: "pricing-review",
    title: "Pricing Review",
    category: "Monetisation",
    description: "Evaluate your pricing strategy",
    prompt: "We currently charge [price] for [service]. Our competitors charge [competitor pricing]. Should we adjust our pricing and how?",
  },
  {
    id: "upsell-strategy",
    title: "Upsell Strategy",
    category: "Monetisation",
    description: "Increase revenue per member",
    prompt: "Our average revenue per member is [amount]. What upsell or cross-sell opportunities should I explore without damaging the member experience?",
  },
  {
    id: "new-revenue-stream",
    title: "New Revenue Stream",
    category: "Monetisation",
    description: "Explore new income sources",
    prompt: "I want to add a new revenue stream to my wellness business. Currently we offer [current services]. What options would be realistic given my resources?",
  },

  // AI Implementation
  {
    id: "ai-readiness-check",
    title: "AI Readiness Check",
    category: "AI",
    description: "Assess if you are ready for AI",
    prompt: "I want to implement AI in my business. Before I start, help me assess whether we are actually ready. Our current data and tech situation is [describe].",
  },
  {
    id: "ai-use-case",
    title: "AI Use Case Validation",
    category: "AI",
    description: "Validate an AI idea",
    prompt: "I am considering using AI for [specific use case]. Is this a good idea for a wellness business like mine? What should I consider?",
  },
  {
    id: "ai-first-steps",
    title: "AI First Steps",
    category: "AI",
    description: "Start your AI journey",
    prompt: "I am new to AI but want to start somewhere practical. Given my business type and resources, what would be a sensible first AI project?",
  },

  // Commercial Strategy
  {
    id: "competitor-analysis",
    title: "Competitor Analysis",
    category: "Strategy",
    description: "Understand your market position",
    prompt: "My main competitors are [list competitors]. How should I differentiate my wellness business and what should I avoid copying?",
  },
  {
    id: "growth-priorities",
    title: "Growth Priorities",
    category: "Strategy",
    description: "Focus on what matters",
    prompt: "I have limited resources and need to prioritise. Should I focus on [option A] or [option B] for growth right now?",
  },
  {
    id: "partnership-evaluation",
    title: "Partnership Evaluation",
    category: "Strategy",
    description: "Assess a partnership opportunity",
    prompt: "I have been approached about a partnership with [type of partner]. Help me evaluate if this is worth pursuing.",
  },

  // Operations
  {
    id: "efficiency-audit",
    title: "Efficiency Audit",
    category: "Operations",
    description: "Find operational improvements",
    prompt: "I spend too much time on [describe inefficiencies]. What should I automate, delegate, or eliminate?",
  },
  {
    id: "team-structure",
    title: "Team Structure",
    category: "Operations",
    description: "Optimise your team",
    prompt: "My team of [size] handles [responsibilities]. Are we structured effectively or should I reorganise?",
  },
  {
    id: "tech-stack-review",
    title: "Tech Stack Review",
    category: "Operations",
    description: "Evaluate your technology",
    prompt: "We currently use [list tools]. Is this the right tech stack for a wellness business our size? What should I consolidate or add?",
  },

  // Risk & Compliance
  {
    id: "data-privacy",
    title: "Data Privacy Check",
    category: "Risk",
    description: "Review your data practices",
    prompt: "We collect [types of data] from members. Are there privacy or compliance risks I should address?",
  },
  {
    id: "trust-risk",
    title: "Trust Risk Assessment",
    category: "Risk",
    description: "Protect your reputation",
    prompt: "We are considering [new initiative]. Could this damage member trust? What safeguards should I put in place?",
  },

  // Planning
  {
    id: "quarterly-planning",
    title: "Quarterly Planning",
    category: "Planning",
    description: "Plan the next 90 days",
    prompt: "Help me plan the next quarter. My key goals are [list goals]. What should I focus on and what should I explicitly avoid?",
  },
  {
    id: "launch-planning",
    title: "Launch Planning",
    category: "Planning",
    description: "Plan a new launch",
    prompt: "I am launching [new service/feature]. Help me plan a realistic launch that does not overstretch my resources.",
  },
  {
    id: "budget-allocation",
    title: "Budget Allocation",
    category: "Planning",
    description: "Allocate resources wisely",
    prompt: "I have [budget amount] to invest this quarter. How should I allocate it across [list areas] for maximum impact?",
  },
];

const CATEGORIES = [...new Set(COACH_PROMPTS.map((p) => p.category))];

interface CoachPromptLibraryProps {
  onSelectPrompt: (prompt: string) => void;
  onClose: () => void;
}

const CoachPromptLibrary = ({ onSelectPrompt, onClose }: CoachPromptLibraryProps) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredPrompts = COACH_PROMPTS.filter((p) => {
    const matchesSearch =
      search === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.prompt.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUsePrompt = (prompt: PromptTemplate) => {
    onSelectPrompt(prompt.prompt);
    toast.success("Prompt added to input");
  };

  const handleCopyPrompt = async (prompt: PromptTemplate) => {
    await navigator.clipboard.writeText(prompt.prompt);
    setCopiedId(prompt.id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-4 md:inset-10 lg:inset-20 bg-card rounded-2xl border border-border shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-border shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-accent/10">
                <BookOpen size={20} className="text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-heading">Prompt Library</h2>
                <p className="text-sm text-muted-foreground">Pre-written prompts to get you started</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search prompts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === null ? "accent" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "accent" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Prompts Grid */}
        <ScrollArea className="flex-1 p-4 md:p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPrompts.map((prompt) => (
              <div
                key={prompt.id}
                className="rounded-xl border border-border bg-secondary/50 p-4 hover:border-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xs font-medium text-accent">{prompt.category}</span>
                    <h3 className="font-medium text-sm mt-1">{prompt.title}</h3>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{prompt.description}</p>
                <p className="text-xs bg-background rounded-lg p-3 mb-3 line-clamp-3">
                  {prompt.prompt}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="accent"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleUsePrompt(prompt)}
                  >
                    Use Prompt
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyPrompt(prompt)}
                  >
                    {copiedId === prompt.id ? <Check size={14} /> : <Copy size={14} />}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredPrompts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No prompts match your search.</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default CoachPromptLibrary;