import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PillarScore {
  name: string;
  shortName: string;
  score: number;
  status: string;
}

interface ResultsEmailData {
  email: string;
  name: string;
  company: string;
  completionId: string;
  overallScore: number;
  scoreBand: string;
  pillarScores: PillarScore[];
}

const getStatusColor = (score: number): string => {
  if (score < 40) return "#ef4444"; // red
  if (score < 60) return "#eab308"; // yellow
  if (score < 80) return "#14b8a6"; // teal
  return "#22c55e"; // green
};

const getStatusLabel = (score: number): string => {
  if (score < 40) return "Critical";
  if (score < 60) return "Needs Work";
  if (score < 80) return "Healthy";
  return "Strong";
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-readiness-results-email: Received request");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ResultsEmailData = await req.json();

    if (!data.email || !data.completionId) {
      console.error("Missing email or completionId");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const resultsUrl = `${supabaseUrl?.replace('.supabase.co', '')?.includes('localhost') 
      ? 'http://localhost:5173' 
      : 'https://wellnessgenius.ai'}/ai-readiness/results/${data.completionId}`;

    console.log(`Sending results email to ${data.email}`);

    // Build pillar breakdown HTML
    const pillarBreakdownHtml = data.pillarScores.map(p => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
          <span style="font-weight: 500;">${p.shortName}</span>
        </td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
          <span style="color: ${getStatusColor(p.score)}; font-weight: 600;">${p.score}%</span>
          <span style="color: #6b7280; font-size: 12px; margin-left: 8px;">${getStatusLabel(p.score)}</span>
        </td>
      </tr>
    `).join('');

    const emailResponse = await resend.emails.send({
      from: "Wellness Genius <hello@news.wellnessgenius.co.uk>",
      reply_to: "andy@wellnessgenius.co.uk",
      to: [data.email],
      subject: `Your AI Readiness Score: ${data.overallScore}/100 — ${data.scoreBand}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="padding: 30px 20px; text-align: center; background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Your AI Readiness Score</h1>
          </div>
          
          <div style="padding: 30px 20px;">
            <p style="margin: 0 0 20px 0;">Hi ${data.name || 'there'},</p>
            <p style="margin: 0 0 20px 0;">Thanks for completing the AI Readiness Assessment${data.company ? ` for ${data.company}` : ''}. Here's a summary of your results:</p>
            
            <div style="background: #f0fdfa; padding: 24px; border-radius: 12px; text-align: center; margin: 24px 0;">
              <div style="font-size: 48px; font-weight: 700; color: #0f766e; margin-bottom: 8px;">${data.overallScore}</div>
              <div style="font-size: 14px; color: #6b7280; margin-bottom: 12px;">out of 100</div>
              <div style="display: inline-block; background: #0f766e; color: #ffffff; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600;">
                ${data.scoreBand}
              </div>
            </div>
            
            <h2 style="font-size: 18px; margin: 24px 0 16px 0; color: #111827;">Pillar Breakdown</h2>
            <table style="width: 100%; border-collapse: collapse;">
              ${pillarBreakdownHtml}
            </table>
            
            <div style="margin-top: 32px; text-align: center;">
              <a href="${resultsUrl}" style="display: inline-block; background: #0f766e; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                View Full Results
              </a>
            </div>
            
            <div style="margin-top: 32px; padding: 20px; background: #fef3c7; border-radius: 8px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #92400e;">🔓 Want the full diagnostic?</h3>
              <p style="margin: 0 0 12px 0; font-size: 14px; color: #92400e;">
                Unlock your complete AI Readiness Report with revenue projections, top blockers, and a 90-day action plan.
              </p>
              <a href="${resultsUrl}" style="color: #92400e; font-weight: 600; font-size: 14px;">
                Unlock for £99 →
              </a>
            </div>
            
            <p style="margin-top: 32px; color: #6b7280; font-size: 14px;">
              Your results link is valid for 24 hours. After that, sign in to access your saved assessments.
            </p>
            
            <p style="margin-top: 24px;">
              Best regards,<br>
              <strong>The Wellness Genius Team</strong>
            </p>
          </div>
          
          <div style="padding: 20px; background: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #6b7280; margin: 0;">
              You received this email because you completed an AI Readiness Assessment on wellnessgenius.ai
            </p>
          </div>
        </div>
      `,
    });

    console.log("Results email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending results email:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
