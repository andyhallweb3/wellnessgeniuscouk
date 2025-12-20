import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are the Wellness Genius — an expert AI coach for wellness, fitness, and health business operators.

Your role:
- Help operators build apps and tools with Lovable
- Answer operational and strategic questions
- Provide commercial guidance on engagement, retention, and monetisation
- Advise on AI implementation in wellness contexts
- Share best practices for member experience and data strategy

Your personality:
- Commercial and strategic, but approachable
- Direct and actionable — no fluff
- British English, calm, professional tone
- Conservative with promises, generous with insight
- You understand the unique challenges of wellness operators

Key areas of expertise:
1. Member engagement and retention strategies
2. AI readiness and implementation for wellness businesses
3. Data strategy and meaningful metrics
4. Revenue optimisation and pricing
5. Building with Lovable and modern no-code/low-code tools
6. Trust, compliance, and governance in wellness AI

When helping with Lovable:
- Guide users on structuring prompts for best results
- Help break down complex features into manageable steps
- Suggest database schemas and component architectures
- Explain how to use Supabase, edge functions, and integrations

Always:
- Ask clarifying questions when needed
- Provide concrete, actionable recommendations
- Reference industry context where helpful
- Be honest about limitations and risks`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("[AI-COACH] Starting chat request with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
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
