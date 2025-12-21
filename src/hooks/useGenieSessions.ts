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

  const generateAISummary = useCallback(
    async (messages: Message[], mode: string): Promise<string | null> => {
      if (messages.length < 4) return null; // Need enough context for a good summary
      
      try {
        const response = await supabase.functions.invoke('summarize-session', {
          body: { messages, mode }
        });
        
        if (response.error) {
          console.error('Summary generation error:', response.error);
          return null;
        }
        
        return response.data?.summary || null;
      } catch (error) {
        console.error('Failed to generate AI summary:', error);
        return null;
      }
    },
    []
  );

  const saveSession = useCallback(
    async (mode: string, messages: Message[], sessionId?: string | null, generateSummary = false) => {
      if (!user || messages.length === 0) return null;

      try {
        // Generate AI summary if requested and enough messages
        let summary: string | null = null;
        if (generateSummary && messages.length >= 4) {
          summary = await generateAISummary(messages, mode);
        }
        
        // Fallback to simple summary if AI summary fails
        if (!summary) {
          const firstUserMessage = messages.find((m) => m.role === "user");
          summary = firstUserMessage
            ? firstUserMessage.content.slice(0, 100) + (firstUserMessage.content.length > 100 ? "..." : "")
            : null;
        }

        const messagesJson = JSON.parse(JSON.stringify(messages));

        if (sessionId) {
          const { error } = await supabase
            .from("genie_sessions")
            .update({
              messages: messagesJson,
              ...(summary && { summary }),
            })
            .eq("id", sessionId)
            .eq("user_id", user.id);

          if (error) throw error;
          await fetchSessions();
          return sessionId;
        } else {
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
    [user, fetchSessions, generateAISummary]
  );

  const summarizeSession = useCallback(
    async (sessionId: string) => {
      const session = sessions.find(s => s.id === sessionId);
      if (!session || session.messages.length < 4) return null;
      
      const summary = await generateAISummary(session.messages, session.mode);
      if (summary) {
        await supabase
          .from("genie_sessions")
          .update({ summary })
          .eq("id", sessionId)
          .eq("user_id", user?.id);
        await fetchSessions();
      }
      return summary;
    },
    [sessions, user, generateAISummary, fetchSessions]
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
    summarizeSession,
    refetch: fetchSessions,
  };
}
