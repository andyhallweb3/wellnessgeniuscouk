import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
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
  Package,
  Loader2
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EmailGateModal from "@/components/EmailGateModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  generatePromptPack, 
  generateRevenueFramework, 
  generateBuildVsBuy,
  generateActivationPlaybook,
  generateEngagementPlaybook
} from "@/lib/pdf-generators";

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
  isStripeProduct?: boolean;
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
    name: "AI Readiness Score – Commercial Edition",
    description: "Decision-grade diagnostic answering: Are we actually ready to use AI to drive commercial outcomes — or are we creating risk and waste?",
    price: "£99",
    type: "paid",
    icon: <Sparkles size={24} />,
    features: [
      "5-pillar readiness assessment",
      "Executive summary for boards",
      "Wellness Data Maturity Matrix",
      "Engagement → Revenue translation table",
      "90-day prioritised fix plan",
      "Re-runnable every quarter",
    ],
    cta: "Get Your Score",
    link: "/ai-readiness/start",
    badge: "Flagship",
  },
  {
    id: "prompt-pack",
    name: "Wellness AI Builder – Operator Edition",
    description: "Stop building AI that sounds impressive but delivers no value. Decision tree, use-case catalogue, system prompts, and data schemas.",
    price: "£49",
    type: "paid",
    icon: <Zap size={24} />,
    features: [
      "4-gate decision tree (hard stops)",
      "Wellness AI use-case catalogue",
      "Copy-paste system prompts",
      "Production-ready data schemas",
      "Why most teams fail analysis",
    ],
    cta: "Buy Now",
    link: "#prompt-pack",
    isStripeProduct: true,
  },
  {
    id: "engagement-playbook",
    name: "Wellness Engagement Systems Playbook",
    description: "Convert engagement into outcomes without eroding margin. Includes Habit→Outcome Map, 6-Rung Intervention Ladder, and Journey Blueprints.",
    price: "£79",
    type: "paid",
    icon: <BarChart3 size={24} />,
    features: [
      "Habit → Outcome mapping framework",
      "6-rung intervention ladder (margin-safe)",
      "Ready-to-use IF/THEN journey blueprints",
      "Churn rescue workflows",
      "Upsell timing engine",
    ],
    cta: "Buy Now",
    link: "#engagement-playbook",
    isStripeProduct: true,
  },
  // Premium Products
  {
    id: "activation-playbook",
    name: "90-Day AI Activation Playbook – Execution Edition",
    description: "Controlled, credible AI adoption without reputational or regulatory risk. Weekly sprints, board-safe KPIs, red-flag register.",
    price: "£49",
    type: "premium",
    icon: <BookOpen size={24} />,
    features: [
      "Weekly sprint structure with stop criteria",
      "Month-by-month execution plan",
      "Board-safe KPIs (no vanity metrics)",
      "Red-flag register for failure patterns",
      "Success criteria for each phase",
    ],
    cta: "Buy Now",
    link: "#activation-playbook",
    isStripeProduct: true,
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
  onDownloadClick,
  onBuyClick,
  isProcessing
}: { 
  product: Product; 
  onDownloadClick?: (product: Product) => void;
  onBuyClick?: (product: Product) => void;
  isProcessing?: string | null;
}) => {
  const isInternal = product.link.startsWith("/") && !product.isDownload && !product.isStripeProduct;
  const isDownload = product.isDownload;
  const isStripe = product.isStripeProduct;
  const isLoading = isProcessing === product.id;
  
  const handleClick = () => {
    if (isDownload && onDownloadClick) {
      onDownloadClick(product);
    } else if (isStripe && onBuyClick) {
      onBuyClick(product);
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
      ) : isStripe ? (
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
              <ArrowRight size={16} />
              {product.cta}
            </>
          )}
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
  const [searchParams] = useSearchParams();
  const [emailGateModal, setEmailGateModal] = useState<{
    isOpen: boolean;
    product: Product | null;
  }>({ isOpen: false, product: null });
  const [processingProductId, setProcessingProductId] = useState<string | null>(null);

  const freeProducts = products.filter(p => p.type === "free");
  const paidProducts = products.filter(p => p.type === "paid");
  const premiumProducts = products.filter(p => p.type === "premium");

  // Handle payment success/cancel from URL params
  useEffect(() => {
    const payment = searchParams.get("payment");
    const productId = searchParams.get("product");
    
    if (payment === "success") {
      toast.success("Payment successful! Your PDF is downloading and will also be emailed to you.");
      
      // Trigger immediate download based on product
      if (productId) {
        try {
          let doc;
          let filename = "wellness-genius-download.pdf";
          
          switch (productId) {
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
          }
          
          if (doc) {
            doc.save(filename);
          }
        } catch (error) {
          console.error("Failed to generate PDF:", error);
        }
      }
    } else if (payment === "cancelled") {
      toast.info("Payment was cancelled.");
    }
  }, [searchParams]);

  const handleDownloadClick = (product: Product) => {
    setEmailGateModal({ isOpen: true, product });
  };

  const handleCloseModal = () => {
    setEmailGateModal({ isOpen: false, product: null });
  };

  const handleBuyClick = async (product: Product) => {
    setProcessingProductId(product.id);

    try {
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
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-heading mb-4">
              Products & Downloads
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Practical intelligence for wellness leaders who need clarity, not hype.
            </p>
            <Link 
              to="/how-to-use" 
              className="inline-flex items-center gap-2 text-accent hover:underline font-medium"
            >
              <BookOpen size={18} />
              Learn how to use the stack →
            </Link>
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
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onBuyClick={handleBuyClick}
                  isProcessing={processingProductId}
                />
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