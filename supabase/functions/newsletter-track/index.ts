import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 1x1 transparent GIF
const TRACKING_PIXEL = new Uint8Array([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00,
  0x80, 0x00, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21,
  0xf9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00,
  0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
  0x01, 0x00, 0x3b
]);

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const sendId = url.searchParams.get("sid");
  const email = url.searchParams.get("e");
  const type = url.searchParams.get("t"); // 'o' for open, 'c' for click
  const linkUrl = url.searchParams.get("url");

  if (!sendId || !email || !type) {
    console.error("Missing required parameters");
    // Still return pixel or redirect to not break email rendering
    if (type === "c" && linkUrl) {
      return Response.redirect(linkUrl, 302);
    }
    return new Response(TRACKING_PIXEL, {
      headers: { "Content-Type": "image/gif", ...corsHeaders },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const userAgent = req.headers.get("user-agent") || "";
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0] || 
                      req.headers.get("cf-connecting-ip") || "";

    const eventType = type === "o" ? "open" : "click";
    const decodedEmail = decodeURIComponent(email);
    const decodedUrl = linkUrl ? decodeURIComponent(linkUrl) : null;

    // Insert the event
    const { error: insertError } = await supabase
      .from("newsletter_events")
      .insert({
        send_id: sendId,
        subscriber_email: decodedEmail,
        event_type: eventType,
        link_url: decodedUrl,
        user_agent: userAgent,
        ip_address: ipAddress,
      });

    if (insertError) {
      console.error("Failed to insert event:", insertError);
    } else {
      console.log(`Tracked ${eventType} for ${decodedEmail} on send ${sendId}`);

      // Update aggregated counts
      await updateSendMetrics(supabase, sendId);
    }
  } catch (error) {
    console.error("Error tracking event:", error);
  }

  // Return appropriate response
  if (type === "c" && linkUrl) {
    // Redirect to the actual URL for click tracking
    return Response.redirect(decodeURIComponent(linkUrl), 302);
  }

  // Return tracking pixel for open tracking
  return new Response(TRACKING_PIXEL, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      ...corsHeaders,
    },
  });
});

async function updateSendMetrics(supabase: any, sendId: string) {
  try {
    // Count unique and total opens
    const { data: openData } = await supabase
      .from("newsletter_events")
      .select("subscriber_email")
      .eq("send_id", sendId)
      .eq("event_type", "open");

    const totalOpens = openData?.length || 0;
    const uniqueOpens = new Set(openData?.map((e: any) => e.subscriber_email)).size;

    // Count unique and total clicks
    const { data: clickData } = await supabase
      .from("newsletter_events")
      .select("subscriber_email")
      .eq("send_id", sendId)
      .eq("event_type", "click");

    const totalClicks = clickData?.length || 0;
    const uniqueClicks = new Set(clickData?.map((e: any) => e.subscriber_email)).size;

    // Update the newsletter_sends record
    await supabase
      .from("newsletter_sends")
      .update({
        unique_opens: uniqueOpens,
        total_opens: totalOpens,
        unique_clicks: uniqueClicks,
        total_clicks: totalClicks,
      })
      .eq("id", sendId);
  } catch (error) {
    console.error("Failed to update send metrics:", error);
  }
}
