import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Product price mapping - Updated pricing Dec 2025
const PRODUCT_PRICES: Record<string, string> = {
  // Entry Paid (Impulse / Low Risk)
  "quick-check-lite": "price_1Sgo3PADyJKZqOM9XllFtFwq",        // £9.99 - AI Readiness Quick Check Lite+
  "prompt-pack": "price_1Sgo3QADyJKZqOM921ictSFp",             // £19.99 - Wellness AI Prompt Pack
  
  // Core Paid Products
  "readiness-score": "price_1Sgo3TADyJKZqOM9InUIggBX",         // £39.99 - AI Readiness Score Commercial Edition
  "gamification-playbook": "price_1Sgo3UADyJKZqOM9Ymc9WSCI",   // £39.99 - Gamification, Rewards & Incentives
  "engagement-playbook": "price_1Sgo3WADyJKZqOM94CXxzWnX",     // £29.99 - Wellness Engagement Systems
  
  // Execution / Advanced
  "activation-playbook": "price_1Sgo3YADyJKZqOM9o9CJBiad",     // £49.99 - 90-Day AI Activation Playbook
  
  // Bundles
  "operator-bundle": "price_1Sgo3aADyJKZqOM9lS4M5Zvj",         // £79.99 - Wellness AI Operator Bundle
  "gamification-bundle": "price_1Sgo3bADyJKZqOM9A9pUIvOj",     // £69.99 - Gamification & Personalisation Bundle
  "execution-bundle": "price_1Sgo3dADyJKZqOM9aF85jdNZ",        // £89.99 - Execution Bundle
};

// Bundle product mappings for PDF downloads
const BUNDLE_PRODUCTS: Record<string, string[]> = {
  "operator-bundle": ["prompt-pack", "engagement-playbook"],
  "gamification-bundle": ["engagement-playbook", "gamification-playbook"],
  "execution-bundle": ["activation-playbook", "gamification-playbook"],
};

// AI Coach subscription product ID
const AI_COACH_PRODUCT_ID = "prod_TddVXSB3jlACob";

// Whitelisted emails with free access
const FREE_ACCESS_EMAILS = [
  "andyhall0708@gmail.com",
];

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PRODUCT-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { productId, email, couponCode } = await req.json();
    logStep("Request body parsed", { productId, email, couponCode: couponCode ? "provided" : "none" });

    if (!productId) {
      throw new Error("Product ID is required");
    }

    const priceId = PRODUCT_PRICES[productId];
    if (!priceId) {
      throw new Error(`Unknown product ID: ${productId}`);
    }
    logStep("Price ID found", { priceId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if user is authenticated and has AI Coach subscription
    const authHeader = req.headers.get("Authorization");
    let userEmail = email;
    let hasSubscription = false;

    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data: userData } = await supabaseClient.auth.getUser(token);
        
        if (userData.user?.email) {
          userEmail = userData.user.email;
          logStep("Authenticated user", { email: userEmail });

          // Check for free access
          if (FREE_ACCESS_EMAILS.includes(userEmail.toLowerCase())) {
            hasSubscription = true;
            logStep("Free access user - products included");
          } else {
            // Check for AI Coach subscription
            const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
            
            if (customers.data.length > 0) {
              const customerId = customers.data[0].id;
              const subscriptions = await stripe.subscriptions.list({
                customer: customerId,
                status: "active",
                limit: 10,
              });

              // Check if any subscription is for the AI Coach product
              for (const sub of subscriptions.data) {
                for (const item of sub.items.data) {
                  if (item.price.product === AI_COACH_PRODUCT_ID) {
                    hasSubscription = true;
                    logStep("User has AI Coach subscription - products included free");
                    break;
                  }
                }
                if (hasSubscription) break;
              }
            }
          }
        }
      } catch (authError) {
        logStep("Auth check failed, proceeding as guest", { error: String(authError) });
      }
    }

    // If user has subscription, return free access
    if (hasSubscription) {
      return new Response(JSON.stringify({ 
        free_access: true,
        message: "This product is included with your AI Coach subscription"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check if customer exists
    let customerId: string | undefined;
    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Existing customer found", { customerId });
      }
    }

    const origin = req.headers.get("origin") || "https://www.wellnessgenius.co.uk";

    // Build checkout session options
    const sessionOptions: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/products?payment=success&product=${productId}`,
      cancel_url: `${origin}/products?payment=cancelled`,
      metadata: {
        productId,
      },
      allow_promotion_codes: true, // Allow users to enter promo codes at checkout
    };

    // If a coupon code is provided, apply it directly
    if (couponCode) {
      try {
        // Validate the coupon exists
        const coupon = await stripe.coupons.retrieve(couponCode);
        if (coupon && coupon.valid) {
          sessionOptions.discounts = [{ coupon: couponCode }];
          logStep("Coupon applied", { couponCode });
        }
      } catch (couponError) {
        logStep("Coupon validation failed, continuing without discount", { couponCode, error: String(couponError) });
        // Don't fail the checkout, just continue without the coupon
      }
    }

    // Create checkout session for one-time payment
    const session = await stripe.checkout.sessions.create(sessionOptions);

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
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
