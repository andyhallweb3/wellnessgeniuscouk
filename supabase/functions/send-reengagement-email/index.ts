import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const FROM = "Andy at Wellness Genius <newsletter@news.wellnessgenius.co.uk>";
const BATCH_SIZE = 100;

function buildHtml(firstName: string, email: string): string {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#0f1f1b;">
      <h2 style="font-size:22px;font-weight:700;">It's been a while, ${firstName}.</h2>
      <p style="font-size:15px;line-height:1.7;color:#2d4a44;">
        A lot can change in a few months — and there's plenty happening in the wellness and fitness industry right now.
      </p>
      <p style="font-size:15px;line-height:1.7;color:#2d4a44;">
        Your Wellness Genie is ready to help — with retention challenges, pricing decisions, engagement strategy, or whatever's on your mind right now.
      </p>
      <p style="font-size:15px;line-height:1.7;color:#2d4a44;">
        What's the one business question you'd most like answered today?
      </p>
      <a href="https://wellnessgenius.co.uk/genie" style="display:inline-block;background:#16d1a3;color:#06211a;text-decoration:none;font-weight:700;font-size:15px;padding:14px 24px;border-radius:8px;margin-top:8px;">
        Ask Wellness Genie →
      </a>
      <p style="font-size:13px;color:#6b9a8f;margin-top:32px;">
        Andy, Wellness Genius<br/>
        <a href="https://wellnessgenius.co.uk/unsubscribe?email=${encodeURIComponent(email)}" style="color:#6b9a8f;">Unsubscribe</a>
      </p>
    </div>
  `;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } });
  }

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const force = body.force === true;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const recentWindow = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch all active, non-bounced subscribers (paginate past PostgREST 1000-row limit)
    const subs: { email: string; name: string | null }[] = [];
    let subsPage = 0;
    const PAGE = 1000;
    while (true) {
      const { data, error: subsErr } = await supabase
        .from("newsletter_subscribers")
        .select("email, name")
        .eq("is_active", true)
        .eq("bounced", false)
        .range(subsPage * PAGE, (subsPage + 1) * PAGE - 1);
      if (subsErr) return new Response(JSON.stringify({ error: subsErr.message }), { status: 500 });
      if (!data?.length) break;
      subs.push(...data);
      if (data.length < PAGE) break;
      subsPage++;
    }

    if (!subs.length) return new Response(JSON.stringify({ sent: 0, skipped: 0, reason: "no subscribers" }), { status: 200 });

    // Check who was already sent a re-engagement email this week (skip when force=true)
    let alreadySentEmails = new Set<string>();
    if (!force) {
      const sentRows: { email?: string }[] = [];
      let logPage = 0;
      while (true) {
        const { data } = await supabase
          .from("email_automation_log")
          .select("email")
          .eq("email_type", "reengagement")
          .gte("sent_at", recentWindow)
          .range(logPage * PAGE, (logPage + 1) * PAGE - 1);
        if (!data?.length) break;
        sentRows.push(...data);
        if (data.length < PAGE) break;
        logPage++;
      }
      alreadySentEmails = new Set(sentRows.map(r => r.email).filter(Boolean) as string[]);
    }

    const toSend = subs.filter(s => !alreadySentEmails.has(s.email));
    if (!toSend.length) {
      return new Response(JSON.stringify({ sent: 0, skipped: subs.length, reason: "all sent recently" }), { status: 200 });
    }

    let sent = 0;
    const skipped = subs.length - toSend.length;
    const errors: string[] = [];

    // Send in batches of BATCH_SIZE
    for (let i = 0; i < toSend.length; i += BATCH_SIZE) {
      const batch = toSend.slice(i, i + BATCH_SIZE);
      const payload = batch.map(s => {
        const firstName = s.name?.split(" ")[0] || "there";
        return {
          from: FROM,
          to: s.email,
          subject: `${firstName}, your Wellness Genius insights are waiting`,
          html: buildHtml(firstName, s.email),
        };
      });

      try {
        const res = await fetch("https://api.resend.com/emails/batch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.text();
          errors.push(`Batch ${i / BATCH_SIZE + 1}: ${err}`);
          continue;
        }

        sent += batch.length;

        await supabase.from("email_automation_log").insert(
          batch.map(s => ({ email_type: "reengagement", email: s.email }))
        );

        if (i + BATCH_SIZE < toSend.length) {
          await new Promise(r => setTimeout(r, 300));
        }
      } catch (e) {
        errors.push(`Batch ${i / BATCH_SIZE + 1}: ${String(e)}`);
      }
    }

    return new Response(
      JSON.stringify({ sent, skipped, total: subs.length, errors }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-reengagement-email error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
