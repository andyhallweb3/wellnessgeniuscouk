import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNewsletter } from "@/hooks/useNewsletter";
import { ExternalLink, Calendar, ArrowRight, Mail, Rss } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source_url: string;
  source_name: string;
  category: string;
  image_url: string | null;
  published_date: string;
  is_featured: boolean;
}

const categories = ["All", "AI", "Wellness", "Fitness", "Technology"];

const LatestNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const { email, setEmail, isSubmitting, subscribe } = useNewsletter();

  useEffect(() => {
    document.title = "Latest AI & Wellness News | Wellness Genius";
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from("curated_news")
        .select("*")
        .order("published_date", { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = activeCategory === "All" 
    ? news 
    : news.filter(item => item.category === activeCategory);

  const featuredNews = news.find(item => item.is_featured);

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
                Latest News
              </span>
              <h1 className="mb-6">
                AI & Wellness Industry News
              </h1>
              <p className="text-lg text-muted-foreground">
                Curated news and updates from the intersection of artificial intelligence, 
                wellness technology, and the fitness industry.
              </p>
            </div>
          </div>
        </section>

        {/* Category Filters */}
        <section className="px-6 lg:px-12 pb-12">
          <div className="container-wide">
            <div className="flex flex-wrap gap-2">
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
            </div>
          </div>
        </section>

        {loading ? (
          <section className="px-6 lg:px-12 pb-20">
            <div className="container-wide">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
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
        ) : news.length === 0 ? (
          <section className="px-6 lg:px-12 pb-20">
            <div className="container-wide">
              <div className="card-glass p-12 text-center">
                <Rss size={48} className="mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-heading mb-4">News Coming Soon</h2>
                <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                  We're curating the latest AI and wellness industry news. 
                  Subscribe to get notified when we publish updates.
                </p>
                <form 
                  onSubmit={(e) => subscribe(e, "news-page")}
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
                    {isSubmitting ? "..." : "Notify Me"}
                  </Button>
                </form>
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
                            Featured
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
                        <div className="lg:w-80 h-48 lg:h-64 rounded-xl overflow-hidden">
                          <img 
                            src={featuredNews.image_url} 
                            alt={featuredNews.title}
                            className="w-full h-full object-cover"
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
                    .filter(item => activeCategory !== "All" || !item.is_featured)
                    .map((item, index) => (
                    <a
                      key={item.id}
                      href={item.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card-tech p-6 flex flex-col animate-fade-up group hover:border-accent/30 transition-colors"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {item.image_url && (
                        <div className="h-40 rounded-lg overflow-hidden mb-4 -mx-2 -mt-2">
                          <img 
                            src={item.image_url} 
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
