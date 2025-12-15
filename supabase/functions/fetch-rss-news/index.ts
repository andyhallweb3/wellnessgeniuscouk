const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  // Try to find image in content
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch) return imgMatch[1];
  
  // Try media:content
  const mediaMatch = content.match(/<media:content[^>]+url=["']([^"']+)["']/i);
  if (mediaMatch) return mediaMatch[1];
  
  // Try enclosure
  const enclosureMatch = content.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
  if (enclosureMatch && enclosureMatch[1].match(/\.(jpg|jpeg|png|gif|webp)/i)) {
    return enclosureMatch[1];
  }
  
  return null;
}

function parseRSSItem(item: string, feed: RSSFeed): NewsItem | null {
  try {
    // Extract title
    const titleMatch = item.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/is);
    const title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
    
    if (!title) return null;
    
    // Extract link
    const linkMatch = item.match(/<link[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/is) ||
                      item.match(/<link[^>]+href=["']([^"']+)["']/i);
    const link = linkMatch ? linkMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
    
    if (!link) return null;
    
    // Extract description/summary
    const descMatch = item.match(/<description[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/is) ||
                      item.match(/<summary[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/summary>/is) ||
                      item.match(/<content:encoded[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/content:encoded>/is);
    let summary = descMatch ? descMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
    
    // Strip HTML tags from summary and limit length
    summary = summary.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (summary.length > 300) {
      summary = summary.substring(0, 297) + '...';
    }
    
    // Extract date
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
    
    // Extract image
    let imageUrl = extractImageFromContent(item);
    
    // Also check for media:thumbnail
    if (!imageUrl) {
      const thumbMatch = item.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i);
      if (thumbMatch) imageUrl = thumbMatch[1];
    }
    
    // Check for image in content
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
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
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
    
    // Extract items (RSS) or entries (Atom)
    const itemRegex = /<item[^>]*>(.*?)<\/item>/gis;
    const entryRegex = /<entry[^>]*>(.*?)<\/entry>/gis;
    
    const items: NewsItem[] = [];
    let match;
    
    // Try RSS format first
    while ((match = itemRegex.exec(xml)) !== null && items.length < 5) {
      const parsed = parseRSSItem(match[1], feed);
      if (parsed) items.push(parsed);
    }
    
    // Try Atom format if no RSS items found
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    const limit = parseInt(url.searchParams.get('limit') || '30');
    
    console.log(`Fetching RSS feeds - category: ${category || 'all'}, limit: ${limit}`);
    
    // Filter feeds by category if specified
    const feedsToFetch = category && category !== 'All'
      ? RSS_FEEDS.filter(f => f.category === category)
      : RSS_FEEDS;
    
    // Fetch all feeds concurrently
    const results = await Promise.all(feedsToFetch.map(feed => fetchFeed(feed)));
    
    // Flatten and deduplicate by title
    const allItems = results.flat();
    const seen = new Set<string>();
    const uniqueItems = allItems.filter(item => {
      const key = item.title.toLowerCase().substring(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    
    // Sort by date (newest first) and limit
    const sortedItems = uniqueItems
      .sort((a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime())
      .slice(0, limit);
    
    console.log(`Returning ${sortedItems.length} news items`);
    
    return new Response(
      JSON.stringify({
        success: true,
        data: sortedItems,
        count: sortedItems.length,
        sources: feedsToFetch.length,
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
