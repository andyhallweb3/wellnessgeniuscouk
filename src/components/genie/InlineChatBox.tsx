import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Loader2, 
  Brain,
  User,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Sparkles
} from "lucide-react";
import { ADVISOR_MODES, getModeById } from "@/components/advisor/AdvisorModes";
import GenieMessage, { TrustMetadata } from "@/components/genie/GenieMessage";
import { BriefData } from "@/components/genie/DailyBriefCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Message {
  role: "user" | "assistant";
  content: string;
  trustMetadata?: TrustMetadata;
}

interface InlineChatBoxProps {
  credits: number;
  onDeductCredits: (amount: number, mode: string) => Promise<boolean>;
  memoryContext: string | null;
  trustDisplayMode: "full" | "compact";
  onSaveSession?: (mode: string, messages: Message[], sessionId?: string | null) => Promise<string | null>;
  defaultMode?: string;
  briefData?: BriefData | null;
}

// Generate dynamic follow-up questions based on brief content
const generateBriefQuestions = (brief: BriefData | null | undefined): string[] => {
  if (!brief) {
    return [
      "What are the biggest risks to my business right now?",
      "What metrics should I be tracking weekly?",
      "What's one thing I should improve this month?",
    ];
  }

  const questions: string[] = [];

  // Add questions based on changes
  if (brief.changes.length > 0) {
    const warningChanges = brief.changes.filter(c => c.severity === "warning");
    const positiveChanges = brief.changes.filter(c => c.severity === "good");
    
    if (warningChanges.length > 0) {
      questions.push(`Why is "${warningChanges[0].text.slice(0, 40)}..." happening?`);
      questions.push("What should I do to address these warning signs?");
    }
    
    if (positiveChanges.length > 0) {
      questions.push("How can I capitalize on the positive trends?");
    }
    
    if (brief.changes.length > 1) {
      questions.push("Which of these changes should I prioritize?");
    }
  }

  // Add questions based on actions
  if (brief.actions.length > 0) {
    questions.push(`Tell me more about: "${brief.actions[0].slice(0, 50)}..."`);
    if (brief.actions.length > 1) {
      questions.push("Which action will have the biggest impact?");
    }
  }

  // Add questions based on confidence
  if (brief.confidence === "low") {
    questions.push("What data would help improve these insights?");
    questions.push("What should I start tracking to get better clarity?");
  } else if (brief.confidence === "medium") {
    questions.push("How can I improve the accuracy of these insights?");
  }

  // Add general business context questions
  questions.push("What questions should I be asking myself right now?");
  questions.push("What blind spots might I have in my business?");

  // Return unique questions, max 5
  return [...new Set(questions)].slice(0, 5);
};

const InlineChatBox = ({
  credits,
  onDeductCredits,
  memoryContext,
  trustDisplayMode,
  onSaveSession,
  defaultMode = "quick_question",
  briefData,
}: InlineChatBoxProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedMode, setSelectedMode] = useState(defaultMode);
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate dynamic questions based on brief content
  const suggestedQuestions = useMemo(() => generateBriefQuestions(briefData), [briefData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const streamChat = useCallback(async (userMessages: Message[], mode: string) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/genie-chat`;
    
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.access_token) {
      throw new Error("Not authenticated. Please log in.");
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

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="mt-6">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Header */}
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-3 border-b border-border cursor-pointer hover:bg-secondary/30 transition-colors">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-accent/10">
                <Brain size={14} className="text-accent" />
              </div>
              <span className="font-medium text-sm">Ask a Question</span>
              {messages.length > 0 && (
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                  {messages.length} messages
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNewConversation();
                  }}
                  className="h-7 px-2 text-xs"
                >
                  <RotateCcw size={12} className="mr-1" />
                  Clear
                </Button>
              )}
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          {/* Mode Selector */}
          <div className="px-3 py-2 border-b border-border bg-secondary/20">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Mode:</span>
              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="text-xs bg-background border border-border rounded px-2 py-1"
                disabled={isStreaming}
              >
                {ADVISOR_MODES.map((mode) => (
                  <option key={mode.id} value={mode.id} disabled={credits < mode.creditCost}>
                    {mode.icon} {mode.name} ({mode.creditCost}cr)
                  </option>
                ))}
              </select>
              <span className="text-xs text-muted-foreground ml-auto">
                {credits} credits available
              </span>
            </div>
          </div>

          {/* Messages Area */}
          <div className={cn(
            "overflow-y-auto p-3 space-y-3",
            messages.length === 0 ? "max-h-[180px]" : "max-h-[300px]"
          )}>
            {messages.length === 0 ? (
              <div className="py-2">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={12} className="text-accent" />
                  <p className="text-xs font-medium text-muted-foreground">
                    {briefData ? "Questions based on your brief" : "Suggested questions"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(prompt)}
                      className="text-xs px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 border border-border/50 transition-colors text-left leading-relaxed"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground/70 mt-3 text-center">
                  Click a question or type your own below
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
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
              ))
            )}
            
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
          <div className="p-3 border-t border-border">
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
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default InlineChatBox;
