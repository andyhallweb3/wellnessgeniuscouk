import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CampaignRequest {
  templateId: string;
  subject: string;
  html: string;
  previewText?: string;
  testEmail?: string;
  onlyDelivered?: boolean;
  sendMode?: "batch" | "individual"; // batch = BCC, individual = one email per recipient
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin auth via JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Unauthorized: No authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create supabase client to verify admin role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      console.error("Unauthorized: Invalid token", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check admin role
    const { data: isAdmin, error: roleError } = await supabaseAuth.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin',
    });

    if (roleError || !isAdmin) {
      console.error("Unauthorized: User is not admin", roleError);
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Admin ${user.email} sending campaign`);

    const { templateId, subject, html, previewText, testEmail, onlyDelivered, sendMode = "batch" }: CampaignRequest = await req.json();

    if (!subject || !html) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Subject and HTML content are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role for data access
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

    // Build query for active subscribers - EXCLUDE bounced and unsubscribed
    let query = supabase
      .from("newsletter_subscribers")
      .select("email, last_delivered_at")
      .eq("is_active", true)
      .eq("bounced", false);

    // If onlyDelivered flag is set, only include subscribers with prior confirmed delivery
    if (onlyDelivered) {
      query = query.not("last_delivered_at", "is", null);
    }

    const { data: subscribers, error: fetchError } = await query;

    if (fetchError) {
      console.error("Error fetching subscribers:", fetchError);
      throw fetchError;
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ error: "No eligible subscribers found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const filterMode = onlyDelivered ? "confirmed deliveries only" : "all active";
    console.log(`Sending campaign to ${subscribers.length} subscribers (${filterMode}) using ${sendMode} mode`);

    const emails = subscribers.map((s) => s.email);
    let successCount = 0;
    let errorCount = 0;
    const recipientResults: { email: string; messageId?: string; error?: string }[] = [];

    if (sendMode === "individual") {
      // Individual mode: send one email per recipient for better tracking
      console.log("Using individual sending mode for per-recipient tracking");
      
      for (let i = 0; i < emails.length; i++) {
        const email = emails[i];
        try {
          const { data, error } = await resend.emails.send({
            from: "Wellness Genius <newsletter@news.wellnessgenius.co.uk>",
            reply_to: "andy@wellnessgenius.co.uk",
            to: [email],
            subject: subject,
            html: html,
          });

          if (error) {
            console.error(`Email to ${email} failed:`, error);
            errorCount++;
            recipientResults.push({ email, error: error.message });
          } else {
            console.log(`Email to ${email} sent:`, data?.id);
            successCount++;
            recipientResults.push({ email, messageId: data?.id });
            
            // Update subscriber with message ID for tracking
            await supabase
              .from("newsletter_subscribers")
              .update({ last_message_id: data?.id })
              .eq("email", email);
          }
        } catch (sendError: any) {
          console.error(`Email to ${email} error:`, sendError);
          errorCount++;
          recipientResults.push({ email, error: sendError.message });
        }

        // Rate limit: ~10 emails per second (100ms delay)
        if (i < emails.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    } else {
      // Batch mode: use BCC for efficiency (less tracking granularity)
      console.log("Using batch BCC mode");
      const batchSize = 48;

      for (let i = 0; i < emails.length; i += batchSize) {
        const batch = emails.slice(i, i + batchSize);
        
        try {
          const { data, error } = await resend.emails.send({
            from: "Wellness Genius <newsletter@news.wellnessgenius.co.uk>",
            reply_to: "andy@wellnessgenius.co.uk",
            to: ["newsletter@news.wellnessgenius.co.uk"],
            bcc: batch,
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

        if (i + batchSize < emails.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
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
