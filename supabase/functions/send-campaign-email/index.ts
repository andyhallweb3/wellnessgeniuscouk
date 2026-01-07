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
  specificEmail?: string; // Send to a specific subscriber email
  sendToMissing?: boolean; // Send only to subscribers who didn't receive a previous send
  previousSendId?: string; // The ID of the previous send to compare against
}

type ResendMaybeError = {
  message?: string;
  name?: string;
  statusCode?: number;
};

const isLikelyEmail = (value: string) => {
  // Intentionally simple (Resend will do final validation) – prevents obvious list issues.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const normalizeEmail = (value: unknown) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed;
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin auth via JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Unauthorized: No authorization header");
      return json(401, { error: "Unauthorized" });
    }

    // Create supabase client to verify admin role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (!user) {
      console.error("Unauthorized: Invalid token or no user", userError);
      return json(401, { error: `Authentication error: ${userError?.message || "No user found"}` });
    }

    // Check admin role
    const { data: isAdmin, error: roleError } = await supabaseAuth.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (roleError || !isAdmin) {
      console.error("Unauthorized: User is not admin", roleError);
      return json(403, { error: "Admin access required" });
    }

    console.log(`Admin ${user.email} sending campaign`);

    const {
      templateId,
      subject,
      html,
      previewText,
      testEmail,
      onlyDelivered,
      sendMode = "batch",
      specificEmail,
      sendToMissing,
      previousSendId,
    }: CampaignRequest = await req.json();

    if (!subject || !html) {
      console.error("Missing required fields");
      return json(400, { error: "Subject and HTML content are required" });
    }

    // Initialize Supabase client with service role for data access
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // If test email, just send to that address
    if (testEmail) {
      const normalizedTestEmail = normalizeEmail(testEmail);
      if (!normalizedTestEmail || !isLikelyEmail(normalizedTestEmail)) {
        return json(400, { error: "Invalid test email address" });
      }

      console.log(`Sending test email to: ${normalizedTestEmail}`);

      const { data, error } = await resend.emails.send({
        from: "Wellness Genius <newsletter@news.wellnessgenius.co.uk>",
        reply_to: "andy@wellnessgenius.co.uk",
        to: [normalizedTestEmail],
        subject: `[TEST] ${subject}`,
        html,
      });

      if (error) {
        const e = error as ResendMaybeError;
        console.error("Resend test email error:", JSON.stringify(error));
        return json(e.statusCode ?? 422, {
          error: e.message ?? "Resend validation error",
          resend: { name: e.name, statusCode: e.statusCode },
        });
      }

      console.log("Test email sent:", data?.id);
      return json(200, { success: true, testEmail: normalizedTestEmail, messageId: data?.id });
    }

    // If specificEmail, send to that single subscriber
    if (specificEmail) {
      const normalizedSpecificEmail = normalizeEmail(specificEmail);
      if (!normalizedSpecificEmail || !isLikelyEmail(normalizedSpecificEmail)) {
        return json(400, { error: "Invalid email address" });
      }

      console.log(`Sending campaign to specific email: ${normalizedSpecificEmail}`);

      const { data, error } = await resend.emails.send({
        from: "Wellness Genius <newsletter@news.wellnessgenius.co.uk>",
        reply_to: "andy@wellnessgenius.co.uk",
        to: [normalizedSpecificEmail],
        subject,
        html,
      });

      if (error) {
        const e = error as ResendMaybeError;
        console.error("Resend specific email error:", JSON.stringify(error));
        return json(e.statusCode ?? 422, {
          error: e.message ?? "Resend validation error",
          resend: { name: e.name, statusCode: e.statusCode },
        });
      }

      console.log("Specific email sent:", data?.id);
      
      // Log the campaign send
      await supabase.from("newsletter_sends").insert({
        article_count: 0,
        recipient_count: 1,
        status: "completed",
        email_html: html,
      });
      
      return json(200, { success: true, email: normalizedSpecificEmail, messageId: data?.id });
    }

    // If sendToMissing, find subscribers who didn't receive the previous send
    if (sendToMissing && previousSendId) {
      console.log(`Sending to missing subscribers from send ${previousSendId}`);

      // Get emails that were sent in the previous send
      const { data: previousRecipients, error: recipientError } = await supabase
        .from("newsletter_send_recipients")
        .select("email")
        .eq("send_id", previousSendId)
        .eq("status", "sent");

      if (recipientError) {
        console.error("Error fetching previous recipients:", recipientError);
        throw recipientError;
      }

      const previousEmails = new Set((previousRecipients || []).map((r) => r.email.toLowerCase()));
      console.log(`Previous send had ${previousEmails.size} successful recipients`);

      // Get all active subscribers
      const { data: allSubscribers, error: subError } = await supabase
        .from("newsletter_subscribers")
        .select("email")
        .eq("is_active", true)
        .eq("bounced", false);

      if (subError) {
        console.error("Error fetching subscribers:", subError);
        throw subError;
      }

      // Filter to only those who weren't in the previous send
      const missingEmails = (allSubscribers || [])
        .map((s) => normalizeEmail(s.email))
        .filter((e): e is string => e !== null && isLikelyEmail(e) && !previousEmails.has(e.toLowerCase()));

      if (missingEmails.length === 0) {
        return json(400, { error: "No missing subscribers found - everyone received the previous send" });
      }

      console.log(`Found ${missingEmails.length} missing subscribers to send to`);

      // Create send record first
      const { data: sendRecord, error: sendError } = await supabase
        .from("newsletter_sends")
        .insert({
          article_count: 0,
          recipient_count: 0,
          status: "sending",
          email_html: html,
        })
        .select("id")
        .single();

      if (sendError || !sendRecord) {
        console.error("Failed to create send record:", sendError);
        throw sendError || new Error("Failed to create send record");
      }

      const sendId = sendRecord.id;
      let successCount = 0;
      let errorCount = 0;

      // Send individually for tracking
      for (let i = 0; i < missingEmails.length; i++) {
        const email = missingEmails[i];
        try {
          const { data, error } = await resend.emails.send({
            from: "Wellness Genius <newsletter@news.wellnessgenius.co.uk>",
            reply_to: "andy@wellnessgenius.co.uk",
            to: [email],
            subject,
            html,
          });

          if (error) {
            console.error(`Email to ${email} failed:`, JSON.stringify(error));
            errorCount++;
            // Log recipient status
            await supabase.from("newsletter_send_recipients").insert({
              send_id: sendId,
              email,
              status: "failed",
              error_message: (error as any).message || "Send failed",
            });
          } else {
            console.log(`Email to ${email} sent:`, data?.id);
            successCount++;
            // Log recipient status
            await supabase.from("newsletter_send_recipients").insert({
              send_id: sendId,
              email,
              status: "sent",
              sent_at: new Date().toISOString(),
            });
          }
        } catch (sendError: any) {
          console.error(`Email to ${email} error:`, sendError);
          errorCount++;
          await supabase.from("newsletter_send_recipients").insert({
            send_id: sendId,
            email,
            status: "failed",
            error_message: sendError?.message || "Unknown error",
          });
        }

        // Rate limit: ~10 emails per second
        if (i < missingEmails.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      console.log(`Send to missing complete: ${successCount} sent, ${errorCount} failed`);

      // Update the send record with final counts
      await supabase
        .from("newsletter_sends")
        .update({
          recipient_count: successCount,
          status: errorCount === 0 ? "completed" : "partial",
        })
        .eq("id", sendId);

      return json(200, {
        success: true,
        recipientCount: successCount,
        errorCount,
        mode: "send-to-missing",
        sendId,
      });
    }

    // Build query for active subscribers - EXCLUDE bounced and unsubscribed
    let query = supabase
      .from("newsletter_subscribers")
      .select("email, name, last_delivered_at")
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
      return json(400, { error: "No eligible subscribers found" });
    }

    const filterMode = onlyDelivered ? "confirmed deliveries only" : "all active";
    console.log(
      `Sending campaign to ${subscribers.length} subscribers (${filterMode}) using ${sendMode} mode`
    );

    // Helper function to personalize HTML for a subscriber
    const personalizeHtml = (htmlContent: string, subscriberEmail: string, subscriberName: string | null): string => {
      // Extract first name from name or email
      let firstName = "there";
      if (subscriberName && subscriberName.trim()) {
        // Get first word of name
        firstName = subscriberName.trim().split(/\s+/)[0];
      } else {
        // Try to extract from email (before @ and before any dots/numbers)
        const emailPrefix = subscriberEmail.split("@")[0];
        const cleanPrefix = emailPrefix.replace(/[._0-9]/g, " ").split(" ")[0];
        if (cleanPrefix.length >= 2) {
          firstName = cleanPrefix.charAt(0).toUpperCase() + cleanPrefix.slice(1).toLowerCase();
        }
      }

      const siteUrl = "https://www.wellnessgenius.co.uk";
      
      return htmlContent
        .replace(/\{\{contact\.firstname\}\}/gi, firstName)
        .replace(/\{\{first_name\}\}/gi, firstName)
        .replace(/\{\{firstname\}\}/gi, firstName)
        .replace(/\{\{name\}\}/gi, subscriberName || firstName)
        .replace(/\{\{email\}\}/gi, subscriberEmail)
        .replace(/\{\{site_url\}\}/gi, siteUrl);
    };

    // Normalize + basic validation to avoid Resend 422 due to stray whitespace/bad rows.
    const validSubscribers = subscribers
      .map((s) => ({
        email: normalizeEmail(s.email),
        name: s.name,
      }))
      .filter((s): s is { email: string; name: string | null } => 
        s.email !== null && isLikelyEmail(s.email)
      );

    const invalidCount = subscribers.length - validSubscribers.length;
    if (invalidCount > 0) {
      console.warn(`Found ${invalidCount} invalid subscriber emails; excluding from send.`);
    }

    if (validSubscribers.length === 0) {
      return json(400, { error: "No valid subscriber emails to send to" });
    }

    let successCount = 0;
    let errorCount = 0;
    const recipientResults: { email: string; messageId?: string; error?: string }[] = [];

    if (sendMode === "individual") {
      // Individual mode: send one email per recipient for better tracking + personalization
      console.log("Using individual sending mode for per-recipient tracking with personalization");

      for (let i = 0; i < validSubscribers.length; i++) {
        const subscriber = validSubscribers[i];
        const personalizedHtml = personalizeHtml(html, subscriber.email, subscriber.name);
        
        try {
          const { data, error } = await resend.emails.send({
            from: "Wellness Genius <newsletter@news.wellnessgenius.co.uk>",
            reply_to: "andy@wellnessgenius.co.uk",
            to: [subscriber.email],
            subject,
            html: personalizedHtml,
          });

          if (error) {
            const e = error as ResendMaybeError;
            console.error(`Email to ${subscriber.email} failed:`, JSON.stringify(error));
            errorCount++;
            recipientResults.push({ email: subscriber.email, error: e.message ?? "Resend error" });
          } else {
            console.log(`Email to ${subscriber.email} sent:`, data?.id);
            successCount++;
            recipientResults.push({ email: subscriber.email, messageId: data?.id });
          }
        } catch (sendError: any) {
          console.error(`Email to ${subscriber.email} error:`, sendError);
          errorCount++;
          recipientResults.push({ email: subscriber.email, error: sendError?.message ?? "Unknown send error" });
        }

        // Rate limit: ~10 emails per second (100ms delay)
        if (i < validSubscribers.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    } else {
      // Batch mode: use BCC for efficiency (no personalization possible)
      console.log("Using batch BCC mode (personalization disabled - use individual mode for personalized emails)");
      const batchSize = 48;
      
      // For batch mode, replace placeholders with generic fallback
      const genericHtml = html
        .replace(/\{\{contact\.firstname\}\}/gi, "there")
        .replace(/\{\{first_name\}\}/gi, "there")
        .replace(/\{\{firstname\}\}/gi, "there")
        .replace(/\{\{name\}\}/gi, "there")
        .replace(/\{\{email\}\}/gi, "")
        .replace(/\{\{site_url\}\}/gi, "https://www.wellnessgenius.co.uk");

      const emails = validSubscribers.map(s => s.email);

      for (let i = 0; i < emails.length; i += batchSize) {
        const batch = emails.slice(i, i + batchSize);

        try {
          const { data, error } = await resend.emails.send({
            from: "Wellness Genius <newsletter@news.wellnessgenius.co.uk>",
            reply_to: "andy@wellnessgenius.co.uk",
            to: ["newsletter@news.wellnessgenius.co.uk"],
            bcc: batch,
            subject,
            html: genericHtml,
          });

          if (error) {
            const e = error as ResendMaybeError;
            console.error(`Batch ${i / batchSize + 1} error:`, JSON.stringify(error));
            errorCount += batch.length;

            // If Resend gives us a specific validation error, bubble it up.
            if (e.statusCode === 422) {
              return json(422, {
                error: e.message ?? "Resend validation error",
                resend: { name: e.name, statusCode: e.statusCode },
              });
            }
          } else {
            console.log(`Batch ${i / batchSize + 1} sent successfully:`, data?.id);
            successCount += batch.length;
          }
        } catch (batchError: any) {
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

    return json(200, {
      success: true,
      recipientCount: successCount,
      errorCount,
      excludedInvalidEmails: invalidCount,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending campaign:", message);
    return json(500, { error: message });
  }
});
