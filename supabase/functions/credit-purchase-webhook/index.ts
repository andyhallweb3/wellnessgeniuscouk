import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREDIT-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("No Stripe signature");

    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!webhookSecret) throw new Error("Webhook secret not configured");

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    logStep("Webhook event received", { type: event.type });

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      
      // Check if this is a credit purchase (one-time payment with credit metadata)
      if (session.mode === "payment" && session.metadata?.credits) {
        const userId = session.metadata.userId;
        const credits = parseInt(session.metadata.credits, 10);
        const packId = session.metadata.packId;

        logStep("Processing credit purchase", { userId, credits, packId });

        if (userId && credits > 0) {
          // Get current credit balance
          const { data: currentCredits, error: fetchError } = await supabaseAdmin
            .from("coach_credits")
            .select("balance")
            .eq("user_id", userId)
            .single();

          if (fetchError && fetchError.code !== "PGRST116") {
            throw fetchError;
          }

          const currentBalance = currentCredits?.balance || 0;
          const newBalance = currentBalance + credits;

          // Upsert credits
          const { error: upsertError } = await supabaseAdmin
            .from("coach_credits")
            .upsert({
              user_id: userId,
              balance: newBalance,
              monthly_allowance: currentCredits?.balance ? undefined : credits,
              last_reset_at: new Date().toISOString(),
            }, {
              onConflict: "user_id",
            });

          if (upsertError) throw upsertError;

          // Record the transaction
          const { error: transactionError } = await supabaseAdmin
            .from("credit_transactions")
            .insert({
              user_id: userId,
              change_amount: credits,
              reason: `Credit pack purchase: ${packId}`,
            });

          if (transactionError) {
            logStep("Warning: Failed to record transaction", { error: transactionError.message });
          }

          logStep("Credits added successfully", { userId, credits, newBalance });
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
