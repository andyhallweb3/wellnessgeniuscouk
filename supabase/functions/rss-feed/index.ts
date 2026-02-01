import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsItem {
  news_id: string;
  title: string;
  summary: string;
  source_url: string;
  source_name: string;
  category: string;
  image_url: string | null;
  published_date: string;
  business_lens: string | null;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatRFC822Date(date: string): string {
  return new Date(date).toUTCString();
}

function generateRssXml(items: NewsItem[], category?: string): string {
  const channelTitle = category && category !== 'All' 
    ? `Wellness Genius Daily - ${category}` 
    : 'Wellness Genius Daily';
  
  const channelDescription = 'Weekly intelligence for wellness operators. Revenue signals, operational insights, and market moves that matter for gyms, studios, and fitness facilities.';
  
  const itemsXml = items.map(item => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.source_url)}</link>
      <description><![CDATA[${item.summary}]]></description>
      <pubDate>${formatRFC822Date(item.published_date)}</pubDate>
      <guid isPermaLink="true">${escapeXml(item.source_url)}</guid>
      <source url="${escapeXml(item.source_url)}">${escapeXml(item.source_name)}</source>
      <category>${escapeXml(item.category)}</category>
      ${item.image_url ? `<enclosure url="${escapeXml(item.image_url)}" type="image/jpeg" />` : ''}
    </item>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>https://www.wellnessgenius.co.uk/news</link>
    <description>${escapeXml(channelDescription)}</description>
    <language>en-gb</language>
    <lastBuildDate>${formatRFC822Date(new Date().toISOString())}</lastBuildDate>
    <atom:link href="https://www.wellnessgenius.co.uk/rss" rel="self" type="application/rss+xml"/>
    <image>
      <url>https://www.wellnessgenius.co.uk/images/wellness-genius-logo-teal.png</url>
      <title>${escapeXml(channelTitle)}</title>
      <link>https://www.wellnessgenius.co.uk/news</link>
    </image>
    <copyright>© ${new Date().getFullYear()} Wellness Genius. All rights reserved.</copyright>
    <managingEditor>andy@wellnessgenius.co.uk (Andy Sherwood)</managingEditor>
    <webMaster>andy@wellnessgenius.co.uk (Andy Sherwood)</webMaster>
    <ttl>60</ttl>
${itemsXml}
  </channel>
</rss>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);

    let query = supabase
      .from('rss_news_cache')
      .select('news_id, title, summary, source_url, source_name, category, image_url, published_date, business_lens')
      .order('published_date', { ascending: false })
      .limit(limit);

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    const { data: newsItems, error } = await query;

    if (error) throw error;

    const rssXml = generateRssXml(newsItems || [], category || undefined);

    return new Response(rssXml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Wellness Genius Daily</title>
    <description>Error generating feed</description>
  </channel>
</rss>`,
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/rss+xml; charset=utf-8',
        },
      }
    );
  }
});
