import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[RESET-CREDITS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

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
      }
    }

    logStep("Reset complete", { resetCount, errorCount: errors.length });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Reset ${resetCount} credit accounts`,
        count: resetCount,
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
