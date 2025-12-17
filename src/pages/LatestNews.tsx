import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNewsletter } from "@/hooks/useNewsletter";
import { logger } from "@/lib/logger";
import { ExternalLink, Calendar, Mail, Rss, RefreshCw, Clock, Building2, Package, TrendingUp, Users, Zap, DollarSign } from "lucide-react";

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

// Operator-centric business lenses with icons and styling
const BUSINESS_LENSES: Record<string, { label: string; color: string; bg: string; icon: typeof TrendingUp }> = {
  revenue_growth: { 
    label: "Revenue & Growth", 
    color: "text-emerald-400", 
    bg: "bg-emerald-500/20 border-emerald-500/30",
    icon: TrendingUp
  },
  cost_efficiency: { 
    label: "Operational Efficiency", 
    color: "text-blue-400", 
    bg: "bg-blue-500/20 border-blue-500/30",
    icon: Zap
  },
  retention_engagement: { 
    label: "Member Behaviour", 
    color: "text-purple-400", 
    bg: "bg-purple-500/20 border-purple-500/30",
    icon: Users
  },
  risk_regulation: { 
    label: "Risk & Regulation", 
    color: "text-orange-400", 
    bg: "bg-orange-500/20 border-orange-500/30",
    icon: Building2
  },
  investment_ma: { 
    label: "Investment & M&A", 
    color: "text-amber-400", 
    bg: "bg-amber-500/20 border-amber-500/30",
    icon: DollarSign
  },
  technology_enablement: { 
    label: "AI & Automation", 
    color: "text-cyan-400", 
    bg: "bg-cyan-500/20 border-cyan-500/30",
    icon: Zap
  },
};

// Audience tags for who should care
const AUDIENCE_TAGS: Record<string, { label: string; icon: typeof Building2; color: string }> = {
  operator: { label: "Operators", icon: Building2, color: "text-emerald-400" },
  supplier: { label: "Suppliers", icon: Package, color: "text-blue-400" },
  investor: { label: "Investors", icon: DollarSign, color: "text-amber-400" },
};

function getAudienceTag(item: NewsItem): keyof typeof AUDIENCE_TAGS {
  const titleLower = item.title.toLowerCase();
  const summaryLower = item.summary.toLowerCase();
  
  // Investment signals
  if (item.business_lens === "investment_ma" || item.category === "Investment" ||
      titleLower.includes("funding") || titleLower.includes("acquisition") ||
      titleLower.includes("ipo") || titleLower.includes("valuation") ||
      titleLower.includes("series a") || titleLower.includes("series b")) {
    return "investor";
  }
  
  // Supplier/platform signals
  if (titleLower.includes("platform") || titleLower.includes("software") ||
      titleLower.includes("launches") || titleLower.includes("partnership") ||
      summaryLower.includes("vendor") || summaryLower.includes("supplier")) {
    return "supplier";
  }
  
  // Default to operator
  return "operator";
}

function BusinessLensPill({ lens }: { lens: string | null | undefined }) {
  if (!lens || !BUSINESS_LENSES[lens]) return null;
  const config = BUSINESS_LENSES[lens];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.color}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}

function AudienceTag({ audience }: { audience: keyof typeof AUDIENCE_TAGS }) {
  const config = AUDIENCE_TAGS[audience];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${config.color}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}

// Operator-centric filter categories
const FILTER_CATEGORIES = [
  { key: "All", label: "All Stories" },
  { key: "operators", label: "For Operators" },
  { key: "revenue", label: "Revenue & Growth" },
  { key: "efficiency", label: "Operational Efficiency" },
  { key: "ai", label: "AI & Automation" },
  { key: "member", label: "Member Trends" },
  { key: "investment", label: "Investment Signals" },
  { key: "supplier", label: "Supplier Moves" },
];

function cleanText(raw: string) {
  const withoutTags = raw.replace(/<[^>]*>/g, " ");
  const el = document.createElement("textarea");
  el.innerHTML = withoutTags;
  return el.value.replace(/\s+/g, " ").trim();
}

function getProxiedImageUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  const proxyBase = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/image-proxy`;
  return `${proxyBase}?url=${encodeURIComponent(imageUrl)}`;
}

// Calculate operator relevance score
function calculateRelevanceScore(item: NewsItem): number {
  let score = 0;
  const titleLower = item.title.toLowerCase();
  const summaryLower = item.summary.toLowerCase();
  
  // Business lens scoring
  if (item.business_lens === "revenue_growth") score += 10;
  if (item.business_lens === "cost_efficiency") score += 8;
  if (item.business_lens === "retention_engagement") score += 8;
  if (item.business_lens === "investment_ma") score += 6;
  if (item.business_lens === "technology_enablement") score += 6;
  if (item.business_lens === "risk_regulation") score += 4;
  
  // Operator keywords
  if (titleLower.includes("gym") || titleLower.includes("studio") || 
      titleLower.includes("operator") || titleLower.includes("club")) score += 8;
  if (titleLower.includes("member") || titleLower.includes("retention")) score += 6;
  if (titleLower.includes("revenue") || titleLower.includes("margin")) score += 6;
  
  // Category boost
  if (item.category === "Fitness") score += 5;
  if (item.category === "Wellness") score += 4;
  if (item.category === "Investment") score += 3;
  
  // Penalize generic healthcare/politics
  if (titleLower.includes("politics") || titleLower.includes("election")) score -= 4;
  if (titleLower.includes("hospital") && !titleLower.includes("hospitality")) score -= 2;
  
  // Recency boost (within 3 days)
  const daysSincePublished = (Date.now() - new Date(item.published_date).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSincePublished <= 3) score += 3;
  
  return score;
}

// Filter function based on selected category
function filterByCategory(items: NewsItem[], category: string): NewsItem[] {
  if (category === "All") return items;
  
  return items.filter(item => {
    const titleLower = item.title.toLowerCase();
    const summaryLower = item.summary.toLowerCase();
    
    switch (category) {
      case "operators":
        return item.category === "Fitness" || 
               titleLower.includes("gym") || titleLower.includes("studio") ||
               titleLower.includes("operator") || titleLower.includes("club") ||
               titleLower.includes("facility") || titleLower.includes("member");
      case "revenue":
        return item.business_lens === "revenue_growth" ||
               titleLower.includes("revenue") || titleLower.includes("growth") ||
               titleLower.includes("pricing") || titleLower.includes("sales");
      case "efficiency":
        return item.business_lens === "cost_efficiency" ||
               titleLower.includes("cost") || titleLower.includes("efficiency") ||
               titleLower.includes("operation") || titleLower.includes("staff");
      case "ai":
        return item.business_lens === "technology_enablement" ||
               item.category === "AI" || item.category === "Technology" ||
               titleLower.includes("ai") || titleLower.includes("automation") ||
               titleLower.includes("tech");
      case "member":
        return item.business_lens === "retention_engagement" ||
               titleLower.includes("member") || titleLower.includes("retention") ||
               titleLower.includes("engagement") || titleLower.includes("behaviour");
      case "investment":
        return item.business_lens === "investment_ma" ||
               item.category === "Investment" ||
               titleLower.includes("funding") || titleLower.includes("acquisition") ||
               titleLower.includes("investment") || titleLower.includes("valuation");
      case "supplier":
        return titleLower.includes("platform") || titleLower.includes("software") ||
               titleLower.includes("partnership") || titleLower.includes("launches") ||
               summaryLower.includes("vendor") || summaryLower.includes("supplier");
      default:
        return true;
    }
  });
}

const LatestNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortMode, setSortMode] = useState<"relevant" | "latest">("relevant");
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
    document.title = "Wellness Genius Daily — Operator Intelligence";
    
    const setMeta = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    setMeta('og:title', 'Wellness Genius Daily — Operator Intelligence');
    setMeta('og:description', 'Weekly intelligence for wellness operators. Revenue signals, operational insights, and market moves that matter.');
    setMeta('og:image', 'https://www.wellnessgenius.co.uk/images/wellness-genius-news-og.png');
    setMeta('og:url', 'https://www.wellnessgenius.co.uk/news');
    setMeta('og:type', 'website');

    fetchNews();
  }, [fetchNews]);

  // Filter and sort
  const filteredNews = filterByCategory(news, activeFilter);
  
  const sortedNews = [...filteredNews].sort((a, b) => {
    if (sortMode === "latest") {
      return new Date(b.published_date).getTime() - new Date(a.published_date).getTime();
    }
    // Sort by operator relevance score
    return calculateRelevanceScore(b) - calculateRelevanceScore(a);
  });

  // Get top 3 signals for the week (highest relevance scores)
  const topSignals = [...news]
    .sort((a, b) => calculateRelevanceScore(b) - calculateRelevanceScore(a))
    .slice(0, 3);

  const featuredNews = sortedNews[0];

  // Get date range for display
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const dateRange = `${weekAgo.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} - ${today.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <div className="min-h-screen bg-background dark">
      <Helmet>
        <title>Operator Intelligence | Wellness Genius</title>
        <meta name="description" content="Weekly intelligence for wellness operators. Revenue signals, operational insights, and market moves that matter for gyms, studios, and fitness facilities." />
        <meta name="keywords" content="wellness operators, fitness industry intelligence, gym business news, HCM, health club management, UK Active, Sport England, operator insights, fitness revenue, gym operations, boutique fitness, franchise gyms, member retention" />
        <meta property="og:title" content="Operator Intelligence | Wellness Genius" />
        <meta property="og:description" content="Weekly intelligence for wellness operators. Revenue signals, operational insights, and market moves that matter." />
        <meta property="og:type" content="website" />
      </Helmet>
      <Header />
      
      <main className="pt-24 lg:pt-32">
        {/* Hero Section */}
        <section className="section-padding pb-8">
          <div className="container-wide">
            <div className="max-w-3xl animate-fade-up">
              <span className="badge-tech mb-6">
                <Rss size={14} className="mr-1" />
                Weekly Intelligence • {dateRange}
              </span>
              <h1 className="mb-6">
                Operator Intelligence
              </h1>
              <p className="text-lg text-muted-foreground">
                What you need to think about this week — with clear commercial context.
                Revenue signals, operational insights, and market moves that matter.
              </p>
            </div>
          </div>
        </section>

        {/* This Week's Top Signals */}
        {!loading && !error && topSignals.length > 0 && activeFilter === "All" && (
          <section className="px-6 lg:px-12 pb-12">
            <div className="container-wide">
              <div className="card-glass p-6 lg:p-8 border-accent/20">
                <div className="flex items-center gap-3 mb-6">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/20 border border-accent/30">
                    <Zap className="w-5 h-5 text-accent" />
                  </span>
                  <div>
                    <h2 className="text-xl font-heading">This Week&apos;s Top Signals</h2>
                    <p className="text-sm text-muted-foreground">3 things operators should pay attention to</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {topSignals.map((item, index) => (
                    <a
                      key={`signal-${item.id}`}
                      href={item.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-4 p-4 rounded-xl bg-background/50 hover:bg-background/80 border border-border/50 hover:border-accent/30 transition-all group"
                    >
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {item.business_lens && <BusinessLensPill lens={item.business_lens} />}
                          <AudienceTag audience={getAudienceTag(item)} />
                          <span className="text-xs text-muted-foreground">• {item.source_name}</span>
                        </div>
                        <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2">
                          {cleanText(item.title)}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {item.summary}
                        </p>
                      </div>
                      <ExternalLink size={16} className="flex-shrink-0 text-muted-foreground group-hover:text-accent mt-1" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Filter Tabs */}
        <section className="px-6 lg:px-12 pb-8">
          <div className="container-wide">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {FILTER_CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveFilter(cat.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeFilter === cat.key
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {cat.label}
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
                  onClick={() => setSortMode("relevant")}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    sortMode === "relevant"
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Most Relevant
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
                <h2 className="text-2xl font-heading mb-4">No Stories Match This Filter</h2>
                <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                  Try a different filter or view all stories.
                </p>
                <Button variant="accent" onClick={() => setActiveFilter("All")}>
                  View All Stories
                </Button>
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* Featured News */}
            {activeFilter === "All" && featuredNews && (
              <section className="px-6 lg:px-12 pb-12">
                <div className="container-wide">
                  <a 
                    href={featuredNews.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-tech p-8 lg:p-10 block group hover:border-accent/30 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          {featuredNews.business_lens && (
                            <BusinessLensPill lens={featuredNews.business_lens} />
                          )}
                          <AudienceTag audience={getAudienceTag(featuredNews)} />
                          <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                            Top Story
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
                        </div>
                        <span className="inline-flex items-center gap-2 text-accent font-medium">
                          Read Full Article
                          <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                      {featuredNews.image_url && (
                        <div className="lg:w-80 h-48 lg:h-56 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
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
                    .slice(activeFilter === "All" ? 1 : 0)
                    .map((item, index) => {
                      const relevanceScore = calculateRelevanceScore(item);
                      const isHighRelevance = relevanceScore >= 15;
                      
                      return (
                        <a
                          key={item.id}
                          href={item.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`card-tech p-6 flex flex-col animate-fade-up group transition-colors ${
                            isHighRelevance 
                              ? "hover:border-accent/40 border-accent/20" 
                              : "hover:border-accent/30"
                          }`}
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
                          
                          {/* Business lens and audience tags */}
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            {item.business_lens && <BusinessLensPill lens={item.business_lens} />}
                            <AudienceTag audience={getAudienceTag(item)} />
                          </div>
                          
                          <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                            <span>{item.source_name}</span>
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
                      );
                    })}
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
              <h2 className="text-2xl lg:text-3xl mb-4">Get the weekly intelligence digest</h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                The top operator signals delivered to your inbox every week. Commercial context included.
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
