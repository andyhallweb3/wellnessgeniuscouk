import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret, x-force-refresh',
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
  // === OPERATOR & B2B FOCUSED (Priority Sources) ===
  
  // Fitness Industry Trade (Gyms, Health Clubs, Studios)
  { url: 'https://clubindustry.com/rss.xml', category: 'Fitness', sourceName: 'Club Industry' },
  { url: 'https://athletechnews.com/feed/', category: 'Fitness', sourceName: 'Athletech News' },
  { url: 'https://www.athleticbusiness.com/rss', category: 'Fitness', sourceName: 'Athletic Business' },
  { url: 'https://insider.fitt.co/rss/', category: 'Fitness', sourceName: 'Fitt Insider' },
  
  // Spa & Wellness Industry Trade
  { url: 'https://www.spabusiness.com/rss', category: 'Wellness', sourceName: 'Spa Business' },
  { url: 'https://globalwellnessinstitute.org/feed/', category: 'Wellness', sourceName: 'Global Wellness Institute' },
  { url: 'https://longevity.technology/news/feed/', category: 'Wellness', sourceName: 'Longevity Technology' },
  
  // Hospitality & Hotels
  { url: 'https://skift.com/feed/', category: 'Hospitality', sourceName: 'Skift' },
  { url: 'https://www.hotelmanagement.net/rss.xml', category: 'Hospitality', sourceName: 'Hotel Management' },
  { url: 'https://www.phocuswire.com/rss.xml', category: 'Hospitality', sourceName: 'Phocuswire' },
  
  // Corporate Wellness & HR
  { url: 'https://www.benefitnews.com/feed', category: 'Corporate Wellness', sourceName: 'Employee Benefit News' },
  { url: 'https://www.hrdive.com/feeds/news/', category: 'Corporate Wellness', sourceName: 'HR Dive' },
  { url: 'https://www.shrm.org/rss/pages/rss.aspx', category: 'Corporate Wellness', sourceName: 'SHRM' },
  
  // === AI & TECH (Curated for Business Value) ===
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', category: 'AI', sourceName: 'TechCrunch' },
  { url: 'https://venturebeat.com/category/ai/feed/', category: 'AI', sourceName: 'VentureBeat' },
  { url: 'https://www.technologyreview.com/feed/', category: 'Technology', sourceName: 'MIT Tech Review' },
  { url: 'https://blog.google/technology/ai/rss/', category: 'AI', sourceName: 'Google AI' },
  
  // Health Tech & Digital Health
  { url: 'https://www.mobihealthnews.com/feed', category: 'Technology', sourceName: 'MobiHealthNews' },
  { url: 'https://www.healthcareitnews.com/rss.xml', category: 'Technology', sourceName: 'Healthcare IT News' },
  { url: 'https://www.statnews.com/feed/', category: 'Technology', sourceName: 'STAT News' },
  { url: 'https://www.fiercehealthcare.com/rss/xml', category: 'Technology', sourceName: 'Fierce Healthcare' },
  
  // Investment & Funding
  { url: 'https://news.crunchbase.com/sections/health-wellness-biotech/rss/', category: 'Investment', sourceName: 'Crunchbase Health' },
  { url: 'https://news.crunchbase.com/feed/', category: 'Investment', sourceName: 'Crunchbase' },
  { url: 'https://sifted.eu/feed', category: 'Investment', sourceName: 'Sifted' },
  
  // Business Strategy
  { url: 'https://www.fastcompany.com/section/health/rss', category: 'Technology', sourceName: 'Fast Company' },
  { url: 'https://www.forbes.com/health/feed/', category: 'Wellness', sourceName: 'Forbes Health' },
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
    let title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
    
    // Strip any HTML tags from title (some feeds include anchor tags)
    title = title.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    
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
    // Use the canonical URL as a stable unique id (avoids collisions across similar URLs)
    return {
      id: link,
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
    const limit = parseInt(url.searchParams.get('limit') || '30');
    
    // Force refresh requires admin authentication to prevent abuse
    const adminSecret = Deno.env.get('ADMIN_SECRET');
    const providedSecret = req.headers.get('x-admin-secret');
    const isAdmin = adminSecret && providedSecret === adminSecret;
    
    const forceRefreshRequested = url.searchParams.get('refresh') === 'true' || 
                                  req.headers.get('x-force-refresh') === 'true';
    const forceRefresh = forceRefreshRequested && isAdmin;
    
    if (forceRefreshRequested && !isAdmin) {
      console.log('Force refresh requested but admin auth missing or invalid');
    }

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

    // If cache is fresh and not forcing refresh, try to return cached data
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

      // Safety: if cache table is empty but metadata says it's fresh, treat as stale and refetch
      if (formattedNews.length > 0) {
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

      console.warn('Cache metadata says fresh but table is empty; refetching');
    }

    // Fetch fresh data from RSS feeds
    console.log('Fetching fresh RSS data...');
    const freshNews = await fetchAllFeeds();

    if (freshNews.length > 0) {
      console.log(`Updating cache with ${freshNews.length} items`);

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

      // Deduplicate within the batch to avoid unique-constraint errors
      const uniqueCacheItems = Array.from(
        new Map(cacheItems.map(i => [i.news_id, i])).values()
      );

      const { error: upsertError } = await supabase
        .from('rss_news_cache')
        .upsert(uniqueCacheItems, { onConflict: 'news_id' });

      if (upsertError) {
        console.error('Error writing cache:', upsertError);
        // Don't update metadata if cache write failed; this forces a retry on next request
      } else {
        console.log(`Successfully cached ${uniqueCacheItems.length} items`);

        // Update metadata ONLY after a successful cache write
        await supabase
          .from('rss_cache_metadata')
          .upsert({
            id: 'global',
            last_refresh: new Date().toISOString(),
            items_count: uniqueCacheItems.length,
          });
      }
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
