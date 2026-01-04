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
  Sparkles,
  History,
  ArrowRight,
  Paperclip,
  FileText,
  X,
  Upload
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

interface SuggestedQuestion {
  text: string;
  reason: string;
}

interface UploadedDoc {
  id: string;
  name: string;
  extractedText: string | null;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  trustMetadata?: TrustMetadata;
}

// Memory context object type (matches what useBusinessMemory returns)
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

// Generate dynamic follow-up questions based on brief content
const generateBriefQuestions = (brief: BriefData | null | undefined): SuggestedQuestion[] => {
  if (!brief) {
    return [
      { text: "What are the biggest risks to my business right now?", reason: "Understanding risks helps you prepare and prioritize" },
      { text: "What metrics should I be tracking weekly?", reason: "Regular tracking reveals trends before they become problems" },
      { text: "What's one thing I should improve this month?", reason: "Focused improvement leads to consistent growth" },
    ];
  }

  const questions: SuggestedQuestion[] = [];

  // Add questions based on changes
  if (brief.changes.length > 0) {
    const warningChanges = brief.changes.filter(c => c.severity === "warning");
    const positiveChanges = brief.changes.filter(c => c.severity === "good");
    
    if (warningChanges.length > 0) {
      questions.push({
        text: `Why is "${warningChanges[0].text.slice(0, 40)}..." happening?`,
        reason: `Your brief flagged this as a warning that needs attention`
      });
      questions.push({
        text: "What should I do to address these warning signs?",
        reason: `You have ${warningChanges.length} warning${warningChanges.length > 1 ? 's' : ''} in today's brief`
      });
    }
    
    if (positiveChanges.length > 0) {
      questions.push({
        text: "How can I capitalize on the positive trends?",
        reason: `Your brief shows ${positiveChanges.length} positive change${positiveChanges.length > 1 ? 's' : ''} to build on`
      });
    }
    
    if (brief.changes.length > 1) {
      questions.push({
        text: "Which of these changes should I prioritize?",
        reason: `Multiple changes detected—focus matters for effective action`
      });
    }
  }

  // Add questions based on actions
  if (brief.actions.length > 0) {
    questions.push({
      text: `Tell me more about: "${brief.actions[0].slice(0, 50)}..."`,
      reason: "This is your top recommended action from the brief"
    });
    if (brief.actions.length > 1) {
      questions.push({
        text: "Which action will have the biggest impact?",
        reason: `You have ${brief.actions.length} suggested actions to choose from`
      });
    }
  }

  // Add questions based on confidence
  if (brief.confidence === "low") {
    questions.push({
      text: "What data would help improve these insights?",
      reason: "Brief confidence is low—more data could sharpen recommendations"
    });
    questions.push({
      text: "What should I start tracking to get better clarity?",
      reason: "Building data over time improves insight quality"
    });
  } else if (brief.confidence === "medium") {
    questions.push({
      text: "How can I improve the accuracy of these insights?",
      reason: "Brief confidence is medium—there's room for improvement"
    });
  }

  // Add general business context questions
  questions.push({
    text: "What questions should I be asking myself right now?",
    reason: "Sometimes the right question reveals hidden opportunities"
  });
  questions.push({
    text: "What blind spots might I have in my business?",
    reason: "Proactively finding blind spots prevents surprises"
  });

  // Return unique questions, max 5
  const seen = new Set<string>();
  return questions.filter(q => {
    if (seen.has(q.text)) return false;
    seen.add(q.text);
    return true;
  }).slice(0, 5);
};

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
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showHistory, setShowHistory] = useState(false);
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
      .map(doc => {
        return `[Document: ${doc.file_name}]\n${doc.extracted_text?.slice(0, 2000)}`;
      });

    return contextParts.length > 0 
      ? contextParts.join("\n\n")
      : "";
  }, [documents]);

  // Extract previously asked questions from message history
  const previousQuestions = useMemo(() => {
    return messages
      .filter(m => m.role === "user")
      .map(m => m.content)
      .slice(-10); // Keep last 10 questions
  }, [messages]);

  // Generate dynamic questions based on brief content
  const suggestedQuestions = useMemo(() => generateBriefQuestions(briefData), [briefData]);

  // Scroll to bottom of chat container only (not the whole page)
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      const container = messagesEndRef.current.parentElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
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
        documentContext: documentContext || undefined,
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

  // Handle file upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadDocument) return;
    
    await onUploadDocument(file);
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();
    
    // Input validation
    if (!trimmedInput) {
      return;
    }
    
    if (trimmedInput.length < 3) {
      toast.error("Please enter a longer message (at least 3 characters).");
      return;
    }
    
    if (trimmedInput.length > 4000) {
      toast.error("Message is too long. Please keep it under 4000 characters.");
      return;
    }
    
    if (isStreaming) return;

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
          {/* Drag & Drop Container */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="relative"
          >
            {/* Drag Overlay */}
            {isDragging && onUploadDocument && (
              <div className="absolute inset-0 bg-accent/20 border-2 border-dashed border-accent z-10 flex items-center justify-center rounded-b-xl">
                <div className="text-center">
                  <Upload size={24} className="mx-auto text-accent mb-2" />
                  <p className="text-sm font-medium text-accent">Drop document here</p>
                  <p className="text-xs text-muted-foreground">PDF, Word, Excel, CSV</p>
                </div>
              </div>
            )}

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
                {/* Question History Toggle */}
                {previousQuestions.length > 0 && (
                  <div className="mb-3">
                    <button
                      onClick={() => setShowHistory(!showHistory)}
                      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <History size={12} />
                      <span>Previously asked ({previousQuestions.length})</span>
                      <ChevronDown size={12} className={cn("transition-transform", showHistory && "rotate-180")} />
                    </button>
                    
                    {showHistory && (
                      <div className="mt-2 p-2 rounded-lg bg-secondary/50 border border-border/50 max-h-[120px] overflow-y-auto">
                        <div className="space-y-1">
                          {previousQuestions.map((q, idx) => (
                            <button
                              key={idx}
                              onClick={() => setInput(q)}
                              className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-secondary flex items-center gap-2 group"
                            >
                              <ArrowRight size={10} className="text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
                              <span className="truncate">{q}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={12} className="text-accent" />
                  <p className="text-xs font-medium text-muted-foreground">
                    {briefData ? "Questions based on your brief" : "Suggested questions"}
                  </p>
                </div>
                <TooltipProvider delayDuration={200}>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((question, idx) => (
                      <Tooltip key={idx}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setInput(question.text)}
                            className="text-xs px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 border border-border/50 transition-colors text-left leading-relaxed"
                          >
                            {question.text}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[250px] text-center">
                          <p className="text-xs">{question.reason}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </TooltipProvider>
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

          {/* Uploaded Documents Indicator */}
          {documents.length > 0 && (
            <div className="px-3 py-2 border-t border-border bg-accent/5">
              <Popover open={showDocuments} onOpenChange={setShowDocuments}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 text-xs text-accent hover:text-accent/80 transition-colors">
                    <FileText size={12} />
                    <span>{documents.length} document{documents.length > 1 ? 's' : ''} providing context</span>
                    <ChevronDown size={10} className={cn("transition-transform", showDocuments && "rotate-180")} />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-72 p-2">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      These documents personalise AI responses:
                    </p>
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-2 text-xs p-2 rounded bg-secondary/50">
                        <FileText size={12} className="text-muted-foreground shrink-0" />
                        <span className="truncate flex-1">{doc.file_name}</span>
                        {doc.extracted_text ? (
                          <span className="text-[10px] text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded">Ready</span>
                        ) : (
                          <span className="text-[10px] text-yellow-600 bg-yellow-500/10 px-1.5 py-0.5 rounded">Processing</span>
                        )}
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-border">
            {/* Loading skeleton */}
            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="flex gap-2">
                  <div className="h-11 w-11 bg-muted rounded-lg shrink-0" />
                  <div className="h-11 flex-1 bg-muted rounded-lg" />
                  <div className="h-11 w-11 bg-muted rounded-lg shrink-0" />
                </div>
                <div className="h-3 w-48 bg-muted rounded" />
              </div>
            ) : (
              <>
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <div className="flex gap-2">
                  {/* Upload button */}
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
                          <p className="text-xs">Upload document for context (PDF, Excel, Word, CSV)</p>
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
                
                {/* Character counter and upload hint */}
                <div className="flex items-center justify-between mt-2">
                  <div>
                    {documents.length === 0 && onUploadDocument && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Upload size={10} />
                        Upload business docs to personalise AI responses
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
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default InlineChatBox;
