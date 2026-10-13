import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Item {
  id: string;
  title: string;
  source_url: string;
  source_name: string;
  published_date: string;
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
        <ul className="grid sm:grid-cols-2 gap-3">
          {items.map((i) => (
            <li key={i.id}>
              <a href={i.source_url} target="_blank" rel="noopener noreferrer" className="block bg-card border border-border rounded-xl p-4 hover:border-accent transition-colors h-full">
                <p className="text-xs text-muted-foreground mb-1">
                  {i.source_name} · {new Date(i.published_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </p>
                <p className="text-sm font-medium flex gap-2">{i.title}<ExternalLink size={12} className="shrink-0 mt-1 text-muted-foreground" /></p>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default SectorNews;
