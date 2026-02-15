import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import FounderLayout from "@/components/founder/FounderLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, Loader2, RefreshCw } from "lucide-react";

type NewsItem = {
  id: string;
  title: string;
  summary: string;
  source_url: string;
  source_name: string;
  category: string;
  business_lens?: string | null;
  published_date: string;
};

type Drafts = {
  linkedin?: string;
  x?: string;
  telegram?: string;
  newsletter?: { subject_options?: string[]; body?: string };
};

export default function ContentDashboard() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [goal, setGoal] = useState("Drive AI Readiness Index completions from operators.");
  const [context, setContext] = useState("");
  const [ctaUrl, setCtaUrl] = useState("https://www.wellnessgenius.co.uk/ai-readiness/start");

  const [generating, setGenerating] = useState(false);
  const [drafts, setDrafts] = useState<Drafts | null>(null);

  const selected = useMemo(() => items.find((i) => i.id === selectedId) || null, [items, selectedId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) =>
      i.title.toLowerCase().includes(q) ||
      i.summary.toLowerCase().includes(q) ||
      i.source_name.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q)
    );
  }, [items, query]);

  const fetchNews = async (forceRefresh = false) => {
    try {
      if (forceRefresh) setRefreshing(true);
      setLoadingItems(true);
      const { data, error } = await supabase.functions.invoke("fetch-rss-news", {
        body: null,
        headers: forceRefresh ? { "x-force-refresh": "true" } : undefined,
      });
      if (error) throw error;
      if (!data?.success || !Array.isArray(data?.data)) {
        throw new Error(data?.error || "Failed to load news feed");
      }
      setItems(data.data as NewsItem[]);
      if (!selectedId && data.data.length) setSelectedId(data.data[0].id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load news");
    } finally {
      setLoadingItems(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generate = async () => {
    if (!selected) {
      toast.error("Select a story first.");
      return;
    }
    setGenerating(true);
    setDrafts(null);
    try {
      const { data, error } = await supabase.functions.invoke("content-drafts", {
        body: {
          platform: "all",
          story: selected,
          goal,
          context,
          ctaUrl,
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Draft generation failed");
      setDrafts(data.drafts as Drafts);
      toast.success("Drafts ready.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Draft generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <FounderLayout>
      <Helmet>
        <title>Content Dashboard | Wellness Genius</title>
      </Helmet>

      <div className="flex items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Content Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Pick a story from the Wellness Genius feed and generate platform-native drafts (LinkedIn, X, Telegram, newsletter).
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fetchNews(true)}
            disabled={refreshing}
          >
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-2">Refresh feed</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">News Feed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stories..."
            />

            {loadingItems ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : (
              <div className="max-h-[520px] overflow-auto space-y-2 pr-2">
                {filtered.map((i) => (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => setSelectedId(i.id)}
                    className={[
                      "w-full text-left rounded-lg border px-3 py-2 transition-colors",
                      selectedId === i.id ? "border-accent bg-accent/5" : "border-border hover:bg-muted/40",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium text-sm line-clamp-2">{i.title}</div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 items-center">
                      <Badge variant="secondary">{i.source_name}</Badge>
                      <Badge variant="outline">{i.category}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 line-clamp-2">{i.summary}</div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Brief</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Goal</div>
                  <Input value={goal} onChange={(e) => setGoal(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Primary CTA URL</div>
                  <Input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Extra context (optional)</div>
                <Textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Any extra angle, segment (gym/hotel/software), offer focus, or constraints."
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button variant="accent" onClick={generate} disabled={generating || !selected}>
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  <span className={generating ? "ml-2" : ""}>Generate drafts</span>
                </Button>
                {selected?.source_url ? (
                  <a className="text-sm text-muted-foreground hover:text-foreground underline" href={selected.source_url} target="_blank" rel="noreferrer">
                    View source
                  </a>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Drafts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!drafts ? (
                <div className="text-sm text-muted-foreground">
                  Generate drafts to see LinkedIn / X / Telegram / newsletter copy here.
                </div>
              ) : (
                <>
                  <section className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium">LinkedIn</div>
                      <Button variant="outline" size="sm" onClick={() => copy(drafts.linkedin || "", "LinkedIn")}>
                        <Copy className="h-4 w-4" />
                        <span className="ml-2">Copy</span>
                      </Button>
                    </div>
                    <Textarea value={drafts.linkedin || ""} readOnly rows={8} />
                  </section>

                  <section className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium">X</div>
                      <Button variant="outline" size="sm" onClick={() => copy(drafts.x || "", "X")}>
                        <Copy className="h-4 w-4" />
                        <span className="ml-2">Copy</span>
                      </Button>
                    </div>
                    <Textarea value={drafts.x || ""} readOnly rows={4} />
                  </section>

                  <section className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium">Telegram</div>
                      <Button variant="outline" size="sm" onClick={() => copy(drafts.telegram || "", "Telegram")}>
                        <Copy className="h-4 w-4" />
                        <span className="ml-2">Copy</span>
                      </Button>
                    </div>
                    <Textarea value={drafts.telegram || ""} readOnly rows={6} />
                  </section>

                  <section className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium">Newsletter</div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copy(
                          [
                            "Subject options:",
                            ...(drafts.newsletter?.subject_options || []).map((s) => `- ${s}`),
                            "",
                            drafts.newsletter?.body || "",
                          ].join("\n"),
                          "Newsletter"
                        )}
                      >
                        <Copy className="h-4 w-4" />
                        <span className="ml-2">Copy</span>
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">Subject options</div>
                    <Textarea value={(drafts.newsletter?.subject_options || []).join("\n")} readOnly rows={3} />
                    <div className="text-xs text-muted-foreground">Body</div>
                    <Textarea value={drafts.newsletter?.body || ""} readOnly rows={10} />
                  </section>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </FounderLayout>
  );
}

