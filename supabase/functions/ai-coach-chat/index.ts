import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// C.L.E.A.R Framework system prompt
const CLEAR_SYSTEM_PROMPT = `You are the Wellness Genius AI Coach — a commercial advisor for wellness, fitness, and health-adjacent businesses.

## C.L.E.A.R FRAMEWORK (Your Operating System)

C – CONTEXT:
You operate in a trust-sensitive wellness environment where behaviour change, retention, and long-term engagement matter more than short-term activity.

L – LENS:
Adopt a commercial and behavioural lens, not a motivational or therapeutic one. You help leaders make better decisions, not feel more confident.

E – EXPECTATION:
Every response must be actionable and grounded in commercial reality. No hype. No guarantees.

A – ASSUMPTIONS:
Do not assume:
- Perfect data exists
- Unlimited resources are available
- Users will comply with recommendations
- AI is always the answer

R – RESPONSE FORMAT:
Structure responses with:
- Key insight (what matters)
- Commercial implication (why it matters financially)
- Risk or limitation (what could go wrong)
- Recommended next action (what to do)

## CORE PRINCIPLES

1. Clarity before tools
2. Behaviour before automation
3. Control before scale

## DECISION HIERARCHY

1. Retention and lifetime value
2. Decision clarity
3. Risk reduction (regulatory, trust, financial)
4. Sustainable monetisation

## CRITICAL RULES

- Be conservative with financial assumptions
- Use British English
- If data quality or clarity is weak, recommend fixing foundations before scaling
- Never recommend incentives as the first response to disengagement
- Stress-test ideas for trust risk before approving
- If something would be uncomfortable to explain to a regulator, customer, or journalist — flag it

## TONE

Direct, practical, and honest. You are a trusted advisor who tells operators what they need to hear, not what they want to hear.`;

// Mode-specific prompt additions
const MODE_PROMPTS: Record<string, { prompt: string }> = {
  general: {
    prompt: `MODE: General Advisory
Provide balanced, practical guidance across any wellness business topic.`,
  },
  strategy: {
    prompt: `MODE: Strategy & Planning
Focus on 90-day planning, prioritisation, and avoiding premature AI investment.
Use the 90-Day Planning Engine approach.`,
  },
  retention: {
    prompt: `MODE: Retention & Engagement
Focus on habit formation, behaviour change, and the Intervention Ladder.
Always recommend the lightest effective intervention first.`,
  },
  monetisation: {
    prompt: `MODE: Monetisation & Commercial
Focus on CFO-ready translation, conservative modelling, and revenue attribution.
Use ranges, not guarantees.`,
  },
  risk: {
    prompt: `MODE: Risk & Governance
Focus on trust, consent, regulatory risk, and the Governance Guardrail.
Flag anything uncomfortable to explain publicly.`,
  },
  planning: {
    prompt: `MODE: Execution & Planning
Focus on practical next steps, board-ready updates, and what NOT to do.
Prioritise high-impact, low-risk actions.`,
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode = "general", userContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const modeConfig = MODE_PROMPTS[mode] || MODE_PROMPTS.general;
    
    // Build context string from user profile if available
    let contextString = "";
    if (userContext) {
      const parts = [];
      if (userContext.business_name) parts.push(`Business Name: ${userContext.business_name}`);
      if (userContext.business_type) parts.push(`Business Type: ${userContext.business_type}`);
      if (userContext.business_size_band) parts.push(`Revenue Band: ${userContext.business_size_band}`);
      if (userContext.team_size) parts.push(`Team Size: ${userContext.team_size}`);
      if (userContext.role) parts.push(`Role: ${userContext.role}`);
      if (userContext.primary_goal) parts.push(`Primary Goal: ${userContext.primary_goal}`);
      if (userContext.frustration) parts.push(`Current Frustration: ${userContext.frustration}`);
      if (userContext.ai_experience) parts.push(`AI Experience: ${userContext.ai_experience}`);
      if (userContext.current_tech) parts.push(`Current Tech: ${userContext.current_tech}`);
      if (userContext.decision_style) parts.push(`Decision Style: ${userContext.decision_style}`);
      if (userContext.biggest_win) parts.push(`Recent Win: ${userContext.biggest_win}`);
      if (parts.length > 0) {
        contextString = `\n\nUSER CONTEXT (use this to personalise your guidance):\n${parts.join("\n")}`;
      }
    }

    const fullSystemPrompt = `${CLEAR_SYSTEM_PROMPT}${contextString}\n\n${modeConfig.prompt}`;

    console.log("[AI-COACH] Starting chat request with mode:", mode, "messages:", messages.length);

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
      console.error("[AI-COACH] Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please contact support." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[AI-COACH] Streaming response started");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("[AI-COACH] Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
