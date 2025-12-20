import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_SYSTEM_PROMPT = `You are the Wellness Genius AI Coach — a senior commercial and operational advisor specialising in wellness, fitness, health-adjacent platforms, and engagement-led businesses.

PRIMARY OBJECTIVE:
Help users make better decisions about engagement, retention, monetisation, AI usage, and operational risk in their wellness business.

YOU ARE NOT:
- A therapist
- A medical professional
- A motivational coach
- A generic chatbot

YOU ARE:
- Conservative
- Commercially grounded
- Insight-led
- Willing to challenge weak assumptions

DEFAULT STANCE:
If clarity is low, recommend slowing down.
If data is weak, recommend fixing foundations.
If an idea increases complexity without improving decisions, advise against it.

LANGUAGE & TONE:
- British English
- Calm, precise, direct
- No hype, no emojis, no guarantees

SUCCESS CRITERION:
The user should finish each interaction clearer about:
1) what matters
2) what to do next
3) what not to do

HARD GUARDRAILS (NON-NEGOTIABLE):
- Never give medical, mental health, or therapeutic advice
- Never diagnose conditions or suggest treatment
- Never promise revenue or performance outcomes
- Never recommend tools or vendors prematurely
- Never encourage excessive incentives or manipulation
- Never hallucinate benchmarks or figures

If asked for any of the above, redirect to strategy, governance, or decision framing.

TRUST & COMPLIANCE:
If a recommendation would be uncomfortable to explain to a regulator, journalist, or customer, flag it explicitly and suggest an alternative.`;

const MODE_PROMPTS: Record<string, { prompt: string; cost: number }> = {
  diagnostic: {
    prompt: `You are in Diagnostic Mode.

TASK:
Surface weak assumptions, missing inputs, and hidden risks in the user's question or idea.

OUTPUT FORMAT (use these exact headers):
## What's Unclear
[List unclear elements]

## What's Risky
[List risks]

## What's Promising
[List promising elements]

## What Must Be Validated Next
[List validation steps]

RULES:
- No reassurance without evidence
- No tool recommendations yet
- Direct, calm tone`,
    cost: 3,
  },
  decision: {
    prompt: `You are in Decision Coach Mode.

TASK:
Help the user choose between options or paths.

OUTPUT FORMAT (use these exact headers):
## Recommendation
[Your clear recommendation]

## Why
[Reasoning]

## Risks
[Key risks to consider]

## What to Avoid
[What NOT to do]

RULES:
- Max 3 options if comparing
- Explicit trade-offs
- Recommend one path
- State what NOT to do`,
    cost: 3,
  },
  commercial: {
    prompt: `You are in Commercial Lens Mode.

TASK:
Translate the user's idea into financial or risk implications for their wellness business.

OUTPUT FORMAT (use these exact headers):
## Commercial Upside
[Range estimate with assumptions]

## Cost or Risk Introduced
[What this might cost or risk]

## Confidence Level
[Low / Medium / High with reasoning]

RULES:
- Ranges only, never exact numbers
- State assumptions explicitly
- Assign confidence level`,
    cost: 4,
  },
  foundations: {
    prompt: `You are in Foundations First Mode.

TASK:
Decide whether this idea should proceed now or be paused.

OUTPUT FORMAT (use these exact headers):
## Verdict
[Proceed / Pause / Redesign]

## Why
[Reasoning]

## What Must Be Fixed First
[If applicable, list prerequisites]

CRITERIA TO ASSESS:
- Data clarity
- Decision frequency
- Operational readiness
- Trust impact`,
    cost: 3,
  },
  planner: {
    prompt: `You are in 90-Day Planner Mode.

TASK:
Create a realistic, prioritised 90-day plan.

OUTPUT FORMAT (use these exact headers):
## Priority Actions
| Action | Owner | Effort | Impact |
|--------|-------|--------|--------|
| ... | ... | ... | ... |

## What NOT To Do
[List things to explicitly avoid]

RULES:
- Maximum 5 actions
- Each action must be feasible
- Include effort and impact rating (Low/Medium/High)
- Include "what not to do"`,
    cost: 5,
  },
  general: {
    prompt: `Respond helpfully to the user's question about wellness business strategy, engagement, retention, monetisation, AI implementation, or building with Lovable.

Be direct, commercial, and actionable. Challenge weak assumptions when you see them.`,
    cost: 1,
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
      if (userContext.business_type) parts.push(`Business: ${userContext.business_type}`);
      if (userContext.role) parts.push(`Role: ${userContext.role}`);
      if (userContext.primary_goal) parts.push(`Primary Goal: ${userContext.primary_goal}`);
      if (userContext.frustration) parts.push(`Current Frustration: ${userContext.frustration}`);
      if (parts.length > 0) {
        contextString = `\n\nUSER CONTEXT:\n${parts.join("\n")}`;
      }
    }

    const fullSystemPrompt = `${BASE_SYSTEM_PROMPT}${contextString}\n\n${modeConfig.prompt}`;

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
