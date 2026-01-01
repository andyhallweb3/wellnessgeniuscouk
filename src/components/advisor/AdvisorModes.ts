// AI Advisor Modes: Unified modes merging Coach + Genie capabilities
// Usage-based pricing with credit costs per conversation

export interface AdvisorMode {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  description: string;
  creditCost: number;
  category: "daily" | "strategic" | "planning";
  examples: string[];
}

export const ADVISOR_MODES: AdvisorMode[] = [
  // Daily Operations
  {
    id: "daily_briefing",
    name: "Daily Briefing",
    icon: "BarChart3",
    tagline: "What do I need to know today?",
    description: "Quick business check-in. Flags risks, opportunities, and what needs attention now.",
    creditCost: 2,
    category: "daily",
    examples: [
      "What should I focus on today?",
      "Any risks I should know about?",
      "Quick status check",
    ],
  },
  {
    id: "quick_question",
    name: "Quick Question",
    icon: "MessageCircle",
    tagline: "Simple answers, fast",
    description: "Simple questions and clarifications without deep analysis.",
    creditCost: 1,
    category: "daily",
    examples: [
      "What metrics should I track?",
      "How do I calculate retention rate?",
      "Explain this industry term",
    ],
  },

  // Strategic Thinking
  {
    id: "decision_support",
    name: "Decision Support",
    icon: "Brain",
    tagline: "Stress-test my thinking",
    description: "Challenges assumptions, surfaces trade-offs, and stress-tests decisions before you commit.",
    creditCost: 4,
    category: "strategic",
    examples: [
      "Should we build in-house or partner?",
      "I'm thinking of raising prices. What could go wrong?",
      "We want to add AI coaching. Am I ready?",
    ],
  },
  {
    id: "diagnostic",
    name: "Diagnostic Mode",
    icon: "Search",
    tagline: "What am I missing?",
    description: "Surface weak assumptions, missing inputs, and hidden risks in your thinking.",
    creditCost: 3,
    category: "strategic",
    examples: [
      "Why isn't our engagement converting?",
      "What's blocking our growth?",
      "Analyse our retention problem",
    ],
  },
  {
    id: "commercial_lens",
    name: "Commercial Lens",
    icon: "TrendingUp",
    tagline: "Show me the money",
    description: "Translate ideas into financial implications, ROI, and risk analysis.",
    creditCost: 4,
    category: "strategic",
    examples: [
      "What's the ROI of this AI feature?",
      "Is this investment worth it?",
      "Model the revenue impact",
    ],
  },
  {
    id: "board_mode",
    name: "Board / Investor Mode",
    icon: "Briefcase",
    tagline: "Explain without excuses",
    description: "CFO-ready language. Conservative numbers. What you'll be challenged on.",
    creditCost: 4,
    category: "strategic",
    examples: [
      "Summarise this quarter in board language",
      "What will investors challenge me on?",
      "How do I explain the retention dip?",
    ],
  },

  // Planning & Building
  {
    id: "weekly_review",
    name: "Weekly Review",
    icon: "Calendar",
    tagline: "What changed? What matters?",
    description: "Compares this week to last. Identifies trends, anomalies, and drift from plan.",
    creditCost: 3,
    category: "planning",
    examples: [
      "What's different this week vs last?",
      "What trends should I be watching?",
      "Where are we drifting from plan?",
    ],
  },
  {
    id: "build_mode",
    name: "90-Day Builder",
    icon: "Wrench",
    tagline: "What should we build next?",
    description: "Prioritised action plan. What to do, what NOT to do, and in what order.",
    creditCost: 5,
    category: "planning",
    examples: [
      "Create a 90-day retention improvement plan",
      "What should I build first to monetise better?",
      "Prioritise my tech investment for next quarter",
    ],
  },
];

export const getModeById = (id: string): AdvisorMode => {
  return ADVISOR_MODES.find((m) => m.id === id) || ADVISOR_MODES[0];
};

export const getModesByCategory = (category: AdvisorMode["category"]): AdvisorMode[] => {
  return ADVISOR_MODES.filter((m) => m.category === category);
};

// Credit pack pricing for usage-based model
export interface CreditPack {
  id: string;
  credits: number;
  price: number; // GBP
  savings?: string;
  popular?: boolean;
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: "starter",
    credits: 25,
    price: 9,
  },
  {
    id: "growth",
    credits: 75,
    price: 19,
    savings: "Save 24%",
    popular: true,
  },
  {
    id: "scale",
    credits: 200,
    price: 39,
    savings: "Save 46%",
  },
];
