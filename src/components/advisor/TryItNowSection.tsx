import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Send, Loader2, Lock, ArrowRight, User, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STORAGE_KEY = "advisor_trial_count";
const MAX_FREE_QUESTIONS = 2;

const EXAMPLE_QUESTIONS = [
  "How do I improve member retention?",
  "Should I raise my prices?",
  "What metrics should I track?",
  "How can I reduce staff turnover?",
];

const TryItNowSection = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setQuestionsUsed(parseInt(stored, 10));
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading || questionsUsed >= MAX_FREE_QUESTIONS) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/genie-chat`;
      
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }],
          mode: "quick_question",
          isTrialMode: true,
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
            
            // Skip trust metadata events
            if (parsed.type === "trust_metadata") continue;

            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
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

      const newCount = questionsUsed + 1;
      setQuestionsUsed(newCount);
      localStorage.setItem(STORAGE_KEY, newCount.toString());
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const remainingQuestions = MAX_FREE_QUESTIONS - questionsUsed;
  const isLocked = questionsUsed >= MAX_FREE_QUESTIONS;

  return (
    <section id="try-it" className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Try it free
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Ask Your First Question
            </h2>
            <p className="text-muted-foreground">
              {isLocked
                ? "You've used your free questions. Sign up for more!"
                : `${remainingQuestions} free question${remainingQuestions !== 1 ? "s" : ""} remaining`}
            </p>
          </div>

          <Card className="border-border/50 shadow-xl overflow-hidden">
            <CardContent className="p-0">
              {/* Chat area */}
              <div className="min-h-[200px] max-h-[400px] overflow-y-auto p-4 space-y-4 bg-muted/20">
                {messages.length === 0 && !isLocked && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Brain className="h-10 w-10 mx-auto mb-3 text-primary/30" />
                    <p className="text-sm mb-4">
                      Ask anything about your wellness business
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {EXAMPLE_QUESTIONS.map((question) => (
                        <button
                          key={question}
                          onClick={() => setInput(question)}
                          className="px-3 py-1.5 text-xs rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex gap-3 animate-fade-in",
                      message.role === "user" ? "flex-row-reverse" : ""
                    )}
                  >
                    <div
                      className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                        message.role === "user" ? "bg-accent/20" : "bg-primary/20"
                      )}
                    >
                      {message.role === "user" ? (
                        <User className="h-4 w-4 text-accent" />
                      ) : (
                        <Brain className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "flex-1 rounded-xl px-4 py-3 text-sm max-w-[85%]",
                        message.role === "user"
                          ? "bg-accent/10 text-foreground ml-auto"
                          : "bg-card border border-border/50"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 animate-fade-in">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Brain className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-card border border-border/50 rounded-xl px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="border-t border-border/50 p-4 bg-background">
                {isLocked ? (
                  <div className="text-center py-4">
                    <Lock className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">
                      You've used your 2 free questions.
                      <br />
                      Create an account to continue the conversation.
                    </p>
                    <Button variant="hero" size="lg" asChild>
                      <Link to="/auth?redirect=/genie">
                        Get 10 Free Credits
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about pricing, retention, marketing..."
                      className="min-h-[44px] max-h-[120px] resize-none"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleSubmit}
                      disabled={!input.trim() || isLoading}
                      size="icon"
                      className="h-11 w-11 flex-shrink-0"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {!isLocked && messages.length > 0 && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              {remainingQuestions} question{remainingQuestions !== 1 ? "s" : ""} left •{" "}
              <Link to="/auth?redirect=/genie" className="text-primary hover:underline">
                Sign up for 10 free credits
              </Link>
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default TryItNowSection;
