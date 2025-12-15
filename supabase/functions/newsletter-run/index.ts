import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@4.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret',
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

function generateEmailHTML(
  articles: ProcessedArticle[], 
  previewOnly = false, 
  subscriberEmail = '',
  sendId = '',
  trackingBaseUrl = ''
): string {
  // Helper to create tracking URL for links
  const trackLink = (url: string) => {
    if (!sendId || !subscriberEmail || !trackingBaseUrl || previewOnly) return url;
    return `${trackingBaseUrl}?sid=${sendId}&e=${encodeURIComponent(subscriberEmail)}&t=c&url=${encodeURIComponent(url)}`;
  };

  const articleItems = articles.map((article, index) => `
    <tr>
      <td style="padding: 24px 0; border-bottom: 1px solid #e5e7eb;">
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
              <a href="${trackLink(article.url)}" style="color: #0f172a; font-size: 18px; font-weight: 600; text-decoration: none; line-height: 1.4;">
                ${article.title}
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 8px; color: #64748b; font-size: 12px;">
              ${article.source} • ${new Date(article.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </td>
          </tr>
          <tr>
            <td style="padding-top: 12px; color: #374151; font-size: 14px; line-height: 1.6;">
              ${article.ai_summary}
            </td>
          </tr>
          <tr>
            <td style="padding-top: 16px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; border-radius: 8px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 8px 0; color: #0d9488; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      Why it matters
                    </p>
                    <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                      ${article.ai_why_it_matters.map(point => `<li>${point}</li>`).join('')}
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 12px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #fef3c7; border-radius: 8px;">
                <tr>
                  <td style="padding: 12px 16px;">
                    <p style="margin: 0; color: #92400e; font-size: 13px;">
                      <strong>💡 Commercial angle:</strong> ${article.ai_commercial_angle}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 16px;">
              <a href="${trackLink(article.url)}" style="display: inline-block; color: #0d9488; font-size: 14px; font-weight: 500; text-decoration: none;">
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
  <title>Wellness Genius Weekly</title>
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
                AI & Wellness Industry Intelligence
              </p>
            </td>
          </tr>
          
          <!-- Intro -->
          <tr>
            <td style="padding: 32px 32px 0;">
              <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;">
                Here are the top stories from the intersection of AI, wellness, and fitness this week—with insights on why they matter for your business.
              </p>
            </td>
          </tr>
          
          <!-- Articles -->
          <tr>
            <td style="padding: 24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${articleItems}
              </table>
            </td>
          </tr>
          
          <!-- CTA -->
          <tr>
            <td style="padding: 16px 32px 32px;">
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
            <td style="background: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px;">
                © ${new Date().getFullYear()} Wellness Genius. All rights reserved.
              </p>
              <p style="margin: 0 0 12px 0; color: #94a3b8; font-size: 11px;">
                You're receiving this because you subscribed to Wellness Genius insights.
              </p>
              <p style="margin: 0;">
                <a href="https://wellnessgenius.co.uk/unsubscribe${subscriberEmail ? `?email=${encodeURIComponent(subscriberEmail)}` : ''}" style="color: #64748b; font-size: 11px; text-decoration: underline;">
                  Unsubscribe
                </a>
                <span style="color: #94a3b8; font-size: 11px;"> • </span>
                <a href="${trackLink('https://wellnessgenius.co.uk/privacy-policy')}" style="color: #64748b; font-size: 11px; text-decoration: underline;">
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
    // Verify admin secret
    const adminSecret = Deno.env.get('ADMIN_SECRET');
    const providedSecret = req.headers.get('x-admin-secret');
    
    console.log('Admin secret check:', {
      hasEnvSecret: !!adminSecret,
      hasProvidedSecret: !!providedSecret,
      secretLength: providedSecret?.length || 0,
    });
    
    if (!adminSecret || providedSecret !== adminSecret) {
      console.log('Unauthorized access attempt to newsletter-run');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid admin secret' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendKey = Deno.env.get('RESEND_API_KEY')!;
    const lovableKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendKey);

    // Core send workflow: idempotent + resumable using newsletter_send_recipients
    const BATCH_SIZE = 50;
    const DELAY_MS = 2000;

    const runSendWorkflow = async (opts: {
      sendId: string;
      articles: Article[];
      trackingBaseUrl: string;
    }) => {
      const { sendId, articles, trackingBaseUrl } = opts;

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
        const emailHtml = generateEmailHTML(processedArticles, true);
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
          // Fetch ALL active subscribers (override default 1000 limit)
          let allSubscribers: { email: string }[] = [];
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
              const personalizedHtml = generateEmailHTML(
                processedArticles,
                false,
                row.email,
                sendId,
                trackingBaseUrl
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

    const body = await req.json().catch(() => ({}));
    const previewOnly = body.preview === true;
    const syncFromRss = body.syncFromRss === true;

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

    console.log(`Newsletter run - preview: ${previewOnly}, syncFromRss: ${syncFromRss}`);

    // Optionally sync articles from RSS cache with category diversity
    if (syncFromRss) {
      console.log('Syncing articles from RSS cache with category diversity...');
      
      const categories = ['AI', 'Wellness', 'Fitness', 'Technology', 'Investment', 'Hospitality', 'Corporate Wellness'];
      const articlesPerCategory = 4;
      let totalSynced = 0;

      for (const category of categories) {
        const { data: rssItems } = await supabase
          .from('rss_news_cache')
          .select('*')
          .eq('category', category)
          .order('published_date', { ascending: false })
          .limit(articlesPerCategory);

        if (rssItems && rssItems.length > 0) {
          for (const item of rssItems) {
            await supabase
              .from('articles')
              .upsert({
                title: item.title,
                source: item.source_name,
                url: item.source_url,
                published_at: item.published_date,
                category: item.category,
                excerpt: item.summary,
                processed: false,
              }, { onConflict: 'url' });
          }
          totalSynced += rssItems.length;
          console.log(`Synced ${rssItems.length} ${category} articles`);
        }
      }
      console.log(`Total synced: ${totalSynced} articles across ${categories.length} categories`);
    }

    // SCORE-BASED SELECTION: Prioritize articles with score >= 65
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    // First, try to get scored articles (score >= 65, unprocessed, from last week)
    const { data: scoredArticles } = await supabase
      .from('articles')
      .select('*')
      .eq('processed', false)
      .gte('score_total', 65)
      .gte('published_at', oneWeekAgo)
      .order('score_total', { ascending: false })
      .limit(8);

    let articles: Article[] = [];

    if (scoredArticles && scoredArticles.length >= 5) {
      // Use scored articles - we have enough qualified content
      articles = scoredArticles.slice(0, 8);
      console.log(`Using ${articles.length} score-qualified articles (score >= 65)`);
    } else {
      // Fallback: mix scored with category-diverse unscored articles
      console.log(`Only ${scoredArticles?.length || 0} scored articles found, falling back to category diversity`);
      
      const targetCategories = ['AI', 'Wellness', 'Fitness', 'Technology', 'Investment', 'Hospitality', 'Corporate Wellness'];
      const articlesPerCategoryForNewsletter = 2;
      let allArticles: Article[] = scoredArticles || [];

      // Add category-diverse articles to fill gaps
      for (const category of targetCategories) {
        if (allArticles.length >= 8) break;
        
        const existingInCategory = allArticles.filter(a => a.category === category).length;
        if (existingInCategory >= articlesPerCategoryForNewsletter) continue;

        const needed = articlesPerCategoryForNewsletter - existingInCategory;
        const existingIds = allArticles.map(a => a.id);
        
        const { data: categoryArticles } = await supabase
          .from('articles')
          .select('*')
          .eq('processed', false)
          .eq('category', category)
          .not('id', 'in', `(${existingIds.join(',')})`)
          .gte('published_at', oneWeekAgo)
          .order('score_total', { ascending: false, nullsFirst: false })
          .limit(needed);

        if (categoryArticles && categoryArticles.length > 0) {
          allArticles = [...allArticles, ...categoryArticles];
          console.log(`Added ${categoryArticles.length} ${category} articles`);
        }
      }

      // Sort by score (nulls last), then by date
      articles = allArticles
        .sort((a, b) => {
          const scoreA = (a as any).score_total || 0;
          const scoreB = (b as any).score_total || 0;
          if (scoreB !== scoreA) return scoreB - scoreA;
          return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
        })
        .slice(0, 8);
    }

    console.log(`Selected ${articles.length} articles for newsletter`);
    if (articles.length > 0) {
      const avgScore = articles.reduce((sum, a) => sum + ((a as any).score_total || 0), 0) / articles.length;
      console.log(`Average score: ${avgScore.toFixed(1)}`);
    }

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

      const previewEmailHtml = generateEmailHTML(processedArticles, true);

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
    const { count: subscriberCount } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

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

    console.log(`Queued send ${sendId}: starting background send workflow`);

    // @ts-ignore - EdgeRuntime exists in the edge environment
    EdgeRuntime.waitUntil(
      runSendWorkflow({
        sendId,
        articles,
        trackingBaseUrl,
      })
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Newsletter sending started',
        articleCount: articles.length,
        subscriberCount: subscriberCount || 0,
        sendId,
        batchSize: BATCH_SIZE,
        delaySeconds: Math.floor(DELAY_MS / 1000),
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
