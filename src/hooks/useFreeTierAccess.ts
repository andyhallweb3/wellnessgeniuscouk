import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface FreeTierAccess {
  id: string;
  feature: string;
  credits_remaining: number;
  trial_expires_at: string;
}

export const useFreeTierAccess = (feature: string = "advisor") => {
  const { user } = useAuth();
  const [access, setAccess] = useState<FreeTierAccess | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setAccess(null);
      setIsLoading(false);
      return;
    }

    const fetchAccess = async () => {
      const { data, error } = await supabase
        .from("free_tier_access")
        .select("*")
        .eq("user_id", user.id)
        .eq("feature", feature)
        .maybeSingle();

      if (error) {
        console.error("Error fetching free tier access:", error);
      }
      
      setAccess(data);
      setIsLoading(false);
    };

    fetchAccess();
  }, [user, feature]);

  const hasCredits = access && access.credits_remaining > 0;
  const isTrialActive = access && new Date(access.trial_expires_at) > new Date();
  const hasAccess = hasCredits && isTrialActive;

  const useCredit = async () => {
    if (!user || !access || access.credits_remaining <= 0) {
      return { success: false, error: "No credits remaining" };
    }

    const { error } = await supabase
      .from("free_tier_access")
      .update({ 
        credits_remaining: access.credits_remaining - 1,
        updated_at: new Date().toISOString()
      })
      .eq("id", access.id);

    if (error) {
      return { success: false, error: error.message };
    }

    setAccess(prev => prev ? { ...prev, credits_remaining: prev.credits_remaining - 1 } : null);
    return { success: true, error: null };
  };

  return {
    access,
    isLoading,
    hasCredits,
    isTrialActive,
    hasAccess,
    creditsRemaining: access?.credits_remaining ?? 0,
    trialExpiresAt: access?.trial_expires_at,
    useCredit,
  };
};
