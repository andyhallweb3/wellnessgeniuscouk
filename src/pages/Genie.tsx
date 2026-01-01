import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  History,
  MessageSquare,
  FileText,
  MessageSquareWarning
} from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import CreditPurchase from "@/components/advisor/CreditPurchase";
import LowCreditWarning from "@/components/advisor/LowCreditWarning";
import GenieOnboarding from "@/components/genie/GenieOnboarding";
import DailyBriefCard from "@/components/genie/DailyBriefCard";
import ModeButtons from "@/components/genie/ModeButtons";
import WhatChangedTimeline, { ChangeEntry } from "@/components/genie/WhatChangedTimeline";
import DecisionDrawer, { DecisionContext } from "@/components/genie/DecisionDrawer";
import { ADVISOR_MODES, getModeById } from "@/components/advisor/AdvisorModes";
import { getAdvisorIcon } from "@/components/advisor/AdvisorIcons";
import { useBusinessMemory } from "@/hooks/useBusinessMemory";
import { useCoachCredits } from "@/hooks/useCoachCredits";
import { useCoachDocuments } from "@/hooks/useCoachDocuments";
import { useGenieSessions } from "@/hooks/useGenieSessions";
import { useDailyBrief } from "@/hooks/useDailyBrief";

import MarkdownRenderer from "@/components/coach/MarkdownRenderer";
import GenieMessage, { TrustMetadata } from "@/components/genie/GenieMessage";
import TrustSettingsToggle from "@/components/genie/TrustSettingsToggle";
import CreditDisplay from "@/components/coach/CreditDisplay";
import { useTrustSettings } from "@/hooks/useTrustSettings";

import SessionHistory from "@/components/genie/SessionHistory";
import GenieLeaderboard from "@/components/genie/GenieLeaderboard";
import FloatingChatDrawer from "@/components/genie/FloatingChatDrawer";
import InlineChatBox from "@/components/genie/InlineChatBox";
import DocumentManager from "@/components/genie/DocumentManager";
import { ReportProblemButton } from "@/components/feedback/ReportProblemButton";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface Message {
  role: "user" | "assistant";
  content: string;
  trustMetadata?: TrustMetadata;
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

type ViewMode = "brief" | "modes" | "chat";

const Genie = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("brief");
  const [showHistory, setShowHistory] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Brief state - use the hook
  const { brief: briefData, isLoading: isBriefLoading, generateBrief } = useDailyBrief();

  // Decision drawer state
  const [decisionDrawerOpen, setDecisionDrawerOpen] = useState(false);
  const [decisionContext, setDecisionContext] = useState<DecisionContext | null>(null);

  // Mock change data - in production, this would come from the backend
  const [changes] = useState<ChangeEntry[]>([]);

  const { getMemoryContext, memory, loading: memoryLoading, saveMemory, refetch: refetchMemory } = useBusinessMemory();
  const { credits, loading: creditsLoading, deductCredits } = useCoachCredits();
  const { documents, uploading: uploadingDocument, uploadDocument, deleteDocument, updateDocumentCategory, updateDocumentDescription } = useCoachDocuments();
  const { sessions, loading: sessionsLoading, currentSessionId, setCurrentSessionId, saveSession, loadSession, summarizeSession, updateSessionTags, allTags } = useGenieSessions();
  
  const { displayMode: trustDisplayMode } = useTrustSettings();
  const [currentTrustMetadata, setCurrentTrustMetadata] = useState<TrustMetadata | null>(null);
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

  // Handle URL mode parameter
  useEffect(() => {
    const modeFromUrl = searchParams.get("mode");
    if (modeFromUrl && ADVISOR_MODES.some(m => m.id === modeFromUrl)) {
      setSelectedMode(modeFromUrl);
      setViewMode("chat");
    }
  }, [searchParams]);

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
    
    // Get the user's session for proper JWT authentication
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.access_token) {
      throw new Error("Not authenticated. Please log in to use Genie.");
    }
    
    const memoryContext = getMemoryContext();

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
          
          // Check for trust metadata event
          if (parsed.type === "trust_metadata") {
            trustMetadata = {
              confidenceLevel: parsed.confidenceLevel,
              dataSensitivity: parsed.dataSensitivity,
              isInference: parsed.isInference,
              dataSignals: parsed.dataSignals,
              explanation: parsed.explanation,
              factors: parsed.factors,
            };
            setCurrentTrustMetadata(trustMetadata);
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
  }, [getMemoryContext]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming || !selectedMode) return;

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
    setShowChat(true);

    try {
      const deducted = await deductCredits(modeConfig.creditCost, selectedMode);
      if (!deducted) {
        throw new Error("Failed to deduct credits");
      }

      await streamChat(newMessages, selectedMode);
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
    if (messages.length > 0 && !isStreaming && selectedMode) {
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
    setSelectedMode(null);
    setCurrentSessionId(null);
    setShowChat(false);
    setViewMode("brief");
  };

  const handleLoadSession = (session: { id: string; mode: string; messages: Message[] }) => {
    loadSession(session as Parameters<typeof loadSession>[0]);
    setMessages(session.messages);
    setSelectedMode(session.mode);
    setViewMode("chat");
    setShowChat(true);
    setShowHistory(false);
  };

  const handleModeSelect = (mode: string) => {
    setSelectedMode(mode);
    setViewMode("chat");
  };

  const handleGenerateBrief = async () => {
    const modeConfig = getModeById("daily_briefing");
    
    if (credits.balance < modeConfig.creditCost) {
      toast.error("Not enough credits for daily briefing.");
      return;
    }

    const deducted = await deductCredits(modeConfig.creditCost, "daily_briefing");
    if (!deducted) {
      toast.error("Failed to deduct credits");
      return;
    }

    const result = await generateBrief();
    if (result) {
      setSelectedMode("daily_briefing");
    }
  };


  const handleBriefActionClick = (action: string) => {
    setInput(action);
    setSelectedMode("daily_briefing");
    setViewMode("chat");
    setShowChat(true);
  };

  const handlePurchaseCredits = async (packId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-credit-checkout', {
        body: { packId },
      });
      
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Failed to start checkout. Please try again.');
    }
  };

  const handleDecisionDrawerAsk = (question: string) => {
    setInput(question);
    setSelectedMode("decision_support");
    setViewMode("chat");
    setShowChat(true);
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

  const currentMode = selectedMode ? getModeById(selectedMode) : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>AI Advisor | Wellness Genius</title>
        <meta name="description" content="Your AI business advisor. See what changed, what matters, and what to do next." />
      </Helmet>
      
      <Header />
      
      <main className="pt-24 pb-4 flex-1 flex flex-col">
        <div className="container-wide section-padding flex-1 flex flex-col">
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
                  <h1 className="text-lg font-heading">AI Advisor</h1>
                  <p className="text-xs text-muted-foreground">What changed, what matters, what to do next</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Voice temporarily disabled */}
              <Sheet open={showHistory} onOpenChange={setShowHistory}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" title="Conversation history">
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
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    title="Settings"
                  >
                    <Settings size={14} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[350px] sm:w-[400px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Genie Settings</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    <TrustSettingsToggle />
                    
                    {/* Leaderboard */}
                    <GenieLeaderboard 
                      currentScore={currentTrustMetadata?.genieScore?.overall || 0}
                      currentStreak={currentTrustMetadata?.sessionSignals?.streak?.currentStreak || 0}
                    />
                    
                    <ReportProblemButton featureArea="AI Genie Chat" variant="outline" />
                    
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowOnboarding(true)}
                    >
                      Edit Business Profile
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              {(messages.length > 0 || showChat) && (
                <Button variant="outline" size="sm" onClick={handleNewConversation}>
                  <RotateCcw size={14} />
                  New
                </Button>
              )}
              <CreditPurchase
                currentCredits={credits.balance}
                onPurchase={handlePurchaseCredits}
              />
              <CreditDisplay 
                balance={credits.balance} 
                monthlyAllowance={credits.monthlyAllowance}
                nextResetDate={credits.nextResetDate}
                compact 
              />
            </div>
          </div>

          {/* Low Credit Warning */}
          <LowCreditWarning 
            balance={credits.balance} 
            threshold={5}
            onPurchase={handlePurchaseCredits}
          />

          {/* Main Content Area */}
          {!showChat ? (
            /* Brief-First View */
            <div className="flex-1 grid lg:grid-cols-3 gap-6">
              {/* Left: Daily Brief Card */}
              <div className="lg:col-span-2">
                <DailyBriefCard
                  brief={briefData}
                  isLoading={isBriefLoading}
                  onGenerateBrief={handleGenerateBrief}
                  onActionClick={handleBriefActionClick}
                  businessName={memory?.business_name}
                />

                {/* Inline Chat Box */}
                <InlineChatBox
                  credits={credits.balance}
                  onDeductCredits={deductCredits}
                  memoryContext={getMemoryContext()}
                  trustDisplayMode={trustDisplayMode}
                  onSaveSession={saveSession}
                  briefData={briefData}
                  documents={documents}
                  onUploadDocument={uploadDocument}
                  uploadingDocument={uploadingDocument}
                  isLoading={memoryLoading || creditsLoading}
                />

                {/* Mode Buttons */}
                <div className="mt-6">
                  <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
                    Or choose a mode
                  </h2>
                  <ModeButtons
                    selectedMode={selectedMode}
                    onSelectMode={handleModeSelect}
                    credits={credits.balance}
                  />
                </div>
              </div>

              {/* Right: What Changed + Context */}
              <div className="space-y-6">
                <WhatChangedTimeline 
                  changes={changes}
                  onChangeClick={(change) => {
                    setInput(`Tell me more about: ${change.text}`);
                    setSelectedMode("diagnostic");
                    setViewMode("chat");
                    setShowChat(true);
                  }}
                />

                {/* Business Context & Documents */}
                <Tabs defaultValue="context" className="w-full">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="context" className="text-xs">
                      <Sparkles size={12} className="mr-1" />
                      Business Context
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="text-xs">
                      <FileText size={12} className="mr-1" />
                      Documents ({documents.length})
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="context" className="mt-3">
                    {memory ? (
                      <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <Sparkles size={14} className="text-accent" />
                          <span className="text-accent font-medium">Memory Active</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {memory.business_name || "Your business"} • {memory.business_type || "Business"}
                        </p>
                        {memory.primary_goal && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Goal: {memory.primary_goal}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-secondary/50 border border-border text-center">
                        <p className="text-sm text-muted-foreground">
                          No business profile configured yet
                        </p>
                        <Button 
                          variant="link" 
                          size="sm" 
                          onClick={() => setShowOnboarding(true)}
                          className="mt-1"
                        >
                          Set up profile
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="documents" className="mt-3">
                    <DocumentManager
                      documents={documents}
                      loading={false}
                      uploading={uploadingDocument}
                      onUpload={uploadDocument}
                      onDelete={deleteDocument}
                      onUpdateCategory={updateDocumentCategory}
                      onUpdateDescription={updateDocumentDescription}
                    />
                  </TabsContent>
                </Tabs>

              </div>
            </div>
          ) : (
            /* Chat View */
            <div className="flex-1 flex flex-col min-h-0">
              {/* Mode Badge */}
              <div className="flex items-center gap-2 mb-4 shrink-0">
                {currentMode && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
                    <div className="text-accent">
                      {getAdvisorIcon(currentMode.icon, 16)}
                    </div>
                    <span className="text-sm font-medium text-accent">{currentMode.name}</span>
                  </div>
                )}
                <select
                  value={selectedMode || ""}
                  onChange={(e) => setSelectedMode(e.target.value)}
                  className="text-xs bg-secondary border border-border rounded px-2 py-1 ml-2"
                  disabled={isStreaming}
                >
                  {ADVISOR_MODES.map((mode) => (
                    <option key={mode.id} value={mode.id} disabled={credits.balance < mode.creditCost}>
                      {mode.name} ({mode.creditCost} credits)
                    </option>
                  ))}
                </select>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-auto"
                  onClick={() => setShowChat(false)}
                >
                  Back to Brief
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-card p-4 mb-4">
                <div className="space-y-4">
                  {messages.length === 0 && currentMode && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                        <div className="text-accent">
                          {getAdvisorIcon(currentMode.icon, 28)}
                        </div>
                      </div>
                      <h3 className="font-heading text-lg mb-2">{currentMode.name}</h3>
                      <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                        {currentMode.description}
                      </p>
                      <div className="space-y-2 max-w-md mx-auto">
                        {currentMode.examples.map((example, idx) => (
                          <button
                            key={idx}
                            onClick={() => setInput(example)}
                            className="w-full text-left text-sm px-4 py-3 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/50 transition-colors group"
                          >
                            <span className="group-hover:text-accent transition-colors">{example}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`${message.role === "user" ? "flex gap-3 justify-end" : ""}`}
                    >
                      {message.role === "assistant" ? (
                        <GenieMessage 
                          content={message.content} 
                          mode={selectedMode || undefined}
                          trustMetadata={message.trustMetadata}
                          displayMode={trustDisplayMode}
                        />
                      ) : (
                        <div className="flex gap-3 justify-end">
                          <div className="rounded-xl px-4 py-3 max-w-[80%] bg-accent text-accent-foreground">
                            <div className="text-sm whitespace-pre-wrap leading-relaxed">
                              {message.content}
                            </div>
                          </div>
                          <div className="p-2 rounded-full bg-secondary h-fit shrink-0">
                            <User size={16} />
                          </div>
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
                    placeholder={currentMode ? `Ask in ${currentMode.name} mode...` : "Ask your AI Advisor..."}
                    className="min-h-[56px] max-h-[120px] resize-none"
                    disabled={isStreaming}
                  />
                  <Button
                    variant="accent"
                    size="icon"
                    className="h-14 w-14 shrink-0"
                    onClick={handleSend}
                    disabled={!input.trim() || isStreaming || !selectedMode || credits.balance < (currentMode?.creditCost || 0)}
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


      {/* Decision Drawer */}
      <DecisionDrawer
        open={decisionDrawerOpen}
        onClose={() => setDecisionDrawerOpen(false)}
        context={decisionContext}
        onAskMore={handleDecisionDrawerAsk}
      />
    </div>
  );
};

export default Genie;
