import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LeaderboardEntry {
  id: string;
  user_id: string;
  score_band: string;
  streak_weeks: number;
  business_type: string | null;
  size_band: string | null;
  last_updated: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
}

interface DigestData {
  email: string;
  name: string;
  scoreBand: string;
  streakWeeks: number;
  businessType: string | null;
  sizeBand: string | null;
  positionInSegment: number;
  totalInSegment: number;
  streakMessage: string;
  motivationalMessage: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting weekly digest generation...");

    // Get all opted-in leaderboard entries
    const { data: entries, error: entriesError } = await supabase
      .from("leaderboard_entries")
      .select("*")
      .eq("opted_in", true);

    if (entriesError) {
      console.error("Error fetching leaderboard entries:", entriesError);
      throw entriesError;
    }

    if (!entries || entries.length === 0) {
      console.log("No opted-in users found");
      return new Response(JSON.stringify({ message: "No opted-in users", sent: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${entries.length} opted-in users`);

    // Get user profiles for emails
    const userIds = entries.map((e: LeaderboardEntry) => e.user_id);
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .in("id", userIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    // Create a map of user_id to profile
    const profileMap = new Map<string, UserProfile>();
    profiles?.forEach((p: UserProfile) => profileMap.set(p.id, p));

    // Calculate segment positions
    const segmentCounts = new Map<string, number>();
    const segmentPositions = new Map<string, number>();
    
    // Group by segment and score band for positioning
    entries.forEach((entry: LeaderboardEntry) => {
      const segment = `${entry.business_type || 'all'}_${entry.size_band || 'all'}_${entry.score_band}`;
      segmentCounts.set(segment, (segmentCounts.get(segment) || 0) + 1);
    });

    // Sort entries by streak for positioning within segment
    const sortedEntries = [...entries].sort((a: LeaderboardEntry, b: LeaderboardEntry) => 
      (b.streak_weeks || 0) - (a.streak_weeks || 0)
    );

    const positionTracker = new Map<string, number>();
    sortedEntries.forEach((entry: LeaderboardEntry) => {
      const segment = `${entry.business_type || 'all'}_${entry.size_band || 'all'}_${entry.score_band}`;
      const currentPos = (positionTracker.get(segment) || 0) + 1;
      positionTracker.set(segment, currentPos);
      segmentPositions.set(entry.id, currentPos);
    });

    // Prepare digest data for each user
    const digestsToSend: DigestData[] = [];

    for (const entry of entries as LeaderboardEntry[]) {
      const profile = profileMap.get(entry.user_id);
      if (!profile?.email) {
        console.log(`No email found for user ${entry.user_id}`);
        continue;
      }

      const segment = `${entry.business_type || 'all'}_${entry.size_band || 'all'}_${entry.score_band}`;
      const position = segmentPositions.get(entry.id) || 1;
      const total = segmentCounts.get(segment) || 1;

      const streakMessage = getStreakMessage(entry.streak_weeks || 0);
      const motivationalMessage = getMotivationalMessage(entry.score_band, entry.streak_weeks || 0);

      digestsToSend.push({
        email: profile.email,
        name: profile.full_name || "Wellness Leader",
        scoreBand: entry.score_band,
        streakWeeks: entry.streak_weeks || 0,
        businessType: entry.business_type,
        sizeBand: entry.size_band,
        positionInSegment: position,
        totalInSegment: total,
        streakMessage,
        motivationalMessage,
      });
    }

    console.log(`Sending ${digestsToSend.length} digest emails...`);

    // Send emails
    let successCount = 0;
    let errorCount = 0;

    for (const digest of digestsToSend) {
      try {
        const emailHtml = generateDigestEmail(digest);
        
        await resend.emails.send({
          from: "Wellness Genius <insights@wellnessgenius.ai>",
          to: [digest.email],
          subject: `📊 Your Weekly Genie Update: ${digest.streakWeeks} Week Streak!`,
          html: emailHtml,
        });

        successCount++;
        console.log(`Email sent to ${digest.email}`);
      } catch (emailError) {
        errorCount++;
        console.error(`Failed to send email to ${digest.email}:`, emailError);
      }
    }

    console.log(`Weekly digest complete: ${successCount} sent, ${errorCount} failed`);

    return new Response(
      JSON.stringify({ 
        message: "Weekly digest sent", 
        sent: successCount, 
        failed: errorCount,
        total: digestsToSend.length
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    console.error("Error in send-weekly-digest:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

function getStreakMessage(weeks: number): string {
  if (weeks === 0) return "Start your streak this week!";
  if (weeks === 1) return "🔥 1 week streak started!";
  if (weeks < 4) return `🔥 ${weeks} week streak! Keep it up!`;
  if (weeks < 8) return `🔥🔥 ${weeks} weeks! Bronze momentum unlocked!`;
  if (weeks < 12) return `🔥🔥🔥 ${weeks} weeks! Silver momentum!`;
  return `🔥🔥🔥🔥 ${weeks} weeks! You're on fire!`;
}

function getMotivationalMessage(scoreBand: string, streakWeeks: number): string {
  const messages: Record<string, string[]> = {
    strong: [
      "You're in the top tier! Keep leveraging AI to stay ahead.",
      "Your consistency is paying off. Consider sharing insights with peers.",
      "Strong operators like you set the pace for the industry.",
    ],
    growing: [
      "You're making great progress! A few more wins and you'll hit 'Strong'.",
      "Your dedication to improvement is showing in the data.",
      "Keep asking strategic questions - you're building real momentum.",
    ],
    building: [
      "Every journey starts somewhere. You're building a solid foundation.",
      "Focus on one key metric this week to accelerate progress.",
      "The best time to start was yesterday. The second best time is now.",
    ],
  };

  const bandMessages = messages[scoreBand] || messages.building;
  const index = streakWeeks % bandMessages.length;
  return bandMessages[index];
}

function generateDigestEmail(digest: DigestData): string {
  const scoreBandColors: Record<string, string> = {
    strong: "#10B981",
    growing: "#F59E0B",
    building: "#6366F1",
  };

  const scoreBandColor = scoreBandColors[digest.scoreBand] || "#6366F1";
  const scoreBandLabel = digest.scoreBand.charAt(0).toUpperCase() + digest.scoreBand.slice(1);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Weekly Genie Update</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0F766E 0%, #14B8A6 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                📊 Weekly Genie Update
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                Hey ${digest.name}, here's your progress this week
              </p>
            </td>
          </tr>

          <!-- Streak Section -->
          <tr>
            <td style="padding: 30px;">
              <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <div style="font-size: 48px; margin-bottom: 8px;">🔥</div>
                <div style="font-size: 36px; font-weight: 800; color: #92400E;">
                  ${digest.streakWeeks} Week${digest.streakWeeks !== 1 ? 's' : ''}
                </div>
                <div style="color: #B45309; font-size: 14px; margin-top: 4px;">
                  ${digest.streakMessage}
                </div>
              </div>

              <!-- Score Band -->
              <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <div>
                    <div style="font-size: 12px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em;">
                      Genie Score Band
                    </div>
                    <div style="font-size: 24px; font-weight: 700; color: ${scoreBandColor}; margin-top: 4px;">
                      ${scoreBandLabel}
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 12px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em;">
                      Position in Segment
                    </div>
                    <div style="font-size: 24px; font-weight: 700; color: #1F2937; margin-top: 4px;">
                      #${digest.positionInSegment} <span style="font-size: 14px; color: #9CA3AF;">of ${digest.totalInSegment}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Segment Info -->
              ${digest.businessType || digest.sizeBand ? `
              <div style="background-color: #f0fdf4; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <div style="font-size: 12px; color: #166534; margin-bottom: 8px;">Your Segment</div>
                <div style="display: flex; gap: 12px;">
                  ${digest.businessType ? `<span style="background-color: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 13px;">${formatBusinessType(digest.businessType)}</span>` : ''}
                  ${digest.sizeBand ? `<span style="background-color: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 13px;">${formatSizeBand(digest.sizeBand)}</span>` : ''}
                </div>
              </div>
              ` : ''}

              <!-- Motivational Message -->
              <div style="border-left: 4px solid ${scoreBandColor}; padding-left: 16px; margin-bottom: 24px;">
                <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
                  "${digest.motivationalMessage}"
                </p>
              </div>

              <!-- CTA -->
              <div style="text-align: center; margin-top: 32px;">
                <a href="https://wellnessgenius.ai/genie" 
                   style="display: inline-block; background: linear-gradient(135deg, #0F766E 0%, #14B8A6 100%); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
                  Continue Your Streak →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6B7280; font-size: 13px;">
                You're receiving this because you opted into the Wellness Genius Leaderboard.
              </p>
              <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                <a href="https://wellnessgenius.ai/genie" style="color: #0F766E; text-decoration: none;">Manage preferences</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function formatBusinessType(type: string): string {
  const labels: Record<string, string> = {
    gym: "Gym/Fitness",
    app: "Wellness App",
    hospitality: "Spa/Hospitality",
    corporate: "Corporate Wellness",
    studio: "Boutique Studio",
    platform: "Platform",
    coaching: "Coaching/PT",
    retreat: "Retreat",
  };
  return labels[type] || type;
}

function formatSizeBand(band: string): string {
  const labels: Record<string, string> = {
    startup: "Pre-revenue",
    small: "Under £100k",
    growing: "£100k-£500k",
    established: "£500k-£2m",
    scaling: "£2m-£10m",
    enterprise: "£10m+",
  };
  return labels[band] || band;
}

serve(handler);
