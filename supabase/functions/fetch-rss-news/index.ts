import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validateAdminAuth } from '../_shared/admin-auth.ts';
import { getCorsHeaders } from '../_shared/cors.ts';
import { RSS_FEEDS } from './feeds.ts';
import {
  type NewsItem, type RSSFeed, type Sector,
  absoluteUrl, balanceForHome, dedupeItems, extractPageDate, isHomeEligible,
  isOffTopicSports, parseFeedXml, unwrapGoogleNewsUrl,
} from './news-logic.ts';

export { decodeEntities, cleanSummary, isOffTopicSports } from './news-logic.ts';

const CACHE_DURATION_MINUTES = 20;
const HOME_POOL_DAYS = 30;
const GN_UNWRAP_CAP = 40;

const isGoogleNews = (u: string) => /news\.google\.com\//i.test(u);

interface PageMeta { image: string | null; published: string | null }

async function fetchPageMeta(pageUrl: string): Promise<PageMeta> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 3500);
    const res = await fetch(pageUrl, { signal: ctrl.signal, redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WellnessGeniusBot/1.0)', Accept: 'text/html' } });
    clearTimeout(t);
    if (!res.ok || !(res.headers.get('content-type') || '').includes('html')) return { image: null, published: null };
    const html = (await res.text()).slice(0, 300000);
    const m = html.match(/<meta[^>]+(?:property|name)=["'](?:og:image(?::secure_url)?|twitter:image)["'][^>]*>/i)?.[0];
    const c = m?.match(/content=["']([^"']+)["']/i)?.[1];
    return { image: absoluteUrl(c, res.url || pageUrl), published: extractPageDate(html) };
  } catch { return { image: null, published: null }; }
}

async function inBatches<T>(items: T[], size: number, fn: (t: T) => Promise<void>) {
  for (let i = 0; i < items.length; i += size) await Promise.all(items.slice(i, i + size).map(fn));
}

/** Fill missing images via og:image, capped and concurrency-limited. */
export async function fillOgImages<T extends { source_url: string; image_url: string | null }>(items: T[], cap = 30): Promise<number> {
  const todo = items.filter(i => !i.image_url && !isGoogleNews(i.source_url)).slice(0, cap);
  let found = 0;
  await inBatches(todo, 8, async (it) => {
    const { image } = await fetchPageMeta(it.source_url);
    if (image) { it.image_url = image; found++; }
  });
  return found;
}

async function fetchFeed(feed: RSSFeed): Promise<NewsItem[]> {
  try {
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
    const items = parseFeedXml(await response.text(), feed, 10);
    console.log(`Fetched ${items.length} items from ${feed.sourceName}`);
    return items;
  } catch (error) {
    console.warn(`Error fetching ${feed.sourceName}:`, error instanceof Error ? error.message : error);
    return [];
  }
}

async function fetchAllFeeds(): Promise<NewsItem[]> {
  const results = await Promise.all(RSS_FEEDS.map(feed => fetchFeed(feed)));
  return results.flat();
}

// deno-lint-ignore no-explicit-any
async function refreshCache(supabase: any): Promise<NewsItem[]> {
  console.log('Fetching fresh RSS data...');
  const fetched = await fetchAllFeeds();
  if (fetched.length === 0) return [];

  // What we already know about these items: first-seen time, images, unwrapped Google News links
  const ids = fetched.map(i => i.id);
  const { data: existingRows } = await supabase
    .from('rss_news_cache')
    .select('news_id, image_url, source_url, created_at')
    .in('news_id', ids);
  type Prev = { news_id: string; image_url: string | null; source_url: string | null; created_at: string | null };
  const existing = new Map<string, Prev>(((existingRows || []) as Prev[]).map((r) => [r.news_id, r]));

  // 1) Dates: items whose feed gave no date keep their first-seen time; new ones try the article page.
  const undatedNew: NewsItem[] = [];
  for (const item of fetched) {
    if (item.date_from_feed) continue;
    const prev = existing.get(item.id);
    if (prev?.created_at) item.published_date = new Date(prev.created_at as string).toISOString();
    else undatedNew.push(item);
  }
  await inBatches(undatedNew.slice(0, 20), 6, async (it) => {
    const { published, image } = await fetchPageMeta(it.source_url);
    if (published) it.published_date = published;
    if (image && !it.image_url) it.image_url = image;
  });

  // 2) Google News: reuse a stored publisher URL, else unwrap (capped, best effort)
  const toUnwrap: NewsItem[] = [];
  for (const item of fetched) {
    if (!isGoogleNews(item.source_url)) continue;
    const prev = existing.get(item.id);
    if (prev?.source_url && !isGoogleNews(prev.source_url as string)) item.source_url = prev.source_url as string;
    else toUnwrap.push(item);
  }
  let unwrapped = 0;
  await inBatches(toUnwrap.slice(0, GN_UNWRAP_CAP), 6, async (it) => {
    const real = await unwrapGoogleNewsUrl(it.source_url);
    if (real) { it.source_url = real; unwrapped++; }
  });
  console.log(`Google News unwrapped ${unwrapped}/${toUnwrap.length}`);

  // 3) Dedupe on canonical URL + normalised title, newest first
  const freshNews = dedupeItems(fetched)
    .sort((a, b) => Date.parse(b.published_date) - Date.parse(a.published_date));

  // business_lens from articles table
  const { data: articlesWithLens } = await supabase
    .from('articles')
    .select('url, business_lens')
    .in('url', freshNews.map(item => item.source_url));
  const lensMap = new Map<string, string>();
  for (const a of (articlesWithLens || []) as { url: string; business_lens: string | null }[]) if (a.business_lens) lensMap.set(a.url, a.business_lens);

  // Images: keep stored ones, then og:image for a capped set of new sector items
  for (const item of freshNews) {
    const prev = existing.get(item.id);
    if (!item.image_url && prev?.image_url) item.image_url = prev.image_url as string;
  }
  const ogFound = await fillOgImages(freshNews.filter(i => !existing.get(i.id)?.image_url && i.sectors.length > 0), 30);
  console.log(`og:image filled ${ogFound}`);

  const fetchedAt = new Date().toISOString();
  const cacheItems = Array.from(new Map(freshNews.map(item => [item.id, {
    news_id: item.id,
    title: item.title,
    summary: item.summary,
    source_url: item.source_url,
    source_name: item.source_name,
    category: item.category,
    image_url: item.image_url,
    published_date: item.published_date,
    sectors: item.sectors,
    fetched_at: fetchedAt,
    business_lens: lensMap.get(item.source_url) || null,
  }])).values());
  for (const item of freshNews) item.business_lens = lensMap.get(item.source_url) || null;

  const { error: upsertError } = await supabase.from('rss_news_cache').upsert(cacheItems, { onConflict: 'news_id' });
  if (upsertError) {
    console.error('Error writing cache:', upsertError);
  } else {
    console.log(`Successfully cached ${cacheItems.length} items`);
    await supabase.from('rss_cache_metadata').upsert({ id: 'global', last_refresh: fetchedAt, items_count: cacheItems.length });
  }
  return freshNews;
}

type Row = {
  news_id: string; title: string; summary: string; source_url: string; source_name: string; category: string;
  image_url: string | null; published_date: string; business_lens: string | null; sectors: string[] | null;
};

const toApi = (item: Row) => ({
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
});

/** Shared shaping for cached and fresh data: sports filter, dedupe, then homepage mix or plain date order. */
function shape(rows: Row[], opts: { home: boolean; limit: number }) {
  let list = rows.filter(r => !isOffTopicSports(r));
  list.sort((a, b) => Date.parse(b.published_date) - Date.parse(a.published_date));
  list = dedupeItems(list);
  if (opts.home) {
    list = balanceForHome(list.filter(r => isHomeEligible(r, Date.now(), HOME_POOL_DAYS)), opts.limit);
  }
  return list.slice(0, opts.limit).map(toApi);
}

Deno.serve(async (req) => {
  const dynamicCorsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { headers: dynamicCorsHeaders });

  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    const sector = url.searchParams.get('sector');
    const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '30') || 30, 1), 500);
    // mix=home: unfiltered homepage list, on-sector only and balanced across hotel, spa, fitness, clinic, club
    const home = url.searchParams.get('mix') === 'home' && !sector && (!category || category === 'All');

    const authResult = await validateAdminAuth(req);
    const forceRefreshRequested = url.searchParams.get('refresh') === 'true' || req.headers.get('x-force-refresh') === 'true';
    const forceRefresh = forceRefreshRequested && authResult.isAdmin;
    if (forceRefreshRequested && !authResult.isAdmin) {
      console.log('Force refresh requested but admin auth missing or invalid:', authResult.error);
    }

    const { data: metadata } = await supabase
      .from('rss_cache_metadata').select('last_refresh, items_count').eq('id', 'global').single();
    const lastRefresh = metadata?.last_refresh ? new Date(metadata.last_refresh) : new Date(0);
    const minutesSinceRefresh = (Date.now() - lastRefresh.getTime()) / 60000;
    const cacheIsStale = minutesSinceRefresh > CACHE_DURATION_MINUTES || metadata?.items_count === 0;

    if (!forceRefresh) {
      if (cacheIsStale) {
        await supabase.from('rss_cache_metadata').upsert({ id: 'global', last_refresh: new Date().toISOString(), items_count: metadata?.items_count ?? 0 });
        const bg = refreshCache(supabase).catch((e) => console.error('Background refresh failed', e));
        const rt = (globalThis as unknown as { EdgeRuntime?: { waitUntil(p: Promise<unknown>): void } }).EdgeRuntime;
        if (rt?.waitUntil) rt.waitUntil(bg);
      }

      let query = supabase
        .from('rss_news_cache')
        .select('news_id, title, summary, source_url, source_name, category, image_url, published_date, business_lens, sectors')
        .order('published_date', { ascending: false });
      if (home) {
        query = query
          .gte('published_date', new Date(Date.now() - HOME_POOL_DAYS * 86400_000).toISOString())
          .not('sectors', 'eq', '{}')
          .limit(600);
      } else {
        query = query.limit(limit * 2 + 60);
        if (category && category !== 'All') query = query.eq('category', category);
        if (sector) query = query.contains('sectors', [sector]);
      }

      const { data: cachedNews, error } = await query;
      if (error) throw error;
      const formattedNews = shape((cachedNews || []) as Row[], { home, limit });

      if (formattedNews.length > 0) {
        return new Response(JSON.stringify({
          success: true, data: formattedNews, count: formattedNews.length, cached: true,
          cache_age_minutes: Math.round(minutesSinceRefresh),
        }), { headers: { ...dynamicCorsHeaders, 'Content-Type': 'application/json' } });
      }
      console.warn('Cache returned no rows; refetching');
    }

    const freshNews = await refreshCache(supabase);
    let rows: Row[] = freshNews.map(i => ({
      news_id: i.id, title: i.title, summary: i.summary, source_url: i.source_url, source_name: i.source_name,
      category: i.category, image_url: i.image_url, published_date: i.published_date,
      business_lens: i.business_lens ?? null, sectors: i.sectors,
    }));
    if (!home) {
      if (category && category !== 'All') rows = rows.filter(r => r.category === category);
      if (sector) rows = rows.filter(r => (r.sectors || []).includes(sector as Sector));
    }
    const data = shape(rows, { home, limit });
    return new Response(JSON.stringify({
      success: true, data, count: data.length, cached: false, sources: RSS_FEEDS.length,
    }), { headers: { ...dynamicCorsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error in fetch-rss-news:', error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Failed to fetch news' }),
      { status: 500, headers: { ...dynamicCorsHeaders, 'Content-Type': 'application/json' } });
  }
});
