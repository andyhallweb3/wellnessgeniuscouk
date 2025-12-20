import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 1x1 transparent GIF for tracking pixel
const TRACKING_PIXEL = new Uint8Array([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00,
  0x80, 0x00, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21,
  0xf9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00,
  0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
  0x01, 0x00, 0x3b
]);

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[UPSELL-TRACK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    const product = url.searchParams.get("product");
    const variant = url.searchParams.get("variant");
    const action = url.searchParams.get("action"); // 'open' or 'click'
    const redirect = url.searchParams.get("redirect");

    logStep("Track event received", { email, product, variant, action });

    if (!email || !product || !action) {
      logStep("Missing parameters");
      // Still return valid response for tracking pixel
      if (action === "open") {
        return new Response(TRACKING_PIXEL, {
          headers: { "Content-Type": "image/gif", "Cache-Control": "no-cache" },
        });
      }
      return new Response("Missing parameters", { status: 400 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date().toISOString();

    if (action === "open") {
      // Track email open - only update if not already opened
      const { error } = await supabase
        .from("product_downloads")
        .update({
          email_opened: true,
          email_opened_at: now,
        })
        .eq("email", email)
        .eq("product_id", product)
        .is("email_opened_at", null);

      if (error) {
        logStep("Error updating open", error);
      } else {
        logStep("Open tracked", { email, product, variant });
      }

      // Return tracking pixel
      return new Response(TRACKING_PIXEL, {
        headers: { 
          "Content-Type": "image/gif", 
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        },
      });
    }

    if (action === "click") {
      // Track click - only update click time on first click
      const { error } = await supabase
        .from("product_downloads")
        .update({
          email_clicked: true,
          email_clicked_at: now,
        })
        .eq("email", email)
        .eq("product_id", product)
        .is("email_clicked_at", null);

      if (error) {
        logStep("Error updating click", error);
      } else {
        logStep("Click tracked", { email, product, variant, redirect });
      }

      // Redirect to the actual link
      if (redirect) {
        return new Response(null, {
          status: 302,
          headers: { 
            ...corsHeaders,
            "Location": redirect,
            "Cache-Control": "no-cache"
          },
        });
      }

      return new Response("Click tracked", { headers: corsHeaders });
    }

    // Track conversion (called from webhook or manually)
    if (action === "convert") {
      const conversionProduct = url.searchParams.get("conversion_product");
      const conversionValue = url.searchParams.get("conversion_value");

      const { error } = await supabase
        .from("product_downloads")
        .update({
          converted: true,
          converted_at: now,
          conversion_product: conversionProduct,
          conversion_value: conversionValue ? parseFloat(conversionValue) : null,
        })
        .eq("email", email)
        .eq("product_id", product);

      if (error) {
        logStep("Error updating conversion", error);
        throw error;
      }

      logStep("Conversion tracked", { email, product, conversionProduct, conversionValue });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response("Unknown action", { status: 400, headers: corsHeaders });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    // For open tracking, still return a pixel to not break email display
    return new Response(TRACKING_PIXEL, {
      headers: { "Content-Type": "image/gif" },
    });
  }
});