import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Clock, Gauge, Pause, Play } from "lucide-react";
import HubLayout from "@/components/hub/HubLayout";
import LeadForm from "@/components/hub/LeadForm";
import BriefingCover from "@/components/hub/BriefingCover";
import { supabase } from "@/integrations/supabase/client";
import { sortedIssues, type BriefingIssue } from "@/data/briefingIssues";
import { SECTORS } from "@/data/sectors";
import { DOWNLOADABLE_RESOURCES } from "@/data/downloadableResources";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  created_at: string;
  read_time: string | null;
  image_url: string | null;
}

interface Card {
  key: string;
  href: string;
  external?: boolean;
  title: string;
  date: string;
  summary: string;
  image?: string | null;
  readTime?: string | null;
  sectors: string[];
  text: string;
  audioUrl?: string;
  issue?: BriefingIssue;
}

// Topic tags are matched by keyword against real titles, summaries and tags
const TOPICS: { key: string; label: string; re: RegExp }[] = [
  { key: "ai", label: "AI", re: /\b(ai|artificial intelligence|openai|agents?|automation)\b/i },
  { key: "recovery", label: "Recovery", re: /\b(recovery|cryo|cold|sauna|hyperbaric|oxygen|red light|thermal|modalit)/i },
  { key: "longevity", label: "Longevity", re: /\b(longevity|healthspan|lifespan|ageing|aging)\b/i },
  { key: "member", label: "Member experience", re: /\b(member|membership|retention|guest|experience|engagement)\b/i },
];

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const AudioButton = ({ url, title }: { url: string; title: string }) => {
  const [audio] = useState(() => (typeof Audio !== "undefined" ? new Audio(url) : null));
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!audio) return;
    const end = () => setPlaying(false);
    audio.addEventListener("ended", end);
    return () => { audio.pause(); audio.removeEventListener("ended", end); };
  }, [audio]);
  if (!audio) return null;
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); if (playing) { audio.pause(); setPlaying(false); } else { void audio.play(); setPlaying(true); } }}
      aria-label={`${playing ? "Pause" : "Play"} audio: ${title}`}
      className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
    >
      {playing ? <Pause size={12} /> : <Play size={12} />} Listen
    </button>
  );
};

const ArticleCard = ({ c }: { c: Card }) => {
  const inner = (
    <>
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-secondary mb-3">
        {c.issue ? (
          <BriefingCover image={c.issue.image} title={c.issue.title} className="h-full w-full" />
        ) : c.image ? (
          <img src={c.image} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <h3 className="font-semibold leading-snug line-clamp-2 break-words [overflow-wrap:anywhere] group-hover:text-accent transition-colors">{c.title}</h3>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
        <span className="inline-flex items-center gap-1"><Calendar size={11} />{fmt(c.date)}</span>
        {c.readTime && <span className="inline-flex items-center gap-1"><Clock size={11} />{c.readTime}</span>}
        {c.audioUrl && <AudioButton url={c.audioUrl} title={c.title} />}
      </div>
      {c.summary && <p className="text-sm text-muted-foreground mt-2 line-clamp-2 break-words">{c.summary}</p>}
    </>
  );
  const cls = "group block min-w-0 bg-card border border-border rounded-xl p-3 hover:border-accent transition-colors h-full";
  return c.external ? (
    <a href={c.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
  ) : (
    <Link to={c.href} className={cls}>{inner}</Link>
  );
};

const Articles = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [sector, setSector] = useState("all");
  const [topic, setTopic] = useState("all");

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, category, created_at, read_time, image_url")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => setPosts((data as BlogPost[]) || []));
  }, []);

  const issues = sortedIssues();
  const featured = issues[0];

  const cards: Card[] = useMemo(() => {
    const fromIssues: Card[] = issues.slice(1).map((i) => ({
      key: `issue-${i.slug}`,
      href: `/briefing/${i.slug}`,
      title: i.title,
      date: i.date,
      summary: i.summary,
      sectors: i.sectors || [],
      text: `${i.title} ${i.summary} ${(i.tags || []).join(" ")}`,
      audioUrl: i.audioUrl,
      issue: i,
    }));
    const fromPosts: Card[] = posts.map((p) => ({
      key: `post-${p.id}`,
      href: `/insights/${p.slug}`,
      title: p.title,
      date: p.created_at,
      summary: p.excerpt,
      image: p.image_url,
      readTime: p.read_time,
      sectors: [],
      text: `${p.title} ${p.excerpt} ${p.category}`,
    }));
    return [...fromIssues, ...fromPosts].sort((a, b) => b.date.localeCompare(a.date));
  }, [issues, posts]);

  const t = TOPICS.find((x) => x.key === topic);
  const visible = cards.filter((c) => (sector === "all" || c.sectors.length === 0 || c.sectors.includes(sector)) && (!t || t.re.test(c.text)));

  const shortReads = issues.flatMap((i) => [
    ...(i.keyTakeaways || []).map((text) => ({ text, issue: i, kind: "Takeaway" })),
    ...(i.quotes || []).map((text) => ({ text, issue: i, kind: "Quote" })),
  ]).slice(0, 6);

  const chip = (active: boolean) =>
    `shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-accent"}`;
  const tag = (active: boolean) =>
    `shrink-0 whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${active ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`;

  return (
    <HubLayout title="Articles" description="Andy's Briefing issues, guides and explainers on wellness, hospitality and AI.">
      <div className="container-wide px-4 lg:px-12 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Articles</h1>
          <Link to="/ai-readiness" className="shrink-0 self-start sm:self-auto inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-accent hover:underline">
            <Gauge size={14} /> Check your AI Readiness Score
          </Link>
        </div>

        {featured && (
          <Link to={`/briefing/${featured.slug}`} className="group grid md:grid-cols-2 gap-4 items-center bg-card border border-border rounded-2xl p-3 sm:p-4 mb-5 hover:border-accent transition-colors">
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-secondary">
              <BriefingCover image={featured.image} title={featured.title} className="h-full w-full" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-accent mb-1">Latest from Andy's Briefing</p>
              <h2 className="text-lg sm:text-2xl font-bold leading-tight mb-2 group-hover:text-accent transition-colors">{featured.title}</h2>
              <p className="text-xs text-muted-foreground mb-2">{fmt(featured.date)}</p>
              <p className="text-sm text-muted-foreground mb-3">{featured.keyTakeaways?.[0] ?? featured.summary}</p>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent">Read the issue <ArrowRight size={14} /></span>
                {featured.audioUrl && <AudioButton url={featured.audioUrl} title={featured.title} />}
              </div>
            </div>
          </Link>
        )}

        <div className="sticky top-16 lg:top-20 z-20 bg-background/95 backdrop-blur py-2 mb-3 space-y-2">
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1" role="group" aria-label="Filter by sector">
            <button className={chip(sector === "all")} onClick={() => setSector("all")}>All sectors</button>
            {SECTORS.map((s) => (
              <button key={s.slug} className={chip(sector === s.slug)} onClick={() => setSector(s.slug)}>{s.name}</button>
            ))}
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1" role="group" aria-label="Filter by topic">
            <button className={tag(topic === "all")} onClick={() => setTopic("all")}>All topics</button>
            {TOPICS.map((x) => (
              <button key={x.key} className={tag(topic === x.key)} onClick={() => setTopic(x.key)}>{x.label}</button>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8">No articles match this filter yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
            {visible.map((c, idx) => [
              <ArticleCard key={c.key} c={c} />,
              idx === 5 && visible.length > 6 ? (
                <div key="inline-signup" className="col-span-full"><LeadForm compact source="articles-inline" /></div>
              ) : null,
            ])}
          </div>
        )}

        {shortReads.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg sm:text-xl font-semibold mb-3">Short reads</h2>
            <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-1 px-1">
              {shortReads.map((r, n) => (
                <Link key={n} to={`/briefing/${r.issue.slug}`} className="shrink-0 w-72 bg-card border border-border rounded-xl p-4 hover:border-accent">
                  <p className="text-[11px] uppercase tracking-wider text-accent mb-1">{r.kind}</p>
                  <p className="text-sm line-clamp-4">{r.text}</p>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{r.issue.title}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg sm:text-xl font-semibold">Guides and explainers</h2>
            <Link to="/resources" className="text-sm text-accent hover:underline inline-flex items-center gap-1">All resources <ArrowRight size={14} /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {DOWNLOADABLE_RESOURCES.slice(0, 6).map((r) => (
              <Link key={r.id} to="/resources" className="block bg-card border border-border rounded-xl p-4 hover:border-accent transition-colors min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">{r.format}</p>
                <h3 className="font-semibold leading-snug line-clamp-2">{r.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.subtitle}</p>
              </Link>
            ))}
          </div>
        </section>

        <div className="mb-6 max-w-3xl">
          <LeadForm compact source="articles-footer" />
        </div>
      </div>
    </HubLayout>
  );
};

export default Articles;
