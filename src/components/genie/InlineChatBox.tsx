import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Loader2, 
  Brain,
  User,
  RotateCcw,
  Sparkles,
  Paperclip,
  FileText,
  Upload,
  Globe
} from "lucide-react";
import { ADVISOR_MODES, getModeById, WEB_RESEARCH_MODES } from "@/components/advisor/AdvisorModes";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

interface InlineChatBoxProps {
  credits: number;
  onDeductCredits: (amount: number, mode: string) => Promise<boolean>;
  memoryContext: MemoryContextObject | null;
  trustDisplayMode: "full" | "compact";
  onSaveSession?: (mode: string, messages: Message[], sessionId?: string | null) => Promise<string | null>;
  defaultMode?: string;
  briefData?: BriefData | null;
  documents?: Array<{ id: string; file_name: string; extracted_text: string | null; }>;
  onUploadDocument?: (file: File) => Promise<boolean>;
  uploadingDocument?: boolean;
  isLoading?: boolean;
}

const InlineChatBox = ({
  credits,
  onDeductCredits,
  memoryContext,
  trustDisplayMode,
  onSaveSession,
  defaultMode = "quick_question",
  briefData,
  documents = [],
  onUploadDocument,
  uploadingDocument = false,
  isLoading = false,
}: InlineChatBoxProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedMode, setSelectedMode] = useState(defaultMode);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDocuments, setShowDocuments] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onUploadDocument) {
      setIsDragging(true);
    }
  }, [onUploadDocument]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (!onUploadDocument) return;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await onUploadDocument(files[0]);
    }
  }, [onUploadDocument]);

  // Get document context for AI
  const documentContext = useMemo(() => {
    if (documents.length === 0) return "";
    
    const contextParts = documents
      .filter(doc => doc.extracted_text)
      .map(doc => `[Document: ${doc.file_name}]\n${doc.extracted_text?.slice(0, 2000)}`);

    return contextParts.length > 0 ? contextParts.join("\n\n") : "";
  }, [documents]);

  // Scroll within chat container only - not the whole page
  useEffect(() => {
    if (messagesContainerRef.current && messages.length > 0) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = useCallback(async (userMessages: Message[], mode: string, webContext?: string) => {
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
        documentContext: documentContext || undefined,
        webContext: webContext || undefined,
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
  }, [documentContext, memoryContext]);

  // Perform web research for relevant modes
  const performWebResearch = useCallback(async (query: string): Promise<string> => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.access_token) return "";

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/genie-web-search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({ query, searchType: "search" }),
        }
      );

      if (!response.ok) return "";

      const data = await response.json();
      if (!data.success || !data.results?.length) return "";

      // Format results for context
      const formatted = data.results.map((r: any, i: number) => 
        `[Source ${i + 1}: ${r.title}]\nURL: ${r.url}\n${r.content?.slice(0, 800) || r.description || ""}`
      ).join("\n\n");

      return `\n\n=== WEB RESEARCH RESULTS ===\n${formatted}\n=== END WEB RESEARCH ===`;
    } catch (err) {
      console.error("Web research error:", err);
      return "";
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadDocument) return;
    
    await onUploadDocument(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();
    
    if (!trimmedInput || trimmedInput.length < 3 || isStreaming) return;
    
    if (trimmedInput.length > 4000) {
      toast.error("Message is too long. Please keep it under 4000 characters.");
      return;
    }

    const modeConfig = getModeById(selectedMode);
    
    if (credits < modeConfig.creditCost) {
      toast.error("Not enough credits for this mode.");
      return;
    }

    const userMessage: Message = { role: "user", content: trimmedInput };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    try {
      const deducted = await onDeductCredits(modeConfig.creditCost, selectedMode);
      if (!deducted) {
        throw new Error("Failed to deduct credits");
      }

      // Perform web research for relevant modes
      let webContext = "";
      if (WEB_RESEARCH_MODES.includes(selectedMode)) {
        toast.info("Searching the web...");
        webContext = await performWebResearch(trimmedInput);
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

  const handleNewConversation = () => {
    setMessages([]);
  };

  const currentMode = getModeById(selectedMode);
  const isWebMode = WEB_RESEARCH_MODES.includes(selectedMode);

  // Quick mode buttons (most used)
  const quickModes = ADVISOR_MODES.filter(m => 
    ["quick_question", "decision_support", "competitor_scan", "diagnostic"].includes(m.id)
  );

  return (
    <div 
      className="mt-6 rounded-xl border border-border bg-card overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      {isDragging && onUploadDocument && (
        <div className="absolute inset-0 bg-accent/20 border-2 border-dashed border-accent z-10 flex items-center justify-center rounded-xl">
          <div className="text-center">
            <Upload size={24} className="mx-auto text-accent mb-2" />
            <p className="text-sm font-medium text-accent">Drop document here</p>
          </div>
        </div>
      )}

      {/* Header with Mode Toggles */}
      <div className="p-3 border-b border-border bg-secondary/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-accent/10">
              <Brain size={14} className="text-accent" />
            </div>
            <span className="font-medium text-sm">Ask a Question</span>
            {isWebMode && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 flex items-center gap-1">
                <Globe size={10} />
                Web Research
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleNewConversation}
                className="h-7 px-2 text-xs"
              >
                <RotateCcw size={12} className="mr-1" />
                Clear
              </Button>
            )}
            <span className="text-xs text-muted-foreground">
              {credits} credits
            </span>
          </div>
        </div>

        {/* Mode Toggle Buttons */}
        <div className="flex flex-wrap gap-1.5">
          <TooltipProvider delayDuration={300}>
            {quickModes.map((mode) => {
              const isSelected = selectedMode === mode.id;
              const canAfford = credits >= mode.creditCost;
              const isWeb = WEB_RESEARCH_MODES.includes(mode.id);
              
              return (
                <Tooltip key={mode.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => canAfford && setSelectedMode(mode.id)}
                      disabled={!canAfford || isStreaming}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
                        isSelected
                          ? "bg-accent text-accent-foreground"
                          : "bg-secondary hover:bg-secondary/80 text-foreground",
                        !canAfford && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {getAdvisorIcon(mode.icon, 12)}
                      <span>{mode.name}</span>
                      {isWeb && <Globe size={10} className="opacity-60" />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs font-medium">{mode.tagline}</p>
                    <p className="text-[10px] text-muted-foreground">{mode.creditCost} credits</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
            
            {/* More modes dropdown */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary hover:bg-secondary/80 text-muted-foreground">
                  More...
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-64 p-2">
                <div className="space-y-1">
                  {ADVISOR_MODES.filter(m => !quickModes.some(q => q.id === m.id)).map((mode) => {
                    const canAfford = credits >= mode.creditCost;
                    const isWeb = WEB_RESEARCH_MODES.includes(mode.id);
                    
                    return (
                      <button
                        key={mode.id}
                        onClick={() => {
                          if (canAfford) setSelectedMode(mode.id);
                        }}
                        disabled={!canAfford || isStreaming}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-colors",
                          selectedMode === mode.id
                            ? "bg-accent/10 text-accent"
                            : "hover:bg-secondary",
                          !canAfford && "opacity-50"
                        )}
                      >
                        {getAdvisorIcon(mode.icon, 14)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-medium truncate">{mode.name}</span>
                            {isWeb && <Globe size={10} className="text-blue-500 shrink-0" />}
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate">{mode.tagline}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0">{mode.creditCost}cr</span>
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </TooltipProvider>
        </div>
      </div>

      {/* Messages Area - Fixed height with internal scroll */}
      <div 
        ref={messagesContainerRef}
        className={cn(
          "overflow-y-auto p-3 space-y-3",
          messages.length === 0 ? "max-h-[120px]" : "max-h-[350px] min-h-[200px]"
        )}
      >
        {messages.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">
              {currentMode.tagline}
            </p>
            <p className="text-xs text-muted-foreground/70">
              {isWebMode ? "I'll search the web for current information" : currentMode.description}
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
            <div className="rounded-lg px-3 py-2 bg-secondary flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="text-xs text-muted-foreground">
                {isWebMode ? "Researching..." : "Thinking..."}
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Uploaded Documents Indicator */}
      {documents.length > 0 && (
        <div className="px-3 py-2 border-t border-border bg-accent/5">
          <button 
            onClick={() => setShowDocuments(!showDocuments)}
            className="flex items-center gap-2 text-xs text-accent hover:text-accent/80 transition-colors"
          >
            <FileText size={12} />
            <span>{documents.length} document{documents.length > 1 ? 's' : ''} providing context</span>
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 border-t border-border">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="flex gap-2">
              <div className="h-11 w-11 bg-muted rounded-lg shrink-0" />
              <div className="h-11 flex-1 bg-muted rounded-lg" />
              <div className="h-11 w-11 bg-muted rounded-lg shrink-0" />
            </div>
          </div>
        ) : (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="flex gap-2">
              {onUploadDocument && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-11 w-11 shrink-0"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isStreaming || uploadingDocument}
                      >
                        {uploadingDocument ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <Paperclip size={16} />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">Upload document for context</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask in ${currentMode.name} mode...`}
                className="min-h-[44px] max-h-[80px] resize-none text-sm"
                disabled={isStreaming}
                maxLength={4000}
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
            
            <div className="flex items-center justify-between mt-2">
              <div>
                {documents.length === 0 && onUploadDocument && (
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Upload size={10} />
                    Upload docs to personalise responses
                  </p>
                )}
              </div>
              <span className={cn(
                "text-[10px] tabular-nums transition-colors",
                input.length > 3800 ? "text-destructive" : 
                input.length > 3500 ? "text-amber-500" : 
                "text-muted-foreground"
              )}>
                {input.length}/4000
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InlineChatBox;
