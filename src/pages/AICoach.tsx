import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Loader2, 
  Lock, 
  Sparkles, 
  ArrowLeft,
  Calendar,
  Mail,
  CheckCircle,
  User,
  Bot,
  Bookmark,
  BookmarkCheck,
  RotateCcw,
  Settings,
  BookOpen
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CoachOnboarding from "@/components/coach/CoachOnboarding";
import ModeSelector, { COACH_MODES } from "@/components/coach/ModeSelector";
import CreditDisplay from "@/components/coach/CreditDisplay";
import CoachPromptLibrary from "@/components/coach/CoachPromptLibrary";
import { useCoachCredits } from "@/hooks/useCoachCredits";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AICoach = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedMode, setSelectedMode] = useState("general");
  const [lastSessionId, setLastSessionId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { 
    credits, 
    profile, 
    loading: creditsLoading, 
    deductCredits, 
    saveProfile, 
    saveSession,
    toggleSaveSession 
  } = useCoachCredits();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/hub/coach");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user]);

  useEffect(() => {
    if (searchParams.get("subscribed") === "true") {
      toast.success("Welcome to Wellness Genius AI Coach!");
      checkSubscription();
    }
  }, [searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const checkSubscription = async () => {
    setCheckingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-coach-subscription");
      
      if (error) throw error;
      
      setIsSubscribed(data.subscribed);
      setSubscriptionEnd(data.subscription_end);
    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-coach-subscription");
      
      if (error) throw error;
      
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Failed to start subscription. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  const handleManageSubscription = async () => {
    setOpeningPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("coach-customer-portal");
      
      if (error) throw error;
      
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Portal error:", error);
      toast.error("Failed to open subscription management. Please try again.");
    } finally {
      setOpeningPortal(false);
    }
  };

  const handleOnboardingComplete = async (profileData: {
    business_type: string;
    business_name: string;
    business_size_band: string;
    team_size: string;
    role: string;
    primary_goal: string;
    frustration: string;
    current_tech: string;
    ai_experience: string;
    biggest_win: string;
    decision_style: string;
  }) => {
    const success = await saveProfile(profileData);
    if (success) {
      toast.success("Profile saved. Let's get started.");
    }
  };

  const getModeConfig = (modeId: string) => {
    return COACH_MODES.find((m) => m.id === modeId) || COACH_MODES[5]; // Default to general
  };

  const getPromptExamples = (mode: string): string[] => {
    const examples: Record<string, string[]> = {
      diagnostic: [
        "We want to add AI-powered workout recommendations. What are we missing?",
        "Our retention dropped 15% last quarter. What should I investigate?",
        "Is our member data good enough to personalise experiences?",
      ],
      decision: [
        "Should we build an app or improve our web experience first?",
        "Monthly subscription vs pay-per-class: which model suits a boutique gym?",
        "Hire in-house developers or use a no-code platform for our MVP?",
      ],
      commercial: [
        "What would adding a nutrition coaching tier do to our unit economics?",
        "Is a 24/7 unmanned gym model financially viable for our area?",
        "What margin can we expect from corporate wellness contracts?",
      ],
      foundations: [
        "We want to launch AI personalisation next month. Are we ready?",
        "Should we start collecting more member health data now?",
        "Is our team equipped to handle a new mobile app?",
      ],
      planner: [
        "Create a 90-day plan to improve member retention by 10%",
        "Plan the launch of a new premium membership tier",
        "Map out our AI readiness improvement over the next quarter",
      ],
      general: [
        "How do I increase member engagement without discounting?",
        "What metrics should a wellness business track weekly?",
        "How can small studios compete with big box gyms?",
      ],
    };
    return examples[mode] || examples.general;
  };

  const streamChat = useCallback(async (userMessages: Message[], mode: string) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-coach-chat`;

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ 
        messages: userMessages,
        mode,
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
  }, [profile]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const modeConfig = getModeConfig(selectedMode);
    
    // Check credits
    if (credits.balance < modeConfig.cost) {
      toast.error("Not enough credits for this mode. Try a simpler question.");
      return;
    }

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);
    setLastSessionId(null);
    setIsSaved(false);

    try {
      // Deduct credits first
      const deducted = await deductCredits(modeConfig.cost, selectedMode);
      if (!deducted) {
        throw new Error("Failed to deduct credits");
      }

      const response = await streamChat(newMessages, selectedMode);
      
      // Save session
      const session = await saveSession(
        selectedMode,
        userMessage.content,
        response,
        modeConfig.cost
      );
      if (session) {
        setLastSessionId(session.id);
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

  const handleSaveInsight = async () => {
    if (!lastSessionId) return;
    const success = await toggleSaveSession(lastSessionId, true);
    if (success) {
      setIsSaved(true);
      toast.success("Insight saved to your hub");
    }
  };

  const handleNewConversation = () => {
    setMessages([]);
    setLastSessionId(null);
    setIsSaved(false);
    setSelectedMode("general");
  };

  if (authLoading || checkingSubscription || creditsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  // Subscription Gate
  if (!isSubscribed) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>AI Coach | Wellness Genius</title>
          <meta name="description" content="Your personal AI coach for wellness business strategy and building with Lovable." />
        </Helmet>
        
        <Header />
        
        <main className="pt-24 pb-16">
          <div className="container-narrow section-padding">
            <Button variant="ghost" size="sm" className="mb-8" onClick={() => navigate("/hub")}>
              <ArrowLeft size={16} />
              Back to Hub
            </Button>

            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
                <Sparkles size={32} className="text-accent" />
              </div>
              <h1 className="text-3xl md:text-4xl font-heading mb-4">Wellness Genius AI Coach</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Decision intelligence for wellness leaders. Not a chatbot.
              </p>
            </div>

            {/* Pricing Card */}
            <div className="max-w-lg mx-auto">
              <div className="rounded-2xl border-2 border-accent bg-card p-8 shadow-elegant">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold mb-2">£9.99<span className="text-lg font-normal text-muted-foreground">/month</span></div>
                  <p className="text-muted-foreground">Cancel anytime</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">40 Credits/Month</p>
                      <p className="text-sm text-muted-foreground">5 strategic modes for deep thinking</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Decision-Grade Intelligence</p>
                      <p className="text-sm text-muted-foreground">Challenges assumptions, protects margin</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        <Mail size={16} />
                        Premium Newsletter
                      </p>
                      <p className="text-sm text-muted-foreground">Exclusive insights delivered monthly</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        <Calendar size={16} />
                        1 Call/Month with Andy
                      </p>
                      <p className="text-sm text-muted-foreground">30-minute strategy call</p>
                    </div>
                  </li>
                </ul>

                <Button 
                  variant="accent" 
                  size="lg" 
                  className="w-full"
                  onClick={handleSubscribe}
                  disabled={subscribing}
                >
                  {subscribing ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Lock size={20} />
                  )}
                  {subscribing ? "Processing..." : "Unlock AI Coach"}
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  Secure payment via Stripe. Cancel anytime.
                </p>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  // Onboarding for new users
  if (!profile?.onboarding_completed) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>AI Coach Setup | Wellness Genius</title>
        </Helmet>
        
        <Header />
        
        <main className="pt-24 pb-16">
          <div className="container-narrow section-padding">
            <Button variant="ghost" size="sm" className="mb-8" onClick={() => navigate("/hub")}>
              <ArrowLeft size={16} />
              Back to Hub
            </Button>

            <CoachOnboarding onComplete={handleOnboardingComplete} />
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  // Main Chat Interface
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>AI Coach | Wellness Genius</title>
        <meta name="description" content="Chat with your AI coach for wellness business guidance." />
      </Helmet>
      
      <Header />
      
      <main className="pt-24 pb-4 flex-1 flex flex-col">
        <div className="container-wide section-padding flex-1 flex flex-col max-h-[calc(100vh-180px)]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/hub")}>
                <ArrowLeft size={16} />
                Back
              </Button>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-accent/10">
                  <Sparkles size={18} className="text-accent" />
                </div>
                <div>
                  <h1 className="text-base font-heading">Wellness Genius AI Coach</h1>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleManageSubscription}
                disabled={openingPortal}
                title="Manage subscription"
              >
                {openingPortal ? <Loader2 size={14} className="animate-spin" /> : <Settings size={14} />}
              </Button>
              {messages.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleNewConversation}>
                  <RotateCcw size={14} />
                  New
                </Button>
              )}
              <CreditDisplay 
                balance={credits.balance} 
                monthlyAllowance={credits.monthlyAllowance} 
                compact 
              />
            </div>
          </div>

          {/* Mode Selector (when no messages) */}
          {messages.length === 0 && (
            <div className="mb-6 shrink-0">
              <h2 className="text-sm font-medium mb-3 text-muted-foreground">Select a mode</h2>
              <ModeSelector 
                selectedMode={selectedMode} 
                onSelectMode={setSelectedMode}
                credits={credits.balance}
              />
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-card p-4 mb-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="p-4 rounded-full bg-accent/10 mb-4">
                  <span className="text-3xl">{getModeConfig(selectedMode).icon}</span>
                </div>
                <h2 className="text-lg font-heading mb-2">{getModeConfig(selectedMode).name}</h2>
                <p className="text-muted-foreground text-sm max-w-md mb-4">
                  {getModeConfig(selectedMode).description}
                </p>
                
                {/* Prompt Examples */}
                <div className="w-full max-w-lg mt-6">
                  <p className="text-xs font-medium text-muted-foreground mb-3">Try asking:</p>
                  <div className="grid gap-2">
                    {getPromptExamples(selectedMode).map((example, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInput(example)}
                        className="text-left text-sm px-4 py-3 rounded-lg bg-secondary/50 hover:bg-secondary border border-border/50 transition-colors"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPromptLibrary(true)}
                    >
                      <BookOpen size={14} />
                      Browse Prompt Library
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Tip: Be specific about your business context for better responses.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
                  >
                    {message.role === "assistant" && (
                      <div className="p-2 rounded-full bg-accent/10 h-fit shrink-0">
                        <Bot size={16} className="text-accent" />
                      </div>
                    )}
                    <div
                      className={`rounded-xl px-4 py-3 max-w-[80%] ${
                        message.role === "user"
                          ? "bg-accent text-accent-foreground"
                          : "bg-secondary"
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </div>
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
                      <Bot size={16} className="text-accent" />
                    </div>
                    <div className="rounded-xl px-4 py-3 bg-secondary">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Save Button (after response) */}
          {lastSessionId && messages.length > 0 && !isStreaming && (
            <div className="shrink-0 flex justify-end mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveInsight}
                disabled={isSaved}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck size={14} />
                    Saved
                  </>
                ) : (
                  <>
                    <Bookmark size={14} />
                    Save Insight
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Input */}
          <div className="shrink-0">
            {messages.length > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-muted-foreground">Mode:</span>
                <select
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value)}
                  className="text-xs bg-secondary border border-border rounded px-2 py-1"
                  disabled={isStreaming}
                >
                  {COACH_MODES.map((mode) => (
                    <option key={mode.id} value={mode.id} disabled={credits.balance < mode.cost}>
                      {mode.icon} {mode.name} ({mode.cost} credits)
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-14 w-14 shrink-0"
                onClick={() => setShowPromptLibrary(true)}
                title="Prompt Library"
              >
                <BookOpen size={18} />
              </Button>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask about strategy, decisions, or commercial impact...`}
                className="min-h-[56px] max-h-[120px] resize-none"
                disabled={isStreaming}
              />
              <Button
                variant="accent"
                size="icon"
                className="h-14 w-14 shrink-0"
                onClick={handleSend}
                disabled={!input.trim() || isStreaming || credits.balance < getModeConfig(selectedMode).cost}
              >
                {isStreaming ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Send size={20} />
                )}
              </Button>
            </div>
            {credits.balance < getModeConfig(selectedMode).cost && (
              <p className="text-xs text-destructive mt-2">
                Not enough credits. Select a cheaper mode or wait for monthly reset.
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Prompt Library Modal */}
      {showPromptLibrary && (
        <CoachPromptLibrary
          onSelectPrompt={(prompt) => {
            setInput(prompt);
            setShowPromptLibrary(false);
          }}
          onClose={() => setShowPromptLibrary(false)}
        />
      )}
    </div>
  );
};

export default AICoach;
