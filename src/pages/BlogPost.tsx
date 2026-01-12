import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { normalizeHtmlString, toPlainText } from "@/lib/html";

// Fallback blog images
import aiComplianceImg from "@/assets/blog/ai-compliance.jpeg";
import aiWellnessDataImg from "@/assets/blog/ai-wellness-data.webp";
import aiPersonalisationImg from "@/assets/blog/ai-personalisation.jpeg";

const fallbackImages: Record<string, string> = {
  AI: aiComplianceImg,
  "AI Agents": aiComplianceImg,
  Data: aiWellnessDataImg,
  Wellness: aiPersonalisationImg,
  Technology: aiComplianceImg,
  Industry: aiWellnessDataImg,
  Strategy: aiPersonalisationImg,
};

interface BlogPostData {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  created_at: string;
  read_time: string | null;
  image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  keywords: string[] | null;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchPost = async () => {
      try {
        if (!slug) {
          if (!isMounted) return;
          setNotFound(true);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("slug", slug)
          .eq("published", true)
          .maybeSingle();

        if (!isMounted) return;

        if (error || !data) {
          console.error("Error fetching blog post:", error);
          setNotFound(true);
          setLoading(false);
          return;
        }

        setPost(data);

        // Fetch related posts
        const { data: related, error: relatedError } = await supabase
          .from("blog_posts")
          .select("id, slug, title, excerpt, category, created_at, read_time, image_url")
          .eq("published", true)
          .neq("id", data.id)
          .order("created_at", { ascending: false })
          .limit(2);

        if (relatedError) {
          console.warn("Error fetching related posts:", relatedError);
        }

        if (related) {
          setRelatedPosts(related as BlogPostData[]);
        }
      } catch (err) {
        console.error("Unexpected error fetching blog post:", err);
        if (!isMounted) return;
        setNotFound(true);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    fetchPost();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Update document metadata
  useEffect(() => {
    if (post) {
      document.title = post.meta_title || `${post.title} | Wellness Genius`;
    }
  }, [post]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getImage = (postData: BlogPostData) => 
    postData.image_url || fallbackImages[postData.category] || aiComplianceImg;

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-background dark">
        <Header />
        <main className="pt-32 pb-20 px-6 lg:px-12">
          <div className="container-narrow text-center">
            <h1 className="text-3xl font-heading mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Button variant="outline" asChild>
              <Link to="/insights">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Insights
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark">
      <Helmet>
        <title>{post.meta_title || `${post.title} | Wellness Genius`}</title>
        <meta name="description" content={post.meta_description || toPlainText(post.excerpt)} />
        {post.keywords && post.keywords.length > 0 && (
          <meta name="keywords" content={post.keywords.join(", ")} />
        )}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://www.wellnessgenius.co.uk/insights/${post.slug}`} />
        <meta property="og:title" content={post.meta_title || post.title} />
        <meta property="og:description" content={post.meta_description || toPlainText(post.excerpt)} />
        <meta property="og:image" content={getImage(post)} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.meta_title || post.title} />
        <meta name="twitter:description" content={post.meta_description || toPlainText(post.excerpt)} />
        <meta name="twitter:image" content={getImage(post)} />
      </Helmet>

      <Header />

      <main className="pt-24 lg:pt-32">
        {/* Back Navigation */}
        <section className="px-6 lg:px-12 pb-8">
          <div className="container-narrow">
            <Link 
              to="/insights" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Insights
            </Link>
          </div>
        </section>

        {/* Article */}
        <article className="px-6 lg:px-12 pb-20">
          <div className="container-narrow">
            {/* Header */}
            <header className="mb-12 animate-fade-up">
              <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium mb-4">
                {post.category}
              </span>
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-heading mb-6 leading-tight">
                {post.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {formatDate(post.created_at)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {post.read_time || "5 min read"}
                </span>
              </div>
            </header>

            {/* Featured Image */}
            <div className="mb-12 rounded-2xl overflow-hidden animate-fade-up" style={{ animationDelay: "50ms" }}>
              <img 
                src={getImage(post)} 
                alt={post.title}
                className="w-full h-64 lg:h-96 object-cover"
              />
            </div>

            {/* Content - Render HTML */}
            <div 
              className="prose prose-invert prose-lg max-w-none animate-fade-up
                prose-headings:font-heading prose-headings:text-foreground
                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
                prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground prose-strong:font-semibold
                prose-ul:my-6 prose-ul:space-y-2
                prose-li:text-muted-foreground
                prose-blockquote:border-l-accent prose-blockquote:bg-secondary/50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg
                prose-code:bg-secondary prose-code:px-2 prose-code:py-1 prose-code:rounded
                prose-img:rounded-xl"
              style={{ animationDelay: "100ms" }}
              dangerouslySetInnerHTML={{ __html: normalizeHtmlString(post.content) }}
            />

            {/* CTA */}
            <div className="mt-16 p-8 card-glass text-center animate-fade-up" style={{ animationDelay: "200ms" }}>
              <p className="text-xl font-heading mb-6">
                Ready to explore how AI can transform your wellness business?
              </p>
              <Button variant="accent" size="lg" asChild>
                <a href="/#contact">
                  Book a Call
                  <ArrowRight size={16} className="ml-2" />
                </a>
              </Button>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="px-6 lg:px-12 pb-20">
            <div className="container-narrow">
              <h2 className="text-2xl font-heading mb-8">Continue Reading</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link 
                    key={relatedPost.id} 
                    to={`/insights/${relatedPost.slug}`}
                    className="card-tech p-6 group hover:border-accent/30 transition-colors"
                  >
                    <span className="inline-block px-3 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-medium mb-4">
                      {relatedPost.category}
                    </span>
                    <h3 className="text-lg font-semibold mb-3 group-hover:text-accent transition-colors">
                      {relatedPost.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">{relatedPost.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
