import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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

interface SessionHistoryProps {
  sessions: GenieSession[];
  loading: boolean;
  onLoadSession: (session: GenieSession) => void;
  currentSessionId: string | null;
}

const MODE_ICONS: Record<string, string> = {
  daily_operator: "📋",
  weekly_review: "📊",
  decision_support: "🎯",
  crisis_mode: "🚨",
  growth_planning: "📈",
};

export default function SessionHistory({
  sessions,
  loading,
  onLoadSession,
  currentSessionId,
}: SessionHistoryProps) {
  if (loading) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        Loading history...
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        No previous conversations yet.
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => onLoadSession(session)}
            className={cn(
              "w-full text-left p-3 rounded-lg border transition-colors",
              currentSessionId === session.id
                ? "bg-accent/10 border-accent/30"
                : "bg-secondary/50 border-border/50 hover:bg-secondary"
            )}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg shrink-0">
                {MODE_ICONS[session.mode] || "💬"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {session.summary || "Conversation"}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(new Date(session.started_at), {
                      addSuffix: true,
                    })}
                  </span>
                  <span className="text-muted-foreground/50">•</span>
                  <MessageSquare className="h-3 w-3" />
                  <span>{session.messages.length} messages</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}
