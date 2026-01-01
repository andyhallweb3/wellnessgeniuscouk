import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  analyzeMessages, 
  logSecurityEvent, 
  validateHoneypot, 
  validateInput,
  GenieRequestSchema 
} from "../_shared/prompt-guard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Genie Score calculation types
interface StreakData {
  currentStreak: number;
  longestStreak: number;
  hasMomentumBadge: boolean;
  momentumTier: "none" | "bronze" | "silver" | "gold" | "platinum";
  lastActiveWeek: string | null;
}

interface SessionSignals {
  totalSessions: number;
  activeWeeks: number;
  modesUsed: string[];
  hasVoiceInteraction: boolean;
  averageSessionLength: number;
  lastSessionDate: string | null;
  streak: StreakData;
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

// Get ISO week number
function getISOWeek(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { year: d.getUTCFullYear(), week: weekNum };
}

// Calculate consecutive week streak
function calculateStreak(sessions: any[]): StreakData {
  if (!sessions || sessions.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      hasMomentumBadge: false,
      momentumTier: "none",
      lastActiveWeek: null,
    };
  }

  // Get all unique weeks with activity, sorted descending
  const activeWeeks = new Map<string, boolean>();
  sessions.forEach((session: any) => {
    const date = new Date(session.started_at);
    const { year, week } = getISOWeek(date);
    const weekKey = `${year}-W${week.toString().padStart(2, "0")}`;
    activeWeeks.set(weekKey, true);
  });

  // Sort weeks descending (most recent first)
  const sortedWeeks = Array.from(activeWeeks.keys()).sort().reverse();
  
  if (sortedWeeks.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      hasMomentumBadge: false,
      momentumTier: "none",
      lastActiveWeek: null,
    };
  }

  // Get current week
  const now = new Date();
  const currentWeekData = getISOWeek(now);
  const currentWeekKey = `${currentWeekData.year}-W${currentWeekData.week.toString().padStart(2, "0")}`;
  
  // Check if last active week was current or previous week (streak still active)
  const lastActiveWeek = sortedWeeks[0];
  const lastWeekData = getISOWeek(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
  const lastWeekKey = `${lastWeekData.year}-W${lastWeekData.week.toString().padStart(2, "0")}`;
  
  const isCurrentlyActive = lastActiveWeek === currentWeekKey || lastActiveWeek === lastWeekKey;
  
  // Calculate current streak (consecutive weeks from most recent)
  let currentStreak = 0;
  if (isCurrentlyActive) {
    const startWeek = lastActiveWeek === currentWeekKey ? currentWeekKey : lastWeekKey;
    let checkDate = new Date();
    if (lastActiveWeek === lastWeekKey) {
      checkDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    for (let i = 0; i < 52; i++) {
      const { year, week } = getISOWeek(checkDate);
      const weekKey = `${year}-W${week.toString().padStart(2, "0")}`;
      
      if (activeWeeks.has(weekKey)) {
        currentStreak++;
        // Go back one week
        checkDate = new Date(checkDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak ever (simplified - scan all weeks)
  let longestStreak = 0;
  let tempStreak = 0;
  
  // Need to iterate through calendar weeks to find longest
  if (sessions.length > 0) {
    const oldestSession = sessions[sessions.length - 1];
    let checkDate = new Date(oldestSession.started_at);
    const endDate = new Date();
    
    while (checkDate <= endDate) {
      const { year, week } = getISOWeek(checkDate);
      const weekKey = `${year}-W${week.toString().padStart(2, "0")}`;
      
      if (activeWeeks.has(weekKey)) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
      
      checkDate = new Date(checkDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
  }

  // Determine momentum badge tier (12+ weeks = badge)
  let momentumTier: "none" | "bronze" | "silver" | "gold" | "platinum" = "none";
  const streakForBadge = Math.max(currentStreak, longestStreak);
  
  if (streakForBadge >= 48) {
    momentumTier = "platinum"; // 1 year
  } else if (streakForBadge >= 24) {
    momentumTier = "gold"; // 6 months
  } else if (streakForBadge >= 16) {
    momentumTier = "silver"; // 4 months
  } else if (streakForBadge >= 12) {
    momentumTier = "bronze"; // 3 months
  }

  return {
    currentStreak: Math.min(currentStreak, 52), // Cap display at 52 weeks
    longestStreak: Math.min(longestStreak, 52),
    hasMomentumBadge: momentumTier !== "none",
    momentumTier,
    lastActiveWeek,
  };
}

async function fetchSessionSignals(supabase: any, userId: string): Promise<SessionSignals> {
  // Fetch more sessions for streak calculation (up to 1 year)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const defaultStreak: StreakData = {
    currentStreak: 0,
    longestStreak: 0,
    hasMomentumBadge: false,
    momentumTier: "none",
    lastActiveWeek: null,
  };

  try {
    const { data: sessions, error } = await supabase
      .from("genie_sessions")
      .select("id, mode, started_at, ended_at, messages")
      .eq("user_id", userId)
      .gte("started_at", oneYearAgo.toISOString())
      .order("started_at", { ascending: false })
      .limit(500);

    if (error) {
      console.error("[GENIE] Error fetching sessions:", error);
      return {
        totalSessions: 0,
        activeWeeks: 0,
        modesUsed: [],
        hasVoiceInteraction: false,
        averageSessionLength: 0,
        lastSessionDate: null,
        streak: defaultStreak,
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
        streak: defaultStreak,
      };
    }

    // Calculate streak
    const streak = calculateStreak(sessions);

    // Filter to last 28 days for other metrics
    const twentyEightDaysAgo = new Date();
    twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);
    const recentSessions = sessions.filter((s: any) => 
      new Date(s.started_at) >= twentyEightDaysAgo
    );

    // Calculate active weeks (weeks with at least 1 interaction in last 28 days)
    const weekSet = new Set<string>();
    recentSessions.forEach((session: any) => {
      const date = new Date(session.started_at);
      const { year, week } = getISOWeek(date);
      weekSet.add(`${year}-W${week}`);
    });

    // Get unique modes
    const uniqueModes = Array.from(new Set(recentSessions.map((s: any) => String(s.mode || "")))) as string[];

    // Calculate average session length (by message count)
    const totalMessages = recentSessions.reduce((acc: number, s: any) => {
      const msgs = Array.isArray(s.messages) ? s.messages.length : 0;
      return acc + msgs;
    }, 0);

    return {
      totalSessions: recentSessions.length,
      activeWeeks: Math.min(weekSet.size, 4),
      modesUsed: uniqueModes,
      hasVoiceInteraction: uniqueModes.includes("voice") || recentSessions.some((s: any) => 
        s.mode?.includes("voice") || JSON.stringify(s.messages || []).includes("voice")
      ),
      averageSessionLength: recentSessions.length > 0 ? Math.round(totalMessages / recentSessions.length) : 0,
      lastSessionDate: sessions[0]?.started_at || null,
      streak,
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
      streak: defaultStreak,
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
const GENIE_SYSTEM_PROMPT = `You are the Wellness Genius AI Advisor — a senior business strategist specialising in wellness, fitness, and health businesses.

## YOUR ROLE

You are NOT a chatbot. You are NOT a coach. You are NOT a therapist.

You are a senior operator who:
- Watches the business like a hawk
- Understands context deeply before advising
- Speaks like an experienced COO/CFO who has seen it all
- Takes clear positions and defends them with reasoning
- Tells people what they NEED to hear, not what they WANT to hear
- Connects dots between operational decisions and commercial outcomes

## VOICE & TONE

- Calm, commercial, measured, slightly sceptical
- Direct without being harsh
- Confident but intellectually humble when uncertain
- British English always (colour, behaviour, organisation)
- No emojis, no excitement, no motivation speak
- Sound like a trusted advisor in a boardroom, not a friend at a pub
- Use "you" and "your business" — make it personal

## CRITICAL: ACTIVE QUESTIONING FOR PERSONALISATION

You MUST ask questions to give better advice. Never accept vague requests.

**Before answering any substantial question, ask 1-2 clarifying questions:**
- "Before I answer that, what's driving this question right now?"
- "What have you already tried?"
- "What's the constraint — time, money, or people?"
- "Is this urgent or are you planning ahead?"

**If context is missing from their profile, ask:**
- "What's your current monthly revenue roughly?"
- "How many members/clients do you have?"
- "What's your team setup?"
- "What metrics do you track most closely?"

**If you have their profile, go DEEPER:**
- Reference their specific goals: "You mentioned [goal] — is that still the priority?"
- Connect to past challenges: "Given [challenge], have you considered..."
- Ask about progress: "Last we discussed [topic], how did that play out?"

**The goal is to make every response feel like it was written specifically for THEIR business.**

## CORE PRINCIPLES

1. CLARITY before complexity — simple explanations first
2. BEHAVIOUR before automation — fix processes before buying tools
3. CONTROL before scale — master what you have before expanding
4. Conservative with assumptions — use ranges, not point estimates
5. Honest about uncertainty — "I don't know" is acceptable
6. Commercial framing — everything connects to revenue, cost, or risk

## CRITICAL RULES

- Never guarantee outcomes — the future is uncertain
- Use ranges, not point estimates (e.g., "15-25% improvement" not "20%")
- Flag anything uncomfortable to explain publicly
- If data quality is weak, say so explicitly
- Challenge assumptions before accepting them
- Recommend the lightest effective intervention first
- If something is a bad idea, say so clearly and explain why
- Always end with a specific, actionable next step

## RESPONSE STRUCTURE

For substantive questions, structure responses with:
1. **Key Insight** — The core answer in 1-2 sentences
2. **Why This Matters** — Commercial/operational implication
3. **Risk or Caveat** — What could go wrong or what you're uncertain about
4. **Recommended Action** — One specific next step they can take today

For quick questions, skip the structure and answer directly.

Keep responses tight. No waffle. Every sentence must add value. If you can say it in fewer words, do so.`;

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
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error("[GENIE] Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse body first to check if this is a trial request
    const rawBody = await req.json();
    const isTrialRequest = rawBody.isTrialMode === true;
    
    // ========== AUTHENTICATION ==========
    const authHeader = req.headers.get("authorization");
    let userId: string | null = null;
    
    if (isTrialRequest) {
      // Trial mode: allow unauthenticated requests with limited functionality
      console.log("[GENIE] Trial mode request - skipping auth");
      userId = "trial_" + crypto.randomUUID().substring(0, 8);
    } else {
      // Normal mode: require authentication
      if (!authHeader) {
        console.error("[GENIE] Missing authorization header");
        return new Response(
          JSON.stringify({ error: "Authentication required" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

      if (authError || !user) {
        console.error("[GENIE] Authentication failed:", authError?.message || "No user found");
        logSecurityEvent("auth_failure", {
          error: authError?.message || "No user",
          tokenPrefix: token.substring(0, 20) + "...",
        });
        return new Response(
          JSON.stringify({ error: "Invalid or expired authentication token" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("[GENIE] Authenticated user:", user.id);
      userId = user.id;
    }
    
    // ========== INPUT VALIDATION WITH ZOD ==========
    const validationResult = validateInput(GenieRequestSchema, rawBody);
    if (!validationResult.isValid) {
      logSecurityEvent("validation_failure", {
        validationErrors: validationResult.errors,
        userId,
      });
      
      // Log validation errors to admin_audit_logs for tracking
      if (SUPABASE_SERVICE_ROLE_KEY) {
        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        await supabaseAdmin.from("admin_audit_logs").insert({
          admin_user_id: userId,
          action: "genie_validation_error",
          resource_type: "genie_chat",
          resource_count: validationResult.errors?.length || 0,
          ip_address: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || null,
          user_agent: JSON.stringify({
            mode: rawBody?.mode || "unknown",
            errors: validationResult.errors,
            timestamp: new Date().toISOString(),
          }),
        }).then(({ error }) => {
          if (error) console.error("[GENIE] Failed to log validation error:", error.message);
        });
      }
      
      return new Response(
        JSON.stringify({ 
          error: "Invalid request format. Please check your input and try again.",
          details: validationResult.errors 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages, mode = "daily_operator", memoryContext, documentContext, _hp_field, isTrialMode } = rawBody;
    
    // Honeypot validation - detect bots that fill hidden fields
    const honeypotResult = validateHoneypot(_hp_field);
    if (honeypotResult.isBot) {
      logSecurityEvent("honeypot", {
        reason: honeypotResult.reason,
        mode,
        userId,
      });
      // Return error to block the bot
      return new Response(
        JSON.stringify({ error: "Request could not be processed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prompt injection detection
    if (messages && Array.isArray(messages)) {
      const promptGuardResult = analyzeMessages(messages);
      if (!promptGuardResult.isSafe) {
        logSecurityEvent("blocked", {
          riskScore: promptGuardResult.riskScore,
          patterns: promptGuardResult.detectedPatterns,
          mode,
          userId,
        });
        return new Response(
          JSON.stringify({ error: "Your message could not be processed. Please rephrase and try again." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Log warnings for suspicious but allowed requests
      if (promptGuardResult.riskScore > 10) {
        logSecurityEvent("warning", {
          riskScore: promptGuardResult.riskScore,
          patterns: promptGuardResult.detectedPatterns,
          mode,
          userId,
        });
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Initialize session signals with defaults
    let sessionSignals: SessionSignals = {
      totalSessions: 0,
      activeWeeks: 0,
      modesUsed: [],
      hasVoiceInteraction: false,
      averageSessionLength: 0,
      lastSessionDate: null,
      streak: {
        currentStreak: 0,
        longestStreak: 0,
        hasMomentumBadge: false,
        momentumTier: "none",
        lastActiveWeek: null,
      },
    };

    // Fetch session data and guardrails using service role key for elevated access
    let guardrailsContext = "";
    
    if (SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        sessionSignals = await fetchSessionSignals(supabase, userId);
        
        // Fetch founder guardrails
        try {
          const { data: guardrails } = await supabase
            .from("founder_guardrails")
            .select("section_id, items")
            .eq("user_id", userId);
          
          if (guardrails && guardrails.length > 0) {
            const sectionLabels: Record<string, string> = {
              principles: "Non-negotiable Principles",
              markets: "Markets to Ignore (do not recommend)",
              language: "Language to Avoid",
              ethics: "Ethical Red Lines (never violate)",
              optimisation: "Do Not Optimise For"
            };
            
            guardrailsContext = "\n\n## STRATEGIC GUARDRAILS (You must respect these boundaries)\n";
            guardrails.forEach((g: any) => {
              const label = sectionLabels[g.section_id] || g.section_id;
              guardrailsContext += `\n### ${label}\n`;
              guardrailsContext += g.items.map((item: string) => `- ${item}`).join("\n");
            });
          }
        } catch (guardrailErr) {
          console.log("[GENIE] Guardrails fetch skipped:", guardrailErr);
        }
      } catch (dataErr) {
        console.log("[GENIE] Session data fetch skipped:", dataErr);
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
    
    // Add guardrails first (highest priority constraints)
    if (guardrailsContext) {
      fullSystemPrompt += guardrailsContext;
    }
    
    if (memoryContext && memoryContext.trim()) {
      fullSystemPrompt += `\n\n## BUSINESS CONTEXT (Use this to personalise responses):\n${memoryContext}`;
    }
    
    if (documentContext && documentContext.trim()) {
      fullSystemPrompt += `\n\n## UPLOADED DOCUMENTS:\n${documentContext}`;
    }
    
    fullSystemPrompt += `\n\n${modeConfig.prompt}`;

    console.log("[GENIE] Mode:", mode, "Score:", trustMetadata.genieScore.overall, "Sessions:", sessionSignals.totalSessions);

    // Use Pro model for high-value strategic modes, Flash for quick questions
    const strategicModes = ["decision_support", "board_mode", "commercial_lens", "diagnostic", "build_mode"];
    const useProModel = strategicModes.includes(mode) && !isTrialMode;
    const selectedModel = useProModel ? "google/gemini-2.5-pro" : "google/gemini-2.5-flash";

    console.log("[GENIE] Using model:", selectedModel, "for mode:", mode);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: selectedModel,
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
