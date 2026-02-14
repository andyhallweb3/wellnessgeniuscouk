import { useState, useRef, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Search, Sparkles, PenLine, Hexagon, RotateCcw } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

// ─── Tool definitions ────────────────────────────────────────────────────────

interface AgentTool {
  id: string;
  label: string;
  icon: React.ReactNode;
  tagline: string;
  greeting: string;
  placeholder: string;
}

const TOOLS: AgentTool[] = [
  {
    id: "assessment",
    label: "AI Readiness Assessment",
    icon: <Search className="h-5 w-5" />,
    tagline: "Find out where your business actually stands with AI",
    greeting: "Let's find out where your wellness business actually stands with AI — no fluff, just an honest picture.\n\nWhat type of wellness business do you run, and roughly how big is it?",
    placeholder: "Describe your business...",
  },
  {
    id: "genie",
    label: "AI Strategy Genie",
    icon: <Sparkles className="h-5 w-5" />,
    tagline: "Get a sharp strategy recommendation for your specific challenge",
    greeting: "What's the challenge you're trying to solve? Give me the real version — not the polished one.",
    placeholder: "What's the challenge?",
  },
  {
    id: "content",
    label: "Content Creator",
    icon: <PenLine className="h-5 w-5" />,
    tagline: "Turn research and ideas into ready-to-publish content",
    greeting: "Share an article, research finding, trend, or idea and I'll turn it into LinkedIn posts and a newsletter section — in your voice, ready to publish.\n\nWhat have you got?",
    placeholder: "Paste an article, share a topic or research finding...",
  },
  {
    id: "motionplus",
    label: "Motion+ Simulator",
    icon: <Hexagon className="h-5 w-5" />,
    tagline: "See exactly what Motion+ would do for your specific sites",
    greeting: "Let's build the business case for Motion+ at your sites — specific numbers, not a brochure.\n\nHow many sites do you operate, and which member management system do you use?",
    placeholder: "Tell me about your sites and setup...",
  },
];

// ─── Message types ───────────────────────────────────────────────────────────

interface Message {
  role: "user" | "assistant";
  content: string;
}

// ─── Markdown-lite renderer ──────────────────────────────────────────────────

function RenderMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-lg font-bold text-foreground mt-4 mb-2">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-base font-semibold text-foreground mt-3 mb-1">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith("- **")) {
      const match = line.match(/^- \*\*(.+?)\*\*:?\s*(.*)/);
      if (match) {
        elements.push(
          <div key={i} className="flex gap-2 text-sm text-muted-foreground my-1">
            <span className="text-accent mt-0.5">•</span>
            <span>
              <strong className="text-foreground">{match[1]}</strong>
              {match[2] ? ` ${match[2]}` : ""}
            </span>
          </div>
        );
      } else {
        elements.push(
          <div key={i} className="flex gap-2 text-sm text-muted-foreground my-1">
            <span className="text-accent mt-0.5">•</span>
            <span>{renderInline(line.slice(2))}</span>
          </div>
        );
      }
    } else if (/^\d+\.\s\*\*/.test(line)) {
      const match = line.match(/^\d+\.\s\*\*(.+?)\*\*\s*—?\s*(.*)/);
      if (match) {
        elements.push(
          <div key={i} className="flex gap-2 text-sm text-muted-foreground my-1.5">
            <span className="text-accent font-mono text-xs mt-0.5">{line.match(/^\d+/)?.[0]}.</span>
            <span>
              <strong className="text-foreground">{match[1]}</strong>
              {match[2] ? ` — ${match[2]}` : ""}
            </span>
          </div>
        );
      }
    } else if (line.startsWith("**") && line.endsWith("**")) {
      elements.push(
        <p key={i} className="text-sm font-semibold text-foreground my-1">
          {line.slice(2, -2)}
        </p>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(
        <p key={i} className="text-sm text-muted-foreground leading-relaxed">
          {renderInline(line)}
        </p>
      );
    }
  }

  return <div className="space-y-0.5">{elements}</div>;
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function AgentSuite() {
  const [activeTool, setActiveTool] = useState("assessment");
  const [conversations, setConversations] = useState<Record<string, Message[]>>({});
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const tool = TOOLS.find((t) => t.id === activeTool)!;
  const messages = conversations[activeTool] || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Auto-greet on fresh tool
  useEffect(() => {
    if (!conversations[activeTool]) {
      setConversations((prev) => ({
        ...prev,
        [activeTool]: [{ role: "assistant", content: tool.greeting }],
      }));
    }
  }, [activeTool]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);
    setStreamingContent("");

    const updatedMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setConversations((prev) => ({ ...prev, [activeTool]: updatedMessages }));

    // Build API messages (skip auto-greeting)
    const apiMessages = updatedMessages
      .filter((m, i) => !(i === 0 && m.role === "assistant"))
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ tool: activeTool, messages: apiMessages }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Failed to start stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ") || line.trim() === "") continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            // Anthropic SSE format
            if (parsed.type === "content_block_delta") {
              const delta = parsed.delta?.text || "";
              fullText += delta;
              setStreamingContent(fullText);
            }
          } catch {
            // partial JSON, skip
          }
        }
      }

      setStreamingContent("");
      setConversations((prev) => ({
        ...prev,
        [activeTool]: [...updatedMessages, { role: "assistant", content: fullText || "Something went wrong. Try again." }],
      }));
    } catch (err) {
      console.error("Agent chat error:", err);
      setStreamingContent("");
      setConversations((prev) => ({
        ...prev,
        [activeTool]: [
          ...updatedMessages,
          { role: "assistant", content: "Connection error. Please try again." },
        ],
      }));
    }

    setIsLoading(false);
    textareaRef.current?.focus();
  }, [input, isLoading, messages, activeTool]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetTool = () => {
    setConversations((prev) => ({ ...prev, [activeTool]: [] }));
    setStreamingContent("");
    // Re-trigger greeting
    setTimeout(() => {
      setConversations((prev) => ({
        ...prev,
        [activeTool]: [{ role: "assistant", content: tool.greeting }],
      }));
    }, 50);
  };

  const displayMessages: (Message & { isStreaming?: boolean })[] = streamingContent
    ? [...messages, { role: "assistant" as const, content: streamingContent, isStreaming: true }]
    : messages;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>AI Agent Suite | Wellness Genius</title>
        <meta name="description" content="Four specialist AI tools for wellness business operators: readiness assessment, strategy, content creation, and Motion+ business case simulator." />
      </Helmet>

      <Header />

      <main className="pt-24 pb-16 flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              AI Agent Suite
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Four specialist tools. Choose one, have a conversation, get real answers.
            </p>
          </div>

          {/* Tool Selector — 2×2 grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {TOOLS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTool(t.id)}
                className={cn(
                  "relative flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all duration-200",
                  activeTool === t.id
                    ? "border-accent bg-accent/5 shadow-sm shadow-accent/10"
                    : "border-border bg-card hover:border-accent/40 hover:bg-accent/[0.02]"
                )}
              >
                <div className={cn(
                  "transition-colors",
                  activeTool === t.id ? "text-accent" : "text-muted-foreground"
                )}>
                  {t.icon}
                </div>
                <div>
                  <div className={cn(
                    "text-xs font-semibold uppercase tracking-wider",
                    activeTool === t.id ? "text-accent" : "text-muted-foreground"
                  )}>
                    {t.label}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                    {t.tagline}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Active tool bar */}
          <div className="flex items-center justify-between mb-4 px-3 py-2 rounded-lg bg-accent/5 border border-accent/15">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                {tool.label}
              </span>
            </div>
            <button
              onClick={resetTool}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>

          {/* Chat window */}
          <Card className="mb-4 border-border/50">
            <CardContent className="p-0">
              <div className="min-h-[400px] max-h-[500px] overflow-y-auto p-4 space-y-4">
                {displayMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center text-xs text-accent-foreground mr-2.5 mt-1 flex-shrink-0">
                        ✦
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[82%] px-4 py-3 text-sm leading-relaxed",
                        msg.role === "user"
                          ? "bg-accent/10 border border-accent/20 rounded-2xl rounded-br-sm text-foreground"
                          : "bg-card border border-border rounded-2xl rounded-tl-sm"
                      )}
                    >
                      {msg.role === "assistant" ? (
                        <RenderMarkdown content={msg.content} />
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                      {msg.isStreaming && (
                        <span className="inline-block w-1.5 h-4 bg-accent ml-0.5 animate-pulse align-middle rounded-sm" />
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
          </Card>

          {/* Input area */}
          <div className={cn(
            "rounded-xl border transition-colors overflow-hidden",
            isLoading ? "border-accent/40" : "border-border"
          )}>
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={tool.placeholder}
              disabled={isLoading}
              rows={3}
              className="border-0 focus-visible:ring-0 resize-none bg-transparent text-sm"
            />
            <div className="flex items-center justify-between px-3 py-2 border-t border-border/50">
              <span className="text-[11px] text-muted-foreground font-mono">
                ↵ send · shift+↵ newline
              </span>
              <Button
                size="sm"
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="h-8 px-4 text-xs font-semibold"
              >
                {isLoading ? "Thinking..." : "Send →"}
              </Button>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-[10px] text-muted-foreground font-mono mt-4 uppercase tracking-widest">
            Wellness Genius · AI Agent Suite
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
