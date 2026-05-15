import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const FROM = "Andy at Wellness Genius <newsletter@news.wellnessgenius.co.uk>";
const NEWS_URL = "https://wellnessgenius.co.uk/news";
const UNSUBSCRIBE_BASE = "https://wellnessgenius.co.uk/unsubscribe";
const MIN_DAYS_BETWEEN_SENDS = 6;
const MAX_EMAILS_PER_RUN = 50;

interface CacheItem {
  news_id: string;
  title: string;
  summary: string;
  source_url: string;
  source_name: string;
  category: string;
  published_date: string;
  business_lens: string | null;
}

const LENS_LABELS: Record<string, string> = {
  revenue_growth: "Revenue & Growth",
  cost_efficiency: "Operational Efficiency",
  retention_engagement: "Member Behaviour",
  risk_regulation: "Risk & Regulation",
  investment_ma: "Investment & M&A",
  technology_enablement: "AI & Automation",
};

function score(item: CacheItem): number {
  let s = 0;
  const t = item.title.toLowerCase();
  if (item.business_lens === "revenue_growth") s += 10;
  if (item.business_lens === "cost_efficiency") s += 8;
  if (item.business_lens === "retention_engagement") s += 8;
  if (item.business_lens === "investment_ma") s += 6;
  if (item.business_lens === "technology_enablement") s += 6;
  if (item.business_lens === "risk_regulation") s += 4;
  if (t.includes("gym") || t.includes("studio") || t.includes("operator") || t.includes("club")) s += 8;
  if (t.includes("member") || t.includes("retention")) s += 6;
  if (t.includes("revenue") || t.includes("margin")) s += 6;
  if (item.category === "Fitness") s += 5;
  if (item.category === "Wellness") s += 4;
  if (item.category === "Investment") s += 3;
  if (t.includes("politics") || t.includes("election")) s -= 4;
  const days = (Date.now() - new Date(item.published_date).getTime()) / 86400000;
  if (days <= 3) s += 3;
  return s;
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error ${res.status}: ${err}`);
  }
}

function buildEmail(items: CacheItem[], firstName: string, email: string): string {
  const dateLabel = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const rows = items.map((item, i) => {
    const lens = item.business_lens && LENS_LABELS[item.business_lens]
      ? `<span style="display:inline-block;padding:2px 8px;border-radius:12px;background:#16d1a315;color:#16d1a3;font-size:11px;font-weight:600;border:1px solid #16d1a330;margin-bottom:6px;">${LENS_LABELS[item.business_lens]}</span>`
      : "";
    const summary = item.summary.length > 200 ? item.summary.slice(0, 200) + "…" : item.summary;
    return `<tr><td style="padding:0 0 16px 0;"><table cellpadding="0" cellspacing="0" width="100%" style="background:#0d1f1b;border:1px solid #1e3a33;border-radius:10px;"><tr><td style="padding:16px 18px 14px;"><div style="margin-bottom:4px;"><span style="color:#6b9a8f;font-size:12px;">${String(i + 1).padStart(2, "0")} · ${item.source_name}</span></div>${lens}<a href="${item.source_url}" style="display:block;font-size:15px;font-weight:700;color:#e8f5f0;text-decoration:none;line-height:1.4;margin-bottom:6px;">${item.title}</a><p style="margin:0 0 10px;font-size:13px;line-height:1.6;color:#8ab5aa;">${summary}</p><a href="${item.source_url}" style="font-size:12px;color:#16d1a3;font-weight:600;text-decoration:none;">Read →</a></td></tr></table></td></tr>`;
  }).join("");

  return `<div style="font-family:sans-serif;max-width:580px;margin:0 auto;background:#071510;color:#e8f5f0;padding:36px 20px;"><p style="font-size:11px;color:#6b9a8f;margin:0 0 20px;letter-spacing:0.08em;text-transform:uppercase;">Wellness Genius · ${dateLabel}</p><h1 style="font-size:22px;font-weight:800;color:#e8f5f0;margin:0 0 8px;line-height:1.25;">What operators should be watching, ${firstName}.</h1><p style="font-size:13px;color:#8ab5aa;margin:0 0 24px;line-height:1.6;">Top stories scored for commercial relevance this week.</p><table cellpadding="0" cellspacing="0" width="100%">${rows}</table><table cellpadding="0" cellspacing="0" width="100%" style="margin-top:4px;"><tr><td style="padding:16px;background:#0d1f1b;border:1px solid #16d1a330;border-radius:10px;text-align:center;"><a href="${NEWS_URL}?utm_source=weekly_news&utm_medium=email" style="display:inline-block;background:#16d1a3;color:#06211a;text-decoration:none;font-weight:700;font-size:13px;padding:10px 20px;border-radius:8px;">View full intelligence feed →</a></td></tr></table><p style="font-size:11px;color:#4d7a70;margin-top:24px;line-height:1.6;text-align:center;">Andy, Wellness Genius · <a href="${UNSUBSCRIBE_BASE}?email=${encodeURIComponent(email)}" style="color:#4d7a70;">Unsubscribe</a></p></div>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Fetch top news
  const { data: raw, error: newsErr } = await supabase
    .from("rss_news_cache")
    .select("news_id, title, summary, source_url, source_name, category, published_date, business_lens")
    .order("published_date", { ascending: false })
    .limit(80);

  if (newsErr) return new Response(JSON.stringify({ error: newsErr.message }), { status: 500 });
  if (!raw?.length) return new Response(JSON.stringify({ sent: 0, reason: "no news" }), { status: 200 });

  const top = [...raw].sort((a, b) => score(b as CacheItem) - score(a as CacheItem)).slice(0, 6) as CacheItem[];

  // Fetch active subscribers
  const { data: subs, error: subErr } = await supabase
    .from("newsletter_subscribers")
    .select("email, name, last_delivered_at")
    .eq("is_active", true)
    .eq("bounced", false)
    .limit(MAX_EMAILS_PER_RUN);

  if (subErr) return new Response(JSON.stringify({ error: subErr.message }), { status: 500 });
  if (!subs?.length) return new Response(JSON.stringify({ sent: 0, reason: "no subscribers" }), { status: 200 });

  const minGapMs = MIN_DAYS_BETWEEN_SENDS * 24 * 60 * 60 * 1000;
  const eligible = subs.filter(s => !s.last_delivered_at || Date.now() - new Date(s.last_delivered_at).getTime() > minGapMs);
  if (!eligible.length) return new Response(JSON.stringify({ sent: 0, reason: "all sent recently" }), { status: 200 });

  const dateLabel = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  let sent = 0;
  const errors: string[] = [];

  for (const sub of eligible) {
    const firstName = sub.name?.split(" ")[0] || "there";
    try {
      await sendEmail(sub.email, `This week's operator intelligence — ${dateLabel}`, buildEmail(top, firstName, sub.email));
      await supabase.from("newsletter_subscribers").update({ last_delivered_at: new Date().toISOString() }).eq("email", sub.email);
      sent++;
    } catch (e) {
      errors.push(`${sub.email}: ${String(e)}`);
    }
  }

  return new Response(JSON.stringify({ sent, eligible: eligible.length, errors }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
