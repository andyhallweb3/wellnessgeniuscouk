import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PageBreadcrumb from "@/components/PageBreadcrumb";
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
  Package,
  Loader2,
  Phone,
  Bot,
  Crown
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EmailGateModal from "@/components/EmailGateModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  generatePromptPack, 
  generateRevenueFramework, 
  generateBuildVsBuy,
  generateActivationPlaybook,
  generateEngagementPlaybook,
  generateGamificationPlaybook
} from "@/lib/pdf-generators";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  type: "free" | "paid" | "premium" | "bundle" | "subscription";
  icon: React.ReactNode;
  features: string[];
  cta: string;
  link: string;
  badge?: string;
  isDownload?: boolean;
  isStripeProduct?: boolean;
  isSubscription?: boolean;
  upsellText?: string;
  upsellProduct?: string;
  priceSubtext?: string;
}

const products: Product[] = [
  // Free Products
  {
    id: "reality-checklist",
    name: "90-Day AI Reality Checklist",
    description: "Structured one-page checklist built on the C.L.E.A.R planning engine. Pin it to your wall, run it with your team.",
    price: "Free",
    type: "free",
    icon: <CheckCircle size={24} />,
    features: [
      "Entry point for AI planning",
      "C.L.E.A.R validation criteria",
      "Email-gated for download",
    ],
    cta: "Download PDF",
    link: "/downloads/90-day-ai-checklist.pdf",
    isDownload: true,
    badge: "Start Here",
    upsellText: "Get scored insights: AI Readiness Quick Check →",
    upsellProduct: "quick-check-lite",
  },
  {
    id: "myths-deck",
    name: "The Wellness AI Myths Deck",
    description: "10 evidence-based slides using the C.L.E.A.R framework to cut through AI hype. Essential reading for exec teams and innovation leads.",
    price: "Free",
    type: "free",
    icon: <FileText size={24} />,
    features: [
      "Board/shareable asset",
      "Positions you as 'adult in the room'",
      "C.L.E.A.R framework introduction",
    ],
    cta: "Download PDF",
    link: "/downloads/ai-myths-deck.pdf",
    isDownload: true,
    badge: "C.L.E.A.R Framework",
    upsellText: "Get your full score: AI Readiness Score →",
    upsellProduct: "readiness-score",
  },
  // Entry Paid Products
  {
    id: "quick-check-lite",
    name: "AI Readiness Quick Check (Lite+)",
    description: "Scored version of the checklist with short written diagnosis. No revenue modelling, no templates – just clarity.",
    price: "£9.99",
    type: "paid",
    icon: <BarChart3 size={24} />,
    features: [
      "10 diagnostic questions",
      "Scored assessment",
      "Short written diagnosis",
      "Almost frictionless entry",
    ],
    cta: "Buy Now",
    link: "#quick-check-lite",
    isStripeProduct: true,
    badge: "Entry Point",
    upsellText: "Get the full commercial assessment →",
    upsellProduct: "readiness-score",
  },
  {
    id: "prompt-pack",
    name: "Wellness AI Prompt Pack – Operator Edition",
    description: "System prompts, decision prompts, data schemas, and build brief templates. Cheap enough to buy without approval.",
    price: "£19.99",
    type: "paid",
    icon: <Zap size={24} />,
    features: [
      "System prompts library",
      "Decision prompt templates",
      "Production-ready data schemas",
      "AI Build Brief Generator",
    ],
    cta: "Buy Now",
    link: "#prompt-pack",
    isStripeProduct: true,
    upsellText: "Get the full assessment: AI Readiness Score →",
    upsellProduct: "readiness-score",
  },
  // Core Paid Products
  {
    id: "readiness-score",
    name: "AI Readiness Score – Commercial Edition",
    description: "Decision-grade diagnostic with revenue upside ranges, operator benchmarks, and 90-day priorities. Feels underpriced for value.",
    price: "£39.99",
    type: "paid",
    icon: <Sparkles size={24} />,
    features: [
      "Full score & band assessment",
      "Revenue upside ranges",
      "Operator benchmarks",
      "90-day prioritised fix plan",
      "Editable templates",
    ],
    cta: "Get Your Score",
    link: "/ai-readiness/start",
    badge: "Flagship",
  },
  {
    id: "gamification-playbook",
    name: "Gamification, Rewards & Incentives Playbook",
    description: "Evidence-led operating system for gamification, rewards, and hyper-personalisation. Comparable to a workshop in PDF form.",
    price: "£39.99",
    type: "paid",
    icon: <Zap size={24} />,
    features: [
      "6-layer operator model",
      "Reward economics framework",
      "Hyper-personalisation ladder",
      "Compliance guardrails",
      "8 plug-and-play templates (A–H)",
    ],
    cta: "Buy Now",
    link: "#gamification-playbook",
    isStripeProduct: true,
    badge: "Operational IP",
  },
  {
    id: "engagement-playbook",
    name: "Wellness Engagement Systems Playbook",
    description: "Habit→outcome mapping, intervention ladder, segment playbooks, and KPI canon. Extremely practical add-on purchase.",
    price: "£29.99",
    type: "paid",
    icon: <BarChart3 size={24} />,
    features: [
      "Habit → Outcome mapping framework",
      "6-rung intervention ladder (margin-safe)",
      "Ready-to-use IF/THEN journey blueprints",
      "Engagement KPI canon by vertical",
      "Editable intervention register",
    ],
    cta: "Buy Now",
    link: "#engagement-playbook",
    isStripeProduct: true,
    upsellText: "Go deeper: Gamification & Rewards Playbook →",
    upsellProduct: "gamification-playbook",
  },
  // Execution / Advanced
  {
    id: "activation-playbook",
    name: "90-Day AI Activation Playbook – Execution Edition",
    description: "Weekly sprint templates, board-ready reporting, kill lists, and execution artefacts. Signals seriousness.",
    price: "£49.99",
    type: "paid",
    icon: <BookOpen size={24} />,
    features: [
      "Weekly sprint template (copy/paste)",
      "Board update slide (single page)",
      "Month-by-month execution plan",
      "Red-flag register for failure patterns",
      "\"Do Not Proceed If\" kill list",
    ],
    cta: "Buy Now",
    link: "#activation-playbook",
    isStripeProduct: true,
    badge: "Execution",
  },
];

const bundles: Product[] = [
  {
    id: "operator-bundle",
    name: "Wellness AI Operator Bundle",
    description: "AI Readiness Score + Engagement Systems Playbook + Prompt Pack. Obvious value, moves users into ecosystem fast.",
    price: "£79.99",
    originalPrice: "£89.97",
    type: "bundle",
    icon: <Package size={24} />,
    features: [
      "AI Readiness Score (£39.99)",
      "Engagement Systems Playbook (£29.99)",
      "Prompt Pack (£19.99)",
      "Save £9.98",
    ],
    cta: "Buy Bundle",
    link: "#operator-bundle",
    badge: "Best Value",
    isStripeProduct: true,
  },
  {
    id: "gamification-bundle",
    name: "Gamification & Personalisation Bundle",
    description: "Engagement Systems + Gamification Playbooks. Perfect for operators focused on member engagement.",
    price: "£69.99",
    originalPrice: "£69.98",
    type: "bundle",
    icon: <Package size={24} />,
    features: [
      "Engagement Systems Playbook (£29.99)",
      "Gamification & Rewards Playbook (£39.99)",
      "Bundle pricing",
    ],
    cta: "Buy Bundle",
    link: "#gamification-bundle",
    isStripeProduct: true,
  },
  {
    id: "execution-bundle",
    name: "Execution Bundle",
    description: "AI Readiness Score + 90-Day Activation Playbook + Gamification Playbook. For teams ready to execute.",
    price: "£89.99",
    originalPrice: "£129.97",
    type: "bundle",
    icon: <Package size={24} />,
    features: [
      "AI Readiness Score (£39.99)",
      "90-Day Activation Playbook (£49.99)",
      "Gamification Playbook (£39.99)",
      "Save £39.98",
    ],
    cta: "Buy Bundle",
    link: "#execution-bundle",
    badge: "Premium",
    isStripeProduct: true,
  },
];

// AI Coach Subscription Tiers
const subscriptions: Product[] = [
  {
    id: "ai-coach-pro",
    name: "AI Coach Pro",
    description: "40 credits/month. Diagnostic, Decision & Commercial modes. Access to all paid templates (read-only).",
    price: "£19.99",
    priceSubtext: "/month",
    type: "subscription",
    icon: <Bot size={24} />,
    features: [
      "40 credits per month",
      "Diagnostic mode",
      "Decision mode",
      "Commercial mode",
      "Access to all templates",
    ],
    cta: "Subscribe",
    link: "#ai-coach-pro",
    isSubscription: true,
    badge: "Most Popular",
    upsellText: "Need more credits? Upgrade to Expert →",
    upsellProduct: "ai-coach-expert",
  },
  {
    id: "ai-coach-expert",
    name: "AI Coach Expert",
    description: "120 credits/month. All modes unlocked, saved insights, re-runs & comparisons, full downloads library included.",
    price: "£39.99",
    priceSubtext: "/month",
    type: "subscription",
    icon: <Crown size={24} />,
    features: [
      "120 credits per month",
      "All modes unlocked",
      "Saved insights & history",
      "Re-runs & comparisons",
      "Full downloads library included",
    ],
    cta: "Subscribe",
    link: "#ai-coach-expert",
    isSubscription: true,
    badge: "Premium",
  },
];

// Bundle to product mapping for downloads
const BUNDLE_PRODUCTS: Record<string, string[]> = {
  "operator-bundle": ["prompt-pack", "engagement-playbook"],
  "gamification-bundle": ["engagement-playbook", "gamification-playbook"],
  "execution-bundle": ["activation-playbook", "gamification-playbook"],
};

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
    case "subscription":
      return "border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-accent/10";
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
    case "subscription":
      return "bg-purple-500/10 text-purple-600";
    default:
      return "bg-secondary text-muted-foreground";
  }
};

const ProductCard = ({ 
  product, 
  onDownloadClick,
  onBuyClick,
  isProcessing,
  allProducts
}: { 
  product: Product; 
  onDownloadClick?: (product: Product) => void;
  onBuyClick?: (product: Product) => void;
  isProcessing?: string | null;
  allProducts?: Product[];
}) => {
  const isInternal = product.link.startsWith("/") && !product.isDownload && !product.isStripeProduct && !product.isSubscription;
  const isDownload = product.isDownload;
  const isStripe = product.isStripeProduct;
  const isSubscription = product.isSubscription;
  const isLoading = isProcessing === product.id;
  
  const upsellProduct = product.upsellProduct && allProducts 
    ? allProducts.find(p => p.id === product.upsellProduct)
    : null;
  
  const handleClick = () => {
    if (isDownload && onDownloadClick) {
      onDownloadClick(product);
    } else if ((isStripe || isSubscription) && onBuyClick) {
      onBuyClick(product);
    }
  };

  const handleUpsellClick = () => {
    if (upsellProduct && onBuyClick) {
      onBuyClick(upsellProduct);
    }
  };
  
  return (
    <div className={`rounded-xl border p-6 ${getTypeStyles(product.type)} relative flex flex-col h-full`}>
      {product.badge && (
        <span className={`absolute -top-3 left-4 px-3 py-1 rounded-full text-xs font-medium ${
          product.badge === "C.L.E.A.R Framework" 
            ? "bg-purple-500/20 text-purple-600 border border-purple-500/30" 
            : "bg-accent text-accent-foreground"
        }`}>
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
          {product.priceSubtext && (
            <span className="text-sm text-muted-foreground">{product.priceSubtext}</span>
          )}
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

      {/* Upsell teaser for free products */}
      {product.upsellText && upsellProduct && (
        <button
          onClick={handleUpsellClick}
          className="mb-4 p-3 rounded-lg bg-accent/5 border border-accent/20 text-left hover:bg-accent/10 transition-colors group"
        >
          <p className="text-xs text-accent font-medium group-hover:underline">
            {product.upsellText}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {upsellProduct.price} • Full C.L.E.A.R framework
          </p>
        </button>
      )}
      
      <div className="space-y-3 mt-auto">
        {isDownload ? (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleClick}
          >
            <Download size={16} />
            {product.cta}
          </Button>
        ) : isStripe || isSubscription ? (
          <>
            <Button 
              variant="accent" 
              className="w-full" 
              onClick={handleClick}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {isSubscription ? <Bot size={16} /> : <ArrowRight size={16} />}
                  {product.cta}
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              className="w-full text-xs" 
              asChild
            >
              <a href="https://calendly.com/andy-wellnessgenius/30min" target="_blank" rel="noopener noreferrer">
                <Phone size={14} />
                Book a Call with Andy
              </a>
            </Button>
          </>
        ) : isInternal ? (
          <>
            <Button variant={product.type === "free" ? "outline" : "accent"} className="w-full" asChild>
              <Link to={product.link}>
                {product.type === "free" ? <Download size={16} /> : <ArrowRight size={16} />}
                {product.cta}
              </Link>
            </Button>
            {product.type !== "free" && (
              <Button 
                variant="outline" 
                className="w-full text-xs" 
                asChild
              >
                <a href="https://calendly.com/andy-wellnessgenius/30min" target="_blank" rel="noopener noreferrer">
                  <Phone size={14} />
                  Book a Call with Andy
                </a>
              </Button>
            )}
          </>
        ) : (
          <Button variant={product.type === "free" ? "outline" : "accent"} className="w-full" disabled>
            {product.type === "free" ? <Download size={16} /> : <ArrowRight size={16} />}
            {product.cta}
            <span className="ml-1 text-xs opacity-60">(Coming Soon)</span>
          </Button>
        )}
      </div>
    </div>
  );
};

const Products = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [emailGateModal, setEmailGateModal] = useState<{
    isOpen: boolean;
    product: Product | null;
  }>({ isOpen: false, product: null });
  const [processingProductId, setProcessingProductId] = useState<string | null>(null);

  const freeProducts = products.filter(p => p.type === "free");
  const paidProducts = products.filter(p => p.type === "paid");

  // Helper function to track downloads for logged-in users
  const trackPaidDownload = async (productId: string, productName: string) => {
    if (!user?.email) return;
    
    try {
      await supabase.from("product_downloads").insert({
        email: user.email,
        name: user.user_metadata?.full_name || null,
        product_id: productId,
        product_name: productName,
        download_type: "paid",
        product_type: "paid",
      });
    } catch (err) {
      console.error("[Download Tracking] Error:", err);
    }
  };

  // Handle payment success/cancel from URL params
  useEffect(() => {
    const payment = searchParams.get("payment");
    const productId = searchParams.get("product");
    
    if (payment === "success") {
      toast.success("Payment successful! Your PDF(s) are downloading and will also be emailed to you.");
      
      // Helper function to generate and download a PDF
      const downloadPdf = async (id: string, productName?: string) => {
        try {
          let doc;
          let filename = "wellness-genius-download.pdf";
          let name = productName || id;
          
          switch (id) {
            case "prompt-pack":
              doc = generatePromptPack();
              filename = "wellness-ai-prompt-pack.pdf";
              name = "AI Prompt Pack";
              break;
            case "revenue-framework":
              doc = generateRevenueFramework();
              filename = "engagement-revenue-framework.pdf";
              name = "Engagement Revenue Framework";
              break;
            case "build-vs-buy":
              doc = generateBuildVsBuy();
              filename = "build-vs-buy-guide.pdf";
              name = "Build vs Buy Guide";
              break;
            case "activation-playbook":
              doc = generateActivationPlaybook();
              filename = "90-day-activation-playbook.pdf";
              name = "90-Day Activation Playbook";
              break;
            case "engagement-playbook":
              doc = generateEngagementPlaybook();
              filename = "wellness-engagement-systems-playbook.pdf";
              name = "Engagement Systems Playbook";
              break;
            case "gamification-playbook":
              doc = generateGamificationPlaybook();
              filename = "gamification-rewards-incentives-playbook.pdf";
              name = "Gamification Playbook";
              break;
          }
          
          if (doc) {
            doc.save(filename);
            // Track the paid download
            await trackPaidDownload(id, name);
          }
        } catch (error) {
          console.error(`Failed to generate PDF for ${id}:`, error);
        }
      };
      
      // Trigger immediate download based on product
      if (productId) {
        // Check if it's a bundle
        const bundleProducts = BUNDLE_PRODUCTS[productId];
        if (bundleProducts) {
          // Download all products in the bundle with a small delay between each
          bundleProducts.forEach((id, index) => {
            setTimeout(() => downloadPdf(id), index * 500);
          });
        } else {
          // Single product download
          downloadPdf(productId);
        }
      }
    } else if (payment === "cancelled") {
      toast.info("Payment was cancelled.");
    }
  }, [searchParams, user]);

  const handleDownloadClick = (product: Product) => {
    setEmailGateModal({ isOpen: true, product });
  };

  const handleCloseModal = () => {
    setEmailGateModal({ isOpen: false, product: null });
  };

  const handleBuyClick = async (product: Product) => {
    setProcessingProductId(product.id);

    try {
      // Handle subscription products differently
      if (product.isSubscription) {
        const { data, error } = await supabase.functions.invoke("create-coach-subscription", {
          body: { tier: product.id },
        });

        if (error) throw error;

        if (data?.url) {
          window.open(data.url, "_blank");
        } else {
          throw new Error("No checkout URL returned");
        }
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-product-checkout", {
        body: { productId: product.id },
      });

      if (error) throw error;

      // Check if user has free access via subscription
      if (data?.free_access) {
        toast.success("This product is included with your AI Coach subscription!");
        
        // Trigger immediate download
        try {
          let doc;
          let filename = "wellness-genius-download.pdf";
          
          switch (product.id) {
            case "prompt-pack":
              doc = generatePromptPack();
              filename = "wellness-ai-prompt-pack.pdf";
              break;
            case "revenue-framework":
              doc = generateRevenueFramework();
              filename = "engagement-revenue-framework.pdf";
              break;
            case "build-vs-buy":
              doc = generateBuildVsBuy();
              filename = "build-vs-buy-guide.pdf";
              break;
            case "activation-playbook":
              doc = generateActivationPlaybook();
              filename = "90-day-activation-playbook.pdf";
              break;
            case "engagement-playbook":
              doc = generateEngagementPlaybook();
              filename = "wellness-engagement-systems-playbook.pdf";
              break;
            case "gamification-playbook":
              doc = generateGamificationPlaybook();
              filename = "gamification-rewards-incentives-playbook.pdf";
              break;
          }
          
          if (doc) {
            doc.save(filename);
          }
        } catch (pdfError) {
          console.error("Failed to generate PDF:", pdfError);
        }
        return;
      }

      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: unknown) {
      console.error("Checkout error:", error);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setProcessingProductId(null);
    }
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
          <PageBreadcrumb items={[{ label: "Products" }]} />
          
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-heading mb-4">
              Products & Downloads
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Practical intelligence for wellness leaders who need clarity, not hype.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/bundles" 
                className="inline-flex items-center gap-2 text-accent hover:underline font-medium"
              >
                <Package size={18} />
                View bundle deals →
              </Link>
              <Link 
                to="/how-to-use" 
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium"
              >
                <BookOpen size={18} />
                How to use the stack
              </Link>
            </div>
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
                  onBuyClick={handleBuyClick}
                  allProducts={products}
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
                <h2 className="text-2xl font-heading">Diagnostic Tools & Playbooks</h2>
                <p className="text-sm text-muted-foreground">Decision-grade insights and execution artefacts for serious operators.</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {paidProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onBuyClick={handleBuyClick}
                  isProcessing={processingProductId}
                />
              ))}
            </div>
          </section>

          {/* Bundles */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Package size={20} className="text-amber-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-heading">Bundles</h2>
                  <p className="text-sm text-muted-foreground">Save when you buy together.</p>
                </div>
              </div>
              <Link 
                to="/bundles" 
                className="text-sm text-accent hover:underline flex items-center gap-1"
              >
                Compare bundles
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {bundles.map(bundle => (
                <ProductCard 
                  key={bundle.id} 
                  product={bundle} 
                  onBuyClick={handleBuyClick}
                  isProcessing={processingProductId}
                />
              ))}
            </div>
          </section>

          {/* AI Coach Subscriptions */}
          <section className="mt-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Bot size={20} className="text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-heading">AI Coach</h2>
                <p className="text-sm text-muted-foreground">Your AI-powered strategic advisor for wellness operations.</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
              {subscriptions.map(subscription => (
                <ProductCard 
                  key={subscription.id} 
                  product={subscription} 
                  onBuyClick={handleBuyClick}
                  isProcessing={processingProductId}
                  allProducts={subscriptions}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Cancel anytime. Billed monthly. Existing members can manage subscriptions from the Member Hub.
            </p>
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