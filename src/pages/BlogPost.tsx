import { useParams, Link, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, ArrowRight } from "lucide-react";

const blogPosts: Record<string, {
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  content: string[];
  cta: string;
}> = {
  "ai-wellness-policy-compliance": {
    title: "AI, Wellness & Policy: Why Compliance Is Now a Competitive Advantage",
    excerpt: "AI is moving faster than regulation — and that's exactly why wellness brands can't afford to ignore policy and compliance.",
    category: "AI Agents",
    date: "Dec 12, 2024",
    readTime: "6 min read",
    content: [
      "AI is moving faster than regulation — and that's exactly why wellness brands can't afford to ignore policy and compliance.",
      "In wellness, fitness, and health-adjacent industries, data isn't just valuable — it's sensitive. Movement, sleep, mental state, habits, location. That puts AI-powered wellness platforms directly in the regulatory crosshairs.",
      "But here's the truth most people miss: **compliance isn't a blocker to innovation — it's what enables scale.**",
      "## The Shifting Regulatory Landscape",
      "Across the UK, EU, and global markets, we're seeing clear signals:",
      "- **GDPR enforcement is tightening** — fines are increasing and scope is expanding",
      "- **The EU AI Act** introduces risk-based AI classification with real consequences",
      "- **Health and wellbeing data** is increasingly treated as quasi-medical",
      "- **Consent, explainability, and auditability** are no longer optional extras",
      "For wellness brands using AI agents, automation, or behavioural data, this fundamentally changes the game.",
      "## The Real Risk Isn't AI — It's Unmanaged AI",
      "Most compliance failures don't come from malicious intent. They come from:",
      "- Poor data governance and unclear ownership",
      "- Black-box automation with no audit trail",
      "- Over-collection of data \"just in case\"",
      "- No explanation for why AI made a specific decision",
      "AI that touches wellness must be **purpose-limited, transparent, explainable, and secure by design**. If you can't explain why an AI system made a recommendation or triggered an action, you're exposed.",
      "## Privacy-First AI Is the New Baseline",
      "Forward-thinking platforms are shifting to:",
      "- **Minimal data capture** — only what's genuinely needed",
      "- **On-device or edge processing** where possible",
      "- **Clear consent flows** tied to specific outcomes",
      "- **Human override and review loops** for critical decisions",
      "- **Role-based access and permissions** throughout the stack",
      "This isn't just good practice — it's how you win trust with partners, enterprise clients, and regulators.",
      "## Compliance as a Growth Lever",
      "Wellness brands that get this right unlock:",
      "- **Faster enterprise sales cycles** — compliance is often the blocker",
      "- **Easier international expansion** — one framework, multiple markets",
      "- **Stronger partnerships** with healthcare, hospitality, and employers",
      "- **Reduced legal and reputational risk** — insurance loves compliant systems",
      "- **Long-term defensibility** — trust scales faster than features",
      "## The Takeaway",
      "AI in wellness doesn't need less regulation — it needs better architecture. Build compliant systems from day one, and policy stops being a headache and starts becoming a moat."
    ],
    cta: "Need help building compliant AI systems? Let's talk."
  },
  "power-of-data-ai-wellness": {
    title: "The Power of Data and AI in Wellness: From Noise to Insight",
    excerpt: "Most wellness businesses are sitting on data they don't understand, don't trust, and don't use.",
    category: "Data",
    date: "Dec 8, 2024",
    readTime: "5 min read",
    content: [
      "Most wellness businesses are sitting on data they don't understand, don't trust, and don't use.",
      "Steps, sessions, bookings, drop-offs, engagement, churn, feedback, behaviour — the data exists. The problem is that without AI, it's just noise.",
      "**AI is what turns wellness data into decisions.**",
      "## Data Alone Doesn't Create Value",
      "Collecting data is easy. Creating insight is hard.",
      "Common issues we see across wellness, fitness, and hospitality:",
      "- Data spread across disconnected tools with no single source of truth",
      "- Reports that explain the past but don't guide action",
      "- Dashboards no one actually checks",
      "- Metrics without context or causality",
      "AI changes this by moving from reporting to reasoning.",
      "## What AI Actually Does Differently",
      "When applied properly, AI can:",
      "- **Identify behaviour patterns** humans consistently miss",
      "- **Predict churn** before it happens — not after",
      "- **Segment users dynamically** — not once a year in a spreadsheet",
      "- **Surface leading indicators**, not lagging ones",
      "- **Trigger actions automatically**, not manually",
      "Instead of asking: *\"What happened last month?\"*",
      "AI helps answer: *\"What's likely to happen next — and what should we do about it?\"*",
      "## From Raw Data to Operational Intelligence",
      "The most powerful wellness platforms use AI to connect:",
      "- **Behavioural data** — activity, engagement, habits",
      "- **Operational data** — bookings, attendance, utilisation",
      "- **Commercial data** — conversion, retention, revenue",
      "- **Contextual data** — time, location, lifecycle stage",
      "This creates a real-time feedback loop where insight drives action — automatically.",
      "## Why This Matters Commercially",
      "Data-driven AI enables:",
      "- **Higher retention** through early intervention",
      "- **Smarter pricing and packaging** based on actual behaviour",
      "- **More relevant communication** that doesn't feel spammy",
      "- **Reduced operational waste** across the business",
      "- **Better ROI** on content, coaching, and incentives",
      "In short: less guesswork, more precision.",
      "## The Takeaway",
      "The future of wellness isn't more data — it's better intelligence. AI is the layer that turns wellness platforms into decision engines, not just engagement tools."
    ],
    cta: "Want to turn your data into actionable intelligence? Book a call."
  },
  "ai-wellness-personalisation": {
    title: "AI and Wellness Personalisation: From One-Size-Fits-All to One-to-One",
    excerpt: "Personalisation is no longer a 'nice to have' — it's the baseline expectation.",
    category: "Wellness",
    date: "Dec 4, 2024",
    readTime: "5 min read",
    content: [
      "Personalisation is no longer a \"nice to have\" — it's the baseline expectation.",
      "In a world shaped by Spotify, Netflix, and Apple Fitness, users expect wellness experiences to adapt to them, not the other way around.",
      "**AI is what makes that possible at scale.**",
      "## Why Traditional Personalisation Fails",
      "Most \"personalised\" wellness experiences are still rule-based:",
      "- Static onboarding questions that never get updated",
      "- Broad segments that don't reflect individual behaviour",
      "- Manual tagging that can't keep pace",
      "- Generic journeys that feel like everyone else's",
      "This works for dozens of users — not thousands or millions.",
      "AI enables **living personalisation** that evolves in real time.",
      "## What AI-Powered Personalisation Actually Looks Like",
      "Modern AI systems can:",
      "- **Adjust recommendations** based on behaviour, not promises",
      "- **Learn from micro-interactions**, not just big milestones",
      "- **Adapt tone, timing, and format** of communication",
      "- **Personalise nudges, goals, and challenges** dynamically",
      "- **Balance automation with human input** where it matters",
      "The result is an experience that feels relevant, timely, supportive, and non-intrusive. And critically — useful.",
      "## Personalisation Without Creepiness",
      "The line between helpful and intrusive matters. Get it wrong and you lose trust permanently.",
      "The best AI-driven wellness platforms:",
      "- **Explain why** something is recommended",
      "- **Let users control** intensity and frequency",
      "- **Use anonymised patterns**, not invasive profiling",
      "- **Focus on behaviour support**, not behaviour surveillance",
      "Trust is the currency of personalisation.",
      "## The Business Impact",
      "Well-executed AI personalisation leads to:",
      "- **Higher engagement and stickiness** — users feel seen",
      "- **Longer customer lifetime value** — relationships, not transactions",
      "- **Reduced churn** — problems addressed before they escalate",
      "- **Better outcomes without more staff** — AI handles the scale",
      "- **Scalable coaching and support models** that actually work",
      "Personalisation isn't about doing more — it's about doing the right thing at the right moment.",
      "## The Takeaway",
      "AI allows wellness to move from programmes to partnerships — adaptive, responsive, and human-centred at scale."
    ],
    cta: "Ready to personalise at scale? Let's build it together."
  }
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  
  if (!slug || !blogPosts[slug]) {
    return <Navigate to="/insights" replace />;
  }

  const post = blogPosts[slug];
  const otherPosts = Object.entries(blogPosts)
    .filter(([key]) => key !== slug)
    .slice(0, 2);

  const renderContent = (content: string) => {
    if (content.startsWith("## ")) {
      return <h2 className="text-2xl font-heading mt-10 mb-4">{content.replace("## ", "")}</h2>;
    }
    if (content.startsWith("- ")) {
      return (
        <li className="text-muted-foreground ml-6 mb-2" dangerouslySetInnerHTML={{ 
          __html: content.replace("- ", "").replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') 
        }} />
      );
    }
    if (content.startsWith("*") && content.endsWith("*")) {
      return <p className="text-muted-foreground italic mb-4">{content.replace(/\*/g, "")}</p>;
    }
    return (
      <p 
        className="text-muted-foreground mb-4 leading-relaxed" 
        dangerouslySetInnerHTML={{ 
          __html: content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') 
        }} 
      />
    );
  };

  return (
    <div className="min-h-screen bg-background dark">
      <Header />
      
      <main className="pt-24 lg:pt-32">
        <article className="section-padding">
          <div className="container-narrow">
            {/* Back Link */}
            <Link 
              to="/insights" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft size={16} />
              Back to Insights
            </Link>

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
                  {post.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {post.readTime}
                </span>
              </div>
            </header>

            {/* Content */}
            <div className="prose-custom animate-fade-up" style={{ animationDelay: "100ms" }}>
              {post.content.map((paragraph, index) => (
                <div key={index}>{renderContent(paragraph)}</div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-16 p-8 card-glass text-center animate-fade-up" style={{ animationDelay: "200ms" }}>
              <p className="text-xl font-heading mb-6">{post.cta}</p>
              <Button variant="accent" size="lg" asChild>
                <a href="/#contact">
                  Book a Call
                  <ArrowRight size={16} />
                </a>
              </Button>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        <section className="px-6 lg:px-12 pb-20">
          <div className="container-narrow">
            <h2 className="text-2xl font-heading mb-8">Continue Reading</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {otherPosts.map(([postSlug, postData]) => (
                <Link 
                  key={postSlug} 
                  to={`/insights/${postSlug}`}
                  className="card-tech p-6 group hover:border-accent/30 transition-colors"
                >
                  <span className="inline-block px-3 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-medium mb-4">
                    {postData.category}
                  </span>
                  <h3 className="text-lg font-semibold mb-3 group-hover:text-accent transition-colors">
                    {postData.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">{postData.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
