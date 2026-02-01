import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[RESET-CREDITS] ${step}${detailsStr}`);
};

const generateEmailHtml = (userName: string, credits: number) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">✨ Your Credits Have Been Refreshed!</h1>
    </div>
    <div style="padding: 32px;">
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
        Hi${userName ? ` ${userName}` : ''},
      </p>
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
        Great news! Your monthly AI Coach credits have been refreshed. You now have <strong>${credits} credits</strong> ready to use.
      </p>
      <div style="background: #f0fdfa; border-radius: 8px; padding: 20px; margin: 0 0 24px;">
        <p style="color: #0d9488; font-size: 32px; font-weight: bold; margin: 0; text-align: center;">
          ${credits} Credits
        </p>
        <p style="color: #666; font-size: 14px; margin: 8px 0 0; text-align: center;">
          Available for this month
        </p>
      </div>
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
        Use your credits wisely across our strategic modes:
      </p>
      <ul style="color: #666; font-size: 14px; line-height: 1.8; margin: 0 0 24px; padding-left: 20px;">
        <li><strong>Diagnostic Mode</strong> - Deep analysis of your business</li>
        <li><strong>Decision Mode</strong> - Help with tough choices</li>
        <li><strong>Commercial Mode</strong> - Financial modelling & strategy</li>
        <li><strong>Foundations Mode</strong> - AI readiness assessment</li>
        <li><strong>Planner Mode</strong> - 90-day action plans</li>
      </ul>
      <div style="text-align: center;">
        <a href="https://www.wellnessgenius.co.uk/hub/coach" style="display: inline-block; background: #14b8a6; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Start Using Your Credits →
        </a>
      </div>
    </div>
    <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        Wellness Genius | AI-powered wellness business intelligence
      </p>
    </div>
  </div>
</body>
</html>
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Find all credits that need resetting (last_reset_at is more than 1 month ago)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    logStep("Checking for credits to reset", { cutoffDate: oneMonthAgo.toISOString() });

    const { data: creditsToReset, error: fetchError } = await supabaseAdmin
      .from("coach_credits")
      .select("id, user_id, monthly_allowance, last_reset_at")
      .lt("last_reset_at", oneMonthAgo.toISOString());

    if (fetchError) {
      throw new Error(`Failed to fetch credits: ${fetchError.message}`);
    }

    if (!creditsToReset || creditsToReset.length === 0) {
      logStep("No credits need resetting");
      return new Response(
        JSON.stringify({ success: true, message: "No credits to reset", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    logStep("Found credits to reset", { count: creditsToReset.length });

    // Reset each user's credits
    let resetCount = 0;
    let emailsSent = 0;
    const errors: string[] = [];

    for (const credit of creditsToReset) {
      const { error: updateError } = await supabaseAdmin
        .from("coach_credits")
        .update({
          balance: credit.monthly_allowance,
          last_reset_at: new Date().toISOString(),
        })
        .eq("id", credit.id);

      if (updateError) {
        errors.push(`Failed to reset credit ${credit.id}: ${updateError.message}`);
        logStep("Error resetting credit", { id: credit.id, error: updateError.message });
      } else {
        resetCount++;
        
        // Log the transaction
        await supabaseAdmin.from("credit_transactions").insert({
          user_id: credit.user_id,
          change_amount: credit.monthly_allowance,
          reason: "monthly_reset",
        });
        
        logStep("Reset credit for user", { userId: credit.user_id, newBalance: credit.monthly_allowance });

        // Send email notification
        if (resend) {
          try {
            // Get user's email from profiles
            const { data: profile } = await supabaseAdmin
              .from("profiles")
              .select("email, full_name")
              .eq("id", credit.user_id)
              .maybeSingle();

            if (profile?.email) {
              const { error: emailError } = await resend.emails.send({
                from: "Wellness Genius <hello@wellnessgenius.co.uk>",
                to: [profile.email],
                subject: "✨ Your AI Coach Credits Have Been Refreshed!",
                html: generateEmailHtml(profile.full_name || "", credit.monthly_allowance),
              });

              if (emailError) {
                logStep("Email error", { userId: credit.user_id, error: emailError });
              } else {
                emailsSent++;
                logStep("Email sent", { userId: credit.user_id, email: profile.email });
              }
            }
          } catch (emailErr) {
            logStep("Email exception", { userId: credit.user_id, error: String(emailErr) });
          }
        }
      }
    }

    logStep("Reset complete", { resetCount, emailsSent, errorCount: errors.length });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Reset ${resetCount} credit accounts, sent ${emailsSent} emails`,
        count: resetCount,
        emailsSent,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
