import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  analyzeMessages, 
  logSecurityEvent, 
  validateHoneypot, 
  validateInput,
  GenieRequestSchema 
} from "../_shared/prompt-guard.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { MODE_CONFIGS } from "../_shared/genie-modes.ts";
import { GENIE_SYSTEM_PROMPT } from "../_shared/genie-system-prompt.ts";
import {
  type SessionSignals,
  fetchSessionSignals,
  calculateTrustMetadata,
} from "../_shared/genie-scoring.ts";

// Extract and save insights from conversation asynchronously
async function extractAndSaveInsights(
  userId: string, messages: any[], responseText: string, mode: string,
  supabaseUrl: string, serviceRoleKey: string
): Promise<void> {
  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return;

    const recentUserMessages = messages.filter((m: any) => m.role === "user").slice(-3).map((m: any) => m.content).join("\n");

    const extractionPrompt = `Analyze this conversation and extract 0-2 key insights worth remembering for future interactions.

USER MESSAGES:
${recentUserMessages}

ADVISOR RESPONSE:
${responseText.slice(0, 2000)}

Extract insights in these categories:
- observation: Facts about their business
- preference: Their preferences or style
- commitment: Decisions or commitments made
- warning: Red flags or concerns mentioned

Return JSON array ONLY. Each item: {"type": "observation|preference|commitment|warning", "content": "brief insight", "relevance": 1-10}
If nothing worth saving, return empty array [].
CRITICAL: Only extract NEW, SPECIFIC information. Skip generic or vague statements.`;

    const extractResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "google/gemini-2.5-flash-lite", messages: [{ role: "user", content: extractionPrompt }], max_tokens: 1000 }),
    });

    if (!extractResponse.ok) { console.log("[GENIE] Insight extraction API error:", extractResponse.status); return; }

    const extractData = await extractResponse.json();
    const rawContent = extractData.choices?.[0]?.message?.content || "[]";
    
    let insights: any[] = [];
    try {
      const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) insights = JSON.parse(jsonMatch[0]);
    } catch { return; }

    if (!Array.isArray(insights) || insights.length === 0) return;

    const { data: existingInsights } = await supabase.from("genie_insights").select("content").eq("user_id", userId).order("created_at", { ascending: false }).limit(50);
    const existingContents = new Set((existingInsights || []).map((i: any) => i.content.toLowerCase().trim()));

    const newInsights = insights.filter((insight: any) => {
      if (!insight.content || insight.relevance < 5) return false;
      const normalised = insight.content.toLowerCase().trim();
      for (const existing of existingContents) {
        if (normalised.includes(existing) || existing.includes(normalised)) return false;
      }
      return true;
    });

    if (newInsights.length === 0) return;

    const insightsToInsert = newInsights.slice(0, 2).map((insight: any) => ({
      user_id: userId, insight_type: insight.type || "observation",
      content: insight.content.slice(0, 500), relevance_score: Math.min(10, Math.max(1, insight.relevance || 5)),
      source: `${mode} conversation`,
    }));

    const { error: insertError } = await supabase.from("genie_insights").insert(insightsToInsert);
    if (insertError) console.log("[GENIE] Failed to save insights:", insertError.message);
    else console.log("[GENIE] Saved", insightsToInsert.length, "new insights");
  } catch (err) {
    console.log("[GENIE] Insight extraction error:", err);
  }
}

serve(async (req) => {
  const dynamicCorsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: dynamicCorsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error("[GENIE] Missing Supabase configuration");
      return new Response(JSON.stringify({ error: "Server configuration error" }), { status: 500, headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" } });
    }

    const rawBody = await req.json();
    const isTrialRequest = rawBody.isTrialMode === true;
    
    // ========== AUTHENTICATION ==========
    const authHeader = req.headers.get("authorization");
    let userId: string | null = null;
    
    if (isTrialRequest) {
      console.log("[GENIE] Trial mode request - skipping auth");
      userId = "trial_" + crypto.randomUUID().substring(0, 8);
    } else {
      if (!authHeader) {
        return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" } });
      }

      const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

      if (authError || !user) {
        logSecurityEvent("auth_failure", { error: authError?.message || "No user", tokenPrefix: token.substring(0, 20) + "..." });
        return new Response(JSON.stringify({ error: "Invalid or expired authentication token" }), { status: 401, headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" } });
      }

      console.log("[GENIE] Authenticated user:", user.id);
      userId = user.id;
    }
    
    // ========== INPUT VALIDATION ==========
    const validationResult = validateInput(GenieRequestSchema, rawBody);
    if (!validationResult.isValid) {
      logSecurityEvent("validation_failure", { validationErrors: validationResult.errors, userId });
      
      if (SUPABASE_SERVICE_ROLE_KEY) {
        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        await supabaseAdmin.from("admin_audit_logs").insert({
          admin_user_id: userId, action: "genie_validation_error", resource_type: "genie_chat",
          resource_count: validationResult.errors?.length || 0,
          ip_address: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || null,
          user_agent: JSON.stringify({ mode: rawBody?.mode || "unknown", errors: validationResult.errors, timestamp: new Date().toISOString() }),
        });
      }
      
      return new Response(JSON.stringify({ error: "Invalid request format. Please check your input and try again.", details: validationResult.errors }), { status: 400, headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" } });
    }

    const { messages, mode = "daily_operator", memoryContext: rawMemoryContext, documentContext, webContext, _hp_field, isTrialMode } = rawBody;
    
    const memoryContext = typeof rawMemoryContext === 'string' ? rawMemoryContext : (rawMemoryContext ? JSON.stringify(rawMemoryContext) : '');
    
    // Honeypot validation
    const honeypotResult = validateHoneypot(_hp_field);
    if (honeypotResult.isBot) {
      logSecurityEvent("honeypot", { reason: honeypotResult.reason, mode, userId });
      return new Response(JSON.stringify({ error: "Request could not be processed" }), { status: 400, headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" } });
    }

    // Prompt injection detection
    if (messages && Array.isArray(messages)) {
      const promptGuardResult = analyzeMessages(messages);
      if (!promptGuardResult.isSafe) {
        logSecurityEvent("blocked", { riskScore: promptGuardResult.riskScore, patterns: promptGuardResult.detectedPatterns, mode, userId });
        return new Response(JSON.stringify({ error: "Your message could not be processed. Please rephrase and try again." }), { status: 400, headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" } });
      }
      if (promptGuardResult.riskScore > 10) {
        logSecurityEvent("warning", { riskScore: promptGuardResult.riskScore, patterns: promptGuardResult.detectedPatterns, mode, userId });
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Initialize session signals
    let sessionSignals: SessionSignals = {
      totalSessions: 0, activeWeeks: 0, modesUsed: [], hasVoiceInteraction: false,
      averageSessionLength: 0, lastSessionDate: null,
      streak: { currentStreak: 0, longestStreak: 0, hasMomentumBadge: false, momentumTier: "none", lastActiveWeek: null },
    };

    let guardrailsContext = "";
    let knowledgeBaseContext = "";
    
    if (SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        sessionSignals = await fetchSessionSignals(supabase, userId!);
        
        // Fetch guardrails
        try {
          const { data: guardrails } = await supabase.from("founder_guardrails").select("section_id, items").eq("user_id", userId);
          if (guardrails && guardrails.length > 0) {
            const sectionLabels: Record<string, string> = {
              principles: "Non-negotiable Principles", markets: "Markets to Ignore",
              language: "Language to Avoid", ethics: "Ethical Red Lines", optimisation: "Do Not Optimise For"
            };
            guardrailsContext = "\n\n## STRATEGIC GUARDRAILS (You must respect these boundaries)\n";
            guardrails.forEach((g: any) => {
              guardrailsContext += `\n### ${sectionLabels[g.section_id] || g.section_id}\n`;
              guardrailsContext += g.items.map((item: string) => `- ${item}`).join("\n");
            });
          }
        } catch (e) { console.log("[GENIE] Guardrails fetch skipped:", e); }

        // Fetch AI Readiness scores
        try {
          const { data: readinessData } = await supabase.from("ai_readiness_completions")
            .select("overall_score, score_band, leadership_score, data_score, people_score, process_score, risk_score, completed_at, company, industry")
            .eq("user_id", userId).order("completed_at", { ascending: false }).limit(3);
          if (readinessData && readinessData.length > 0) {
            const latest = readinessData[0];
            guardrailsContext += `\n\n## AI READINESS ASSESSMENT HISTORY\nLatest Score: ${latest.overall_score}/100 (${latest.score_band || 'Unrated'})\n`;
            if (latest.company) guardrailsContext += `Company: ${latest.company}\n`;
            guardrailsContext += `Pillar Breakdown: Leadership ${latest.leadership_score || 0}%, Data ${latest.data_score || 0}%, People ${latest.people_score || 0}%, Process ${latest.process_score || 0}%, Risk ${latest.risk_score || 0}%\n`;
            if (readinessData.length > 1) {
              const scoreDelta = latest.overall_score - readinessData[1].overall_score;
              guardrailsContext += `Score trend: ${scoreDelta > 0 ? '+' : ''}${scoreDelta} from previous\n`;
            }
          }
        } catch (e) { console.log("[GENIE] Readiness fetch skipped:", e); }

        // Fetch download history
        try {
          const userEmail = await supabase.from("profiles").select("email").eq("id", userId).single();
          if (userEmail.data?.email) {
            const { data: downloads } = await supabase.from("product_downloads").select("product_name, product_type, created_at").eq("email", userEmail.data.email).order("created_at", { ascending: false }).limit(10);
            if (downloads && downloads.length > 0) {
              guardrailsContext += "\n\n## RESOURCES USER HAS ACCESSED\n";
              const uniqueProducts = [...new Map(downloads.map((d: any) => [d.product_name, d])).values()];
              uniqueProducts.slice(0, 5).forEach((d: any) => { guardrailsContext += `- ${d.product_name} (${d.product_type})\n`; });
            }
          }
        } catch (e) { console.log("[GENIE] Downloads fetch skipped:", e); }

        // Fetch saved insights
        try {
          const { data: insights } = await supabase.from("genie_insights").select("insight_type, content, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(10);
          if (insights && insights.length > 0) {
            guardrailsContext += "\n\n## PREVIOUS INSIGHTS FROM CONVERSATIONS\n";
            insights.forEach((i: any) => { guardrailsContext += `- [${i.insight_type}] ${i.content}\n`; });
          }
        } catch (e) { console.log("[GENIE] Insights fetch skipped:", e); }

        // Fetch knowledge base
        try {
          const { data: knowledgeEntries } = await supabase.from("knowledge_base").select("title, content, category, tags").eq("is_active", true).order("priority", { ascending: false }).limit(20);
          if (knowledgeEntries && knowledgeEntries.length > 0) {
            knowledgeBaseContext = "\n\n## KNOWLEDGE BASE\n";
            knowledgeEntries.forEach((entry: any) => { knowledgeBaseContext += `\n### ${entry.title} [${entry.category}]\n${entry.content}\n`; });
          }
        } catch (e) { console.log("[GENIE] Knowledge base fetch skipped:", e); }
      } catch (dataErr) {
        console.log("[GENIE] Session data fetch skipped:", dataErr);
      }
    }

    const modeConfig = MODE_CONFIGS[mode] || MODE_CONFIGS.daily_briefing;
    
    // Calculate memory completeness
    const memoryFields = ["business_name", "business_type", "revenue_model", "team_size", "primary_goal", "biggest_challenge", "key_metrics", "known_weak_spots"];
    let filledFields = 0;
    const memoryStr = typeof memoryContext === 'string' ? memoryContext : '';
    if (memoryStr) {
      memoryFields.forEach(field => {
        if (memoryStr.toLowerCase().includes(field.replace("_", " ")) || memoryStr.toLowerCase().includes(field)) filledFields++;
      });
    }
    const memoryCompleteness = Math.round((filledFields / memoryFields.length) * 100);
    
    const trustMetadata = calculateTrustMetadata(mode, memoryContext, documentContext, sessionSignals, memoryCompleteness);
    
    // Build full system prompt
    let fullSystemPrompt = GENIE_SYSTEM_PROMPT;
    if (guardrailsContext) fullSystemPrompt += guardrailsContext;
    if (memoryContext && memoryContext.trim()) fullSystemPrompt += `\n\n## BUSINESS CONTEXT:\n${memoryContext}`;
    if (documentContext && documentContext.trim()) fullSystemPrompt += `\n\n## UPLOADED DOCUMENTS:\n${documentContext}`;
    if (webContext && webContext.trim()) fullSystemPrompt += `\n\n## WEB RESEARCH:\n${webContext}`;
    if (knowledgeBaseContext) fullSystemPrompt += knowledgeBaseContext;
    fullSystemPrompt += `\n\n${modeConfig.prompt}`;

    console.log("[GENIE] Mode:", mode, "Score:", trustMetadata.genieScore.overall);

    const strategicModes = ["decision_support", "board_mode", "commercial_lens", "diagnostic", "build_mode", "competitor_scan", "market_research"];
    const useProModel = strategicModes.includes(mode) && !isTrialMode;
    const selectedModel = useProModel ? "google/gemini-2.5-pro" : "google/gemini-3-flash-preview";
    const getMaxTokens = (m: string): number => {
      if (m === "competitor_scan") return 8000;
      if (strategicModes.includes(m)) return 4000;
      return 1500;
    };

    const gatewayMessages = [
      { role: "system", content: fullSystemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: selectedModel, messages: gatewayMessages, max_tokens: getMaxTokens(mode), stream: true }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[GENIE] Gateway error:", response.status, errorText);
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), { status: 429, headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), { status: 402, headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), { status: 500, headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" } });
    }

    // Stream with trust metadata prepended
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const reader = response.body!.getReader();
    let fullResponseText = "";
    const trustEvent = `data: ${JSON.stringify({ type: "trust_metadata", ...trustMetadata })}\n\n`;

    (async () => {
      try {
        await writer.write(new TextEncoder().encode(trustEvent));
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = new TextDecoder().decode(value);
          for (const line of chunk.split('\n')) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6).trim();
              if (jsonStr === '[DONE]') continue;
              try { const data = JSON.parse(jsonStr); const c = data.choices?.[0]?.delta?.content; if (c) fullResponseText += c; } catch {}
            }
          }
          await writer.write(value);
        }
        if (SUPABASE_SERVICE_ROLE_KEY && fullResponseText.length > 100) {
          extractAndSaveInsights(userId!, messages, fullResponseText, mode, SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY)
            .catch((err: Error) => console.log("[GENIE] Insight extraction skipped:", err.message));
        }
      } finally { await writer.close(); }
    })();

    return new Response(readable, { headers: { ...dynamicCorsHeaders, "Content-Type": "text/event-stream" } });
  } catch (error) {
    console.error("[GENIE] Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 500, headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" } });
  }
});
