import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CoachCredits {
  balance: number;
  monthlyAllowance: number;
  tier: "pro" | "expert" | null;
  nextResetDate: string | null;
}

interface CoachProfile {
  business_type: string | null;
  business_name: string | null;
  business_size_band: string | null;
  team_size: string | null;
  role: string | null;
  primary_goal: string | null;
  frustration: string | null;
  current_tech: string | null;
  ai_experience: string | null;
  biggest_win: string | null;
  decision_style: string | null;
  onboarding_completed: boolean;
}

// Free credits for non-subscribers
const FREE_CREDITS = 5;

export const useCoachCredits = () => {
  const { user } = useAuth();
  const [credits, setCredits] = useState<CoachCredits>({ 
    balance: FREE_CREDITS, 
    monthlyAllowance: FREE_CREDITS, 
    tier: null,
    nextResetDate: null 
  });
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCreditsAndProfile = useCallback(async () => {
    if (!user) return;

    try {
      // First, check subscription to get tier and monthly allowance
      const { data: sessionData } = await supabase.auth.getSession();
      let subscriptionTier: "pro" | "expert" | null = null;
      let subscriptionMonthlyAllowance = 40; // Default for Pro

      if (sessionData?.session?.access_token) {
        const { data: subData, error: subError } = await supabase.functions.invoke(
          "check-coach-subscription",
          {
            headers: {
              Authorization: `Bearer ${sessionData.session.access_token}`,
            },
          }
        );

        if (!subError && subData?.subscribed) {
          subscriptionTier = subData.tier || "pro";
          subscriptionMonthlyAllowance = subData.monthly_allowance || (subscriptionTier === "expert" ? 120 : 40);
        }
      }

      // Fetch credits from database
      const { data: creditsData } = await supabase
        .from("coach_credits")
        .select("balance, monthly_allowance, last_reset_at")
        .eq("user_id", user.id)
        .single();

      // Calculate next reset date (1 month from last_reset_at)
      const calculateNextResetDate = (lastResetAt: string): string => {
        const lastReset = new Date(lastResetAt);
        const nextReset = new Date(lastReset);
        nextReset.setMonth(nextReset.getMonth() + 1);
        return nextReset.toISOString();
      };

      if (creditsData) {
        const nextResetDate = calculateNextResetDate(creditsData.last_reset_at);
        
        // If subscription tier changed, update monthly allowance in DB
        if (subscriptionTier && creditsData.monthly_allowance !== subscriptionMonthlyAllowance) {
          const { error: updateError } = await supabase
            .from("coach_credits")
            .update({ monthly_allowance: subscriptionMonthlyAllowance })
            .eq("user_id", user.id);

          if (!updateError) {
            setCredits({
              balance: creditsData.balance,
              monthlyAllowance: subscriptionMonthlyAllowance,
              tier: subscriptionTier,
              nextResetDate,
            });
          } else {
            setCredits({
              balance: creditsData.balance,
              monthlyAllowance: creditsData.monthly_allowance,
              tier: subscriptionTier,
              nextResetDate,
            });
          }
        } else {
          setCredits({
            balance: creditsData.balance,
            monthlyAllowance: subscriptionTier ? subscriptionMonthlyAllowance : creditsData.monthly_allowance,
            tier: subscriptionTier,
            nextResetDate,
          });
        }
      } else {
        // Create initial credits record - use subscription allowance if subscribed, otherwise free credits
        const initialBalance = subscriptionTier ? subscriptionMonthlyAllowance : FREE_CREDITS;
        const initialAllowance = subscriptionTier ? subscriptionMonthlyAllowance : FREE_CREDITS;
        
        const { data: newCredits } = await supabase
          .from("coach_credits")
          .insert({ 
            user_id: user.id, 
            balance: initialBalance, 
            monthly_allowance: initialAllowance 
          })
          .select()
          .single();

        if (newCredits) {
          const nextResetDate = calculateNextResetDate(newCredits.last_reset_at);
          setCredits({
            balance: newCredits.balance,
            monthlyAllowance: newCredits.monthly_allowance,
            tier: subscriptionTier,
            nextResetDate,
          });
        }
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from("coach_profiles")
        .select("business_type, business_name, business_size_band, team_size, role, primary_goal, frustration, current_tech, ai_experience, biggest_win, decision_style, onboarding_completed")
        .eq("user_id", user.id)
        .single();

      setProfile(profileData || null);
    } catch (error) {
      console.error("Error fetching coach data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCreditsAndProfile();
  }, [fetchCreditsAndProfile]);

  const deductCredits = async (amount: number, mode: string) => {
    if (!user) return false;

    if (credits.balance < amount) {
      return false;
    }

    try {
      // Update balance
      const newBalance = credits.balance - amount;
      const { error: updateError } = await supabase
        .from("coach_credits")
        .update({ balance: newBalance })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      // Record transaction
      await supabase.from("credit_transactions").insert({
        user_id: user.id,
        change_amount: -amount,
        reason: "mode_use",
        mode,
      });

      setCredits((prev) => ({ ...prev, balance: newBalance }));
      return true;
    } catch (error) {
      console.error("Error deducting credits:", error);
      return false;
    }
  };

  const saveProfile = async (profileData: {
    business_type: string;
    business_name?: string;
    business_size_band?: string;
    team_size?: string;
    role: string;
    primary_goal: string;
    frustration?: string;
    current_tech?: string;
    ai_experience?: string;
    biggest_win?: string;
    decision_style?: string;
  }) => {
    if (!user) return false;

    try {
      const { error } = await supabase.from("coach_profiles").upsert({
        user_id: user.id,
        ...profileData,
        onboarding_completed: true,
      });

      if (error) throw error;

      setProfile({ 
        ...profileData, 
        business_name: profileData.business_name || null,
        business_size_band: profileData.business_size_band || null,
        team_size: profileData.team_size || null,
        frustration: profileData.frustration || null,
        current_tech: profileData.current_tech || null,
        ai_experience: profileData.ai_experience || null,
        biggest_win: profileData.biggest_win || null,
        decision_style: profileData.decision_style || null,
        onboarding_completed: true 
      });
      return true;
    } catch (error) {
      console.error("Error saving profile:", error);
      return false;
    }
  };

  const saveSession = async (
    mode: string,
    promptInput: string,
    outputText: string,
    creditCost: number
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("agent_sessions")
        .insert({
          user_id: user.id,
          mode,
          prompt_input: promptInput,
          output_text: outputText,
          credit_cost: creditCost,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error saving session:", error);
      return null;
    }
  };

  const toggleSaveSession = async (sessionId: string, saved: boolean) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("agent_sessions")
        .update({ saved })
        .eq("id", sessionId)
        .eq("user_id", user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating session:", error);
      return false;
    }
  };

  return {
    credits,
    profile,
    loading,
    deductCredits,
    saveProfile,
    saveSession,
    toggleSaveSession,
    refetch: fetchCreditsAndProfile,
  };
};
