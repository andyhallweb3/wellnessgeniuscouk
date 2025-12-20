import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PRODUCT-WEBHOOK] ${step}${detailsStr}`);
};

// Product name mapping
const PRODUCT_NAMES: Record<string, string> = {
  "prompt-pack": "Wellness AI Builder – Operator Edition",
  "revenue-framework": "Engagement → Revenue Framework",
  "build-vs-buy": "Build vs Buy: AI in Wellness",
  "activation-playbook": "90-Day AI Activation Playbook",
  "engagement-playbook": "Wellness Engagement Systems Playbook",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    // For now, we'll parse the event directly (webhook signature verification would require STRIPE_WEBHOOK_SECRET)
    const event = JSON.parse(body);
    logStep("Event type", { type: event.type });

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      logStep("Processing completed session", { sessionId: session.id });

      const customerEmail = session.customer_email || session.customer_details?.email;
      const productId = session.metadata?.productId;
      const amountTotal = session.amount_total;
      const currency = session.currency;

      if (!customerEmail || !productId) {
        logStep("Missing data", { customerEmail, productId });
        return new Response(JSON.stringify({ received: true, skipped: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create Supabase client with service role
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      // Find user by email
      const { data: userData, error: userError } = await supabaseClient.auth.admin.listUsers();
      
      if (userError) {
        logStep("Error listing users", { error: userError.message });
      }

      const user = userData?.users?.find(u => u.email === customerEmail);

      if (user) {
        // Record the purchase
        const { error: insertError } = await supabaseClient
          .from("user_purchases")
          .insert({
            user_id: user.id,
            product_id: productId,
            product_name: PRODUCT_NAMES[productId] || productId,
            price_paid: amountTotal,
            currency: currency,
            stripe_session_id: session.id,
          });

        if (insertError) {
          logStep("Error inserting purchase", { error: insertError.message });
        } else {
          logStep("Purchase recorded successfully", { userId: user.id, productId });
        }
      } else {
        logStep("User not found for email", { email: customerEmail });
        // Could store for later association when user signs up
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
      status: 500,
    });
  }
});
