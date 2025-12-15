import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CACHE_DURATION_MINUTES = 20;

interface RSSFeed {
  url: string;
  category: string;
  sourceName: string;
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source_url: string;
  source_name: string;
  category: string;
  image_url: string | null;
  published_date: string;
}

const RSS_FEEDS: RSSFeed[] = [
  // AI & Technology
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', category: 'AI', sourceName: 'TechCrunch' },
  { url: 'https://www.wired.com/feed/tag/ai/latest/rss', category: 'AI', sourceName: 'Wired' },
  { url: 'https://www.technologyreview.com/feed/', category: 'Technology', sourceName: 'MIT Tech Review' },
  { url: 'https://venturebeat.com/category/ai/feed/', category: 'AI', sourceName: 'VentureBeat' },
  { url: 'https://www.theverge.com/artificial-intelligence/rss/index.xml', category: 'AI', sourceName: 'The Verge' },
  
  // Health Tech
  { url: 'https://www.mobihealthnews.com/feed', category: 'Technology', sourceName: 'MobiHealthNews' },
  { url: 'https://www.statnews.com/feed/', category: 'Technology', sourceName: 'STAT News' },
  { url: 'https://rockhealth.com/insights/feed/', category: 'Technology', sourceName: 'Rock Health' },
  
  // Wellness & Fitness
  { url: 'https://globalwellnessinstitute.org/feed/', category: 'Wellness', sourceName: 'Global Wellness Institute' },
  { url: 'https://www.wellandgood.com/feed/', category: 'Wellness', sourceName: 'Well+Good' },
  { url: 'https://longevity.technology/feed/', category: 'Wellness', sourceName: 'Longevity Technology' },
  { url: 'https://insider.fitt.co/rss/', category: 'Fitness', sourceName: 'Fitt Insider' },
  
  // Fitness Industry
  { url: 'https://www.sportstechie.com/feed/', category: 'Fitness', sourceName: 'SportsTechie' },
  
  // Business & Strategy
  { url: 'https://hbr.org/feed', category: 'Technology', sourceName: 'Harvard Business Review' },
  
  // AI Labs
  { url: 'https://openai.com/blog/rss/', category: 'AI', sourceName: 'OpenAI' },
];

function extractImageFromContent(content: string): string | null {
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch) return imgMatch[1];
  
  const mediaMatch = content.match(/<media:content[^>]+url=["']([^"']+)["']/i);
  if (mediaMatch) return mediaMatch[1];
  
  const enclosureMatch = content.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
  if (enclosureMatch && enclosureMatch[1].match(/\.(jpg|jpeg|png|gif|webp)/i)) {
    return enclosureMatch[1];
  }
  
  return null;
}

function parseRSSItem(item: string, feed: RSSFeed): NewsItem | null {
  try {
    const titleMatch = item.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/is);
    const title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
    
    if (!title) return null;
    
    const linkMatch = item.match(/<link[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/is) ||
                      item.match(/<link[^>]+href=["']([^"']+)["']/i);
    const link = linkMatch ? linkMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
    
    if (!link) return null;
    
    const descMatch = item.match(/<description[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/is) ||
                      item.match(/<summary[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/summary>/is) ||
                      item.match(/<content:encoded[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/content:encoded>/is);
    let summary = descMatch ? descMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
    
    summary = summary.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (summary.length > 300) {
      summary = summary.substring(0, 297) + '...';
    }
    
    const dateMatch = item.match(/<pubDate[^>]*>(.*?)<\/pubDate>/is) ||
                      item.match(/<published[^>]*>(.*?)<\/published>/is) ||
                      item.match(/<dc:date[^>]*>(.*?)<\/dc:date>/is) ||
                      item.match(/<updated[^>]*>(.*?)<\/updated>/is);
    const dateStr = dateMatch ? dateMatch[1].trim() : new Date().toISOString();
    
    let publishedDate: string;
    try {
      publishedDate = new Date(dateStr).toISOString();
    } catch {
      publishedDate = new Date().toISOString();
    }
    
    let imageUrl = extractImageFromContent(item);
    
    if (!imageUrl) {
      const thumbMatch = item.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i);
      if (thumbMatch) imageUrl = thumbMatch[1];
    }
    
    if (!imageUrl) {
      const contentMatch = item.match(/<content:encoded[^>]*>(.*?)<\/content:encoded>/is);
      if (contentMatch) {
        imageUrl = extractImageFromContent(contentMatch[1]);
      }
    }
    
    return {
      id: `${feed.sourceName}-${btoa(link).substring(0, 20)}`,
      title,
      summary: summary || 'Read more at source...',
      source_url: link,
      source_name: feed.sourceName,
      category: feed.category,
      image_url: imageUrl,
      published_date: publishedDate,
    };
  } catch (error) {
    console.error('Error parsing RSS item:', error);
    return null;
  }
}

async function fetchFeed(feed: RSSFeed): Promise<NewsItem[]> {
  try {
    console.log(`Fetching feed: ${feed.sourceName}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(feed.url, {
      headers: {
        'User-Agent': 'WellnessGenius/1.0 RSS Reader',
        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn(`Failed to fetch ${feed.sourceName}: ${response.status}`);
      return [];
    }
    
    const xml = await response.text();
    
    const itemRegex = /<item[^>]*>(.*?)<\/item>/gis;
    const entryRegex = /<entry[^>]*>(.*?)<\/entry>/gis;
    
    const items: NewsItem[] = [];
    let match;
    
    while ((match = itemRegex.exec(xml)) !== null && items.length < 5) {
      const parsed = parseRSSItem(match[1], feed);
      if (parsed) items.push(parsed);
    }
    
    if (items.length === 0) {
      while ((match = entryRegex.exec(xml)) !== null && items.length < 5) {
        const parsed = parseRSSItem(match[1], feed);
        if (parsed) items.push(parsed);
      }
    }
    
    console.log(`Fetched ${items.length} items from ${feed.sourceName}`);
    return items;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn(`Timeout fetching ${feed.sourceName}`);
    } else {
      console.error(`Error fetching ${feed.sourceName}:`, error);
    }
    return [];
  }
}

async function fetchAllFeeds(): Promise<NewsItem[]> {
  const results = await Promise.all(RSS_FEEDS.map(feed => fetchFeed(feed)));
  
  const allItems = results.flat();
  const seen = new Set<string>();
  const uniqueItems = allItems.filter(item => {
    const key = item.title.toLowerCase().substring(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  return uniqueItems
    .sort((a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime())
    .slice(0, 50);
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
    const forceRefresh = url.searchParams.get('refresh') === 'true' || 
                         req.headers.get('x-force-refresh') === 'true';
    const limit = parseInt(url.searchParams.get('limit') || '30');

    console.log(`Request - category: ${category || 'all'}, forceRefresh: ${forceRefresh}, limit: ${limit}`);

    // Check cache metadata
    const { data: metadata } = await supabase
      .from('rss_cache_metadata')
      .select('last_refresh, items_count')
      .eq('id', 'global')
      .single();

    const lastRefresh = metadata?.last_refresh ? new Date(metadata.last_refresh) : new Date(0);
    const minutesSinceRefresh = (Date.now() - lastRefresh.getTime()) / (1000 * 60);
    const cacheIsStale = minutesSinceRefresh > CACHE_DURATION_MINUTES || metadata?.items_count === 0;

    console.log(`Cache age: ${minutesSinceRefresh.toFixed(1)} minutes, stale: ${cacheIsStale}`);

    // If cache is fresh and not forcing refresh, return cached data
    if (!cacheIsStale && !forceRefresh) {
      console.log('Returning cached data');
      
      let query = supabase
        .from('rss_news_cache')
        .select('news_id, title, summary, source_url, source_name, category, image_url, published_date')
        .order('published_date', { ascending: false })
        .limit(limit);

      if (category && category !== 'All') {
        query = query.eq('category', category);
      }

      const { data: cachedNews, error } = await query;

      if (error) throw error;

      const formattedNews = cachedNews?.map(item => ({
        id: item.news_id,
        title: item.title,
        summary: item.summary,
        source_url: item.source_url,
        source_name: item.source_name,
        category: item.category,
        image_url: item.image_url,
        published_date: item.published_date,
      })) || [];

      return new Response(
        JSON.stringify({
          success: true,
          data: formattedNews,
          count: formattedNews.length,
          cached: true,
          cache_age_minutes: Math.round(minutesSinceRefresh),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch fresh data from RSS feeds
    console.log('Fetching fresh RSS data...');
    const freshNews = await fetchAllFeeds();

    if (freshNews.length > 0) {
      // Clear old cache and insert new data
      console.log(`Updating cache with ${freshNews.length} items`);
      
      await supabase.from('rss_news_cache').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      const cacheItems = freshNews.map(item => ({
        news_id: item.id,
        title: item.title,
        summary: item.summary,
        source_url: item.source_url,
        source_name: item.source_name,
        category: item.category,
        image_url: item.image_url,
        published_date: item.published_date,
        fetched_at: new Date().toISOString(),
      }));

      const { error: insertError } = await supabase
        .from('rss_news_cache')
        .insert(cacheItems);

      if (insertError) {
        console.error('Error inserting cache:', insertError);
      }

      // Update metadata
      await supabase
        .from('rss_cache_metadata')
        .upsert({
          id: 'global',
          last_refresh: new Date().toISOString(),
          items_count: freshNews.length,
        });
    }

    // Filter by category if needed
    let resultNews = freshNews;
    if (category && category !== 'All') {
      resultNews = freshNews.filter(item => item.category === category);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: resultNews.slice(0, limit),
        count: resultNews.length,
        cached: false,
        sources: RSS_FEEDS.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in fetch-rss-news:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch news' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
