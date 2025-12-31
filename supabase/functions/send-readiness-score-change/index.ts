import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScoreChangeRequest {
  completionId: string;
  email: string;
  name: string;
  currentScore: number;
  previousScore: number;
  currentBand: string;
  previousBand: string;
}

const getScoreChangeMessage = (diff: number, currentBand: string, previousBand: string): string => {
  if (diff > 0) {
    if (currentBand !== previousBand) {
      return `Congratulations! Your AI readiness has improved by ${diff} points and you've moved up to the "${currentBand}" tier!`;
    }
    return `Great progress! Your AI readiness score has improved by ${diff} points.`;
  } else {
    if (currentBand !== previousBand) {
      return `Your AI readiness score has decreased by ${Math.abs(diff)} points. You've moved from "${previousBand}" to "${currentBand}".`;
    }
    return `Your AI readiness score has decreased by ${Math.abs(diff)} points.`;
  }
};

const getBandColor = (band: string): string => {
  const colors: Record<string, string> = {
    "AI-Native": "#22c55e",
    "Scalable": "#3b82f6",
    "Operational": "#f59e0b",
    "Emerging": "#f97316",
    "Foundational": "#ef4444",
  };
  return colors[band] || "#6b7280";
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      completionId,
      email, 
      name, 
      currentScore, 
      previousScore,
      currentBand,
      previousBand
    }: ScoreChangeRequest = await req.json();

    const scoreDiff = currentScore - previousScore;
    const significantChange = Math.abs(scoreDiff) >= 5; // 5+ points is significant

    if (!significantChange) {
      return new Response(
        JSON.stringify({ message: "Score change not significant enough for notification" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isImprovement = scoreDiff > 0;
    const changeMessage = getScoreChangeMessage(scoreDiff, currentBand, previousBand);
    const bandColor = getBandColor(currentBand);

    const reportUrl = `https://www.wellnessgenius.co.uk/ai-readiness/report/${completionId}`;

    const emailResponse = await resend.emails.send({
      from: "Wellness Genius <hello@wellnessgenius.co.uk>",
      to: [email],
      subject: isImprovement 
        ? `🎉 Your AI Readiness Score Improved! (${currentScore}%)` 
        : `📊 Your AI Readiness Score Update (${currentScore}%)`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="font-size: 24px; color: #1a1a1a; margin: 0 0 8px 0;">
                  ${isImprovement ? "🎉 Score Improved!" : "📊 Score Update"}
                </h1>
                <p style="color: #6b7280; margin: 0;">Your AI Readiness Assessment Results</p>
              </div>

              <!-- Score Display -->
              <div style="text-align: center; padding: 32px; background: linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%); border-radius: 12px; margin-bottom: 24px;">
                <div style="font-size: 56px; font-weight: bold; color: ${bandColor}; margin-bottom: 8px;">
                  ${currentScore}%
                </div>
                <div style="display: inline-block; padding: 6px 16px; background: ${bandColor}; color: white; border-radius: 20px; font-size: 14px; font-weight: 600;">
                  ${currentBand}
                </div>
              </div>

              <!-- Change Summary -->
              <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                  <span style="color: #6b7280;">Previous Score</span>
                  <span style="font-weight: 600; color: #374151;">${previousScore}% (${previousBand})</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #6b7280;">Change</span>
                  <span style="font-weight: 600; color: ${isImprovement ? '#22c55e' : '#ef4444'};">
                    ${isImprovement ? '+' : ''}${scoreDiff} points
                  </span>
                </div>
              </div>

              <!-- Message -->
              <p style="color: #374151; line-height: 1.6; margin-bottom: 24px;">
                Hi ${name || "there"},<br><br>
                ${changeMessage}
              </p>

              ${isImprovement ? `
              <p style="color: #374151; line-height: 1.6; margin-bottom: 24px;">
                Keep up the great work! Your improvements show that your organization is making real progress in AI adoption.
              </p>
              ` : `
              <p style="color: #374151; line-height: 1.6; margin-bottom: 24px;">
                Don't worry – this is an opportunity to identify areas for improvement. Review your detailed report to see specific recommendations.
              </p>
              `}

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${reportUrl}" style="display: inline-block; padding: 14px 32px; background: #0d9488; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  View Full Report →
                </a>
              </div>

              <!-- Footer -->
              <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 24px; text-align: center;">
                <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                  Wellness Genius | AI Strategy for Wellness Operators
                </p>
                <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0;">
                  <a href="https://www.wellnessgenius.co.uk/unsubscribe?email=${encodeURIComponent(email)}" style="color: #9ca3af;">Unsubscribe</a>
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Score change email sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error sending score change email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
