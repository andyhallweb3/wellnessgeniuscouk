import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNewsletter } from "@/hooks/useNewsletter";
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
}

const categories = ["All", "AI", "Wellness", "Fitness", "Technology", "Investment"];

const LatestNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
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
      console.error("Error fetching news:", err);
      setError("Unable to load news. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    document.title = "Latest AI & Wellness News | Wellness Genius";
    fetchNews();
  }, [fetchNews]);

  const filteredNews = activeCategory === "All" 
    ? news 
    : news.filter(item => item.category === activeCategory);

  const featuredNews = filteredNews[0];

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
                Live RSS Feeds
              </span>
              <h1 className="mb-6">
                AI & Wellness Industry News
              </h1>
              <p className="text-lg text-muted-foreground">
                Live aggregated news from leading sources across artificial intelligence, 
                wellness technology, fitness, and digital health.
              </p>
            </div>
          </div>
        </section>

        {/* Category Filters */}
        <section className="px-6 lg:px-12 pb-12">
          <div className="container-wide">
            <div className="flex flex-wrap items-center gap-2">
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
            {cacheInfo && (
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock size={12} />
                {cacheInfo.cached 
                  ? `Cached ${cacheInfo.age} min ago • Updates every 20 min`
                  : 'Freshly fetched from sources'}
              </div>
            )}
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
        ) : filteredNews.length === 0 ? (
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
                        <div className="flex items-center gap-3 mb-4">
                          <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                            Latest
                          </span>
                          <span className="text-xs text-muted-foreground">{featuredNews.source_name}</span>
                        </div>
                        <h2 className="text-2xl lg:text-3xl mb-4 group-hover:text-accent transition-colors">
                          {featuredNews.title}
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
                            src={featuredNews.image_url} 
                            alt={featuredNews.title}
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
                  {filteredNews
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
                            src={item.image_url} 
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).parentElement!.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-block px-3 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-medium">
                          {item.category}
                        </span>
                        <span className="text-xs text-muted-foreground">{item.source_name}</span>
                      </div>
                      <h3 className="text-lg font-semibold mb-3 line-clamp-2 group-hover:text-accent transition-colors">
                        {item.title}
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
              <h2 className="text-2xl lg:text-3xl mb-4">Stay informed</h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Get curated AI and wellness news delivered weekly. No spam, just the insights that matter.
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
