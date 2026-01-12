import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock, Mail } from "lucide-react";
import { useNewsletter } from "@/hooks/useNewsletter";
import { supabase } from "@/integrations/supabase/client";

// Fallback blog images
import aiComplianceImg from "@/assets/blog/ai-compliance.jpeg";
import aiWellnessDataImg from "@/assets/blog/ai-wellness-data.webp";
import aiPersonalisationImg from "@/assets/blog/ai-personalisation.jpeg";

const categories = ["All", "AI Agents", "Wellness", "Data"];

// Fallback image mapping for posts without images
const fallbackImages: Record<string, string> = {
  "AI Agents": aiComplianceImg,
  "Data": aiWellnessDataImg,
  "Wellness": aiPersonalisationImg,
};

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  created_at: string;
  read_time: string | null;
  featured: boolean;
  image_url: string | null;
}

const Insights = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { email, setEmail, isSubmitting, subscribe } = useNewsletter();

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, category, created_at, read_time, featured, image_url")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setPosts(data);
      }
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const filteredPosts = activeCategory === "All" 
    ? posts 
    : posts.filter(post => post.category === activeCategory);

  const featuredPost = posts.find(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured || activeCategory !== "All");

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  const getImage = (post: BlogPost) => post.image_url || fallbackImages[post.category] || aiComplianceImg;

  return (
    <div className="min-h-screen bg-background dark">
      <Helmet>
        <title>AI & Wellness Insights | Wellness Genius Blog</title>
        <meta name="description" content="Practical thinking on AI, automation, and growth in wellness. Honest perspectives on AI deployment, wellness tech, and building things that actually ship." />
        <meta name="keywords" content="AI wellness, wellness technology, fitness AI, health tech insights, AI automation, wellness industry trends, AI agents, data analytics wellness, personalisation, wellness operators, gym technology, fitness innovation, wellness business, AI deployment" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.wellnessgenius.co.uk/insights" />
        <meta property="og:title" content="AI & Wellness Insights | Wellness Genius" />
        <meta property="og:description" content="Practical thinking on AI, automation, and growth in wellness. No fluff—just honest perspectives on what's working in AI deployment and wellness tech." />
        <meta property="og:image" content="https://www.wellnessgenius.co.uk/images/wellness-genius-news-og.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Wellness Genius" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.wellnessgenius.co.uk/insights" />
        <meta name="twitter:title" content="AI & Wellness Insights | Wellness Genius" />
        <meta name="twitter:description" content="Practical thinking on AI, automation, and growth in wellness. No fluff—just honest perspectives." />
        <meta name="twitter:image" content="https://www.wellnessgenius.co.uk/images/wellness-genius-news-og.png" />
      </Helmet>
      <Header />
      
      <main className="pt-24 lg:pt-32">
        {/* Hero Section */}
        <section className="section-padding pb-12">
          <div className="container-wide">
            <PageBreadcrumb items={[{ label: "Insights" }]} />
            <div className="max-w-3xl animate-fade-up">
              <span className="badge-tech mb-6">Insights & Ideas</span>
              <h1 className="mb-6">
                Practical thinking on AI, automation, and growth
              </h1>
              <p className="text-lg text-muted-foreground">
                No fluff. Just honest perspectives on what's working in AI deployment, 
                wellness tech, and building things that actually ship.
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

        {/* Featured Post */}
        {activeCategory === "All" && featuredPost && (
          <section className="px-6 lg:px-12 pb-16">
            <div className="container-wide">
              <Link to={`/insights/${featuredPost.slug}`} className="card-tech p-8 lg:p-12 block group hover:border-accent/30 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium mb-4">
                      Featured
                    </span>
                    <h2 className="text-2xl lg:text-3xl mb-4 group-hover:text-accent transition-colors">{featuredPost.title}</h2>
                    <p className="text-muted-foreground mb-6">{featuredPost.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {formatDate(featuredPost.created_at)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {featuredPost.read_time || "5 min read"}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-2 text-accent font-medium">
                      Read Article
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                  <div className="lg:w-80 h-48 lg:h-64 rounded-xl overflow-hidden">
                    <img 
                      src={getImage(featuredPost)} 
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* Posts Grid */}
        <section className="px-6 lg:px-12 pb-20">
          <div className="container-wide">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading posts...</div>
            ) : regularPosts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No posts found.</div>
            ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularPosts.map((post, index) => (
                <Link 
                  to={`/insights/${post.slug}`}
                  key={post.id} 
                  className="card-tech p-0 flex flex-col animate-fade-up group hover:border-accent/30 transition-colors overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="h-40 overflow-hidden">
                    <img 
                      src={getImage(post)} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <span className="inline-block px-3 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-medium mb-4 w-fit">
                      {post.category}
                    </span>
                    <h3 className="text-lg font-semibold mb-3 line-clamp-2 group-hover:text-accent transition-colors">{post.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 flex-1 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        {formatDate(post.created_at)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={12} />
                        {post.read_time || "5 min read"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            )}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="px-6 lg:px-12 pb-20">
          <div className="container-narrow">
            <div className="card-glass p-8 lg:p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 text-accent mb-6">
                <Mail size={24} />
              </div>
              <h2 className="text-2xl lg:text-3xl mb-4">Get insights in your inbox</h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                One email per week. Practical AI insights, no hype. Unsubscribe anytime.
              </p>
              <form 
                onSubmit={(e) => subscribe(e, "insights-page")}
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

export default Insights;
