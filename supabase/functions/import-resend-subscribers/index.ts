import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-newsletter-secret",
};

interface ResendAudience {
  id: string;
  name: string;
}

interface ResendContact {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  unsubscribed?: boolean;
}

type ImportContact = {
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  name?: string | null;
  unsubscribed?: boolean;
};

async function fetchAudiences(apiKey: string): Promise<ResendAudience[]> {
  const res = await fetch("https://api.resend.com/audiences", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch audiences: ${res.status}`);
  const payload = await res.json();
  return (payload.data || []) as ResendAudience[];
}

async function fetchAudienceContacts(apiKey: string, audienceId: string): Promise<ResendContact[]> {
  const all: ResendContact[] = [];
  let after: string | undefined;

  // Resend returns has_more + data; keep requesting until exhausted.
  for (let i = 0; i < 100; i++) {
    const url = new URL(`https://api.resend.com/audiences/${audienceId}/contacts`);
    if (after) url.searchParams.set("after", after);
    url.searchParams.set("limit", "100");

    let res: Response | null = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (res.ok) break;
      if (res.status !== 429) break;
      const waitMs = 500 * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
    if (!res || !res.ok) throw new Error(`Failed to fetch contacts for ${audienceId}: ${res?.status ?? "no_response"}`);

    const payload = await res.json();
    const contacts = (payload.data || []) as ResendContact[];
    all.push(...contacts);

    if (!payload.has_more || contacts.length === 0) break;
    after = contacts[contacts.length - 1]?.id;
    if (!after) break;
  }

  return all;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const automationSecret = Deno.env.get("NEWSLETTER_AUTOMATION_SECRET") || "";
    const providedSecret = req.headers.get("x-newsletter-secret") || "";
    if (!automationSecret || providedSecret !== automationSecret) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceRole) {
      throw new Error("Missing required secrets");
    }

    const body = await req.json().catch(() => ({}));
    const providedContacts: ImportContact[] | null = Array.isArray(body.contacts) ? body.contacts : null;
    const audienceId = typeof body.audienceId === "string" ? body.audienceId.trim() : "";
    const source = typeof body.source === "string" && body.source.trim() ? body.source.trim() : "resend-import";

    const supabase = createClient(supabaseUrl, supabaseServiceRole);

    const byEmail = new Map<string, { email: string; name: string | null; is_active: boolean; source: string }>();
    let totalContacts = 0;

    // Path A: import JSON contacts provided by caller (CSV upload, etc.)
    if (providedContacts) {
      if (providedContacts.length > 10_000) throw new Error("Too many contacts in one request (max 10,000)");
      totalContacts = providedContacts.length;

      for (const c of providedContacts) {
        const email = (c.email || "").trim().toLowerCase();
        if (!email) continue;
        const fullName =
          (typeof c.name === "string" && c.name.trim())
            ? c.name.trim()
            : [c.first_name || "", c.last_name || ""].join(" ").trim() || null;

        byEmail.set(email, {
          email,
          name: fullName,
          is_active: !c.unsubscribed,
          source,
        });
      }
    } else {
      // Path B: import directly from Resend API
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      if (!resendApiKey) throw new Error("Missing RESEND_API_KEY");

      let audienceIds: string[] = [];
      if (audienceId) {
        audienceIds = [audienceId];
      } else {
        const audiences = await fetchAudiences(resendApiKey);
        audienceIds = audiences.map((a) => a.id);
      }

      for (const id of audienceIds) {
        const contacts = await fetchAudienceContacts(resendApiKey, id);
        totalContacts += contacts.length;
        for (const c of contacts) {
          const email = (c.email || "").trim().toLowerCase();
          if (!email) continue;
          const fullName = [c.first_name || "", c.last_name || ""].join(" ").trim() || null;
          byEmail.set(email, {
            email,
            name: fullName,
            is_active: !c.unsubscribed,
            source,
          });
        }
      }
    }

    const rows = Array.from(byEmail.values());
    if (rows.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          imported: 0,
          contactsScanned: totalContacts,
          message: providedContacts ? "No valid contacts in payload" : "No contacts found in selected Resend audiences",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const chunkSize = 500;
    let imported = 0;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const { error } = await supabase.from("newsletter_subscribers").upsert(chunk, {
        onConflict: "email",
      });
      if (error) throw new Error(`Upsert failed: ${error.message}`);
      imported += chunk.length;
    }

    return new Response(
      JSON.stringify({
        success: true,
        mode: providedContacts ? "contacts" : "resend",
        imported,
        uniqueContacts: rows.length,
        contactsScanned: totalContacts,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
