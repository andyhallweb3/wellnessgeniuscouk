import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    // Get all users with business memory
    const { data: memories, error: memoriesError } = await supabase
      .from("business_memory")
      .select("*");

    if (memoriesError) {
      throw new Error(`Failed to fetch memories: ${memoriesError.message}`);
    }

    if (!memories || memories.length === 0) {
      console.log("No business memories found");
      return new Response(
        JSON.stringify({ success: true, processed: 0 }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
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
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(1);

      if (recentNotifications && recentNotifications.length > 0) {
        console.log(`Skipping user ${memory.user_id} - recent notifications exist`);
        continue;
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
        
        // Send email for high priority if resend is configured
        if (resend && profile?.email && notification.priority === "high") {
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

    console.log(`Completed: ${totalNotifications} notifications created, ${emailsSent} emails sent`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: memories.length,
        notificationsCreated: totalNotifications,
        emailsSent 
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in generate-notifications:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
