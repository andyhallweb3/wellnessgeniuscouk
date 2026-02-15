// Genie Modes: 5 distinct operational modes for the business AI
// Each mode has different behavior, tone, and response structure

export interface GenieMode {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  description: string;
  creditCost: number;
  responseStyle: "brief" | "detailed" | "structured";
  examples: string[];
}

export const GENIE_MODES: GenieMode[] = [
  {
    id: "daily_operator",
    name: "Daily Operator",
    icon: "📊",
    tagline: "What do I need to know today?",
    description: "Quick business briefing. Flags risks, opportunities, and what needs attention now.",
    creditCost: 2,
    responseStyle: "brief",
    examples: [
      "What should I be paying attention to today?",
      "Any risks I should know about?",
      "Quick check on where things stand",
    ],
  },
  {
    id: "competitor_scan",
    name: "Competitor Scan",
    icon: "🔍",
    tagline: "Who's winning and why?",
    description: "Analyse competitors and comparables. Find gaps, risks, and differentiation opportunities.",
    creditCost: 4,
    responseStyle: "structured",
    examples: [
      "Who are my main competitors and what are they doing?",
      "How should I position against [competitor]?",
      "What's the competitive landscape for AI coaching?",
    ],
  },
  {
    id: "weekly_briefing",
    name: "Market Briefing",
    icon: "📰",
    tagline: "What happened this week in wellness?",
    description: "Weekly intelligence on funding, launches, regulation, and market shifts.",
    creditCost: 4,
    responseStyle: "structured",
    examples: [
      "What's new in wellness tech this week?",
      "Any funding or M&A I should know about?",
      "What regulatory changes are coming?",
    ],
  },
  {
    id: "decision_support",
    name: "Decision Support",
    icon: "🧠",
    tagline: "I'm considering X. Stress-test it.",
    description: "Challenges assumptions, surfaces trade-offs, and stress-tests decisions before you commit.",
    creditCost: 4,
    responseStyle: "detailed",
    examples: [
      "Should we build in-house or partner?",
      "I'm thinking of raising prices. What could go wrong?",
      "We want to add AI coaching. Am I ready?",
    ],
  },
  {
    id: "board_mode",
    name: "Board Mode",
    icon: "👔",
    tagline: "Board-ready. No fluff.",
    description: "CFO-ready language. Conservative numbers. Situation → Evidence → Options → Recommendation.",
    creditCost: 4,
    responseStyle: "structured",
    examples: [
      "Summarise this quarter in board language",
      "What will investors challenge me on?",
      "How do I explain the retention dip?",
    ],
  },
  {
    id: "build_mode",
    name: "Build Mode",
    icon: "🔧",
    tagline: "What should we fix or build next?",
    description: "Prioritised 90-day actions. What to do, what NOT to do, and in what order.",
    creditCost: 5,
    responseStyle: "structured",
    examples: [
      "Create a 90-day plan for improving retention",
      "What should I build first to monetise better?",
      "Prioritise my tech investment for next quarter",
    ],
  },
  {
    id: "codex_assistant",
    name: "Codex Assistant",
    icon: "✏️",
    tagline: "Sharpen my pages and content strategy.",
    description: "GPT-5-powered live guidance on page edits, copy, SEO, and content strategy. Powered by OpenAI.",
    creditCost: 4,
    responseStyle: "structured",
    examples: [
      "Review my landing page headline and CTA",
      "Plan a 30-day content calendar for LinkedIn",
      "How should I structure my pricing page?",
    ],
  },
];

export const getModeById = (id: string): GenieMode => {
  return GENIE_MODES.find((m) => m.id === id) || GENIE_MODES[0];
};
