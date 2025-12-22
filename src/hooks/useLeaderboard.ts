import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface LeaderboardEntry {
  id: string;
  opted_in: boolean;
  score_band: string;
  business_type: string | null;
  size_band: string | null;
  streak_weeks: number;
  last_updated: string;
}

export interface LeaderboardStats {
  business_type: string | null;
  size_band: string | null;
  score_band: string;
  user_count: number;
  avg_streak: number;
}

export const useLeaderboard = () => {
  const { user } = useAuth();
  const [userEntry, setUserEntry] = useState<LeaderboardEntry | null>(null);
  const [leaderboardStats, setLeaderboardStats] = useState<LeaderboardStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch user's leaderboard entry
  const fetchUserEntry = useCallback(async () => {
    if (!user?.id) {
      setUserEntry(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("leaderboard_entries")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setUserEntry(data);
    } catch (err) {
      console.error("Error fetching leaderboard entry:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Fetch aggregated leaderboard stats
  const fetchLeaderboardStats = useCallback(async (
    businessType?: string | null,
    sizeBand?: string | null
  ) => {
    setStatsLoading(true);
    try {
      const { data, error } = await supabase
        .rpc("get_leaderboard_stats", {
          p_business_type: businessType || null,
          p_size_band: sizeBand || null,
        });

      if (error) throw error;
      setLeaderboardStats(data || []);
    } catch (err) {
      console.error("Error fetching leaderboard stats:", err);
      setLeaderboardStats([]);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Toggle opt-in status
  const toggleOptIn = useCallback(async (
    optIn: boolean,
    scoreBand: string,
    businessType?: string,
    sizeBand?: string,
    streakWeeks?: number
  ) => {
    if (!user?.id) return false;

    try {
      if (userEntry) {
        // Update existing entry
        const { error } = await supabase
          .from("leaderboard_entries")
          .update({
            opted_in: optIn,
            score_band: scoreBand,
            business_type: businessType || null,
            size_band: sizeBand || null,
            streak_weeks: streakWeeks || 0,
          })
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        // Create new entry
        const { error } = await supabase
          .from("leaderboard_entries")
          .insert({
            user_id: user.id,
            opted_in: optIn,
            score_band: scoreBand,
            business_type: businessType || null,
            size_band: sizeBand || null,
            streak_weeks: streakWeeks || 0,
          });

        if (error) throw error;
      }

      await fetchUserEntry();
      
      if (optIn) {
        toast.success("You're now visible on the leaderboard");
      } else {
        toast.success("You've been removed from the leaderboard");
      }
      
      return true;
    } catch (err) {
      console.error("Error toggling opt-in:", err);
      toast.error("Failed to update leaderboard settings");
      return false;
    }
  }, [user?.id, userEntry, fetchUserEntry]);

  // Update user's score and streak
  const updateScore = useCallback(async (
    scoreBand: string,
    streakWeeks: number
  ) => {
    if (!user?.id || !userEntry) return false;

    try {
      const { error } = await supabase
        .from("leaderboard_entries")
        .update({
          score_band: scoreBand,
          streak_weeks: streakWeeks,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      await fetchUserEntry();
      return true;
    } catch (err) {
      console.error("Error updating score:", err);
      return false;
    }
  }, [user?.id, userEntry, fetchUserEntry]);

  useEffect(() => {
    fetchUserEntry();
  }, [fetchUserEntry]);

  return {
    userEntry,
    leaderboardStats,
    loading,
    statsLoading,
    toggleOptIn,
    updateScore,
    fetchLeaderboardStats,
    refetch: fetchUserEntry,
  };
};
