import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_enabled: boolean;
  email_frequency: "instant" | "daily_digest" | "weekly_digest" | "never";
  email_priority_threshold: "all" | "medium_and_high" | "high" | "none";
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  quiet_days: string[];
  push_enabled: boolean;
  push_subscription: Record<string, unknown> | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

const DEFAULT_PREFERENCES: Omit<NotificationPreferences, "id" | "user_id" | "created_at" | "updated_at"> = {
  email_enabled: true,
  email_frequency: "instant",
  email_priority_threshold: "high",
  quiet_hours_enabled: false,
  quiet_hours_start: "22:00",
  quiet_hours_end: "08:00",
  quiet_days: [],
  push_enabled: false,
  push_subscription: null,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
};

export const useNotificationPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPreferences = useCallback(async () => {
    if (!user) {
      setPreferences(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences(data as NotificationPreferences);
      } else {
        // Create default preferences
        const insertData = {
          user_id: user.id,
          email_enabled: DEFAULT_PREFERENCES.email_enabled,
          email_frequency: DEFAULT_PREFERENCES.email_frequency,
          email_priority_threshold: DEFAULT_PREFERENCES.email_priority_threshold,
          quiet_hours_enabled: DEFAULT_PREFERENCES.quiet_hours_enabled,
          quiet_hours_start: DEFAULT_PREFERENCES.quiet_hours_start,
          quiet_hours_end: DEFAULT_PREFERENCES.quiet_hours_end,
          quiet_days: DEFAULT_PREFERENCES.quiet_days,
          push_enabled: DEFAULT_PREFERENCES.push_enabled,
          timezone: DEFAULT_PREFERENCES.timezone,
        };
        
        const { data: newData, error: insertError } = await supabase
          .from("notification_preferences")
          .insert(insertData)
          .select()
          .single();

        if (insertError) throw insertError;
        setPreferences(newData as NotificationPreferences);
      }
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreferences = async (
    updates: Partial<Omit<NotificationPreferences, "id" | "user_id" | "created_at" | "updated_at">>
  ): Promise<boolean> => {
    if (!user || !preferences) return false;

    setSaving(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase
        .from("notification_preferences")
        .update(updates as any)
        .eq("user_id", user.id);

      if (error) throw error;

      setPreferences((prev) => (prev ? { ...prev, ...updates } : null));
      return true;
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    preferences,
    loading,
    saving,
    updatePreferences,
    refetch: fetchPreferences,
  };
};
