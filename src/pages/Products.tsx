import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Download, 
  CheckCircle, 
  Sparkles, 
  FileText, 
  BarChart3, 
  Zap,
  BookOpen,
  Users,
  Package
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EmailGateModal from "@/components/EmailGateModal";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  type: "free" | "paid" | "premium" | "bundle";
  icon: React.ReactNode;
  features: string[];
  cta: string;
  link: string;
  badge?: string;
  isDownload?: boolean;
}

const products: Product[] = [
  // Free Products
  {
    id: "quick-check",
    name: "AI Readiness Quick Check",
    description: "10-question self-assessment to identify where value is leaking in your wellness business.",
    price: "Free",
    type: "free",
    icon: <BarChart3 size={24} />,
    features: [
      "10 diagnostic questions",
      "2-minute completion",
      "Instant score and breakdown",
      "No maths, just clarity",
    ],
    cta: "Start Assessment",
    link: "/ai-readiness/start",
    badge: "Most Popular",
  },
  {
    id: "myths-deck",
    name: "The Wellness AI Myths Deck",
    description: "10 slides that cut through the noise. Essential reading for exec teams and innovation leads.",
    price: "Free",
    type: "free",
    icon: <FileText size={24} />,
    features: [
      "Why 'we need AI' is the wrong starting point",
      "Engagement ≠ insight",
      "Why most wellness data can't be monetised",
      "AI without governance increases risk",
    ],
    cta: "Download PDF",
    link: "/downloads/ai-myths-deck.pdf",
    isDownload: true,
  },
  {
    id: "reality-checklist",
    name: "90-Day AI Reality Checklist",
    description: "One-page practical checklist for busy operators. Pin it to your wall.",
    price: "Free",
    type: "free",
    icon: <CheckCircle size={24} />,
    features: [
      "Data foundations",
      "Engagement loops",
      "Monetisation clarity",
      "Trust & compliance",
    ],
    cta: "Download PDF",
    link: "/downloads/90-day-ai-checklist.pdf",
    isDownload: true,
  },
  // Paid Products
  {
    id: "readiness-score",
    name: "AI Readiness Score",
    description: "Complete diagnostic with conservative revenue projections, blockers, and your personalised 90-day action plan.",
    price: "£99",
    type: "paid",
    icon: <Sparkles size={24} />,
    features: [
      "Score (0-100) + maturity band",
      "Conservative revenue upside range",
      "Top 3 blockers identified",
      "90-day priority action plan",
      "Monetisation paths",
      "Downloadable PDF report",
    ],
    cta: "Get Your Score",
    link: "/ai-readiness/start",
    badge: "Flagship",
  },
  {
    id: "prompt-pack",
    name: "Wellness AI Builder – Prompt Pack",
    description: "Copy-ready prompt frameworks for founders, product leads, and consultants building AI into wellness.",
    price: "£49",
    type: "paid",
    icon: <Zap size={24} />,
    features: [
      "One-Sentence Purpose framework",
      "User × Decision Map",
      "Data Reality Check",
      "AI Use-Case Filter",
      "Monetisation First framework",
      "Governance Test",
    ],
    cta: "Buy Now",
    link: "#prompt-pack",
  },
  {
    id: "revenue-framework",
    name: "Engagement → Revenue Framework",
    description: "Translate engagement metrics into language your CFO will accept. Includes modelling template.",
    price: "£49",
    type: "paid",
    icon: <BarChart3 size={24} />,
    features: [
      "Engagement metrics that matter",
      "Mapping engagement to retention & LTV",
      "Language finance teams accept",
      "Conservative modelling spreadsheet",
    ],
    cta: "Buy Now",
    link: "#revenue-framework",
  },
  {
    id: "build-vs-buy",
    name: "Build vs Buy: AI in Wellness",
    description: "Decision guide for boards and execs. Build, no-code, partner, or wait?",
    price: "£29",
    type: "paid",
    icon: <BookOpen size={24} />,
    features: [
      "Build vs no-code vs partner decision tree",
      "Cost realism calculator",
      "Risk checklist",
      "When to wait (and why)",
    ],
    cta: "Buy Now",
    link: "#build-vs-buy",
  },
  // Premium Products
  {
    id: "activation-playbook",
    name: "90-Day AI Activation Playbook",
    description: "25-page structured playbook for 'Operational' businesses ready to accelerate.",
    price: "£149",
    type: "premium",
    icon: <BookOpen size={24} />,
    features: [
      "Month 1: Foundations & instrumentation",
      "Month 2: Engagement & journeys",
      "Month 3: Monetisation experiments",
      "What to do, what not to do",
      "Success criteria for each phase",
    ],
    cta: "Buy Now",
    link: "#playbook",
  },
  {
    id: "prompt-library",
    name: "Wellness AI Prompt Library",
    description: "Members-only access to new prompts monthly, sector-specific use cases, and what works (and what doesn't).",
    price: "£19/month",
    type: "premium",
    icon: <Users size={24} />,
    features: [
      "New prompts added monthly",
      "Sector-specific use cases",
      "Why this works / why it doesn't",
      "Member-only updates",
    ],
    cta: "Subscribe",
    link: "#membership",
  },
];

const bundles: Product[] = [
  {
    id: "toolkit-bundle",
    name: "AI Toolkit for Wellness Leaders",
    description: "Everything you need to evaluate, plan, and decide on AI. Three essential guides in one package.",
    price: "£99",
    originalPrice: "£127",
    type: "bundle",
    icon: <Package size={24} />,
    features: [
      "Wellness AI Builder – Prompt Pack (£49)",
      "Engagement → Revenue Framework (£49)",
      "Build vs Buy Guide (£29)",
      "Save £28",
    ],
    cta: "Buy Bundle",
    link: "#toolkit-bundle",
  },
  {
    id: "starter-pack",
    name: "Commercial AI Starter Pack",
    description: "Your diagnostic score plus the prompt pack to start building. Perfect for founders ready to act.",
    price: "£129",
    originalPrice: "£148",
    type: "bundle",
    icon: <Package size={24} />,
    features: [
      "AI Readiness Score (£99)",
      "Wellness AI Builder – Prompt Pack (£49)",
      "Save £19",
    ],
    cta: "Buy Bundle",
    link: "#starter-pack",
  },
];

const getTypeStyles = (type: Product["type"]) => {
  switch (type) {
    case "free":
      return "border-green-500/20 bg-green-500/5";
    case "paid":
      return "border-accent/20 bg-accent/5";
    case "premium":
      return "border-purple-500/20 bg-purple-500/5";
    case "bundle":
      return "border-amber-500/20 bg-amber-500/5";
    default:
      return "border-border bg-card";
  }
};

const getTypeBadge = (type: Product["type"]) => {
  switch (type) {
    case "free":
      return "bg-green-500/10 text-green-600";
    case "paid":
      return "bg-accent/10 text-accent";
    case "premium":
      return "bg-purple-500/10 text-purple-600";
    case "bundle":
      return "bg-amber-500/10 text-amber-600";
    default:
      return "bg-secondary text-muted-foreground";
  }
};

const ProductCard = ({ 
  product, 
  onDownloadClick 
}: { 
  product: Product; 
  onDownloadClick?: (product: Product) => void;
}) => {
  const isInternal = product.link.startsWith("/") && !product.isDownload;
  const isDownload = product.isDownload;
  
  const handleClick = () => {
    if (isDownload && onDownloadClick) {
      onDownloadClick(product);
    }
  };
  
  return (
    <div className={`rounded-xl border p-6 ${getTypeStyles(product.type)} relative flex flex-col h-full`}>
      {product.badge && (
        <span className="absolute -top-3 left-4 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium">
          {product.badge}
        </span>
      )}
      
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${getTypeBadge(product.type)}`}>
          {product.icon}
        </div>
        <div className="text-right">
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through mr-2">
              {product.originalPrice}
            </span>
          )}
          <span className="text-xl font-heading">{product.price}</span>
        </div>
      </div>
      
      <h3 className="text-lg font-heading mb-2">{product.name}</h3>
      <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
      
      <ul className="space-y-2 mb-6 flex-1">
        {product.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <CheckCircle size={14} className="text-accent mt-0.5 shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      
      {isDownload ? (
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleClick}
        >
          <Download size={16} />
          {product.cta}
        </Button>
      ) : isInternal ? (
        <Button variant={product.type === "free" ? "outline" : "accent"} className="w-full" asChild>
          <Link to={product.link}>
            {product.type === "free" ? <Download size={16} /> : <ArrowRight size={16} />}
            {product.cta}
          </Link>
        </Button>
      ) : (
        <Button variant={product.type === "free" ? "outline" : "accent"} className="w-full" disabled>
          {product.type === "free" ? <Download size={16} /> : <ArrowRight size={16} />}
          {product.cta}
          <span className="ml-1 text-xs opacity-60">(Coming Soon)</span>
        </Button>
      )}
    </div>
  );
};

const Products = () => {
  const [emailGateModal, setEmailGateModal] = useState<{
    isOpen: boolean;
    product: Product | null;
  }>({ isOpen: false, product: null });

  const freeProducts = products.filter(p => p.type === "free");
  const paidProducts = products.filter(p => p.type === "paid");
  const premiumProducts = products.filter(p => p.type === "premium");

  const handleDownloadClick = (product: Product) => {
    setEmailGateModal({ isOpen: true, product });
  };

  const handleCloseModal = () => {
    setEmailGateModal({ isOpen: false, product: null });
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Products | Wellness Genius</title>
        <meta 
          name="description" 
          content="Practical intelligence products for wellness leaders. Free assessments, diagnostic tools, and premium playbooks." 
        />
      </Helmet>
      
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container-wide section-padding">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-heading mb-4">
              Products & Downloads
            </h1>
            <p className="text-lg text-muted-foreground">
              Practical intelligence for wellness leaders who need clarity, not hype.
            </p>
          </div>

          {/* Free Products */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Download size={20} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-heading">Free Resources</h2>
                <p className="text-sm text-muted-foreground">Start here. Email required for PDFs.</p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {freeProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onDownloadClick={handleDownloadClick}
                />
              ))}
            </div>
          </section>

          {/* Paid Products */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-accent/10">
                <Sparkles size={20} className="text-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-heading">Diagnostic Tools</h2>
                <p className="text-sm text-muted-foreground">Decision-grade insights for serious operators.</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {paidProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

          {/* Premium Products */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <BookOpen size={20} className="text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-heading">Premium Resources</h2>
                <p className="text-sm text-muted-foreground">For teams ready to accelerate.</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {premiumProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

          {/* Bundles */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Package size={20} className="text-amber-600" />
              </div>
              <div>
                <h2 className="text-2xl font-heading">Bundles</h2>
                <p className="text-sm text-muted-foreground">Save when you buy together.</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {bundles.map(bundle => (
                <ProductCard key={bundle.id} product={bundle} />
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="mt-20 text-center">
            <div className="bg-card rounded-2xl p-8 md:p-12 border border-border max-w-2xl mx-auto">
              <h2 className="text-2xl font-heading mb-4">Not sure where to start?</h2>
              <p className="text-muted-foreground mb-6">
                Take the free AI Readiness Quick Check. It takes 2 minutes and shows you exactly where to focus.
              </p>
              <Button variant="accent" size="lg" asChild>
                <Link to="/ai-readiness/start">
                  Start Free Assessment
                  <ArrowRight size={16} />
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </main>

      <Footer />

      {/* Email Gate Modal */}
      {emailGateModal.product && (
        <EmailGateModal
          isOpen={emailGateModal.isOpen}
          onClose={handleCloseModal}
          productName={emailGateModal.product.name}
          productId={emailGateModal.product.id}
          downloadUrl={emailGateModal.product.link}
        />
      )}
    </div>
  );
};

export default Products;