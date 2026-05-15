import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const FROM = "Andy at Wellness Genius <newsletter@news.wellnessgenius.co.uk>";
const NEWS_URL = "https://wellnessgenius.co.uk/news";
const UNSUBSCRIBE_BASE = "https://wellnessgenius.co.uk/unsubscribe";
const MIN_DAYS_BETWEEN_SENDS = 6;

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
  if (t.includes("hospital") && !t.includes("hospitality")) s -= 2;

  const days = (Date.now() - new Date(item.published_date).getTime()) / 86400000;
  if (days <= 3) s += 3;

  return s;
}

function lensTag(lens: string | null): string {
  if (!lens || !LENS_LABELS[lens]) return "";
  return `<span style="display:inline-block;padding:2px 8px;border-radius:12px;background:#16d1a315;color:#16d1a3;font-size:11px;font-weight:600;border:1px solid #16d1a330;margin-bottom:6px;">${LENS_LABELS[lens]}</span>`;
}

function buildNewsItems(items: CacheItem[]): string {
  return items.map((item, i) => `
    <tr>
      <td style="padding:0 0 20px 0;">
        <table cellpadding="0" cellspacing="0" width="100%" style="background:#0d1f1b;border:1px solid #1e3a33;border-radius:10px;">
          <tr>
            <td style="padding:18px 20px 16px;">
              <div style="margin-bottom:4px;">
                <span style="color:#6b9a8f;font-size:12px;">${String(i + 1).padStart(2, "0")} · ${item.source_name}</span>
              </div>
              ${lensTag(item.business_lens)}
              <a href="${item.source_url}" style="display:block;font-size:16px;font-weight:700;color:#e8f5f0;text-decoration:none;line-height:1.4;margin-bottom:8px;">${item.title}</a>
              <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#8ab5aa;">${item.summary.slice(0, 200)}${item.summary.length > 200 ? "…" : ""}</p>
              <a href="${item.source_url}" style="font-size:13px;color:#16d1a3;font-weight:600;text-decoration:none;">Read article →</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Pull last 7 days of cached news
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: raw } = await supabase
      .from("rss_news_cache")
      .select("news_id, title, summary, source_url, source_name, category, published_date, business_lens")
      .gte("published_date", since)
      .order("published_date", { ascending: false })
      .limit(100);

    if (!raw?.length) {
      return new Response(JSON.stringify({ sent: 0, reason: "no recent news" }), { status: 200 });
    }

    // Score and pick top 6
    const top = [...raw]
      .sort((a, b) => score(b as CacheItem) - score(a as CacheItem))
      .slice(0, 6) as CacheItem[];

    // Get active non-bounced subscribers not sent to in the last MIN_DAYS_BETWEEN_SENDS days
    const cutoff = new Date(Date.now() - MIN_DAYS_BETWEEN_SENDS * 24 * 60 * 60 * 1000).toISOString();
    const { data: subscribers } = await supabase
      .from("newsletter_subscribers")
      .select("email, name, last_delivered_at")
      .eq("is_active", true)
      .eq("bounced", false)
      .or(`last_delivered_at.is.null,last_delivered_at.lt.${cutoff}`);

    if (!subscribers?.length) {
      return new Response(JSON.stringify({ sent: 0, reason: "no eligible subscribers" }), { status: 200 });
    }

    const today = new Date();
    const dateLabel = today.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

    let sent = 0;
    const errors: string[] = [];

    for (const sub of subscribers) {
      const firstName = sub.name?.split(" ")[0] || "there";

      try {
        await resend.emails.send({
          from: FROM,
          to: sub.email,
          subject: `This week's operator intelligence — ${dateLabel}`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#071510;color:#e8f5f0;padding:40px 24px;">
              <p style="font-size:12px;color:#6b9a8f;margin:0 0 24px;letter-spacing:0.08em;text-transform:uppercase;">Wellness Genius · Weekly Intelligence</p>

              <h1 style="font-size:24px;font-weight:800;color:#e8f5f0;margin:0 0 8px;line-height:1.25;">
                What operators should be watching this week, ${firstName}.
              </h1>
              <p style="font-size:14px;color:#8ab5aa;margin:0 0 28px;line-height:1.6;">
                Six stories scored for commercial relevance. Revenue signals, market moves, and what to act on.
              </p>

              <table cellpadding="0" cellspacing="0" width="100%">
                ${buildNewsItems(top)}
              </table>

              <table cellpadding="0" cellspacing="0" width="100%" style="margin-top:8px;">
                <tr>
                  <td style="padding:20px;background:#0d1f1b;border:1px solid #16d1a330;border-radius:10px;text-align:center;">
                    <p style="margin:0 0 12px;font-size:14px;color:#8ab5aa;">See all stories, share to LinkedIn and X, and get operator context applied to your business.</p>
                    <a href="${NEWS_URL}?utm_source=weekly_news&utm_medium=email" style="display:inline-block;background:#16d1a3;color:#06211a;text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:8px;">
                      View full intelligence feed →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:12px;color:#4d7a70;margin-top:28px;line-height:1.6;text-align:center;">
                Andy, Wellness Genius<br/>
                <a href="${UNSUBSCRIBE_BASE}?email=${encodeURIComponent(sub.email)}" style="color:#4d7a70;">Unsubscribe</a>
              </p>
            </div>
          `,
        });

        await supabase
          .from("newsletter_subscribers")
          .update({ last_delivered_at: new Date().toISOString() })
          .eq("email", sub.email);

        sent++;
      } catch (e) {
        errors.push(`${sub.email}: ${String(e)}`);
      }
    }

    return new Response(JSON.stringify({ sent, errors }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-weekly-news error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
