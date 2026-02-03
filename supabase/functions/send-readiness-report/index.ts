import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0?target=deno";
import { jsPDF } from "https://esm.sh/jspdf@2.5.2?target=deno&bundle-deps";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PillarScore {
  pillar: string;
  score: number;
  status: string;
}

interface ReportData {
  overallScore: number;
  scoreBand: string;
  pillarScores: PillarScore[];
  headline: string;
  userInfo: {
    name: string;
    company: string;
    email: string;
    role: string;
  };
}

interface AIInsights {
  headline: string;
  revenueUpside: {
    min: string;
    max: string;
    confidence: string;
    rationale?: string;
  };
  topBlockers: string[];
  priorityPlan: {
    action: string;
    effort: string;
    impact: string;
    week: string;
  }[];
  monetisationPaths: string[];
  doList?: string[];
  dontList?: string[];
  roleInsight?: string;
  nextStep?: string;
}

function generatePDF(reportData: ReportData, insights: AIInsights): string {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const addText = (text: string, fontSize: number, isBold = false, color: [number, number, number] = [0, 0, 0]) => {
    pdf.setFontSize(fontSize);
    pdf.setFont("helvetica", isBold ? "bold" : "normal");
    pdf.setTextColor(color[0], color[1], color[2]);
    const lines = pdf.splitTextToSize(text, contentWidth);
    pdf.text(lines, margin, y);
    y += lines.length * (fontSize * 0.4) + 4;
  };

  const checkNewPage = (neededSpace: number) => {
    if (y + neededSpace > pdf.internal.pageSize.getHeight() - 20) {
      pdf.addPage();
      y = 20;
    }
  };

  // Header
  addText("AI Readiness Report", 22, true, [0, 128, 128]);
  addText(reportData.userInfo.company, 16, true);
  addText(`Prepared for ${reportData.userInfo.name}`, 11, false, [100, 100, 100]);
  y += 5;

  // Overall Score
  addText(`Overall Score: ${reportData.overallScore}% — ${reportData.scoreBand}`, 14, true, [0, 128, 128]);
  y += 5;

  // Headline
  addText(reportData.headline, 12, false);
  y += 8;

  // Pillar Scores
  addText("Section Breakdown", 14, true);
  reportData.pillarScores.forEach((pillar) => {
    checkNewPage(12);
    addText(`• ${pillar.pillar}: ${pillar.score}% (${pillar.status})`, 10, false);
  });
  y += 8;

  // Revenue Upside
  checkNewPage(30);
  addText("Revenue Upside Range", 14, true, [0, 128, 128]);
  addText(`${insights.revenueUpside.min} to ${insights.revenueUpside.max} / year`, 12, true);
  addText(`Confidence: ${insights.revenueUpside.confidence}${insights.revenueUpside.rationale ? ` — ${insights.revenueUpside.rationale}` : ""}`, 10, false, [100, 100, 100]);
  y += 8;

  // Top Blockers
  checkNewPage(30);
  addText("Top Blockers", 14, true, [200, 50, 50]);
  insights.topBlockers.forEach((blocker, idx) => {
    checkNewPage(10);
    addText(`${idx + 1}. ${blocker}`, 10, false);
  });
  y += 8;

  // Do / Don't Lists
  if (insights.doList && insights.doList.length > 0) {
    checkNewPage(30);
    addText("What to do next", 14, true, [0, 128, 128]);
    insights.doList.forEach((item) => {
      checkNewPage(10);
      addText(`✓ ${item}`, 10, false);
    });
    y += 8;
  }

  if (insights.dontList && insights.dontList.length > 0) {
    checkNewPage(30);
    addText("What NOT to do yet", 14, true, [200, 50, 50]);
    insights.dontList.forEach((item) => {
      checkNewPage(10);
      addText(`✗ ${item}`, 10, false);
    });
    y += 8;
  }

  // Role Insight
  if (insights.roleInsight) {
    checkNewPage(25);
    addText(`Insight for ${reportData.userInfo.role || "your role"}:`, 12, true);
    addText(insights.roleInsight, 10, false);
    y += 8;
  }

  // 90-Day Priority Plan
  checkNewPage(40);
  addText("90-Day Priority Plan", 14, true, [0, 128, 128]);
  insights.priorityPlan.forEach((item) => {
    checkNewPage(12);
    addText(`Week ${item.week}: ${item.action} [Effort: ${item.effort}, Impact: ${item.impact}]`, 10, false);
  });
  y += 8;

  // Monetisation Paths
  checkNewPage(30);
  addText("Monetisation Paths", 14, true);
  insights.monetisationPaths.forEach((path) => {
    checkNewPage(10);
    addText(`• ${path}`, 10, false);
  });
  y += 8;

  // Next Step
  if (insights.nextStep) {
    checkNewPage(25);
    addText("Your Next Step", 14, true, [0, 128, 128]);
    addText(insights.nextStep, 11, false);
    y += 8;
  }

  // Disclaimer
  checkNewPage(25);
  y += 10;
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  const disclaimer = "This report provides indicative guidance based on your assessment responses. Revenue estimates are conservative and based on industry benchmarks. Actual results will vary based on execution and market conditions. This is not financial advice.";
  const disclaimerLines = pdf.splitTextToSize(disclaimer, contentWidth);
  pdf.text(disclaimerLines, margin, y);

  // Return as base64
  return pdf.output("datauristring").split(",")[1];
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-readiness-report: Received request");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reportData, insights } = await req.json();

    if (!reportData || !insights) {
      console.error("Missing reportData or insights");
      return new Response(
        JSON.stringify({ error: "Missing report data or insights" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating PDF for ${reportData.userInfo.email}`);

    // Generate PDF as base64
    const pdfBase64 = generatePDF(reportData, insights);

    console.log(`Sending email to ${reportData.userInfo.email}`);

    // Send email with PDF attachment
    const emailResponse = await resend.emails.send({
      from: "Wellness Genius <reports@news.wellnessgenius.co.uk>",
      reply_to: "andy@wellnessgenius.co.uk",
      to: [reportData.userInfo.email],
      subject: `Your AI Readiness Report — ${reportData.userInfo.company}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0d9488;">Your AI Readiness Report</h1>
          <p>Hi ${reportData.userInfo.name},</p>
          <p>Thank you for completing the AI Readiness Assessment. Your full report is attached to this email as a PDF.</p>
          
          <div style="background: #f0fdfa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin: 0 0 10px 0; color: #0d9488;">Your Score: ${reportData.overallScore}%</h2>
            <p style="margin: 0; color: #0f766e; font-weight: 600;">${reportData.scoreBand}</p>
          </div>
          
          <p>${reportData.headline}</p>
          
          <p>The attached PDF contains:</p>
          <ul>
            <li>Section-by-section breakdown</li>
            <li>Revenue upside estimate</li>
            <li>Top blockers to address</li>
            <li>90-day priority action plan</li>
            <li>Monetisation pathways</li>
          </ul>
          
          <p>Ready to take the next step? Reply to this email to discuss how we can help accelerate your AI journey.</p>
          
          <p style="margin-top: 30px;">Best regards,<br><strong>The Wellness Genius Team</strong></p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="font-size: 12px; color: #6b7280;">
            This email was sent because you completed the AI Readiness Assessment on wellnessgenius.co.uk
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `AI-Readiness-Report-${reportData.userInfo.company.replace(/\s+/g, "-")}.pdf`,
          content: pdfBase64,
        },
      ],
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Report sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending report:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);