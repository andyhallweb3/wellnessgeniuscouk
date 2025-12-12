import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock, Mail } from "lucide-react";

const categories = ["All", "AI Agents", "Wellness", "Data", "Partnerships", "GTM"];

const posts = [
  {
    id: 1,
    slug: "ai-wellness-policy-compliance",
    title: "AI, Wellness & Policy: Why Compliance Is Now a Competitive Advantage",
    excerpt: "AI is moving faster than regulation — and that's exactly why wellness brands can't afford to ignore policy and compliance.",
    category: "AI Agents",
    date: "Dec 12, 2024",
    readTime: "6 min read",
    featured: true,
  },
  {
    id: 2,
    slug: "power-of-data-ai-wellness",
    title: "The Power of Data and AI in Wellness: From Noise to Insight",
    excerpt: "Most wellness businesses are sitting on data they don't understand, don't trust, and don't use. AI is what turns wellness data into decisions.",
    category: "Data",
    date: "Dec 8, 2024",
    readTime: "5 min read",
    featured: false,
  },
  {
    id: 3,
    slug: "ai-wellness-personalisation",
    title: "AI and Wellness Personalisation: From One-Size-Fits-All to One-to-One",
    excerpt: "Personalisation is no longer a 'nice to have' — it's the baseline expectation. AI is what makes that possible at scale.",
    category: "Wellness",
    date: "Dec 4, 2024",
    readTime: "5 min read",
    featured: false,
  },
];

const Insights = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredPosts = activeCategory === "All" 
    ? posts 
    : posts.filter(post => post.category === activeCategory);

  const featuredPost = posts.find(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured || activeCategory !== "All");

  return (
    <div className="min-h-screen bg-background dark">
      <Header />
      
      <main className="pt-24 lg:pt-32">
        {/* Hero Section */}
        <section className="section-padding pb-12">
          <div className="container-wide">
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
                        {featuredPost.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {featuredPost.readTime}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-2 text-accent font-medium">
                      Read Article
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                  <div className="lg:w-80 h-48 lg:h-64 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                    <span className="text-6xl">🤖</span>
                  </div>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* Posts Grid */}
        <section className="px-6 lg:px-12 pb-20">
          <div className="container-wide">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularPosts.map((post, index) => (
                <Link 
                  to={`/insights/${post.slug}`}
                  key={post.id} 
                  className="card-tech p-6 flex flex-col animate-fade-up group hover:border-accent/30 transition-colors"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="inline-block px-3 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-medium mb-4 w-fit">
                    {post.category}
                  </span>
                  <h3 className="text-lg font-semibold mb-3 line-clamp-2 group-hover:text-accent transition-colors">{post.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 flex-1 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} />
                      {post.readTime}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
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
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-3 rounded-full bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <Button variant="accent" type="submit">
                  Subscribe
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
