import { useState, useRef, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Loader2, 
  Sparkles, 
  User,
  Bot,
  RotateCcw,
  Brain,
  Lightbulb,
  Target,
  TrendingUp
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const GENIUS_MODES = [
  {
    id: "strategy",
    name: "Strategy",
    icon: <Target size={18} />,
    description: "Business strategy and planning advice",
    color: "bg-blue-500/10 text-blue-500"
  },
  {
    id: "innovation",
    name: "Innovation",
    icon: <Lightbulb size={18} />,
    description: "Creative ideas and new opportunities",
    color: "bg-yellow-500/10 text-yellow-500"
  },
  {
    id: "growth",
    name: "Growth",
    icon: <TrendingUp size={18} />,
    description: "Scaling and revenue optimization",
    color: "bg-green-500/10 text-green-500"
  },
  {
    id: "general",
    name: "General",
    icon: <Brain size={18} />,
    description: "Any wellness business question",
    color: "bg-accent/10 text-accent"
  }
];

const EXAMPLE_PROMPTS = {
  strategy: [
    "How should I position my boutique studio against big box gyms?",
    "What's the best membership model for a yoga studio?",
    "Should I expand to a second location or deepen my current offering?"
  ],
  innovation: [
    "What AI tools can help personalise member experiences?",
    "How can I use technology to reduce operational costs?",
    "What wellness trends should I be watching for 2025?"
  ],
  growth: [
    "How do I increase member retention beyond 80%?",
    "What marketing channels work best for local fitness businesses?",
    "How can I add recurring revenue streams?"
  ],
  general: [
    "What metrics should a wellness business track weekly?",
    "How do I motivate my team without increasing payroll?",
    "What's the biggest mistake wellness operators make?"
  ]
};

const AIGenius = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedMode, setSelectedMode] = useState("general");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      if (resp.status === 429) {
        throw new Error("Rate limit exceeded. Please try again in a moment.");
      }
      if (resp.status === 402) {
        throw new Error("Service temporarily unavailable. Please try again later.");
      }
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
            scrollToBottom();
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    return assistantContent;
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    try {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewConversation = () => {
    setMessages([]);
    setSelectedMode("general");
  };

  const currentMode = GENIUS_MODES.find(m => m.id === selectedMode) || GENIUS_MODES[3];
  const examples = EXAMPLE_PROMPTS[selectedMode as keyof typeof EXAMPLE_PROMPTS] || EXAMPLE_PROMPTS.general;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>AI Genius | Wellness Business Intelligence</title>
        <meta name="description" content="Get instant AI-powered insights for your wellness business. Strategy, innovation, and growth advice from Wellness Genius." />
      </Helmet>
      
      <Header />
      
      <main className="pt-24 pb-8 flex-1 flex flex-col">
        <div className="container-wide section-padding flex-1 flex flex-col max-h-[calc(100vh-180px)]">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-br from-accent/20 to-primary/20">
                <Sparkles size={24} className="text-accent" />
              </div>
              <div>
                <h1 className="text-xl font-heading">AI Genius</h1>
                <p className="text-sm text-muted-foreground">Wellness business intelligence</p>
              </div>
            </div>
            {messages.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleNewConversation}>
                <RotateCcw size={14} />
                New Chat
              </Button>
            )}
          </div>

          {/* Mode Selector (when no messages) */}
          {messages.length === 0 && (
            <div className="mb-6 shrink-0">
              <p className="text-sm text-muted-foreground mb-3">Choose a focus area:</p>
              <div className="flex flex-wrap gap-2">
                {GENIUS_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                      selectedMode === mode.id
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    {mode.icon}
                    <span className="text-sm font-medium">{mode.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto rounded-2xl border border-border bg-card p-6 mb-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className={`p-4 rounded-full ${currentMode.color} mb-4`}>
                  {currentMode.icon}
                </div>
                <h2 className="text-lg font-heading mb-2">{currentMode.name} Mode</h2>
                <p className="text-muted-foreground text-sm max-w-md mb-6">
                  {currentMode.description}
                </p>
                
                {/* Example Prompts */}
                <div className="w-full max-w-lg">
                  <p className="text-xs font-medium text-muted-foreground mb-3">Try asking:</p>
                  <div className="grid gap-2">
                    {examples.map((example, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInput(example)}
                        className="text-left text-sm px-4 py-3 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/50 transition-colors"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
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
                      className={`rounded-2xl px-4 py-3 max-w-[80%] ${
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
                    <div className="rounded-2xl px-4 py-3 bg-secondary">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="shrink-0">
            {messages.length > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-muted-foreground">Mode:</span>
                <div className="flex gap-1">
                  {GENIUS_MODES.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setSelectedMode(mode.id)}
                      disabled={isStreaming}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all ${
                        selectedMode === mode.id
                          ? "bg-accent/10 text-accent"
                          : "hover:bg-secondary"
                      }`}
                    >
                      {mode.icon}
                      <span className="hidden sm:inline">{mode.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your wellness business..."
                className="min-h-[56px] max-h-[120px] resize-none rounded-xl"
                disabled={isStreaming}
              />
              <Button
                variant="accent"
                size="icon"
                className="h-14 w-14 shrink-0 rounded-xl"
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
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AIGenius;
