// Strategic AI Readiness Questions - Based on Head of AI Application Framework
// These questions expose the gap between AI ambition and AI readiness

export interface AssessmentQuestion {
  id: string;
  pillar: string;
  text: string;
  context: string;
  examples: string[];
  whyItMatters?: string;
}

export interface PillarInfo {
  id: string;
  name: string;
  shortName: string;
  description: string;
  insight: string;
  outputLabel: string;
}

// The 5 strategic pillars
export const PILLARS: PillarInfo[] = [
  {
    id: "transformation",
    name: "AI Transformation Readiness",
    shortName: "Transformation",
    description: "Where is AI creating real operational change — not pilots, not decks?",
    insight: "McKinsey: ~70% of AI programmes stall at pilot stage because ownership and prioritisation are unclear.",
    outputLabel: "Readiness Rating",
  },
  {
    id: "architecture",
    name: "AI Architecture Confidence",
    shortName: "Architecture",
    description: "Can your team explain the difference between LLMs, agents, and copilots without Googling?",
    insight: "Gartner: 40%+ of GenAI projects will be abandoned by 2027 due to poor architecture decisions.",
    outputLabel: "Stack Status",
  },
  {
    id: "governance",
    name: "AI Governance Reality Check",
    shortName: "Governance",
    description: "Has your leadership team agreed what AI should never be used for?",
    insight: "AI literacy is now a risk management function, not an innovation perk.",
    outputLabel: "Risk Exposure",
  },
  {
    id: "value",
    name: "AI Value Engine",
    shortName: "Value",
    description: "Which line on your P&L improves first if AI works?",
    insight: "BCG: Companies that tie AI directly to financial metrics are 2x more likely to scale successfully.",
    outputLabel: "ROI Clarity",
  },
  {
    id: "operating",
    name: "AI Operating Style",
    shortName: "Operating Style",
    description: "Do you treat AI as a tool, a team-mate, or a strategy?",
    insight: "AI advantage compounds. Slowly. Then suddenly.",
    outputLabel: "AI Maturity",
  },
];

// Full assessment questions (25 questions - 5 per pillar)
export const FULL_QUESTIONS: AssessmentQuestion[] = [
  // === AI Transformation Readiness (5) ===
  {
    id: "transformation_1",
    pillar: "AI Transformation Readiness",
    text: "AI is currently creating real operational change in our business — not just pilots or presentations.",
    context: "Most organisations fail at AI not because of models, but because they can't connect AI to outcomes, ownership, or money.",
    examples: [
      "Automated workflows saving measurable hours per week",
      "AI-driven decisions affecting revenue or costs",
      "Production systems, not proof-of-concepts",
    ],
    whyItMatters: "McKinsey shows ~70% of AI programmes stall at pilot stage because ownership and prioritisation are unclear.",
  },
  {
    id: "transformation_2",
    pillar: "AI Transformation Readiness",
    text: "There is clear ownership of AI decisions today — not 'everyone and no one'.",
    context: "AI requires someone accountable for decisions, outcomes, and investment.",
    examples: [
      "Named individual or team responsible for AI strategy",
      "Clear escalation path for AI-related decisions",
      "Budget authority sitting with the AI owner",
    ],
  },
  {
    id: "transformation_3",
    pillar: "AI Transformation Readiness",
    text: "We know which workflows would visibly break if AI was switched off tomorrow.",
    context: "AI dependency reveals where it's genuinely embedded vs just nice-to-have.",
    examples: [
      "Customer service processes relying on AI triage",
      "Scheduling or resource allocation using AI optimisation",
      "Content or reporting workflows with AI generation",
    ],
  },
  {
    id: "transformation_4",
    pillar: "AI Transformation Readiness",
    text: "We have a 12-24 month AI roadmap with clear milestones — not just aspirations.",
    context: "AI success compounds over time. A roadmap prevents reactive, disconnected projects.",
    examples: [
      "Documented phases: pilot → scale → optimise",
      "Dependencies between projects mapped out",
      "Quarterly review points built into the plan",
    ],
  },
  {
    id: "transformation_5",
    pillar: "AI Transformation Readiness",
    text: "We have identified 2-3 specific use cases where AI could deliver the highest ROI within 6 months.",
    context: "Focused pilots beat scattered experiments. Knowing your highest-value opportunities prevents wasted effort.",
    examples: [
      "Automated member win-back campaigns",
      "AI-powered enquiry handling",
      "Predictive maintenance or demand forecasting",
    ],
  },

  // === AI Architecture Confidence (5) ===
  {
    id: "architecture_1",
    pillar: "AI Architecture Confidence",
    text: "Our team can explain the difference between LLMs, agents, and copilots without Googling.",
    context: "Technical literacy prevents expensive mistakes and bad vendor choices.",
    examples: [
      "Understanding when to use RAG vs fine-tuning",
      "Knowing the difference between AI assistants and autonomous agents",
      "Awareness of model strengths and limitations",
    ],
    whyItMatters: "Gartner predicts over 40% of GenAI projects will be abandoned by 2027 due to poor architecture decisions.",
  },
  {
    id: "architecture_2",
    pillar: "AI Architecture Confidence",
    text: "We know where our knowledge actually lives — docs, Slack, CRM, PDFs, or people's heads.",
    context: "AI retrieval only works if you know where truth is stored and how to access it.",
    examples: [
      "Documented knowledge sources and their owners",
      "Audit of where institutional knowledge resides",
      "Clear understanding of data accessibility",
    ],
  },
  {
    id: "architecture_3",
    pillar: "AI Architecture Confidence",
    text: "We're building AI systems that retrieve truth rather than hallucinate confidence.",
    context: "Retrieval-augmented generation beats pure generation for business accuracy.",
    examples: [
      "Grounding AI responses in verified company data",
      "Citation and source tracking in AI outputs",
      "Fact-checking mechanisms in AI workflows",
    ],
  },
  {
    id: "architecture_4",
    pillar: "AI Architecture Confidence",
    text: "We have at least 12 months of clean, structured historical data for key business activities.",
    context: "AI learns from patterns in historical data. Quality data enables reliable predictions.",
    examples: [
      "Customer interaction records stored systematically",
      "Historical performance data cleanly categorised",
      "Consistent data collection over time",
    ],
  },
  {
    id: "architecture_5",
    pillar: "AI Architecture Confidence",
    text: "Our core systems are integrated and data flows automatically between them.",
    context: "Siloed systems create incomplete views and manual workarounds. Integration is the foundation.",
    examples: [
      "Booking syncs automatically with CRM",
      "Unified customer view across touchpoints",
      "APIs connecting key platforms",
    ],
  },

  // === AI Governance Reality Check (5) ===
  {
    id: "governance_1",
    pillar: "AI Governance Reality Check",
    text: "Our leadership team has agreed what AI should never be used for.",
    context: "Knowing your red lines prevents reputational damage and regulatory problems.",
    examples: [
      "Documented AI ethics policy or principles",
      "Clear boundaries on autonomous decision-making",
      "Agreement on high-risk use case restrictions",
    ],
    whyItMatters: "Regulation (EU AI Act, UK ICO guidance) isn't theoretical anymore. AI literacy is now a risk management function.",
  },
  {
    id: "governance_2",
    pillar: "AI Governance Reality Check",
    text: "We know who signs off when AI makes a bad call — legally and reputationally.",
    context: "AI accountability must be assigned before something goes wrong.",
    examples: [
      "Named person responsible for AI outcomes",
      "Escalation process for AI errors",
      "Legal review of AI decision-making liability",
    ],
  },
  {
    id: "governance_3",
    pillar: "AI Governance Reality Check",
    text: "Our people have been trained to challenge AI, not worship it.",
    context: "Healthy scepticism prevents blind trust and catches AI mistakes early.",
    examples: [
      "Staff know when to override AI recommendations",
      "Culture of questioning AI outputs",
      "Training on AI limitations and failure modes",
    ],
  },
  {
    id: "governance_4",
    pillar: "AI Governance Reality Check",
    text: "We have documented policies for data privacy, GDPR compliance, and responsible AI use.",
    context: "Clear policies protect your business, customers, and reputation.",
    examples: [
      "Written data protection policy reviewed recently",
      "Staff trained on data handling requirements",
      "Clear consent mechanisms in place",
    ],
  },
  {
    id: "governance_5",
    pillar: "AI Governance Reality Check",
    text: "We maintain human oversight for AI-assisted decisions that affect customers or staff.",
    context: "AI should support decisions, not make them invisibly. Humans remain accountable.",
    examples: [
      "Staff review AI recommendations before action",
      "Escalation paths when AI makes errors",
      "Regular audits of AI-driven outcomes",
    ],
  },

  // === AI Value Engine (5) ===
  {
    id: "value_1",
    pillar: "AI Value Engine",
    text: "We know which line on our P&L improves first if AI works.",
    context: "AI should be tied to specific financial outcomes, not vague 'efficiency' claims.",
    examples: [
      "Revenue line item AI is targeting",
      "Cost category expected to reduce",
      "Margin improvement projected",
    ],
    whyItMatters: "BCG data shows companies that tie AI directly to financial metrics are 2x more likely to scale successfully.",
  },
  {
    id: "value_2",
    pillar: "AI Value Engine",
    text: "We know what cost disappears if AI adoption is successful.",
    context: "Clear cost targets make ROI measurable and investment justifiable.",
    examples: [
      "Admin hours to be automated",
      "Vendor costs to be reduced",
      "Error-related costs to be eliminated",
    ],
  },
  {
    id: "value_3",
    pillar: "AI Value Engine",
    text: "If AI doesn't pay back in 6-12 months, we would kill the project.",
    context: "Discipline to cut losses prevents AI theatre and forces real value creation.",
    examples: [
      "Clear go/no-go criteria defined upfront",
      "Regular value reviews scheduled",
      "Willingness to stop non-performing initiatives",
    ],
  },
  {
    id: "value_4",
    pillar: "AI Value Engine",
    text: "We have defined success metrics (KPIs) for measuring AI project outcomes.",
    context: "Without clear metrics, you can't prove value or secure future investment.",
    examples: [
      "Time saved per week in admin hours",
      "Conversion rate improvement targets",
      "Customer satisfaction score changes",
    ],
  },
  {
    id: "value_5",
    pillar: "AI Value Engine",
    text: "We have executive-level ownership and dedicated budget allocated for AI initiatives.",
    context: "Successful AI adoption requires visible leadership commitment and ring-fenced resources.",
    examples: [
      "Named C-level sponsor for AI",
      "Annual budget earmarked for AI/automation",
      "AI discussed at board or leadership meetings",
    ],
  },

  // === AI Operating Style (5) ===
  {
    id: "operating_1",
    pillar: "AI Operating Style",
    text: "We treat AI as a strategy, not just a tool or experiment.",
    context: "AI-native companies embed AI in how they think, not just what they do.",
    examples: [
      "AI considered in strategic planning",
      "AI capabilities influence business model",
      "AI informs competitive positioning",
    ],
    whyItMatters: "AI advantage compounds. Slowly. Then suddenly. This separates incumbents from survivors.",
  },
  {
    id: "operating_2",
    pillar: "AI Operating Style",
    text: "We optimise for speed of learning, not fear of failure.",
    context: "AI adoption requires experimentation. Fear of failure slows learning.",
    examples: [
      "Culture of testing and iterating",
      "Failures discussed as learning opportunities",
      "Quick pilot cycles rather than perfect plans",
    ],
  },
  {
    id: "operating_3",
    pillar: "AI Operating Style",
    text: "A small AI-native competitor couldn't run circles around us in 12 months.",
    context: "Honest assessment of competitive vulnerability drives urgency.",
    examples: [
      "Awareness of AI-native competitors",
      "Speed of adaptation vs market",
      "Defensibility of current position",
    ],
  },
  {
    id: "operating_4",
    pillar: "AI Operating Style",
    text: "Our frontline team is open to adopting new AI-powered tools and processes.",
    context: "Technology adoption fails without buy-in from daily users. Culture matters more than features.",
    examples: [
      "Staff actively suggest AI improvements",
      "History of successfully adopting new software",
      "Low resistance when new tools are introduced",
    ],
  },
  {
    id: "operating_5",
    pillar: "AI Operating Style",
    text: "We have someone internally who can champion AI projects and bridge business and technical needs.",
    context: "AI projects need a translator between what the business wants and what technology can deliver.",
    examples: [
      "Operations person comfortable with tech vendors",
      "Someone attending AI/tech events or webinars",
      "Staff actively experimenting with AI tools",
    ],
  },
];

// Free assessment: 2 questions per pillar = 10 questions
export const FREE_QUESTIONS: AssessmentQuestion[] = [
  FULL_QUESTIONS[0], // transformation_1
  FULL_QUESTIONS[2], // transformation_3
  FULL_QUESTIONS[5], // architecture_1
  FULL_QUESTIONS[6], // architecture_2
  FULL_QUESTIONS[10], // governance_1
  FULL_QUESTIONS[12], // governance_3
  FULL_QUESTIONS[15], // value_1
  FULL_QUESTIONS[17], // value_3
  FULL_QUESTIONS[20], // operating_1
  FULL_QUESTIONS[22], // operating_3
];

// Score band calculation
export const getScoreBand = (score: number): { label: string; description: string } => {
  if (score < 40) return {
    label: "AI-Exposed",
    description: "Significant gaps in AI readiness. Immediate action required.",
  };
  if (score < 60) return {
    label: "AI-Curious",
    description: "Foundations need work. Clear path forward exists.",
  };
  if (score < 80) return {
    label: "AI-Ready",
    description: "Ready for pilots. Not yet ready for scale.",
  };
  return {
    label: "AI-Native",
    description: "Top tier readiness. Focus on maximising advantage.",
  };
};

// Pillar score status
export const getPillarStatus = (score: number): { label: string; variant: "critical" | "warning" | "healthy" | "strong" } => {
  if (score < 40) return { label: "Critical", variant: "critical" };
  if (score < 60) return { label: "Needs Work", variant: "warning" };
  if (score < 80) return { label: "Healthy", variant: "healthy" };
  return { label: "Strong", variant: "strong" };
};

// Calculate pillar score from answers
export const calculatePillarScore = (
  pillarName: string,
  answers: Record<string, number>,
  questions: AssessmentQuestion[]
): number => {
  const pillarQuestions = questions.filter(q => q.pillar === pillarName);
  if (pillarQuestions.length === 0) return 0;
  const total = pillarQuestions.reduce((sum, q) => sum + (answers[q.id] || 3), 0);
  return Math.round((total / (pillarQuestions.length * 5)) * 100);
};
