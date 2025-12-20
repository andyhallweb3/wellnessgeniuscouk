import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UpsellRequest {
  email: string;
  name: string | null;
  productId: string;
  productName: string;
  forceResend?: boolean;
}

const UPSELL_CONFIG: Record<string, { subject: string; heading: string; products: { name: string; price: string; link: string; description: string }[] }> = {
  "myths-deck": {
    subject: "Ready to go deeper? Your next step with AI in wellness",
    heading: "You've got the myths. Now get the full picture.",
    products: [
      {
        name: "AI Readiness Score",
        price: "£99",
        link: "https://wellnessgenius.io/ai-readiness/start",
        description: "Complete diagnostic with conservative revenue projections, blockers, and your personalised 90-day action plan.",
      },
      {
        name: "Wellness AI Builder – Prompt Pack",
        price: "£49",
        link: "https://wellnessgenius.io/products",
        description: "Copy-ready prompt frameworks for founders building AI into wellness.",
      },
    ],
  },
  "reality-checklist": {
    subject: "Your 90-day checklist is ready. Here's what comes next.",
    heading: "You've got the checklist. Now get the support to execute it.",
    products: [
      {
        name: "90-Day AI Activation Playbook",
        price: "£149",
        link: "https://wellnessgenius.io/products",
        description: "25-page structured playbook for businesses ready to accelerate.",
      },
      {
        name: "AI Readiness Score",
        price: "£99",
        link: "https://wellnessgenius.io/ai-readiness/start",
        description: "Get your personalised score with blockers identified and action plan.",
      },
    ],
  },
  default: {
    subject: "Thanks for downloading. Here's what's next.",
    heading: "Ready to take the next step?",
    products: [
      {
        name: "AI Readiness Score",
        price: "£99",
        link: "https://wellnessgenius.io/ai-readiness/start",
        description: "Complete diagnostic with your personalised 90-day action plan.",
      },
      {
        name: "Wellness AI Builder – Prompt Pack",
        price: "£49",
        link: "https://wellnessgenius.io/products",
        description: "Copy-ready prompt frameworks for founders building AI into wellness.",
      },
    ],
  },
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[UPSELL-EMAIL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { email, name, productId, productName, forceResend } = await req.json() as UpsellRequest;
    logStep("Request received", { email, productId, forceResend });

    if (!email || !productId) {
      throw new Error("Missing required fields: email, productId");
    }

    // Check if we've already sent an upsell for this download (unless forcing)
    if (!forceResend) {
      const { data: existingDownload } = await supabase
        .from("product_downloads")
        .select("id, upsell_email_sent")
        .eq("email", email)
        .eq("product_id", productId)
        .eq("upsell_email_sent", true)
        .maybeSingle();

      if (existingDownload) {
        logStep("Upsell already sent", { downloadId: existingDownload.id });
        return new Response(JSON.stringify({ success: true, skipped: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const config = UPSELL_CONFIG[productId] || UPSELL_CONFIG.default;
    const resend = new Resend(resendKey);

    const firstName = name?.split(" ")[0] || "there";
    
    const productsHtml = config.products.map(p => `
      <div style="background-color: #27272a; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <h3 style="font-size: 16px; margin: 0; color: #ffffff;">${p.name}</h3>
          <span style="font-size: 18px; font-weight: bold; color: #2dd4bf;">${p.price}</span>
        </div>
        <p style="color: #a1a1aa; font-size: 14px; margin: 0 0 12px 0;">${p.description}</p>
        <a href="${p.link}" style="display: inline-block; background-color: #2dd4bf; color: #18181b; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500;">Learn More →</a>
      </div>
    `).join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #18181b; color: #ffffff; padding: 40px 20px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(to right, #2dd4bf, #14b8a6); height: 4px; border-radius: 2px; margin-bottom: 32px;"></div>
          
          <h1 style="font-size: 24px; margin-bottom: 16px; color: #ffffff;">${config.heading}</h1>
          
          <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Hi ${firstName},<br><br>
            Thanks for downloading the <strong style="color: #2dd4bf;">${productName}</strong>. 
            If you found it useful, here are some ways to go deeper:
          </p>
          
          ${productsHtml}
          
          <div style="background-color: #27272a; border-radius: 8px; padding: 20px; margin-top: 24px;">
            <p style="color: #a1a1aa; font-size: 14px; margin: 0;">
              <strong style="color: #ffffff;">Questions?</strong> Just reply to this email. I read every message.
            </p>
          </div>
          
          <p style="color: #71717a; font-size: 14px; margin-top: 32px;">
            Best,<br>
            <strong style="color: #a1a1aa;">Andy @ Wellness Genius</strong>
          </p>
          
          <div style="border-top: 1px solid #27272a; margin-top: 32px; padding-top: 24px;">
            <p style="color: #52525b; font-size: 12px; margin: 0;">
              Wellness Genius • <a href="https://wellnessgenius.io" style="color: #52525b;">wellnessgenius.io</a>
              <br><br>
              <a href="https://wellnessgenius.io/unsubscribe?email=${encodeURIComponent(email)}" style="color: #52525b;">Unsubscribe</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    logStep("Sending email", { to: email, subject: config.subject });

    const { error: emailError } = await resend.emails.send({
      from: "Wellness Genius <hello@wellnessgenius.io>",
      to: [email],
      subject: config.subject,
      html: emailHtml,
    });

    if (emailError) {
      logStep("Email error", emailError);
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    // Mark as sent in database
    const { error: updateError } = await supabase
      .from("product_downloads")
      .update({
        upsell_email_sent: true,
        upsell_email_sent_at: new Date().toISOString(),
      })
      .eq("email", email)
      .eq("product_id", productId);

    if (updateError) {
      logStep("Failed to update download record", updateError);
    }

    logStep("Email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
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
