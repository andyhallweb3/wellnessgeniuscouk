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
    id: "weekly_review",
    name: "Weekly Review",
    icon: "📈",
    tagline: "What changed? What matters?",
    description: "Compares this week to last. Identifies trends, anomalies, and what's drifting.",
    creditCost: 3,
    responseStyle: "structured",
    examples: [
      "What's different this week vs last?",
      "What trends should I be watching?",
      "Where are we drifting from plan?",
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
    name: "Board / Investor Mode",
    icon: "👔",
    tagline: "Explain performance without excuses.",
    description: "CFO-ready language. Conservative numbers. What you'll be challenged on.",
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
];

export const getModeById = (id: string): GenieMode => {
  return GENIE_MODES.find((m) => m.id === id) || GENIE_MODES[0];
};
