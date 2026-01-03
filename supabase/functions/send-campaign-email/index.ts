import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-secret",
};

interface CampaignRequest {
  templateId: string;
  subject: string;
  html: string;
  previewText?: string;
  testEmail?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin auth
    const adminSecret = req.headers.get("x-admin-secret");
    if (adminSecret !== Deno.env.get("ADMIN_SECRET")) {
      console.error("Unauthorized: Invalid admin secret");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { templateId, subject, html, previewText, testEmail }: CampaignRequest = await req.json();

    if (!subject || !html) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Subject and HTML content are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // If test email, just send to that address
    if (testEmail) {
      console.log(`Sending test email to: ${testEmail}`);
      const { data, error } = await resend.emails.send({
        from: "Wellness Genius <newsletter@news.wellnessgenius.co.uk>",
        reply_to: "andy@wellnessgenius.co.uk",
        to: [testEmail],
        subject: `[TEST] ${subject}`,
        html: html,
      });

      if (error) {
        console.error("Test email error:", error);
        throw new Error(error.message);
      }

      console.log("Test email sent:", data?.id);
      return new Response(
        JSON.stringify({ success: true, testEmail, messageId: data?.id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch active subscribers - EXCLUDE bounced and unsubscribed
    const { data: subscribers, error: fetchError } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .eq("is_active", true)
      .eq("bounced", false);

    if (fetchError) {
      console.error("Error fetching subscribers:", fetchError);
      throw fetchError;
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ error: "No active subscribers found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending campaign to ${subscribers.length} active, non-bounced subscribers`);

    // Send emails in batches of 50 to avoid rate limits
    const batchSize = 50;
    const emails = subscribers.map((s) => s.email);
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      
      // Use batch sending with BCC for efficiency
      try {
        const { data, error } = await resend.emails.send({
          from: "Wellness Genius <newsletter@news.wellnessgenius.co.uk>",
          reply_to: "andy@wellnessgenius.co.uk",
          to: ["newsletter@news.wellnessgenius.co.uk"], // Send to self
          bcc: batch, // BCC all recipients in batch
          subject: subject,
          html: html,
        });

        if (error) {
          console.error(`Batch ${i / batchSize + 1} error:`, error);
          errorCount += batch.length;
        } else {
          console.log(`Batch ${i / batchSize + 1} sent successfully:`, data?.id);
          successCount += batch.length;
        }
      } catch (batchError) {
        console.error(`Batch ${i / batchSize + 1} failed:`, batchError);
        errorCount += batch.length;
      }

      // Small delay between batches to avoid rate limits
      if (i + batchSize < emails.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log(`Campaign complete: ${successCount} sent, ${errorCount} failed`);

    // Log the campaign send
    await supabase.from("newsletter_sends").insert({
      article_count: 0,
      recipient_count: successCount,
      status: errorCount === 0 ? "completed" : "partial",
      email_html: html,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        recipientCount: successCount,
        errorCount: errorCount,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending campaign:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
