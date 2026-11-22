// Relevance scoring for the homepage mix (mix=home). Every rule lives in HOME_SCORING so it is easy to tune.
//
// score = max(minQuality, base + source weight + story-type boosts + penalties) * 0.5 ^ (ageDays / halfLifeDays)
//
// Rules match the TITLE (plus the article URL for wire detection, and the summary only where a rule says
// matchSummary), so every point is explainable.
// Each rule counts once per item, however many of its words appear.

export interface ScoreRule { id: string; weight: number; pattern: RegExp; matchSummary?: boolean /* also test the summary */ }

export const HOME_SCORING = {
  base: 3,
  minQuality: 0.25,
  halfLifeDays: 3, // a story loses half its weight every 3 days
  maxAgeDays: 10, // older items never enter the homepage rotation

  /** Source weights by exact source_name. Unlisted sources get 0. */
  sources: {
    // Hotel, spa and wellness trade press
    'Travel Extra': 2, 'European Spa': 2, 'Spa Business': 2, 'Hospitality Net': 2, 'Skift': 2,
    'Hotel Designs': 2, 'Hotel Owner': 2, 'Hotel Management': 2, 'Club + Resort Business': 2,
    'Global Wellness Institute': 2, 'Global Wellness Summit': 2, 'Athletic Business': 2,
    // Fitness and clinic trade press
    'Athletech News': 1.5, 'Club Industry': 1.5, 'Aesthetics Journal': 1, 'Aesthetic Medicine': 1, 'Lifespan.io': 1,
  } as Record<string, number>,
  /** Any source_name starting with "Google News" (search feeds, mostly wire and local copy). */
  googleNews: -1.5,
  /** Press-release wires, detected from the title suffix ("... - EIN Presswire") or the article URL. */
  wire: {
    weight: -2,
    pattern: /\b(ein ?presswire|ein news|pr ?newswire|business ?wire|globe ?newswire|accesswire|newswire|openpr|prweb|pressat|send2press|issuewire|newsfile)\b/i,
  },

  /** Substantive story types (boosts). */
  boosts: [
    { id: 'deal', weight: 2, pattern: /\b(ipo|raises?|raised|funding|financing|series [a-e]|acquir(?:es|ed|ing|ition)|acquisition|merger|merges?|buyout|takeover|stake|invest(?:s|ed|ment|ments)?|deal|agreement|portfolio|[$£€]\s?\d+(?:\.\d+)?\s?(?:m|bn|million|billion)\b)/i },
    { id: 'opening', weight: 1.5, pattern: /\b(opens?|opening|opened|unveils?|unveiled|debuts?|launch(?:es|ed)?|to open|reopens?|new (?:hotel|spa|resort|club|brand|site|location))\b/i },
    { id: 'upgrade', weight: 1.5, pattern: /\b(expands?|expansion|enhancements?|renovat\w*|redevelop\w*|upgrades?|refurb\w*|transformation|rebrand\w*)\b/i },
    { id: 'appointment', weight: 1, pattern: /\b(appoints?|appointed|names?|named|hires?|promote[sd]|chief \w+ officer|ceo|coo|cfo|managing director|general manager|president|vice president|head of)\b/i },
    { id: 'insight', weight: 1.5, pattern: /\b(trends?|report|research|study|survey|data|index|forecast|economy|outlook|benchmark|insights?|analysis)\b/i },
    { id: 'wellness-angle', weight: 1, matchSummary: true, pattern: /\b(wellness|spas?|longevity|thermal|sauna|bathhouse|recovery|fitness)\b/i },
    { id: 'membership', weight: 1, pattern: /\b(members(?:hip)?|private club|members' club|longevity club|residences?)\b/i },
  ] as ScoreRule[],

  /** Weak story types (penalties). */
  penalties: [
    { id: 'consumer-product', weight: -3, pattern: /\b(to sell|now selling|on sale|smart (?:strength|ring|watch|mirror|scale|bike|trainer)|gadget|wearables?|gift guide|buyers? guide|review:|hands-on)\b|[$£€]\d{1,2},?\d{3}(?:\.\d\d)?(?!\s?(?:m|bn|million|billion))\b/i },
    { id: 'listicle', weight: -3, pattern: /^(?:the )?(?:\d+ )?best\b|\b(?:top|best) \d+\b|\b\d+ (?:best|ways|tips|things)\b|\bbest [\w\s]{0,30}\b(?:apps?|tools|software|platforms?|products)\b/i },
    { id: 'roundup', weight: -2.5, pattern: /\b(replay|podcast|episode|week in review|weekly (?:roundup|recap)|newsletter|webinar|convo|recap|live blog|today replay|daily digs|roundup|round-up)\b/i },
    { id: 'opinion', weight: -1, pattern: /\b(opinion|op-ed|letters? to the editor)\b/i },
    { id: 'seo-advertorial', weight: -6, pattern: /\b(seo|marketing agenc(?:y|ies)|promo codes?|coupons?|sponsored|press release distribution|how to choose the best)\b/i },
  ] as ScoreRule[],

  /** Thin copy: very short titles from a non-trade source, e.g. "Enhanced Beauty Med Spa - WSAZ". */
  thin: { weight: -1.5, maxTitleWords: 6 },
};

export interface ScoredParts { score: number; quality: number; decay: number; reasons: string[] }

export function scoreItem(
  item: { title: string; source_name: string; source_url?: string; published_date: string; summary?: string | null },
  now = Date.now(),
  cfg = HOME_SCORING,
): ScoredParts {
  const reasons: string[] = [];
  let q = cfg.base;
  const add = (w: number, why: string) => { if (w) { q += w; reasons.push(`${why} ${w > 0 ? '+' : ''}${w}`); } };

  const src = cfg.sources[item.source_name] ?? 0;
  add(src, 'trade');
  if (/^Google News/i.test(item.source_name)) add(cfg.googleNews, 'google-news');
  if (cfg.wire.pattern.test(item.title) || cfg.wire.pattern.test((item.source_url || '').replace(/[./-]/g, ' '))) add(cfg.wire.weight, 'wire');

  // Strip a trailing " - Publisher" before matching story types, so publisher names don't trigger rules
  const title = item.title.replace(/\s+[-|]\s+[^-|]{1,60}$/, '');
  const hit = (r: ScoreRule) => r.pattern.test(title) || (!!r.matchSummary && r.pattern.test(item.summary || ''));
  for (const r of cfg.boosts) if (hit(r)) add(r.weight, r.id);
  for (const r of cfg.penalties) if (hit(r)) add(r.weight, r.id);
  if (src <= 0 && title.split(/\s+/).length <= cfg.thin.maxTitleWords) add(cfg.thin.weight, 'thin');

  const quality = Math.max(cfg.minQuality, q);
  const ageDays = Math.max(0, (now - Date.parse(item.published_date)) / 86400_000);
  const decay = Math.pow(0.5, ageDays / cfg.halfLifeDays);
  return { score: Math.round(quality * decay * 100) / 100, quality, decay: Math.round(decay * 100) / 100, reasons };
}
