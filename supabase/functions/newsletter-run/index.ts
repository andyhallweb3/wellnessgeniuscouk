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
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || 'Summary unavailable',
        whyItMatters: parsed.whyItMatters || ['Analysis pending'],
        commercialAngle: parsed.commercialAngle || 'Commercial angle pending',
      };
    }
    
    throw new Error('Could not parse AI response');
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return {
      summary: article.excerpt?.substring(0, 150) || 'Summary unavailable',
      whyItMatters: ['Industry development worth monitoring', 'Potential impact on wellness sector', 'Stay informed on emerging trends'],
      commercialAngle: 'Monitor for potential business applications',
    };
  }
}

function generateEmailHTML(articles: ProcessedArticle[], previewOnly = false): string {
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
              <a href="${article.url}" style="color: #0f172a; font-size: 18px; font-weight: 600; text-decoration: none; line-height: 1.4;">
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
              <a href="${article.url}" style="display: inline-block; color: #0d9488; font-size: 14px; font-weight: 500; text-decoration: none;">
                Read full article →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

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
                    <a href="https://wellnessgenius.co.uk/ai-readiness" style="display: inline-block; padding: 12px 24px; background: white; color: #0d9488; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px;">
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
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                You're receiving this because you subscribed to Wellness Genius insights.
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

    const body = await req.json().catch(() => ({}));
    const previewOnly = body.preview === true;
    const syncFromRss = body.syncFromRss === true;

    console.log(`Newsletter run - preview: ${previewOnly}, syncFromRss: ${syncFromRss}`);

    // Optionally sync articles from RSS cache with category diversity
    if (syncFromRss) {
      console.log('Syncing articles from RSS cache with category diversity...');
      
      const categories = ['AI', 'Wellness', 'Fitness', 'Technology', 'Investment'];
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

    // Fetch unprocessed articles with category diversity
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const targetCategories = ['AI', 'Wellness', 'Fitness', 'Technology', 'Investment'];
    const articlesPerCategoryForNewsletter = 2;
    let allArticles: Article[] = [];

    // Fetch 2 articles per category to ensure diversity
    for (const category of targetCategories) {
      const { data: categoryArticles } = await supabase
        .from('articles')
        .select('*')
        .eq('processed', false)
        .eq('category', category)
        .gte('published_at', oneDayAgo)
        .order('published_at', { ascending: false })
        .limit(articlesPerCategoryForNewsletter);

      if (categoryArticles && categoryArticles.length > 0) {
        allArticles = [...allArticles, ...categoryArticles];
        console.log(`Found ${categoryArticles.length} ${category} articles`);
      }
    }

    // Sort by date and take top 8
    const articles = allArticles
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, 8);

    console.log(`Selected ${articles.length} articles across categories`);

    if (articles.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No unprocessed articles to send',
          articleCount: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process articles with AI
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

    // Generate email HTML
    const emailHtml = generateEmailHTML(processedArticles, previewOnly);

    // If preview only, return the HTML
    if (previewOnly) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          preview: true,
          html: emailHtml,
          articleCount: processedArticles.length,
          articles: processedArticles.map(a => ({
            id: a.id,
            title: a.title,
            source: a.source,
            category: a.category,
            ai_summary: a.ai_summary,
            ai_why_it_matters: a.ai_why_it_matters,
            ai_commercial_angle: a.ai_commercial_angle,
          }))
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch active subscribers
    const { data: subscribers, error: subError } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('is_active', true);

    if (subError) throw subError;

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No active subscribers',
          articleCount: processedArticles.length,
          subscriberCount: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Sending to ${subscribers.length} subscribers`);

    // Send emails via Resend
    const emailPromises = subscribers.map(sub => 
      resend.emails.send({
        from: 'Wellness Genius <newsletter@news.wellnessgenius.co.uk>',
        to: [sub.email],
        subject: `AI & Wellness Weekly: ${processedArticles[0].title}`,
        html: emailHtml,
      })
    );

    const results = await Promise.allSettled(emailPromises);
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failCount = results.filter(r => r.status === 'rejected').length;

    console.log(`Sent ${successCount} emails, ${failCount} failed`);

    // Mark articles as processed
    const articleIds = processedArticles.map(a => a.id);
    await supabase
      .from('articles')
      .update({ processed: true })
      .in('id', articleIds);

    // Log the send
    await supabase
      .from('newsletter_sends')
      .insert({
        recipient_count: successCount,
        article_count: processedArticles.length,
        status: failCount > 0 ? 'partial' : 'sent',
        error_message: failCount > 0 ? `${failCount} emails failed to send` : null,
        email_html: emailHtml,
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Newsletter sent successfully`,
        articleCount: processedArticles.length,
        subscriberCount: successCount,
        failedCount: failCount
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
