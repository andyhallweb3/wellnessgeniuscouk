import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import NewsImage from "@/components/news/NewsImage";
import LeadForm from "@/components/hub/LeadForm";

interface Item {
  id: string;
  title: string;
  source_url: string;
  source_name: string;
  published_date: string;
  image_url?: string | null;
  sectors?: string[];
}

interface Props {
  sector?: string;
  name: string;
  limit?: number;
  heading?: string;
  allHref?: string;
  signupAfter?: number;
  signupSource?: string;
}

const SectorNews = ({ sector, name, limit = 6, heading, allHref, signupAfter, signupSource = "news-inline" }: Props) => {
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase.functions
      .invoke(`fetch-rss-news?limit=${limit}${sector ? `&sector=${encodeURIComponent(sector)}` : ""}`, { body: null })
      .then(({ data }) => {
        if (!cancelled) setItems(data?.success ? (data.data as Item[]).slice(0, limit) : []);
      })
      .catch(() => !cancelled && setItems([]));
    return () => { cancelled = true; };
  }, [sector, limit]);

  if (items && items.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">{heading ?? `Latest ${name} news`}</h2>
        <Link to={allHref ?? (sector ? `/news?sector=${sector}` : "/news")} className="text-sm text-accent hover:underline inline-flex items-center gap-1 shrink-0 self-start sm:self-auto">
          {sector ? `All ${name} news` : "All news"} <ArrowRight size={14} />
        </Link>
      </div>
      {items === null ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" aria-busy="true">
          {Array.from({ length: Math.min(limit, 6) }).map((_, n) => (
            <li key={n} className="h-[104px] sm:h-[120px] rounded-xl bg-card border border-border animate-pulse" />
          ))}
        </ul>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((i, idx) => [
            <li key={i.id} className="min-w-0">
              <a href={i.source_url} target="_blank" rel="noopener noreferrer" className="flex flex-row items-stretch gap-3 bg-card border border-border rounded-xl hover:border-accent transition-colors h-full min-w-0 overflow-hidden p-3">
                <NewsImage variant="thumb" src={i.image_url} alt="" sectors={i.sectors?.length ? i.sectors : sector ? [sector] : []} className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground mb-1 truncate">
                  {i.source_name} · {new Date(i.published_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </p>
                <p className="text-sm font-medium flex items-start gap-2 min-w-0"><span className="min-w-0 flex-1 line-clamp-3 break-words [overflow-wrap:anywhere]">{i.title}</span><ExternalLink size={12} className="shrink-0 mt-1 text-muted-foreground" /></p>
                </div>
              </a>
            </li>,
            signupAfter && idx === signupAfter - 1 && items.length > signupAfter ? (
              <li key="inline-signup" className="col-span-full">
                <LeadForm compact source={signupSource} />
              </li>
            ) : null,
          ])}
        </ul>
      )}
    </section>
  );
};

export default SectorNews;
