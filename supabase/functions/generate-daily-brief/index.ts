import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BRIEF_SYSTEM_PROMPT = `You are the Wellness Genie generating a structured daily briefing for a wellness/fitness business operator.

Your role is to analyse their business context and provide a BRIEF, ACTIONABLE daily briefing.

CRITICAL RESPONSE FORMAT:
You MUST respond with a valid JSON object in this EXACT format:
{
  "headline": "One sentence summarising today's focus",
  "changes": [
    {"text": "Description of what changed", "direction": "up|down|neutral", "severity": "good|warning|neutral"},
    {"text": "Another change", "direction": "up|down|neutral", "severity": "good|warning|neutral"},
    {"text": "Third change", "direction": "up|down|neutral", "severity": "good|warning|neutral"}
  ],
  "actions": [
    "Specific action 1",
    "Specific action 2", 
    "Specific action 3"
  ],
  "confidence": "high|medium|low",
  "reasoning": "Brief explanation of confidence level"
}

GUIDELINES:
- Keep headline under 20 words
- Max 3 changes, focus on what actually matters
- Actions must be SPECIFIC and actionable (not "improve retention" but "Call 5 at-risk members today")
- Confidence is based on how much business data you have
- Be direct, commercial, British English
- No waffle, no motivation speak
- If data is limited, say so honestly in reasoning`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create Supabase client with user's auth
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[DAILY-BRIEF] Generating for user:", user.id);

    // Fetch all relevant business data
    const [memoryResult, insightsResult, decisionsResult, sessionsResult, creditsResult] = await Promise.all([
      supabase.from("business_memory").select("*").eq("user_id", user.id).single(),
      supabase.from("genie_insights").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
      supabase.from("genie_decisions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
      supabase.from("genie_sessions").select("*").eq("user_id", user.id).order("started_at", { ascending: false }).limit(5),
      supabase.from("credit_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    ]);

    const memory = memoryResult.data;
    const insights = insightsResult.data || [];
    const decisions = decisionsResult.data || [];
    const sessions = sessionsResult.data || [];
    const credits = creditsResult.data || [];

    // Build comprehensive context
    let contextParts: string[] = [];

    // Business profile
    if (memory) {
      contextParts.push("## BUSINESS PROFILE");
      if (memory.business_name) contextParts.push(`Business: ${memory.business_name}`);
      if (memory.business_type) contextParts.push(`Type: ${memory.business_type}`);
      if (memory.revenue_model) contextParts.push(`Revenue Model: ${memory.revenue_model}`);
      if (memory.annual_revenue_band) contextParts.push(`Revenue Band: ${memory.annual_revenue_band}`);
      if (memory.team_size) contextParts.push(`Team Size: ${memory.team_size}`);
      if (memory.primary_goal) contextParts.push(`Current Goal: ${memory.primary_goal}`);
      if (memory.biggest_challenge) contextParts.push(`Key Challenge: ${memory.biggest_challenge}`);
      if (memory.known_weak_spots?.length) contextParts.push(`Weak Spots: ${memory.known_weak_spots.join(", ")}`);
      if (memory.key_metrics?.length) contextParts.push(`Tracked Metrics: ${memory.key_metrics.join(", ")}`);
      if (memory.decision_style) contextParts.push(`Decision Style: ${memory.decision_style}`);
    } else {
      contextParts.push("## BUSINESS PROFILE\nNo business profile configured yet.");
    }

    // Recent insights
    if (insights.length > 0) {
      contextParts.push("\n## REMEMBERED INSIGHTS");
      insights.forEach((i: any) => {
        contextParts.push(`- [${i.insight_type}] ${i.content}`);
      });
    }

    // Recent decisions
    if (decisions.length > 0) {
      contextParts.push("\n## RECENT DECISIONS");
      decisions.forEach((d: any) => {
        contextParts.push(`- ${d.decision_summary}${d.outcome ? ` (Outcome: ${d.outcome})` : ""}`);
      });
    }

    // Recent conversations (sessions) - pull actual content for context
    if (sessions.length > 0) {
      contextParts.push("\n## RECENT CONVERSATIONS");
      sessions.forEach((s: any) => {
        const date = new Date(s.started_at).toLocaleDateString("en-GB");
        contextParts.push(`\n### ${date} - ${s.mode} session`);
        if (s.summary) {
          contextParts.push(`Summary: ${s.summary}`);
        }
        // Extract key topics from messages
        if (s.messages && Array.isArray(s.messages)) {
          const userMessages = s.messages
            .filter((m: any) => m.role === "user")
            .map((m: any) => m.content)
            .slice(0, 3); // First 3 user questions
          if (userMessages.length > 0) {
            contextParts.push(`Topics discussed:`);
            userMessages.forEach((msg: string) => {
              // Truncate long messages
              const truncated = msg.length > 150 ? msg.slice(0, 150) + "..." : msg;
              contextParts.push(`- "${truncated}"`);
            });
          }
        }
      });
    }

    // Credit usage patterns
    if (credits.length > 0) {
      const usageByMode: Record<string, number> = {};
      credits.forEach((c: any) => {
        if (c.mode && c.change_amount < 0) {
          usageByMode[c.mode] = (usageByMode[c.mode] || 0) + Math.abs(c.change_amount);
        }
      });
      if (Object.keys(usageByMode).length > 0) {
        contextParts.push("\n## USAGE PATTERNS (recent)");
        Object.entries(usageByMode)
          .sort((a, b) => b[1] - a[1])
          .forEach(([mode, credits]) => {
            contextParts.push(`- ${mode}: ${credits} credits used`);
          });
      }
    }

    const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
    
    const userPrompt = `Today is ${today}.

Based on this business context, generate a daily briefing:

${contextParts.join("\n")}

Remember: Return ONLY a valid JSON object matching the specified format. No markdown, no explanation, just the JSON.`;

    console.log("[DAILY-BRIEF] Calling AI with context length:", contextParts.join("\n").length);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: BRIEF_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[DAILY-BRIEF] Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error("AI service error");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("[DAILY-BRIEF] Raw AI response:", content.substring(0, 200));

    // Parse the JSON response
    let briefData;
    try {
      // Clean up potential markdown code blocks
      let cleanedContent = content.trim();
      if (cleanedContent.startsWith("```json")) {
        cleanedContent = cleanedContent.slice(7);
      }
      if (cleanedContent.startsWith("```")) {
        cleanedContent = cleanedContent.slice(3);
      }
      if (cleanedContent.endsWith("```")) {
        cleanedContent = cleanedContent.slice(0, -3);
      }
      
      briefData = JSON.parse(cleanedContent.trim());
    } catch (parseError) {
      console.error("[DAILY-BRIEF] Failed to parse JSON:", parseError);
      // Return a fallback brief if parsing fails
      briefData = {
        headline: memory?.business_name 
          ? `Good morning, ${memory.business_name}. Review your priorities.`
          : "Complete your business profile to get personalized insights.",
        changes: [
          { text: "Limited business data available", direction: "neutral", severity: "neutral" },
        ],
        actions: [
          memory ? "Review your key metrics" : "Complete your business profile",
          "Check for any urgent items",
          "Plan your top 3 priorities for today",
        ],
        confidence: "low",
        reasoning: memory 
          ? "Brief based on limited historical data" 
          : "No business profile configured - please complete onboarding for personalized insights",
      };
    }

    // Validate and ensure structure
    const validatedBrief = {
      headline: briefData.headline || "Focus on your key priorities today.",
      changes: Array.isArray(briefData.changes) ? briefData.changes.slice(0, 3).map((c: any) => ({
        text: c.text || "No change data",
        direction: ["up", "down", "neutral"].includes(c.direction) ? c.direction : "neutral",
        severity: ["good", "warning", "neutral"].includes(c.severity) ? c.severity : "neutral",
      })) : [],
      actions: Array.isArray(briefData.actions) ? briefData.actions.slice(0, 3) : [],
      confidence: ["high", "medium", "low"].includes(briefData.confidence) ? briefData.confidence : "low",
      reasoning: briefData.reasoning || "",
      generatedAt: new Date().toISOString(),
    };

    console.log("[DAILY-BRIEF] Successfully generated brief");

    return new Response(JSON.stringify(validatedBrief), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[DAILY-BRIEF] Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
