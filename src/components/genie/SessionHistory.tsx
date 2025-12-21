import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Clock, ChevronRight, Sparkles, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
  onSummarize?: (sessionId: string) => Promise<string | null>;
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
  onSummarize,
}: SessionHistoryProps) {
  const [summarizingId, setSummarizingId] = useState<string | null>(null);

  const handleSummarize = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!onSummarize) return;
    
    setSummarizingId(sessionId);
    try {
      await onSummarize(sessionId);
    } finally {
      setSummarizingId(null);
    }
  };

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
        {sessions.map((session) => {
          const hasAISummary = session.summary && session.summary.length > 100;
          const canSummarize = session.messages.length >= 4 && !hasAISummary;
          
          return (
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
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate flex-1">
                      {session.summary || "Conversation"}
                    </p>
                    {hasAISummary && (
                      <Sparkles className="h-3 w-3 text-accent shrink-0" />
                    )}
                  </div>
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
                  {canSummarize && onSummarize && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleSummarize(e, session.id)}
                      disabled={summarizingId === session.id}
                      className="mt-2 h-6 text-xs text-accent hover:text-accent"
                    >
                      {summarizingId === session.id ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Summarizing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3 mr-1" />
                          Generate AI Summary
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
