import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Product price mapping - Updated pricing Dec 2025
const PRODUCT_PRICES: Record<string, string> = {
  "prompt-pack": "price_1SgLn2ADyJKZqOM99i15KWE2",           // £49 - unchanged
  "revenue-framework": "price_1SgLn4ADyJKZqOM9wGt6k508",    // £49 - unchanged
  "build-vs-buy": "price_1SgLn7ADyJKZqOM94XoVJeuz",         // £29 - unchanged
  "activation-playbook": "price_1SgnXvADyJKZqOM9KBzNvcYl",  // £99 - was £49
  "engagement-playbook": "price_1SgnXxADyJKZqOM9w9RFk8Cv",  // £59 - was £79
  "ai-builder": "price_1SgnXzADyJKZqOM9EqRorM6Y",           // £69 - new product ID
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

    const { productId, email } = await req.json();
    logStep("Request body parsed", { productId, email });

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

    const origin = req.headers.get("origin") || "https://wellnessgenius.io";

    // Create checkout session for one-time payment
    const session = await stripe.checkout.sessions.create({
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
    });

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
