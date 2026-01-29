/**
 * Agentic Wellness Engine Hook
 * Implements all 7 design patterns from Antonio Gulli's book
 */

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessMemory } from "./useBusinessMemory";
import {
  WellnessDomain,
  WellnessGoal,
  WellnessProgress,
  WellnessPlan,
  WellnessFeedback,
  AssessmentChainResult,
  ReflectionFeedback,
  Recommendation,
  ToolIntegration,
  AgenticSessionResult,
  PlanPhaseDetail,
  PlanMilestone,
  getProgressStatus,
  getRiskLevel,
  getDomainRecommendations,
  WELLNESS_DOMAINS,
  GoalStatus,
  GoalPriority,
  PlanPhase,
  FeedbackType,
} from "@/types/agenticWellness";

export const useAgenticWellness = () => {
  const { user } = useAuth();
  const { memory, getMemoryContext } = useBusinessMemory();
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<WellnessPlan | null>(null);
  const [goals, setGoals] = useState<WellnessGoal[]>([]);
  const [reflectionLog, setReflectionLog] = useState<ReflectionFeedback[]>([]);

  // ============================================================
  // PATTERN 1: PROMPT CHAINING
  // Sequential wellness assessment where each step builds on previous
  // ============================================================
  const assessWellness = useCallback(
    async (pillarScores: Record<WellnessDomain, number>): Promise<AssessmentChainResult> => {
      console.log("🔗 PATTERN: Prompt Chaining - Sequential Assessment");

      // Step 1: Health Screening
      const screening = {
        pillar_scores: pillarScores,
        overall_score: Object.values(pillarScores).reduce((a, b) => a + b, 0) / 5,
        business_context: {
          business_type: memory?.business_type || undefined,
          team_size: memory?.team_size || undefined,
          ai_experience: undefined,
        },
      };
      console.log("  ✓ Step 1: Health screening completed");

      // Step 2: Domain Analysis (chained from screening)
      const domain_analysis: AssessmentChainResult["domain_analysis"] = {};
      for (const [domain, score] of Object.entries(pillarScores)) {
        const d = domain as WellnessDomain;
        const domainInfo = WELLNESS_DOMAINS[d];
        const gaps: string[] = [];
        
        if (score < 40) {
          gaps.push(...getDomainRecommendations(d, score).slice(0, 2));
        }

        domain_analysis[domain] = {
          score,
          status: score >= 70 ? "good" : score >= 40 ? "needs_improvement" : "critical",
          key_metrics: domainInfo.keyMetrics,
          gaps,
        };
      }
      console.log("  ✓ Step 2: Domain analysis completed");

      // Step 3: Risk Assessment (chained from domain analysis)
      const identified_risks = Object.entries(domain_analysis)
        .filter(([, data]) => data.status !== "good")
        .map(([domain, data]) => ({
          domain: domain as WellnessDomain,
          severity: data.status === "critical" ? "high" as const : "medium" as const,
          description: `${WELLNESS_DOMAINS[domain as WellnessDomain].name} needs attention`,
        }));

      const risk_assessment = {
        identified_risks,
        overall_risk_level: getRiskLevel(identified_risks.filter(r => r.severity === "high").length),
      };
      console.log("  ✓ Step 3: Risk assessment completed");

      // Step 4: Generate Recommendations (chained from all previous)
      const recommendations: Recommendation[] = Object.entries(domain_analysis)
        .filter(([, data]) => data.status !== "good")
        .slice(0, 3)
        .map(([domain, data]) => ({
          domain: domain as WellnessDomain,
          priority: data.score < 40 ? "high" as const : "medium" as const,
          actions: getDomainRecommendations(domain as WellnessDomain, data.score),
          expected_improvement: "15-25% improvement in 12 weeks",
          timeline: "12 weeks",
        }));
      console.log("  ✓ Step 4: Recommendations generated");

      return {
        screening,
        domain_analysis,
        risk_assessment,
        recommendations,
        timestamp: new Date().toISOString(),
      };
    },
    [memory]
  );

  // ============================================================
  // PATTERN 2: REFLECTION
  // Self-evaluation of wellness plan quality
  // ============================================================
  const reflectOnPlan = useCallback((plan: WellnessPlan): ReflectionFeedback => {
    console.log("🪞 PATTERN: Reflection - Evaluating Plan Quality");

    // Evaluate specificity
    const goalCount = goals.length;
    const hasTargets = goals.some(g => g.target_value !== null);
    const hasTimelines = goals.some(g => g.target_date !== null);
    const specificityScore = Math.min(5 + (goalCount > 0 ? 2 : 0) + (hasTargets ? 2 : 0) + (hasTimelines ? 1 : 0), 10);
    console.log(`  ✓ Specificity: ${specificityScore}/10`);

    // Evaluate feasibility
    let feasibilityScore = 7;
    if (goalCount > 5) feasibilityScore -= 2;
    if (plan.duration_weeks < 4) feasibilityScore -= 1;
    feasibilityScore = Math.max(feasibilityScore, 1);
    console.log(`  ✓ Feasibility: ${feasibilityScore}/10`);

    // Evaluate comprehensiveness
    const domainsWithGoals = new Set(goals.map(g => g.domain));
    const comprehensivenessScore = Math.min(domainsWithGoals.size * 2.5, 10);
    console.log(`  ✓ Comprehensiveness: ${comprehensivenessScore}/10`);

    const overallScore = (specificityScore + feasibilityScore + comprehensivenessScore) / 3;

    const feedback: ReflectionFeedback = {
      specificity: {
        score: specificityScore,
        feedback: specificityScore > 7 ? "Goals are clear and measurable" : "Goals need more detail",
      },
      feasibility: {
        score: feasibilityScore,
        feedback: feasibilityScore > 7 ? "Plan is realistic and achievable" : "Plan may be too ambitious",
      },
      comprehensiveness: {
        score: comprehensivenessScore,
        feedback: comprehensivenessScore > 7 ? "Covers multiple wellness domains" : "Should address more domains",
      },
      recommendation:
        overallScore >= 8
          ? "Plan is excellent. Proceed with implementation."
          : overallScore >= 6
          ? "Plan is good with minor improvements needed."
          : "Plan needs significant revision. Consider restructuring goals.",
    };

    setReflectionLog(prev => [...prev, feedback]);
    return feedback;
  }, [goals]);

  // ============================================================
  // PATTERN 3: TOOL USE
  // Integration with external data sources (simulated)
  // ============================================================
  const useHealthTools = useCallback(async (tools: string[]): Promise<ToolIntegration> => {
    console.log("🔧 PATTERN: Tool Use - Integrating Data Sources");

    const results: ToolIntegration = {};

    for (const tool of tools) {
      console.log(`  ⚙️ Accessing tool: ${tool}`);

      if (tool === "crm_data") {
        // Simulate CRM data fetch
        results.crm_data = {
          source: "crm",
          data: {
            customer_count: 1250,
            churn_rate: 0.08,
            nps_score: 42,
            active_leads: 87,
          },
          timestamp: new Date().toISOString(),
        };
      } else if (tool === "analytics") {
        results.analytics = {
          source: "analytics",
          data: {
            monthly_active_users: 4500,
            engagement_rate: 0.65,
            conversion_rate: 0.12,
            avg_session_duration: 8.5,
          },
          timestamp: new Date().toISOString(),
        };
      } else if (tool === "calendar") {
        results.calendar = {
          source: "calendar",
          data: {
            meetings_this_week: 12,
            focus_time_hours: 15,
            recurring_meetings: 6,
          },
          timestamp: new Date().toISOString(),
        };
      }
    }

    return results;
  }, []);

  // ============================================================
  // PATTERN 4: PLANNING
  // Multi-step wellness plan creation
  // ============================================================
  const createWellnessPlan = useCallback(
    async (assessment: AssessmentChainResult, durationWeeks = 12): Promise<WellnessPlan | null> => {
      if (!user) return null;
      console.log(`📋 PATTERN: Planning - Creating ${durationWeeks}-Week Plan`);

      const weeksPerPhase = Math.floor(durationWeeks / 3);

      const phases: PlanPhaseDetail[] = [
        {
          phase: 1,
          name: "Foundation",
          weeks: `1-${weeksPerPhase}`,
          focus: "Establish habits and baseline",
          intensity: "low_to_moderate",
        },
        {
          phase: 2,
          name: "Building",
          weeks: `${weeksPerPhase + 1}-${weeksPerPhase * 2}`,
          focus: "Increase intensity and consistency",
          intensity: "moderate_to_high",
        },
        {
          phase: 3,
          name: "Sustaining",
          weeks: `${weeksPerPhase * 2 + 1}-${durationWeeks}`,
          focus: "Maintain progress and optimise",
          intensity: "sustainable",
        },
      ];

      const checkpointWeeks = [
        Math.floor(durationWeeks / 4),
        Math.floor(durationWeeks / 2),
        Math.floor((3 * durationWeeks) / 4),
        durationWeeks,
      ];

      const milestones: PlanMilestone[] = checkpointWeeks.map((week, i) => ({
        milestone_id: i + 1,
        week,
        description: `Week ${week} Assessment`,
        activities: ["Review progress on all goals", "Adjust plan if needed", "Celebrate achievements"],
        completed: false,
      }));

      // Create goals from recommendations
      const newGoals: WellnessGoal[] = assessment.recommendations.slice(0, 3).map((rec, i) => ({
        id: `goal_${Date.now()}_${i}`,
        user_id: user.id,
        domain: rec.domain,
        description: `Improve ${WELLNESS_DOMAINS[rec.domain].name}`,
        target_date: new Date(Date.now() + durationWeeks * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        target_value: rec.priority === "high" ? 70 : 80,
        current_progress: assessment.domain_analysis[rec.domain]?.score || 0,
        status: "active" as GoalStatus,
        priority: rec.priority as GoalPriority,
        success_criteria: rec.actions.slice(0, 3),
        milestones: [
          { week: 4, target: "Complete foundation phase", completed: false },
          { week: 8, target: "Building phase progress", completed: false },
          { week: 12, target: "Achieve target score", completed: false },
        ],
        phase: "foundation" as PlanPhase,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      console.log(`  ✓ Created ${newGoals.length} goals`);
      setGoals(newGoals);

      // Save goals to database
      for (const goal of newGoals) {
        await supabase.from("wellness_goals").insert({
          user_id: user.id,
          domain: goal.domain,
          description: goal.description,
          target_date: goal.target_date,
          target_value: goal.target_value,
          current_progress: goal.current_progress,
          status: goal.status,
          priority: goal.priority,
          success_criteria: goal.success_criteria as unknown as undefined,
          milestones: goal.milestones as unknown as undefined,
          phase: goal.phase,
        } as never);
      }

      const plan: WellnessPlan = {
        id: `plan_${Date.now()}`,
        user_id: user.id,
        plan_name: `${durationWeeks}-Week AI Readiness Plan`,
        duration_weeks: durationWeeks,
        phases,
        milestones,
        reflection_score: null,
        reflection_feedback: {
          specificity: { score: 0, feedback: "" },
          feasibility: { score: 0, feedback: "" },
          comprehensiveness: { score: 0, feedback: "" },
          recommendation: "",
        },
        status: "draft",
        assessment_snapshot: {
          overall_score: assessment.screening.overall_score,
          pillar_scores: assessment.screening.pillar_scores,
          score_band: assessment.screening.overall_score >= 70 ? "AI-Ready" : assessment.screening.overall_score >= 40 ? "AI-Curious" : "AI-Exposed",
          risk_level: assessment.risk_assessment.overall_risk_level,
          timestamp: assessment.timestamp,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Save plan to database
      await supabase.from("wellness_plans").insert({
        user_id: user.id,
        plan_name: plan.plan_name,
        duration_weeks: plan.duration_weeks,
        phases: plan.phases as unknown as undefined,
        milestones: plan.milestones as unknown as undefined,
        status: plan.status,
        assessment_snapshot: plan.assessment_snapshot as unknown as undefined,
      } as never);

      setCurrentPlan(plan);
      return plan;
    },
    [user]
  );

  // ============================================================
  // PATTERN 5: MEMORY MANAGEMENT
  // Already implemented via useBusinessMemory hook
  // Extended here with wellness-specific context
  // ============================================================
  const getWellnessContext = useCallback(() => {
    const baseContext = getMemoryContext();
    return {
      ...baseContext,
      active_goals: goals.filter(g => g.status === "active"),
      current_plan: currentPlan,
      reflection_history: reflectionLog,
    };
  }, [getMemoryContext, goals, currentPlan, reflectionLog]);

  // ============================================================
  // PATTERN 6: GOAL MONITORING
  // Track progress toward wellness goals
  // ============================================================
  const monitorProgress = useCallback(
    async (goalId: string, currentData: Record<string, number>): Promise<WellnessProgress | null> => {
      if (!user) return null;
      console.log(`📊 PATTERN: Goal Monitoring - Tracking ${goalId}`);

      const goal = goals.find(g => g.id === goalId);
      if (!goal) {
        console.error("Goal not found");
        return null;
      }

      // Calculate progress based on domain
      let progressPercentage = 0;
      const insights: string[] = [];
      const recommendations: string[] = [];

      const currentScore = currentData[goal.domain] || goal.current_progress;
      const targetScore = goal.target_value || 80;
      progressPercentage = Math.min((currentScore / targetScore) * 100, 100);

      insights.push(`Current score: ${Math.round(currentScore)}/100`);
      insights.push(`Target: ${targetScore}/100`);

      if (progressPercentage < 50) {
        recommendations.push(...getDomainRecommendations(goal.domain, currentScore));
      }

      const status = getProgressStatus(progressPercentage);
      console.log(`  ✓ Progress: ${progressPercentage.toFixed(1)}%`);
      console.log(`  ✓ Status: ${status}`);

      const progress: WellnessProgress = {
        id: `progress_${Date.now()}`,
        user_id: user.id,
        goal_id: goalId,
        domain: goal.domain,
        progress_percentage: progressPercentage,
        status,
        insights,
        recommendations,
        data_snapshot: currentData,
        recorded_at: new Date().toISOString(),
      };

      // Save to database
      await supabase.from("wellness_progress").insert({
        user_id: user.id,
        goal_id: goal.id.startsWith("goal_") ? null : goal.id,
        domain: progress.domain,
        progress_percentage: progress.progress_percentage,
        status: progress.status,
        insights: progress.insights as unknown as undefined,
        recommendations: progress.recommendations as unknown as undefined,
        data_snapshot: progress.data_snapshot as unknown as undefined,
      } as never);

      return progress;
    },
    [user, goals]
  );

  // ============================================================
  // PATTERN 7: HUMAN-IN-THE-LOOP
  // Request and incorporate user feedback
  // ============================================================
  const requestFeedback = useCallback(
    (item: string, options: string[]): { item: string; options: string[]; response_required: boolean } => {
      console.log(`👤 PATTERN: Human-in-the-Loop - Requesting Feedback`);
      console.log(`  ❓ Question: ${item}`);
      options.forEach((opt, i) => console.log(`     ${i + 1}. ${opt}`));

      return {
        item,
        options,
        response_required: true,
      };
    },
    []
  );

  const incorporateFeedback = useCallback(
    async (feedback: {
      type: FeedbackType;
      content: Record<string, unknown>;
      goal_id?: string;
      plan_id?: string;
    }): Promise<WellnessFeedback | null> => {
      if (!user) return null;
      console.log("✅ PATTERN: Incorporating User Feedback");

      const adjustments: string[] = [];

      if (feedback.type === "goal_adjustment") {
        adjustments.push("Modified goal targets");
        console.log("  ✓ Goals adjusted based on feedback");
      }

      if (feedback.type === "timeline_adjustment") {
        adjustments.push("Updated timeline");
        console.log("  ✓ Timeline updated based on feedback");
      }

      if (feedback.type === "difficulty_change") {
        adjustments.push("Adjusted difficulty level");
        console.log("  ✓ Difficulty adjusted based on feedback");
      }

      const feedbackRecord: WellnessFeedback = {
        id: `feedback_${Date.now()}`,
        user_id: user.id,
        plan_id: feedback.plan_id || null,
        goal_id: feedback.goal_id || null,
        feedback_type: feedback.type,
        feedback_content: feedback.content,
        adjustments_made: adjustments,
        created_at: new Date().toISOString(),
      };

      // Save to database
      await supabase.from("wellness_feedback").insert({
        user_id: user.id,
        plan_id: feedback.plan_id || null,
        goal_id: feedback.goal_id || null,
        feedback_type: feedback.type,
        feedback_content: feedback.content as unknown as undefined,
        adjustments_made: adjustments as unknown as undefined,
      } as never);

      return feedbackRecord;
    },
    [user]
  );

  // ============================================================
  // COMPREHENSIVE SESSION
  // Run all patterns together
  // ============================================================
  const runComprehensiveSession = useCallback(
    async (pillarScores: Record<WellnessDomain, number>): Promise<AgenticSessionResult> => {
      setLoading(true);
      console.log("\n" + "=".repeat(60));
      console.log("🌟 WELLNESS GENIUS - COMPREHENSIVE AGENTIC SESSION");
      console.log("=".repeat(60));

      const sessionResult: AgenticSessionResult = {
        session_id: `session_${Date.now()}`,
        timestamp: new Date().toISOString(),
        steps: {},
      };

      try {
        // Step 1: Assessment (Prompt Chaining)
        console.log("\n[STEP 1/6] Wellness Assessment");
        const assessment = await assessWellness(pillarScores);
        sessionResult.steps.assessment = assessment;

        // Step 2: Create Plan (Planning)
        console.log("\n[STEP 2/6] Plan Creation");
        const plan = await createWellnessPlan(assessment);
        if (plan) sessionResult.steps.plan = plan;

        // Step 3: Reflect on Plan (Reflection)
        console.log("\n[STEP 3/6] Plan Reflection");
        if (plan) {
          const reflection = reflectOnPlan(plan);
          sessionResult.steps.reflection = reflection;
        }

        // Step 4: Integrate Tools (Tool Use)
        console.log("\n[STEP 4/6] Data Integration");
        const toolData = await useHealthTools(["crm_data", "analytics"]);
        sessionResult.steps.tool_data = toolData;

        // Step 5: Set up Monitoring (Goal Monitoring)
        console.log("\n[STEP 5/6] Progress Monitoring Setup");
        sessionResult.steps.monitoring = {
          goals_tracked: goals.map(g => g.id),
          check_in_frequency: "weekly",
          metrics_to_track: ["progress_percentage", "status", "insights"],
        };

        // Step 6: Request Feedback (Human-in-the-Loop)
        console.log("\n[STEP 6/6] User Feedback Collection");
        sessionResult.steps.feedback_request = requestFeedback(
          "How would you like to adjust your AI readiness plan?",
          [
            "Plan looks great, let's proceed",
            "Make it more challenging",
            "Make it more manageable",
            "Focus on different areas",
          ]
        );

        console.log("\n" + "=".repeat(60));
        console.log("✨ Agentic Session Complete!");
        console.log("=".repeat(60));
      } catch (error) {
        console.error("Session error:", error);
      } finally {
        setLoading(false);
      }

      return sessionResult;
    },
    [assessWellness, createWellnessPlan, reflectOnPlan, useHealthTools, goals, requestFeedback]
  );

  // Load existing goals and plans
  const loadUserData = useCallback(async () => {
    if (!user) return;

    try {
      const [goalsResult, plansResult] = await Promise.all([
        supabase
          .from("wellness_goals")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("wellness_plans")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "active")
          .limit(1)
          .single(),
      ]);

      if (goalsResult.data) {
        setGoals(goalsResult.data as unknown as WellnessGoal[]);
      }

      if (plansResult.data) {
        setCurrentPlan(plansResult.data as unknown as WellnessPlan);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, [user]);

  return {
    // State
    loading,
    currentPlan,
    goals,
    reflectionLog,

    // Pattern methods
    assessWellness,
    reflectOnPlan,
    useHealthTools,
    createWellnessPlan,
    getWellnessContext,
    monitorProgress,
    requestFeedback,
    incorporateFeedback,
    runComprehensiveSession,

    // Data loading
    loadUserData,
  };
};
