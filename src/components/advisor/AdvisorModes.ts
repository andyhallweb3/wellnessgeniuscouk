// AI Advisor Modes: Unified modes with structured output templates
// Simple pricing: 1 credit per message, any mode

export interface AdvisorMode {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  description: string;
  creditCost: number;
  category: "primary" | "daily" | "strategic" | "planning";
  outputTemplate: string[];
  examples: string[];
}

// Universal credit cost - simple and fair
export const CREDIT_COST_PER_MESSAGE = 1;

export const ADVISOR_MODES: AdvisorMode[] = [
  // Primary Modes (new spec)
  {
    id: "diagnose",
    name: "Diagnose",
    icon: "Search",
    tagline: "Surface gaps and risks",
    description: "AI Readiness assessment, weak assumptions, and hidden risks.",
    creditCost: CREDIT_COST_PER_MESSAGE,
    category: "primary",
    outputTemplate: [
      "Current situation summary",
      "AI Readiness band + implications",
      "Top 3 bottlenecks",
      "Risks if unchanged",
      "30/60/90 fixes",
    ],
    examples: [
      "Diagnose our AI readiness",
      "What's blocking our growth?",
      "Analyse our retention problem",
    ],
  },
  {
    id: "plan",
    name: "Plan",
    icon: "ClipboardList",
    tagline: "Strategy + execution",
    description: "Create a prioritised action plan with clear trade-offs.",
    creditCost: CREDIT_COST_PER_MESSAGE,
    category: "primary",
    outputTemplate: [
      "3 approaches with trade-offs",
      "Recommended approach",
      "Execution plan (30/60/90)",
      "Metrics to track",
      "What NOT to do",
    ],
    examples: [
      "Create a 90-day retention improvement plan",
      "Plan our AI adoption roadmap",
      "Strategy for member engagement",
    ],
  },
  {
    id: "compare",
    name: "Compare",
    icon: "Scale",
    tagline: "Options analysis",
    description: "Compare competitors, tools, or options with clear matrices.",
    creditCost: CREDIT_COST_PER_MESSAGE,
    category: "primary",
    outputTemplate: [
      "Snapshot table",
      "Functional comparison matrix",
      "Strengths/weaknesses per option",
      "Recommendation by constraints",
      "Procurement/pilot checklist",
    ],
    examples: [
      "Compare CRM options for our size",
      "Analyse our main competitors",
      "Compare build vs buy for AI",
    ],
  },
  {
    id: "operate",
    name: "Operate",
    icon: "Settings",
    tagline: "Weekly co-pilot",
    description: "This week's focus, risks, and experiments to run.",
    creditCost: CREDIT_COST_PER_MESSAGE,
    category: "primary",
    outputTemplate: [
      "This week's focus (1-3 actions)",
      "Risks spotted",
      "Experiment to run",
      "KPI updates requested",
      "Operator insight from intelligence feed",
    ],
    examples: [
      "What should I focus on this week?",
      "Quick operational check-in",
      "What experiments should we run?",
    ],
  },

  // Daily Operations
  {
    id: "daily_briefing",
    name: "Daily Briefing",
    icon: "BarChart3",
    tagline: "What do I need to know today?",
    description: "Quick business check-in. Flags risks, opportunities, and what needs attention now.",
    creditCost: CREDIT_COST_PER_MESSAGE,
    category: "daily",
    outputTemplate: [],
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
    outputTemplate: [],
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
    outputTemplate: [],
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
    outputTemplate: [],
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
    outputTemplate: [],
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
    outputTemplate: [],
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
    outputTemplate: [],
    examples: [
      "Research my main competitors in [city/niche]",
      "What are other wellness studios doing with AI?",
      "Analyse [competitor name] - what are they doing well?",
    ],
  },

  // Content Creation
  {
    id: "content_writer",
    name: "Content Writer",
    icon: "PenLine",
    tagline: "Draft content in your voice",
    description: "Create blog posts, LinkedIn posts, newsletters, and thought leadership using your brand voice and the C.L.E.A.R framework.",
    creditCost: CREDIT_COST_PER_MESSAGE,
    category: "planning",
    outputTemplate: [
      "Content type and audience",
      "Draft content",
      "SEO/engagement notes",
      "Distribution suggestions",
    ],
    examples: [
      "Write a LinkedIn post about AI in wellness",
      "Draft a blog post on member retention",
      "Create a newsletter intro for this week's news",
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
    outputTemplate: [],
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
    outputTemplate: [],
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
    outputTemplate: [],
    examples: [
      "What's new in wellness tech this month?",
      "Research trends in boutique fitness 2025",
      "What are the latest wellness industry statistics?",
    ],
  },
];

// Get primary modes (new UI)
export const getPrimaryModes = (): AdvisorMode[] => {
  return ADVISOR_MODES.filter((m) => m.category === "primary");
};

export const getModeById = (id: string): AdvisorMode => {
  return ADVISOR_MODES.find((m) => m.id === id) || ADVISOR_MODES[1]; // Default to Plan
};

export const getModesByCategory = (category: AdvisorMode["category"]): AdvisorMode[] => {
  return ADVISOR_MODES.filter((m) => m.category === category);
};

// Modes that use web research
export const WEB_RESEARCH_MODES = ["competitor_scan", "market_research", "compare"];

// Premium modes that require subscription (not available on free trial)
export const PREMIUM_MODES = ["competitor_scan"];

// Get system prompt with mode-specific output template
export const getModeSystemPrompt = (mode: AdvisorMode, workspaceContext: string, kbContext: string): string => {
  const basePrompt = `You are the Wellness Genius Advisor, a specialist AI for wellness business operators.

## Core Rules (Constitution)
1. Execution over theory: Every response ends with next actions.
2. Constraints-first: Ask for constraints only when missing; otherwise assume sensible defaults and state them.
3. No hallucinations: If information is unknown, say so and propose how to find it.
4. Evidence-aware: Use knowledge base sources; label what's fact vs inference.
5. Professional tone: British English, concise, no emojis in responses.
6. Mode-based outputs: Use structured templates based on the user's intent.

## Safety & Compliance
- No medical advice or diagnosis claims
- No invented numbers or benchmarks
- Cite sources for external claims when available
- Encourage professional review for legal/compliance topics

## Business Context
${workspaceContext || "No workspace context available yet."}

## Knowledge Base
${kbContext || "No specific knowledge base entries matched."}`;

  const modePrompts: Record<string, string> = {
    diagnose: `
## Mode: Diagnose
You are diagnosing the user's business readiness and gaps.

### Output Structure (Required)
1. **Current Situation Summary** - Based on workspace context
2. **AI Readiness Band + Implications** - What their score means
3. **Top 3 Bottlenecks** - Specific, actionable issues
4. **Risks if Unchanged** - What happens if they do nothing
5. **30/60/90 Fixes** - Sequenced recommendations

End with: "Would you like to save this diagnosis as a decision?"`,

    plan: `
## Mode: Plan
You are helping create a strategic execution plan.

### Output Structure (Required)
1. **3 Approaches** - Each with trade-offs and confidence level
2. **Recommended Approach** - With clear rationale
3. **Execution Plan** - 30/60/90 day breakdown
4. **Metrics to Track** - Specific KPIs
5. **What NOT to Do** - Common mistakes to avoid

End with: "Would you like to save this plan as a decision?"`,

    compare: `
## Mode: Compare
You are comparing options, competitors, or tools.

### Output Structure (Required)
1. **Snapshot Table** - Key options with links if available
2. **Functional Comparison Matrix** - Feature-by-feature comparison
3. **Strengths/Weaknesses** - Per option analysis
4. **Recommendation by Constraints** - Based on user's situation
5. **Procurement/Pilot Checklist** - Next steps to evaluate

End with: "Would you like to save this comparison as a decision?"`,

    operate: `
## Mode: Operate
You are acting as a weekly operator co-pilot.

### Output Structure (Required)
1. **This Week's Focus** - 1-3 priority actions
2. **Risks Spotted** - Issues to watch
3. **Experiment to Run** - One small test
4. **KPI Updates Requested** - What metrics to check
5. **Operator Insight** - One intelligence nugget from industry

End with: "Would you like to save any of these as goals or decisions?"`,
  };

  const modeSpecificPrompt = modePrompts[mode.id] || "";
  
  return basePrompt + modeSpecificPrompt;
};

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
export const FREE_TRIAL_DAYS = 14;
export const FREE_TRIAL_CREDITS = 10; // Focused trial to demonstrate value
