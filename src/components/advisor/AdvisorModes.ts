// AI Advisor Modes: Unified modes merging Coach + Genie capabilities
// Simple pricing: 1 credit per message, any mode

export interface AdvisorMode {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  description: string;
  creditCost: number; // All modes now cost 1 credit
  category: "daily" | "strategic" | "planning";
  examples: string[];
}

// Universal credit cost - simple and fair
export const CREDIT_COST_PER_MESSAGE = 1;

export const ADVISOR_MODES: AdvisorMode[] = [
  // Daily Operations
  {
    id: "daily_briefing",
    name: "Daily Briefing",
    icon: "BarChart3",
    tagline: "What do I need to know today?",
    description: "Quick business check-in. Flags risks, opportunities, and what needs attention now.",
    creditCost: CREDIT_COST_PER_MESSAGE,
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
    creditCost: CREDIT_COST_PER_MESSAGE,
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
    creditCost: CREDIT_COST_PER_MESSAGE,
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
    creditCost: CREDIT_COST_PER_MESSAGE,
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
    creditCost: CREDIT_COST_PER_MESSAGE,
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
    creditCost: CREDIT_COST_PER_MESSAGE,
    category: "strategic",
    examples: [
      "Summarise this quarter in board language",
      "What will investors challenge me on?",
      "How do I explain the retention dip?",
    ],
  },

  {
    id: "competitor_scan",
    name: "Competitor Scan",
    icon: "Globe",
    tagline: "Who's winning and why?",
    description: "Web research on competitors. Find gaps, risks, and differentiation opportunities.",
    creditCost: CREDIT_COST_PER_MESSAGE,
    category: "strategic",
    examples: [
      "Research my main competitors in [city/niche]",
      "What are other wellness studios doing with AI?",
      "Analyse [competitor name] - what are they doing well?",
    ],
  },

  // Planning & Building
  {
    id: "weekly_review",
    name: "Weekly Review",
    icon: "Calendar",
    tagline: "What changed? What matters?",
    description: "Compares this week to last. Identifies trends, anomalies, and drift from plan.",
    creditCost: CREDIT_COST_PER_MESSAGE,
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
    creditCost: CREDIT_COST_PER_MESSAGE,
    category: "planning",
    examples: [
      "Create a 90-day retention improvement plan",
      "What should I build first to monetise better?",
      "Prioritise my tech investment for next quarter",
    ],
  },
  {
    id: "market_research",
    name: "Market Research",
    icon: "Search",
    tagline: "What's happening in wellness?",
    description: "Web research on market trends, news, and industry developments.",
    creditCost: CREDIT_COST_PER_MESSAGE,
    category: "planning",
    examples: [
      "What's new in wellness tech this month?",
      "Research trends in boutique fitness 2025",
      "What are the latest wellness industry statistics?",
    ],
  },
];

export const getModeById = (id: string): AdvisorMode => {
  return ADVISOR_MODES.find((m) => m.id === id) || ADVISOR_MODES[0];
};

export const getModesByCategory = (category: AdvisorMode["category"]): AdvisorMode[] => {
  return ADVISOR_MODES.filter((m) => m.category === category);
};

// Modes that use web research
export const WEB_RESEARCH_MODES = ["competitor_scan", "market_research"];

// Credit pack pricing - better value with simpler pricing
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
    credits: 50,
    price: 9,
  },
  {
    id: "growth",
    credits: 150,
    price: 19,
    savings: "Save 30%",
    popular: true,
  },
  {
    id: "scale",
    credits: 500,
    price: 49,
    savings: "Save 46%",
  },
];

// Free trial configuration
export const FREE_TRIAL_DAYS = 15;
export const FREE_TRIAL_CREDITS = 25; // Generous trial to let users experience value
