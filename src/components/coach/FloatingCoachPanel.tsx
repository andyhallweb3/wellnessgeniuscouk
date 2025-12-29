import { useState, useRef, useCallback, useEffect } from "react";
import { 
  Send, 
  Loader2, 
  User, 
  RotateCcw, 
  FolderOpen,
  Minimize2,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCoachCredits } from "@/hooks/useCoachCredits";
import { useCoachDocuments } from "@/hooks/useCoachDocuments";
import MarkdownRenderer from "./MarkdownRenderer";
import DocumentLibrary from "./DocumentLibrary";
import wellnessGeniusLogo from "@/assets/wellness-genius-logo-teal.png";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface FloatingCoachPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const FloatingCoachPanel = ({ isOpen, onClose }: FloatingCoachPanelProps) => {
  const { user } = useAuth();
  const { credits, profile, deductCredits, saveSession } = useCoachCredits();
  const { documents, getDocumentContext } = useCoachDocuments();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const streamChat = useCallback(async (userMessages: Message[]) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-coach-chat`;
    
    // Get the user's session for proper JWT authentication
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.access_token) {
      throw new Error("Not authenticated. Please log in to use AI Coach.");
    }
    
    // Build enhanced context with documents
    const documentContext = getDocumentContext();

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionData.session.access_token}`,
      },
      body: JSON.stringify({ 
        messages: userMessages,
        mode: "general",
        userContext: profile ? {
          business_type: profile.business_type,
          business_name: profile.business_name,
          business_size_band: profile.business_size_band,
          team_size: profile.team_size,
          role: profile.role,
          primary_goal: profile.primary_goal,
          frustration: profile.frustration,
          current_tech: profile.current_tech,
          ai_experience: profile.ai_experience,
          biggest_win: profile.biggest_win,
          decision_style: profile.decision_style,
        } : undefined,
        documentContext,
        _hp_field: "", // Honeypot field - must be empty for legitimate requests
      }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to get response");
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) => 
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
                );
              }
              return [...prev, { role: "assistant", content: assistantContent }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    return assistantContent;
  }, [profile, getDocumentContext]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    if (!user) {
      toast.error("Please sign in to use the coach");
      return;
    }

    if (credits.balance < 1) {
      toast.error("Not enough credits");
      return;
    }

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    try {
      await deductCredits(1, "general");
      const response = await streamChat(newMessages);
      await saveSession("general", userMessage.content, response, 1);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to get response");
      setMessages(prev => {
        if (prev[prev.length - 1]?.role === "assistant" && prev[prev.length - 1]?.content === "") {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewConversation = () => {
    setMessages([]);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="p-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <img src={wellnessGeniusLogo} alt="Wellness Genie" className="h-6 w-6 object-contain" />
              Wellness Genie
              {documents.length > 0 && (
                <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                  {documents.length} docs
                </span>
              )}
            </SheetTitle>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <Button variant="ghost" size="icon" onClick={handleNewConversation}>
                  <RotateCcw size={16} />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={onClose}>
                <Minimize2 size={16} />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-4 mt-2 shrink-0">
            <TabsTrigger value="chat" className="flex-1">
              <MessageSquare size={14} className="mr-1" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="library" className="flex-1">
              <FolderOpen size={14} className="mr-1" />
              Library ({documents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden m-0 p-4">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <img src={wellnessGeniusLogo} alt="Wellness Genie" className="h-12 w-12 object-contain mb-3" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Your personal wellness business assistant
                  </p>
                  {documents.length > 0 && (
                    <p className="text-xs text-accent">
                      Using context from {documents.length} uploaded documents
                    </p>
                  )}
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-2 ${message.role === "user" ? "justify-end" : ""}`}
                  >
                    {message.role === "assistant" && (
                      <div className="p-1 rounded-full bg-accent/10 h-fit shrink-0">
                        <img src={wellnessGeniusLogo} alt="Wellness Genie" className="h-5 w-5 object-contain" />
                      </div>
                    )}
                    <div
                      className={`rounded-xl px-3 py-2 max-w-[85%] ${
                        message.role === "user"
                          ? "bg-accent text-accent-foreground"
                          : "bg-secondary"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <MarkdownRenderer content={message.content} />
                      ) : (
                        <div className="text-sm">{message.content}</div>
                      )}
                    </div>
                    {message.role === "user" && (
                      <div className="p-1.5 rounded-full bg-secondary h-fit shrink-0">
                        <User size={14} />
                      </div>
                    )}
                  </div>
                ))
              )}
                {isStreaming && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-2">
                  <div className="p-1 rounded-full bg-accent/10 h-fit">
                    <img src={wellnessGeniusLogo} alt="Wellness Genie" className="h-5 w-5 object-contain" />
                  </div>
                  <div className="rounded-xl px-3 py-2 bg-secondary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="shrink-0 flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your business..."
                className="min-h-[48px] max-h-[100px] resize-none text-sm"
                disabled={isStreaming}
              />
              <Button
                variant="accent"
                size="icon"
                className="h-12 w-12 shrink-0"
                onClick={handleSend}
                disabled={!input.trim() || isStreaming || credits.balance < 1}
              >
                {isStreaming ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Send size={18} />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              {credits.balance} credits remaining
            </p>
          </TabsContent>

          <TabsContent value="library" className="flex-1 overflow-hidden m-0">
            <DocumentLibrary />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default FloatingCoachPanel;
