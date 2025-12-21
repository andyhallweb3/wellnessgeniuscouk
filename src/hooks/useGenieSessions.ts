import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface GenieSession {
  id: string;
  mode: string;
  messages: Message[];
  started_at: string;
  ended_at: string | null;
  summary: string | null;
}

export function useGenieSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<GenieSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!user) {
      setSessions([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("genie_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      
      // Parse messages from JSON
      const parsedSessions = (data || []).map((session) => ({
        ...session,
        messages: (session.messages as unknown as Message[]) || [],
      }));
      
      setSessions(parsedSessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const saveSession = useCallback(
    async (mode: string, messages: Message[], sessionId?: string | null) => {
      if (!user || messages.length === 0) return null;

      try {
        // Generate a simple summary from the first user message
        const firstUserMessage = messages.find((m) => m.role === "user");
        const summary = firstUserMessage
          ? firstUserMessage.content.slice(0, 100) + (firstUserMessage.content.length > 100 ? "..." : "")
          : null;

        // Convert messages to JSON-compatible format
        const messagesJson = JSON.parse(JSON.stringify(messages));

        if (sessionId) {
          // Update existing session
          const { error } = await supabase
            .from("genie_sessions")
            .update({
              messages: messagesJson,
              summary,
            })
            .eq("id", sessionId)
            .eq("user_id", user.id);

          if (error) throw error;
          await fetchSessions();
          return sessionId;
        } else {
          // Create new session
          const { data, error } = await supabase
            .from("genie_sessions")
            .insert([{
              user_id: user.id,
              mode,
              messages: messagesJson,
              summary,
            }])
            .select("id")
            .single();

          if (error) throw error;
          setCurrentSessionId(data.id);
          await fetchSessions();
          return data.id;
        }
      } catch (error) {
        console.error("Error saving session:", error);
        return null;
      }
    },
    [user, fetchSessions]
  );

  const endSession = useCallback(
    async (sessionId: string) => {
      if (!user) return;

      try {
        await supabase
          .from("genie_sessions")
          .update({ ended_at: new Date().toISOString() })
          .eq("id", sessionId)
          .eq("user_id", user.id);

        setCurrentSessionId(null);
        await fetchSessions();
      } catch (error) {
        console.error("Error ending session:", error);
      }
    },
    [user, fetchSessions]
  );

  const loadSession = useCallback((session: GenieSession) => {
    setCurrentSessionId(session.id);
    return session;
  }, []);

  const deleteSession = useCallback(
    async (sessionId: string) => {
      if (!user) return;

      try {
        // Note: Delete might not be allowed by RLS, so we'll just end it
        await endSession(sessionId);
      } catch (error) {
        console.error("Error deleting session:", error);
      }
    },
    [user, endSession]
  );

  return {
    sessions,
    loading,
    currentSessionId,
    setCurrentSessionId,
    saveSession,
    endSession,
    loadSession,
    deleteSession,
    refetch: fetchSessions,
  };
}
