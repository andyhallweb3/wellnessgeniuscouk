import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const GENIE_URL = "https://www.wellnessgenius.co.uk/genie";
const UNSUBSCRIBE_URL = "https://www.wellnessgenius.co.uk/unsubscribe";
const FROM_ADDRESS = "Andy at Wellness Genius <andy@wellnessgenius.co.uk>";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
}

interface WorkspaceProfile {
  business_name: string | null;
  sector: string | null;
  business_size: string | null;
  primary_offer: string | null;
  ai_readiness_band: string | null;
}

interface WorkspaceGoals {
  goals: string[] | null;
}

interface GenieSession {
  mode: string | null;
  messages: unknown[] | null;
}

interface GenieInsight {
  content: string;
}

interface OperatorData {
  profile: Profile;
  workspaceProfile: WorkspaceProfile | null;
  workspaceGoals: WorkspaceGoals | null;
  sessions: GenieSession[];
  insights: GenieInsight[];
}

// ---------------------------------------------------------------------------
// AI body generation via Anthropic
// ---------------------------------------------------------------------------

async function generateEmailBody(data: OperatorData): Promise<string> {
  const { profile, workspaceProfile: wp, workspaceGoals: wg, sessions, insights } = data;

  const firstName = (profile.full_name || "there").split(" ")[0];
  const sessionCount = sessions.length;
  const modes = [...new Set(sessions.map((s) => s.mode).filter(Boolean))] as string[];
  const insightCount = insights.length;
  const recentInsight = insights[0]?.content || "none";

  const prompt = `You are the Wellness Genius AI advisor writing a brief, personal weekly email to a wellness business operator.

OPERATOR CONTEXT:
- Name: ${firstName}
- Business: ${wp?.business_name || "their wellness business"}
- Sector: ${wp?.sector || "wellness"}
- Size: ${wp?.business_size || "unknown"}
- Primary offer: ${wp?.primary_offer || "not specified"}
- AI Readiness band: ${wp?.ai_readiness_band || "not assessed"}
- Goals: ${wg?.goals?.join(", ") || "not specified"}

THIS WEEK'S ACTIVITY:
- Questions asked: ${sessionCount}
- Modes used: ${modes.join(", ") || "general"}
- Insights saved: ${insightCount}
- Recent insight: ${recentInsight}

Write a short, direct weekly email. Rules:
- British English
- No fluff, no "I hope this email finds you well"
- 3 paragraphs max
- Paragraph 1: one sharp observation about their business based on their profile and goals (not generic, make it specific to their sector/size/offer)
- Paragraph 2: based on their recent usage, suggest ONE specific question they should ask the AI advisor this week. Frame it as "This week, try asking: [exact question]" — make it specific to their actual business context
- Paragraph 3: one sentence CTA — direct, not salesy
- Sign off: "Andy, Wellness Genius"

Return ONLY the email body text. No subject line. No HTML. Plain paragraphs only.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const result = await response.json();
    return result.content?.[0]?.text?.trim() || "";
  } finally {
    clearTimeout(timeoutId);
  }
}

// ---------------------------------------------------------------------------
// Subject line (no AI — keep it fast and cheap)
// ---------------------------------------------------------------------------

function buildSubjectLine(sessionCount: number, firstName: string): string {
  const weekStart = new Date();
  // Roll back to Monday of the current week
  const day = weekStart.getDay();
  const diff = day === 0 ? 6 : day - 1;
  weekStart.setDate(weekStart.getDate() - diff);
  const dateStr = weekStart.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

  if (sessionCount > 0) {
    return `Your Wellness Genius insight — w/c ${dateStr}`;
  }
  return `You've not asked yet this week, ${firstName}`;
}

// ---------------------------------------------------------------------------
// HTML email builder
// ---------------------------------------------------------------------------

function buildEmailHtml(firstName: string, aiBody: string, genieUrl: string): string {
  // Split body into paragraphs on double newlines or single newlines
  const paragraphs = aiBody
    .split(/\n{2,}|\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const paragraphHtml = paragraphs
    .map((p) => `<p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.7;">${p}</p>`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wellness Genius — weekly insight</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f5;">
    <tr>
      <td style="padding: 32px 16px;">

        <!-- Card -->
        <table role="presentation" style="max-width: 560px; width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; border-collapse: collapse;">

          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #f3f4f6;">
              <span style="font-size: 18px; font-weight: 700; color: #111827; letter-spacing: -0.02em;">Wellness Genius</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 28px 32px 8px 32px;">
              <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600;">Weekly insight — ${firstName}</p>
              ${paragraphHtml}
            </td>
          </tr>

          <!-- CTA button -->
          <tr>
            <td style="padding: 8px 32px 28px 32px;">
              <table role="presentation" style="border-collapse: collapse;">
                <tr>
                  <td style="border-radius: 8px; background-color: #0f766e;">
                    <a href="${genieUrl}"
                       style="display: inline-block; padding: 12px 24px; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                      Ask your question &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; border-top: 1px solid #f3f4f6; background-color: #f9fafb; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af; line-height: 1.5;">
                You're receiving this because you've used Wellness Genius recently.<br>
                <a href="${UNSUBSCRIBE_URL}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a>
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

// ---------------------------------------------------------------------------
// Fetch per-user data
// ---------------------------------------------------------------------------

async function fetchOperatorData(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<OperatorData | null> {
  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .eq("id", userId)
    .single();

  if (profileError || !profile?.email) {
    console.error(`No profile/email for user ${userId}:`, profileError?.message);
    return null;
  }

  // Fetch workspace profile
  const { data: workspaceProfile } = await supabase
    .from("workspace_profile")
    .select("business_name, sector, business_size, primary_offer, ai_readiness_band")
    .eq("user_id", userId)
    .maybeSingle();

  // Fetch workspace goals
  const { data: workspaceGoals } = await supabase
    .from("workspace_goals")
    .select("goals")
    .eq("user_id", userId)
    .maybeSingle();

  // Fetch last 7 days of genie sessions
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: sessions } = await supabase
    .from("genie_sessions")
    .select("mode, messages")
    .eq("user_id", userId)
    .gte("started_at", sevenDaysAgo.toISOString());

  // Fetch last 3 genie insights
  const { data: insights } = await supabase
    .from("genie_insights")
    .select("content")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(3);

  return {
    profile: profile as Profile,
    workspaceProfile: workspaceProfile ?? null,
    workspaceGoals: workspaceGoals ?? null,
    sessions: (sessions ?? []) as GenieSession[],
    insights: (insights ?? []) as GenieInsight[],
  };
}

// ---------------------------------------------------------------------------
// Resolve which user IDs to send to
// ---------------------------------------------------------------------------

async function resolveEligibleUserIds(
  supabase: ReturnType<typeof createClient>
): Promise<string[]> {
  const eligibleIds = new Set<string>();

  // Arm 1: users with email_enabled = true AND email_frequency = 'weekly_digest'
  const { data: optedIn } = await supabase
    .from("notification_preferences")
    .select("user_id")
    .eq("email_enabled", true)
    .eq("email_frequency", "weekly_digest");

  (optedIn ?? []).forEach((row: { user_id: string }) => eligibleIds.add(row.user_id));

  // Arm 2: active users (genie_sessions in last 30 days) who haven't explicitly opted out
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: activeSessions } = await supabase
    .from("genie_sessions")
    .select("user_id")
    .gte("started_at", thirtyDaysAgo.toISOString());

  const activeUserIds = [...new Set((activeSessions ?? []).map((s: { user_id: string }) => s.user_id))];

  if (activeUserIds.length > 0) {
    // Fetch notification prefs for active users to filter out explicit opt-outs
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("user_id, email_enabled, email_frequency")
      .in("user_id", activeUserIds);

    const optedOutIds = new Set(
      (prefs ?? [])
        .filter((p: { email_enabled: boolean; email_frequency: string }) =>
          p.email_enabled === false || p.email_frequency === "never"
        )
        .map((p: { user_id: string }) => p.user_id)
    );

    activeUserIds.forEach((id) => {
      if (!optedOutIds.has(id)) {
        eligibleIds.add(id);
      }
    });
  }

  return [...eligibleIds];
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Parse optional userId for single-user / test sends
    let body: { userId?: string } = {};
    try {
      body = await req.json();
    } catch {
      // No body is fine — batch mode
    }

    let userIds: string[];

    if (body.userId) {
      console.log(`Single-user mode: ${body.userId}`);
      userIds = [body.userId];
    } else {
      console.log("Batch mode: resolving eligible users…");
      userIds = await resolveEligibleUserIds(supabase);
      console.log(`Found ${userIds.length} eligible users`);
    }

    let sent = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const userId of userIds) {
      try {
        // Fetch all operator data
        const data = await fetchOperatorData(supabase, userId);

        if (!data) {
          skipped++;
          console.log(`Skipped ${userId}: no profile or email`);
          continue;
        }

        const firstName = (data.profile.full_name || "there").split(" ")[0];

        // Generate AI email body (30-second timeout guard built into generateEmailBody)
        let aiBody: string;
        try {
          aiBody = await generateEmailBody(data);
          if (!aiBody) throw new Error("Empty AI response");
        } catch (aiErr) {
          const msg = aiErr instanceof Error ? aiErr.message : String(aiErr);
          console.error(`AI generation failed for ${userId}: ${msg}`);
          errors.push(`${userId}: AI failed — ${msg}`);
          skipped++;
          continue;
        }

        const subjectLine = buildSubjectLine(data.sessions.length, firstName);
        const html = buildEmailHtml(firstName, aiBody, GENIE_URL);

        await resend.emails.send({
          from: FROM_ADDRESS,
          to: [data.profile.email],
          subject: subjectLine,
          html,
          text: aiBody,
        });

        sent++;
        console.log(`Sent to ${data.profile.email} (${userId})`);
      } catch (userErr) {
        const msg = userErr instanceof Error ? userErr.message : String(userErr);
        console.error(`Failed for user ${userId}: ${msg}`);
        errors.push(`${userId}: ${msg}`);
        // Continue to next user — don't abort the batch
      }
    }

    console.log(`Operator nudge complete — sent: ${sent}, skipped: ${skipped}, errors: ${errors.length}`);

    return new Response(
      JSON.stringify({ sent, skipped, errors }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Fatal error in send-operator-nudge:", msg);
    return new Response(
      JSON.stringify({ error: msg }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
