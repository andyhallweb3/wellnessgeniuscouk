import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Sector-specific suggested questions (rotate weekly) ──────────────────────

const SECTOR_QUESTIONS: Record<string, string[][]> = {
  "Fitness operator": [
    ["Why are members leaving, and what's the fastest way to reduce churn?", "What retention initiative should I run this month?"],
    ["How do I convert more trial members to paid?", "Review my pricing — am I leaving revenue on the table?"],
    ["How can I improve class fill rates without adding cost?", "What's a realistic 90-day member growth plan?"],
    ["Which member segment has the highest LTV, and how do I acquire more of them?", "What's the single biggest lever for reducing churn in a gym my size?"],
  ],
  "Studio/boutique": [
    ["My classes are underbooked — what's the most effective way to fill them?", "Should I add more off-peak slots or raise my prices?"],
    ["How do I reduce no-shows and last-minute cancellations?", "What's the best way to retain members who haven't booked in 3 weeks?"],
    ["How should I structure an intro offer that converts to long-term membership?", "What's my ideal class format mix to maximise revenue per room?"],
    ["How do I compete with the bigger gym that just opened nearby?", "What digital tools should a studio my size be using right now?"],
  ],
  "Hospitality/spa": [
    ["How do I increase treatment add-on spend per guest?", "Design a package that drives repeat bookings from hotel guests."],
    ["What's the best strategy to improve our rebooking rate from 20% to 40%?", "How should I price seasonal packages to smooth revenue?"],
    ["How do I train reception to upsell without it feeling pushy?", "Which spa retail products have the best margin and reorder rate in hospitality?"],
    ["How do I get hotel guests who don't use the spa to try it?", "What wellness experience trends should I be planning for next year?"],
  ],
  "Corporate wellbeing": [
    ["How do I get employees to actually use our wellness programme?", "What are the leading indicators of a thriving corporate wellness programme?"],
    ["How do I make the business case for a bigger wellbeing budget?", "What's the ROI framework I should be presenting to the board?"],
    ["How do I design a wellbeing initiative that reaches remote workers?", "What engagement tactics have the highest participation rates in corporate wellness?"],
    ["How do I segment our employee population to personalise wellbeing offers?", "Which wellbeing metrics matter most to a CHRO?"],
  ],
  default: [
    ["What should I focus on this week to improve retention?", "Where am I most likely leaving revenue on the table?"],
    ["What's the one operational change that would have the biggest impact right now?", "How do I build more recurring revenue into my model?"],
    ["What should my 90-day growth plan look like?", "How do I get more value from my existing customer base?"],
    ["What's the biggest risk to my business this quarter?", "How do I price my offer competitively without a race to the bottom?"],
  ],
};

// ─── KPI formatting ───────────────────────────────────────────────────────────

const KPI_LABELS: Record<string, { label: string; unit: string }> = {
  total_members: { label: "Members", unit: "" },
  monthly_revenue: { label: "Monthly Revenue", unit: "£" },
  retention_rate: { label: "Retention", unit: "%" },
  churn_rate: { label: "Monthly Churn", unit: "%" },
  avg_member_ltv: { label: "Avg LTV", unit: "£" },
  class_fill_rate: { label: "Class Fill Rate", unit: "%" },
  staff_headcount: { label: "Staff", unit: "" },
  nps_score: { label: "NPS", unit: "" },
};

function formatKpi(key: string, value: string): string {
  const meta = KPI_LABELS[key];
  if (!meta) return "";
  const num = parseFloat(value);
  if (isNaN(num)) return "";
  const formatted = meta.unit === "£"
    ? `£${num.toLocaleString("en-GB")}`
    : meta.unit === "%"
    ? `${num}%`
    : num.toLocaleString("en-GB");
  return `<div style="background:#f9fafb;border-radius:8px;padding:12px 16px;text-align:center;">
    <div style="font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">${meta.label}</div>
    <div style="font-size:20px;font-weight:700;color:#0F766E;">${formatted}</div>
  </div>`;
}

// ─── Email generation ─────────────────────────────────────────────────────────

function buildEmail(params: {
  name: string;
  businessName: string;
  sector: string;
  primaryGoal: string;
  kpis: Record<string, string>;
  weekNumber: number;
}): string {
  const { name, businessName, sector, primaryGoal, kpis, weekNumber } = params;

  const questionSet = SECTOR_QUESTIONS[sector] ?? SECTOR_QUESTIONS.default;
  const questions = questionSet[weekNumber % questionSet.length];

  const displayName = name || businessName || "there";
  const displayBusiness = businessName || "your business";

  const kpiEntries = Object.entries(kpis).filter(([, v]) => v && v.trim() !== "");
  const kpiHtml = kpiEntries.length > 0
    ? `<tr><td style="padding:0 30px 24px;">
        <div style="font-size:13px;font-weight:600;color:#374151;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.05em;">Your snapshot</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;">
          ${kpiEntries.slice(0, 4).map(([k, v]) => formatKpi(k, v)).filter(Boolean).join("")}
        </div>
      </td></tr>`
    : `<tr><td style="padding:0 30px 24px;">
        <div style="background:#f0fdf4;border-radius:8px;padding:16px;">
          <p style="margin:0;font-size:13px;color:#166534;">💡 <strong>Quick tip:</strong> Add your KPIs in the <a href="https://wellnessgenius.co.uk/hub?tab=knowledge" style="color:#0F766E;">Knowledge Base</a> and Genie will use them in every session.</p>
        </div>
      </td></tr>`;

  const goalLine = primaryGoal
    ? `<p style="margin:0 0 8px;font-size:14px;color:#374151;">Your current focus: <strong>${primaryGoal}</strong></p>`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" style="width:100%;border-collapse:collapse;">
    <tr>
      <td style="padding:40px 20px;">
        <table role="presentation" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0F766E 0%,#14B8A6 100%);padding:36px 30px;">
              <p style="margin:0 0 4px;color:rgba(255,255,255,0.8);font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Monday briefing</p>
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Good morning, ${displayName}.</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">${displayBusiness} · here's what to work on this week.</p>
            </td>
          </tr>

          <!-- Goal line -->
          ${goalLine ? `<tr><td style="padding:20px 30px 0;">${goalLine}</td></tr>` : ""}

          <!-- KPI snapshot or nudge -->
          ${kpiHtml}

          <!-- Suggested questions -->
          <tr>
            <td style="padding:0 30px 28px;">
              <div style="font-size:13px;font-weight:600;color:#374151;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.05em;">Ask Genie this week</div>
              ${questions.map(q => `
              <a href="https://wellnessgenius.co.uk/genie" style="display:block;background:#f8fafc;border:1px solid #e2e8f0;border-left:3px solid #0F766E;border-radius:8px;padding:14px 16px;margin-bottom:8px;text-decoration:none;color:#1e293b;font-size:14px;line-height:1.5;">
                "${q}"
              </a>`).join("")}
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 30px 32px;text-align:center;">
              <a href="https://wellnessgenius.co.uk/genie"
                 style="display:inline-block;background:linear-gradient(135deg,#0F766E 0%,#14B8A6 100%);color:#ffffff;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
                Open Genie →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 30px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9CA3AF;font-size:12px;text-align:center;">
                Wellness Genius · <a href="https://wellnessgenius.co.uk" style="color:#0F766E;text-decoration:none;">wellnessgenius.co.uk</a> ·
                <a href="https://wellnessgenius.co.uk/hub?tab=settings" style="color:#0F766E;text-decoration:none;">Manage email preferences</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Week number for rotating questions (ISO week)
    const now = new Date();
    const weekNumber = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));

    // Fetch all users who've completed onboarding
    const { data: workspaces, error: wsError } = await supabase
      .from("workspace_profile")
      .select("user_id, business_name, sector")
      .eq("onboarding_completed", true);

    if (wsError) throw wsError;
    if (!workspaces?.length) {
      return new Response(JSON.stringify({ message: "No eligible users", sent: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userIds = workspaces.map(w => w.user_id);

    // Fetch profiles (email + name), goals, and metrics in parallel
    const [profilesRes, goalsRes, metricsRes] = await Promise.all([
      supabase.from("profiles").select("id, email, full_name").in("id", userIds),
      supabase.from("workspace_goals").select("user_id, goals").in("user_id", userIds),
      supabase.from("workspace_metrics").select("user_id, current_values").in("user_id", userIds),
    ]);

    if (profilesRes.error) throw profilesRes.error;

    const profileMap = new Map((profilesRes.data ?? []).map(p => [p.id, p]));
    const goalsMap = new Map((goalsRes.data ?? []).map(g => [g.user_id, g.goals as string[]]));
    const metricsMap = new Map((metricsRes.data ?? []).map(m => [m.user_id, (m.current_values as Record<string, string>) ?? {}]));

    let sent = 0;
    let failed = 0;

    for (const ws of workspaces) {
      const profile = profileMap.get(ws.user_id);
      if (!profile?.email) continue;

      const goals = goalsMap.get(ws.user_id) ?? [];
      const kpis = metricsMap.get(ws.user_id) ?? {};

      const html = buildEmail({
        name: profile.full_name ?? "",
        businessName: ws.business_name ?? "",
        sector: ws.sector ?? "",
        primaryGoal: goals[0] ?? "",
        kpis,
        weekNumber,
      });

      try {
        await resend.emails.send({
          from: "Wellness Genius <insights@wellnessgenius.co.uk>",
          to: [profile.email],
          subject: `Good morning — ${ws.business_name || "your Genie briefing"} for this week`,
          html,
        });
        sent++;
      } catch (e) {
        console.error(`Failed to send to ${profile.email}:`, e);
        failed++;
      }
    }

    console.log(`Business digest: ${sent} sent, ${failed} failed`);

    return new Response(JSON.stringify({ sent, failed, total: workspaces.length }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-business-digest:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
