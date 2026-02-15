import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Loader2, 
  Brain,
  User,
  Sparkles,
  Globe,
  ArrowUp,
  Paperclip,
  Sun,
  Zap,
  Target,
  Search,
  TrendingUp,
  AlertTriangle,
  Lock
} from "lucide-react";
import { ADVISOR_MODES, getModeById, WEB_RESEARCH_MODES, CREDIT_COST_PER_MESSAGE, PREMIUM_MODES } from "@/components/advisor/AdvisorModes";
import { getAdvisorIcon } from "@/components/advisor/AdvisorIcons";
import GenieMessage, { TrustMetadata } from "@/components/genie/GenieMessage";
import { BriefData } from "@/components/genie/DailyBriefCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Message {
  role: "user" | "assistant";
  content: string;
  trustMetadata?: TrustMetadata;
}

interface MemoryContextObject {
  business_name?: string | null;
  business_type?: string | null;
  team_size?: string | null;
  primary_goal?: string | null;
  biggest_challenge?: string | null;
  revenue_model?: string | null;
  annual_revenue_band?: string | null;
  key_metrics?: string[] | null;
  known_weak_spots?: string[] | null;
  communication_style?: string | null;
  decision_style?: string | null;
}

interface ChatInterfaceProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  selectedMode: string;
  setSelectedMode: (mode: string) => void;
  credits: number;
  onDeductCredits: (amount: number, mode: string) => Promise<boolean>;
  memoryContext: MemoryContextObject | null;
  trustDisplayMode: "full" | "compact";
  onSaveSession?: (mode: string, messages: Message[], sessionId?: string | null) => Promise<string | null>;
  briefData?: BriefData | null;
  isBriefLoading?: boolean;
  onGenerateBrief?: () => void;
  documents?: Array<{ id: string; file_name: string; extracted_text: string | null; }>;
  onUploadDocument?: (file: File) => Promise<boolean>;
  uploadingDocument?: boolean;
  businessName?: string;
  daysRemaining?: number;
  isFreeTrial?: boolean;
}

// Quick action suggestions for empty state
const QUICK_ACTIONS = [
  { icon: Sun, label: "Daily briefing", prompt: "Give me my daily briefing", mode: "daily_briefing" },
  { icon: Target, label: "Make a decision", prompt: "Help me decide on ", mode: "decision_support" },
  { icon: Search, label: "Research competitors", prompt: "Analyze my competitors in ", mode: "competitor_scan" },
  { icon: TrendingUp, label: "Growth ideas", prompt: "Give me growth ideas for ", mode: "growth_planning" },
];

export default function ChatInterface({
  messages,
  setMessages,
  selectedMode,
  setSelectedMode,
  credits,
  onDeductCredits,
  memoryContext,
  trustDisplayMode,
  onSaveSession,
  briefData,
  isBriefLoading,
  onGenerateBrief,
  documents = [],
  onUploadDocument,
  uploadingDocument = false,
  businessName,
  daysRemaining,
  isFreeTrial,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Document context for AI
  const documentContext = useMemo(() => {
    if (documents.length === 0) return "";
    const contextParts = documents
      .filter(doc => doc.extracted_text)
      .map(doc => `[Document: ${doc.file_name}]\n${doc.extracted_text?.slice(0, 2000)}`);
    return contextParts.length > 0 ? contextParts.join("\n\n") : "";
  }, [documents]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = useCallback(async (userMessages: Message[], mode: string, webContext?: string) => {
    const functionName = mode === "codex_assistant" ? "codex-assistant" : "genie-chat";
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`;
    
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
        documentContext: documentContext || undefined,
        webContext: webContext || undefined,
        _hp_field: "",
        isTrialMode: isFreeTrial || false,
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
  }, [documentContext, memoryContext, setMessages]);

  // Web research for relevant modes - transform query for better results
  const performWebResearch = useCallback(async (query: string, mode: string): Promise<string> => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.access_token) return "";

      // Transform query based on mode for better search results
      let searchQuery = query;
      if (mode === "competitor_scan") {
        // Extract key terms and create a better search query
        const keyTerms = query
          .replace(/^(analyze|analyse|find|show|list|get)\s+(my\s+)?competitors?\s+(in|for)?\s*/i, "")
          .replace(/wellness\s+technology/i, "wellness technology companies apps platforms")
          .replace(/wellness\s+tech/i, "wellness tech startups companies apps")
          .replace(/fitness\s+tech/i, "fitness technology companies apps platforms");
        
        searchQuery = `${keyTerms} companies startups competitors 2024 2025`.trim();
      } else if (mode === "market_research") {
        searchQuery = `${query} market trends funding news 2024 2025`.trim();
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/genie-web-search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({ query: searchQuery, searchType: "search" }),
        }
      );

      if (!response.ok) return "";

      const data = await response.json();
      if (!data.success || !data.results?.length) return "";

      // For competitor scan, include more content per result
      const contentLimit = mode === "competitor_scan" ? 1500 : 800;
      const formatted = data.results.map((r: any, i: number) => 
        `[Source ${i + 1}: ${r.title}]\nURL: ${r.url}\n${r.content?.slice(0, contentLimit) || r.description || ""}`
      ).join("\n\n");

      return `\n\n=== WEB RESEARCH RESULTS ===\n${formatted}\n=== END WEB RESEARCH ===`;
    } catch (err) {
      console.error("Web research error:", err);
      return "";
    }
  }, []);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || trimmedInput.length < 3 || isStreaming) return;
    
    if (trimmedInput.length > 4000) {
      toast.error("Message too long. Keep under 4000 characters.");
      return;
    }

    // All modes cost 1 credit now - simpler check
    if (credits < CREDIT_COST_PER_MESSAGE) {
      toast.error("Not enough credits. Upgrade to continue.");
      return;
    }

    // Block premium modes for free trial users
    if (isFreeTrial && PREMIUM_MODES.includes(selectedMode)) {
      toast.error("Competitor Scan requires a subscription. Upgrade to access this feature.");
      return;
    }

    const userMessage: Message = { role: "user", content: trimmedInput };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    try {
      const deducted = await onDeductCredits(CREDIT_COST_PER_MESSAGE, selectedMode);
      if (!deducted) throw new Error("Failed to deduct credits");

      let webContext = "";
      if (WEB_RESEARCH_MODES.includes(selectedMode)) {
        toast.info("Searching the web...");
        webContext = await performWebResearch(trimmedInput, selectedMode);
      }

      await streamChat(newMessages, selectedMode, webContext);
      
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

  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    setSelectedMode(action.mode);
    setInput(action.prompt);
    textareaRef.current?.focus();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadDocument) return;
    await onUploadDocument(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const currentMode = getModeById(selectedMode);
  const isWebMode = WEB_RESEARCH_MODES.includes(selectedMode);
  const hasMessages = messages.length > 0;
  const hasEnoughCredits = credits >= CREDIT_COST_PER_MESSAGE;

  // Quick mode buttons
  const quickModes = ADVISOR_MODES.filter(m => 
    ["quick_question", "decision_support", "competitor_scan", "diagnostic", "daily_briefing"].includes(m.id)
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Mode Toggles - Always at top */}
      <div className="border-b border-border/50 px-4 py-2 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <TooltipProvider delayDuration={200}>
              {quickModes.map((mode) => {
                const isSelected = selectedMode === mode.id;
                const isWeb = WEB_RESEARCH_MODES.includes(mode.id);
                const isPremium = PREMIUM_MODES.includes(mode.id);
                const isLocked = isPremium && isFreeTrial;
                
                return (
                  <Tooltip key={mode.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          if (isLocked) {
                            toast.error("Competitor Scan requires a subscription. Upgrade to unlock.");
                            return;
                          }
                          hasEnoughCredits && setSelectedMode(mode.id);
                        }}
                        disabled={!hasEnoughCredits || isStreaming}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0",
                          isSelected
                            ? "bg-accent text-accent-foreground"
                            : isLocked
                            ? "bg-secondary/50 text-foreground/50 border border-dashed border-foreground/20"
                            : "bg-secondary/80 hover:bg-secondary text-foreground/80 hover:text-foreground",
                          !hasEnoughCredits && "opacity-40 cursor-not-allowed"
                        )}
                      >
                        {isLocked ? <Lock size={12} className="opacity-60" /> : getAdvisorIcon(mode.icon, 12)}
                        <span>{mode.name}</span>
                        {isWeb && !isLocked && <Globe size={10} className="opacity-60" />}
                        {isLocked && <span className="text-[10px] opacity-60">PRO</span>}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      <p>{isLocked ? "Upgrade to access Competitor Scan" : mode.tagline}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
              
              {/* More modes */}
              {ADVISOR_MODES.filter(m => !quickModes.some(q => q.id === m.id)).map((mode) => {
                const isWeb = WEB_RESEARCH_MODES.includes(mode.id);
                const isPremium = PREMIUM_MODES.includes(mode.id);
                const isLocked = isPremium && isFreeTrial;
                
                return (
                  <Tooltip key={mode.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          if (isLocked) {
                            toast.error("This mode requires a subscription. Upgrade to unlock.");
                            return;
                          }
                          hasEnoughCredits && setSelectedMode(mode.id);
                        }}
                        disabled={!hasEnoughCredits || isStreaming}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0",
                          selectedMode === mode.id
                            ? "bg-accent text-accent-foreground"
                            : isLocked
                            ? "bg-secondary/30 text-foreground/40 border border-dashed border-foreground/10"
                            : "bg-secondary/50 hover:bg-secondary text-foreground/60 hover:text-foreground",
                          !hasEnoughCredits && "opacity-40 cursor-not-allowed"
                        )}
                      >
                        {isLocked ? <Lock size={12} className="opacity-50" /> : getAdvisorIcon(mode.icon, 12)}
                        <span>{mode.name}</span>
                        {isWeb && !isLocked && <Globe size={10} className="opacity-60" />}
                        {isLocked && <span className="text-[10px] opacity-50">PRO</span>}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      <p>{isLocked ? "Upgrade to access this mode" : mode.tagline}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </TooltipProvider>
            
            <div className="ml-auto shrink-0 flex items-center gap-2 pl-4">
              {isFreeTrial && daysRemaining !== undefined && daysRemaining > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  {daysRemaining}d trial left
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {credits} credits
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto"
      >
        <div className="max-w-3xl mx-auto py-6 px-4">
          {!hasMessages ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="p-4 rounded-full bg-accent/10 mb-6">
                <Brain size={40} className="text-accent" />
              </div>
              <h1 className="text-2xl md:text-3xl font-heading mb-2">
                {businessName ? `Hi ${businessName}` : "How can I help today?"}
              </h1>
              <p className="text-muted-foreground mb-8 max-w-md">
                {currentMode.tagline}
              </p>

              {/* Daily Brief CTA if not generated */}
              {!briefData && onGenerateBrief && (
                <Button
                  onClick={onGenerateBrief}
                  disabled={isBriefLoading}
                  variant="outline"
                  size="lg"
                  className="mb-8 gap-2"
                >
                  {isBriefLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Sun size={16} />
                  )}
                  Get your daily briefing
                </Button>
              )}

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                {QUICK_ACTIONS.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickAction(action)}
                    className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-secondary/30 hover:bg-secondary/60 transition-colors text-left group"
                  >
                    <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                      <action.icon size={18} className="text-accent" />
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages */
            <div className="space-y-6">
              {messages.map((message, i) => (
                <div key={i} className={cn(
                  "flex gap-4",
                  message.role === "user" ? "justify-end" : ""
                )}>
                  {message.role === "assistant" && (
                    <div className="p-2 rounded-full bg-accent/10 h-fit shrink-0">
                      <Brain size={18} className="text-accent" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3",
                    message.role === "user" 
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary/50"
                  )}>
                    {message.role === "assistant" ? (
                      <GenieMessage 
                        content={message.content}
                        trustMetadata={message.trustMetadata}
                        displayMode={trustDisplayMode}
                      />
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="p-2 rounded-full bg-secondary h-fit shrink-0">
                      <User size={18} className="text-foreground/70" />
                    </div>
                  )}
                </div>
              ))}
              
              {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-4">
                  <div className="p-2 rounded-full bg-accent/10 h-fit">
                    <Brain size={18} className="text-accent" />
                  </div>
                  <div className="bg-secondary/50 rounded-2xl px-4 py-3">
                    <Loader2 size={16} className="animate-spin text-accent" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border/50 p-4 bg-background">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-end gap-2 rounded-2xl border border-border bg-secondary/30 p-2">
            {/* File Upload */}
            {onUploadDocument && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.csv"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingDocument}
                  className="h-9 w-9 shrink-0"
                >
                  {uploadingDocument ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Paperclip size={18} />
                  )}
                </Button>
              </>
            )}
            
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${currentMode.name.toLowerCase()}...`}
              disabled={isStreaming}
              className="min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 py-3 px-2"
              rows={1}
            />
            
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming || input.length < 3}
              size="icon"
              className="h-9 w-9 shrink-0 rounded-xl"
            >
              {isStreaming ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ArrowUp size={16} />
              )}
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-2 px-1">
            <p className="text-[10px] text-muted-foreground">
              {isWebMode && (
                <span className="inline-flex items-center gap-1 text-blue-500">
                  <Globe size={10} />
                  Web research enabled
                </span>
              )}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {currentMode.creditCost} credit{currentMode.creditCost > 1 ? "s" : ""} per message
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
