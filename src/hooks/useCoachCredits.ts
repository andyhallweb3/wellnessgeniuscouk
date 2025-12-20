import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CoachCredits {
  balance: number;
  monthlyAllowance: number;
}

interface CoachProfile {
  business_type: string | null;
  role: string | null;
  primary_goal: string | null;
  frustration: string | null;
  onboarding_completed: boolean;
}

export const useCoachCredits = () => {
  const { user } = useAuth();
  const [credits, setCredits] = useState<CoachCredits>({ balance: 40, monthlyAllowance: 40 });
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCreditsAndProfile = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch credits
      const { data: creditsData } = await supabase
        .from("coach_credits")
        .select("balance, monthly_allowance")
        .eq("user_id", user.id)
        .single();

      if (creditsData) {
        setCredits({
          balance: creditsData.balance,
          monthlyAllowance: creditsData.monthly_allowance,
        });
      } else {
        // Create initial credits record
        const { data: newCredits } = await supabase
          .from("coach_credits")
          .insert({ user_id: user.id, balance: 40, monthly_allowance: 40 })
          .select()
          .single();

        if (newCredits) {
          setCredits({
            balance: newCredits.balance,
            monthlyAllowance: newCredits.monthly_allowance,
          });
        }
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from("coach_profiles")
        .select("business_type, role, primary_goal, frustration, onboarding_completed")
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
    role: string;
    primary_goal: string;
    frustration: string;
  }) => {
    if (!user) return false;

    try {
      const { error } = await supabase.from("coach_profiles").upsert({
        user_id: user.id,
        ...profileData,
        onboarding_completed: true,
      });

      if (error) throw error;

      setProfile({ ...profileData, onboarding_completed: true });
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
