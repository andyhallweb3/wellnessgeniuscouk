import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getCorsHeaders, corsHeaders } from "../_shared/cors.ts";

interface BusinessMemory {
  id: string;
  user_id: string;
  business_name: string | null;
  business_type: string | null;
  primary_goal: string | null;
  biggest_challenge: string | null;
  team_size: string | null;
  annual_revenue_band: string | null;
  known_weak_spots: string[] | null;
  key_metrics: string[] | null;
}

interface GeneratedNotification {
  type: "alert" | "insight" | "reminder" | "nudge";
  priority: "high" | "medium" | "low";
  title: string;
  message: string;
  trigger_reason: string;
}

const NOTIFICATION_PROMPT = `You are a proactive business advisor analyzing a wellness business operator's profile to generate timely, relevant notifications.

Based on the business context provided, generate 0-3 notifications that would be genuinely helpful RIGHT NOW.

NOTIFICATION TYPES:
- alert: Urgent items requiring immediate attention (e.g., "Your team size suggests you may be understaffed for peak season")
- insight: Strategic observations based on their context (e.g., "Businesses like yours typically see 30% revenue from secondary services")
- reminder: Follow-up on goals/challenges they mentioned (e.g., "You mentioned retention as a challenge - have you reviewed member feedback this week?")
- nudge: Gentle prompts for good business habits (e.g., "Good time to review your Q4 performance metrics")

RULES:
1. Only generate notifications that are SPECIFIC to their business context
2. Never generic advice - must reference their actual data
3. High priority = affects revenue or team immediately
4. Medium priority = strategic importance
5. Low priority = nice to know/habit building
6. If their profile is sparse, generate fewer or no notifications
7. Consider the current date/time for seasonal relevance

Current date: ${new Date().toISOString().split('T')[0]}
Current month: ${new Date().toLocaleString('en-US', { month: 'long' })}

Respond with a JSON array of notifications (can be empty):
[
  {
    "type": "alert|insight|reminder|nudge",
    "priority": "high|medium|low",
    "title": "Short title (max 60 chars)",
    "message": "Detailed message with specific context (max 200 chars)",
    "trigger_reason": "What in their profile triggered this"
  }
]`;

async function generateNotificationsForUser(
  memory: BusinessMemory,
  apiKey: string
): Promise<GeneratedNotification[]> {
  const contextSummary = `
BUSINESS PROFILE:
- Name: ${memory.business_name || "Not provided"}
- Type: ${memory.business_type || "Not provided"}
- Team Size: ${memory.team_size || "Not provided"}
- Revenue Band: ${memory.annual_revenue_band || "Not provided"}
- Primary Goal: ${memory.primary_goal || "Not provided"}
- Biggest Challenge: ${memory.biggest_challenge || "Not provided"}
- Known Weak Spots: ${memory.known_weak_spots?.join(", ") || "None listed"}
- Key Metrics Tracked: ${memory.key_metrics?.join(", ") || "None listed"}
`;

  try {
    const response = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-5-mini",
        messages: [
          { role: "system", content: NOTIFICATION_PROMPT },
          { role: "user", content: contextSummary },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.error("AI API error:", await response.text());
      return [];
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    
    // Parse JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    
    const notifications = JSON.parse(jsonMatch[0]) as GeneratedNotification[];
    return notifications.filter(n => 
      n.type && n.priority && n.title && n.message && n.trigger_reason
    );
  } catch (error) {
    console.error("Error generating notifications:", error);
    return [];
  }
}

async function sendNotificationEmail(
  resend: Resend,
  email: string,
  notifications: GeneratedNotification[],
  businessName: string
): Promise<boolean> {
  const highPriorityNotifications = notifications.filter(n => n.priority === "high");
  
  if (highPriorityNotifications.length === 0) {
    return false; // Only email for high priority
  }

  try {
    const notificationsList = highPriorityNotifications
      .map(n => `
        <div style="margin-bottom: 16px; padding: 16px; background: #f8f9fa; border-left: 4px solid #dc3545; border-radius: 4px;">
          <h3 style="margin: 0 0 8px 0; color: #333;">${n.title}</h3>
          <p style="margin: 0; color: #666;">${n.message}</p>
        </div>
      `)
      .join("");

    await resend.emails.send({
      from: "Wellness Genie <notifications@resend.dev>",
      to: [email],
      subject: `🔔 Action Required: ${highPriorityNotifications[0].title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #0d9488, #14b8a6); padding: 24px; color: white;">
              <h1 style="margin: 0; font-size: 24px;">🧞 Wellness Genie</h1>
              <p style="margin: 8px 0 0 0; opacity: 0.9;">Alert for ${businessName || "Your Business"}</p>
            </div>
            <div style="padding: 24px;">
              <p style="color: #333; margin-bottom: 20px;">Your Genie spotted something that needs your attention:</p>
              ${notificationsList}
              <p style="margin-top: 24px;">
                <a href="${Deno.env.get("SITE_URL") || "https://wellnessgenius.co.uk"}/genie" 
                   style="display: inline-block; background: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                  Open Genie Dashboard
                </a>
              </p>
            </div>
            <div style="padding: 16px 24px; background: #f8f9fa; color: #666; font-size: 12px;">
              <p style="margin: 0;">You're receiving this because you have a Wellness Genie account.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

// Generate streak warning email HTML
function generateStreakWarningEmail(
  firstName: string,
  streakWeeks: number,
  daysRemaining: number,
  businessName: string | null
): string {
  const urgencyColor = daysRemaining <= 1 ? "#ef4444" : "#f59e0b";
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Streak is at Risk!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden;">
          
          <!-- Header with flame -->
          <tr>
            <td align="center" style="padding: 40px 40px 20px; background: linear-gradient(135deg, ${urgencyColor}22 0%, transparent 100%);">
              <div style="font-size: 64px; margin-bottom: 16px;">🔥</div>
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff;">
                Your Streak is at Risk!
              </h1>
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td style="padding: 20px 40px 40px;">
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #a0aec0;">
                Hey ${firstName},
              </p>
              
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #a0aec0;">
                You've built an impressive <strong style="color: #ffffff;">${streakWeeks}-week streak</strong>${businessName ? ` with ${businessName}` : ''} — don't let it slip away!
              </p>

              <!-- Countdown box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="background: linear-gradient(135deg, ${urgencyColor}33 0%, ${urgencyColor}11 100%); border: 1px solid ${urgencyColor}44; border-radius: 12px; padding: 24px; text-align: center;">
                    <div style="font-size: 48px; font-weight: 700; color: ${urgencyColor}; margin-bottom: 8px;">
                      ${daysRemaining}
                    </div>
                    <div style="font-size: 14px; color: #a0aec0; text-transform: uppercase; letter-spacing: 1px;">
                      Day${daysRemaining > 1 ? 's' : ''} Remaining
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #a0aec0;">
                Just one quick session with your AI Advisor will keep your momentum going. It only takes a few minutes!
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="https://wellnessgenius.ai/genie" 
                       style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px; box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);">
                      Keep My Streak Going →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; border-top: 1px solid #2d3748;">
              <p style="margin: 0; font-size: 12px; color: #718096; text-align: center;">
                You're receiving this because you opted into leaderboard tracking.<br>
                <a href="https://wellnessgenius.ai/genie" style="color: #14b8a6;">Manage notification preferences</a>
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

// Check for users at risk of losing their streak
async function checkStreakRecovery(
  supabase: any,
  resend: Resend | null
): Promise<{ notificationsSent: number; emailsSent: number }> {
  console.log("Checking for users at risk of losing their streak...");
  
  let notificationsSent = 0;
  let emailsSent = 0;

  try {
    // Get users with active streaks who are opted in
    const { data: leaderboardUsers, error: leaderboardError } = await supabase
      .from("leaderboard_entries")
      .select("user_id, streak_weeks")
      .gt("streak_weeks", 0)
      .eq("opted_in", true);

    if (leaderboardError) {
      console.error("Error fetching leaderboard entries:", leaderboardError);
      return { notificationsSent, emailsSent };
    }

    if (!leaderboardUsers || leaderboardUsers.length === 0) {
      console.log("No users with active streaks found");
      return { notificationsSent, emailsSent };
    }

    const typedLeaderboardUsers = leaderboardUsers as Array<{ user_id: string; streak_weeks: number }>;
    const userIds = typedLeaderboardUsers.map(u => u.user_id);
    const userStreaks: Record<string, number> = {};
    for (const entry of typedLeaderboardUsers) {
      userStreaks[entry.user_id] = entry.streak_weeks || 0;
    }

    // Get last session for each user
    const { data: recentSessions, error: sessionsError } = await supabase
      .from("genie_sessions")
      .select("user_id, started_at")
      .in("user_id", userIds)
      .order("started_at", { ascending: false });

    if (sessionsError) {
      console.error("Error fetching sessions:", sessionsError);
      return { notificationsSent, emailsSent };
    }

    // Group by user and get most recent session
    const typedSessions = (recentSessions || []) as Array<{ user_id: string; started_at: string }>;
    const lastSessionByUser: Record<string, Date> = {};
    for (const session of typedSessions) {
      if (!lastSessionByUser[session.user_id]) {
        lastSessionByUser[session.user_id] = new Date(session.started_at);
      }
    }

    // Find users at risk (5-6 days since last activity)
    const atRiskUsers: Array<{ userId: string; daysSince: number }> = [];
    
    for (const entry of typedLeaderboardUsers) {
      const lastSession = lastSessionByUser[entry.user_id];
      if (lastSession) {
        const daysSince = Math.floor(
          (Date.now() - lastSession.getTime()) / (1000 * 60 * 60 * 24)
        );
        // Alert if 5-6 days inactive (before 7-day streak break)
        if (daysSince >= 5 && daysSince < 7) {
          atRiskUsers.push({ userId: entry.user_id, daysSince });
        }
      }
    }

    if (atRiskUsers.length === 0) {
      console.log("No users at risk of losing their streak");
      return { notificationsSent, emailsSent };
    }

    console.log(`Found ${atRiskUsers.length} users at risk of losing their streak`);

    const atRiskUserIds = atRiskUsers.map(u => u.userId);
    const userDaysSince: Record<string, number> = {};
    for (const u of atRiskUsers) {
      userDaysSince[u.userId] = u.daysSince;
    }

    // Get user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .in("id", atRiskUserIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return { notificationsSent, emailsSent };
    }

    const typedProfiles = (profiles || []) as Array<{ id: string; email: string; full_name: string | null }>;

    // Get business names
    const { data: businessMemory } = await supabase
      .from("business_memory")
      .select("user_id, business_name")
      .in("user_id", atRiskUserIds);

    const typedBusinessMemory = (businessMemory || []) as Array<{ user_id: string; business_name: string | null }>;
    const businessByUser: Record<string, string | null> = {};
    for (const bm of typedBusinessMemory) {
      businessByUser[bm.user_id] = bm.business_name;
    }

    // Check for existing recent streak warnings to avoid spam
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { data: existingNotifications } = await supabase
      .from("genie_notifications")
      .select("user_id")
      .in("user_id", atRiskUserIds)
      .eq("type", "streak_warning")
      .gte("created_at", oneDayAgo.toISOString());

    const typedExistingNotifications = (existingNotifications || []) as Array<{ user_id: string }>;
    const alreadyNotified = new Set(typedExistingNotifications.map(n => n.user_id));

    for (const profile of typedProfiles) {
      if (alreadyNotified.has(profile.id)) {
        console.log(`Skipping ${profile.email} - already notified recently`);
        continue;
      }

      const streakWeeks = userStreaks[profile.id] || 0;
      const daysSince = userDaysSince[profile.id] || 0;
      const daysRemaining = 7 - daysSince;
      const businessName = businessByUser[profile.id];

      // Create in-app notification
      const { error: notifError } = await supabase
        .from("genie_notifications")
        .insert({
          user_id: profile.id,
          type: "streak_warning",
          priority: "high",
          title: "🔥 Your streak is at risk!",
          message: `You have ${daysRemaining} day${daysRemaining > 1 ? 's' : ''} left to maintain your ${streakWeeks}-week streak. Open Genie to keep it going!`,
          trigger_reason: `No activity for ${daysSince} days`,
          expires_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        });

      if (notifError) {
        console.error(`Failed to create notification for ${profile.email}:`, notifError);
      } else {
        notificationsSent++;
      }

      // Send email notification if Resend is configured
      if (resend && profile.email) {
        try {
          const firstName = profile.full_name?.split(' ')[0] || 'there';
          
          await resend.emails.send({
            from: "Wellness Genius <notifications@wellnessgenius.ai>",
            to: [profile.email],
            subject: `🔥 ${daysRemaining} day${daysRemaining > 1 ? 's' : ''} left to save your ${streakWeeks}-week streak!`,
            html: generateStreakWarningEmail(
              firstName,
              streakWeeks,
              daysRemaining,
              businessName
            ),
          });
          emailsSent++;
          console.log(`Streak warning email sent to ${profile.email}`);
        } catch (emailError) {
          console.error(`Failed to send email to ${profile.email}:`, emailError);
        }
      }
    }

    return { notificationsSent, emailsSent };
  } catch (error) {
    console.error("Error in streak recovery check:", error);
    return { notificationsSent, emailsSent };
  }
}

serve(async (req) => {
  const dynamicCorsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: dynamicCorsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    // Check for streak recovery notifications first
    const streakResults = await checkStreakRecovery(supabase, resend);
    console.log(`Streak recovery: ${streakResults.notificationsSent} notifications, ${streakResults.emailsSent} emails`);

    // Get all users with business memory for AI-generated notifications
    const { data: memories, error: memoriesError } = await supabase
      .from("business_memory")
      .select("*");

    if (memoriesError) {
      throw new Error(`Failed to fetch memories: ${memoriesError.message}`);
    }

    if (!memories || memories.length === 0) {
      console.log("No business memories found");
      return new Response(
        JSON.stringify({ 
          success: true, 
          processed: 0,
          streakNotifications: streakResults.notificationsSent,
          streakEmails: streakResults.emailsSent
        }),
        { headers: { "Content-Type": "application/json", ...dynamicCorsHeaders } }
      );
    }

    console.log(`Processing ${memories.length} users with business memory`);

    let totalNotifications = 0;
    let emailsSent = 0;

    for (const memory of memories) {
      // Check if user has received notifications recently (within last 24 hours)
      const { data: recentNotifications } = await supabase
        .from("genie_notifications")
        .select("id")
        .eq("user_id", memory.user_id)
        .neq("type", "streak_warning") // Don't count streak warnings
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(1);

      if (recentNotifications && recentNotifications.length > 0) {
        console.log(`Skipping user ${memory.user_id} - recent notifications exist`);
        continue;
      }

      // Get user notification preferences
      const { data: prefs } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", memory.user_id)
        .maybeSingle();

      // Check quiet hours
      if (prefs?.quiet_hours_enabled) {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        
        // Check if current day is a quiet day
        if (prefs.quiet_days?.includes(currentDay)) {
          console.log(`Skipping user ${memory.user_id} - quiet day`);
          continue;
        }
        
        // Check quiet hours
        const start = prefs.quiet_hours_start?.slice(0, 5) || "22:00";
        const end = prefs.quiet_hours_end?.slice(0, 5) || "08:00";
        
        if (start < end) {
          // Simple range (e.g., 09:00-17:00)
          if (currentTime >= start && currentTime < end) {
            console.log(`Skipping user ${memory.user_id} - quiet hours`);
            continue;
          }
        } else {
          // Overnight range (e.g., 22:00-08:00)
          if (currentTime >= start || currentTime < end) {
            console.log(`Skipping user ${memory.user_id} - quiet hours`);
            continue;
          }
        }
      }

      // Generate notifications for this user
      const notifications = await generateNotificationsForUser(memory, lovableApiKey);

      if (notifications.length === 0) {
        console.log(`No notifications generated for user ${memory.user_id}`);
        continue;
      }

      console.log(`Generated ${notifications.length} notifications for user ${memory.user_id}`);

      // Get user email for sending notifications
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", memory.user_id)
        .single();

      // Insert notifications into database
      for (const notification of notifications) {
        let emailSent = false;
        
        // Check if we should send email based on preferences
        const shouldEmail = prefs?.email_enabled !== false && 
          prefs?.email_frequency !== 'never' &&
          (
            prefs?.email_priority_threshold === 'all' ||
            (prefs?.email_priority_threshold === 'medium_and_high' && ['medium', 'high'].includes(notification.priority)) ||
            (prefs?.email_priority_threshold === 'high' && notification.priority === 'high') ||
            (!prefs?.email_priority_threshold && notification.priority === 'high') // Default to high only
          );
        
        // Send email if resend is configured and preferences allow
        if (resend && profile?.email && shouldEmail && prefs?.email_frequency === 'instant') {
          emailSent = await sendNotificationEmail(
            resend,
            profile.email,
            [notification],
            memory.business_name || "Your Business"
          );
          if (emailSent) emailsSent++;
        }

        const { error: insertError } = await supabase
          .from("genie_notifications")
          .insert({
            user_id: memory.user_id,
            type: notification.type,
            priority: notification.priority,
            title: notification.title,
            message: notification.message,
            trigger_reason: notification.trigger_reason,
            email_sent: emailSent,
            email_sent_at: emailSent ? new Date().toISOString() : null,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          });

        if (insertError) {
          console.error("Failed to insert notification:", insertError);
        } else {
          totalNotifications++;
        }
      }
    }

    console.log(`Completed: ${totalNotifications} AI notifications, ${emailsSent} emails, ${streakResults.notificationsSent} streak warnings`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: memories.length,
        notificationsCreated: totalNotifications,
        emailsSent,
        streakNotifications: streakResults.notificationsSent,
        streakEmails: streakResults.emailsSent
      }),
      { headers: { "Content-Type": "application/json", ...dynamicCorsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in generate-notifications:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json", ...dynamicCorsHeaders } }
    );
  }
});
