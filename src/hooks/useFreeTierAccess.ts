import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FREE_TRIAL_CREDITS, FREE_TRIAL_DAYS } from "@/components/advisor/AdvisorModes";

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

    const fetchOrCreateAccess = async () => {
      // First, try to get existing access
      const { data, error } = await supabase
        .from("free_tier_access")
        .select("*")
        .eq("user_id", user.id)
        .eq("feature", feature)
        .maybeSingle();

      if (error) {
        console.error("Error fetching free tier access:", error);
        setIsLoading(false);
        return;
      }
      
      if (data) {
        setAccess(data);
        setIsLoading(false);
        return;
      }

      // No existing access - create new free trial with 15 days
      const trialExpiresAt = new Date();
      trialExpiresAt.setDate(trialExpiresAt.getDate() + FREE_TRIAL_DAYS);

      const { data: newAccess, error: createError } = await supabase
        .from("free_tier_access")
        .insert({
          user_id: user.id,
          feature,
          credits_remaining: FREE_TRIAL_CREDITS,
          trial_expires_at: trialExpiresAt.toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating free tier access:", createError);
      } else {
        setAccess(newAccess);
      }
      
      setIsLoading(false);
    };

    fetchOrCreateAccess();
  }, [user, feature]);

  const hasCredits = access && access.credits_remaining > 0;
  const isTrialActive = access && new Date(access.trial_expires_at) > new Date();
  const hasAccess = hasCredits && isTrialActive;

  // Calculate days remaining
  const daysRemaining = access 
    ? Math.max(0, Math.ceil((new Date(access.trial_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

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
    daysRemaining,
    trialExpiresAt: access?.trial_expires_at,
    useCredit,
  };
};
