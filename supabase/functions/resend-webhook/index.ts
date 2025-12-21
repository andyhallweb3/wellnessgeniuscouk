import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    // For bounce/complaint events
    bounce?: {
      message: string;
    };
    // For click events
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
    
    // Verify webhook signature if secret is configured
    if (webhookSecret) {
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
      
      // Note: For full signature verification, you'd use the Svix library
      // For now, we just check headers are present
      console.log("Webhook signature headers present");
    }

    const event: ResendWebhookEvent = await req.json();
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
        // Update newsletter_events if this is a newsletter email
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
        
      case "email.bounced":
        console.log(`Email bounced: ${event.data.email_id}, reason: ${event.data.bounce?.message}`);
        // Optionally mark subscriber as inactive
        if (event.data.to?.[0]) {
          await supabase
            .from("newsletter_subscribers")
            .update({ is_active: false })
            .eq("email", event.data.to[0]);
        }
        break;
        
      case "email.complained":
        console.log(`Email complaint: ${event.data.email_id}`);
        // Mark subscriber as inactive on complaint
        if (event.data.to?.[0]) {
          await supabase
            .from("newsletter_subscribers")
            .update({ is_active: false })
            .eq("email", event.data.to[0]);
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
