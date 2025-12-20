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
  MessageCircle,
  Calendar,
  Mail,
  CheckCircle,
  User,
  Bot
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const streamChat = useCallback(async (userMessages: Message[]) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-coach-chat`;

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: userMessages }),
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
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    try {
      await streamChat(newMessages);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to get response");
      // Remove the failed assistant message if any
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

  if (authLoading || checkingSubscription) {
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
                Your expert AI coach for building wellness apps, strategic guidance, and operational excellence.
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
                      <p className="font-medium">Unlimited AI Coaching</p>
                      <p className="text-sm text-muted-foreground">Strategic and operational guidance from the Wellness Genius</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Lovable Building Support</p>
                      <p className="text-sm text-muted-foreground">Expert help building apps and tools with Lovable</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        <Mail size={16} />
                        Premium Newsletter
                      </p>
                      <p className="text-sm text-muted-foreground">Exclusive insights and strategies delivered monthly</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        <Calendar size={16} />
                        1 Call/Month with Andy
                      </p>
                      <p className="text-sm text-muted-foreground">30-minute strategy call with our founder</p>
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

  // Chat Interface for Subscribers
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
          <div className="flex items-center justify-between mb-6 shrink-0">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/hub")}>
                <ArrowLeft size={16} />
                Back to Hub
              </Button>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-accent/10">
                  <Sparkles size={20} className="text-accent" />
                </div>
                <div>
                  <h1 className="text-lg font-heading">Wellness Genius AI Coach</h1>
                  {subscriptionEnd && (
                    <p className="text-xs text-muted-foreground">
                      Renews {new Date(subscriptionEnd).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-card p-4 mb-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="p-4 rounded-full bg-accent/10 mb-4">
                  <MessageCircle size={32} className="text-accent" />
                </div>
                <h2 className="text-xl font-heading mb-2">Welcome to Your AI Coach</h2>
                <p className="text-muted-foreground max-w-md mb-6">
                  I'm here to help you build wellness apps with Lovable, answer strategic questions, and guide your operational decisions.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    "Help me plan an AI feature for my gym app",
                    "What metrics should I track for member retention?",
                    "How do I structure a Lovable prompt for a booking system?",
                  ].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      onClick={() => setInput(suggestion)}
                      className="text-xs"
                    >
                      {suggestion}
                    </Button>
                  ))}
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
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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

          {/* Input */}
          <div className="shrink-0 flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about strategy, Lovable building, or operational questions..."
              className="min-h-[56px] max-h-[120px] resize-none"
              disabled={isStreaming}
            />
            <Button
              variant="accent"
              size="icon"
              className="h-14 w-14 shrink-0"
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
            >
              {isStreaming ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Send size={20} />
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AICoach;
