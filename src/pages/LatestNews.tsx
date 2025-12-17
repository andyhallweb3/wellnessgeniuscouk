import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNewsletter } from "@/hooks/useNewsletter";
import { logger } from "@/lib/logger";
import { ExternalLink, Calendar, Mail, Rss, RefreshCw, Clock } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source_url: string;
  source_name: string;
  category: string;
  image_url: string | null;
  published_date: string;
  business_lens?: string | null;
}

// Business lens configuration with colors and labels
const BUSINESS_LENSES: Record<string, { label: string; color: string; bg: string }> = {
  revenue_growth: { 
    label: "Revenue Growth", 
    color: "text-emerald-400", 
    bg: "bg-emerald-500/20 border-emerald-500/30" 
  },
  cost_efficiency: { 
    label: "Cost & Efficiency", 
    color: "text-blue-400", 
    bg: "bg-blue-500/20 border-blue-500/30" 
  },
  retention_engagement: { 
    label: "Retention & Engagement", 
    color: "text-purple-400", 
    bg: "bg-purple-500/20 border-purple-500/30" 
  },
  risk_regulation: { 
    label: "Risk & Regulation", 
    color: "text-orange-400", 
    bg: "bg-orange-500/20 border-orange-500/30" 
  },
  investment_ma: { 
    label: "Investment & M&A", 
    color: "text-amber-400", 
    bg: "bg-amber-500/20 border-amber-500/30" 
  },
  technology_enablement: { 
    label: "Technology Enablement", 
    color: "text-cyan-400", 
    bg: "bg-cyan-500/20 border-cyan-500/30" 
  },
};

function BusinessLensPill({ lens }: { lens: string | null | undefined }) {
  if (!lens || !BUSINESS_LENSES[lens]) return null;
  const config = BUSINESS_LENSES[lens];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.color}`}>
      {config.label}
    </span>
  );
}

const categories = ["All", "AI", "Wellness", "Fitness", "Hospitality", "Corporate Wellness", "Technology", "Investment"];

function cleanText(raw: string) {
  // Defensive UI-side cleanup in case any feed includes HTML in title/summary
  const withoutTags = raw.replace(/<[^>]*>/g, " ");
  const el = document.createElement("textarea");
  el.innerHTML = withoutTags;
  return el.value.replace(/\s+/g, " ").trim();
}

function getProxiedImageUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  // Use the image proxy edge function to bypass hotlinking restrictions
  const proxyBase = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/image-proxy`;
  return `${proxyBase}?url=${encodeURIComponent(imageUrl)}`;
}

const LatestNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortMode, setSortMode] = useState<"latest" | "popular">("popular");
  const [error, setError] = useState<string | null>(null);
  const [cacheInfo, setCacheInfo] = useState<{ cached: boolean; age?: number } | null>(null);
  const { email, setEmail, isSubmitting, subscribe } = useNewsletter();

  const fetchNews = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const { data, error: fnError } = await supabase.functions.invoke('fetch-rss-news', {
        body: null,
        headers: forceRefresh ? { 'x-force-refresh': 'true' } : undefined,
      });

      if (fnError) throw fnError;
      
      if (data?.success && data?.data) {
        setNews(data.data);
        setCacheInfo({
          cached: data.cached ?? false,
          age: data.cache_age_minutes,
        });
      } else {
        throw new Error(data?.error || 'Failed to fetch news');
      }
    } catch (err) {
      logger.error("Error fetching news:", err);
      setError("Unable to load news. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    document.title = "Wellness Genius Daily — AI & Wellness Industry Intelligence";
    
    // Set Open Graph meta tags
    const setMeta = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    setMeta('og:title', 'Wellness Genius Daily — AI & Wellness Industry Intelligence');
    setMeta('og:description', 'Curated weekly insight at the intersection of wellness, fitness, AI, and behaviour. No fluff. Just signal.');
    setMeta('og:image', 'https://www.wellnessgenius.co.uk/images/wellness-genius-news-og.png');
    setMeta('og:url', 'https://www.wellnessgenius.co.uk/news');
    setMeta('og:type', 'website');

    fetchNews();
  }, [fetchNews]);

  const filteredNews = activeCategory === "All" 
    ? news 
    : news.filter(item => item.category === activeCategory);

  // Sort by mode - "popular" prioritizes diverse sources, "latest" is chronological
  const sortedNews = [...filteredNews].sort((a, b) => {
    if (sortMode === "latest") {
      return new Date(b.published_date).getTime() - new Date(a.published_date).getTime();
    }
    // For "popular" - prioritize category diversity and source variety
    return 0; // Keep original order which has category diversity from the backend
  });

  const featuredNews = sortedNews[0];

  // Get date range for display
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const dateRange = `${weekAgo.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} - ${today.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <div className="min-h-screen bg-background dark">
      <Header />
      
      <main className="pt-24 lg:pt-32">
        {/* Hero Section */}
        <section className="section-padding pb-12">
          <div className="container-wide">
            <div className="max-w-3xl animate-fade-up">
              <span className="badge-tech mb-6">
                <Rss size={14} className="mr-1" />
                Weekly Digest • {dateRange}
              </span>
              <h1 className="mb-6">
                This Week in Wellness & AI
              </h1>
              <p className="text-lg text-muted-foreground">
                Curated news and insights for wellness operators, facility managers, 
                and senior teams across fitness, hospitality, and corporate wellness.
              </p>
            </div>
          </div>
        </section>

        {/* Category Filters */}
        <section className="px-6 lg:px-12 pb-12">
          <div className="container-wide">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeCategory === category
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {category}
                </button>
              ))}
              <button
                onClick={() => fetchNews(true)}
                disabled={refreshing}
                className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-300 disabled:opacity-50"
              >
                <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
            
            {/* Sort Toggle */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-secondary rounded-full p-1">
                <button
                  onClick={() => setSortMode("popular")}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    sortMode === "popular"
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Most Popular
                </button>
                <button
                  onClick={() => setSortMode("latest")}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    sortMode === "latest"
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Latest
                </button>
              </div>
              {cacheInfo && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock size={12} />
                  {cacheInfo.cached 
                    ? `Updated ${cacheInfo.age} min ago`
                    : 'Freshly curated'}
                </div>
              )}
            </div>
          </div>
        </section>

        {loading ? (
          <section className="px-6 lg:px-12 pb-20">
            <div className="container-wide">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="card-tech p-6 animate-pulse">
                    <div className="h-4 bg-secondary rounded w-1/4 mb-4"></div>
                    <div className="h-6 bg-secondary rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-secondary rounded w-full mb-2"></div>
                    <div className="h-4 bg-secondary rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : error ? (
          <section className="px-6 lg:px-12 pb-20">
            <div className="container-wide">
              <div className="card-glass p-12 text-center">
                <Rss size={48} className="mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-heading mb-4">Unable to Load News</h2>
                <p className="text-muted-foreground mb-6 max-w-lg mx-auto">{error}</p>
                <Button variant="accent" onClick={() => fetchNews()}>
                  Try Again
                </Button>
              </div>
            </div>
          </section>
        ) : sortedNews.length === 0 ? (
          <section className="px-6 lg:px-12 pb-20">
            <div className="container-wide">
              <div className="card-glass p-12 text-center">
                <Rss size={48} className="mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-heading mb-4">No News in This Category</h2>
                <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                  Try selecting a different category or refresh the feed.
                </p>
                <Button variant="accent" onClick={() => setActiveCategory("All")}>
                  View All News
                </Button>
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* Featured News */}
            {activeCategory === "All" && featuredNews && (
              <section className="px-6 lg:px-12 pb-16">
                <div className="container-wide">
                  <a 
                    href={featuredNews.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-tech p-8 lg:p-12 block group hover:border-accent/30 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          {featuredNews.business_lens && (
                            <BusinessLensPill lens={featuredNews.business_lens} />
                          )}
                          <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                            Editor's Pick
                          </span>
                          <span className="text-xs text-muted-foreground">{featuredNews.source_name}</span>
                        </div>
                        <h2 className="text-2xl lg:text-3xl mb-4 group-hover:text-accent transition-colors">
                          {cleanText(featuredNews.title)}
                        </h2>
                        <p className="text-muted-foreground mb-6">{featuredNews.summary}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {new Date(featuredNews.published_date).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-secondary text-xs">
                            {featuredNews.category}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-2 text-accent font-medium">
                          Read Full Article
                          <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                      {featuredNews.image_url && (
                        <div className="lg:w-80 h-48 lg:h-64 rounded-xl overflow-hidden bg-secondary">
                          <img 
                            src={getProxiedImageUrl(featuredNews.image_url) || ''}
                            alt={cleanText(featuredNews.title)}
                            loading="lazy"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </a>
                </div>
              </section>
            )}

            {/* News Grid */}
            <section className="px-6 lg:px-12 pb-20">
              <div className="container-wide">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedNews
                    .slice(activeCategory === "All" ? 1 : 0)
                    .map((item, index) => (
                    <a
                      key={item.id}
                      href={item.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card-tech p-6 flex flex-col animate-fade-up group hover:border-accent/30 transition-colors"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {item.image_url && (
                        <div className="h-40 rounded-lg overflow-hidden mb-4 -mx-2 -mt-2 bg-secondary">
                          <img 
                            src={getProxiedImageUrl(item.image_url) || ''}
                            alt={cleanText(item.title)}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).parentElement!.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      {item.business_lens && (
                        <div className="mb-2">
                          <BusinessLensPill lens={item.business_lens} />
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-block px-3 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-medium">
                          {item.category}
                        </span>
                        <span className="text-xs text-muted-foreground">{item.source_name}</span>
                      </div>
                      <h3 className="text-lg font-semibold mb-3 line-clamp-2 group-hover:text-accent transition-colors">
                        {cleanText(item.title)}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 flex-1 line-clamp-3">
                        {item.summary}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          {new Date(item.published_date).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short"
                          })}
                        </span>
                        <span className="flex items-center gap-1 text-accent">
                          Read <ExternalLink size={12} />
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* Newsletter CTA */}
        <section className="px-6 lg:px-12 pb-20">
          <div className="container-narrow">
            <div className="card-glass p-8 lg:p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 text-accent mb-6">
                <Mail size={24} />
              </div>
              <h2 className="text-2xl lg:text-3xl mb-4">Get the weekly digest</h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                The top stories delivered to your inbox every week. AI-curated insights for wellness operators.
              </p>
              <form 
                onSubmit={(e) => subscribe(e, "news-page-bottom")}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-full bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <Button variant="accent" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "..." : "Subscribe"}
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-4">
                By subscribing, you agree to our{" "}
                <Link to="/privacy" className="underline hover:text-foreground">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LatestNews;
