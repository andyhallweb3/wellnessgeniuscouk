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

    // Handle different event types
    switch (event.type) {
      case "email.sent":
        console.log(`Email sent: ${event.data.email_id} to ${event.data.to.join(", ")}`);
        break;
        
      case "email.delivered":
        console.log(`Email delivered: ${event.data.email_id}`);
        break;
        
      case "email.opened":
        console.log(`Email opened: ${event.data.email_id}`);
        if (event.data.to?.[0]) {
          await supabase.from("newsletter_events").insert({
            event_type: "open",
            subscriber_email: event.data.to[0],
            send_id: event.data.email_id,
          }).select().maybeSingle();
        }
        break;
        
      case "email.clicked":
        console.log(`Email clicked: ${event.data.email_id}, link: ${event.data.click?.link}`);
        if (event.data.to?.[0]) {
          await supabase.from("newsletter_events").insert({
            event_type: "click",
            subscriber_email: event.data.to[0],
            send_id: event.data.email_id,
            link_url: event.data.click?.link,
          }).select().maybeSingle();
        }
        break;
        
      case "email.delivery_delayed":
        console.log(`Email delivery delayed: ${event.data.email_id} to ${event.data.to?.join(", ")}`);
        if (event.data.to?.[0]) {
          await supabase.from("newsletter_events").insert({
            event_type: "delivery_delayed",
            subscriber_email: event.data.to[0],
            send_id: event.data.email_id,
          }).select().maybeSingle();
        }
        break;

      case "email.bounced":
        console.log(`Email bounced: ${event.data.email_id}, reason: ${event.data.bounce?.message}`);
        if (event.data.to?.[0]) {
          // Track the bounce event
          await supabase.from("newsletter_events").insert({
            event_type: "bounce",
            subscriber_email: event.data.to[0],
            send_id: event.data.email_id,
          }).select().maybeSingle();
          
          // Mark subscriber as bounced and deactivate
          await supabase
            .from("newsletter_subscribers")
            .update({ 
              is_active: false,
              bounced: true,
              bounced_at: new Date().toISOString(),
              bounce_type: event.data.bounce?.message || 'unknown'
            })
            .eq("email", event.data.to[0]);
          
          console.log(`Marked ${event.data.to[0]} as bounced`);
        }
        break;
        
      case "email.complained":
        console.log(`Email complaint: ${event.data.email_id}`);
        if (event.data.to?.[0]) {
          // Track the complaint event
          await supabase.from("newsletter_events").insert({
            event_type: "complaint",
            subscriber_email: event.data.to[0],
            send_id: event.data.email_id,
          }).select().maybeSingle();
          
          // Deactivate subscriber
          await supabase
            .from("newsletter_subscribers")
            .update({ is_active: false })
            .eq("email", event.data.to[0]);
        }
        break;

      case "email.sent":
        console.log(`Email sent: ${event.data.email_id} to ${event.data.to?.join(", ")}`);
        break;
        
      case "email.delivered":
        console.log(`Email delivered: ${event.data.email_id}`);
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
