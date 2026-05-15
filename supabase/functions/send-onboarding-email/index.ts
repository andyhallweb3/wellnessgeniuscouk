import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const DAYS = [1, 3, 7];

function emailForDay(day: number, firstName: string, businessName: string | null) {
  const biz = businessName ? ` for ${businessName}` : "";
  if (day === 1) return {
    subject: "One thing to do today on Wellness Genius",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#0f1f1b;">
        <h2 style="font-size:22px;font-weight:700;">Hi ${firstName} — one quick thing.</h2>
        <p style="font-size:15px;line-height:1.7;color:#2d4a44;">
          The fastest way to get value from Wellness Genius is to run your <strong>AI Readiness Assessment${biz}</strong>. It takes 8 minutes and gives you a scored breakdown of where your business stands — retention, engagement, revenue, and more.
        </p>
        <p style="font-size:15px;line-height:1.7;color:#2d4a44;">
          Most operators find at least one immediate quick win they hadn't spotted.
        </p>
        <a href="https://wellnessgenius.co.uk/hub/ai-readiness" style="display:inline-block;background:#16d1a3;color:#06211a;text-decoration:none;font-weight:700;font-size:15px;padding:14px 24px;border-radius:8px;margin-top:8px;">
          Start your assessment →
        </a>
        <p style="font-size:13px;color:#6b9a8f;margin-top:32px;">Andy, Wellness Genius</p>
      </div>
    `,
  };
  if (day === 3) return {
    subject: "Have you tried asking Wellness Genie yet?",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#0f1f1b;">
        <h2 style="font-size:22px;font-weight:700;">The question most operators wish they'd asked sooner.</h2>
        <p style="font-size:15px;line-height:1.7;color:#2d4a44;">
          Wellness Genie isn't a generic chatbot. It knows your business context${biz} and gives you specific, commercially grounded answers — not generic advice.
        </p>
        <p style="font-size:15px;line-height:1.7;color:#2d4a44;">
          Try asking it: <em>"What's the most effective way to reduce member churn in the next 90 days?"</em>
        </p>
        <a href="https://wellnessgenius.co.uk/hub/ai-coach" style="display:inline-block;background:#16d1a3;color:#06211a;text-decoration:none;font-weight:700;font-size:15px;padding:14px 24px;border-radius:8px;margin-top:8px;">
          Ask Wellness Genie →
        </a>
        <p style="font-size:13px;color:#6b9a8f;margin-top:32px;">Andy, Wellness Genius</p>
      </div>
    `,
  };
  return {
    subject: "Your first week with Wellness Genius — what's next",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#0f1f1b;">
        <h2 style="font-size:22px;font-weight:700;">A week in${biz ? " — how's it going" + biz + "?" : "."}</h2>
        <p style="font-size:15px;line-height:1.7;color:#2d4a44;">
          By now you've had a chance to explore. The operators who get the most from Wellness Genius tend to do three things consistently:
        </p>
        <ul style="font-size:15px;line-height:1.9;color:#2d4a44;padding-left:20px;">
          <li>Ask Wellness Genie specific questions about their actual numbers</li>
          <li>Use the diagnostic tools before making major decisions</li>
          <li>Check in weekly — the AI adapts to your business over time</li>
        </ul>
        <p style="font-size:15px;line-height:1.7;color:#2d4a44;">
          If you want sharper, more personalised insights — add more context to your workspace profile.
        </p>
        <a href="https://wellnessgenius.co.uk/hub" style="display:inline-block;background:#16d1a3;color:#06211a;text-decoration:none;font-weight:700;font-size:15px;padding:14px 24px;border-radius:8px;margin-top:8px;">
          Back to your dashboard →
        </a>
        <p style="font-size:13px;color:#6b9a8f;margin-top:32px;">Andy, Wellness Genius</p>
      </div>
    `,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const sent: string[] = [];
    const errors: string[] = [];

    for (const day of DAYS) {
      const start = new Date(Date.now() - (day * 24 * 60 * 60 * 1000) - (2 * 60 * 60 * 1000));
      const end = new Date(Date.now() - (day * 24 * 60 * 60 * 1000) + (2 * 60 * 60 * 1000));

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, full_name, created_at")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());

      if (!profiles?.length) continue;

      const emailType = `onboarding_d${day}`;

      const { data: alreadySent } = await supabase
        .from("email_automation_log")
        .select("user_id")
        .eq("email_type", emailType)
        .in("user_id", profiles.map((p) => p.id));

      const sentIds = new Set((alreadySent || []).map((r) => r.user_id));

      for (const profile of profiles) {
        if (sentIds.has(profile.id)) continue;

        const { data: np } = await supabase
          .from("notification_preferences")
          .select("email_frequency")
          .eq("user_id", profile.id)
          .maybeSingle();

        if (np?.email_frequency === "never") continue;

        const { data: workspace } = await supabase
          .from("workspace_profile")
          .select("business_name")
          .eq("user_id", profile.id)
          .maybeSingle();

        const firstName = profile.full_name?.split(" ")[0] || "there";
        const { subject, html } = emailForDay(day, firstName, workspace?.business_name ?? null);

        try {
          await resend.emails.send({ from: "Andy at Wellness Genius <andy@wellnessgenius.co.uk>", to: profile.email, subject, html });
          await supabase.from("email_automation_log").insert({ user_id: profile.id, email_type: emailType });
          sent.push(`${profile.email} (day ${day})`);
        } catch (e) {
          errors.push(`${profile.email}: ${String(e)}`);
        }
      }
    }

    return new Response(JSON.stringify({ sent: sent.length, details: sent, errors }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("send-onboarding-email error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
