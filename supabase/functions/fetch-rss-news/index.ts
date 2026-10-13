import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validateAdminAuth } from '../_shared/admin-auth.ts';
import { getCorsHeaders, corsHeaders } from '../_shared/cors.ts';

const corsHeadersExtended = {
  ...corsHeaders,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-force-refresh',
};

const CACHE_DURATION_MINUTES = 20;

type Sector = 'hotels-spas' | 'fitness' | 'clinics' | 'country-clubs';

interface RSSFeed {
  url: string;
  category: string;
  sourceName: string;
  sectors?: Sector[]; // default sectors for every item from this feed
}

// Sector tagging.
// Trade-press feeds (with default sectors) are trusted: their items get only the feed's sectors.
// General feeds are tagged by keywords: one strong term is enough, loose terms need two matches.
const SECTOR_RULES: Record<Sector, { strong: RegExp; loose: RegExp }> = {
  'hotels-spas': {
    strong: /\b(hotels?|hotelier|hospitality|resorts?|day spas?|hotel spas?|spa (resort|business|operator|menu|director)s?|thermal spas?|wellness (retreat|resort|tourism|travel)s?)\b/gi,
    loose: /\b(spas?|guests?|bookings?|thermal|sauna|bathhouse|retreats?|travel)\b/gi,
  },
  'fitness': {
    strong: /\b(gyms?|fitness|health clubs?|leisure centres?|ukactive|ihrsa|personal train(er|ers|ing)|boutique fitness)\b/gi,
    loose: /\b(studios?|yoga|pilates|strength|workouts?|exercise|members(hip)?|classes|trainers?)\b/gi,
  },
  'clinics': {
    strong: /\b(clinics?|med ?spas?|medspas?|aesthetic (clinic|medicine|practitioner|treatment)s?|longevity|hyperbaric|cryotherapy|dermatolog(y|ist|ists))\b/gi,
    loose: /\b(patients?|diagnostics?|physiotherap(y|ist)|iv drips?|red light|injectables?|botox|healthspan|biomarkers?)\b/gi,
  },
  'country-clubs': {
    strong: /\b(country clubs?|private clubs?|golf (clubs?|courses?|resorts?)|members'? clubs?|club manag(er|ers|ement))\b/gi,
    loose: /\b(golf(ers)?|tennis|racquet|padel|clubhouse|members?)\b/gi,
  },
};

const countMatches = (re: RegExp, text: string) => (text.match(re) || []).length;

function tagSectors(title: string, summary: string, feed: RSSFeed): Sector[] {
  if (feed.sectors && feed.sectors.length > 0) return [...feed.sectors];
  const text = `${title} ${summary}`;
  const tags: Sector[] = [];
  for (const [sector, rule] of Object.entries(SECTOR_RULES) as [Sector, { strong: RegExp; loose: RegExp }][]) {
    if (countMatches(rule.strong, text) >= 1 || countMatches(rule.loose, text) >= 2) tags.push(sector);
  }
  return tags;
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
  sectors: Sector[];
  business_lens?: string | null;
}

const RSS_FEEDS: RSSFeed[] = [
  // === SECTOR SOURCES (added Oct 2026, each verified to return RSS) ===
  // Hotels & Spas
  { url: 'https://www.hospitalitynet.org/news/global.xml', category: 'Hospitality', sourceName: 'Hospitality Net', sectors: ['hotels-spas'] },
  { url: 'https://hoteldesigns.net/feed/', category: 'Hospitality', sourceName: 'Hotel Designs', sectors: ['hotels-spas'] },
  { url: 'https://www.hotelowner.co.uk/feed/', category: 'Hospitality', sourceName: 'Hotel Owner', sectors: ['hotels-spas'] },
  { url: 'https://www.hoteliermiddleeast.com/feed', category: 'Hospitality', sourceName: 'Hotelier Middle East', sectors: ['hotels-spas'] },
  { url: 'https://www.globalwellnesssummit.com/feed/', category: 'Wellness', sourceName: 'Global Wellness Summit', sectors: ['hotels-spas', 'clinics'] },
  { url: 'https://news.google.com/rss/search?q=%22hotel+spa%22+OR+%22wellness+resort%22&hl=en-GB&gl=GB&ceid=GB:en', category: 'Hospitality', sourceName: 'Google News: hotel spa', sectors: ['hotels-spas'] },
  // Wellness Clinics
  { url: 'https://www.aestheticsjournal.com/rss', category: 'Clinics', sourceName: 'Aesthetics Journal', sectors: ['clinics'] },
  { url: 'https://www.aestheticmed.co.uk/rss', category: 'Clinics', sourceName: 'Aesthetic Medicine' }, // keyword-tagged: mixes beauty and clinic news
  { url: 'https://www.lifespan.io/feed/', category: 'Clinics', sourceName: 'Lifespan.io', sectors: ['clinics'] },
  { url: 'https://news.google.com/rss/search?q=%22medspa%22+OR+%22med+spa%22+OR+%22longevity+clinic%22&hl=en-GB&gl=GB&ceid=GB:en', category: 'Clinics', sourceName: 'Google News: clinics', sectors: ['clinics'] },
  // Country Clubs
  { url: 'https://clubandresortbusiness.com/feed/', category: 'Clubs', sourceName: 'Club + Resort Business', sectors: ['country-clubs'] },
  { url: 'https://news.google.com/rss/search?q=%28%22country+club%22+OR+%22private+club%22%29+%28membership+OR+%22club+manager%22+OR+%22general+manager%22+OR+clubhouse%29+-college+-university+-NCAA&hl=en-GB&gl=GB&ceid=GB:en', category: 'Clubs', sourceName: 'Google News: country clubs', sectors: ['country-clubs'] },

  // === OPERATOR & B2B FOCUSED (Priority Sources) ===
  
  // Fitness Industry Trade (Gyms, Health Clubs, Studios)
  { url: 'https://www.hcmmag.com/feed/', category: 'Fitness', sourceName: 'HCM Magazine', sectors: ['fitness'] },
  { url: 'https://clubindustry.com/rss.xml', category: 'Fitness', sourceName: 'Club Industry', sectors: ['fitness'] },
  { url: 'https://athletechnews.com/feed/', category: 'Fitness', sourceName: 'Athletech News', sectors: ['fitness'] },
  { url: 'https://www.athleticbusiness.com/rss', category: 'Fitness', sourceName: 'Athletic Business', sectors: ['fitness'] },
  { url: 'https://insider.fitt.co/rss/', category: 'Fitness', sourceName: 'Fitt Insider', sectors: ['fitness'] },
  
  // Spa & Wellness Industry Trade
  { url: 'https://www.spabusiness.com/rss', category: 'Wellness', sourceName: 'Spa Business', sectors: ['hotels-spas'] },
  { url: 'https://globalwellnessinstitute.org/feed/', category: 'Wellness', sourceName: 'Global Wellness Institute', sectors: ['hotels-spas', 'clinics'] },
  { url: 'https://longevity.technology/news/feed/', category: 'Wellness', sourceName: 'Longevity Technology' },
  
  // Hospitality & Hotels
  { url: 'https://skift.com/feed/', category: 'Hospitality', sourceName: 'Skift' },
  { url: 'https://www.hotelmanagement.net/rss.xml', category: 'Hospitality', sourceName: 'Hotel Management', sectors: ['hotels-spas'] },
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

// Decode common HTML entities (named and numeric) found in feed titles and summaries.
const NAMED_ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '-', mdash: '-',
  lsquo: "'", rsquo: "'", ldquo: '"', rdquo: '"', hellip: '...', pound: '£', euro: '€',
};
export function decodeEntities(input: string): string {
  let out = input;
  for (let i = 0; i < 2; i++) { // twice handles double-encoded text like &amp;amp;
    out = out
      .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
      .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
      .replace(/&([a-z]+);/gi, (m, name) => NAMED_ENTITIES[name.toLowerCase()] ?? m);
  }
  return out;
}

const JUNK_SUMMARY = /^(x+|test|lorem ipsum.*|n\/?a|null|undefined|\.+|-+)$/i;
const SPORTS_OFFTOPIC = /\b(ncaa|hazing|football coach|basketball|quarterback|touchdown|athletics director|college football|college golf|softball|baseball|hockey|playoffs?|varsity)\b/i;

export function cleanSummary(summary: string): string {
  let s = summary.replace(/\s*The post .{1,400}? appeared first on .{1,200}?\.?\s*$/i, '').trim();
  s = s.replace(/\s*(Continue reading|Read more)\s*(\.\.\.|…)?\s*$/i, '').trim();
  if (s.length < 15 || JUNK_SUMMARY.test(s)) return '';
  return s;
}

export function isOffTopicSports(item: { title: string; sectors?: string[] | null }): boolean {
  return (!item.sectors || item.sectors.length === 0) && SPORTS_OFFTOPIC.test(item.title);
}

function absoluteUrl(u: string | null | undefined, base: string): string | null {
  if (!u) return null;
  try {
    const abs = new URL(u.replace(/&amp;/g, '&'), base).toString();
    return abs.startsWith('http') ? abs : null;
  } catch { return null; }
}

async function fetchOgImage(pageUrl: string): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 3500);
    const res = await fetch(pageUrl, { signal: ctrl.signal, redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WellnessGeniusBot/1.0)', Accept: 'text/html' } });
    clearTimeout(t);
    if (!res.ok || !(res.headers.get('content-type') || '').includes('html')) return null;
    const html = (await res.text()).slice(0, 200000);
    const m = html.match(/<meta[^>]+(?:property|name)=["'](?:og:image(?::secure_url)?|twitter:image)["'][^>]*>/i)?.[0];
    const c = m?.match(/content=["']([^"']+)["']/i)?.[1];
    return absoluteUrl(c, res.url || pageUrl);
  } catch { return null; }
}

/** Fill missing images via og:image, capped and concurrency-limited. */
export async function fillOgImages<T extends { source_url: string; image_url: string | null }>(items: T[], cap = 30): Promise<number> {
  const todo = items.filter(i => !i.image_url && !/news\.google\.com/.test(i.source_url)).slice(0, cap);
  let found = 0;
  for (let i = 0; i < todo.length; i += 8) {
    await Promise.all(todo.slice(i, i + 8).map(async (it) => {
      const img = await fetchOgImage(it.source_url);
      if (img) { it.image_url = img; found++; }
    }));
  }
  return found;
}

function extractImageFromContent(content: string): string | null {
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch) return imgMatch[1];
  
  const mediaMatch = content.match(/<media:content[^>]+url=["']([^"']+)["']/i);
  if (mediaMatch) return mediaMatch[1];
  
  const enclosureTag = content.match(/<enclosure[^>]*>/i)?.[0];
  if (enclosureTag) {
    const u = enclosureTag.match(/url=["']([^"']+)["']/i)?.[1];
    if (u && (/type=["']image\//i.test(enclosureTag) || /\.(jpg|jpeg|png|gif|webp)/i.test(u))) return u;
  }
  
  return null;
}

function parseRSSItem(item: string, feed: RSSFeed): NewsItem | null {
  try {
    const titleMatch = item.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/is);
    let title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
    
    // Strip any HTML tags from title (some feeds include anchor tags)
    title = decodeEntities(title.replace(/<[^>]+>/g, ' ')).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    
    if (!title) return null;
    
    const linkMatch = item.match(/<link[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/is) ||
                      item.match(/<link[^>]+href=["']([^"']+)["']/i);
    const link = linkMatch ? linkMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
    
    if (!link) return null;
    
    const descMatch = item.match(/<description[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/is) ||
                      item.match(/<summary[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/summary>/is) ||
                      item.match(/<content:encoded[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/content:encoded>/is);
    let summary = descMatch ? descMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
    
    summary = decodeEntities(summary.replace(/<[^>]+>/g, ' ')).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    summary = cleanSummary(summary);
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
      summary,
      source_url: link,
      source_name: feed.sourceName,
      category: feed.category,
      image_url: absoluteUrl(imageUrl, link),
      published_date: publishedDate,
      sectors: tagSectors(title, summary, feed),
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
    
    while ((match = itemRegex.exec(xml)) !== null && items.length < 8) {
      const parsed = parseRSSItem(match[1], feed);
      if (parsed) items.push(parsed);
    }
    
    if (items.length === 0) {
      while ((match = entryRegex.exec(xml)) !== null && items.length < 8) {
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
  
  // Keep every unique item so smaller sector sources are not crowded out.
  return uniqueItems
    .sort((a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime());
}

async function refreshCache(supabase: ReturnType<typeof createClient>): Promise<NewsItem[]> {
  // Fetch fresh data from RSS feeds
  console.log('Fetching fresh RSS data...');
  const freshNews = await fetchAllFeeds();

  if (freshNews.length > 0) {
    console.log(`Updating cache with ${freshNews.length} items`);

    // Get business_lens from articles table for matching URLs
    const urls = freshNews.map(item => item.source_url);
    const { data: articlesWithLens } = await supabase
      .from('articles')
      .select('url, business_lens')
      .in('url', urls);

    const lensMap = new Map<string, string>();
    if (articlesWithLens) {
      for (const article of articlesWithLens) {
        if (article.business_lens) {
          lensMap.set(article.url, article.business_lens);
        }
      }
    }
    console.log(`Found ${lensMap.size} articles with business_lens`);

    // Keep images already stored (including og:image backfills), then fetch og:image for a capped set of new items
    const { data: existingImgs } = await supabase
      .from('rss_news_cache')
      .select('news_id, image_url')
      .in('news_id', freshNews.map(i => i.id))
      .not('image_url', 'is', null);
    const imgMap = new Map((existingImgs || []).map(r => [r.news_id, r.image_url as string]));
    for (const item of freshNews) {
      if (!item.image_url && imgMap.has(item.id)) item.image_url = imgMap.get(item.id)!;
    }
    const ogCandidates = freshNews.filter(i => !imgMap.has(i.id) && (i.sectors.length > 0));
    const ogFound = await fillOgImages(ogCandidates, 30);
    console.log(`og:image filled ${ogFound}`);

    const cacheItems = freshNews.map(item => ({
      news_id: item.id,
      title: item.title,
      summary: item.summary,
      source_url: item.source_url,
      source_name: item.source_name,
      category: item.category,
      image_url: item.image_url,
      published_date: item.published_date,
      sectors: item.sectors,
      fetched_at: new Date().toISOString(),
      business_lens: lensMap.get(item.source_url) || null,
    }));

    // Also update freshNews with business_lens for immediate response
    for (const item of freshNews) {
      item.business_lens = lensMap.get(item.source_url) || null;
    }

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

  return freshNews;
}

Deno.serve(async (req) => {
  const dynamicCorsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: dynamicCorsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    const sector = url.searchParams.get('sector');
    const limit = parseInt(url.searchParams.get('limit') || '30');
    
    // Force refresh requires admin authentication to prevent abuse
    const authResult = await validateAdminAuth(req);
    const isAdmin = authResult.isAdmin;
    
    const forceRefreshRequested = url.searchParams.get('refresh') === 'true' || 
                                  req.headers.get('x-force-refresh') === 'true';
    const forceRefresh = forceRefreshRequested && isAdmin;
    
    if (forceRefreshRequested && !isAdmin) {
      console.log('Force refresh requested but admin auth missing or invalid:', authResult.error);
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
    // Serve the cache unless an admin forces a refresh; refresh stale caches in the background
    if (!forceRefresh) {
      if (cacheIsStale) {
        await supabase.from('rss_cache_metadata').upsert({ id: 'global', last_refresh: new Date().toISOString(), items_count: metadata?.items_count ?? 0 });
        const bg = refreshCache(supabase).catch((e) => console.error('Background refresh failed', e));
        const rt = (globalThis as unknown as { EdgeRuntime?: { waitUntil(p: Promise<unknown>): void } }).EdgeRuntime;
        if (rt?.waitUntil) rt.waitUntil(bg);
      }
      console.log('Returning cached data');

      let query = supabase
        .from('rss_news_cache')
        .select('news_id, title, summary, source_url, source_name, category, image_url, published_date, business_lens, sectors')
        .order('published_date', { ascending: false })
        .limit(sector ? limit : limit + 60);

      if (category && category !== 'All') {
        query = query.eq('category', category);
      }
      if (sector) {
        query = query.contains('sectors', [sector]);
      }

      const { data: cachedNews, error } = await query;

      if (error) throw error;

      const formattedNews = (cachedNews || []).filter(i => sector || !isOffTopicSports(i)).slice(0, limit).map(item => ({
        id: item.news_id,
        title: item.title,
        summary: item.summary,
        source_url: item.source_url,
        source_name: item.source_name,
        category: item.category,
        image_url: item.image_url,
        published_date: item.published_date,
        business_lens: item.business_lens,
        sectors: item.sectors || [],
      }));

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
          { headers: { ...dynamicCorsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.warn('Cache metadata says fresh but table is empty; refetching');
    }

    const freshNews = await refreshCache(supabase);

    // Filter by category if needed
    let resultNews = freshNews;
    if (category && category !== 'All') {
      resultNews = freshNews.filter(item => item.category === category);
    }
    if (sector) {
      resultNews = resultNews.filter(item => item.sectors.includes(sector as Sector));
    } else {
      resultNews = resultNews.filter(item => !isOffTopicSports(item));
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: resultNews.slice(0, limit),
        count: resultNews.length,
        cached: false,
        sources: RSS_FEEDS.length,
      }),
      { headers: { ...dynamicCorsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in fetch-rss-news:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch news' 
      }),
      { status: 500, headers: { ...dynamicCorsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
