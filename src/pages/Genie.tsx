import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Loader2, 
  ArrowLeft,
  Brain,
  User,
  RotateCcw,
  Sparkles,
  Settings,
  LayoutDashboard,
  History
} from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import GenieModeSelector from "@/components/genie/GenieModeSelector";
import GenieOnboarding from "@/components/genie/GenieOnboarding";
import GenieDashboard from "@/components/genie/GenieDashboard";
import { GENIE_MODES, getModeById } from "@/components/genie/GenieModes";
import { useBusinessMemory } from "@/hooks/useBusinessMemory";
import { useCoachCredits } from "@/hooks/useCoachCredits";
import { useGenieNotifications } from "@/hooks/useGenieNotifications";
import { useGenieSessions } from "@/hooks/useGenieSessions";
import MarkdownRenderer from "@/components/coach/MarkdownRenderer";
import CreditDisplay from "@/components/coach/CreditDisplay";
import GenieVoiceInterface from "@/components/genie/GenieVoiceInterface";
import SessionHistory from "@/components/genie/SessionHistory";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface GenieOnboardingData {
  business_name: string;
  business_type: string;
  revenue_model: string;
  annual_revenue_band: string;
  team_size: string;
  primary_goal: string;
  biggest_challenge: string;
  known_weak_spots: string[];
  key_metrics: string[];
  communication_style: string;
  decision_style: string;
}

const Genie = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedMode, setSelectedMode] = useState("daily_operator");
  const [showDashboard, setShowDashboard] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { getMemoryContext, memory, insights, recentDecisions, loading: memoryLoading, saveMemory, refetch: refetchMemory } = useBusinessMemory();
  const { credits, loading: creditsLoading, deductCredits } = useCoachCredits();
  const { notifications, dismiss: dismissNotification, markAsRead: markNotificationRead } = useGenieNotifications();
  const { sessions, loading: sessionsLoading, currentSessionId, setCurrentSessionId, saveSession, loadSession, summarizeSession, updateSessionTags, allTags } = useGenieSessions();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/genie");
    }
  }, [user, authLoading, navigate]);

  // Show onboarding if no memory exists
  useEffect(() => {
    if (!memoryLoading && !memory && user) {
      setShowOnboarding(true);
    }
  }, [memoryLoading, memory, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleOnboardingComplete = async (data: GenieOnboardingData) => {
    const success = await saveMemory({
      business_name: data.business_name,
      business_type: data.business_type,
      revenue_model: data.revenue_model,
      annual_revenue_band: data.annual_revenue_band,
      team_size: data.team_size,
      primary_goal: data.primary_goal,
      biggest_challenge: data.biggest_challenge,
      known_weak_spots: data.known_weak_spots,
      key_metrics: data.key_metrics,
      communication_style: data.communication_style,
      decision_style: data.decision_style,
    });
    
    if (success) {
      toast.success("Business profile saved. The Genie will remember this.");
      setShowOnboarding(false);
      await refetchMemory();
    } else {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  const handleSkipOnboarding = () => {
    setShowOnboarding(false);
  };

  const streamChat = useCallback(async (userMessages: Message[], mode: string) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/genie-chat`;
    
    const memoryContext = getMemoryContext();

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ 
        messages: userMessages,
        mode,
        memoryContext: memoryContext || undefined,
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
  }, [getMemoryContext]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const modeConfig = getModeById(selectedMode);
    
    if (credits.balance < modeConfig.creditCost) {
      toast.error("Not enough credits for this mode.");
      return;
    }

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    try {
      const deducted = await deductCredits(modeConfig.creditCost, selectedMode);
      if (!deducted) {
        throw new Error("Failed to deduct credits");
      }

      await streamChat(newMessages, selectedMode);
      
      // Auto-save session after each exchange
      const updatedMessages = [...newMessages];
      // We'll get the latest messages from state after streaming completes
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

  // Auto-save session when messages change
  useEffect(() => {
    if (messages.length > 0 && !isStreaming) {
      saveSession(selectedMode, messages, currentSessionId);
    }
  }, [messages, isStreaming, selectedMode, currentSessionId, saveSession]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewConversation = () => {
    setMessages([]);
    setSelectedMode("daily_operator");
    setCurrentSessionId(null);
  };

  const handleLoadSession = (session: { id: string; mode: string; messages: Message[] }) => {
    loadSession(session as Parameters<typeof loadSession>[0]);
    setMessages(session.messages);
    setSelectedMode(session.mode);
    setShowDashboard(false);
    setShowHistory(false);
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
  };

  if (authLoading || creditsLoading || memoryLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  // Show onboarding flow
  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Helmet>
          <title>Setup | Wellness Genie</title>
        </Helmet>
        <Header />
        <main className="pt-24 pb-16">
          <div className="container-narrow section-padding">
            <Button variant="ghost" size="sm" className="mb-8" onClick={() => navigate("/hub")}>
              <ArrowLeft size={16} />
              Back to Hub
            </Button>
            <GenieOnboarding 
              onComplete={handleOnboardingComplete} 
              onSkip={handleSkipOnboarding}
            />
          </div>
        </main>
      </div>
    );
  }

  const currentMode = getModeById(selectedMode);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Wellness Genie | Wellness Genius</title>
        <meta name="description" content="Your AI business operator for wellness decisions." />
      </Helmet>
      
      <Header />
      
      <main className="pt-24 pb-4 flex-1 flex flex-col">
        <div className="container-wide section-padding flex-1 flex flex-col max-h-[calc(100vh-180px)]">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 shrink-0">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/hub")}>
                <ArrowLeft size={16} />
                Back
              </Button>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-accent/10">
                  <Brain size={20} className="text-accent" />
                </div>
                <div>
                  <h1 className="text-lg font-heading">Wellness Genie</h1>
                  <p className="text-xs text-muted-foreground">Business operator, not chatbot</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <GenieVoiceInterface 
                memoryContext={getMemoryContext()}
                onTranscript={(text, role) => {
                  setMessages(prev => [...prev, { role, content: text }]);
                  if (showDashboard) setShowDashboard(false);
                }}
              />
              <Sheet open={showHistory} onOpenChange={setShowHistory}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost"
                    size="sm" 
                    title="Conversation history"
                  >
                    <History size={14} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[350px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Conversation History</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 h-[calc(100vh-100px)]">
                    <SessionHistory
                      sessions={sessions}
                      loading={sessionsLoading}
                      onLoadSession={handleLoadSession}
                      currentSessionId={currentSessionId}
                      onSummarize={summarizeSession}
                      onUpdateTags={updateSessionTags}
                      allTags={allTags}
                    />
                  </div>
                </SheetContent>
              </Sheet>
              <Button 
                variant={showDashboard ? "secondary" : "ghost"}
                size="sm" 
                onClick={() => setShowDashboard(true)}
                title="Dashboard"
              >
                <LayoutDashboard size={14} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowOnboarding(true)}
                title="Edit business profile"
              >
                <Settings size={14} />
              </Button>
              {(messages.length > 0 || !showDashboard) && (
                <Button variant="outline" size="sm" onClick={handleNewConversation}>
                  <RotateCcw size={14} />
                  New
                </Button>
              )}
              <CreditDisplay 
                balance={credits.balance} 
                monthlyAllowance={credits.monthlyAllowance}
                nextResetDate={credits.nextResetDate}
                compact 
              />
            </div>
          </div>

          {/* Main Content */}
          {showDashboard && messages.length === 0 ? (
            /* Dashboard View */
            <GenieDashboard
              memory={memory}
              insights={insights}
              recentDecisions={recentDecisions}
              notifications={notifications}
              onStartChat={() => setShowDashboard(false)}
              onEditProfile={() => setShowOnboarding(true)}
              onDismissNotification={dismissNotification}
              onMarkNotificationRead={markNotificationRead}
            />
          ) : messages.length === 0 ? (
            /* Mode Selection View */
            <div className="flex-1 flex flex-col lg:flex-row gap-8">
              {/* Left: Mode Selector */}
              <div className="lg:w-1/2">
                <h2 className="text-sm font-medium text-muted-foreground mb-4">What do you need?</h2>
                <GenieModeSelector 
                  selectedMode={selectedMode} 
                  onSelectMode={setSelectedMode}
                  credits={credits.balance}
                />
              </div>

              {/* Right: Selected Mode + Examples */}
              <div className="lg:w-1/2 flex flex-col">
                <div className="rounded-xl border border-border bg-card p-6 flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{currentMode.icon}</span>
                    <div>
                      <h3 className="font-heading text-lg">{currentMode.name}</h3>
                      <p className="text-sm text-accent">"{currentMode.tagline}"</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-6">
                    {currentMode.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    <p className="text-xs font-medium text-muted-foreground">Try asking:</p>
                    {currentMode.examples.map((example, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleExampleClick(example)}
                        className="w-full text-left text-sm px-4 py-3 rounded-lg bg-secondary/50 hover:bg-secondary border border-border/50 transition-colors"
                      >
                        {example}
                      </button>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="flex gap-2">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask the Genie..."
                      className="min-h-[56px] max-h-[120px] resize-none"
                      disabled={isStreaming}
                    />
                    <Button
                      variant="accent"
                      size="icon"
                      className="h-14 w-14 shrink-0"
                      onClick={handleSend}
                      disabled={!input.trim() || isStreaming || credits.balance < currentMode.creditCost}
                    >
                      {isStreaming ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <Send size={20} />
                      )}
                    </Button>
                  </div>
                  
                  {credits.balance < currentMode.creditCost && (
                    <p className="text-xs text-destructive mt-2">
                      Not enough credits. Try a different mode.
                    </p>
                  )}
                </div>

                {/* Business Context Status */}
                {memory && (
                  <div className="mt-4 p-3 rounded-lg bg-accent/5 border border-accent/20">
                    <div className="flex items-center gap-2 text-sm">
                      <Sparkles size={14} className="text-accent" />
                      <span className="text-accent font-medium">Memory active</span>
                      <span className="text-muted-foreground">
                        — {memory.business_name || "Your business"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Chat View */
            <div className="flex-1 flex flex-col min-h-0">
              {/* Mode Badge */}
              <div className="flex items-center gap-2 mb-4 shrink-0">
                <span className="text-lg">{currentMode.icon}</span>
                <span className="text-sm font-medium">{currentMode.name}</span>
                <select
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value)}
                  className="text-xs bg-secondary border border-border rounded px-2 py-1 ml-2"
                  disabled={isStreaming}
                >
                  {GENIE_MODES.map((mode) => (
                    <option key={mode.id} value={mode.id} disabled={credits.balance < mode.creditCost}>
                      {mode.icon} {mode.name} ({mode.creditCost} credits)
                    </option>
                  ))}
                </select>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-card p-4 mb-4">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
                    >
                      {message.role === "assistant" && (
                        <div className="p-2 rounded-full bg-accent/10 h-fit shrink-0">
                          <Brain size={16} className="text-accent" />
                        </div>
                      )}
                      <div
                        className={`rounded-xl px-4 py-3 max-w-[80%] ${
                          message.role === "user"
                            ? "bg-accent text-accent-foreground"
                            : "bg-secondary"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <MarkdownRenderer content={message.content} />
                        ) : (
                          <div className="text-sm whitespace-pre-wrap leading-relaxed">
                            {message.content}
                          </div>
                        )}
                      </div>
                      {message.role === "user" && (
                        <div className="p-2 rounded-full bg-secondary h-fit shrink-0">
                          <User size={16} />
                        </div>
                      )}
                    </div>
                  ))}
                  {isStreaming && messages[messages.length - 1]?.role === "user" && (
                    <div className="flex gap-3">
                      <div className="p-2 rounded-full bg-accent/10 h-fit shrink-0">
                        <Brain size={16} className="text-accent" />
                      </div>
                      <div className="rounded-xl px-4 py-3 bg-secondary">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input */}
              <div className="shrink-0">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Continue the conversation..."
                    className="min-h-[56px] max-h-[120px] resize-none"
                    disabled={isStreaming}
                  />
                  <Button
                    variant="accent"
                    size="icon"
                    className="h-14 w-14 shrink-0"
                    onClick={handleSend}
                    disabled={!input.trim() || isStreaming || credits.balance < currentMode.creditCost}
                  >
                    {isStreaming ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Send size={20} />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Genie;
