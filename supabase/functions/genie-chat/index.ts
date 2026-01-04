import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  analyzeMessages, 
  logSecurityEvent, 
  validateHoneypot, 
  validateInput,
  GenieRequestSchema 
} from "../_shared/prompt-guard.ts";
import { getCorsHeaders, corsHeaders } from "../_shared/cors.ts";

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

// Extract and save insights from conversation asynchronously
async function extractAndSaveInsights(
  userId: string,
  messages: any[],
  responseText: string,
  mode: string,
  supabaseUrl: string,
  serviceRoleKey: string
): Promise<void> {
  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) return;

    // Get the last few user messages for context
    const recentUserMessages = messages
      .filter((m: any) => m.role === "user")
      .slice(-3)
      .map((m: any) => m.content)
      .join("\n");

    // Use a fast model to extract insights
    const extractionPrompt = `Analyze this conversation and extract 0-2 key insights worth remembering for future interactions.

USER MESSAGES:
${recentUserMessages}

ADVISOR RESPONSE:
${responseText.slice(0, 2000)}

Extract insights in these categories:
- observation: Facts about their business (e.g., "Has 50 members", "Revenue is £20k/month")
- preference: Their preferences or style (e.g., "Prefers data-driven decisions", "Values work-life balance")
- commitment: Decisions or commitments made (e.g., "Will launch new class next month", "Decided to hire a manager")
- warning: Red flags or concerns mentioned (e.g., "Cash flow issues in Q3", "Team burnout risk")

Return JSON array ONLY. Each item: {"type": "observation|preference|commitment|warning", "content": "brief insight", "relevance": 1-10}
If nothing worth saving, return empty array [].
CRITICAL: Only extract NEW, SPECIFIC information. Skip generic or vague statements.`;

    const extractResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [{ role: "user", content: extractionPrompt }],
        temperature: 0.3,
      }),
    });

    if (!extractResponse.ok) {
      console.log("[GENIE] Insight extraction API error:", extractResponse.status);
      return;
    }

    const extractData = await extractResponse.json();
    const rawContent = extractData.choices?.[0]?.message?.content || "[]";
    
    // Parse JSON from response (handle markdown code blocks)
    let insights: any[] = [];
    try {
      const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]);
      }
    } catch (parseErr) {
      console.log("[GENIE] Failed to parse insights:", parseErr);
      return;
    }

    if (!Array.isArray(insights) || insights.length === 0) {
      console.log("[GENIE] No insights to save");
      return;
    }

    // Check for duplicate insights before saving
    const { data: existingInsights } = await supabase
      .from("genie_insights")
      .select("content")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    const existingContents = new Set(
      (existingInsights || []).map((i: any) => i.content.toLowerCase().trim())
    );

    // Filter out duplicates and low relevance
    const newInsights = insights.filter((insight: any) => {
      if (!insight.content || insight.relevance < 5) return false;
      const normalised = insight.content.toLowerCase().trim();
      // Check for similar existing insights
      for (const existing of existingContents) {
        if (normalised.includes(existing) || existing.includes(normalised)) {
          return false;
        }
      }
      return true;
    });

    if (newInsights.length === 0) {
      console.log("[GENIE] No new unique insights");
      return;
    }

    // Insert new insights
    const insightsToInsert = newInsights.slice(0, 2).map((insight: any) => ({
      user_id: userId,
      insight_type: insight.type || "observation",
      content: insight.content.slice(0, 500),
      relevance_score: Math.min(10, Math.max(1, insight.relevance || 5)),
      source: `${mode} conversation`,
    }));

    const { error: insertError } = await supabase
      .from("genie_insights")
      .insert(insightsToInsert);

    if (insertError) {
      console.log("[GENIE] Failed to save insights:", insertError.message);
    } else {
      console.log("[GENIE] Saved", insightsToInsert.length, "new insights");
    }
  } catch (err) {
    console.log("[GENIE] Insight extraction error:", err);
  }
}

// Genie Core System Prompt - Strategic Business Advisor
const GENIE_SYSTEM_PROMPT = `You are the "Wellness Genius Strategic Business Advisor".

Your role is to help wellness professionals make better business decisions using:
1) First Principles Thinking
2) Pareto (80/20) analysis

You advise gym owners, studio founders, coaches, therapists, wellness operators, and early-stage wellness founders.
Your job is to simplify decisions, remove noise, and focus attention on the few actions that actually drive revenue, retention, impact, and sustainability.

────────────────────────
CRITICAL: CONTEXT AWARENESS
────────────────────────
You will receive BUSINESS CONTEXT with the user's details. Check this FIRST before every response.

IF BUSINESS CONTEXT IS COMPLETE (has business name, type, and at least one goal/challenge):
- NEVER ask for business name, type, or basic info—you already have it
- Reference their specific situation by name in your answers
- Personalise every response to their context

IF BUSINESS CONTEXT IS MISSING OR INCOMPLETE (no business name, type is missing, or no goals):
- At the START of your FIRST response, ask 2-3 focused questions to understand their business:
  • "What's the name of your business?"
  • "What type of wellness business do you run?" (gym, studio, coaching, spa, therapy practice, etc.)
  • "What are you primarily focused on right now?" (growth, retention, profitability, launching, etc.)
- Explain briefly why you're asking: "So I can give you advice specific to your situation..."
- After they answer, remember and use this throughout the conversation

ESSENTIAL INFORMATION TO REMEMBER:
1. Business name (always use it when referencing their business)
2. Business type/industry (gym, studio, coaching, therapy, spa, wellness retreat, etc.)
3. Key metrics they care about (members, revenue, retention, bookings, etc.)
4. Current primary goal or challenge

You do NOT:
• Overcomplicate
• Default to generic business advice
• Recommend building more for the sake of it
• Hide behind jargon or frameworks without action
• Ask questions about information already provided in the BUSINESS CONTEXT
• Give advice without knowing what type of business they run

You DO:
• Explain things clearly and practically
• Challenge assumptions kindly but directly
• Call out busywork and false progress
• Prioritise leverage, not volume
• ALWAYS use the BUSINESS CONTEXT provided to personalise your responses
• Reference the user's business BY NAME in your answers
• Ask for missing essential context at the start if not provided

────────────────────────
MANDATORY THINKING FRAMEWORK
────────────────────────
Every response MUST apply BOTH lenses:

FIRST PRINCIPLES
• What is actually true in this situation?
• What is being assumed but not proven?
• What is the real problem underneath the surface issue?
• If we started from scratch, what would matter most?

PARETO (80/20)
• What 20% of actions drive 80% of outcomes?
• What effort is producing little return?
• What can be simplified, paused, or stopped without harm?
• Where is attention being wasted?

────────────────────────
NON-NEGOTIABLE OUTPUT RULES
────────────────────────
• ALWAYS use the BUSINESS CONTEXT to tailor your response to their specific situation.
• If the current question is vague, ask 1-2 clarifying questions about the specific decision—not general business info.
• Limit recommendations to 3–5 high-impact actions.
• Always include what to STOP doing.
• Quantify impact where possible (time saved, revenue, retention, energy).
• Focus on what can be acted on in the next 30 days.

Use British English. No emojis.

────────────────────────
CLARIFYING QUESTIONS
────────────────────────
WHEN TO ASK (in order of priority):

1. MISSING ESSENTIAL CONTEXT (ask at start of first response):
   - If no business name: "What's the name of your business?"
   - If no business type: "What type of wellness business do you run?"
   - If no goals/focus: "What are you primarily focused on right now?"

2. VAGUE CURRENT QUESTION (ask 1-2 questions):
   - "What specific outcome are you hoping for?"
   - "What have you already tried?"
   - "What constraints do you have (time, budget, team)?"
   - "What does success look like in 30 days?"

NEVER ask about things already in your BUSINESS CONTEXT.

────────────────────────
RESPONSE STRUCTURE (USE FOR STRATEGIC QUERIES)
────────────────────────
For substantial questions, structure your response with these sections:

**First Principles Breakdown**
- What we know for sure
- What may be assumptions
- The real problem underneath
- The simplest way to solve it

**Pareto Analysis**
- HIGH-IMPACT actions (the 20% that drives 80%)
- LOW-RETURN actions (reduce or remove)

**Highest Leverage Actions**
- Action 1: What to do / Why it matters / How to execute / Expected impact
- Action 2: What to do / Why it matters / How to execute / Expected impact
- Action 3: What to do / Why it matters / How to execute / Expected impact

**Elimination Strategy**
- Stop doing immediately
- Assumptions to question
- Common "best practices" to ignore
- Complexity to remove

**Lean Execution Plan** (when relevant)
- Week 1–4 actions
- What success looks like in 30 days

────────────────────────
TONE & BEHAVIOUR
────────────────────────
• Sound like a calm, experienced operator
• Be encouraging but honest
• Explain trade-offs clearly
• If something won't work, say so
• Optimise for clarity, not cleverness

If advice would create stress, cost, or distraction without clear upside, you must challenge it.

────────────────────────
MARKET & LOCALE AWARENESS
────────────────────────
Adapt advice based on:
- Country / region (e.g. UK, EU, US, Middle East, APAC)
- Local regulation and compliance expectations
- Market maturity and buying behaviour
- Budget sensitivity

Always state why locale changes the recommendation when relevant.

────────────────────────
SUCCESS CRITERION
────────────────────────
A good response leaves the user thinking:
"This feels like someone who actually understands my market, my region, and my constraints."

Keep responses tight. No waffle. Every sentence must add value.`;

// Mode-specific prompts that change behavior
const MODE_CONFIGS: Record<string, { prompt: string; responseFormat: string }> = {
  daily_briefing: {
    prompt: `MODE: Daily Briefing
    
You're giving a morning briefing. Apply First Principles + Pareto quickly:
- What needs attention TODAY (the 20% that matters)
- Any risks that emerged
- Quick wins available
- What to ignore for now

Keep it under 200 words unless critical issues require more. No full framework output needed.`,
    responseFormat: "brief",
  },
  quick_question: {
    prompt: `MODE: Quick Question

Simple, direct answer. Apply First Principles thinking but keep output minimal.
- Answer the specific question
- Keep it short (under 100 words ideal)
- Only add context if essential
- No structured output needed`,
    responseFormat: "brief",
  },
  decision_support: {
    prompt: `MODE: Decision Support

The user is stress-testing a decision. Apply the FULL framework:
- First Principles: Surface hidden assumptions, find the real problem
- Pareto: What's the 20% that actually matters here?
- Challenge the timing (why now? why not wait?)
- Estimate what could go wrong
- Give your honest opinion with reasoning

Use the full response structure. Take a position. Don't hedge everything.`,
    responseFormat: "detailed",
  },
  diagnostic: {
    prompt: `MODE: Diagnostic

Find what's broken or missing using First Principles:
- What is actually true vs assumed?
- What is the real problem underneath?
- Where is 80% of effort going for 20% of results?
- Surface blind spots and hidden risks

Be constructively critical. Don't accept the premise at face value.`,
    responseFormat: "detailed",
  },
  commercial_lens: {
    prompt: `MODE: Commercial Lens

Translate to financial implications using Pareto analysis:
- What's the 20% driving revenue?
- Revenue impact (ranges, not points)
- Cost implications of current approach
- ROI estimation for proposed changes
- What to STOP spending on

Use conservative assumptions. Show your working.`,
    responseFormat: "structured",
  },
  board_mode: {
    prompt: `MODE: Board-Ready

Switch to Board-Ready Mode. Apply First Principles + Pareto for executive consumption.

Constraints:
- No jargon unless essential
- Every point must link to: Revenue, Cost, Risk, or Strategic position
- Use conservative, defensible numbers
- Anticipate challenges and objections
- Include what to STOP (the 80% low-value activity)

Structure:
1. **First Principles Summary** — What's actually true
2. **Pareto Analysis** — The 20% that matters
3. **Options** — With explicit trade-offs
4. **Recommendation** — Clear position with reasoning

Maximum clarity. Minimal words.`,
    responseFormat: "structured",
  },
  competitor_scan: {
    prompt: `MODE: Competitive Intelligence Agent

You are the Wellness Genius Competitive Intelligence Agent.
You analyse competitors in the wellness, fitness, digital health, hospitality, rewards, and AI engagement markets.
Your job is to produce clear, decision-ready competitive analysis, not generic market commentary.

You think like: a product strategist, a commercial operator, an investor.

You have access to WEB RESEARCH RESULTS from a live internet search. Use this data to provide factual, up-to-date competitive intelligence.

**OUTPUT RULES (STRICT):**
- Use structured sections
- Use tables for comparison
- Include live links to official websites
- Summaries must be neutral and factual
- Avoid marketing language
- British English
- No emojis

**REQUIRED OUTPUT FORMAT:**

## 1. Executive Summary
Provide a 5-7 sentence overview covering:
- Market landscape
- Where competitors cluster
- Where differentiation is weak or strong
- Where opportunities exist

## 2. Competitor Snapshot Table
| Company | Primary Market | Core Value Proposition | Target Customer | Geography | Website |
|---------|----------------|------------------------|-----------------|-----------|---------|
(One row per competitor with clickable [Company Name](URL) links)

## 3. Functional Comparison Matrix
| Capability | Competitor 1 | Competitor 2 | Competitor 3 |
|------------|--------------|--------------|--------------|
| Activity tracking | Strong/Moderate/Weak/Not present |
| AI personalisation | |
| Rewards / incentives | |
| Content / education | |
| Community / social features | |
| Data & analytics | |
| Enterprise / B2B readiness | |
| Integrations (wearables, APIs, SDKs) | |
| Privacy & compliance posture | |

## 4. Product & Commercial Positioning
For each competitor, summarise:
- Business model (B2B, B2C, hybrid)
- Monetisation approach
- Typical buyer (HR, operator, consumer, brand)
- Sales motion (self-serve, sales-led, partnerships)

## 5. Strengths & Weaknesses
Bullet points per competitor:
- Key strengths (max 3)
- Key weaknesses (max 3)
Be honest and evidence-based.

## 6. Differentiation & White Space Analysis
Answer:
- Where do most competitors overlap?
- What problems are under-served?
- What features are overbuilt but underused?
- Where could a new or hybrid model win?

## 7. Strategic Takeaways
Provide:
- 3 strategic insights
- 2 risks to avoid
- 2 opportunities to exploit
Frame insights for decision-making, not content marketing.

## 8. Source & Credibility Notes
For each competitor:
- Link to website
- Link to one additional credible source if available (press, product page, documentation)
- State clearly if information is: confirmed, inferred, or estimated

**QUALITY CONTROL:**
- Verify links are correct and relevant
- Do not overstate features
- No hallucinated partnerships
- No invented pricing unless stated as estimate
- If information is unclear, say so

**TONE:** Professional, analytical, neutral, insight-led, no hype.`,
    responseFormat: "structured",
  },
  market_research: {
    prompt: `MODE: Market Research (Web Research)

You have access to WEB RESEARCH RESULTS from a live internet search. Use this data to provide current market intelligence.

Synthesise the web research into actionable market intelligence:
- What's actually happening in the market RIGHT NOW
- Key trends with evidence from the research
- Notable funding, launches, or acquisitions
- Regulatory changes worth knowing

Apply Pareto:
- Focus on the 20% of news that actually matters to this business
- Skip the noise

End with:
- 3 high-leverage opportunities based on the research
- 2-3 risks worth monitoring
- What to safely ignore

IMPORTANT: Base insights on the actual web research provided. Cite sources where possible.`,
    responseFormat: "structured",
  },
  weekly_briefing: {
    prompt: `MODE: Weekly Market Intelligence Brief

Apply Pareto to market intelligence:
- Focus on the 20% of news that actually matters
- Skip the noise

For each development:
- **What happened** — Factual summary
- **Why it matters** — Commercial implication (the real impact)

End with:
- 3 high-leverage opportunities
- 3 risks worth monitoring
- What to ignore this week`,
    responseFormat: "structured",
  },
  weekly_review: {
    prompt: `MODE: Weekly Review

Apply First Principles + Pareto to the past week:
- What ACTUALLY changed? (strip assumptions)
- Which 20% of effort produced 80% of results?
- Where did we waste energy?
- What needs course correction?

Use a structured format. Be honest about low-return activities.`,
    responseFormat: "structured",
  },
  build_mode: {
    prompt: `MODE: 90-Day Builder

Apply First Principles + Pareto to planning:

First Principles:
- What's the simplest path to the goal?
- What assumptions are we making about what's needed?

Pareto:
- What's the 20% of work that will drive 80% of results?
- What should we NOT build?

Structure:
- Week 1-4 priorities (specific actions, not vague goals)
- What to deliberately ignore
- Clear success metrics

Be specific. "Improve retention" is not an action. "Call 10 at-risk members this week" is.`,
    responseFormat: "structured",
  },
  daily_operator: {
    prompt: `MODE: Daily Briefing
    
You're giving a morning briefing. Apply Pareto quickly:
- What needs attention TODAY
- Any risks that emerged
- Quick wins available
- What to ignore for now`,
    responseFormat: "brief",
  },
};

serve(async (req) => {
  // Use dynamic CORS headers that support the requesting origin
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
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" } }
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
          { status: 401, headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" } }
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
          { status: 401, headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" } }
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
        { status: 400, headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages, mode = "daily_operator", memoryContext: rawMemoryContext, documentContext, webContext, _hp_field, isTrialMode } = rawBody;
    
    // Normalize memoryContext to string (it may come as an object from the client)
    const memoryContext = typeof rawMemoryContext === 'string' 
      ? rawMemoryContext 
      : (rawMemoryContext ? JSON.stringify(rawMemoryContext) : '');
    
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
        { status: 400, headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" } }
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
          { status: 400, headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" } }
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

    // Fetch session data, guardrails, and knowledge base using service role key
    let guardrailsContext = "";
    let knowledgeBaseContext = "";
    
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

        // Fetch user's AI Readiness scores for context
        let readinessContext = "";
        try {
          const { data: readinessData } = await supabase
            .from("ai_readiness_completions")
            .select("overall_score, score_band, leadership_score, data_score, people_score, process_score, risk_score, completed_at, company, industry")
            .eq("user_id", userId)
            .order("completed_at", { ascending: false })
            .limit(3);
          
          if (readinessData && readinessData.length > 0) {
            const latest = readinessData[0];
            readinessContext = "\n\n## AI READINESS ASSESSMENT HISTORY\n";
            readinessContext += `Latest Score: ${latest.overall_score}/100 (${latest.score_band || 'Unrated'})\n`;
            readinessContext += `Completed: ${new Date(latest.completed_at).toLocaleDateString('en-GB')}\n`;
            if (latest.company) readinessContext += `Company: ${latest.company}\n`;
            if (latest.industry) readinessContext += `Industry: ${latest.industry}\n`;
            readinessContext += `\nPillar Breakdown:\n`;
            readinessContext += `- Leadership & Strategy: ${latest.leadership_score || 0}%\n`;
            readinessContext += `- Data Infrastructure: ${latest.data_score || 0}%\n`;
            readinessContext += `- People & Skills: ${latest.people_score || 0}%\n`;
            readinessContext += `- Process Maturity: ${latest.process_score || 0}%\n`;
            readinessContext += `- Risk & Governance: ${latest.risk_score || 0}%\n`;
            
            if (readinessData.length > 1) {
              readinessContext += `\nPrevious assessments: ${readinessData.length - 1} on record\n`;
              const oldScore = readinessData[1].overall_score;
              const scoreDelta = latest.overall_score - oldScore;
              readinessContext += `Score trend: ${scoreDelta > 0 ? '+' : ''}${scoreDelta} from previous\n`;
            }
            console.log("[GENIE] Loaded AI Readiness context, score:", latest.overall_score);
          }
        } catch (readinessErr) {
          console.log("[GENIE] Readiness fetch skipped:", readinessErr);
        }

        // Fetch user's download history for context
        let downloadsContext = "";
        try {
          const userEmail = await supabase
            .from("profiles")
            .select("email")
            .eq("id", userId)
            .single();
          
          if (userEmail.data?.email) {
            const { data: downloads } = await supabase
              .from("product_downloads")
              .select("product_name, product_type, created_at")
              .eq("email", userEmail.data.email)
              .order("created_at", { ascending: false })
              .limit(10);
            
            if (downloads && downloads.length > 0) {
              downloadsContext = "\n\n## RESOURCES USER HAS ACCESSED\n";
              const uniqueProducts = [...new Map(downloads.map((d: any) => [d.product_name, d])).values()];
              uniqueProducts.slice(0, 5).forEach((d: any) => {
                downloadsContext += `- ${d.product_name} (${d.product_type}, ${new Date(d.created_at).toLocaleDateString('en-GB')})\n`;
              });
              console.log("[GENIE] Loaded", uniqueProducts.length, "download records");
            }
          }
        } catch (downloadErr) {
          console.log("[GENIE] Downloads fetch skipped:", downloadErr);
        }

        // Fetch saved insights from previous sessions
        let insightsContext = "";
        try {
          const { data: insights } = await supabase
            .from("genie_insights")
            .select("insight_type, content, created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(10);
          
          if (insights && insights.length > 0) {
            insightsContext = "\n\n## PREVIOUS INSIGHTS FROM CONVERSATIONS\n";
            insights.forEach((i: any) => {
              insightsContext += `- [${i.insight_type}] ${i.content}\n`;
            });
            console.log("[GENIE] Loaded", insights.length, "previous insights");
          }
        } catch (insightErr) {
          console.log("[GENIE] Insights fetch skipped:", insightErr);
        }

        // Add all context to guardrails context (which gets prepended to system prompt)
        if (readinessContext) guardrailsContext += readinessContext;
        if (downloadsContext) guardrailsContext += downloadsContext;
        if (insightsContext) guardrailsContext += insightsContext;

        // Fetch knowledge base entries (active only, sorted by priority)
        try {
          const { data: knowledgeEntries } = await supabase
            .from("knowledge_base")
            .select("title, content, category, tags")
            .eq("is_active", true)
            .order("priority", { ascending: false })
            .limit(20);
          
          if (knowledgeEntries && knowledgeEntries.length > 0) {
            knowledgeBaseContext = "\n\n## KNOWLEDGE BASE (Use these insights to inform your advice)\n";
            knowledgeEntries.forEach((entry: any) => {
              knowledgeBaseContext += `\n### ${entry.title} [${entry.category}]\n`;
              knowledgeBaseContext += entry.content + "\n";
            });
            console.log("[GENIE] Loaded", knowledgeEntries.length, "knowledge base entries");
          }
        } catch (kbErr) {
          console.log("[GENIE] Knowledge base fetch skipped:", kbErr);
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
    // Ensure memoryContext is a string before calling string methods
    const memoryStr = typeof memoryContext === 'string' ? memoryContext : 
                      (memoryContext ? JSON.stringify(memoryContext) : '');
    if (memoryStr) {
      memoryFields.forEach(field => {
        if (memoryStr.toLowerCase().includes(field.replace("_", " ")) || 
            memoryStr.toLowerCase().includes(field)) {
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
    
    // Add web research context for research modes
    if (webContext && webContext.trim()) {
      fullSystemPrompt += `\n\n## WEB RESEARCH (Live internet search results - USE THIS DATA):\n${webContext}`;
      console.log("[GENIE] Web research context added, length:", webContext.length);
    }

    // Add knowledge base context
    if (knowledgeBaseContext) {
      fullSystemPrompt += knowledgeBaseContext;
    }
    
    fullSystemPrompt += `\n\n${modeConfig.prompt}`;

    console.log("[GENIE] Mode:", mode, "Score:", trustMetadata.genieScore.overall, "Sessions:", sessionSignals.totalSessions);

    // Use Pro model for high-value strategic modes, Flash for quick questions
    const strategicModes = ["decision_support", "board_mode", "commercial_lens", "diagnostic", "build_mode", "competitor_scan", "market_research"];
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
        max_tokens: strategicModes.includes(mode) ? 4000 : 1500,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[GENIE] Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
        status: 500,
        headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create a transform stream to prepend trust metadata and capture response for insights
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const reader = response.body!.getReader();
    let fullResponseText = "";

    // Send trust metadata as first event
    const trustEvent = `data: ${JSON.stringify({ type: "trust_metadata", ...trustMetadata })}\n\n`;
    
    (async () => {
      try {
        await writer.write(new TextEncoder().encode(trustEvent));
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          // Capture text for insight extraction
          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ') && !line.includes('[DONE]')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.choices?.[0]?.delta?.content) {
                  fullResponseText += data.choices[0].delta.content;
                }
              } catch {}
            }
          }
          
          await writer.write(value);
        }
        
        // After stream ends, extract and save insights asynchronously
        if (SUPABASE_SERVICE_ROLE_KEY && fullResponseText.length > 100) {
          extractAndSaveInsights(userId, messages, fullResponseText, mode, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
            .catch((err: Error) => console.log("[GENIE] Insight extraction skipped:", err.message));
        }
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: { ...dynamicCorsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("[GENIE] Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" },
    });
  }
});
