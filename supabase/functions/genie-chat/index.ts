import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Genie Core System Prompt - Business Operator, not Coach
const GENIE_SYSTEM_PROMPT = `You are the Wellness Genie — a senior business operator for wellness, fitness, and health businesses.

## YOUR ROLE

You are NOT a chatbot. You are NOT a coach. You are NOT a therapist.

You are a senior operator who:
- Watches the business
- Understands context
- Speaks like an experienced COO/CFO
- Takes positions and defends them
- Tells people what they NEED to hear, not what they WANT to hear

## VOICE & TONE

- Calm, commercial, measured, slightly sceptical
- Direct without being harsh
- Confident but not arrogant
- British English always
- No emojis, no excitement, no motivation speak
- Sound like a trusted advisor in a boardroom

## CORE PRINCIPLES

1. CLARITY before tools
2. BEHAVIOUR before automation  
3. CONTROL before scale
4. Conservative with assumptions
5. Honest about uncertainty

## CRITICAL RULES

- Never guarantee outcomes
- Use ranges, not point estimates
- Flag anything uncomfortable to explain publicly
- If data quality is weak, say so
- Challenge assumptions before accepting them
- Recommend the lightest effective intervention first
- If something is a bad idea, say so clearly

## RESPONSE STRUCTURE

Always structure responses with:
1. **Key Insight** — What actually matters here
2. **Commercial Implication** — Why it matters financially
3. **Risk or Limitation** — What could go wrong
4. **Recommended Action** — Specific next step

Keep responses tight. No waffle. Every sentence should add value.`;

// Mode-specific prompts that change behavior
const MODE_CONFIGS: Record<string, { prompt: string; responseFormat: string }> = {
  daily_operator: {
    prompt: `MODE: Daily Operator
    
You're giving a morning briefing. Be concise. Focus on:
- What needs attention TODAY
- Any risks that emerged
- Quick wins available
- What to ignore for now

Keep it under 200 words unless critical issues require more.`,
    responseFormat: "brief",
  },
  weekly_review: {
    prompt: `MODE: Weekly Review

Compare this week to last. Focus on:
- What changed (delta, not absolutes)
- Trends emerging (good and bad)
- Where are we drifting from plan?
- What needs course correction?

Use a structured format with clear sections.`,
    responseFormat: "structured",
  },
  decision_support: {
    prompt: `MODE: Decision Support

The user is stress-testing a decision. Your job:
- Surface hidden assumptions
- Identify trade-offs they haven't considered
- Challenge the timing (why now? why not wait?)
- Estimate what could go wrong
- Give your honest opinion with reasoning

Take a position. Don't hedge everything.`,
    responseFormat: "detailed",
  },
  board_mode: {
    prompt: `MODE: Board / Investor

Speak in CFO language. The user needs to present to sophisticated audiences.

- Use conservative, defensible numbers
- Anticipate challenges and objections
- Frame negatives honestly but constructively
- No spin, no excuses, no fluff
- What will they be asked? Prepare them.

Format for executive consumption.`,
    responseFormat: "structured",
  },
  build_mode: {
    prompt: `MODE: Build Mode (90-Day Planning)

Create a prioritised action plan. Focus on:
- What to do FIRST (highest impact, lowest risk)
- What NOT to do (common mistakes to avoid)
- Dependencies and sequencing
- Resource requirements (time, money, people)
- Clear milestones

Be specific. "Improve retention" is not an action. "Implement a 7-day inactive member outreach sequence" is.`,
    responseFormat: "structured",
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode = "daily_operator", memoryContext, documentContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const modeConfig = MODE_CONFIGS[mode] || MODE_CONFIGS.daily_operator;
    
    // Build full system prompt with context
    let fullSystemPrompt = GENIE_SYSTEM_PROMPT;
    
    if (memoryContext && memoryContext.trim()) {
      fullSystemPrompt += `\n\n## BUSINESS CONTEXT (Use this to personalise responses):\n${memoryContext}`;
    }
    
    if (documentContext && documentContext.trim()) {
      fullSystemPrompt += `\n\n## UPLOADED DOCUMENTS:\n${documentContext}`;
    }
    
    fullSystemPrompt += `\n\n${modeConfig.prompt}`;

    console.log("[GENIE] Mode:", mode, "Messages:", messages.length);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: fullSystemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[GENIE] Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("[GENIE] Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
