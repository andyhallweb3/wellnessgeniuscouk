import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface WorkspaceProfile {
  id: string;
  user_id: string;
  business_name: string | null;
  sector: string | null;
  geography: string | null;
  business_size: string | null;
  primary_offer: string | null;
  current_stack: string[] | null;
  ai_readiness_score: number | null;
  ai_readiness_band: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceGoals {
  id: string;
  user_id: string;
  goals: string[];
  priority_order: string[];
  timeframe: string;
}

export interface WorkspaceConstraints {
  id: string;
  user_id: string;
  budget_range: string | null;
  team_capacity: string;
  data_access: string;
  integration_ability: string;
  compliance_sensitivity: string;
}

export interface WorkspaceMetrics {
  id: string;
  user_id: string;
  kpis: Record<string, any>;
  current_values: Record<string, any>;
  last_updated: string;
}

export interface WorkspaceDecision {
  id: string;
  user_id: string;
  decision_type: string;
  summary: string;
  context: string | null;
  status: string;
  outcomes: string | null;
  mode: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceContext {
  profile: WorkspaceProfile | null;
  goals: WorkspaceGoals | null;
  constraints: WorkspaceConstraints | null;
  metrics: WorkspaceMetrics | null;
  decisions: WorkspaceDecision[];
}

export const useWorkspace = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<WorkspaceProfile | null>(null);
  const [goals, setGoals] = useState<WorkspaceGoals | null>(null);
  const [constraints, setConstraints] = useState<WorkspaceConstraints | null>(null);
  const [metrics, setMetrics] = useState<WorkspaceMetrics | null>(null);
  const [decisions, setDecisions] = useState<WorkspaceDecision[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkspace = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const [profileRes, goalsRes, constraintsRes, metricsRes, decisionsRes] = await Promise.all([
        supabase.from("workspace_profile").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("workspace_goals").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("workspace_constraints").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("workspace_metrics").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("workspace_decisions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
      ]);

      setProfile(profileRes.data as WorkspaceProfile | null);
      setGoals(goalsRes.data as WorkspaceGoals | null);
      setConstraints(constraintsRes.data as WorkspaceConstraints | null);
      setMetrics(metricsRes.data as WorkspaceMetrics | null);
      setDecisions((decisionsRes.data || []) as WorkspaceDecision[]);
    } catch (error) {
      console.error("Error fetching workspace:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  const saveProfile = async (data: Partial<WorkspaceProfile>) => {
    if (!user) return false;
    try {
      const { error } = await supabase
        .from("workspace_profile")
        .upsert({ user_id: user.id, ...data }, { onConflict: "user_id" });
      if (error) throw error;
      await fetchWorkspace();
      return true;
    } catch (error) {
      console.error("Error saving profile:", error);
      return false;
    }
  };

  const saveGoals = async (data: Partial<WorkspaceGoals>) => {
    if (!user) return false;
    try {
      const { error } = await supabase
        .from("workspace_goals")
        .upsert({ user_id: user.id, ...data }, { onConflict: "user_id" });
      if (error) throw error;
      await fetchWorkspace();
      return true;
    } catch (error) {
      console.error("Error saving goals:", error);
      return false;
    }
  };

  const saveConstraints = async (data: Partial<WorkspaceConstraints>) => {
    if (!user) return false;
    try {
      const { error } = await supabase
        .from("workspace_constraints")
        .upsert({ user_id: user.id, ...data }, { onConflict: "user_id" });
      if (error) throw error;
      await fetchWorkspace();
      return true;
    } catch (error) {
      console.error("Error saving constraints:", error);
      return false;
    }
  };

  const saveMetrics = async (data: Partial<WorkspaceMetrics>) => {
    if (!user) return false;
    try {
      const { error } = await supabase
        .from("workspace_metrics")
        .upsert({ user_id: user.id, ...data }, { onConflict: "user_id" });
      if (error) throw error;
      await fetchWorkspace();
      return true;
    } catch (error) {
      console.error("Error saving metrics:", error);
      return false;
    }
  };

  const addDecision = async (data: Omit<WorkspaceDecision, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user) return null;
    try {
      const { data: result, error } = await supabase
        .from("workspace_decisions")
        .insert({ user_id: user.id, ...data })
        .select()
        .single();
      if (error) throw error;
      await fetchWorkspace();
      return result as WorkspaceDecision;
    } catch (error) {
      console.error("Error adding decision:", error);
      return null;
    }
  };

  const updateDecision = async (id: string, data: Partial<WorkspaceDecision>) => {
    if (!user) return false;
    try {
      const { error } = await supabase
        .from("workspace_decisions")
        .update(data)
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
      await fetchWorkspace();
      return true;
    } catch (error) {
      console.error("Error updating decision:", error);
      return false;
    }
  };

  const getContext = (): WorkspaceContext => ({
    profile,
    goals,
    constraints,
    metrics,
    decisions,
  });

  const getContextString = (): string => {
    if (!profile) return "";

    const parts: string[] = [];

    if (profile.business_name) {
      parts.push(`Business: ${profile.business_name}`);
    }
    if (profile.sector) {
      parts.push(`Sector: ${profile.sector}`);
    }
    if (profile.business_size) {
      parts.push(`Size: ${profile.business_size}`);
    }
    if (profile.primary_offer) {
      parts.push(`Primary offer: ${profile.primary_offer}`);
    }
    if (profile.ai_readiness_band) {
      parts.push(`AI Readiness: ${profile.ai_readiness_band} (${profile.ai_readiness_score || 0}%)`);
    }
    if (goals?.goals?.length) {
      parts.push(`Goals: ${goals.goals.join(", ")}`);
    }
    if (constraints) {
      const constraintParts = [];
      if (constraints.budget_range) constraintParts.push(`budget: ${constraints.budget_range}`);
      if (constraints.team_capacity) constraintParts.push(`team capacity: ${constraints.team_capacity}`);
      if (constraints.data_access) constraintParts.push(`data access: ${constraints.data_access}`);
      if (constraintParts.length) {
        parts.push(`Constraints: ${constraintParts.join(", ")}`);
      }
    }
    if (decisions.length > 0) {
      const recentDecisions = decisions.slice(0, 3).map(d => d.summary).join("; ");
      parts.push(`Recent decisions: ${recentDecisions}`);
    }

    return parts.join("\n");
  };

  const needsOnboarding = !profile?.onboarding_completed;

  return {
    profile,
    goals,
    constraints,
    metrics,
    decisions,
    isLoading,
    needsOnboarding,
    saveProfile,
    saveGoals,
    saveConstraints,
    saveMetrics,
    addDecision,
    updateDecision,
    getContext,
    getContextString,
    refetch: fetchWorkspace,
  };
};
