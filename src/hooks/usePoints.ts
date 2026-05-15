import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PointsData {
  total: number;
  recentEvents: Array<{ points: number; description: string; created_at: string }>;
  loading: boolean;
}

export const POINT_EVENTS = {
  GENIE_SESSION: { type: "genie_session", points: 10 },
  FIRST_GENIE_SESSION: { type: "first_genie_session", points: 100 },
  KPI_SAVED: { type: "kpi_saved", points: 25 },
  DOCUMENT_UPLOADED: { type: "document_uploaded", points: 30 },
  COMMUNITY_POST: { type: "community_post", points: 20 },
  REFERRAL: { type: "referral", points: 500 },
} as const;

export function usePoints() {
  const { user } = useAuth();
  const [data, setData] = useState<PointsData>({ total: 0, recentEvents: [], loading: true });

  const fetchPoints = useCallback(async () => {
    if (!user) { setData(d => ({ ...d, loading: false })); return; }
    const { data: rows } = await supabase
      .from("points_ledger")
      .select("points, description, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    const { data: aggregate } = await supabase
      .from("user_points")
      .select("total_points")
      .eq("user_id", user.id)
      .maybeSingle();
    setData({
      total: aggregate?.total_points ?? 0,
      recentEvents: rows ?? [],
      loading: false,
    });
  }, [user]);

  useEffect(() => { fetchPoints(); }, [fetchPoints]);

  const awardPoints = useCallback(async (
    eventType: string,
    points: number,
    description: string,
    metadata?: Record<string, unknown>
  ) => {
    if (!user) return false;
    try {
      await supabase.rpc("award_points", {
        p_user_id: user.id,
        p_points: points,
        p_event_type: eventType,
        p_description: description,
        p_metadata: metadata ?? {},
      });
      setData(prev => ({
        ...prev,
        total: prev.total + points,
        recentEvents: [{ points, description, created_at: new Date().toISOString() }, ...prev.recentEvents].slice(0, 10),
      }));
      return true;
    } catch {
      return false;
    }
  }, [user]);

  const awardGenieSession = useCallback(async () => {
    if (!user) return;
    // Check if this is their first session ever
    const { count } = await supabase
      .from("points_ledger")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("event_type", "first_genie_session");
    if ((count ?? 0) === 0) {
      await awardPoints("first_genie_session", 100, "First AI Advisor session");
    } else {
      await awardPoints("genie_session", 10, "Completed an AI Advisor session");
    }
  }, [user, awardPoints]);

  // Tier thresholds and rewards
  const tier = data.total >= 5000 ? "Gold" : data.total >= 1500 ? "Silver" : data.total >= 500 ? "Bronze" : "Starter";
  const nextTierPoints = data.total >= 5000 ? null : data.total >= 1500 ? 5000 : data.total >= 500 ? 1500 : 500;
  const nextTierProgress = nextTierPoints
    ? Math.min(100, Math.round((data.total / nextTierPoints) * 100))
    : 100;

  return { ...data, awardPoints, awardGenieSession, tier, nextTierPoints, nextTierProgress };
}
