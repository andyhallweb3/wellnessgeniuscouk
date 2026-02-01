import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RecentError {
  time: string;
  mode: string;
  errors: string[];
}

interface AlertRequest {
  email: string;
  totalErrors: number;
  timeRange: string;
  topMode: string;
  topModeCount: number;
  topErrorField: string;
  topErrorCount: number;
  recentErrors: RecentError[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin access
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc("is_admin");
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: AlertRequest = await req.json();
    const {
      email,
      totalErrors,
      timeRange,
      topMode,
      topModeCount,
      topErrorField,
      topErrorCount,
      recentErrors,
    } = body;

    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Valid email required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build email HTML
    const recentErrorsHtml = recentErrors
      .map(
        (err) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${err.time}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
            <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 12px;">${err.mode}</code>
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
            ${err.errors.slice(0, 2).join("<br>")}
            ${err.errors.length > 2 ? `<br><em>+${err.errors.length - 2} more</em>` : ""}
          </td>
        </tr>
      `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Validation Error Alert</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 24px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Validation Error Alert</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">Wellness Genius Admin</p>
            </div>
            
            <div style="padding: 24px;">
              <h2 style="margin: 0 0 16px; font-size: 18px; color: #111827;">Summary (${timeRange})</h2>
              
              <div style="display: grid; gap: 12px; margin-bottom: 24px;">
                <div style="background: #fef3c7; border-radius: 8px; padding: 16px; display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #92400e;">Total Errors</span>
                  <strong style="font-size: 24px; color: #92400e;">${totalErrors}</strong>
                </div>
                <div style="background: #dbeafe; border-radius: 8px; padding: 16px; display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #1e40af;">Top Mode: <code>${topMode}</code></span>
                  <strong style="color: #1e40af;">${topModeCount} errors</strong>
                </div>
                <div style="background: #fee2e2; border-radius: 8px; padding: 16px; display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #991b1b;">Top Field: <code>${topErrorField}</code></span>
                  <strong style="color: #991b1b;">${topErrorCount} occurrences</strong>
                </div>
              </div>
              
              <h3 style="margin: 0 0 12px; font-size: 16px; color: #111827;">Recent Errors</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead>
                  <tr style="background: #f3f4f6;">
                    <th style="padding: 8px; text-align: left; font-weight: 600;">Time</th>
                    <th style="padding: 8px; text-align: left; font-weight: 600;">Mode</th>
                    <th style="padding: 8px; text-align: left; font-weight: 600;">Errors</th>
                  </tr>
                </thead>
                <tbody>
                  ${recentErrorsHtml || '<tr><td colspan="3" style="padding: 16px; text-align: center; color: #6b7280;">No recent errors</td></tr>'}
                </tbody>
              </table>
              
              <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
                <a href="https://wellnessgenius.co.uk/validation/admin" style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                  View Full Dashboard →
                </a>
              </div>
            </div>
            
            <div style="background: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #6b7280;">
              This is an automated alert from Wellness Genius Admin.
            </div>
          </div>
        </body>
      </html>
    `;

    console.log("[VALIDATION-ALERT] Sending alert to:", email);

    // Send email via Resend API directly
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Wellness Genius <alerts@wellnessgenius.co.uk>",
        to: [email],
        subject: `⚠️ Validation Alert: ${totalErrors} errors in ${timeRange}`,
        html,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error("[VALIDATION-ALERT] Resend error:", errorData);
      throw new Error(errorData.message || "Failed to send email");
    }

    const emailResult = await emailResponse.json();
    console.log("[VALIDATION-ALERT] Email sent:", emailResult);

    return new Response(
      JSON.stringify({ success: true, id: emailResult.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("[VALIDATION-ALERT] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
