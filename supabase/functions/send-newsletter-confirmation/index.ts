import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationRequest {
  email: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: ConfirmationRequest = await req.json();

    if (!email) {
      console.error("No email provided");
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending newsletter confirmation to: ${email}`);

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Wellness Genius</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #111111; border-radius: 12px; border: 1px solid #222222;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid #222222;">
              <h1 style="margin: 0; color: #14b8a6; font-size: 28px; font-weight: 700;">
                Wellness Genius
              </h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                You're on the list! 🎉
              </h2>
              
              <p style="margin: 0 0 20px 0; color: #a1a1aa; font-size: 16px; line-height: 1.6;">
                Thanks for subscribing to the Wellness Genius newsletter. You'll now receive curated insights on AI, automation, and growth strategies for wellness, fitness, and hospitality brands.
              </p>

              <!-- Free Gift Section -->
              <div style="background: linear-gradient(135deg, #14b8a6, #0d9488); border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 12px 0; color: #ffffff; font-size: 18px; font-weight: 600;">
                  🎁 Your Free Gift: AI Prompt Pack
                </h3>
                <p style="margin: 0 0 16px 0; color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.6;">
                  As a thank you for subscribing, here's a 100% discount code for our Wellness AI Prompt Pack (worth £19.99):
                </p>
                <div style="background-color: rgba(0,0,0,0.3); border-radius: 8px; padding: 16px; text-align: center;">
                  <code style="font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: 2px;">LzcFF5Ii</code>
                </div>
              </div>

              <!-- How to Download Steps -->
              <div style="background-color: #1a1a1a; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #333;">
                <h3 style="margin: 0 0 16px 0; color: #ffffff; font-size: 16px; font-weight: 600;">
                  📥 How to Download Your Free Guide:
                </h3>
                <ol style="margin: 0; padding-left: 20px; color: #a1a1aa; font-size: 14px; line-height: 2;">
                  <li>Click the button below to go to Products</li>
                  <li>Find "Wellness AI Prompt Pack" and click <strong style="color: #ffffff;">Buy Now</strong></li>
                  <li>On checkout, enter the promo code: <strong style="color: #14b8a6;">LzcFF5Ii</strong></li>
                  <li>Complete checkout (£0.00) and download your PDF!</li>
                </ol>
              </div>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, #14b8a6, #0d9488); border-radius: 8px;">
                    <a href="https://www.wellnessgenius.co.uk/products" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
                      Get Your Free AI Prompt Pack →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0 0; color: #a1a1aa; font-size: 16px; line-height: 1.6;">
                <strong style="color: #ffffff;">What to expect from our newsletter:</strong>
              </p>
              
              <ul style="margin: 16px 0 0 0; padding-left: 20px; color: #a1a1aa; font-size: 16px; line-height: 1.8;">
                <li>Weekly industry news and trends</li>
                <li>AI and automation insights for operators</li>
                <li>Practical strategies you can implement</li>
                <li>Early access to resources and tools</li>
              </ul>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #0a0a0a; border-top: 1px solid #222222; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 10px 0; color: #71717a; font-size: 14px; text-align: center;">
                Wellness Genius | AI & Automation for Wellness Brands
              </p>
              <p style="margin: 0; color: #71717a; font-size: 12px; text-align: center;">
                <a href="https://www.wellnessgenius.co.uk/unsubscribe?email=${encodeURIComponent(email)}" style="color: #71717a; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const { data, error } = await resend.emails.send({
      from: "Wellness Genius <newsletter@news.wellnessgenius.co.uk>",
      reply_to: "andy@wellnessgenius.co.uk",
      to: [email],
      subject: "Welcome to Wellness Genius 🎉",
      html: emailHtml,
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Confirmation email sent successfully:", data);

    return new Response(
      JSON.stringify({ success: true, id: data?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending confirmation:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
