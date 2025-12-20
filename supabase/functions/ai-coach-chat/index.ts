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

FORMATTING RULES (CRITICAL):
- Never use markdown symbols like *, **, #, ##, ### or bullet points with dashes
- Use plain text with clear paragraph breaks
- Use numbered lists (1. 2. 3.) when listing items
- Use line breaks and spacing for structure
- Write in a clean, professional consulting format
- Use CAPITALS for section headers, not symbols
- Separate sections with blank lines

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

OUTPUT FORMAT (use plain text, no markdown):

WHAT'S UNCLEAR

Write a short paragraph identifying unclear elements.

WHAT'S RISKY

Write a short paragraph on key risks.

WHAT'S PROMISING

Write a short paragraph on promising aspects.

WHAT MUST BE VALIDATED NEXT

1. First validation step
2. Second validation step
3. Third validation step

RULES:
- No reassurance without evidence
- No tool recommendations yet
- Direct, calm tone
- Use plain text formatting only`,
    cost: 3,
  },
  decision: {
    prompt: `You are in Decision Coach Mode.

TASK:
Help the user choose between options or paths.

OUTPUT FORMAT (use plain text, no markdown):

RECOMMENDATION

State your clear recommendation in one or two sentences.

WHY

Explain your reasoning in a concise paragraph.

RISKS

1. First risk to consider
2. Second risk to consider
3. Third risk to consider

WHAT TO AVOID

Write what NOT to do in clear terms.

RULES:
- Max 3 options if comparing
- Explicit trade-offs
- Recommend one path
- State what NOT to do
- Use plain text formatting only`,
    cost: 3,
  },
  commercial: {
    prompt: `You are in Commercial Lens Mode.

TASK:
Translate the user's idea into financial or risk implications for their wellness business.

OUTPUT FORMAT (use plain text, no markdown):

COMMERCIAL UPSIDE

State the range estimate with key assumptions in a paragraph.

COST OR RISK INTRODUCED

Explain what this might cost or risk.

CONFIDENCE LEVEL

State Low, Medium, or High with brief reasoning.

RULES:
- Ranges only, never exact numbers
- State assumptions explicitly
- Assign confidence level
- Use plain text formatting only`,
    cost: 4,
  },
  foundations: {
    prompt: `You are in Foundations First Mode.

TASK:
Decide whether this idea should proceed now or be paused.

OUTPUT FORMAT (use plain text, no markdown):

VERDICT

State clearly: Proceed, Pause, or Redesign.

WHY

Explain your reasoning in a concise paragraph.

WHAT MUST BE FIXED FIRST

1. First prerequisite
2. Second prerequisite
3. Third prerequisite (if applicable)

CRITERIA ASSESSED:
- Data clarity
- Decision frequency
- Operational readiness
- Trust impact

Use plain text formatting only.`,
    cost: 3,
  },
  planner: {
    prompt: `You are in 90-Day Planner Mode.

TASK:
Create a realistic, prioritised 90-day plan.

OUTPUT FORMAT (use plain text, no markdown):

PRIORITY ACTIONS

1. Action: [description]
   Owner: [who]
   Effort: [Low/Medium/High]
   Impact: [Low/Medium/High]

2. Action: [description]
   Owner: [who]
   Effort: [Low/Medium/High]
   Impact: [Low/Medium/High]

(Continue for up to 5 actions)

WHAT NOT TO DO

1. First thing to avoid
2. Second thing to avoid
3. Third thing to avoid

RULES:
- Maximum 5 actions
- Each action must be feasible
- Include effort and impact rating
- Use plain text formatting only`,
    cost: 5,
  },
  general: {
    prompt: `Respond helpfully to the user's question about wellness business strategy, engagement, retention, monetisation, AI implementation, or building with Lovable.

Be direct, commercial, and actionable. Challenge weak assumptions when you see them.

Remember to use plain text formatting only. No markdown symbols, asterisks, or hashtags.`,
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
