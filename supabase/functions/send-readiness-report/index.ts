import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");



const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PillarResult {
  pillar: string;
  score: number;
  status: string;
}

interface ReportRequest {
  userInfo: {
    name: string;
    email: string;
    company: string;
    role: string;
    industry: string;
    companySize: string;
    primaryGoal: string;
  };
  overallScore: number;
  pillarResults: PillarResult[];
  headline: string;
  recommendation: string;
}

const getStatusEmoji = (score: number): string => {
  if (score < 40) return "🔴";
  if (score < 60) return "🟡";
  if (score < 80) return "🟢";
  return "⭐";
};

const getStatusLabel = (score: number): string => {
  if (score < 40) return "Critical";
  if (score < 60) return "Needs Work";
  if (score < 80) return "Healthy";
  return "Strong";
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-readiness-report: Received request");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userInfo, overallScore, pillarResults, headline, recommendation }: ReportRequest = await req.json();

    console.log(`Sending report to ${userInfo.email} with score ${overallScore}`);

    const pillarRows = pillarResults.map(p => `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e5e5;">${p.pillar}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e5e5; text-align: center;">${getStatusEmoji(p.score)} ${getStatusLabel(p.score)}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e5e5; text-align: center; font-weight: 600;">${p.score}/100</td>
      </tr>
    `).join("");

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your AI Readiness Report</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
      <h1 style="color: white; margin: 0 0 10px 0; font-size: 28px; font-weight: 600;">AI Readiness Report</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">Wellness Genius</p>
    </div>

    <!-- Score Banner -->
    <div style="background: white; padding: 30px; text-align: center; border-left: 1px solid #e5e5e5; border-right: 1px solid #e5e5e5;">
      <p style="margin: 0 0 15px 0; color: #666; font-size: 14px;">Your Overall Score</p>
      <div style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; font-size: 48px; font-weight: 700; padding: 20px 40px; border-radius: 12px;">
        ${overallScore}<span style="font-size: 24px; font-weight: 400;">/100</span>
      </div>
    </div>

    <!-- Headline -->
    <div style="background: #fafafa; padding: 25px 30px; border-left: 1px solid #e5e5e5; border-right: 1px solid #e5e5e5;">
      <h2 style="margin: 0 0 10px 0; color: #1a1a1a; font-size: 20px; font-weight: 600;">${headline}</h2>
      <p style="margin: 0; color: #666; font-size: 14px;">Prepared for ${userInfo.name} at ${userInfo.company}</p>
    </div>

    <!-- Pillar Breakdown -->
    <div style="background: white; padding: 30px; border-left: 1px solid #e5e5e5; border-right: 1px solid #e5e5e5;">
      <h3 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 18px; font-weight: 600;">Your Pillar Breakdown</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f5f5f5;">
            <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase;">Pillar</th>
            <th style="padding: 12px 16px; text-align: center; font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase;">Status</th>
            <th style="padding: 12px 16px; text-align: center; font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase;">Score</th>
          </tr>
        </thead>
        <tbody>
          ${pillarRows}
        </tbody>
      </table>
    </div>

    <!-- Recommendation -->
    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px 30px; border-left: 1px solid #e5e5e5; border-right: 1px solid #e5e5e5;">
      <h3 style="margin: 0 0 10px 0; color: #92400e; font-size: 16px; font-weight: 600;">💡 Recommended Next Step</h3>
      <p style="margin: 0; color: #78350f; font-size: 14px;"><strong>${recommendation}</strong> — Book a free 30-minute strategy call to discuss your results and get actionable next steps.</p>
    </div>

    <!-- CTA -->
    <div style="background: white; padding: 30px; text-align: center; border-left: 1px solid #e5e5e5; border-right: 1px solid #e5e5e5;">
      <a href="https://calendly.com/andy-wellnessgenius/30min" style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Book Your Free Strategy Call</a>
    </div>

    <!-- Footer -->
    <div style="background: #1a1a1a; padding: 25px 30px; text-align: center; border-radius: 0 0 12px 12px;">
      <p style="margin: 0 0 10px 0; color: #999; font-size: 12px;">
        This report was generated by the AI Readiness Index™ assessment.
      </p>
      <p style="margin: 0; color: #666; font-size: 12px;">
        © ${new Date().getFullYear()} Wellness Genius | <a href="https://wellnessgenius.co.uk" style="color: #14b8a6; text-decoration: none;">wellnessgenius.co.uk</a>
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Wellness Genius <hello@news.wellnessgenius.co.uk>",
        to: [userInfo.email],
        subject: `Your AI Readiness Score: ${overallScore}/100 — ${headline}`,
        html: emailHtml,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      throw new Error(emailData.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true, id: emailData.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending readiness report:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
