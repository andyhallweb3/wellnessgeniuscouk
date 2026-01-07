import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@4.0.0';
import { validateAdminAuth, unauthorizedResponse } from '../_shared/admin-auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Article {
  id: string;
  title: string;
  source: string;
  url: string;
  published_at: string;
  category: string;
  excerpt: string | null;
  content: string | null;
  ai_summary?: string | null;
  ai_why_it_matters?: string[] | null;
  ai_commercial_angle?: string | null;
  score_total?: number | null;
  score_source_authority?: number | null;
  score_commercial_impact?: number | null;
  score_operator_relevance?: number | null;
  score_novelty?: number | null;
  score_timeliness?: number | null;
  score_wg_fit?: number | null;
  score_reasoning?: string | null;
}

interface ProcessedArticle extends Article {
  ai_summary: string;
  ai_why_it_matters: string[];
  ai_commercial_angle: string;
}

async function generateAISummary(article: Article, apiKey: string): Promise<{
  summary: string;
  whyItMatters: string[];
  commercialAngle: string;
}> {
  const prompt = `Analyze this news article for a wellness/fitness industry newsletter:

Title: ${article.title}
Source: ${article.source}
Category: ${article.category}
Content: ${article.excerpt || article.content || 'No content available'}

Provide:
1. A single sentence summary (max 30 words)
2. Three bullet points explaining "Why it matters" for wellness/fitness businesses (each max 20 words)
3. One "Commercial angle" line - how wellness brands can capitalize on this trend (max 25 words)

Respond in JSON format:
{
  "summary": "...",
  "whyItMatters": ["...", "...", "..."],
  "commercialAngle": "..."
}`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a wellness industry analyst. Provide concise, actionable insights for wellness and fitness business leaders. Always respond in valid JSON format.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response with cleanup
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        // Clean up common JSON issues from AI responses
        let jsonStr = jsonMatch[0]
          .replace(/[\u0000-\u001F]+/g, ' ') // Remove control characters
          .replace(/,\s*}/g, '}') // Remove trailing commas before }
          .replace(/,\s*]/g, ']') // Remove trailing commas before ]
          .replace(/'/g, '"') // Replace single quotes with double quotes
          .replace(/(\w+):/g, '"$1":') // Quote unquoted keys
          .replace(/""+/g, '"'); // Fix double-double quotes
        
        const parsed = JSON.parse(jsonStr);
        return {
          summary: parsed.summary || 'Summary unavailable',
          whyItMatters: Array.isArray(parsed.whyItMatters) ? parsed.whyItMatters : ['Analysis pending'],
          commercialAngle: parsed.commercialAngle || 'Commercial angle pending',
        };
      } catch (parseError) {
        console.error('JSON parse error, using fallback:', parseError);
        // Fall through to fallback response below
      }
    }
    
    // Fallback: try to extract content even if JSON is malformed
    console.log('Using fallback extraction for AI response');
    return {
      summary: article.excerpt?.substring(0, 150) || 'Summary unavailable',
      whyItMatters: ['Industry development worth monitoring', 'Potential impact on wellness sector', 'Stay informed on emerging trends'],
      commercialAngle: 'Monitor for potential business applications',
    };
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return {
      summary: article.excerpt?.substring(0, 150) || 'Summary unavailable',
      whyItMatters: ['Industry development worth monitoring', 'Potential impact on wellness sector', 'Stay informed on emerging trends'],
      commercialAngle: 'Monitor for potential business applications',
    };
  }
}

// Generate HMAC-signed unsubscribe token
async function generateUnsubscribeToken(email: string, secret: string): Promise<string> {
  const expiry = Date.now() + (90 * 24 * 60 * 60 * 1000); // 90 days
  const payload = `${email}|${expiry}`;
  const signature = await generateSignature(payload, secret);
  const combined = `${payload}|${signature}`;
  // Base64url encode
  return btoa(combined).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Cryptographically secure HMAC-SHA256 signature
async function generateSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const data = encoder.encode(payload);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, data);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateEmailHTML(
  articles: ProcessedArticle[], 
  previewOnly = false, 
  subscriberEmail = '',
  sendId = '',
  trackingBaseUrl = '',
  unsubscribeToken = '',
  customIntro = ''
): string {
  // Helper to create tracking URL for links
  const trackLink = (url: string) => {
    if (!sendId || !subscriberEmail || !trackingBaseUrl || previewOnly) return url;
    return `${trackingBaseUrl}?sid=${sendId}&e=${encodeURIComponent(subscriberEmail)}&t=c&url=${encodeURIComponent(url)}`;
  };

  // Sort by score and extract top story
  const sortedArticles = [...articles].sort((a, b) => 
    ((b as any).score_total || 0) - ((a as any).score_total || 0)
  );
  
  const topStory = sortedArticles[0];
  const remainingArticles = sortedArticles.slice(1);

  // Generate Editor's Choice / Top Story section
  const editorChoiceHTML = topStory ? `
    <tr>
      <td class="content-bg" style="padding: 24px 32px 0; background-color: #ffffff;">
        <table width="100%" cellpadding="0" cellspacing="0" class="editor-choice-bg" style="background: linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%); border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="padding: 20px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="display: inline-block; padding: 4px 10px; background: #0f766e; color: white; font-size: 11px; font-weight: 700; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
                      ⭐ Editor's Choice
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 12px;">
                    <a class="dark-text" href="${trackLink(topStory.url)}" style="color: #0f172a; font-size: 20px; font-weight: 700; text-decoration: none; line-height: 1.3;">
                      ${topStory.title}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td class="editor-choice-text" style="padding-top: 8px; color: #115e59; font-size: 12px; font-weight: 500;">
                    ${topStory.source} • ${topStory.category} • ${new Date(topStory.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </td>
                </tr>
                <tr>
                  <td class="editor-choice-text" style="padding-top: 12px; color: #134e4a; font-size: 15px; line-height: 1.6;">
                    ${topStory.ai_summary}
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0" class="editor-choice-card" style="background: rgba(255,255,255,0.7); border-radius: 8px;">
                      <tr>
                        <td style="padding: 14px;">
                          <p class="link-color" style="margin: 0 0 8px 0; color: #0f766e; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            Why it matters
                          </p>
                          <ul class="editor-choice-text" style="margin: 0; padding-left: 18px; color: #115e59; font-size: 14px; line-height: 1.7;">
                            ${topStory.ai_why_it_matters.map(point => `<li>${point}</li>`).join('')}
                          </ul>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 12px;">
                    <p class="editor-choice-text editor-choice-card" style="margin: 0; color: #115e59; font-size: 13px; background: rgba(255,255,255,0.5); padding: 10px 14px; border-radius: 6px;">
                      <strong>💡 Commercial angle:</strong> ${topStory.ai_commercial_angle}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 16px;">
                    <a href="${trackLink(topStory.url)}" style="display: inline-block; padding: 10px 20px; background: #0f766e; color: white; font-size: 13px; font-weight: 600; text-decoration: none; border-radius: 6px;">
                      Read full story →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <!-- AI Advisor CTA -->
    <tr>
      <td class="content-bg" style="padding: 24px 32px 0; background-color: #ffffff;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="padding: 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 8px 0; color: #2dd4bf; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                      🤖 Your AI Business Advisor
                    </p>
                    <p style="margin: 0 0 16px 0; color: #f1f5f9; font-size: 18px; font-weight: 600; line-height: 1.4;">
                      Got questions about this story? Ask your AI Advisor.
                    </p>
                    <p style="margin: 0 0 20px 0; color: #94a3b8; font-size: 14px; line-height: 1.5;">
                      Get instant, personalised insights on how to apply these trends to your wellness business.
                    </p>
                    <a href="${trackLink('https://www.wellnessgenius.co.uk/genie')}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color: white; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                      Ask Your AI Advisor →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  ` : '';

  // Generate remaining articles
  const articleItems = remainingArticles.map((article, index) => `
    <tr>
      <td class="border-color" style="padding: 24px 0; border-bottom: 1px solid #e5e7eb;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <span style="display: inline-block; padding: 4px 12px; background: #0d9488; color: white; font-size: 12px; font-weight: 600; border-radius: 9999px; margin-bottom: 12px;">
                ${article.category}
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 8px;">
              <a class="dark-text" href="${trackLink(article.url)}" style="color: #0f172a; font-size: 18px; font-weight: 600; text-decoration: none; line-height: 1.4;">
                ${article.title}
              </a>
            </td>
          </tr>
          <tr>
            <td class="muted-text" style="padding-top: 8px; color: #64748b; font-size: 12px;">
              ${article.source} • ${new Date(article.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </td>
          </tr>
          <tr>
            <td class="light-text" style="padding-top: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
              ${article.ai_summary}
            </td>
          </tr>
          <tr>
            <td style="padding-top: 16px;">
              <table width="100%" cellpadding="0" cellspacing="0" class="why-matters-bg" style="background: #f8fafc; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px;">
                    <p class="link-color" style="margin: 0 0 8px 0; color: #0d9488; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      Why it matters
                    </p>
                    <ul class="light-text" style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                      ${article.ai_why_it_matters.map(point => `<li>${point}</li>`).join('')}
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 12px;">
              <table width="100%" cellpadding="0" cellspacing="0" class="commercial-bg" style="background: #fef3c7; border-radius: 8px;">
                <tr>
                  <td style="padding: 12px 16px;">
                    <p class="commercial-text" style="margin: 0; color: #92400e; font-size: 13px;">
                      <strong>💡 Commercial angle:</strong> ${article.ai_commercial_angle}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 16px;">
              <a class="link-color" href="${trackLink(article.url)}" style="display: inline-block; color: #0d9488; font-size: 14px; font-weight: 500; text-decoration: none;">
                Read full article →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  // Tracking pixel for open tracking
  const trackingPixel = sendId && subscriberEmail && trackingBaseUrl && !previewOnly
    ? `<img src="${trackingBaseUrl}?sid=${sendId}&e=${encodeURIComponent(subscriberEmail)}&t=o" width="1" height="1" style="display:block;width:1px;height:1px;border:0;" alt="" />`
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Wellness Genius Weekly</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    
    @media (prefers-color-scheme: dark) {
      .email-bg { background-color: #1a1a1a !important; }
      .email-container { background-color: #262626 !important; }
      .content-bg { background-color: #262626 !important; }
      .light-text { color: #e5e5e5 !important; }
      .dark-text { color: #f5f5f5 !important; }
      .muted-text { color: #a3a3a3 !important; }
      .border-color { border-color: #404040 !important; }
      .card-bg { background-color: #333333 !important; }
      .footer-bg { background-color: #1f1f1f !important; }
      .link-color { color: #5eead4 !important; }
      .why-matters-bg { background-color: #1f2937 !important; }
      .commercial-bg { background-color: #422006 !important; }
      .commercial-text { color: #fcd34d !important; }
      .editor-choice-bg { background: linear-gradient(135deg, #134e4a 0%, #115e59 100%) !important; }
      .editor-choice-text { color: #ccfbf1 !important; }
      .editor-choice-card { background-color: rgba(0,0,0,0.3) !important; }
    }
    
    /* Gmail dark mode */
    u + .body .email-bg { background-color: #1a1a1a !important; }
    u + .body .email-container { background-color: #262626 !important; }
    
    /* Apple Mail dark mode */
    [data-ogsc] .email-bg { background-color: #1a1a1a !important; }
    [data-ogsc] .email-container { background-color: #262626 !important; }
  </style>
</head>
<body class="body" style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" class="email-bg" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" class="email-container" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header - kept dark as it works in both modes -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 32px; text-align: center;">
              <h1 style="margin: 0; color: #2dd4bf; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Wellness Genius
              </h1>
              <p style="margin: 12px 0 0 0; color: #94a3b8; font-size: 14px;">
                AI & Wellness Industry Intelligence
              </p>
            </td>
          </tr>
          
          <!-- Intro -->
          <tr>
            <td class="content-bg" style="padding: 32px 32px 0; background-color: #ffffff;">
              ${customIntro ? `
              <p class="dark-text" style="margin: 0 0 16px 0; color: #0f172a; font-size: 18px; font-weight: 600; line-height: 1.4;">
                ${customIntro}
              </p>
              ` : ''}
              <p class="light-text" style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
                Here are the top stories from the intersection of AI, wellness, and fitness this week—with insights on why they matter for your business.
              </p>
            </td>
          </tr>
          
          <!-- Editor's Choice / Top Story -->
          ${editorChoiceHTML}
          
          <!-- More Stories Header -->
          ${remainingArticles.length > 0 ? `
          <tr>
            <td class="content-bg" style="padding: 32px 32px 0; background-color: #ffffff;">
              <h2 class="dark-text border-color" style="margin: 0; color: #0f172a; font-size: 18px; font-weight: 700; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">
                More Stories
              </h2>
            </td>
          </tr>
          ` : ''}
          
          <!-- Articles -->
          <tr>
            <td class="content-bg" style="padding: 24px 32px; background-color: #ffffff;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${articleItems}
              </table>
            </td>
          </tr>
          
          <!-- CTA - kept teal as it works in both modes -->
          <tr>
            <td class="content-bg" style="padding: 16px 32px 32px; background-color: #ffffff;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); border-radius: 12px;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <p style="margin: 0 0 16px 0; color: white; font-size: 16px; font-weight: 600;">
                      Ready to implement AI in your wellness business?
                    </p>
                    <a href="${trackLink('https://www.wellnessgenius.co.uk/ai-readiness')}" style="display: inline-block; padding: 12px 24px; background: white; color: #0d9488; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                      Take the AI Readiness Index
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td class="footer-bg border-color" style="background-color: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p class="muted-text" style="margin: 0 0 8px 0; color: #64748b; font-size: 12px;">
                © ${new Date().getFullYear()} Wellness Genius. All rights reserved.
              </p>
              <p class="muted-text" style="margin: 0 0 12px 0; color: #94a3b8; font-size: 11px;">
                You're receiving this because you subscribed to Wellness Genius insights.
              </p>
              <p style="margin: 0;">
                <a class="link-color" href="https://www.wellnessgenius.co.uk/unsubscribe${unsubscribeToken ? `?token=${unsubscribeToken}` : ''}" style="color: #64748b; font-size: 11px; text-decoration: underline;">
                  Unsubscribe
                </a>
                <span class="muted-text" style="color: #94a3b8; font-size: 11px;"> • </span>
                <a class="link-color" href="${trackLink('https://wellnessgenius.co.uk/privacy-policy')}" style="color: #64748b; font-size: 11px; text-decoration: underline;">
                  Privacy Policy
                </a>
              </p>
              ${trackingPixel}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin auth via JWT
    const authResult = await validateAdminAuth(req);
    
    console.log('Admin auth check:', {
      isAdmin: authResult.isAdmin,
      userId: authResult.userId,
      error: authResult.error,
    });
    
    if (!authResult.isAdmin) {
      console.log('Unauthorized access attempt to newsletter-run');
      return unauthorizedResponse(authResult.error || 'Unauthorized', corsHeaders);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendKey = Deno.env.get('RESEND_API_KEY')!;
    const lovableKey = Deno.env.get('LOVABLE_API_KEY')!;
    const unsubscribeSecret = Deno.env.get('UNSUBSCRIBE_SECRET') || '';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendKey);

    // Core send workflow: idempotent + resumable using newsletter_send_recipients
    const BATCH_SIZE = 50;
    const DELAY_MS = 2000;

    const runSendWorkflow = async (opts: {
      sendId: string;
      articles: Article[];
      trackingBaseUrl: string;
      targetEmails?: string[];
      customIntro?: string;
    }) => {
      const { sendId, articles, trackingBaseUrl, targetEmails, customIntro = '' } = opts;

      let sentTotal = 0;
      let failedTotal = 0;

      try {
        // 1) Ensure articles have AI content
        const processedArticles: ProcessedArticle[] = [];
        for (const article of articles) {
          if (article.ai_summary && article.ai_why_it_matters && article.ai_commercial_angle) {
            processedArticles.push(article as ProcessedArticle);
            continue;
          }

          const aiContent = await generateAISummary(article, lovableKey);
          const processed: ProcessedArticle = {
            ...article,
            ai_summary: aiContent.summary,
            ai_why_it_matters: aiContent.whyItMatters,
            ai_commercial_angle: aiContent.commercialAngle,
          };
          processedArticles.push(processed);

          await supabase
            .from('articles')
            .update({
              ai_summary: aiContent.summary,
              ai_why_it_matters: aiContent.whyItMatters,
              ai_commercial_angle: aiContent.commercialAngle,
            })
            .eq('id', article.id);
        }

        // 2) Store the preview HTML for history/auditing
        const emailHtml = generateEmailHTML(processedArticles, true, '', '', '', '', customIntro);
        await supabase
          .from('newsletter_sends')
          .update({ email_html: emailHtml })
          .eq('id', sendId);

        // 3) Ensure recipient queue exists (for new sends) and is deduped per send
        const { count: existingQueued } = await supabase
          .from('newsletter_send_recipients')
          .select('*', { count: 'exact', head: true })
          .eq('send_id', sendId);

        if (!existingQueued || existingQueued === 0) {
          let allSubscribers: { email: string }[] = [];
          
          // Use targetEmails if provided, otherwise fetch all active subscribers
          if (targetEmails && targetEmails.length > 0) {
            console.log(`Using ${targetEmails.length} targeted emails`);
            allSubscribers = targetEmails.map(email => ({ email }));
          } else {
            // Fetch ALL active subscribers (override default 1000 limit)
            let page = 0;
            const pageSize = 1000;

            while (true) {
              const { data: batch, error: batchError } = await supabase
                .from('newsletter_subscribers')
                .select('email')
                .eq('is_active', true)
                .range(page * pageSize, (page + 1) * pageSize - 1);

              if (batchError) throw batchError;
              if (!batch || batch.length === 0) break;

              allSubscribers = [...allSubscribers, ...batch];
              if (batch.length < pageSize) break;
              page++;
            }
          }

          if (allSubscribers.length === 0) {
            await supabase
              .from('newsletter_sends')
              .update({ status: 'failed', error_message: 'No active subscribers' })
              .eq('id', sendId);
            return;
          }

          // Deduplicate by email (case-insensitive)
          const seen = new Set<string>();
          const uniqueEmails = allSubscribers
            .map((s) => s.email.trim())
            .filter((e) => {
              const lower = e.toLowerCase();
              if (!lower) return false;
              if (seen.has(lower)) return false;
              seen.add(lower);
              return true;
            });

          // Insert as pending (unique index prevents duplicates on retries)
          const chunkSize = 500;
          for (let i = 0; i < uniqueEmails.length; i += chunkSize) {
            const chunk = uniqueEmails.slice(i, i + chunkSize).map((email) => ({
              send_id: sendId,
              email,
              status: 'pending',
            }));

            const { error: insertErr } = await supabase
              .from('newsletter_send_recipients')
              .insert(chunk);

            if (insertErr) {
              // Unique conflicts are expected if this is re-run; ignore by continuing
              console.warn('Recipient insert warning:', insertErr.message);
            }
          }

          console.log(`Queued ${uniqueEmails.length} recipients for send ${sendId}`);
        }

        // 4) Compute current sent total (for resume)
        const { count: sentCount } = await supabase
          .from('newsletter_send_recipients')
          .select('*', { count: 'exact', head: true })
          .eq('send_id', sendId)
          .eq('status', 'sent');

        sentTotal = sentCount || 0;

        // 5) Process pending recipients in batches; claim them by flipping to 'sending'
        while (true) {
          const { data: pendingRows, error: pendingError } = await supabase
            .from('newsletter_send_recipients')
            .select('id, email')
            .eq('send_id', sendId)
            .eq('status', 'pending')
            .order('created_at', { ascending: true })
            .limit(BATCH_SIZE);

          if (pendingError) throw pendingError;
          if (!pendingRows || pendingRows.length === 0) break;

          const ids = pendingRows.map((r) => r.id);

          // Claim the batch
          await supabase
            .from('newsletter_send_recipients')
            .update({ status: 'sending' })
            .eq('send_id', sendId)
            .in('id', ids)
            .eq('status', 'pending');

          console.log(`Sending batch (claimed ${ids.length}) for send ${sendId}`);

          const results = await Promise.all(
            pendingRows.map(async (row) => {
              const unsubscribeToken = unsubscribeSecret 
                ? await generateUnsubscribeToken(row.email, unsubscribeSecret) 
                : '';
              const personalizedHtml = generateEmailHTML(
                processedArticles,
                false,
                row.email,
                sendId,
                trackingBaseUrl,
                unsubscribeToken,
                customIntro
              );

              try {
                await resend.emails.send({
                  from: 'Wellness Genius <newsletter@news.wellnessgenius.co.uk>',
                  to: [row.email],
                  subject: `AI & Wellness Weekly: ${processedArticles[0].title}`,
                  html: personalizedHtml,
                });

                await supabase
                  .from('newsletter_send_recipients')
                  .update({ status: 'sent', sent_at: new Date().toISOString(), error_message: null })
                  .eq('id', row.id);

                return { ok: true } as const;
              } catch (err) {
                const msg = err instanceof Error ? err.message : 'Unknown error';
                await supabase
                  .from('newsletter_send_recipients')
                  .update({ status: 'failed', error_message: msg })
                  .eq('id', row.id);

                console.error(`Failed to send to ${row.email}: ${msg}`);
                return { ok: false } as const;
              }
            })
          );

          const ok = results.filter((r) => r.ok).length;
          const bad = results.length - ok;
          sentTotal += ok;
          failedTotal += bad;

          await supabase
            .from('newsletter_sends')
            .update({ recipient_count: sentTotal })
            .eq('id', sendId);

          console.log(`Progress for ${sendId}: sent=${sentTotal}, failed=${failedTotal}`);

          // Delay between batches
          const remainingDelay = pendingRows.length === BATCH_SIZE;
          if (remainingDelay) {
            await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
          }
        }

        // Mark articles as processed (only when finishing a full send)
        const articleIds = processedArticles.map((a) => a.id);
        await supabase.from('articles').update({ processed: true }).in('id', articleIds);

        await supabase
          .from('newsletter_sends')
          .update({
            recipient_count: sentTotal,
            status: failedTotal > 0 ? 'partial' : 'sent',
            error_message: failedTotal > 0 ? `${failedTotal} emails failed to send` : null,
          })
          .eq('id', sendId);

        console.log(`Send ${sendId} completed: sent=${sentTotal}, failed=${failedTotal}`);
      } catch (err) {
        console.error('Send workflow failed:', err);
        await supabase
          .from('newsletter_sends')
          .update({
            status: 'failed',
            error_message: err instanceof Error ? err.message : 'Send workflow failed',
            recipient_count: sentTotal,
          })
          .eq('id', sendId);
      }
    };

    // Simplified resend workflow that uses already-stored HTML template
    const runResendWorkflow = async (opts: {
      sendId: string;
      storedHtml: string;
      trackingBaseUrl: string;
      targetEmails: string[];
    }) => {
      const { sendId, storedHtml, trackingBaseUrl, targetEmails } = opts;

      let sentTotal = 0;
      let failedTotal = 0;

      try {
        // Get existing sent count for this send
        const { count: existingSentCount } = await supabase
          .from('newsletter_send_recipients')
          .select('*', { count: 'exact', head: true })
          .eq('send_id', sendId)
          .eq('status', 'sent');

        sentTotal = existingSentCount || 0;

        // Process pending recipients in batches
        const BATCH_SIZE = 50;
        const DELAY_MS = 2000;

        while (true) {
          const { data: pendingRows, error: pendingError } = await supabase
            .from('newsletter_send_recipients')
            .select('id, email')
            .eq('send_id', sendId)
            .eq('status', 'pending')
            .order('created_at', { ascending: true })
            .limit(BATCH_SIZE);

          if (pendingError) throw pendingError;
          if (!pendingRows || pendingRows.length === 0) break;

          const ids = pendingRows.map((r) => r.id);

          // Claim the batch
          await supabase
            .from('newsletter_send_recipients')
            .update({ status: 'sending' })
            .eq('send_id', sendId)
            .in('id', ids)
            .eq('status', 'pending');

          console.log(`Resend batch (claimed ${ids.length}) for send ${sendId}`);

          const results = await Promise.all(
            pendingRows.map(async (row) => {
              // Personalize the stored HTML with tracking for this subscriber
              const unsubscribeToken = unsubscribeSecret 
                ? await generateUnsubscribeToken(row.email, unsubscribeSecret) 
                : '';

              // Replace placeholder tracking URLs in stored HTML
              let personalizedHtml = storedHtml;

              // Add tracking pixel
              const trackingPixel = `<img src="${trackingBaseUrl}?sid=${sendId}&e=${encodeURIComponent(row.email)}&t=o" width="1" height="1" style="display:block;width:1px;height:1px;border:0;" alt="" />`;
              personalizedHtml = personalizedHtml.replace('</body>', `${trackingPixel}</body>`);

              // Update unsubscribe link if present
              if (unsubscribeToken) {
                const unsubscribeUrl = `${supabaseUrl}/functions/v1/unsubscribe?token=${unsubscribeToken}`;
                personalizedHtml = personalizedHtml.replace(
                  /href="[^"]*\/unsubscribe[^"]*"/g,
                  `href="${unsubscribeUrl}"`
                );
              }

              try {
                // Extract subject from HTML title or use a default
                const titleMatch = personalizedHtml.match(/<title>([^<]+)<\/title>/i);
                const subject = titleMatch ? titleMatch[1] : 'AI & Wellness Weekly';

                await resend.emails.send({
                  from: 'Wellness Genius <newsletter@news.wellnessgenius.co.uk>',
                  to: [row.email],
                  subject,
                  html: personalizedHtml,
                });

                await supabase
                  .from('newsletter_send_recipients')
                  .update({ status: 'sent', sent_at: new Date().toISOString(), error_message: null })
                  .eq('id', row.id);

                return { ok: true } as const;
              } catch (err) {
                const msg = err instanceof Error ? err.message : 'Unknown error';
                await supabase
                  .from('newsletter_send_recipients')
                  .update({ status: 'failed', error_message: msg })
                  .eq('id', row.id);

                console.error(`Failed to resend to ${row.email}: ${msg}`);
                return { ok: false } as const;
              }
            })
          );

          const ok = results.filter((r) => r.ok).length;
          const bad = results.length - ok;
          sentTotal += ok;
          failedTotal += bad;

          await supabase
            .from('newsletter_sends')
            .update({ recipient_count: sentTotal })
            .eq('id', sendId);

          console.log(`Resend progress for ${sendId}: sent=${sentTotal}, failed=${failedTotal}`);

          // Delay between batches if more pending
          if (pendingRows.length === BATCH_SIZE) {
            await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
          }
        }

        await supabase
          .from('newsletter_sends')
          .update({
            recipient_count: sentTotal,
            status: failedTotal > 0 ? 'partial' : 'sent',
            error_message: failedTotal > 0 ? `${failedTotal} emails failed to send` : null,
          })
          .eq('id', sendId);

        console.log(`Resend ${sendId} completed: sent=${sentTotal}, failed=${failedTotal}`);
      } catch (err) {
        console.error('Resend workflow failed:', err);
        await supabase
          .from('newsletter_sends')
          .update({
            status: 'failed',
            error_message: err instanceof Error ? err.message : 'Resend workflow failed',
            recipient_count: sentTotal,
          })
          .eq('id', sendId);
      }
    };

    const body = await req.json().catch(() => ({}));
    const previewOnly = body.preview === true;
    const targetEmails: string[] | undefined = Array.isArray(body.targetEmails) ? body.targetEmails : undefined;
    const selectedArticleIds: string[] | undefined = Array.isArray(body.selectedArticleIds) ? body.selectedArticleIds : undefined;
    const customIntro: string = typeof body.customIntro === 'string' ? body.customIntro.trim() : '';

    // ========================================
    // ACTION: List available news articles for manual selection
    // ========================================
    if (body.action === 'list-news') {
      const daysBack = body.daysBack || 7;
      const limit = body.limit || 50;
      const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();
      
      const { data: newsItems, error: newsError } = await supabase
        .from('rss_news_cache')
        .select('id, title, summary, source_name, source_url, category, published_date, image_url, business_lens')
        .gte('published_date', cutoffDate)
        .order('published_date', { ascending: false })
        .limit(limit);
      
      if (newsError) {
        return new Response(
          JSON.stringify({ success: false, error: newsError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: true, articles: newsItems || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Lightweight status endpoint for the admin UI (avoids timeouts + respects admin secret)
    if (body.action === 'status' && body.sendId) {
      const { data: sendRow, error: sendRowError } = await supabase
        .from('newsletter_sends')
        .select('id, recipient_count, article_count, status, error_message, sent_at')
        .eq('id', body.sendId)
        .single();

      if (sendRowError) {
        return new Response(
          JSON.stringify({ success: false, error: sendRowError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, send: sendRow }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Email metrics endpoint for admin dashboard
    if (body.action === 'email-metrics') {
      const startDate = body.startDate || null;
      const endDate = body.endDate || null;
      
      console.log(`Fetching email metrics${startDate ? ` from ${startDate}` : ''}${endDate ? ` to ${endDate}` : ''}`);

      // Build base query with optional date filters
      let openQuery = supabase
        .from('newsletter_events')
        .select('subscriber_email')
        .eq('event_type', 'open');
      
      let clickQuery = supabase
        .from('newsletter_events')
        .select('subscriber_email')
        .eq('event_type', 'click');

      let bounceQuery = supabase
        .from('newsletter_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'bounce');

      let complaintQuery = supabase
        .from('newsletter_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'complaint');

      let delayQuery = supabase
        .from('newsletter_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'delivery_delayed');

      let recentQuery = supabase
        .from('newsletter_events')
        .select('id, event_type, subscriber_email, send_id, link_url, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      let issueQuery = supabase
        .from('newsletter_events')
        .select('id, event_type, subscriber_email, send_id, link_url, created_at')
        .in('event_type', ['bounce', 'complaint', 'delivery_delayed'])
        .order('created_at', { ascending: false })
        .limit(100);

      // Apply date filters if provided
      if (startDate) {
        openQuery = openQuery.gte('created_at', startDate);
        clickQuery = clickQuery.gte('created_at', startDate);
        bounceQuery = bounceQuery.gte('created_at', startDate);
        complaintQuery = complaintQuery.gte('created_at', startDate);
        delayQuery = delayQuery.gte('created_at', startDate);
        recentQuery = recentQuery.gte('created_at', startDate);
        issueQuery = issueQuery.gte('created_at', startDate);
      }
      
      if (endDate) {
        openQuery = openQuery.lte('created_at', endDate);
        clickQuery = clickQuery.lte('created_at', endDate);
        bounceQuery = bounceQuery.lte('created_at', endDate);
        complaintQuery = complaintQuery.lte('created_at', endDate);
        delayQuery = delayQuery.lte('created_at', endDate);
        recentQuery = recentQuery.lte('created_at', endDate);
        issueQuery = issueQuery.lte('created_at', endDate);
      }

      // Execute all queries
      const [openResult, clickResult, bounceResult, complaintResult, delayResult, recentResult, issueResult] = await Promise.all([
        openQuery,
        clickQuery,
        bounceQuery,
        complaintQuery,
        delayQuery,
        recentQuery,
        issueQuery,
      ]);

      const openEvents = openResult.data || [];
      const clickEvents = clickResult.data || [];
      const bounceCount = bounceResult.count || 0;
      const complaintCount = complaintResult.count || 0;
      const delayCount = delayResult.count || 0;
      const recentEvents = recentResult.data || [];
      const issueEvents = issueResult.data || [];

      const totalOpens = openEvents.length;
      const uniqueOpens = new Set(openEvents.map(e => e.subscriber_email)).size;
      const totalClicks = clickEvents.length;
      const uniqueClicks = new Set(clickEvents.map(e => e.subscriber_email)).size;

      return new Response(
        JSON.stringify({
          success: true,
          metrics: {
            totalOpens,
            uniqueOpens,
            totalClicks,
            uniqueClicks,
            bounces: bounceCount,
            complaints: complaintCount,
            deliveryDelays: delayCount,
          },
          recentEvents,
          issueEvents,
          dateRange: { startDate, endDate },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Subscriber stats endpoint for campaign page
    if (body.action === 'subscriber-stats') {
      console.log('Fetching subscriber stats for campaign page');
      
      const { data: subscribers, error: subsError } = await supabase
        .from('newsletter_subscribers')
        .select('is_active, bounced, last_delivered_at, delivery_count');

      if (subsError) {
        console.error('Error fetching subscribers:', subsError);
        return new Response(
          JSON.stringify({ success: false, error: subsError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const stats = {
        total: subscribers?.length || 0,
        active: subscribers?.filter(s => s.is_active && !s.bounced).length || 0,
        delivered: subscribers?.filter(s => s.is_active && !s.bounced && s.last_delivered_at).length || 0,
        bounced: subscribers?.filter(s => s.bounced).length || 0,
        neverDelivered: subscribers?.filter(s => s.is_active && !s.bounced && !s.last_delivered_at).length || 0,
        unsubscribed: subscribers?.filter(s => !s.is_active && !s.bounced).length || 0,
      };

      console.log('Subscriber stats:', stats);

      return new Response(
        JSON.stringify({ success: true, stats }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search subscribers endpoint for campaign page
    if (body.action === 'search-subscribers') {
      const query = body.query || '';
      console.log('Searching subscribers with query:', query);
      
      if (query.length < 2) {
        return new Response(
          JSON.stringify({ success: true, subscribers: [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: subscribers, error: searchError } = await supabase
        .from('newsletter_subscribers')
        .select('id, email, name, is_active')
        .ilike('email', `%${query}%`)
        .eq('is_active', true)
        .eq('bounced', false)
        .limit(10);

      if (searchError) {
        console.error('Error searching subscribers:', searchError);
        return new Response(
          JSON.stringify({ success: false, error: searchError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Found subscribers:', subscribers?.length || 0);

      return new Response(
        JSON.stringify({ success: true, subscribers: subscribers || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get previous sends for "send to missing" feature
    if (body.action === 'get-previous-sends') {
      const limit = body.limit || 20;
      console.log('Fetching previous sends, limit:', limit);
      
      const { data: sends, error: sendsError } = await supabase
        .from('newsletter_sends')
        .select('id, sent_at, recipient_count, status')
        .in('status', ['completed', 'partial', 'sent'])
        .order('sent_at', { ascending: false })
        .limit(limit);

      if (sendsError) {
        console.error('Error fetching previous sends:', sendsError);
        return new Response(
          JSON.stringify({ success: false, error: sendsError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Found previous sends:', sends?.length || 0);

      return new Response(
        JSON.stringify({ success: true, sends: sends || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // History endpoint to fetch recent sends
    if (body.action === 'history') {
      const limit = body.limit || 10;
      const { data: sends, error: sendsError } = await supabase
        .from('newsletter_sends')
        .select('id, sent_at, recipient_count, article_count, status, unique_opens, total_opens, unique_clicks, total_clicks, error_message')
        .order('sent_at', { ascending: false })
        .limit(limit);

      if (sendsError) {
        return new Response(
          JSON.stringify({ success: false, error: sendsError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get total count
      const { count: totalCount } = await supabase
        .from('newsletter_sends')
        .select('*', { count: 'exact', head: true });

      return new Response(
        JSON.stringify({ success: true, sends, totalCount: totalCount || 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update send status endpoint
    if (body.action === 'updateStatus' && body.sendId && body.newStatus) {
      const validStatuses = ['sent', 'partial', 'failed', 'pending'];
      if (!validStatuses.includes(body.newStatus)) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid status' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error: updateError } = await supabase
        .from('newsletter_sends')
        .update({ status: body.newStatus })
        .eq('id', body.sendId);

      if (updateError) {
        return new Response(
          JSON.stringify({ success: false, error: updateError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, sendId: body.sendId, newStatus: body.newStatus }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================
    // ACTION: Resend to new subscribers OR missing subscribers
    // ========================================
    if ((body.action === 'resend-to-new' || body.action === 'resend-to-missing') && body.sendId) {
      const sendId = body.sendId as string;
      const resendToMissing = body.action === 'resend-to-missing';

      console.log(`${resendToMissing ? 'Resend-to-missing' : 'Resend-to-new'} for send ${sendId}`);

      // Get original send details
      const { data: sendRow, error: sendRowError } = await supabase
        .from('newsletter_sends')
        .select('id, status, article_ids, sent_at, email_html')
        .eq('id', sendId)
        .single();

      if (sendRowError || !sendRow) {
        return new Response(
          JSON.stringify({ success: false, error: sendRowError?.message || 'Send not found' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const articleIds = (sendRow.article_ids || []) as string[];
      if (!articleIds.length || !sendRow.email_html) {
        return new Response(
          JSON.stringify({ success: false, error: 'Cannot resend: this send has no stored content (older send).'}),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let candidateEmails: string[] = [];

      if (resendToMissing) {
        // Find all active subscribers who haven't received this newsletter
        const { data: allSubscribers, error: allSubError } = await supabase
          .from('newsletter_subscribers')
          .select('email')
          .eq('is_active', true)
          .eq('bounced', false);

        if (allSubError) {
          return new Response(
            JSON.stringify({ success: false, error: allSubError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        candidateEmails = (allSubscribers || []).map(s => s.email);
      } else {
        // Find subscribers who joined AFTER the original send
        const { data: newSubscribers, error: subError } = await supabase
          .from('newsletter_subscribers')
          .select('email')
          .eq('is_active', true)
          .eq('bounced', false)
          .gt('subscribed_at', sendRow.sent_at)
          .order('subscribed_at', { ascending: true });

        if (subError) {
          return new Response(
            JSON.stringify({ success: false, error: subError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        candidateEmails = (newSubscribers || []).map(s => s.email);
      }

      if (candidateEmails.length === 0) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: resendToMissing ? 'No active subscribers found' : 'No new subscribers since this newsletter was sent', 
            count: 0 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check which of these already received this newsletter (prevent duplicates)
      const { data: alreadySent } = await supabase
        .from('newsletter_send_recipients')
        .select('email')
        .eq('send_id', sendId);

      const alreadySentEmails = new Set((alreadySent || []).map(r => r.email.toLowerCase()));
      const newEmails = candidateEmails
        .filter(email => !alreadySentEmails.has(email.toLowerCase()));

      if (newEmails.length === 0) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: resendToMissing 
              ? 'All subscribers have already received this newsletter' 
              : 'All new subscribers already received this newsletter', 
            count: 0 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`${resendToMissing ? 'Resending' : 'Sending'} newsletter ${sendId} to ${newEmails.length} subscribers`);

      // Insert recipient records for new subscribers (use upsert to handle any edge cases)
      const recipientRows = newEmails.map(email => ({
        send_id: sendId,
        email: email.toLowerCase().trim(),
        status: 'pending',
      }));

      // Use upsert with onConflict to gracefully handle duplicates
      const { error: insertError } = await supabase
        .from('newsletter_send_recipients')
        .upsert(recipientRows, { 
          onConflict: 'send_id,email',
          ignoreDuplicates: true 
        });

      if (insertError) {
        console.error('Failed to insert recipient rows:', insertError);
        return new Response(
          JSON.stringify({ success: false, error: insertError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // For resends, we use the stored email_html template and just send to new recipients
      // No need to reload articles - the HTML is already generated and stored
      const storedHtml = sendRow.email_html as string;
      const trackingBaseUrl = `${supabaseUrl}/functions/v1/newsletter-track`;

      // Update send status
      await supabase
        .from('newsletter_sends')
        .update({ status: 'sending' })
        .eq('id', sendId);

      // Use a simpler resend workflow that uses stored HTML
      // @ts-ignore
      EdgeRuntime.waitUntil(runResendWorkflow({
        sendId,
        storedHtml,
        trackingBaseUrl,
        targetEmails: newEmails,
      }));

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Sending to ${newEmails.length} ${resendToMissing ? 'missing' : 'new'} subscribers`,
          count: newEmails.length,
          sendId 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Retry a single failed recipient
    if (body.action === 'retry-recipient' && body.sendId && body.recipientId) {
      const sendId = body.sendId as string;
      const recipientId = body.recipientId as string;
      const email = body.email as string;

      // Get the send record
      const { data: sendRow, error: sendRowError } = await supabase
        .from('newsletter_sends')
        .select('id, email_html')
        .eq('id', sendId)
        .single();

      if (sendRowError || !sendRow) {
        return new Response(
          JSON.stringify({ success: false, error: 'Send not found' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const storedHtml = sendRow.email_html as string | null;
      if (!storedHtml) {
        return new Response(
          JSON.stringify({ success: false, error: 'No stored HTML for this send' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Reset recipient status to pending
      await supabase
        .from('newsletter_send_recipients')
        .update({ status: 'pending', error_message: null })
        .eq('id', recipientId);

      const trackingBaseUrl = `${supabaseUrl}/functions/v1/newsletter-track`;

      // Generate personalized HTML for this single recipient
      const pixelUrl = `${trackingBaseUrl}?t=open&s=${sendId}&e=${encodeURIComponent(email)}`;
      const unsubUrl = `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/unsubscribe?email=${encodeURIComponent(email)}`;
      
      let personalizedHtml = storedHtml
        .replace(/\[UNSUBSCRIBE_URL\]/g, unsubUrl)
        .replace('</body>', `<img src="${pixelUrl}" width="1" height="1" alt="" style="display:none;" /></body>`);

      // Send to this single recipient
      try {
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        if (!resendApiKey) throw new Error('RESEND_API_KEY not configured');

        const resend = new Resend(resendApiKey);
        const result = await resend.emails.send({
          from: 'Wellness Genius <news@wellnessgenius.ai>',
          to: [email],
          subject: '🧠 Wellness Genius Weekly Intelligence',
          html: personalizedHtml,
        });

        if (result.error) throw new Error(result.error.message);

        // Mark as sent
        await supabase
          .from('newsletter_send_recipients')
          .update({ status: 'sent', sent_at: new Date().toISOString(), error_message: null })
          .eq('id', recipientId);

        console.log(`Retry successful for ${email}`);

        return new Response(
          JSON.stringify({ success: true, message: `Retry sent to ${email}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (emailError) {
        const errorMessage = emailError instanceof Error ? emailError.message : 'Unknown error';
        
        await supabase
          .from('newsletter_send_recipients')
          .update({ status: 'failed', error_message: errorMessage })
          .eq('id', recipientId);

        return new Response(
          JSON.stringify({ success: false, error: errorMessage }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Resume sending to unsent recipients for an existing send
    if (body.action === 'resume' && body.sendId) {
      const sendId = body.sendId as string;

      const { data: sendRow, error: sendRowError } = await supabase
        .from('newsletter_sends')
        .select('id, status, article_ids')
        .eq('id', sendId)
        .single();

      if (sendRowError || !sendRow) {
        return new Response(
          JSON.stringify({ success: false, error: sendRowError?.message || 'Send not found' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const articleIds = (sendRow.article_ids || []) as string[];
      if (!articleIds.length) {
        return new Response(
          JSON.stringify({ success: false, error: 'Cannot resume: this send has no stored article_ids (older send).'}),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: sendArticles, error: sendArticlesError } = await supabase
        .from('articles')
        .select('*')
        .in('id', articleIds);

      if (sendArticlesError || !sendArticles || sendArticles.length === 0) {
        return new Response(
          JSON.stringify({ success: false, error: sendArticlesError?.message || 'Failed to load send articles' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Mark send as sending again
      await supabase
        .from('newsletter_sends')
        .update({ status: 'sending', error_message: null })
        .eq('id', sendId);

      const trackingBaseUrl = `${supabaseUrl}/functions/v1/newsletter-track`;

      console.log(`Resuming send ${sendId}: will deliver to pending recipients only`);

      // @ts-ignore
      EdgeRuntime.waitUntil(runSendWorkflow({
        sendId,
        articles: sendArticles as Article[],
        trackingBaseUrl,
      }));

      return new Response(
        JSON.stringify({ success: true, message: 'Resume started', sendId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Newsletter run - preview: ${previewOnly}, selectedArticleIds: ${selectedArticleIds?.length || 'auto'}`);

    // ========================================
    // ARTICLE SELECTION
    // ========================================
    
    let articles: Article[] = [];
    
    // If specific articles selected, use those
    if (selectedArticleIds && selectedArticleIds.length > 0) {
      console.log(`Fetching ${selectedArticleIds.length} manually selected articles...`);
      
      const { data: selectedItems, error } = await supabase
        .from('rss_news_cache')
        .select('*')
        .in('id', selectedArticleIds);
      
      if (error) {
        console.error('Error fetching selected articles:', error);
      } else if (selectedItems && selectedItems.length > 0) {
        // Map rss_news_cache format to Article format
        articles = selectedItems.map(item => ({
          id: item.id,
          title: item.title,
          ai_summary: item.summary,
          source: item.source_name,
          url: item.source_url,
          category: item.category,
          published_at: item.published_date,
          business_lens: item.business_lens,
          ai_why_it_matters: null,
          ai_commercial_angle: null,
          processed: false,
          created_at: item.created_at,
          excerpt: item.summary,
          content: null
        }));
        console.log(`Loaded ${articles.length} manually selected articles`);
      }
    } else {
      // Auto-select from RSS cache with category diversity
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      const targetCategories = ['AI', 'Wellness', 'Fitness', 'Technology', 'Investment', 'Hospitality', 'Corporate Wellness'];
      
      console.log('Auto-selecting articles from rss_news_cache (news page)...');
      
      for (const category of targetCategories) {
        if (articles.length >= 8) break;
        
        const { data: categoryArticles, error } = await supabase
          .from('rss_news_cache')
          .select('*')
          .eq('category', category)
          .gte('published_date', threeDaysAgo)
          .order('published_date', { ascending: false })
          .limit(2);
        
        if (error) {
          console.error(`Error fetching ${category} articles:`, error);
          continue;
        }
        
        if (categoryArticles && categoryArticles.length > 0) {
          const mapped: Article[] = categoryArticles.map(item => ({
            id: item.id,
            title: item.title,
            ai_summary: item.summary,
            source: item.source_name,
            url: item.source_url,
            category: item.category,
            published_at: item.published_date,
            business_lens: item.business_lens,
            ai_why_it_matters: null,
            ai_commercial_angle: null,
            processed: false,
            created_at: item.created_at,
            excerpt: item.summary,
            content: null
          }));
          articles = [...articles, ...mapped];
          console.log(`Added ${categoryArticles.length} ${category} articles from news cache`);
        }
      }
      
      // Sort by date (most recent first) and limit to 8
      articles = articles
        .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
        .slice(0, 8);
    }
    
    console.log(`Selected ${articles.length} articles for newsletter`);

    if (articles.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No articles available to send',
          articleCount: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If preview only: process articles with AI + return HTML (can be slower)
    if (previewOnly) {
      const processedArticles: ProcessedArticle[] = [];

      for (const article of articles) {
        console.log(`Processing article: ${article.title}`);

        // Check if already has AI content
        if (article.ai_summary && article.ai_why_it_matters && article.ai_commercial_angle) {
          processedArticles.push(article as ProcessedArticle);
          continue;
        }

        const aiContent = await generateAISummary(article, lovableKey);

        const processedArticle: ProcessedArticle = {
          ...article,
          ai_summary: aiContent.summary,
          ai_why_it_matters: aiContent.whyItMatters,
          ai_commercial_angle: aiContent.commercialAngle,
        };

        processedArticles.push(processedArticle);

        // Update article with AI content
        await supabase
          .from('articles')
          .update({
            ai_summary: aiContent.summary,
            ai_why_it_matters: aiContent.whyItMatters,
            ai_commercial_angle: aiContent.commercialAngle,
          })
          .eq('id', article.id);
      }

      const previewEmailHtml = generateEmailHTML(processedArticles, true, '', '', '', '', customIntro);

      return new Response(
        JSON.stringify({
          success: true,
          preview: true,
          html: previewEmailHtml,
          articleCount: processedArticles.length,
          articles: processedArticles.map((a) => ({
            id: a.id,
            title: a.title,
            source: a.source,
            category: a.category,
            ai_summary: a.ai_summary,
            ai_why_it_matters: a.ai_why_it_matters,
            ai_commercial_angle: a.ai_commercial_angle,
          })),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SEND path: respond quickly; do heavy work in background to avoid timeouts
    const effectiveSubscriberCount = targetEmails?.length || 0;
    let allSubscriberCount = effectiveSubscriberCount;
    
    if (!targetEmails) {
      const { count: subscriberCount } = await supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      allSubscriberCount = subscriberCount || 0;
    }

    const articleIdsForSend = articles.map((a) => a.id);

    // Create send record first to get the ID for tracking/resume
    const { data: sendRecord, error: sendRecordError } = await supabase
      .from('newsletter_sends')
      .insert({
        recipient_count: 0,
        article_count: articles.length,
        article_ids: articleIdsForSend,
        status: 'sending',
        email_html: null,
        error_message: null,
      })
      .select('id')
      .single();

    if (sendRecordError || !sendRecord) {
      throw new Error('Failed to create send record: ' + sendRecordError?.message);
    }

    const sendId = sendRecord.id as string;
    const trackingBaseUrl = `${supabaseUrl}/functions/v1/newsletter-track`;

    console.log(`Queued send ${sendId}: starting background send workflow${targetEmails ? ` (targeted: ${targetEmails.length} emails)` : ''}`);

    // @ts-ignore - EdgeRuntime exists in the edge environment
    EdgeRuntime.waitUntil(
      runSendWorkflow({
        sendId,
        articles,
        trackingBaseUrl,
        targetEmails,
        customIntro,
      })
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: targetEmails ? `Newsletter sending started to ${targetEmails.length} selected subscribers` : 'Newsletter sending started',
        articleCount: articles.length,
        subscriberCount: allSubscriberCount,
        sendId,
        batchSize: BATCH_SIZE,
        delaySeconds: Math.floor(DELAY_MS / 1000),
        targeted: !!targetEmails,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Newsletter error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
