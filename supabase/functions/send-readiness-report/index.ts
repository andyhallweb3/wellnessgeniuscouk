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

const getScoreBand = (score: number): { label: string; color: string; bgColor: string } => {
  if (score < 40) return { label: 'AI-Unready', color: '#ef4444', bgColor: '#fef2f2' };
  if (score < 60) return { label: 'AI-Curious', color: '#f59e0b', bgColor: '#fffbeb' };
  if (score < 80) return { label: 'AI-Ready', color: '#0d9488', bgColor: '#f0fdfa' };
  return { label: 'AI-Native', color: '#22c55e', bgColor: '#f0fdf4' };
};

const getStatusColor = (score: number): string => {
  if (score < 40) return '#ef4444';
  if (score < 60) return '#f59e0b';
  if (score < 80) return '#0d9488';
  return '#22c55e';
};

const getRecommendations = (score: number): { doList: string[]; dontList: string[]; nextStep: string; nextStepDesc: string } => {
  if (score < 40) {
    return {
      doList: [
        'Get clear on 2-3 business problems before touching tools',
        'Assign explicit AI ownership at exec level',
        'Document your most painful manual processes',
      ],
      dontList: [
        'Buy AI tools yet (you\'ll waste money)',
        'Let teams experiment without coordination',
        'Promise AI outcomes to the board yet',
      ],
      nextStep: 'AI Readiness Sprint',
      nextStepDesc: 'A 60-90 minute diagnostic that identifies exactly what\'s blocking you and creates a 90-day action plan.',
    };
  }
  if (score < 60) {
    return {
      doList: [
        'Run 1 tightly scoped pilot in a low-risk area',
        'Invest in AI literacy for leadership',
        'Map your top 5 time-consuming manual tasks',
      ],
      dontList: [
        'Roll out AI tools company-wide',
        'Skip the education step',
        'Automate customer-facing processes yet',
      ],
      nextStep: 'AI Literacy for Leaders',
      nextStepDesc: 'Practical AI education that gets your leadership team aligned on what AI can (and can\'t) do.',
    };
  }
  if (score < 80) {
    return {
      doList: [
        'Identify 1 high-impact use case with clear metrics',
        'Start with an AI agent that replaces tasks, not roles',
        'Keep a human-in-the-loop for all outputs initially',
      ],
      dontList: [
        'Try to automate everything at once',
        'Skip the measurement framework',
        'Replace human decision-making prematurely',
      ],
      nextStep: 'AI Agent Build',
      nextStepDesc: 'One agent. One job. Real ROI. We design and deploy a working AI agent inside your business.',
    };
  }
  return {
    doList: [
      'Build AI agents that create lasting competitive advantage',
      'Design for multi-agent workflows',
      'Measure AI impact at the business level, not task level',
    ],
    dontList: [
      'Settle for off-the-shelf tools',
      'Wait for perfect conditions',
      'Underestimate the change management required',
    ],
    nextStep: 'AI Agent Build',
    nextStepDesc: 'Let\'s build a multi-agent system that creates lasting competitive advantage. You\'re ready to ship.',
  };
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-readiness-report: Received request");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userInfo, overallScore, pillarResults, headline, recommendation }: ReportRequest = await req.json();

    console.log(`Sending report to ${userInfo.email} with score ${overallScore}`);

    const scoreBand = getScoreBand(overallScore);
    const recs = getRecommendations(overallScore);

    const pillarRows = pillarResults.map(p => {
      const statusColor = getStatusColor(p.score);
      const barWidth = Math.max(5, p.score);
      return `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="color: #374151; font-size: 14px; font-weight: 500; padding-bottom: 6px;">
                  ${p.pillar}
                </td>
                <td style="text-align: right; color: ${statusColor}; font-size: 14px; font-weight: 700; padding-bottom: 6px;">
                  ${p.score}/100
                </td>
              </tr>
              <tr>
                <td colspan="2">
                  <div style="background: #f3f4f6; border-radius: 9999px; height: 8px; overflow: hidden;">
                    <div style="background: ${statusColor}; height: 100%; width: ${barWidth}%; border-radius: 9999px;"></div>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    }).join("");

    const doItems = recs.doList.map(item => `
      <tr>
        <td style="padding: 6px 0; color: #065f46; font-size: 14px;">
          <span style="color: #10b981; margin-right: 8px;">✓</span> ${item}
        </td>
      </tr>
    `).join('');

    const dontItems = recs.dontList.map(item => `
      <tr>
        <td style="padding: 6px 0; color: #991b1b; font-size: 14px;">
          <span style="color: #ef4444; margin-right: 8px;">✗</span> ${item}
        </td>
      </tr>
    `).join('');

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your AI Readiness Report</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 32px; text-align: center;">
              <h1 style="margin: 0; color: #2dd4bf; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Wellness Genius
              </h1>
              <p style="margin: 12px 0 0 0; color: #94a3b8; font-size: 14px;">
                AI Readiness Index™ Report
              </p>
            </td>
          </tr>
          
          <!-- Score Banner -->
          <tr>
            <td style="padding: 32px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px;">Your Overall AI Readiness Score</p>
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); color: white; font-size: 56px; font-weight: 800; padding: 24px 48px; border-radius: 16px;">
                    ${overallScore}<span style="font-size: 28px; font-weight: 400; opacity: 0.8;">/100</span>
                  </td>
                </tr>
              </table>
              <table cellpadding="0" cellspacing="0" style="margin: 16px auto 0;">
                <tr>
                  <td style="background: ${scoreBand.bgColor}; color: ${scoreBand.color}; padding: 8px 20px; border-radius: 9999px; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                    ${scoreBand.label}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Headline -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; border-radius: 12px;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <h2 style="margin: 0 0 8px 0; color: #0f172a; font-size: 20px; font-weight: 700; line-height: 1.3;">
                      ${headline}
                    </h2>
                    <p style="margin: 0; color: #64748b; font-size: 14px;">
                      Prepared for ${userInfo.name} at ${userInfo.company}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Pillar Breakdown -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <h3 style="margin: 0 0 16px 0; color: #0f172a; font-size: 16px; font-weight: 700;">
                Your Pillar Breakdown
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${pillarRows}
              </table>
            </td>
          </tr>
          
          <!-- Do / Don't Framework -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="48%" valign="top">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: #f0fdf4; border-radius: 12px;">
                      <tr>
                        <td style="padding: 16px 20px;">
                          <p style="margin: 0 0 12px 0; color: #065f46; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                            ✓ Do This
                          </p>
                          <table width="100%" cellpadding="0" cellspacing="0">
                            ${doItems}
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" valign="top">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: #fef2f2; border-radius: 12px;">
                      <tr>
                        <td style="padding: 16px 20px;">
                          <p style="margin: 0 0 12px 0; color: #991b1b; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                            ✗ Avoid This
                          </p>
                          <table width="100%" cellpadding="0" cellspacing="0">
                            ${dontItems}
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Recommended Next Step -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="margin: 0 0 4px 0; color: #92400e; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      💡 Recommended Next Step
                    </p>
                    <p style="margin: 0 0 8px 0; color: #78350f; font-size: 18px; font-weight: 700;">
                      ${recs.nextStep}
                    </p>
                    <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                      ${recs.nextStepDesc}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- CTA -->
          <tr>
            <td style="padding: 0 32px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); border-radius: 12px;">
                <tr>
                  <td style="padding: 28px 24px; text-align: center;">
                    <p style="margin: 0 0 6px 0; color: white; font-size: 18px; font-weight: 700;">
                      Want to pressure-test this with a human?
                    </p>
                    <p style="margin: 0 0 20px 0; color: rgba(255,255,255,0.85); font-size: 14px;">
                      Book a free 30-minute strategy call to discuss your results and get actionable next steps.
                    </p>
                    <a href="https://calendly.com/andy-wellnessgenius/30min" style="display: inline-block; padding: 14px 32px; background: white; color: #0d9488; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 8px;">
                      Book Your Free Call with Andy →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px;">
                © ${new Date().getFullYear()} Wellness Genius. All rights reserved.
              </p>
              <p style="margin: 0 0 12px 0; color: #94a3b8; font-size: 11px;">
                This report was generated by the AI Readiness Index™ assessment.
              </p>
              <p style="margin: 0;">
                <a href="https://wellnessgenius.co.uk" style="color: #0d9488; font-size: 11px; text-decoration: none;">
                  wellnessgenius.co.uk
                </a>
                <span style="color: #94a3b8; font-size: 11px;"> • </span>
                <a href="https://wellnessgenius.co.uk/privacy-policy" style="color: #64748b; font-size: 11px; text-decoration: underline;">
                  Privacy Policy
                </a>
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

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Wellness Genius <reports@news.wellnessgenius.co.uk>",
        reply_to: "andy@wellnessgenius.co.uk",
        to: [userInfo.email],
        subject: `Your AI Readiness Report from Wellness Genius`,
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error sending readiness report:", message);
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);