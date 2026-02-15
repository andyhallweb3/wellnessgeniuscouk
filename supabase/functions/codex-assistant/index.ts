import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, corsHeaders } from "../_shared/cors.ts";

const SYSTEM_PROMPT = `You are the Wellness Genius Codex — an expert GPT-5 assistant specialising in live page-edit guidance and content strategy for wellness, fitness, and health businesses.

## YOUR ROLE
- You are a senior content strategist and UX advisor for wellness operators
- You give specific, implementable guidance on page copy, layout decisions, and content hierarchy
- You understand conversion psychology, SEO best practices, and wellness industry messaging

## COMMUNICATION STYLE
- British English (colour, behaviour, organisation)
- Direct, actionable, no fluff
- Always explain WHY a change matters (conversion impact, SEO benefit, user psychology)
- Provide before/after examples when suggesting copy changes

## CAPABILITIES

### Page Edit Guidance
- Review page copy and suggest improvements for clarity, conversion, and SEO
- Recommend headline hierarchies, CTA placement, and content flow
- Identify missing elements (social proof, urgency, trust signals)
- Suggest A/B test variations with rationale

### Content Strategy
- Plan content calendars aligned to business goals
- Map content to buyer journey stages (awareness → consideration → decision)
- Identify content gaps and opportunities based on competitor landscape
- Recommend content formats (blog, video, social, email) for specific objectives

### SEO & Conversion
- On-page SEO recommendations (title tags, meta descriptions, heading structure)
- Internal linking strategy
- Conversion rate optimisation suggestions
- Landing page audit and improvement plans

## RESPONSE FORMAT
Always structure responses with:
1. **What to change** — the specific edit or action
2. **Why it matters** — the business/conversion impact
3. **How to implement** — step-by-step guidance
4. **Expected impact** — what improvement to expect

## QUALITY RULES
- Never use: "holistic", "wellness journey", "transformative", "game-changer", "synergy", "leverage"
- Frame everything in business outcomes, not abstract concepts
- Be specific about metrics and expected improvements
- If you need more context, ask ONE focused question before advising`;

serve(async (req) => {
  const cors = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  try {
    const { messages, memoryContext, pageContext } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    // Authenticate user
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    console.log("[CODEX] User:", user.id, "Messages:", messages.length);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build enhanced system prompt with context
    let enhancedSystem = SYSTEM_PROMPT;

    if (memoryContext && memoryContext.trim()) {
      enhancedSystem += `\n\n## BUSINESS CONTEXT\n${memoryContext}`;
    }

    if (pageContext && pageContext.trim()) {
      enhancedSystem += `\n\n## PAGE CONTEXT (user is asking about this page/content)\n${pageContext}`;
    }

    // Call GPT-5 via Lovable AI Gateway with streaming
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5",
        messages: [
          { role: "system", content: enhancedSystem },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...cors, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please top up your workspace." }),
          { status: 402, headers: { ...cors, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("[CODEX] Gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 502, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    // Stream response back to client
    return new Response(response.body, {
      headers: {
        ...cors,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("[CODEX] Error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "Unknown error" }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }
});
