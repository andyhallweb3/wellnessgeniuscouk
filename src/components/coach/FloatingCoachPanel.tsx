import { useState, useRef, useCallback, useEffect } from "react";
import { 
  Send, 
  Loader2, 
  User, 
  RotateCcw, 
  FolderOpen,
  Minimize2,
  MessageSquare,
  HelpCircle,
  Mail,
  ChevronRight,
  ExternalLink
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
import { Link } from "react-router-dom";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface FloatingCoachPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const FAQS = [
  // Getting Started
  {
    question: "What is Wellness Genius?",
    answer: "Wellness Genius is an AI-powered platform designed to help wellness businesses navigate the AI landscape. We offer tools, assessments, playbooks, and expert consulting to help you implement AI effectively."
  },
  {
    question: "How do I get started?",
    answer: "Start with our free AI Readiness Assessment to understand where your business stands. From there, explore our free resources or book a strategy call to discuss your specific needs."
  },
  {
    question: "Do I need technical knowledge to use your tools?",
    answer: "No! Our tools are designed for wellness business operators, not developers. Everything is explained in plain English with actionable next steps."
  },
  // Products & Services
  {
    question: "What products do you offer?",
    answer: "We offer free playbooks and guides, paid diagnostic tools, and consulting services ranging from AI Readiness Sprints to custom AI agent builds. Visit our Products page to explore all options."
  },
  {
    question: "What's the difference between consulting and software services?",
    answer: "Consulting includes strategy, training, and roadmaps (AI Readiness Sprint, AI Literacy for Leaders). Software services are custom builds—AI agents, websites, apps, and platforms built specifically for your business."
  },
  {
    question: "How much do your services cost?",
    answer: "Free AI Readiness Assessment. Consulting starts at £1,500. AI Agent builds from £8,000. Custom software from £10,000. Book a call for a custom quote."
  },
  // AI Features
  {
    question: "How does the AI Readiness Assessment work?",
    answer: "Our free AI Readiness Assessment takes about 10 minutes and evaluates your business across 5 key pillars: Data, Process, People, Risk, and Leadership. You'll receive a personalized score and actionable insights."
  },
  {
    question: "How does the AI Advisor work?",
    answer: "The AI Advisor is your strategic business partner. It uses AI to provide guidance on wellness business decisions, help you stress-test ideas, and build action plans. You need to be logged in to use it."
  },
  {
    question: "What are credits and how do they work?",
    answer: "Credits are used for AI Advisor conversations. You receive credits when you sign up, and can purchase more as needed. Each message uses 1 credit."
  },
  // Account & Billing
  {
    question: "How do I create an account?",
    answer: "Click 'Sign In' in the top right, then choose 'Create Account'. You can sign up with email. Your account gives you access to the AI Advisor, saved insights, and your purchase history."
  },
  {
    question: "Can I cancel or get a refund?",
    answer: "Digital products are non-refundable once accessed. For consulting services, we offer full refunds if cancelled before work begins. Contact us at hello@wellnessgenius.co.uk for any issues."
  },
  // Security & Privacy
  {
    question: "Is my data secure?",
    answer: "Yes. We take data security seriously. Your data is encrypted, never shared with third parties, and you can request deletion at any time. See our Privacy Policy for full details."
  },
  {
    question: "How do I delete my data?",
    answer: "Email hello@wellnessgenius.co.uk with the subject 'Data Deletion Request'. We'll process your request within 30 days and confirm when complete."
  },
];

const FloatingCoachPanel = ({ isOpen, onClose }: FloatingCoachPanelProps) => {
  const { user } = useAuth();
  const { credits, profile, deductCredits, saveSession } = useCoachCredits();
  const { documents, getDocumentContext } = useCoachDocuments();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeTab, setActiveTab] = useState(user ? "chat" : "help");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update default tab when user logs in/out
  useEffect(() => {
    if (!user && activeTab === "chat") {
      setActiveTab("help");
    }
  }, [user, activeTab]);

  const streamChat = useCallback(async (userMessages: Message[]) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-coach-chat`;
    
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.access_token) {
      throw new Error("Not authenticated. Please log in to use AI Coach.");
    }
    
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
      toast.error("Please sign in to use the AI advisor");
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
            </SheetTitle>
            <div className="flex items-center gap-2">
              {messages.length > 0 && activeTab === "chat" && (
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
            <TabsTrigger value="help" className="flex-1">
              <HelpCircle size={14} className="mr-1" />
              Help & FAQs
            </TabsTrigger>
            {user && (
              <>
                <TabsTrigger value="chat" className="flex-1">
                  <MessageSquare size={14} className="mr-1" />
                  AI Chat
                </TabsTrigger>
                <TabsTrigger value="library" className="flex-1">
                  <FolderOpen size={14} className="mr-1" />
                  Library
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* HELP & FAQ TAB - Available to everyone */}
          <TabsContent value="help" className="flex-1 flex flex-col overflow-hidden m-0 p-4">
            <div className="flex-1 overflow-y-auto space-y-4">
              {/* Quick Links */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quick Links</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="justify-start h-auto py-2" asChild>
                    <Link to="/ai-readiness" onClick={onClose}>
                      <ChevronRight size={14} className="mr-1" />
                      AI Readiness
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start h-auto py-2" asChild>
                    <Link to="/products" onClick={onClose}>
                      <ChevronRight size={14} className="mr-1" />
                      Products
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start h-auto py-2" asChild>
                    <Link to="/services" onClick={onClose}>
                      <ChevronRight size={14} className="mr-1" />
                      Consulting
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start h-auto py-2" asChild>
                    <Link to="/insights" onClick={onClose}>
                      <ChevronRight size={14} className="mr-1" />
                      Latest News
                    </Link>
                  </Button>
                </div>
              </div>

              {/* FAQs */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">FAQs</h3>
                <div className="space-y-2">
                  {FAQS.map((faq, index) => (
                    <div 
                      key={index}
                      className="rounded-lg border border-border bg-card overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-sm font-medium pr-2">{faq.question}</span>
                        <ChevronRight 
                          size={16} 
                          className={`shrink-0 text-muted-foreground transition-transform ${
                            expandedFaq === index ? "rotate-90" : ""
                          }`} 
                        />
                      </button>
                      {expandedFaq === index && (
                        <div className="px-3 pb-3 pt-0">
                          <p className="text-sm text-muted-foreground">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact / Email CTA */}
              <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Mail size={18} className="text-accent" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">Need more help?</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Can't find what you're looking for? Get in touch and we'll help you out.
                    </p>
                    <Button variant="accent" size="sm" className="w-full" asChild>
                      <a href="mailto:hello@wellnessgenius.co.uk">
                        <Mail size={14} />
                        Email Us
                        <ExternalLink size={12} />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Sign in prompt for non-users */}
              {!user && (
                <div className="rounded-xl border border-border bg-card p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    Sign in to access our AI Advisor for personalized business guidance
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/auth" onClick={onClose}>
                      Sign In / Create Account
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* CHAT TAB - Only for logged-in users */}
          {user && (
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
          )}

          {/* LIBRARY TAB - Only for logged-in users */}
          {user && (
            <TabsContent value="library" className="flex-1 overflow-hidden m-0">
              <DocumentLibrary />
            </TabsContent>
          )}
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default FloatingCoachPanel;