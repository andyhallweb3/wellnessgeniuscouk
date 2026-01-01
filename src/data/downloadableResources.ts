// Downloadable Resources - Strategic AI Playbooks
// These resources map directly to the 5 AI Readiness pillars

export interface DownloadableResource {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  pillar: string;
  format: "pdf" | "checklist" | "template" | "guide";
  isPremium: boolean;
  previewPoints: string[];
  fullDescription?: string;
}

export const DOWNLOADABLE_RESOURCES: DownloadableResource[] = [
  // Transformation Readiness Resources
  {
    id: "transformation-audit",
    title: "AI Transformation Audit Template",
    subtitle: "From Pilots to Production",
    description: "A structured framework to evaluate where AI is creating real operational change vs. where it's stuck in presentation mode.",
    pillar: "AI Transformation Readiness",
    format: "template",
    isPremium: false,
    previewPoints: [
      "Current state vs. target state mapping",
      "Ownership and accountability checklist",
      "Pilot-to-production gap analysis",
      "Stakeholder alignment scorecard",
    ],
  },
  {
    id: "ai-roadmap-builder",
    title: "12-Month AI Roadmap Builder",
    subtitle: "Strategic Planning Framework",
    description: "Build a realistic AI roadmap with clear milestones, dependencies, and review points.",
    pillar: "AI Transformation Readiness",
    format: "template",
    isPremium: true,
    previewPoints: [
      "Phase-by-phase implementation guide",
      "Resource and budget planning templates",
      "Risk mitigation checkpoints",
      "Success metric frameworks",
    ],
  },

  // Architecture Confidence Resources
  {
    id: "ai-knowledge-audit",
    title: "AI Knowledge Audit Checklist",
    subtitle: "Find Your Truth Sources",
    description: "Map where your institutional knowledge lives and how accessible it is for AI systems.",
    pillar: "AI Architecture Confidence",
    format: "checklist",
    isPremium: false,
    previewPoints: [
      "Knowledge source inventory template",
      "Accessibility scoring matrix",
      "Data quality assessment guide",
      "Integration readiness checklist",
    ],
  },
  {
    id: "llm-architecture-guide",
    title: "LLM Architecture Decision Guide",
    subtitle: "RAG, Fine-tuning, or Agents?",
    description: "Make informed architecture decisions with clear criteria for each approach.",
    pillar: "AI Architecture Confidence",
    format: "guide",
    isPremium: true,
    previewPoints: [
      "Decision tree for architecture choices",
      "Cost vs. accuracy trade-off analysis",
      "Vendor evaluation framework",
      "Implementation complexity scoring",
    ],
    fullDescription: "Gartner predicts 40%+ of GenAI projects will be abandoned by 2027 due to poor architecture decisions. This guide helps you avoid being part of that statistic.",
  },

  // Governance Reality Check Resources
  {
    id: "ai-ethics-policy",
    title: "AI Ethics Policy Template",
    subtitle: "Define Your Red Lines",
    description: "A ready-to-adapt policy framework for responsible AI use in your organisation.",
    pillar: "AI Governance Reality Check",
    format: "template",
    isPremium: false,
    previewPoints: [
      "Prohibited use case definitions",
      "Human oversight requirements",
      "Accountability assignment framework",
      "Incident response procedures",
    ],
  },
  {
    id: "ai-governance-playbook",
    title: "AI Governance Playbook",
    subtitle: "Compliance Without Paralysis",
    description: "Practical governance that protects without slowing you down. EU AI Act and UK ICO ready.",
    pillar: "AI Governance Reality Check",
    format: "guide",
    isPremium: true,
    previewPoints: [
      "Regulatory compliance checklist",
      "Risk classification framework",
      "Audit trail requirements",
      "Training curriculum outline",
    ],
    fullDescription: "Regulation isn't theoretical anymore. AI literacy is now a risk management function, not an innovation perk.",
  },

  // Value Engine Resources
  {
    id: "ai-roi-calculator",
    title: "AI ROI Calculator Template",
    subtitle: "Tie AI to Your P&L",
    description: "Calculate realistic ROI ranges and define clear go/no-go criteria for AI investments.",
    pillar: "AI Value Engine",
    format: "template",
    isPremium: false,
    previewPoints: [
      "Cost reduction estimation framework",
      "Revenue impact modelling",
      "Time-to-value projections",
      "Break-even analysis template",
    ],
  },
  {
    id: "ai-business-case",
    title: "AI Business Case Builder",
    subtitle: "Get Budget Approved",
    description: "Build compelling business cases that tie AI directly to financial metrics.",
    pillar: "AI Value Engine",
    format: "template",
    isPremium: true,
    previewPoints: [
      "Executive summary template",
      "Financial modelling spreadsheet",
      "Risk-adjusted projections",
      "Stakeholder presentation deck",
    ],
    fullDescription: "BCG data shows companies that tie AI directly to financial metrics are 2x more likely to scale successfully. Everything else is theatre.",
  },

  // Operating Style Resources
  {
    id: "ai-culture-assessment",
    title: "AI Culture Assessment",
    subtitle: "Tool, Teammate, or Strategy?",
    description: "Evaluate your organisation's AI operating style and identify culture gaps.",
    pillar: "AI Operating Style",
    format: "checklist",
    isPremium: false,
    previewPoints: [
      "Organisational readiness survey",
      "Change resistance indicators",
      "Learning velocity assessment",
      "Competitive vulnerability check",
    ],
  },
  {
    id: "ai-champion-playbook",
    title: "AI Champion Playbook",
    subtitle: "Bridge Business and Tech",
    description: "Build internal AI capability by developing champions who can translate between business and technology.",
    pillar: "AI Operating Style",
    format: "guide",
    isPremium: true,
    previewPoints: [
      "Champion role definition",
      "Skill development pathway",
      "Communication frameworks",
      "Influence strategy guide",
    ],
    fullDescription: "AI advantage compounds. Slowly. Then suddenly. This playbook helps you build the capability to stay ahead.",
  },
];

// Group resources by pillar
export const getResourcesByPillar = (pillar: string): DownloadableResource[] => {
  return DOWNLOADABLE_RESOURCES.filter(r => r.pillar === pillar);
};

// Get free resources only
export const getFreeResources = (): DownloadableResource[] => {
  return DOWNLOADABLE_RESOURCES.filter(r => !r.isPremium);
};

// Get premium resources only
export const getPremiumResources = (): DownloadableResource[] => {
  return DOWNLOADABLE_RESOURCES.filter(r => r.isPremium);
};
