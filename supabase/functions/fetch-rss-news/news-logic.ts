// Pure news logic for fetch-rss-news: parsing, dates, dedupe, Google News unwrap, homepage balancing.
// No Supabase or Deno-only APIs here, so it can be run locally for previews and tests.

export type Sector = 'hotels-spas' | 'fitness' | 'clinics' | 'country-clubs';

export interface RSSFeed {
  url: string;
  category: string;
  sourceName: string;
  sectors?: Sector[]; // default sectors for every item from this feed (trusted trade press)
  maxAgeDays?: number; // drop items older than this (useful for Google News queries)
  strongTagsOnly?: boolean; // general feeds (e.g. travel news): only strong keywords tag a sector
  skipTitle?: RegExp; // drop boilerplate items (e.g. daily digest posts)
}

export interface NewsItem {
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
  /** false when the feed gave no usable date and published_date is a placeholder */
  date_from_feed?: boolean;
}

// ---------- Sector tagging (unchanged rules) ----------
export const SECTOR_RULES: Record<Sector, { strong: RegExp; loose: RegExp }> = {
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

export function tagSectors(title: string, summary: string, feed: RSSFeed): Sector[] {
  if (feed.sectors && feed.sectors.length > 0) return [...feed.sectors];
  const text = `${title} ${summary}`;
  const tags: Sector[] = [];
  for (const [sector, rule] of Object.entries(SECTOR_RULES) as [Sector, { strong: RegExp; loose: RegExp }][]) {
    const loose = feed.strongTagsOnly ? 0 : countMatches(rule.loose, text);
    if (countMatches(rule.strong, text) >= 1 || loose >= 2) tags.push(sector);
  }
  return tags;
}

// ---------- Text cleanup (unchanged) ----------
const NAMED_ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '-', mdash: '-',
  lsquo: "'", rsquo: "'", ldquo: '"', rdquo: '"', hellip: '...', pound: '£', euro: '€',
};
export function decodeEntities(input: string): string {
  let out = input;
  for (let i = 0; i < 2; i++) {
    out = out
      .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
      .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
      .replace(/&([a-z]+);/gi, (m, name) => NAMED_ENTITIES[name.toLowerCase()] ?? m);
  }
  return out;
}

const JUNK_SUMMARY = /^(x+|test|lorem ipsum.*|n\/?a|null|undefined|\.+|-+)$/i;
const SPORTS_OFFTOPIC = /\b(ncaa|hazing|varsity|quarterback|touchdown|playoffs?|athletics director|transfer windows?|eligibility|(football|soccer|basketball|baseball|softball|hockey|lacrosse|volleyball|wrestling)( team| coach(es|ing staff)?| program| season| player)s?|college (football|golf|athletics|sports)|high school (sports|athletes|athletics|football))\b/i;

export function cleanSummary(summary: string): string {
  let s = summary.replace(/\s*The post .{1,400}? appeared first on .{1,200}?\.?\s*$/i, '').trim();
  s = s.replace(/\s*(Continue reading|Read more)\s*(\.\.\.|…)?\s*$/i, '').trim();
  if (s.length < 15 || JUNK_SUMMARY.test(s)) return '';
  return s;
}

export function isOffTopicSports(item: { title: string }): boolean {
  return SPORTS_OFFTOPIC.test(item.title);
}

export function absoluteUrl(u: string | null | undefined, base: string): string | null {
  if (!u) return null;
  try {
    const abs = new URL(u.replace(/&amp;/g, '&'), base).toString();
    return abs.startsWith('http') ? abs : null;
  } catch { return null; }
}

// ---------- Dates ----------
/** Parse an RSS/Atom date. Returns ISO string, or null if missing, unparseable or implausible. */
export function parseFeedDate(raw: string | null | undefined, now = Date.now()): string | null {
  if (!raw) return null;
  let s = raw.replace(/<!\[CDATA\[|\]\]>/g, '').trim();
  if (!s) return null;
  let t = Date.parse(s);
  if (Number.isNaN(t)) {
    // Common oddities: "GMT+0000", missing comma, trailing zone names like "BST"/"CEST"
    s = s.replace(/\bGMT([+-]\d{4})\b/, '$1').replace(/\b(BST)\b/, '+0100').replace(/\b(CEST)\b/, '+0200').replace(/\b(CET)\b/, '+0100');
    t = Date.parse(s);
  }
  if (Number.isNaN(t)) return null;
  if (t > now + 6 * 3600_000) return null; // future-dated: treat as unknown
  if (t < Date.UTC(2000, 0, 1)) return null;
  return new Date(t).toISOString();
}

/** Look for a real publish date in an article page (JSON-LD or meta tags). */
export function extractPageDate(html: string): string | null {
  const cands = [
    html.match(/"datePublished"\s*:\s*"([^"]+)"/i)?.[1],
    html.match(/<meta[^>]+(?:property|name|itemprop)=["'](?:article:published_time|og:published_time|datePublished|pubdate|date)["'][^>]*content=["']([^"']+)["']/i)?.[1],
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name|itemprop)=["'](?:article:published_time|og:published_time|datePublished)["']/i)?.[1],
    html.match(/<time[^>]+datetime=["']([^"']+)["']/i)?.[1],
  ];
  for (const c of cands) {
    const d = parseFeedDate(c);
    if (d) return d;
  }
  return null;
}

// ---------- URL + title normalisation for dedupe ----------
const TRACKING_PARAMS = /^(utm_[a-z]+|fbclid|gclid|mc_cid|mc_eid|ref|ref_src|cmpid|ito|ocid|taid)$/i;

export function canonicalUrl(u: string): string {
  try {
    const url = new URL(u);
    url.hash = '';
    for (const k of [...url.searchParams.keys()]) if (TRACKING_PARAMS.test(k)) url.searchParams.delete(k);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    const path = url.pathname.replace(/\/+$/, '') || '/';
    const qs = url.searchParams.toString();
    return `${host}${path}${qs ? `?${qs}` : ''}`.toLowerCase();
  } catch {
    return u.trim().toLowerCase();
  }
}

/** Title key: lowercased, publisher suffix (" - EIN Presswire", " | Skift") removed, punctuation stripped. */
export function titleKey(title: string): string {
  let t = title.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  // Drop a trailing " - Publisher" / " | Publisher" segment of up to 6 words (Google News style)
  t = t.replace(/\s+[-|–—]\s+[^-|–—]{1,60}$/, (m) => (m.trim().split(/\s+/).length <= 7 ? '' : m));
  t = t.toLowerCase().replace(/[’'`"“”]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  return t.slice(0, 90);
}

const isGoogleNews = (u: string) => /(^|\.)news\.google\.com\//i.test(u.replace(/^https?:\/\//, ''));

/**
 * Remove duplicate stories. Two items are duplicates if they share a canonical URL or a title key.
 * Direct publisher links win over Google News wrappers; otherwise the earliest-seen (input order) wins.
 */
export function dedupeItems<T extends { title: string; source_url: string }>(items: T[]): T[] {
  const ordered = [
    ...items.filter((i) => !isGoogleNews(i.source_url)),
    ...items.filter((i) => isGoogleNews(i.source_url)),
  ];
  const seenUrl = new Set<string>();
  const seenTitle = new Set<string>();
  const keep = new Set<T>();
  for (const it of ordered) {
    const u = canonicalUrl(it.source_url);
    const k = titleKey(it.title);
    if (seenUrl.has(u) || (k.length >= 12 && seenTitle.has(k))) continue;
    seenUrl.add(u);
    if (k.length >= 12) seenTitle.add(k);
    keep.add(it);
  }
  return items.filter((i) => keep.has(i)); // preserve original order
}

// ---------- Google News unwrap ----------
type FetchFn = typeof fetch;

async function withTimeout<T>(p: (signal: AbortSignal) => Promise<T>, ms: number): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try { return await p(ctrl.signal); } finally { clearTimeout(t); }
}

/**
 * Resolve a news.google.com/rss/articles/<id> link to the publisher URL.
 * Best effort: returns null on any failure, and callers keep the Google link.
 */
export async function unwrapGoogleNewsUrl(link: string, fetchFn: FetchFn = fetch, timeoutMs = 4000): Promise<string | null> {
  try {
    const id = link.match(/news\.google\.com\/(?:rss\/)?articles\/([^?/#]+)/)?.[1];
    if (!id) return null;
    // Older ids embed the URL directly in base64
    try {
      const b = atob(id.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((id.length + 3) % 4));
      const m = b.match(/https?:\/\/[\x21-\x7e]+/);
      if (m && !b.includes('AU_yqL')) return m[0];
    } catch { /* new-style id */ }
    const html = await withTimeout(async (signal) => {
      const r = await fetchFn(`https://news.google.com/rss/articles/${id}`, { signal, headers: { 'User-Agent': 'Mozilla/5.0' } });
      return r.ok ? await r.text() : '';
    }, timeoutMs);
    const ts = html.match(/data-n-a-ts="([^"]+)"/)?.[1];
    const sg = html.match(/data-n-a-sg="([^"]+)"/)?.[1];
    if (!ts || !sg) return null;
    const inner = ['garturlreq', [['X', 'X', ['X', 'X'], null, null, 1, 1, 'US:en', null, 1, null, null, null, null, null, 0, 1], 'X', 'X', 1, [1, 1, 1], 1, 1, null, 0, 0, null, 0], id, Number(ts), sg];
    const body = new URLSearchParams({ 'f.req': JSON.stringify([[['Fbv4je', JSON.stringify(inner), null, 'generic']]]) });
    const txt = await withTimeout(async (signal) => {
      const r = await fetchFn('https://news.google.com/_/DotsSplashUi/data/batchexecute', {
        method: 'POST', signal, body,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', 'User-Agent': 'Mozilla/5.0' },
      });
      return r.ok ? await r.text() : '';
    }, timeoutMs);
    const m = txt.match(/\\"garturlres\\",\\"(https?:[^\\"]+)\\"/);
    return m ? m[1].replace(/\\u003d/g, '=').replace(/\\u0026/g, '&') : null;
  } catch {
    return null;
  }
}

// ---------- Feed parsing ----------
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

export function parseRSSItem(item: string, feed: RSSFeed, now = Date.now()): NewsItem | null {
  try {
    const titleMatch = item.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/is);
    let title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
    title = decodeEntities(title.replace(/<[^>]+>/g, ' ')).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!title) return null;
    if (feed.skipTitle?.test(title)) return null;

    const linkMatch = item.match(/<link[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/is) ||
                      item.match(/<link[^>]+href=["']([^"']+)["']/i);
    const link = linkMatch ? decodeEntities(linkMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim()) : '';
    if (!link) return null;

    const descMatch = item.match(/<description[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/description>/is) ||
                      item.match(/<summary[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/summary>/is) ||
                      item.match(/<content:encoded[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/content:encoded>/is);
    let summary = descMatch ? descMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
    summary = decodeEntities(summary.replace(/<[^>]+>/g, ' ')).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    summary = cleanSummary(summary);
    if (summary.length > 300) summary = summary.substring(0, 297) + '...';

    // Real article date: pubDate (RSS), published/updated (Atom), dc:date. Never silently use "now".
    const rawDate = item.match(/<pubDate[^>]*>(.*?)<\/pubDate>/is)?.[1] ||
                    item.match(/<published[^>]*>(.*?)<\/published>/is)?.[1] ||
                    item.match(/<dc:date[^>]*>(.*?)<\/dc:date>/is)?.[1] ||
                    item.match(/<updated[^>]*>(.*?)<\/updated>/is)?.[1] ||
                    item.match(/<a10:updated[^>]*>(.*?)<\/a10:updated>/is)?.[1];
    const parsed = parseFeedDate(rawDate, now);

    let imageUrl = extractImageFromContent(item);
    if (!imageUrl) imageUrl = item.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i)?.[1] ?? null;
    if (!imageUrl) {
      const contentMatch = item.match(/<content:encoded[^>]*>(.*?)<\/content:encoded>/is);
      if (contentMatch) imageUrl = extractImageFromContent(contentMatch[1]);
    }

    return {
      id: link, // stable id, also used by /news?story= share links
      title,
      summary,
      source_url: link,
      source_name: feed.sourceName,
      category: feed.category,
      image_url: absoluteUrl(imageUrl, link),
      published_date: parsed ?? new Date(now).toISOString(),
      date_from_feed: parsed !== null,
      sectors: tagSectors(title, summary, feed),
    };
  } catch {
    return null;
  }
}

/** Parse a whole feed: newest first, capped, with stale items dropped. */
export function parseFeedXml(xml: string, feed: RSSFeed, maxItems = 10, now = Date.now()): NewsItem[] {
  const blocks = [...xml.matchAll(/<item[^>]*>(.*?)<\/item>/gis)].map((m) => m[1]);
  const entries = blocks.length ? blocks : [...xml.matchAll(/<entry[^>]*>(.*?)<\/entry>/gis)].map((m) => m[1]);
  const maxAge = (feed.maxAgeDays ?? 120) * 86400_000;
  const items = entries
    .slice(0, 100)
    .map((b) => parseRSSItem(b, feed, now))
    .filter((i): i is NewsItem => !!i)
    .filter((i) => !i.date_from_feed || now - Date.parse(i.published_date) <= maxAge);
  // Dated items newest first; undated keep feed order after them (feeds without dates list newest first)
  const dated = items.filter((i) => i.date_from_feed).sort((a, b) => Date.parse(b.published_date) - Date.parse(a.published_date));
  const undated = items.filter((i) => !i.date_from_feed);
  return (dated.length >= undated.length ? [...dated, ...undated] : [...undated, ...dated]).slice(0, maxItems);
}

// ---------- Homepage balancing ----------
export type Bucket = 'hotel' | 'spa' | 'fitness' | 'clinic' | 'club';
export const BUCKET_ORDER: Bucket[] = ['hotel', 'spa', 'fitness', 'clinic', 'club'];
const SPA_WORDS = /\b(spas?|thermal|sauna|saunas|bath ?houses?|hammam|therme|hot springs?)\b/i; // strong spa words only

export function primaryBucket(item: { title: string; category: string; sectors?: string[] | null }): Bucket | null {
  const s = item.sectors || [];
  if (s.length === 0) return null;
  // Trade-press category decides first, so a med-spa story from a clinic title stays "clinic"
  switch (item.category) {
    case 'Fitness': return 'fitness';
    case 'Clinics': return 'clinic';
    case 'Clubs': return 'club';
    case 'Wellness': if (s.includes('hotels-spas')) return 'spa'; break;
    case 'Hospitality': if (s.includes('hotels-spas')) return SPA_WORDS.test(item.title) ? 'spa' : 'hotel'; break;
  }
  if (s.includes('hotels-spas')) return SPA_WORDS.test(item.title) ? 'spa' : 'hotel';
  if (s.includes('fitness')) return 'fitness';
  if (s.includes('clinics')) return 'clinic';
  if (s.includes('country-clubs')) return 'club';
  return null;
}

// Advertorial and SEO listicles syndicated through Google News
const PROMO_TITLE = /\b(best seo|seo (companies|agencies|services)|marketing agencies for|promo codes?|coupons?|sponsored|press release distribution)\b/i;

/** Homepage eligibility: on-sector (tagged), not off-topic sports, not too old. Drops generic tech/AI/HR/investment. */
export function isHomeEligible(item: { title: string; category: string; sectors?: string[] | null; published_date: string }, now = Date.now(), maxAgeDays = 30): boolean {
  if (isOffTopicSports(item) || PROMO_TITLE.test(item.title)) return false;
  if (primaryBucket(item) === null) return false;
  return now - Date.parse(item.published_date) <= maxAgeDays * 86400_000;
}

/**
 * Round-robin across hotel, spa, fitness, clinic and club over a date-sorted list.
 * Each round takes the newest unused item from every bucket (max `maxPerSource` per source),
 * and rounds are emitted newest first. Only items from the last `recentDays` take part in the
 * rotation; if that does not fill `limit`, the rest is filled by date.
 */
export function balanceForHome<T extends { title: string; category: string; sectors?: string[] | null; published_date: string; source_name: string }>(
  items: T[], limit: number, opts: { maxPerSource?: number; maxGoogleNews?: number; recentDays?: number; now?: number } = {},
): T[] {
  const now = opts.now ?? Date.now();
  const maxPerSource = opts.maxPerSource ?? 2;
  // All Google News search feeds count as one source, so wire copy cannot crowd out trade press
  const maxGoogleNews = opts.maxGoogleNews ?? 2;
  const group = (it: T) => (/^Google News/i.test(it.source_name) ? 'Google News' : it.source_name);
  const cap = (g: string) => (g === 'Google News' ? maxGoogleNews : maxPerSource);
  const recentMs = (opts.recentDays ?? 10) * 86400_000;
  const sorted = [...items].sort((a, b) => Date.parse(b.published_date) - Date.parse(a.published_date));
  const queues = new Map<Bucket, T[]>(BUCKET_ORDER.map((b) => [b, []]));
  for (const it of sorted) {
    const b = primaryBucket(it);
    if (b && now - Date.parse(it.published_date) <= recentMs) queues.get(b)!.push(it);
  }
  const perSource = new Map<string, number>();
  const out: T[] = [];
  const used = new Set<T>();
  while (out.length < limit) {
    const round: T[] = [];
    for (const b of BUCKET_ORDER) {
      const q = queues.get(b)!;
      const idx = q.findIndex((it) => (perSource.get(group(it)) ?? 0) < cap(group(it)));
      if (idx === -1) continue;
      const [it] = q.splice(idx, 1);
      round.push(it);
      perSource.set(group(it), (perSource.get(group(it)) ?? 0) + 1);
    }
    if (round.length === 0) break;
    round.sort((a, b) => Date.parse(b.published_date) - Date.parse(a.published_date));
    for (const it of round) { if (out.length < limit) { out.push(it); used.add(it); } }
  }
  for (const it of sorted) { // top up if rotation ran dry
    if (out.length >= limit) break;
    if (!used.has(it)) { out.push(it); used.add(it); }
  }
  return out;
}
