import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Loader2, 
  MessageSquare,
  X,
  Brain,
  User,
  Minimize2,
  Maximize2
} from "lucide-react";
import { ADVISOR_MODES, getModeById } from "@/components/advisor/AdvisorModes";
import MarkdownRenderer from "@/components/coach/MarkdownRenderer";
import GenieMessage, { TrustMetadata } from "@/components/genie/GenieMessage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  trustMetadata?: TrustMetadata;
}

interface FloatingChatDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credits: number;
  onDeductCredits: (amount: number, mode: string) => Promise<boolean>;
  memoryContext: string | null;
  trustDisplayMode: "full" | "compact";
  onSaveSession?: (mode: string, messages: Message[], sessionId?: string | null) => Promise<string | null>;
}

const FloatingChatDrawer = ({
  open,
  onOpenChange,
  credits,
  onDeductCredits,
  memoryContext,
  trustDisplayMode,
  onSaveSession,
}: FloatingChatDrawerProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedMode, setSelectedMode] = useState("quick_question");
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const streamChat = useCallback(async (userMessages: Message[], mode: string) => {
    const functionName = mode === "codex_assistant" ? "codex-assistant" : "genie-chat";
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`;
    
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.access_token) {
      throw new Error("Not authenticated. Please log in to use Genie.");
    }

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionData.session.access_token}`,
      },
      body: JSON.stringify({ 
        messages: userMessages.map(m => ({ role: m.role, content: m.content })),
        mode,
        memoryContext: memoryContext || undefined,
        _hp_field: "",
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
    let trustMetadata: TrustMetadata | null = null;

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
          
          if (parsed.type === "trust_metadata") {
            trustMetadata = {
              confidenceLevel: parsed.confidenceLevel,
              dataSensitivity: parsed.dataSensitivity,
              isInference: parsed.isInference,
              dataSignals: parsed.dataSignals,
              explanation: parsed.explanation,
              factors: parsed.factors,
            };
            continue;
          }
          
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) => 
                  i === prev.length - 1 ? { ...m, content: assistantContent, trustMetadata: trustMetadata || undefined } : m
                );
              }
              return [...prev, { role: "assistant", content: assistantContent, trustMetadata: trustMetadata || undefined }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    return assistantContent;
  }, [memoryContext]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const modeConfig = getModeById(selectedMode);
    
    if (credits < modeConfig.creditCost) {
      toast.error("Not enough credits for this mode.");
      return;
    }

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    try {
      const deducted = await onDeductCredits(modeConfig.creditCost, selectedMode);
      if (!deducted) {
        throw new Error("Failed to deduct credits");
      }

      await streamChat(newMessages, selectedMode);
      
      if (onSaveSession) {
        await onSaveSession(selectedMode, newMessages);
      }
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

  const currentMode = getModeById(selectedMode);

  if (!open) {
    return (
      <Button
        onClick={() => onOpenChange(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        variant="accent"
      >
        <MessageSquare size={24} />
      </Button>
    );
  }

  return (
    <div 
      className={cn(
        "fixed z-50 bg-card border border-border rounded-xl shadow-2xl flex flex-col transition-all duration-200",
        isExpanded 
          ? "bottom-4 right-4 left-4 top-20 md:left-auto md:w-[600px] md:top-24" 
          : "bottom-4 right-4 w-[380px] h-[500px] md:w-[420px] md:h-[560px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-accent/10">
            <Brain size={16} className="text-accent" />
          </div>
          <span className="font-medium text-sm">AI Advisor</span>
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="text-xs bg-secondary border border-border rounded px-2 py-1 ml-2"
            disabled={isStreaming}
          >
            {ADVISOR_MODES.map((mode) => (
              <option key={mode.id} value={mode.id} disabled={credits < mode.creditCost}>
                {mode.icon} {mode.name} ({mode.creditCost}cr)
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleNewConversation}
              className="h-8 w-8 p-0"
              title="New conversation"
            >
              <MessageSquare size={14} />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 p-0"
          >
            <X size={14} />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <span className="text-3xl mb-3 block">{currentMode.icon}</span>
            <h3 className="font-heading text-sm mb-1">{currentMode.name}</h3>
            <p className="text-xs text-muted-foreground mb-4 max-w-[280px] mx-auto">
              {currentMode.description}
            </p>
            <div className="space-y-1.5">
              {currentMode.examples.slice(0, 2).map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(example)}
                  className="w-full text-left text-xs px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary border border-border/50 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(message.role === "user" && "flex justify-end")}
          >
            {message.role === "assistant" ? (
              <GenieMessage 
                content={message.content} 
                mode={selectedMode}
                trustMetadata={message.trustMetadata}
                displayMode={trustDisplayMode}
              />
            ) : (
              <div className="flex gap-2 justify-end">
                <div className="rounded-lg px-3 py-2 max-w-[85%] bg-accent text-accent-foreground">
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </div>
                </div>
                <div className="p-1.5 rounded-full bg-secondary h-fit shrink-0">
                  <User size={12} />
                </div>
              </div>
            )}
          </div>
        ))}
        
        {isStreaming && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-2">
            <div className="p-1.5 rounded-full bg-accent/10 h-fit shrink-0">
              <Brain size={12} className="text-accent" />
            </div>
            <div className="rounded-lg px-3 py-2 bg-secondary">
              <Loader2 className="h-3 w-3 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border shrink-0">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask in ${currentMode.name} mode...`}
            className="min-h-[44px] max-h-[80px] resize-none text-sm"
            disabled={isStreaming}
          />
          <Button
            variant="accent"
            size="icon"
            className="h-11 w-11 shrink-0"
            onClick={handleSend}
            disabled={!input.trim() || isStreaming || credits < currentMode.creditCost}
          >
            {isStreaming ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Send size={16} />
            )}
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>{credits} credits available</span>
          <span>{currentMode.creditCost} credits per message</span>
        </div>
      </div>
    </div>
  );
};

export default FloatingChatDrawer;
