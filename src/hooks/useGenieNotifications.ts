import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface GenieNotification {
  id: string;
  user_id: string;
  type: "alert" | "insight" | "reminder" | "nudge";
  priority: "high" | "medium" | "low";
  title: string;
  message: string;
  trigger_reason: string | null;
  read: boolean;
  dismissed: boolean;
  email_sent: boolean;
  created_at: string;
  expires_at: string | null;
}

export const useGenieNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<GenieNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("genie_notifications")
        .select("*")
        .eq("user_id", user.id)
        .eq("dismissed", false)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Type assertion since we know the shape matches
      setNotifications((data || []) as GenieNotification[]);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("genie-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "genie_notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as GenieNotification;
          setNotifications((prev) => [newNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (notificationId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("genie_notifications")
        .update({ read: true })
        .eq("id", notificationId)
        .eq("user_id", user.id);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  };

  const dismiss = async (notificationId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("genie_notifications")
        .update({ dismissed: true })
        .eq("id", notificationId)
        .eq("user_id", user.id);

      if (error) throw error;

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      return true;
    } catch (error) {
      console.error("Error dismissing notification:", error);
      return false;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    dismiss,
    refetch: fetchNotifications,
  };
};
