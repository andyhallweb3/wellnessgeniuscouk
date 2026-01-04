import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders, corsHeaders } from "../_shared/cors.ts";

// AI Coach subscription product IDs
const AI_COACH_PRODUCTS: Record<string, { tier: string; credits: number }> = {
  "prod_Te6NWkwhVOKfzo": { tier: "pro", credits: 40 },      // AI Coach Pro - £19.99/month
  "prod_Te6NnelwNeqd6v": { tier: "expert", credits: 120 },  // AI Coach Expert - £39.99/month
  "prod_TddVXSB3jlACob": { tier: "pro", credits: 40 },      // Legacy AI Coach product
};

// Whitelisted emails with free access (Expert tier)
const FREE_ACCESS_EMAILS = [
  "andyhall0708@gmail.com",
];

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-COACH-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  const dynamicCorsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: dynamicCorsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check if user has free access (grants Expert tier)
    if (FREE_ACCESS_EMAILS.includes(user.email.toLowerCase())) {
      logStep("Free access granted - Expert tier", { email: user.email });
      return new Response(JSON.stringify({
        subscribed: true,
        tier: "expert",
        credits: 120,
        monthly_allowance: 120,
        subscription_end: null,
        free_access: true,
      }), {
        headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      return new Response(JSON.stringify({ 
        subscribed: false,
        tier: null,
        credits: 0,
        monthly_allowance: 0,
      }), {
        headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 10,
    });

    // Find the AI Coach subscription and determine tier
    let foundTier: string | null = null;
    let foundCredits = 0;
    let subscriptionEnd: string | null = null;
    let productId: string | null = null;

    for (const sub of subscriptions.data) {
      for (const item of sub.items.data) {
        const prodId = item.price.product as string;
        if (AI_COACH_PRODUCTS[prodId]) {
          const productInfo = AI_COACH_PRODUCTS[prodId];
          // If we already found a subscription, prefer Expert over Pro
          if (!foundTier || (productInfo.tier === "expert" && foundTier === "pro")) {
            foundTier = productInfo.tier;
            foundCredits = productInfo.credits;
            productId = prodId;
            subscriptionEnd = new Date(sub.current_period_end * 1000).toISOString();
          }
          break;
        }
      }
    }

    const hasCoachSubscription = foundTier !== null;
    logStep("Subscription check complete", { 
      hasSubscription: hasCoachSubscription, 
      tier: foundTier,
      credits: foundCredits,
      productId
    });

    return new Response(JSON.stringify({
      subscribed: hasCoachSubscription,
      tier: foundTier,
      credits: foundCredits,
      monthly_allowance: foundCredits,
      subscription_end: subscriptionEnd,
      product_id: productId,
    }), {
      headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
