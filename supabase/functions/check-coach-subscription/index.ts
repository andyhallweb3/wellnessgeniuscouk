import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_COACH_PRODUCT_ID = "prod_TddVXSB3jlACob";

// Whitelisted emails with free access
const FREE_ACCESS_EMAILS = [
  "andyhall0708@gmail.com",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    console.log("[CHECK-COACH-SUBSCRIPTION] Checking for:", user.email);

    // Check if user has free access
    if (FREE_ACCESS_EMAILS.includes(user.email.toLowerCase())) {
      console.log("[CHECK-COACH-SUBSCRIPTION] Free access granted for:", user.email);
      return new Response(JSON.stringify({
        subscribed: true,
        subscription_end: null,
        free_access: true,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      console.log("[CHECK-COACH-SUBSCRIPTION] No customer found");
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    console.log("[CHECK-COACH-SUBSCRIPTION] Customer found:", customerId);

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 10,
    });

    // Check if any active subscription is for the AI Coach product
    const hasCoachSubscription = subscriptions.data.some((sub: any) => 
      sub.items.data.some((item: any) => item.price.product === AI_COACH_PRODUCT_ID)
    );

    let subscriptionEnd = null;
    if (hasCoachSubscription) {
      const coachSub = subscriptions.data.find((sub: any) => 
        sub.items.data.some((item: any) => item.price.product === AI_COACH_PRODUCT_ID)
      );
      if (coachSub) {
        subscriptionEnd = new Date(coachSub.current_period_end * 1000).toISOString();
      }
    }

    console.log("[CHECK-COACH-SUBSCRIPTION] Has subscription:", hasCoachSubscription);

    return new Response(JSON.stringify({
      subscribed: hasCoachSubscription,
      subscription_end: subscriptionEnd,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[CHECK-COACH-SUBSCRIPTION] Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
