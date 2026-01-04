import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { 
  MessageSquare, 
  Plus, 
  Search, 
  X, 
  Clock, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Settings,
  FileText,
  Brain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  tags: string[];
}

interface ChatSidebarProps {
  sessions: GenieSession[];
  loading: boolean;
  currentSessionId: string | null;
  onLoadSession: (session: GenieSession) => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  onOpenDocuments: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const MODE_LABELS: Record<string, string> = {
  quick_question: "Quick Question",
  decision_support: "Decision Support",
  competitor_scan: "Competitor Scan",
  market_research: "Market Research",
  diagnostic: "Diagnostic",
  daily_briefing: "Daily Briefing",
  growth_planning: "Growth Planning",
  crisis_mode: "Crisis Mode",
};

export default function ChatSidebar({
  sessions,
  loading,
  currentSessionId,
  onLoadSession,
  onNewChat,
  onOpenSettings,
  onOpenDocuments,
  isCollapsed,
  onToggleCollapse,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSessions = sessions.filter((session) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      session.summary?.toLowerCase().includes(query) ||
      session.messages.some((m) => m.content.toLowerCase().includes(query))
    );
  });

  // Group sessions by date
  const groupedSessions = filteredSessions.reduce((groups, session) => {
    const date = new Date(session.started_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    let group: string;
    if (date.toDateString() === today.toDateString()) {
      group = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      group = "Yesterday";
    } else if (date > weekAgo) {
      group = "Previous 7 Days";
    } else {
      group = "Older";
    }

    if (!groups[group]) groups[group] = [];
    groups[group].push(session);
    return groups;
  }, {} as Record<string, GenieSession[]>);

  const groupOrder = ["Today", "Yesterday", "Previous 7 Days", "Older"];

  if (isCollapsed) {
    return (
      <div className="w-16 border-r border-border bg-secondary/30 flex flex-col items-center py-4 gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-10 w-10"
        >
          <ChevronRight size={20} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewChat}
          className="h-10 w-10"
          title="New chat"
        >
          <Plus size={20} />
        </Button>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenDocuments}
          className="h-10 w-10"
          title="Documents"
        >
          <FileText size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSettings}
          className="h-10 w-10"
          title="Settings"
        >
          <Settings size={18} />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-72 border-r border-border bg-secondary/30 flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-accent/10">
              <Brain size={18} className="text-accent" />
            </div>
            <span className="font-heading text-sm">AI Advisor</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8"
          >
            <ChevronLeft size={16} />
          </Button>
        </div>
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2 h-10"
          variant="outline"
        >
          <Plus size={16} />
          New chat
        </Button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-border/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="pl-9 h-9 text-sm bg-secondary/50"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Sessions List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Loading...
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              {searchQuery ? "No results found" : "No conversations yet"}
            </div>
          ) : (
            groupOrder.map((group) => {
              const groupSessions = groupedSessions[group];
              if (!groupSessions?.length) return null;

              return (
                <div key={group} className="mb-4">
                  <p className="text-xs text-muted-foreground px-2 py-1 font-medium">
                    {group}
                  </p>
                  <div className="space-y-0.5">
                    {groupSessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => onLoadSession(session)}
                        className={cn(
                          "w-full text-left px-3 py-2.5 rounded-lg transition-colors group",
                          currentSessionId === session.id
                            ? "bg-accent/15 text-foreground"
                            : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 mt-0.5 shrink-0 opacity-50" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">
                              {session.summary || MODE_LABELS[session.mode] || "Conversation"}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5 text-xs opacity-60">
                              <Clock className="h-3 w-3" />
                              <span>
                                {formatDistanceToNow(new Date(session.started_at), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border/50 flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenDocuments}
          className="flex-1 justify-start gap-2 h-9"
        >
          <FileText size={14} />
          <span className="text-xs">Documents</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenSettings}
          className="flex-1 justify-start gap-2 h-9"
        >
          <Settings size={14} />
          <span className="text-xs">Settings</span>
        </Button>
      </div>
    </div>
  );
}
