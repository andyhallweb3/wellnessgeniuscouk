import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } });
  }

  try {
    const { user_id, email, full_name } = await req.json();
    if (!user_id || !email) return new Response(JSON.stringify({ error: "Missing user_id or email" }), { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: workspace } = await supabase
      .from("workspace_profile")
      .select("business_name, business_type, primary_goal")
      .eq("user_id", user_id)
      .maybeSingle();

    const firstName = full_name?.split(" ")[0] || "there";
    const businessContext = workspace?.business_name ? ` at ${workspace.business_name}` : "";

    await resend.emails.send({
      from: "Andy at Wellness Genius <andy@wellnessgenius.co.uk>",
      to: email,
      subject: "Welcome to Wellness Genius — let's get you started",
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#0f1f1b;">
          <img src="https://wellnessgenius.co.uk/og-image.png" alt="Wellness Genius" style="width:100%;border-radius:8px;margin-bottom:24px;" />
          <h1 style="font-size:24px;font-weight:700;margin-bottom:8px;">Welcome, ${firstName}.</h1>
          <p style="font-size:16px;line-height:1.6;color:#2d4a44;">
            You've just got access to the AI business intelligence platform built specifically for fitness and wellness operators${businessContext}.
          </p>
          <p style="font-size:16px;line-height:1.6;color:#2d4a44;">
            Here's where to start:
          </p>
          <ol style="font-size:15px;line-height:1.8;color:#2d4a44;padding-left:20px;">
            <li><strong>Run your AI Readiness Assessment</strong> — get a scored breakdown of where your business stands today</li>
            <li><strong>Ask Wellness Genie anything</strong> — retention rates, pricing strategy, member engagement — it knows your context</li>
            <li><strong>Set your workspace goals</strong> — the more context you give, the sharper the advice</li>
          </ol>
          <a href="https://wellnessgenius.co.uk/hub" style="display:inline-block;background:#16d1a3;color:#06211a;text-decoration:none;font-weight:700;font-size:15px;padding:14px 24px;border-radius:8px;margin-top:16px;">
            Go to your dashboard →
          </a>
          <p style="font-size:13px;color:#6b9a8f;margin-top:32px;">
            Questions? Reply to this email — I read every one.<br/>
            Andy, Wellness Genius
          </p>
        </div>
      `,
    });

    await supabase.from("email_automation_log").insert({ user_id, email_type: "welcome" });

    return new Response(JSON.stringify({ sent: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("send-welcome-email error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
