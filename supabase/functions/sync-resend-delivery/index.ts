import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type DeliveryAgg = { count: number; lastDelivered: string };

function waitUntil(promise: Promise<unknown>) {
  // EdgeRuntime.waitUntil is available in Supabase Edge runtime
  // Fall back to awaiting (useful for local / tests).
  // deno-lint-ignore no-explicit-any
  const er = (globalThis as any).EdgeRuntime;
  if (er?.waitUntil) {
    er.waitUntil(promise);
    return;
  }
  // eslint-disable-next-line no-console
  console.warn("EdgeRuntime.waitUntil not available; running sync inline");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startedAt = new Date().toISOString();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin auth via JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (roleError) {
      console.error("[sync-resend-delivery] has_role error", roleError);
      return new Response(JSON.stringify({ error: "Role check failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden: Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[sync-resend-delivery] Accepted sync request", { startedAt, userId: user.id });

    const backgroundTask = async () => {
      const t0 = Date.now();
      console.log("[sync-resend-delivery] Background sync started", { startedAt });

      const deliveryCounts: Record<string, DeliveryAgg> = {};

      // Paginate through newsletter_send_recipients to avoid loading everything at once.
      const pageSize = 1000;
      let from = 0;
      let totalRows = 0;

      while (true) {
        const { data, error } = await supabase
          .from("newsletter_send_recipients")
          .select("email, sent_at")
          .eq("status", "sent")
          .order("sent_at", { ascending: false })
          .range(from, from + pageSize - 1);

        if (error) {
          console.error("[sync-resend-delivery] Error fetching recipients page", { from, error });
          throw error;
        }

        if (!data || data.length === 0) break;

        totalRows += data.length;

        for (const row of data) {
          const emailLower = row.email.toLowerCase();
          const sentAt = row.sent_at as string;

          const existing = deliveryCounts[emailLower];
          if (!existing) {
            deliveryCounts[emailLower] = { count: 1, lastDelivered: sentAt };
            continue;
          }

          existing.count += 1;
          if (new Date(sentAt) > new Date(existing.lastDelivered)) {
            existing.lastDelivered = sentAt;
          }
        }

        from += pageSize;

        // Safety stop to prevent runaway jobs
        if (from >= 200_000) {
          console.warn("[sync-resend-delivery] Safety stop hit (200k rows)");
          break;
        }
      }

      const emails = Object.keys(deliveryCounts);
      console.log("[sync-resend-delivery] Aggregated recipients", {
        totalRows,
        uniqueEmails: emails.length,
      });

      // Concurrency-limited update pool
      const concurrency = 15;
      let idx = 0;
      let updated = 0;
      let failed = 0;

      const worker = async () => {
        while (idx < emails.length) {
          const email = emails[idx++];
          const agg = deliveryCounts[email];

          const { error } = await supabase
            .from("newsletter_subscribers")
            .update({
              delivery_count: agg.count,
              last_delivered_at: agg.lastDelivered,
            })
            .eq("email", email);

          if (error) {
            failed++;
            console.error("[sync-resend-delivery] Update failed", { email, error });
          } else {
            updated++;
          }
        }
      };

      await Promise.all(Array.from({ length: concurrency }, () => worker()));

      console.log("[sync-resend-delivery] Background sync finished", {
        totalRows,
        uniqueEmails: emails.length,
        updated,
        failed,
        ms: Date.now() - t0,
      });
    };

    // Run async in background so the UI doesn't time out.
    waitUntil(backgroundTask());

    return new Response(
      JSON.stringify({
        started: true,
        message: "Sync started in the background. Refresh subscribers in a minute.",
        started_at: startedAt,
      }),
      { status: 202, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[sync-resend-delivery] Handler error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
