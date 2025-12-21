import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Clock, ChevronRight, Sparkles, Loader2, Search, X, Tag, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";

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

interface SessionHistoryProps {
  sessions: GenieSession[];
  loading: boolean;
  onLoadSession: (session: GenieSession) => void;
  currentSessionId: string | null;
  onSummarize?: (sessionId: string) => Promise<string | null>;
  onUpdateTags?: (sessionId: string, tags: string[]) => Promise<boolean>;
  allTags?: string[];
}

const MODE_ICONS: Record<string, string> = {
  daily_operator: "📋",
  weekly_review: "📊",
  decision_support: "🎯",
  crisis_mode: "🚨",
  growth_planning: "📈",
};

const TAG_COLORS = [
  "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "bg-green-500/20 text-green-400 border-green-500/30",
  "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "bg-pink-500/20 text-pink-400 border-pink-500/30",
  "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
];

function getTagColor(tag: string): string {
  const index = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % TAG_COLORS.length;
  return TAG_COLORS[index];
}

function TagEditor({ 
  sessionId, 
  currentTags, 
  allTags, 
  onUpdateTags 
}: { 
  sessionId: string; 
  currentTags: string[]; 
  allTags: string[];
  onUpdateTags: (sessionId: string, tags: string[]) => Promise<boolean>;
}) {
  const [newTag, setNewTag] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleAddTag = async (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (!trimmedTag || currentTags.includes(trimmedTag)) return;
    
    await onUpdateTags(sessionId, [...currentTags, trimmedTag]);
    setNewTag("");
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    await onUpdateTags(sessionId, currentTags.filter(t => t !== tagToRemove));
  };

  const suggestedTags = allTags.filter(t => !currentTags.includes(t));

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => e.stopPropagation()}
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <Tag className="h-3 w-3 mr-1" />
          {currentTags.length > 0 ? `${currentTags.length} tag${currentTags.length > 1 ? 's' : ''}` : 'Add tag'}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 p-3" 
        onClick={(e) => e.stopPropagation()}
        align="start"
      >
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="New tag..."
              className="h-8 text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag(newTag);
                }
              }}
            />
            <Button
              size="sm"
              onClick={() => handleAddTag(newTag)}
              disabled={!newTag.trim()}
              className="h-8 px-2"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {currentTags.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Current tags</p>
              <div className="flex flex-wrap gap-1">
                {currentTags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant="outline"
                    className={cn("text-xs cursor-pointer", getTagColor(tag))}
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag}
                    <X className="h-2.5 w-2.5 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {suggestedTags.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Suggested</p>
              <div className="flex flex-wrap gap-1">
                {suggestedTags.slice(0, 6).map(tag => (
                  <Badge 
                    key={tag} 
                    variant="outline"
                    className="text-xs cursor-pointer hover:bg-secondary"
                    onClick={() => handleAddTag(tag)}
                  >
                    <Plus className="h-2.5 w-2.5 mr-0.5" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function SessionHistory({
  sessions,
  loading,
  onLoadSession,
  currentSessionId,
  onSummarize,
  onUpdateTags,
  allTags = [],
}: SessionHistoryProps) {
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredSessions = useMemo(() => {
    let result = sessions;
    
    // Filter by selected tag
    if (selectedTag) {
      result = result.filter(session => session.tags?.includes(selectedTag));
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(session => {
        if (session.summary?.toLowerCase().includes(query)) return true;
        if (session.tags?.some(tag => tag.toLowerCase().includes(query))) return true;
        return session.messages.some(msg => msg.content.toLowerCase().includes(query));
      });
    }
    
    return result;
  }, [sessions, searchQuery, selectedTag]);

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
    <div className="flex flex-col h-full">
      {/* Search Input */}
      <div className="p-2 border-b border-border/50 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="pl-9 pr-8 h-9 text-sm"
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
        
        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant="outline"
                className={cn(
                  "text-xs cursor-pointer transition-colors",
                  selectedTag === tag 
                    ? getTagColor(tag) 
                    : "hover:bg-secondary"
                )}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              >
                {tag}
                {selectedTag === tag && <X className="h-2.5 w-2.5 ml-1" />}
              </Badge>
            ))}
          </div>
        )}
        
        {(searchQuery || selectedTag) && (
          <p className="text-xs text-muted-foreground px-1">
            {filteredSessions.length} result{filteredSessions.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {filteredSessions.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No conversations match your filters
            </div>
          ) : (
            filteredSessions.map((session) => {
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
                      
                      {/* Tags Display */}
                      {session.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {session.tags.map(tag => (
                            <Badge 
                              key={tag} 
                              variant="outline"
                              className={cn("text-[10px] py-0 h-4", getTagColor(tag))}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
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
                      
                      <div className="flex items-center gap-1 mt-2">
                        {onUpdateTags && (
                          <TagEditor
                            sessionId={session.id}
                            currentTags={session.tags || []}
                            allTags={allTags}
                            onUpdateTags={onUpdateTags}
                          />
                        )}
                        {canSummarize && onSummarize && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleSummarize(e, session.id)}
                            disabled={summarizingId === session.id}
                            className="h-6 text-xs text-accent hover:text-accent"
                          >
                            {summarizingId === session.id ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Summarizing...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-3 w-3 mr-1" />
                                Summarize
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
