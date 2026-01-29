/**
 * Agentic Wellness Types
 * Based on Antonio Gulli's "Agentic Design Patterns"
 * 
 * Implements: Prompt Chaining, Reflection, Tool Use, Planning,
 * Memory Management, Goal Monitoring, Human-in-the-Loop
 */

// Wellness domains aligned with AI Readiness pillars
export type WellnessDomain = 
  | "transformation" 
  | "architecture" 
  | "governance" 
  | "value" 
  | "operating";

export const WELLNESS_DOMAINS: Record<WellnessDomain, { 
  name: string; 
  description: string; 
  keyMetrics: string[];
}> = {
  transformation: {
    name: "AI Transformation Readiness",
    description: "Where AI creates real operational change",
    keyMetrics: ["ownership_clarity", "pilot_to_production", "workflow_dependency"],
  },
  architecture: {
    name: "AI Architecture Confidence",
    description: "Technical literacy and data foundation",
    keyMetrics: ["tech_literacy", "data_quality", "system_integration"],
  },
  governance: {
    name: "AI Governance Reality",
    description: "Ethics, accountability, and risk management",
    keyMetrics: ["policy_clarity", "accountability", "human_oversight"],
  },
  value: {
    name: "AI Value Engine",
    description: "Commercial outcomes and ROI tracking",
    keyMetrics: ["pnl_alignment", "cost_targets", "success_metrics"],
  },
  operating: {
    name: "AI Operating Style",
    description: "Culture, speed, and competitive positioning",
    keyMetrics: ["strategic_integration", "learning_speed", "team_adoption"],
  },
};

// Goal status types
export type GoalStatus = "active" | "completed" | "paused" | "abandoned";
export type GoalPriority = "low" | "medium" | "high";
export type PlanPhase = "foundation" | "building" | "sustaining";
export type ProgressStatus = "excellent" | "on_track" | "needs_attention" | "at_risk";

// Wellness Goal structure
export interface WellnessGoal {
  id: string;
  user_id: string;
  domain: WellnessDomain;
  description: string;
  target_date: string | null;
  target_value: number | null;
  current_progress: number;
  status: GoalStatus;
  priority: GoalPriority;
  success_criteria: string[];
  milestones: GoalMilestone[];
  phase: PlanPhase;
  created_at: string;
  updated_at: string;
}

export interface GoalMilestone {
  week: number;
  target: string;
  completed: boolean;
  completed_at?: string;
}

// Progress record
export interface WellnessProgress {
  id: string;
  user_id: string;
  goal_id: string | null;
  domain: WellnessDomain;
  progress_percentage: number;
  status: ProgressStatus;
  insights: string[];
  recommendations: string[];
  data_snapshot: Record<string, unknown>;
  recorded_at: string;
}

// Plan structure with phases
export interface WellnessPlan {
  id: string;
  user_id: string;
  plan_name: string | null;
  duration_weeks: number;
  phases: PlanPhaseDetail[];
  milestones: PlanMilestone[];
  reflection_score: number | null;
  reflection_feedback: ReflectionFeedback;
  status: "draft" | "active" | "completed" | "archived";
  assessment_snapshot: AssessmentSnapshot;
  created_at: string;
  updated_at: string;
}

export interface PlanPhaseDetail {
  phase: number;
  name: string;
  weeks: string; // e.g., "1-4"
  focus: string;
  intensity: "low_to_moderate" | "moderate_to_high" | "sustainable";
}

export interface PlanMilestone {
  milestone_id: number;
  week: number;
  description: string;
  activities: string[];
  completed: boolean;
}

// Reflection pattern output
export interface ReflectionFeedback {
  specificity: { score: number; feedback: string };
  feasibility: { score: number; feedback: string };
  comprehensiveness: { score: number; feedback: string };
  recommendation: string;
}

// Assessment data snapshot
export interface AssessmentSnapshot {
  overall_score: number;
  pillar_scores: Record<WellnessDomain, number>;
  score_band: string;
  risk_level: "low" | "medium" | "high";
  timestamp: string;
}

// Feedback types for Human-in-the-Loop pattern
export type FeedbackType = 
  | "goal_adjustment"
  | "timeline_adjustment"
  | "preference_update"
  | "difficulty_change"
  | "focus_area_change";

export interface WellnessFeedback {
  id: string;
  user_id: string;
  plan_id: string | null;
  goal_id: string | null;
  feedback_type: FeedbackType;
  feedback_content: Record<string, unknown>;
  adjustments_made: string[];
  created_at: string;
}

// Prompt Chaining step results
export interface AssessmentChainResult {
  screening: ScreeningResult;
  domain_analysis: DomainAnalysis;
  risk_assessment: RiskAssessment;
  recommendations: Recommendation[];
  timestamp: string;
}

export interface ScreeningResult {
  pillar_scores: Record<WellnessDomain, number>;
  overall_score: number;
  business_context: {
    business_type?: string;
    team_size?: string;
    ai_experience?: string;
  };
}

export interface DomainAnalysis {
  [key: string]: {
    score: number;
    status: "good" | "needs_improvement" | "critical";
    key_metrics: string[];
    gaps: string[];
  };
}

export interface RiskAssessment {
  identified_risks: Array<{
    domain: WellnessDomain;
    severity: "low" | "medium" | "high";
    description: string;
  }>;
  overall_risk_level: "low" | "medium" | "high";
}

export interface Recommendation {
  domain: WellnessDomain;
  priority: "low" | "medium" | "high";
  actions: string[];
  expected_improvement: string;
  timeline: string;
}

// Memory context for AI (extends existing business memory)
export interface WellnessMemoryContext {
  user_id: string;
  health_profile: {
    overall_score: number;
    score_band: string;
    pillar_scores: Record<WellnessDomain, number>;
    last_assessment_date: string | null;
    assessment_count: number;
  };
  active_goals: WellnessGoal[];
  recent_progress: WellnessProgress[];
  past_feedback: WellnessFeedback[];
  preferences: {
    communication_style?: string;
    decision_style?: string;
    focus_areas?: WellnessDomain[];
  };
}

// Tool integration interfaces (simulated/future API connections)
export interface ToolData {
  source: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export interface ToolIntegration {
  fitness_tracker?: ToolData;
  crm_data?: ToolData;
  analytics?: ToolData;
  calendar?: ToolData;
  email_metrics?: ToolData;
}

// Session result combining all patterns
export interface AgenticSessionResult {
  session_id: string;
  timestamp: string;
  steps: {
    assessment?: AssessmentChainResult;
    plan?: WellnessPlan;
    reflection?: ReflectionFeedback;
    tool_data?: ToolIntegration;
    monitoring?: {
      goals_tracked: string[];
      check_in_frequency: string;
      metrics_to_track: string[];
    };
    feedback_request?: {
      item: string;
      options: string[];
      response_required: boolean;
    };
  };
}

// Score calculation helpers
export const getProgressStatus = (progress: number): ProgressStatus => {
  if (progress >= 90) return "excellent";
  if (progress >= 70) return "on_track";
  if (progress >= 50) return "needs_attention";
  return "at_risk";
};

export const getRiskLevel = (gaps: number): "low" | "medium" | "high" => {
  if (gaps >= 3) return "high";
  if (gaps >= 1) return "medium";
  return "low";
};

export const getDomainRecommendations = (domain: WellnessDomain, score: number): string[] => {
  const recs: Record<WellnessDomain, { low: string[]; medium: string[]; high: string[] }> = {
    transformation: {
      low: [
        "Identify one workflow to pilot AI automation within 30 days",
        "Assign clear ownership for AI decisions to a named individual",
        "Document which workflows would break without AI to reveal true dependency",
      ],
      medium: [
        "Create a 12-month AI roadmap with quarterly milestones",
        "Identify 2-3 high-ROI use cases for the next 6 months",
      ],
      high: ["Focus on scaling successful pilots", "Document and share learnings across teams"],
    },
    architecture: {
      low: [
        "Audit where institutional knowledge lives (docs, people, systems)",
        "Ensure team can explain LLM vs agent vs copilot differences",
        "Build retrieval-first AI systems, not generation-first",
      ],
      medium: [
        "Clean and structure 12+ months of historical data",
        "Integrate core systems to enable automated data flow",
      ],
      high: ["Optimise existing RAG pipelines", "Explore fine-tuning for domain-specific tasks"],
    },
    governance: {
      low: [
        "Document what AI should never be used for in your business",
        "Assign accountability for AI errors before they happen",
        "Train staff to challenge AI outputs, not accept blindly",
      ],
      medium: [
        "Create documented GDPR and data privacy policies",
        "Establish human oversight for customer-affecting decisions",
      ],
      high: ["Regular audits of AI-driven outcomes", "External review of AI ethics practices"],
    },
    value: {
      low: [
        "Identify which P&L line improves first if AI works",
        "Define specific cost categories AI should reduce",
        "Set 6-12 month payback expectation with kill criteria",
      ],
      medium: [
        "Create measurable KPIs for AI project outcomes",
        "Secure executive sponsorship and dedicated budget",
      ],
      high: ["Expand successful ROI patterns", "Build business case library"],
    },
    operating: {
      low: [
        "Treat AI as strategy, not just tooling",
        "Optimise for learning speed over fear of failure",
        "Assess vulnerability to AI-native competitors",
      ],
      medium: [
        "Build team openness to AI tool adoption",
        "Identify internal AI champion who bridges business and tech",
      ],
      high: ["Embed AI in strategic planning", "Create competitive moat through AI advantage"],
    },
  };

  if (score < 40) return recs[domain].low;
  if (score < 70) return recs[domain].medium;
  return recs[domain].high;
};
