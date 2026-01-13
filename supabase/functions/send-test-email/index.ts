import { Resend } from "https://esm.sh/resend@2.0.0";
import { getCorsHeaders, corsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface TestEmailRequest {
  to: string;
  subject: string;
  html: string;
  previewText?: string;
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  try {
    const { to, subject, html, previewText }: TestEmailRequest = await req.json();

    if (!to || !subject || !html) {
      console.error("Missing required fields", { hasTo: !!to, hasSubject: !!subject, hasHtml: !!html });
      return new Response(
        JSON.stringify({ error: "Email, subject, and HTML content are required" }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending test email to: ${to}`);
    console.log(`Subject: ${subject}`);

    const { data, error } = await resend.emails.send({
      from: "Wellness Genius <newsletter@news.wellnessgenius.co.uk>",
      reply_to: "andy@wellnessgenius.co.uk",
      to: [to],
      subject: `[TEST] ${subject}`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    console.log("Test email sent successfully:", data);

    return new Response(
      JSON.stringify({ success: true, id: data?.id, previewText: previewText ?? null }),
      { status: 200, headers: { ...cors, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending test email:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }
});
