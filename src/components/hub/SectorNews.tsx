import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import NewsImage from "@/components/news/NewsImage";

interface Item {
  id: string;
  title: string;
  source_url: string;
  source_name: string;
  published_date: string;
  image_url?: string | null;
  sectors?: string[];
}

const SectorNews = ({ sector, name }: { sector: string; name: string }) => {
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase.functions
      .invoke(`fetch-rss-news?sector=${encodeURIComponent(sector)}&limit=6`, { body: null })
      .then(({ data }) => {
        if (!cancelled) setItems(data?.success ? (data.data as Item[]).slice(0, 6) : []);
      })
      .catch(() => !cancelled && setItems([]));
    return () => { cancelled = true; };
  }, [sector]);

  if (items && items.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Latest {name} news</h2>
        <Link to={`/news?sector=${sector}`} className="text-sm text-accent hover:underline inline-flex items-center gap-1">
          All {name} news <ArrowRight size={14} />
        </Link>
      </div>
      {items === null ? (
        <p className="text-sm text-muted-foreground">Loading news...</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((i) => (
            <li key={i.id} className="min-w-0">
              <a href={i.source_url} target="_blank" rel="noopener noreferrer" className="flex flex-col bg-card border border-border rounded-xl hover:border-accent transition-colors h-full min-w-0 overflow-hidden">
                <NewsImage src={i.image_url} alt="" sectors={i.sectors?.length ? i.sectors : [sector]} />
                <div className="p-4 min-w-0">
                <p className="text-xs text-muted-foreground mb-1 truncate">
                  {i.source_name} · {new Date(i.published_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </p>
                <p className="text-sm font-medium flex items-start gap-2 min-w-0"><span className="min-w-0 flex-1 line-clamp-3 break-words [overflow-wrap:anywhere]">{i.title}</span><ExternalLink size={12} className="shrink-0 mt-1 text-muted-foreground" /></p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default SectorNews;
