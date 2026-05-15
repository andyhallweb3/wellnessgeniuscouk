/**
 * manage-api-keys — Authenticated endpoint for managing operator API keys
 *
 * Auth: Supabase JWT (standard `Authorization: Bearer <supabase_jwt>`)
 * CORS: restricted to known origins via getCorsHeaders
 *
 * Actions (via ?action= query param):
 *   GET  ?action=list    → list active keys for the authenticated user
 *   POST ?action=create  → generate and store a new API key
 *   DELETE ?action=revoke → soft-delete a key by setting active = false
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

/** Hash a string with SHA-256, return lowercase hex */
async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Generate a cryptographically random hex string of `byteLength` bytes */
function randomHex(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function jsonResponse(
  body: unknown,
  status: number,
  corsHeaders: Record<string, string>
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[manage-api-keys] Missing required environment variables");
    return jsonResponse({ error: "Server configuration error" }, 500, corsHeaders);
  }

  // ── Authenticate via Supabase JWT ─────────────────────────────────────────
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return jsonResponse({ error: "Authentication required" }, 401, corsHeaders);
  }

  const jwt = authHeader.slice(7).trim();

  // User-scoped client — respects RLS
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });

  // Service role client — used for INSERT (bypasses RLS intentionally)
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: { user }, error: authError } = await userClient.auth.getUser(jwt);

  if (authError || !user) {
    console.warn("[manage-api-keys] Auth failed:", authError?.message ?? "no user");
    return jsonResponse({ error: "Invalid or expired session" }, 401, corsHeaders);
  }

  // ── Route by action ───────────────────────────────────────────────────────
  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  // ── LIST ─────────────────────────────────────────────────────────────────
  if (req.method === "GET" && action === "list") {
    const { data, error } = await userClient
      .from("operator_api_keys")
      .select(
        "id, name, tier, key_prefix, monthly_limit, calls_this_month, reset_at, created_at"
      )
      .eq("user_id", user.id)
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[manage-api-keys] List error:", error.message);
      return jsonResponse({ error: "Failed to retrieve API keys" }, 500, corsHeaders);
    }

    return jsonResponse({ keys: data ?? [] }, 200, corsHeaders);
  }

  // ── CREATE ────────────────────────────────────────────────────────────────
  if (req.method === "POST" && action === "create") {
    let body: { name?: unknown; tier?: unknown };
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "Request body must be valid JSON" }, 400, corsHeaders);
    }

    const { name, tier } = body;

    if (typeof name !== "string" || !name.trim()) {
      return jsonResponse(
        { error: 'Missing required field: "name" (string)' },
        400,
        corsHeaders
      );
    }

    if (tier !== "starter" && tier !== "growth") {
      return jsonResponse(
        { error: '"tier" must be "starter" or "growth"' },
        400,
        corsHeaders
      );
    }

    const monthlyLimit = tier === "growth" ? 2000 : 500;

    // Generate key: sk_wg_ + 32 random hex chars = 38 chars total
    const randomPart = randomHex(16); // 16 bytes → 32 hex chars
    const fullKey = `sk_wg_${randomPart}`;
    const keyPrefix = fullKey.slice(0, 12); // "sk_wg_" + first 6 hex chars
    const keyHash = await sha256Hex(fullKey);

    const nextReset = new Date();
    nextReset.setMonth(nextReset.getMonth() + 1);
    nextReset.setDate(1);
    nextReset.setHours(0, 0, 0, 0);

    // Insert via service role to bypass RLS (no INSERT policy exists for user role)
    const { data: inserted, error: insertError } = await adminClient
      .from("operator_api_keys")
      .insert({
        user_id: user.id,
        name: name.trim(),
        key_prefix: keyPrefix,
        key_hash: keyHash,
        tier,
        monthly_limit: monthlyLimit,
        calls_this_month: 0,
        reset_at: nextReset.toISOString(),
        active: true,
      })
      .select("id, name, tier, key_prefix")
      .single();

    if (insertError || !inserted) {
      console.error("[manage-api-keys] Insert error:", insertError?.message);
      return jsonResponse({ error: "Failed to create API key" }, 500, corsHeaders);
    }

    // Return the full key ONCE — it is never stored in plaintext and cannot be retrieved again
    return jsonResponse(
      {
        key: fullKey,
        id: inserted.id,
        name: inserted.name,
        tier: inserted.tier,
        key_prefix: inserted.key_prefix,
      },
      201,
      corsHeaders
    );
  }

  // ── REVOKE ────────────────────────────────────────────────────────────────
  if (req.method === "DELETE" && action === "revoke") {
    let body: { id?: unknown };
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "Request body must be valid JSON" }, 400, corsHeaders);
    }

    const { id } = body;

    if (typeof id !== "string" || !id.trim()) {
      return jsonResponse(
        { error: 'Missing required field: "id" (string)' },
        400,
        corsHeaders
      );
    }

    // Use user client — RLS ensures the user can only update their own rows
    const { error: updateError } = await userClient
      .from("operator_api_keys")
      .update({ active: false })
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("[manage-api-keys] Revoke error:", updateError.message);
      return jsonResponse({ error: "Failed to revoke API key" }, 500, corsHeaders);
    }

    return jsonResponse({ success: true }, 200, corsHeaders);
  }

  // ── Unknown action ────────────────────────────────────────────────────────
  return jsonResponse(
    { error: `Unknown action "${action}". Valid actions: list, create, revoke` },
    400,
    corsHeaders
  );
});
