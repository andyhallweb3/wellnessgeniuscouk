import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type TrustDisplayMode = "compact" | "full";

export interface TrustSettings {
  displayMode: TrustDisplayMode;
  isLoading: boolean;
  updateDisplayMode: (mode: TrustDisplayMode) => Promise<boolean>;
}

export function useTrustSettings(): TrustSettings {
  const { user } = useAuth();
  const [displayMode, setDisplayMode] = useState<TrustDisplayMode>("compact");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("business_memory")
          .select("trust_display_mode")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching trust settings:", error);
        } else if (data?.trust_display_mode) {
          setDisplayMode(data.trust_display_mode as TrustDisplayMode);
        }
      } catch (err) {
        console.error("Error in fetchSettings:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  const updateDisplayMode = useCallback(async (mode: TrustDisplayMode): Promise<boolean> => {
    if (!user) return false;

    try {
      // Check if record exists
      const { data: existing } = await supabase
        .from("business_memory")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("business_memory")
          .update({ trust_display_mode: mode })
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("business_memory")
          .insert({ user_id: user.id, trust_display_mode: mode });

        if (error) throw error;
      }

      setDisplayMode(mode);
      return true;
    } catch (err) {
      console.error("Error updating trust settings:", err);
      return false;
    }
  }, [user]);

  return { displayMode, isLoading, updateDisplayMode };
}
