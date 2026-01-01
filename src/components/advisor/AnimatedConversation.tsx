import { useState, useEffect } from "react";
import { Brain, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  delay: number;
}

const DEMO_CONVERSATION: Message[] = [
  {
    role: "user",
    content: "Should I raise my membership prices? We haven't increased them in 3 years.",
    delay: 0,
  },
  {
    role: "assistant",
    content: `**Short answer:** Yes, but not across the board.

**Here's why:**
- 3 years without a price increase means you've effectively given members a 15-20% discount (inflation)
- Your costs have risen; your margins have shrunk

**What I'd challenge:**
- Which member segments have the highest lifetime value?
- Are you losing members to churn or to competitors?

**Recommended approach:**
1. Grandfather existing members at current rate for 6 months
2. New members pay updated pricing immediately
3. Add one tangible improvement to justify the increase

**Risk to watch:** If retention is already below 70%, fix that first.`,
    delay: 1500,
  },
  {
    role: "user",
    content: "Our retention is 68%. What should we focus on first?",
    delay: 8000,
  },
  {
    role: "assistant",
    content: `**That changes things.** At 68%, you're losing money faster than pricing can fix.

**Priority shift:** Retention first, pricing second.

**Quick diagnostic:**
- When do most members cancel? (Month 2-3 is typical)
- What's your "first 30 days" experience?

**One thing to try this week:**
Personal check-in call to every member in their first 30 days. Just 5 minutes. "How's it going? What can we help with?"

This alone typically lifts retention 8-12 points.

**Then revisit pricing** once you're above 75%.`,
    delay: 10000,
  },
];

const AnimatedConversation = () => {
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const showNextMessage = (index: number) => {
      if (index >= DEMO_CONVERSATION.length) {
        // Reset and loop
        setTimeout(() => {
          setVisibleMessages(0);
          showNextMessage(0);
        }, 5000);
        return;
      }

      const message = DEMO_CONVERSATION[index];
      const prevDelay = index > 0 ? DEMO_CONVERSATION[index - 1].delay : 0;
      const delay = message.delay - prevDelay;

      setTimeout(() => {
        if (message.role === "assistant") {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            setVisibleMessages(index + 1);
            showNextMessage(index + 1);
          }, 1200);
        } else {
          setVisibleMessages(index + 1);
          showNextMessage(index + 1);
        }
      }, delay);
    };

    showNextMessage(0);
  }, []);

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <p key={i} className="font-semibold text-foreground">
            {line.replace(/\*\*/g, "")}
          </p>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <p key={i} className="pl-3 text-muted-foreground">
            • {line.slice(2)}
          </p>
        );
      }
      if (line.match(/^\d\. /)) {
        return (
          <p key={i} className="pl-3 text-muted-foreground">
            {line}
          </p>
        );
      }
      if (line.startsWith("**") && line.includes(":**")) {
        const [label, rest] = line.split(":**");
        return (
          <p key={i}>
            <span className="font-semibold text-foreground">{label.replace("**", "")}:</span>
            <span className="text-muted-foreground">{rest?.replace(/\*\*/g, "")}</span>
          </p>
        );
      }
      return (
        <p key={i} className="text-muted-foreground">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-muted/50 border-b border-border px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Brain className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">AI Advisor</p>
          <p className="text-xs text-muted-foreground">Decision Support Mode</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">Live demo</span>
        </div>
      </div>

      {/* Messages */}
      <div className="p-4 space-y-4 h-[400px] overflow-y-auto">
        {DEMO_CONVERSATION.slice(0, visibleMessages).map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
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
                  : "bg-muted/50 space-y-1"
              )}
            >
              {message.role === "user" ? (
                <p>{message.content}</p>
              ) : (
                formatContent(message.content)
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 animate-in fade-in duration-200">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <div className="bg-muted/50 rounded-xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimatedConversation;
