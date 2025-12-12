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
    title: "Why Most AI Projects Fail Before They Start",
    excerpt: "The hidden blockers that kill AI initiatives—and how to spot them in your organisation before you waste budget.",
    category: "AI Agents",
    date: "Dec 10, 2024",
    readTime: "5 min read",
    featured: true,
  },
  {
    id: 2,
    title: "The AI Readiness Gap in Wellness & Fitness",
    excerpt: "Most wellness brands are sitting on goldmines of data they're not using. Here's what separates the leaders from the laggards.",
    category: "Wellness",
    date: "Dec 5, 2024",
    readTime: "4 min read",
    featured: false,
  },
  {
    id: 3,
    title: "Building Your First AI Agent: A Practical Guide",
    excerpt: "Skip the hype. Here's what actually works when deploying task-specific AI agents in service businesses.",
    category: "AI Agents",
    date: "Nov 28, 2024",
    readTime: "7 min read",
    featured: false,
  },
  {
    id: 4,
    title: "Data Strategy for Non-Technical Leaders",
    excerpt: "You don't need to understand SQL to make smart data decisions. Focus on these five questions instead.",
    category: "Data",
    date: "Nov 20, 2024",
    readTime: "6 min read",
    featured: false,
  },
  {
    id: 5,
    title: "Partnership Models That Actually Scale",
    excerpt: "Revenue share, white-label, or equity? A framework for choosing the right partnership structure.",
    category: "Partnerships",
    date: "Nov 15, 2024",
    readTime: "5 min read",
    featured: false,
  },
  {
    id: 6,
    title: "Go-To-Market for AI Products in 2024",
    excerpt: "The playbook has changed. Traditional SaaS GTM doesn't work for AI. Here's what does.",
    category: "GTM",
    date: "Nov 8, 2024",
    readTime: "8 min read",
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
              <div className="card-tech p-8 lg:p-12">
                <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium mb-4">
                      Featured
                    </span>
                    <h2 className="text-2xl lg:text-3xl mb-4">{featuredPost.title}</h2>
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
                    <Button variant="accent" className="group">
                      Read Article
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                  <div className="lg:w-80 h-48 lg:h-64 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                    <span className="text-accent/50 text-sm">Coming Soon</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Posts Grid */}
        <section className="px-6 lg:px-12 pb-20">
          <div className="container-wide">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularPosts.map((post, index) => (
                <article 
                  key={post.id} 
                  className="card-tech p-6 flex flex-col animate-fade-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="inline-block px-3 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-medium mb-4 w-fit">
                    {post.category}
                  </span>
                  <h3 className="text-lg font-semibold mb-3 line-clamp-2">{post.title}</h3>
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
                </article>
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
