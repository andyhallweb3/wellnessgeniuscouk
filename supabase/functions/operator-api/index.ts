/**
 * operator-api — Public REST endpoint for B2B operator integrations
 *
 * Auth: custom API key via `Authorization: Bearer <api_key>` (NOT a Supabase JWT)
 * CORS: open to all origins (this is a public developer API)
 *
 * Flow:
 *  1. Extract & SHA-256 hash the bearer token
 *  2. Look up the key in operator_api_keys
 *  3. Enforce monthly call limit; reset counter if past reset_at
 *  4. Call Anthropic and return a JSON response
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Public API — accept requests from any origin
const PUBLIC_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ALLOWED_MODES = [
  "daily_operator",
  "diagnostic",
  "decision_support",
  "commercial_lens",
  "board_mode",
] as const;

type AllowedMode = (typeof ALLOWED_MODES)[number];

/** Mode-specific prompt additions */
const MODE_PROMPTS: Record<AllowedMode, string> = {
  daily_operator:
    "MODE: Daily Operator Advisory. Provide concise, practical guidance on the operator's day-to-day question. Focus on the most commercially relevant answer.",
  diagnostic:
    "MODE: Diagnostic. Help the operator identify the root cause of a problem in their business. Ask clarifying questions if needed, and map findings to commercial impact.",
  decision_support:
    "MODE: Decision Support. The operator is weighing a decision. Lay out the key factors, risks, and likely outcomes without making the decision for them.",
  commercial_lens:
    "MODE: Commercial Lens. Translate the operator's question into revenue and retention terms. Use conservative estimates. Provide ranges, not guarantees.",
  board_mode:
    "MODE: Board Mode. Produce a board-ready summary: headline finding, supporting evidence, risk factors, and recommended next action. Keep it concise.",
};

/** Wellness-focused system prompt for the operator API */
function buildSystemPrompt(context?: string): string {
  const base = `You are the Wellness Genius AI Advisor — a commercial advisor embedded in wellness and fitness operator platforms via the Wellness Genius API.

## Your Role

You help gym operators, spa directors, corporate wellbeing leads, and wellness startup founders make better commercial decisions. You are accessed via API by software vendors who have embedded you in their own platforms.

## Operating Principles

- Use British English throughout
- Be direct and commercially grounded — no motivational language
- Provide specific, actionable guidance
- Use conservative financial assumptions; always give ranges, not guarantees
- Acknowledge what you do not know rather than speculating
- Flag risks and trust considerations before recommending action

## Response Structure

1. Key insight — what matters most
2. Commercial implication — why it matters financially
3. Risk or limitation — what could go wrong
4. Recommended next action — the most practical first step

## Sector Context

You understand the economics of: gym membership retention, spa occupancy and spend-per-guest, corporate wellbeing utilisation and ROI, and wellness software product-market fit.

## Critical Rules

- Never recommend AI as the first solution to a behaviour or engagement problem
- If data quality is poor, recommend fixing foundations before scaling
- If something would be uncomfortable to explain to a regulator, customer, or journalist — flag it explicitly`;

  if (context && context.trim()) {
    return `${base}\n\n## Operator Business Context\n\n${context.trim()}`;
  }

  return base;
}

/** Hash a string with SHA-256, return lowercase hex */
async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...PUBLIC_CORS_HEADERS, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: PUBLIC_CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed. Use POST." }, 405);
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !ANTHROPIC_API_KEY) {
    console.error("[operator-api] Missing required environment variables");
    return jsonResponse({ error: "Server configuration error" }, 500);
  }

  // ── 1. Extract API key from Authorization header ──────────────────────────
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return jsonResponse(
      { error: "Missing or malformed Authorization header. Expected: Bearer <api_key>" },
      401
    );
  }

  const apiKey = authHeader.slice(7).trim();
  if (!apiKey) {
    return jsonResponse({ error: "API key is empty" }, 401);
  }

  // ── 2. Hash key and look up in the database ───────────────────────────────
  const keyHash = await sha256Hex(apiKey);

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: keyRow, error: lookupError } = await adminClient
    .from("operator_api_keys")
    .select("id, user_id, tier, monthly_limit, calls_this_month, reset_at")
    .eq("key_hash", keyHash)
    .eq("active", true)
    .single();

  if (lookupError || !keyRow) {
    console.warn("[operator-api] Key lookup failed:", lookupError?.message ?? "not found");
    return jsonResponse({ error: "Invalid API key" }, 401);
  }

  // ── 3. Check monthly limit ────────────────────────────────────────────────
  let callsThisMonth: number = keyRow.calls_this_month;
  let resetAt: string = keyRow.reset_at;

  // Reset counter if the billing period has rolled over
  const now = new Date();
  if (now > new Date(keyRow.reset_at)) {
    const nextReset = new Date(now);
    nextReset.setMonth(nextReset.getMonth() + 1);
    nextReset.setDate(1);
    nextReset.setHours(0, 0, 0, 0);

    await adminClient
      .from("operator_api_keys")
      .update({ calls_this_month: 0, reset_at: nextReset.toISOString() })
      .eq("id", keyRow.id);

    callsThisMonth = 0;
    resetAt = nextReset.toISOString();
  }

  if (callsThisMonth >= keyRow.monthly_limit) {
    return jsonResponse(
      {
        error:
          "Monthly call limit reached. Upgrade your plan at wellnessgenius.co.uk/developer",
      },
      429
    );
  }

  // ── 4. Parse and validate request body ───────────────────────────────────
  let body: { question?: unknown; mode?: unknown; context?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Request body must be valid JSON" }, 400);
  }

  const { question, mode: rawMode, context: rawContext } = body;

  if (typeof question !== "string" || !question.trim()) {
    return jsonResponse(
      { error: 'Missing required field: "question" (string)' },
      400
    );
  }

  if (question.length > 2000) {
    return jsonResponse(
      { error: '"question" must be 2,000 characters or fewer' },
      400
    );
  }

  const mode: AllowedMode =
    typeof rawMode === "string" && (ALLOWED_MODES as readonly string[]).includes(rawMode)
      ? (rawMode as AllowedMode)
      : "daily_operator";

  const context =
    typeof rawContext === "string" && rawContext.trim() ? rawContext.trim() : undefined;

  // ── 5. Call Anthropic ─────────────────────────────────────────────────────
  const systemPrompt = buildSystemPrompt(context);
  const modeAddition = MODE_PROMPTS[mode];
  const fullSystemPrompt = `${systemPrompt}\n\n${modeAddition}`;

  let anthropicResponse: Response;
  try {
    anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        system: fullSystemPrompt,
        messages: [{ role: "user", content: question }],
        max_tokens: 800,
      }),
    });
  } catch (err) {
    console.error("[operator-api] Anthropic fetch error:", err);
    return jsonResponse({ error: "AI service temporarily unavailable. Please retry." }, 503);
  }

  if (!anthropicResponse.ok) {
    const errText = await anthropicResponse.text();
    console.error("[operator-api] Anthropic error:", anthropicResponse.status, errText);

    if (anthropicResponse.status === 429) {
      return jsonResponse({ error: "AI service rate limit reached. Please retry in a moment." }, 503);
    }

    return jsonResponse({ error: "AI service error. Please retry." }, 502);
  }

  const anthropicData = await anthropicResponse.json() as {
    content: Array<{ type: string; text: string }>;
  };

  const answer =
    anthropicData.content?.find((c) => c.type === "text")?.text ?? "";

  // ── 6. Increment call counter ─────────────────────────────────────────────
  const newCallsThisMonth = callsThisMonth + 1;
  await adminClient
    .from("operator_api_keys")
    .update({ calls_this_month: newCallsThisMonth })
    .eq("id", keyRow.id);

  // ── 7. Return response ────────────────────────────────────────────────────
  return jsonResponse(
    {
      answer,
      mode,
      calls_used: newCallsThisMonth,
      calls_remaining: Math.max(0, keyRow.monthly_limit - newCallsThisMonth),
      reset_at: resetAt,
    },
    200
  );
});
