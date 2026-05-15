import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const INACTIVE_DAYS = 14;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const cutoff = new Date(Date.now() - INACTIVE_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const recentWindow = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Find users whose last genie session was 14+ days ago
    const { data: inactiveUsers } = await supabase
      .from("profiles")
      .select(`
        id, email, full_name,
        workspace_profile:workspace_profile(business_name, primary_goal),
        notification_preferences:notification_preferences(email_frequency)
      `)
      .lt("updated_at", cutoff);

    if (!inactiveUsers?.length) {
      return new Response(JSON.stringify({ sent: 0, skipped: 0 }), { status: 200 });
    }

    // Filter out already re-engaged in last 7 days via genie sessions
    const userIds = inactiveUsers.map((u) => u.id);
    const { data: recentSessions } = await supabase
      .from("genie_sessions")
      .select("user_id")
      .in("user_id", userIds)
      .gte("created_at", recentWindow);

    const recentlyActive = new Set((recentSessions || []).map((s) => s.user_id));

    // Don't re-send if already sent this week
    const { data: recentlySent } = await supabase
      .from("email_automation_log")
      .select("user_id")
      .eq("email_type", "reengagement")
      .in("user_id", userIds)
      .gte("sent_at", recentWindow);

    const alreadySentIds = new Set((recentlySent || []).map((r) => r.user_id));

    let sent = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const user of inactiveUsers) {
      const np = Array.isArray(user.notification_preferences) ? user.notification_preferences[0] : user.notification_preferences;
      if (np?.email_frequency === "never") { skipped++; continue; }
      if (recentlyActive.has(user.id)) { skipped++; continue; }
      if (alreadySentIds.has(user.id)) { skipped++; continue; }

      const ws = Array.isArray(user.workspace_profile) ? user.workspace_profile[0] : user.workspace_profile;
      const firstName = user.full_name?.split(" ")[0] || "there";
      const biz = ws?.business_name ? ` at ${ws.business_name}` : "";
      const goal = ws?.primary_goal ? `You mentioned your focus was: <em>${ws.primary_goal}</em>. That's worth revisiting.` : "A lot can change in a fortnight.";

      try {
        await resend.emails.send({
          from: "Andy at Wellness Genius <newsletter@news.wellnessgenius.co.uk>",
          to: user.email,
          subject: `${firstName}, your Wellness Genius insights are waiting`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#0f1f1b;">
              <h2 style="font-size:22px;font-weight:700;">It's been a while${biz}.</h2>
              <p style="font-size:15px;line-height:1.7;color:#2d4a44;">
                ${goal}
              </p>
              <p style="font-size:15px;line-height:1.7;color:#2d4a44;">
                Your Wellness Genie is still ready to help — with retention challenges, pricing decisions, engagement strategy, or whatever's on your mind right now.
              </p>
              <p style="font-size:15px;line-height:1.7;color:#2d4a44;">
                What's the one business question you'd most like answered today?
              </p>
              <a href="https://wellnessgenius.co.uk/genie" style="display:inline-block;background:#16d1a3;color:#06211a;text-decoration:none;font-weight:700;font-size:15px;padding:14px 24px;border-radius:8px;margin-top:8px;">
                Ask Wellness Genie →
              </a>
              <p style="font-size:13px;color:#6b9a8f;margin-top:32px;">
                Andy, Wellness Genius<br/>
                <a href="https://wellnessgenius.co.uk/unsubscribe?email=${encodeURIComponent(user.email)}" style="color:#6b9a8f;">Unsubscribe</a>
              </p>
            </div>
          `,
        });
        await supabase.from("email_automation_log").insert({ user_id: user.id, email_type: "reengagement" });
        sent++;
      } catch (e) {
        errors.push(`${user.email}: ${String(e)}`);
      }
    }

    return new Response(JSON.stringify({ sent, skipped, errors }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("send-reengagement-email error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
