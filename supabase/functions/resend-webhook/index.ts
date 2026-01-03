import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Webhook } from "https://esm.sh/svix@1.15.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
};

interface ResendWebhookEvent {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    bounce?: {
      message: string;
    };
    click?: {
      link: string;
      timestamp: string;
    };
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookSecret = Deno.env.get("RESEND_WEBHOOK_SECRET");
    
    if (!webhookSecret) {
      console.error("RESEND_WEBHOOK_SECRET not configured");
      return new Response(
        JSON.stringify({ error: "Webhook secret not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get Svix headers for signature verification
    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("Missing Svix headers");
      return new Response(
        JSON.stringify({ error: "Missing webhook signature headers" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get raw body for signature verification
    const payload = await req.text();

    // Verify the webhook signature using Svix
    const wh = new Webhook(webhookSecret);
    let event: ResendWebhookEvent;
    
    try {
      event = wh.verify(payload, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as ResendWebhookEvent;
      console.log("Webhook signature verified successfully");
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response(
        JSON.stringify({ error: "Invalid webhook signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Received Resend webhook: ${event.type}`, JSON.stringify(event.data));

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const email = event.data.to?.[0];
    const resendEmailId = event.data.email_id;

    // Find the most recent newsletter_send for this email
    // Look up from newsletter_send_recipients to get the correct internal send_id
    let internalSendId: string | null = null;
    
    if (email) {
      const { data: recipientRecord } = await supabase
        .from("newsletter_send_recipients")
        .select("send_id")
        .eq("email", email)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (recipientRecord) {
        internalSendId = recipientRecord.send_id;
        console.log(`Matched email ${email} to internal send_id ${internalSendId}`);
      } else {
        // Fallback: find most recent send
        const { data: recentSend } = await supabase
          .from("newsletter_sends")
          .select("id")
          .order("sent_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (recentSend) {
          internalSendId = recentSend.id;
          console.log(`No recipient match, using most recent send ${internalSendId}`);
        }
      }
    }

    // Helper to insert event and update metrics
    const trackEvent = async (eventType: string, linkUrl?: string) => {
      if (!email || !internalSendId) {
        console.log(`Cannot track ${eventType}: missing email or send_id`);
        return;
      }

      // Insert event
      await supabase.from("newsletter_events").insert({
        event_type: eventType,
        subscriber_email: email,
        send_id: internalSendId,
        link_url: linkUrl || null,
      });

      // Update aggregated counts on newsletter_sends
      await updateSendMetrics(supabase, internalSendId);
    };

    // Handle different event types
    switch (event.type) {
      case "email.sent":
        console.log(`Email sent: ${resendEmailId} to ${event.data.to.join(", ")}`);
        break;
        
      case "email.delivered":
        console.log(`Email delivered: ${resendEmailId}`);
        if (email) {
          await trackEvent("delivered");
          
          // Get current subscriber to increment count
          const { data: subscriber } = await supabase
            .from("newsletter_subscribers")
            .select("delivery_count")
            .eq("email", email)
            .maybeSingle();
          
          // Update subscriber delivery tracking
          await supabase
            .from("newsletter_subscribers")
            .update({ 
              last_delivered_at: new Date().toISOString(),
              delivery_count: (subscriber?.delivery_count || 0) + 1
            })
            .eq("email", email);
          
          console.log(`Marked ${email} as delivered`);
        }
        break;
        
      case "email.opened":
        console.log(`Email opened: ${resendEmailId} by ${email}`);
        await trackEvent("open");
        break;
        
      case "email.clicked":
        console.log(`Email clicked: ${resendEmailId}, link: ${event.data.click?.link}`);
        await trackEvent("click", event.data.click?.link);
        break;
        
      case "email.delivery_delayed":
        console.log(`Email delivery delayed: ${resendEmailId} to ${event.data.to?.join(", ")}`);
        await trackEvent("delivery_delayed");
        break;

      case "email.bounced":
        console.log(`Email bounced: ${resendEmailId}, reason: ${event.data.bounce?.message}`);
        if (email) {
          await trackEvent("bounce");
          
          // Mark subscriber as bounced and deactivate
          await supabase
            .from("newsletter_subscribers")
            .update({ 
              is_active: false,
              bounced: true,
              bounced_at: new Date().toISOString(),
              bounce_type: event.data.bounce?.message || 'unknown'
            })
            .eq("email", email);
          
          console.log(`Marked ${email} as bounced`);
        }
        break;
        
      case "email.complained":
        console.log(`Email complaint: ${resendEmailId}`);
        if (email) {
          await trackEvent("complaint");
          
          // Deactivate subscriber
          await supabase
            .from("newsletter_subscribers")
            .update({ is_active: false })
            .eq("email", email);
        }
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Update aggregated metrics on newsletter_sends
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

    console.log(`Updated metrics for send ${sendId}: ${uniqueOpens} unique opens, ${uniqueClicks} unique clicks`);
  } catch (error) {
    console.error("Failed to update send metrics:", error);
  }
}
