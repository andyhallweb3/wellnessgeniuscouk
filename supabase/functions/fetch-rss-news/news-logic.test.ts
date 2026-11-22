import { assert, assertEquals } from 'jsr:@std/assert@1';
import { parseFeedDate, titleKey, canonicalUrl, dedupeItems, primaryBucket, balanceForHome, parseRSSItem, isHomeEligible } from './news-logic.ts';

const NOW = Date.parse('2026-11-22T20:00:00Z');
Deno.test('dates', () => {
  assertEquals(parseFeedDate('Sun, 22 Nov 2026 03:11:00 +0000', NOW), '2026-11-22T03:11:00.000Z');
  assertEquals(parseFeedDate('2026-11-20T15:46:00+00:00', NOW), '2026-11-20T15:46:00.000Z');
  assertEquals(parseFeedDate('Fri, 20 Nov 2026 10:00:00 GMT+0000', NOW), '2026-11-20T10:00:00.000Z');
  assertEquals(parseFeedDate('', NOW), null);
  assertEquals(parseFeedDate('garbage', NOW), null);
  assertEquals(parseFeedDate('Sun, 22 Nov 2027 03:11:00 +0000', NOW), null);
});
Deno.test('undated item is flagged, not silently "now"', () => {
  const it = parseRSSItem('<title>X story here</title><link>https://a.com/x</link>', { url: '', category: 'Clinics', sourceName: 'A' }, NOW)!;
  assertEquals(it.date_from_feed, false);
});
Deno.test('dedupe wire duplicates', () => {
  assertEquals(titleKey('Erasable Med Spa Celebrates Grand Opening of Its Wesley Chapel Location - EIN Presswire'), titleKey('Erasable Med Spa Celebrates Grand Opening of Its Wesley Chapel Location - EIN News'));
  assertEquals(canonicalUrl('https://www.statnews.com/a/b/?utm_campaign=rss'), canonicalUrl('https://statnews.com/a/b'));
  const items = [
    { title: 'Lavish Health & MedSpa - Halston Media Group', source_url: 'https://news.google.com/rss/articles/AAA' },
    { title: 'Lavish Health & MedSpa - Halston Media Group', source_url: 'https://news.google.com/rss/articles/BBB' },
    { title: 'Other story entirely here', source_url: 'https://x.com/1' },
  ];
  assertEquals(dedupeItems(items).length, 2);
});
Deno.test('buckets and balance', () => {
  assertEquals(primaryBucket({ title: 'Why data centers', category: 'AI', sectors: [] }), null);
  assertEquals(primaryBucket({ title: 'Bishopstrow Hotel unveils spa', category: 'Wellness', sectors: ['hotels-spas'] }), 'spa');
  assert(!isHomeEligible({ title: 'Why data centers', category: 'AI', sectors: [], published_date: '2026-11-22T18:00:00Z' }, NOW));
  const mk = (i: number, category: string, sectors: string[], src: string) => ({ title: `t${i}`, category, sectors, source_name: src, published_date: new Date(NOW - i * 3600_000).toISOString() });
  const list = [...Array(8)].map((_, i) => mk(i, 'Clinics', ['clinics'], `C${i % 2}`)).concat([mk(20, 'Fitness', ['fitness'], 'F'), mk(30, 'Hospitality', ['hotels-spas'], 'H')]);
  const out = balanceForHome(list, 6, { now: NOW });
  assertEquals(out.slice(0, 3).map((o) => o.category).sort(), ['Clinics', 'Fitness', 'Hospitality']);
});

import { scoreItem, HOME_SCORING } from './scoring.ts';
const at = (hoursAgo: number) => new Date(NOW - hoursAgo * 3600_000).toISOString();
const sc = (title: string, source_name: string, hoursAgo = 0, summary = '') => scoreItem({ title, source_name, published_date: at(hoursAgo), summary }, NOW);

Deno.test('scoring: trade press beats Google News wire copy', () => {
  const trade = sc('Bishopstrow Hotel unveils its redeveloped £3.5m spa', 'European Spa');
  const wire = sc('Erasable Med Spa Celebrates Grand Opening of Its Wesley Chapel Location - EIN Presswire', 'Google News: clinics');
  assert(trade.score > wire.score);
  assert(wire.reasons.some((r) => r.startsWith('wire')) && wire.reasons.some((r) => r.startsWith('google-news')));
});
Deno.test('scoring: substantive story types get boosts', () => {
  assert(sc("Iceland's Blue Lagoon raises $116M in IPO", 'Global Wellness Summit').reasons.some((r) => r.startsWith('deal')));
  assert(sc('Trend: Longevity Residences', 'Global Wellness Summit').reasons.some((r) => r.startsWith('insight')));
  assert(sc("Barry's, Flywheel Vets Open House 120, a Private Longevity Club in NYC", 'Athletech News').reasons.some((r) => r.startsWith('membership')));
  assert(sc('Six Senses appoints new chief operating officer', 'Spa Business').reasons.some((r) => r.startsWith('appointment')));
});
Deno.test('scoring: weak story types get penalties', () => {
  const has = (t: string, id: string, src = 'Athletic Business') => sc(t, src).reasons.some((r) => r.startsWith(id));
  assert(has('Nike to Sell $2,199 Smart Strength Trainer as Performance Push Continues', 'consumer-product', 'Athletech News'));
  assert(has('The Best Hotel Room Service App in 2027', 'listicle', 'Hospitality Net'));
  assert(has('AB Today Replay - Week of November 16', 'roundup'));
  assert(has('7 Best SEO Companies for Med Spas in 2026', 'seo-advertorial', 'Google News: clinics'));
  assert(has('Enhanced Beauty Med Spa - WSAZ', 'thin', 'Google News: clinics'));
  assert(!has('Hotel group raises $40M to expand', 'consumer-product', 'Skift')); // money amounts are not product prices
});
Deno.test('scoring: recency decay lets a strong 3 to 5 day old story beat a weak one from today', () => {
  const strongOld = sc("Iceland's Blue Lagoon raises $116M in IPO", 'Global Wellness Summit', 4 * 24);
  const weakToday = sc('AB Today Replay - Week of November 16', 'Athletic Business', 1);
  assert(strongOld.score > weakToday.score);
  const fresh = sc('Trend: Longevity Residences', 'Global Wellness Summit', 0);
  const halfLife = sc('Trend: Longevity Residences', 'Global Wellness Summit', HOME_SCORING.halfLifeDays * 24);
  assertEquals(Math.round((halfLife.score / fresh.score) * 100) / 100, 0.5);
});
Deno.test('balance: categories and caps still apply after scoring', () => {
  const mk = (title: string, category: string, sectors: string[], source_name: string, h: number) => ({ title, category, sectors, source_name, published_date: at(h) });
  const list = [
    mk('Spa group raises $50M in funding', 'Wellness', ['hotels-spas'], 'Spa Business', 30),
    mk('Spa brand acquires rival', 'Wellness', ['hotels-spas'], 'Spa Business', 31),
    mk('Spa chain opens flagship', 'Wellness', ['hotels-spas'], 'Spa Business', 32),
    mk('Gym operator signs deal to expand', 'Fitness', ['fitness'], 'Club Industry', 40),
    mk('Clinic news item here', 'Clinics', ['clinics'], 'Aesthetics Journal', 2),
  ];
  const out = balanceForHome(list, 4, { now: NOW });
  assertEquals(out.slice(0, 3).map((o) => o.category).sort(), ['Clinics', 'Fitness', 'Wellness']);
  assertEquals(out.filter((o) => o.source_name === 'Spa Business').length <= 2, true);
  assert(out.every((o) => typeof o.score === 'number'));
});
