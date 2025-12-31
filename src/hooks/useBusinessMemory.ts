import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface BusinessMemory {
  id: string;
  user_id: string;
  business_name: string | null;
  business_type: string | null;
  revenue_model: string | null;
  annual_revenue_band: string | null;
  team_size: string | null;
  primary_goal: string | null;
  biggest_challenge: string | null;
  known_weak_spots: string[] | null;
  key_metrics: string[] | null;
  communication_style: string | null;
  decision_style: string | null;
  created_at: string;
  updated_at: string;
}

export interface GenieInsight {
  id: string;
  user_id: string;
  insight_type: "observation" | "preference" | "commitment" | "warning";
  content: string;
  source: string | null;
  relevance_score: number;
  created_at: string;
  expires_at: string | null;
}

export interface GenieDecision {
  id: string;
  user_id: string;
  decision_summary: string;
  context: string | null;
  outcome: string | null;
  mode: string | null;
  created_at: string;
}

export const useBusinessMemory = () => {
  const { user } = useAuth();
  const [memory, setMemory] = useState<BusinessMemory | null>(null);
  const [insights, setInsights] = useState<GenieInsight[]>([]);
  const [recentDecisions, setRecentDecisions] = useState<GenieDecision[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMemory = useCallback(async () => {
    if (!user) return;
    
    try {
      // Fetch business memory
      const { data: memoryData } = await supabase
        .from("business_memory")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (memoryData) {
        setMemory(memoryData as BusinessMemory);
      }

      // Fetch recent insights (last 20, sorted by relevance)
      const { data: insightsData } = await supabase
        .from("genie_insights")
        .select("*")
        .eq("user_id", user.id)
        .order("relevance_score", { ascending: false })
        .limit(20);
      
      if (insightsData) {
        setInsights(insightsData as GenieInsight[]);
      }

      // Fetch recent decisions (last 10)
      const { data: decisionsData } = await supabase
        .from("genie_decisions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (decisionsData) {
        setRecentDecisions(decisionsData as GenieDecision[]);
      }
    } catch (error) {
      console.error("Error fetching business memory:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMemory();
  }, [fetchMemory]);

  const saveMemory = async (data: Partial<BusinessMemory>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      if (memory) {
        // Update existing
        const { error } = await supabase
          .from("business_memory")
          .update(data)
          .eq("user_id", user.id);
        
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("business_memory")
          .insert({ ...data, user_id: user.id });
        
        if (error) throw error;
      }
      
      await fetchMemory();
      return true;
    } catch (error) {
      console.error("Error saving business memory:", error);
      return false;
    }
  };

  const addInsight = async (
    type: GenieInsight["insight_type"],
    content: string,
    source?: string,
    relevanceScore = 5
  ): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from("genie_insights")
        .insert({
          user_id: user.id,
          insight_type: type,
          content,
          source,
          relevance_score: relevanceScore,
        });
      
      if (error) throw error;
      await fetchMemory();
      return true;
    } catch (error) {
      console.error("Error adding insight:", error);
      return false;
    }
  };

  const logDecision = async (
    summary: string,
    context?: string,
    mode?: string
  ): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from("genie_decisions")
        .insert({
          user_id: user.id,
          decision_summary: summary,
          context,
          mode,
        });
      
      if (error) throw error;
      await fetchMemory();
      return true;
    } catch (error) {
      console.error("Error logging decision:", error);
      return false;
    }
  };

  // Build context object for the AI (matches StrictMemoryContextSchema)
  const getMemoryContext = useCallback(() => {
    if (!memory) return null;
    
    return {
      business_name: memory.business_name,
      business_type: memory.business_type,
      team_size: memory.team_size,
      primary_goal: memory.primary_goal,
      biggest_challenge: memory.biggest_challenge,
      revenue_model: memory.revenue_model,
      annual_revenue_band: memory.annual_revenue_band,
      key_metrics: memory.key_metrics,
      known_weak_spots: memory.known_weak_spots,
      communication_style: memory.communication_style,
      decision_style: memory.decision_style,
    };
  }, [memory]);

  // Build formatted context string for display purposes
  const getMemoryContextString = useCallback((): string => {
    const parts: string[] = [];

    if (memory) {
      parts.push("## BUSINESS MEMORY");
      if (memory.business_name) parts.push(`Business: ${memory.business_name}`);
      if (memory.business_type) parts.push(`Type: ${memory.business_type}`);
      if (memory.revenue_model) parts.push(`Revenue Model: ${memory.revenue_model}`);
      if (memory.annual_revenue_band) parts.push(`Annual Revenue: ${memory.annual_revenue_band}`);
      if (memory.team_size) parts.push(`Team Size: ${memory.team_size}`);
      if (memory.primary_goal) parts.push(`Primary Goal: ${memory.primary_goal}`);
      if (memory.biggest_challenge) parts.push(`Biggest Challenge: ${memory.biggest_challenge}`);
      if (memory.known_weak_spots?.length) {
        parts.push(`Known Weak Spots: ${memory.known_weak_spots.join(", ")}`);
      }
      if (memory.key_metrics?.length) {
        parts.push(`Key Metrics They Track: ${memory.key_metrics.join(", ")}`);
      }
      if (memory.communication_style) {
        parts.push(`Prefers: ${memory.communication_style} responses`);
      }
      if (memory.decision_style) {
        parts.push(`Decision Style: ${memory.decision_style}`);
      }
    }

    if (insights.length > 0) {
      parts.push("\n## REMEMBERED INSIGHTS");
      insights.slice(0, 10).forEach((insight) => {
        parts.push(`- [${insight.insight_type}] ${insight.content}`);
      });
    }

    if (recentDecisions.length > 0) {
      parts.push("\n## RECENT DECISIONS");
      recentDecisions.slice(0, 5).forEach((decision) => {
        parts.push(`- ${decision.decision_summary}`);
        if (decision.outcome) parts.push(`  Outcome: ${decision.outcome}`);
      });
    }

    return parts.join("\n");
  }, [memory, insights, recentDecisions]);

  return {
    memory,
    insights,
    recentDecisions,
    loading,
    saveMemory,
    addInsight,
    logDecision,
    getMemoryContext,
    getMemoryContextString,
    refetch: fetchMemory,
  };
};
