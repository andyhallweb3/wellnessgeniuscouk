// Genie Score calculation types and utilities

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  hasMomentumBadge: boolean;
  momentumTier: "none" | "bronze" | "silver" | "gold" | "platinum";
  lastActiveWeek: string | null;
}

export interface SessionSignals {
  totalSessions: number;
  activeWeeks: number;
  modesUsed: string[];
  hasVoiceInteraction: boolean;
  averageSessionLength: number;
  lastSessionDate: string | null;
  streak: StreakData;
}

export interface GenieScore {
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

export interface TrustMetadata {
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

const MODE_POINTS: Record<string, number> = {
  daily_briefing: 10, quick_question: 5, weekly_review: 20,
  decision_support: 25, board_mode: 25, build_mode: 20,
  diagnostic: 20, commercial_lens: 20, ops_mode: 15, daily_operator: 10,
};
const MAX_MODE_POINTS = 75;

function getISOWeek(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { year: d.getUTCFullYear(), week: weekNum };
}

export function calculateStreak(sessions: any[]): StreakData {
  if (!sessions || sessions.length === 0) {
    return { currentStreak: 0, longestStreak: 0, hasMomentumBadge: false, momentumTier: "none", lastActiveWeek: null };
  }

  const activeWeeks = new Map<string, boolean>();
  sessions.forEach((session: any) => {
    const date = new Date(session.started_at);
    const { year, week } = getISOWeek(date);
    activeWeeks.set(`${year}-W${week.toString().padStart(2, "0")}`, true);
  });

  const sortedWeeks = Array.from(activeWeeks.keys()).sort().reverse();
  if (sortedWeeks.length === 0) {
    return { currentStreak: 0, longestStreak: 0, hasMomentumBadge: false, momentumTier: "none", lastActiveWeek: null };
  }

  const now = new Date();
  const currentWeekData = getISOWeek(now);
  const currentWeekKey = `${currentWeekData.year}-W${currentWeekData.week.toString().padStart(2, "0")}`;
  const lastActiveWeek = sortedWeeks[0];
  const lastWeekData = getISOWeek(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
  const lastWeekKey = `${lastWeekData.year}-W${lastWeekData.week.toString().padStart(2, "0")}`;
  const isCurrentlyActive = lastActiveWeek === currentWeekKey || lastActiveWeek === lastWeekKey;

  let currentStreak = 0;
  if (isCurrentlyActive) {
    let checkDate = new Date();
    if (lastActiveWeek === lastWeekKey) checkDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    for (let i = 0; i < 52; i++) {
      const { year, week } = getISOWeek(checkDate);
      if (activeWeeks.has(`${year}-W${week.toString().padStart(2, "0")}`)) {
        currentStreak++;
        checkDate = new Date(checkDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else break;
    }
  }

  let longestStreak = 0, tempStreak = 0;
  if (sessions.length > 0) {
    let checkDate = new Date(sessions[sessions.length - 1].started_at);
    const endDate = new Date();
    while (checkDate <= endDate) {
      const { year, week } = getISOWeek(checkDate);
      if (activeWeeks.has(`${year}-W${week.toString().padStart(2, "0")}`)) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else tempStreak = 0;
      checkDate = new Date(checkDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
  }

  let momentumTier: "none" | "bronze" | "silver" | "gold" | "platinum" = "none";
  const streakForBadge = Math.max(currentStreak, longestStreak);
  if (streakForBadge >= 48) momentumTier = "platinum";
  else if (streakForBadge >= 24) momentumTier = "gold";
  else if (streakForBadge >= 16) momentumTier = "silver";
  else if (streakForBadge >= 12) momentumTier = "bronze";

  return {
    currentStreak: Math.min(currentStreak, 52),
    longestStreak: Math.min(longestStreak, 52),
    hasMomentumBadge: momentumTier !== "none",
    momentumTier,
    lastActiveWeek,
  };
}

export async function fetchSessionSignals(supabase: any, userId: string): Promise<SessionSignals> {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const defaultStreak: StreakData = { currentStreak: 0, longestStreak: 0, hasMomentumBadge: false, momentumTier: "none", lastActiveWeek: null };
  const defaults: SessionSignals = { totalSessions: 0, activeWeeks: 0, modesUsed: [], hasVoiceInteraction: false, averageSessionLength: 0, lastSessionDate: null, streak: defaultStreak };

  try {
    const { data: sessions, error } = await supabase
      .from("genie_sessions").select("id, mode, started_at, ended_at, messages")
      .eq("user_id", userId).gte("started_at", oneYearAgo.toISOString())
      .order("started_at", { ascending: false }).limit(500);

    if (error || !sessions || sessions.length === 0) return defaults;

    const streak = calculateStreak(sessions);
    const twentyEightDaysAgo = new Date();
    twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);
    const recentSessions = sessions.filter((s: any) => new Date(s.started_at) >= twentyEightDaysAgo);

    const weekSet = new Set<string>();
    recentSessions.forEach((session: any) => {
      const date = new Date(session.started_at);
      const { year, week } = getISOWeek(date);
      weekSet.add(`${year}-W${week}`);
    });

    const uniqueModes = Array.from(new Set(recentSessions.map((s: any) => String(s.mode || "")))) as string[];
    const totalMessages = recentSessions.reduce((acc: number, s: any) => acc + (Array.isArray(s.messages) ? s.messages.length : 0), 0);

    return {
      totalSessions: recentSessions.length,
      activeWeeks: Math.min(weekSet.size, 4),
      modesUsed: uniqueModes,
      hasVoiceInteraction: uniqueModes.includes("voice") || recentSessions.some((s: any) => s.mode?.includes("voice") || JSON.stringify(s.messages || []).includes("voice")),
      averageSessionLength: recentSessions.length > 0 ? Math.round(totalMessages / recentSessions.length) : 0,
      lastSessionDate: sessions[0]?.started_at || null,
      streak,
    };
  } catch (err) {
    console.error("[GENIE] Session fetch error:", err);
    return defaults;
  }
}

export function calculateGenieScore(sessionSignals: SessionSignals, memoryCompleteness: number, hasDocuments: boolean): GenieScore {
  const consistencyScores: Record<number, number> = { 0: 0, 1: 40, 2: 65, 3: 85, 4: 100 };
  let consistencyBase = consistencyScores[sessionSignals.activeWeeks] || 0;
  if (sessionSignals.hasVoiceInteraction) consistencyBase = Math.min(100, consistencyBase + 5);
  if (sessionSignals.modesUsed.includes("weekly_review")) consistencyBase = Math.min(100, consistencyBase + 5);

  const modePointsEarned = sessionSignals.modesUsed.reduce((acc, mode) => acc + (MODE_POINTS[mode] || 5), 0);
  let engagementDepth = Math.round((modePointsEarned / MAX_MODE_POINTS) * 100);
  if (sessionSignals.hasVoiceInteraction) engagementDepth = Math.min(100, Math.round(engagementDepth * 1.2));

  let dataHygiene = Math.round(memoryCompleteness * 0.3);
  dataHygiene += memoryCompleteness > 50 ? 30 : 0;
  dataHygiene += memoryCompleteness > 70 ? 20 : 0;
  dataHygiene += hasDocuments ? 20 : 0;
  dataHygiene = Math.min(100, dataHygiene);

  const overall = Math.round((consistencyBase * 0.30) + (engagementDepth * 0.25) + (dataHygiene * 0.20) + (50 * 0.25));

  return {
    overall: Math.min(100, Math.max(0, overall)),
    consistency: consistencyBase,
    engagementDepth,
    dataHygiene,
    breakdown: { activeWeeks: sessionSignals.activeWeeks, uniqueModes: sessionSignals.modesUsed.length, voiceBonus: sessionSignals.hasVoiceInteraction, profileCompleteness: memoryCompleteness },
  };
}

export function calculateTrustMetadata(mode: string, memoryContext: string | undefined, documentContext: string | undefined, sessionSignals: SessionSignals, memoryCompleteness: number): TrustMetadata {
  const hasMemory = !!memoryContext && memoryContext.trim().length > 50;
  const hasDocs = !!documentContext && documentContext.trim().length > 0;
  const hasRecentSessions = sessionSignals.totalSessions > 0;
  const genieScore = calculateGenieScore(sessionSignals, memoryCompleteness, hasDocs);

  let confidenceLevel: "high" | "medium" | "low" = "low";
  if (genieScore.overall >= 60 && hasMemory) confidenceLevel = "high";
  else if (genieScore.overall >= 35 || (hasMemory && hasRecentSessions)) confidenceLevel = "medium";
  if (sessionSignals.activeWeeks >= 3 && confidenceLevel === "medium") confidenceLevel = "high";

  let dataSensitivity: "standard" | "sensitive" | "health-adjacent" = "standard";
  const contextLower = (memoryContext || "").toLowerCase();
  if (["wellness", "health", "fitness", "stress", "recovery", "sleep", "mood", "mental"].some(k => contextLower.includes(k))) dataSensitivity = "health-adjacent";
  else if (["behavior", "behaviour", "usage", "engagement", "retention", "churn"].some(k => contextLower.includes(k))) dataSensitivity = "sensitive";

  const isInference = ["diagnostic", "decision_support", "commercial_lens"].includes(mode);

  const factors: string[] = [];
  if (hasRecentSessions) {
    factors.push(`${sessionSignals.totalSessions} sessions in last 28 days`);
    factors.push(`Active ${sessionSignals.activeWeeks} of 4 weeks`);
    if (sessionSignals.modesUsed.length > 2) factors.push(`Using ${sessionSignals.modesUsed.length} different modes`);
  }
  if (hasMemory) factors.push(`Business profile ${memoryCompleteness}% complete`);
  else factors.push("No business profile configured");
  if (hasDocs) factors.push("Documents uploaded for context");
  factors.push(`Mode: ${mode.replace(/_/g, " ")}`);

  let explanation = "";
  if (genieScore.overall >= 70) explanation = "High confidence based on consistent engagement and complete business profile.";
  else if (genieScore.overall >= 45) explanation = "Good confidence based on your usage patterns. Continue engaging for better insights.";
  else if (hasRecentSessions) explanation = "Building confidence through your session history. Complete your profile for improved accuracy.";
  else explanation = "Limited history available. Regular use and a complete profile will improve recommendations.";

  return {
    confidenceLevel, dataSensitivity, isInference,
    dataSignals: { hasBusinessProfile: hasMemory, hasRecentSessions, hasDocuments: hasDocs, hasMetrics: memoryContext?.includes("key_metrics") || false, memoryCompleteness },
    sessionSignals, genieScore, explanation, factors,
  };
}
