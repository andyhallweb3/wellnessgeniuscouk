import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Genie Score calculation types
interface SessionSignals {
  totalSessions: number;
  activeWeeks: number;
  modesUsed: string[];
  hasVoiceInteraction: boolean;
  averageSessionLength: number;
  lastSessionDate: string | null;
}

interface GenieScore {
  overall: number;
  consistency: number;
  engagementDepth: number;
  dataHygiene: number;
  breakdown: {
    activeWeeks: number;
    uniqueModes: number;
    voiceBonus: boolean;
    profileCompleteness: number;
  };
}

// Trust metadata calculation based on actual data signals
interface TrustMetadata {
  confidenceLevel: "high" | "medium" | "low";
  dataSensitivity: "standard" | "sensitive" | "health-adjacent";
  isInference: boolean;
  dataSignals: {
    hasBusinessProfile: boolean;
    hasRecentSessions: boolean;
    hasDocuments: boolean;
    hasMetrics: boolean;
    memoryCompleteness: number;
  };
  sessionSignals: SessionSignals;
  genieScore: GenieScore;
  explanation: string;
  factors: string[];
}

// Mode point values for engagement depth calculation
const MODE_POINTS: Record<string, number> = {
  daily_briefing: 10,
  quick_question: 5,
  weekly_review: 20,
  decision_support: 25,
  board_mode: 25,
  build_mode: 20,
  diagnostic: 20,
  commercial_lens: 20,
  ops_mode: 15,
  daily_operator: 10,
};

const MAX_MODE_POINTS = 75; // Reasonable max for scoring

async function fetchSessionSignals(supabase: any, userId: string): Promise<SessionSignals> {
  const twentyEightDaysAgo = new Date();
  twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);

  try {
    const { data: sessions, error } = await supabase
      .from("genie_sessions")
      .select("id, mode, started_at, ended_at, messages")
      .eq("user_id", userId)
      .gte("started_at", twentyEightDaysAgo.toISOString())
      .order("started_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("[GENIE] Error fetching sessions:", error);
      return {
        totalSessions: 0,
        activeWeeks: 0,
        modesUsed: [],
        hasVoiceInteraction: false,
        averageSessionLength: 0,
        lastSessionDate: null,
      };
    }

    if (!sessions || sessions.length === 0) {
      return {
        totalSessions: 0,
        activeWeeks: 0,
        modesUsed: [],
        hasVoiceInteraction: false,
        averageSessionLength: 0,
        lastSessionDate: null,
      };
    }

    // Calculate active weeks (weeks with at least 1 interaction)
    const weekSet = new Set<string>();
    sessions.forEach((session: any) => {
      const date = new Date(session.started_at);
      const weekKey = `${date.getFullYear()}-W${Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7)}`;
      weekSet.add(weekKey);
    });

    // Get unique modes
    const uniqueModes = Array.from(new Set(sessions.map((s: any) => String(s.mode || "")))) as string[];

    // Calculate average session length (by message count)
    const totalMessages = sessions.reduce((acc: number, s: any) => {
      const msgs = Array.isArray(s.messages) ? s.messages.length : 0;
      return acc + msgs;
    }, 0);

    return {
      totalSessions: sessions.length,
      activeWeeks: Math.min(weekSet.size, 4),
      modesUsed: uniqueModes,
      hasVoiceInteraction: uniqueModes.includes("voice") || sessions.some((s: any) => 
        s.mode?.includes("voice") || JSON.stringify(s.messages || []).includes("voice")
      ),
      averageSessionLength: sessions.length > 0 ? Math.round(totalMessages / sessions.length) : 0,
      lastSessionDate: sessions[0]?.started_at || null,
    };
  } catch (err) {
    console.error("[GENIE] Session fetch error:", err);
    return {
      totalSessions: 0,
      activeWeeks: 0,
      modesUsed: [],
      hasVoiceInteraction: false,
      averageSessionLength: 0,
      lastSessionDate: null,
    };
  }
}

function calculateGenieScore(
  sessionSignals: SessionSignals,
  memoryCompleteness: number,
  hasDocuments: boolean
): GenieScore {
  // 1. Consistency Score (30%)
  const consistencyScores: Record<number, number> = { 0: 0, 1: 40, 2: 65, 3: 85, 4: 100 };
  let consistencyBase = consistencyScores[sessionSignals.activeWeeks] || 0;
  
  // Voice bonus +5
  if (sessionSignals.hasVoiceInteraction) consistencyBase = Math.min(100, consistencyBase + 5);
  // Weekly review bonus +5
  if (sessionSignals.modesUsed.includes("weekly_review")) consistencyBase = Math.min(100, consistencyBase + 5);
  
  const consistency = consistencyBase;

  // 2. Engagement Depth Score (25%)
  const modePointsEarned = sessionSignals.modesUsed.reduce((acc, mode) => {
    return acc + (MODE_POINTS[mode] || 5);
  }, 0);
  
  let engagementDepth = Math.round((modePointsEarned / MAX_MODE_POINTS) * 100);
  // Voice multiplier (+20%, capped)
  if (sessionSignals.hasVoiceInteraction) {
    engagementDepth = Math.min(100, Math.round(engagementDepth * 1.2));
  }

  // 3. Data Hygiene Score (20%)
  // Profile completeness (30 pts), reduced unknowns (30 pts), updated context (20 pts), confidence (20 pts)
  let dataHygiene = 0;
  dataHygiene += Math.round(memoryCompleteness * 0.3); // Up to 30 pts
  dataHygiene += memoryCompleteness > 50 ? 30 : 0; // Reduced unknowns
  dataHygiene += memoryCompleteness > 70 ? 20 : 0; // Updated context
  dataHygiene += hasDocuments ? 20 : 0; // Confidence from docs
  dataHygiene = Math.min(100, dataHygiene);

  // Overall Genie Score
  const overall = Math.round(
    (consistency * 0.30) +
    (engagementDepth * 0.25) +
    (dataHygiene * 0.20) +
    // Decision follow-through placeholder (25%) - would need decision tracking
    (50 * 0.25) // Default 50 for now
  );

  return {
    overall: Math.min(100, Math.max(0, overall)),
    consistency,
    engagementDepth,
    dataHygiene,
    breakdown: {
      activeWeeks: sessionSignals.activeWeeks,
      uniqueModes: sessionSignals.modesUsed.length,
      voiceBonus: sessionSignals.hasVoiceInteraction,
      profileCompleteness: memoryCompleteness,
    },
  };
}

function calculateTrustMetadata(
  mode: string,
  memoryContext: string | undefined,
  documentContext: string | undefined,
  sessionSignals: SessionSignals,
  memoryCompleteness: number
): TrustMetadata {
  const hasMemory = !!memoryContext && memoryContext.trim().length > 50;
  const hasDocs = !!documentContext && documentContext.trim().length > 0;
  const hasRecentSessions = sessionSignals.totalSessions > 0;
  
  // Calculate Genie Score
  const genieScore = calculateGenieScore(sessionSignals, memoryCompleteness, hasDocs);
  
  // Enhanced confidence based on multiple signals
  let confidenceLevel: "high" | "medium" | "low" = "low";
  
  // Use Genie Score for confidence
  if (genieScore.overall >= 60 && hasMemory) {
    confidenceLevel = "high";
  } else if (genieScore.overall >= 35 || (hasMemory && hasRecentSessions)) {
    confidenceLevel = "medium";
  }
  
  // Session history boosts confidence
  if (sessionSignals.activeWeeks >= 3 && confidenceLevel === "medium") {
    confidenceLevel = "high";
  }
  
  // Determine data sensitivity based on mode and context
  let dataSensitivity: "standard" | "sensitive" | "health-adjacent" = "standard";
  const sensitiveKeywords = ["behavior", "behaviour", "usage", "engagement", "retention", "churn"];
  const healthKeywords = ["wellness", "health", "fitness", "stress", "recovery", "sleep", "mood", "mental"];
  
  const contextLower = (memoryContext || "").toLowerCase();
  
  if (healthKeywords.some(k => contextLower.includes(k))) {
    dataSensitivity = "health-adjacent";
  } else if (sensitiveKeywords.some(k => contextLower.includes(k))) {
    dataSensitivity = "sensitive";
  }
  
  // Mode-based adjustments
  const inferentialModes = ["diagnostic", "decision_support", "commercial_lens"];
  const isInference = inferentialModes.includes(mode);
  
  // Build explanation and factors
  const factors: string[] = [];
  let explanation = "";
  
  // Session-based factors
  if (hasRecentSessions) {
    factors.push(`${sessionSignals.totalSessions} sessions in last 28 days`);
    if (sessionSignals.activeWeeks >= 3) {
      factors.push(`Active ${sessionSignals.activeWeeks} of 4 weeks (strong consistency)`);
    } else if (sessionSignals.activeWeeks > 0) {
      factors.push(`Active ${sessionSignals.activeWeeks} of 4 weeks`);
    }
    if (sessionSignals.modesUsed.length > 2) {
      factors.push(`Using ${sessionSignals.modesUsed.length} different modes (good depth)`);
    }
  }
  
  // Profile factors
  if (hasMemory) {
    factors.push(`Business profile ${memoryCompleteness}% complete`);
  } else {
    factors.push("No business profile configured");
  }
  
  if (hasDocs) {
    factors.push("Documents uploaded for context");
  }
  
  factors.push(`Mode: ${mode.replace(/_/g, " ")}`);
  
  // Genie Score based explanation
  if (genieScore.overall >= 70) {
    explanation = "High confidence based on consistent engagement and complete business profile.";
  } else if (genieScore.overall >= 45) {
    explanation = "Good confidence based on your usage patterns. Continue engaging for better insights.";
  } else if (hasRecentSessions) {
    explanation = "Building confidence through your session history. Complete your profile for improved accuracy.";
  } else {
    explanation = "Limited history available. Regular use and a complete profile will improve recommendations.";
  }
  
  return {
    confidenceLevel,
    dataSensitivity,
    isInference,
    dataSignals: {
      hasBusinessProfile: hasMemory,
      hasRecentSessions,
      hasDocuments: hasDocs,
      hasMetrics: memoryContext?.includes("key_metrics") || false,
      memoryCompleteness,
    },
    sessionSignals,
    genieScore,
    explanation,
    factors,
  };
}

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
  daily_briefing: {
    prompt: `MODE: Daily Briefing
    
You're giving a morning briefing. Be concise. Focus on:
- What needs attention TODAY
- Any risks that emerged
- Quick wins available
- What to ignore for now

Keep it under 200 words unless critical issues require more.`,
    responseFormat: "brief",
  },
  quick_question: {
    prompt: `MODE: Quick Question

Simple, direct answer. No deep analysis unless asked.
- Answer the specific question
- Keep it short (under 100 words ideal)
- Only add context if essential
- No structured output needed`,
    responseFormat: "brief",
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
  diagnostic: {
    prompt: `MODE: Diagnostic

Find what's broken or missing. Your job:
- Identify weak assumptions
- Find missing inputs
- Surface hidden risks
- Point out blind spots
- Be constructively critical

Don't accept the premise at face value. Challenge it.`,
    responseFormat: "detailed",
  },
  commercial_lens: {
    prompt: `MODE: Commercial Lens

Translate to financial implications. Focus on:
- Revenue impact (ranges, not points)
- Cost implications
- ROI estimation
- Risk quantification
- Payback period

Use conservative assumptions. Show your working.`,
    responseFormat: "structured",
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
  build_mode: {
    prompt: `MODE: 90-Day Builder

Create a prioritised action plan. Focus on:
- What to do FIRST (highest impact, lowest risk)
- What NOT to do (common mistakes to avoid)
- Dependencies and sequencing
- Resource requirements (time, money, people)
- Clear milestones

Be specific. "Improve retention" is not an action. "Implement a 7-day inactive member outreach sequence" is.`,
    responseFormat: "structured",
  },
  daily_operator: {
    prompt: `MODE: Daily Briefing
    
You're giving a morning briefing. Be concise. Focus on:
- What needs attention TODAY
- Any risks that emerged
- Quick wins available
- What to ignore for now`,
    responseFormat: "brief",
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode = "daily_operator", memoryContext, documentContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get user ID from authorization header
    let userId: string | null = null;
    let sessionSignals: SessionSignals = {
      totalSessions: 0,
      activeWeeks: 0,
      modesUsed: [],
      hasVoiceInteraction: false,
      averageSessionLength: 0,
      lastSessionDate: null,
    };

    // Try to get session data if we have auth
    const authHeader = req.headers.get("authorization");
    if (authHeader && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const token = authHeader.replace("Bearer ", "");
        
        // For anon key requests, try to get user from a passed user_id or skip
        // This is a simplified approach - in production you'd verify the JWT
        const { data: { user } } = await supabase.auth.getUser(token);
        
        if (user?.id) {
          userId = user.id;
          sessionSignals = await fetchSessionSignals(supabase, userId);
        }
      } catch (authErr) {
        console.log("[GENIE] Auth check skipped:", authErr);
      }
    }

    const modeConfig = MODE_CONFIGS[mode] || MODE_CONFIGS.daily_briefing;
    
    // Parse memory context to check completeness
    const memoryFields = [
      "business_name", "business_type", "revenue_model", "team_size",
      "primary_goal", "biggest_challenge", "key_metrics", "known_weak_spots"
    ];
    
    let filledFields = 0;
    if (memoryContext) {
      memoryFields.forEach(field => {
        if (memoryContext.toLowerCase().includes(field.replace("_", " ")) || 
            memoryContext.toLowerCase().includes(field)) {
          filledFields++;
        }
      });
    }
    const memoryCompleteness = Math.round((filledFields / memoryFields.length) * 100);
    
    // Calculate trust metadata with session signals
    const trustMetadata = calculateTrustMetadata(
      mode, 
      memoryContext, 
      documentContext, 
      sessionSignals,
      memoryCompleteness
    );
    
    // Build full system prompt with context
    let fullSystemPrompt = GENIE_SYSTEM_PROMPT;
    
    if (memoryContext && memoryContext.trim()) {
      fullSystemPrompt += `\n\n## BUSINESS CONTEXT (Use this to personalise responses):\n${memoryContext}`;
    }
    
    if (documentContext && documentContext.trim()) {
      fullSystemPrompt += `\n\n## UPLOADED DOCUMENTS:\n${documentContext}`;
    }
    
    fullSystemPrompt += `\n\n${modeConfig.prompt}`;

    console.log("[GENIE] Mode:", mode, "Score:", trustMetadata.genieScore.overall, "Sessions:", sessionSignals.totalSessions);

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

    // Create a transform stream to prepend trust metadata
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const reader = response.body!.getReader();

    // Send trust metadata as first event
    const trustEvent = `data: ${JSON.stringify({ type: "trust_metadata", ...trustMetadata })}\n\n`;
    
    (async () => {
      try {
        await writer.write(new TextEncoder().encode(trustEvent));
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          await writer.write(value);
        }
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
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
