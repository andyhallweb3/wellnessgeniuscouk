import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  CheckCircle, 
  Package, 
  Sparkles,
  BookOpen,
  BarChart3,
  Zap,
  Users,
  Loader2,
  Phone,
  X,
  Trophy,
  ArrowLeft
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Bundle {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: string;
  originalPrice: string;
  savings: string;
  products: {
    name: string;
    price: string;
    description: string;
    icon: React.ReactNode;
  }[];
  bestFor: string[];
  cta: string;
  featured?: boolean;
}

const bundles: Bundle[] = [
  {
    id: "operator-pack",
    name: "Wellness AI Operator Pack",
    tagline: "Complete Operator Toolkit",
    description: "Everything you need to assess your AI readiness, design the right solution, and build engagement systems that protect margin. The definitive toolkit for wellness operators serious about AI.",
    price: "£179",
    originalPrice: "£227",
    savings: "£48",
    products: [
      {
        name: "AI Readiness Score – Commercial Edition",
        price: "£99",
        description: "5-pillar diagnostic with executive summary, Data Maturity Matrix, and 90-day fix plan.",
        icon: <Sparkles size={20} />,
      },
      {
        name: "Wellness AI Builder – Operator Edition",
        price: "£69",
        description: "4-gate decision tree, use-case catalogue, system prompts, and AI Build Brief template.",
        icon: <Zap size={20} />,
      },
      {
        name: "Wellness Engagement Systems Playbook",
        price: "£59",
        description: "Habit→Outcome mapping, 6-rung intervention ladder, and margin-safe journey blueprints.",
        icon: <BarChart3 size={20} />,
      },
    ],
    bestFor: [
      "Operators evaluating AI for the first time",
      "Teams needing assessment + build + engagement in one",
      "Decision-makers who want complete toolkit upfront",
      "Organisations with 6-12 month AI timeline",
    ],
    cta: "Get the Operator Pack",
    featured: true,
  },
  {
    id: "execution-pack",
    name: "Execution Pack",
    tagline: "From Assessment to Action",
    description: "Start with a clear picture of where you stand, then execute with a proven 90-day playbook. Perfect for teams who know they need to act but want structure.",
    price: "£149",
    originalPrice: "£198",
    savings: "£49",
    products: [
      {
        name: "AI Readiness Score – Commercial Edition",
        price: "£99",
        description: "5-pillar diagnostic with executive summary, Data Maturity Matrix, and 90-day fix plan.",
        icon: <Sparkles size={20} />,
      },
      {
        name: "90-Day AI Activation Playbook – Execution Edition",
        price: "£99",
        description: "Weekly sprint templates, board-ready summaries, and kill conditions for each phase.",
        icon: <BookOpen size={20} />,
      },
    ],
    bestFor: [
      "Teams ready to start executing now",
      "Operators with board reporting requirements",
      "Organisations needing structured 90-day plans",
      "Leaders who want accountability frameworks",
    ],
    cta: "Get the Execution Pack",
  },
];

// Comparison data
const comparisonFeatures = [
  { feature: "AI Readiness Diagnostic", operatorPack: true, executionPack: true, individual: "£99" },
  { feature: "Data Maturity Matrix", operatorPack: true, executionPack: true, individual: "£99" },
  { feature: "90-Day Fix Prioritisation", operatorPack: true, executionPack: true, individual: "£99" },
  { feature: "AI Build Decision Tree", operatorPack: true, executionPack: false, individual: "£69" },
  { feature: "Use-Case Catalogue", operatorPack: true, executionPack: false, individual: "£69" },
  { feature: "System Prompts & Schemas", operatorPack: true, executionPack: false, individual: "£69" },
  { feature: "AI Build Brief Template", operatorPack: true, executionPack: false, individual: "£69" },
  { feature: "Weekly Sprint Templates", operatorPack: false, executionPack: true, individual: "£99" },
  { feature: "Board-Ready Summaries", operatorPack: false, executionPack: true, individual: "£99" },
  { feature: "Kill Conditions & Red Flags", operatorPack: false, executionPack: true, individual: "£99" },
  { feature: "Habit→Outcome Mapping", operatorPack: true, executionPack: false, individual: "£59" },
  { feature: "6-Rung Intervention Ladder", operatorPack: true, executionPack: false, individual: "£59" },
  { feature: "Engagement KPI Canon", operatorPack: true, executionPack: false, individual: "£59" },
  { feature: "MVP Segment Definition", operatorPack: true, executionPack: false, individual: "£59" },
];

const Bundles = () => {
  const [processingBundleId, setProcessingBundleId] = useState<string | null>(null);

  const handleBuyBundle = async (bundleId: string) => {
    setProcessingBundleId(bundleId);

    try {
      const { data, error } = await supabase.functions.invoke("create-product-checkout", {
        body: { productId: bundleId },
      });

      if (error) throw error;

      if (data?.free_access) {
        toast.success("This bundle is included with your AI Advisor subscription!");
        return;
      }

      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setProcessingBundleId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>AI Bundles for Wellness Operators | Wellness Genius</title>
        <meta 
          name="description" 
          content="Save up to £49 with our curated AI product bundles. Complete toolkits for wellness operators ready to implement AI strategically." 
        />
      </Helmet>
      
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container-wide section-padding">
          <PageBreadcrumb items={[
            { label: "Products", href: "/products" },
            { label: "Bundles" }
          ]} />
          
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 text-sm font-medium mb-6">
              <Package size={16} />
              Save up to £49 with bundles
            </div>
            <h1 className="text-4xl md:text-5xl font-heading mb-4">
              Complete AI Toolkits for Wellness Operators
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Stop buying piecemeal. Get everything you need in one purchase, 
              at a price that makes sense. Built for operators who are serious about AI.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground mb-6">
              <span className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                Instant PDF delivery
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                All products included
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                One-time purchase
              </span>
            </div>
            <Link 
              to="/products" 
              className="inline-flex items-center gap-2 text-accent hover:underline font-medium"
            >
              <ArrowLeft size={16} />
              View individual products
            </Link>
          </div>

          {/* Bundle Cards */}
          <section className="mb-20">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {bundles.map((bundle) => (
                <div 
                  key={bundle.id}
                  className={`rounded-2xl border p-8 relative ${
                    bundle.featured 
                      ? "border-amber-500/50 bg-amber-500/5 ring-2 ring-amber-500/20" 
                      : "border-border bg-card"
                  }`}
                >
                  {bundle.featured && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500 text-amber-950 text-sm font-semibold">
                        <Trophy size={14} />
                        Best Value
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <p className="text-sm font-medium text-accent mb-1">{bundle.tagline}</p>
                    <h2 className="text-2xl font-heading mb-2">{bundle.name}</h2>
                    <p className="text-muted-foreground text-sm">{bundle.description}</p>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-4xl font-heading">{bundle.price}</span>
                    <span className="text-lg text-muted-foreground line-through">{bundle.originalPrice}</span>
                    <span className="px-2 py-1 rounded bg-green-500/10 text-green-600 text-sm font-medium">
                      Save {bundle.savings}
                    </span>
                  </div>

                  {/* Included Products */}
                  <div className="mb-6">
                    <p className="text-sm font-medium mb-3">What's included:</p>
                    <div className="space-y-3">
                      {bundle.products.map((product, idx) => (
                        <div key={idx} className="flex gap-3 p-3 rounded-lg bg-secondary/50">
                          <div className="p-2 rounded bg-accent/10 text-accent h-fit">
                            {product.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium text-sm">{product.name}</p>
                              <span className="text-xs text-muted-foreground shrink-0">{product.price}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{product.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Best For */}
                  <div className="mb-8">
                    <p className="text-sm font-medium mb-3">Best for:</p>
                    <ul className="space-y-2">
                      {bundle.bestFor.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div className="space-y-3">
                    <Button 
                      variant={bundle.featured ? "accent" : "outline"}
                      className="w-full"
                      onClick={() => handleBuyBundle(bundle.id)}
                      disabled={processingBundleId === bundle.id}
                    >
                      {processingBundleId === bundle.id ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ArrowRight size={16} />
                          {bundle.cta}
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full text-xs" 
                      asChild
                    >
                      <a href="https://calendly.com/andy-wellnessgenius/30min" target="_blank" rel="noopener noreferrer">
                        <Phone size={14} />
                        Book a Call with Andy
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Feature Comparison Table */}
          <section className="mb-20">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-heading mb-3">Feature Comparison</h2>
              <p className="text-muted-foreground">See exactly what's included in each bundle</p>
            </div>

            <div className="max-w-4xl mx-auto overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-medium">Feature</th>
                    <th className="text-center py-4 px-4">
                      <div className="flex flex-col items-center">
                        <span className="font-heading text-lg">Operator Pack</span>
                        <span className="text-sm text-muted-foreground">£179</span>
                      </div>
                    </th>
                    <th className="text-center py-4 px-4">
                      <div className="flex flex-col items-center">
                        <span className="font-heading text-lg">Execution Pack</span>
                        <span className="text-sm text-muted-foreground">£149</span>
                      </div>
                    </th>
                    <th className="text-center py-4 px-4">
                      <div className="flex flex-col items-center">
                        <span className="font-heading text-lg">Individual</span>
                        <span className="text-sm text-muted-foreground">à la carte</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((row, idx) => (
                    <tr key={idx} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="py-3 px-4 text-sm">{row.feature}</td>
                      <td className="py-3 px-4 text-center">
                        {row.operatorPack ? (
                          <CheckCircle size={18} className="text-green-500 mx-auto" />
                        ) : (
                          <X size={18} className="text-muted-foreground/30 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {row.executionPack ? (
                          <CheckCircle size={18} className="text-green-500 mx-auto" />
                        ) : (
                          <X size={18} className="text-muted-foreground/30 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-muted-foreground">
                        {row.individual}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-secondary/50">
                    <td className="py-4 px-4 font-medium">Total Value</td>
                    <td className="py-4 px-4 text-center">
                      <span className="line-through text-muted-foreground">£227</span>
                      <span className="ml-2 font-heading text-accent">£179</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="line-through text-muted-foreground">£198</span>
                      <span className="ml-2 font-heading text-accent">£149</span>
                    </td>
                    <td className="py-4 px-4 text-center text-muted-foreground">
                      Varies
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-20">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-heading text-center mb-10">Common Questions</h2>
              
              <div className="space-y-6">
                <div className="p-6 rounded-xl bg-card border border-border">
                  <h3 className="font-heading text-lg mb-2">What format are the products?</h3>
                  <p className="text-muted-foreground text-sm">
                    All products are delivered as high-quality PDFs with editable templates, frameworks, and practical worksheets. They're designed to be printed, shared with teams, and used immediately.
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-card border border-border">
                  <h3 className="font-heading text-lg mb-2">Do I get the AI Readiness Score diagnostic?</h3>
                  <p className="text-muted-foreground text-sm">
                    Yes — both bundles include the AI Readiness Score templates and frameworks. To get your personalised score with AI-generated insights, take the <Link to="/ai-readiness/start" className="text-accent hover:underline">free assessment</Link> or upgrade to the full diagnostic.
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-card border border-border">
                  <h3 className="font-heading text-lg mb-2">Which bundle should I choose?</h3>
                  <p className="text-muted-foreground text-sm">
                    <strong>Operator Pack</strong> if you're evaluating AI options and need to design the right solution before executing. <strong>Execution Pack</strong> if you know you need to act and want a structured 90-day plan to do it properly.
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-card border border-border">
                  <h3 className="font-heading text-lg mb-2">Can I upgrade later?</h3>
                  <p className="text-muted-foreground text-sm">
                    Yes. If you buy the Execution Pack now and later want the Operator Pack products, you can purchase them individually. However, you'll pay more than if you'd bought the bundle upfront.
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-card border border-border">
                  <h3 className="font-heading text-lg mb-2">Is there a refund policy?</h3>
                  <p className="text-muted-foreground text-sm">
                    Due to the digital nature of these products, we don't offer refunds after download. However, if you're unsure which bundle is right for you, <a href="https://calendly.com/andy-wellnessgenius/30min" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">book a free call with Andy</a> to discuss your needs first.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center">
            <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl p-8 md:p-12 border border-accent/20 max-w-2xl mx-auto">
              <Users size={40} className="mx-auto mb-4 text-accent" />
              <h2 className="text-2xl font-heading mb-4">Not ready to commit?</h2>
              <p className="text-muted-foreground mb-6">
                Start with the free AI Readiness Quick Check. It takes 2 minutes and shows you exactly where you stand before you invest in the full toolkit.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="accent" size="lg" asChild>
                  <Link to="/ai-readiness/start">
                    Start Free Assessment
                    <ArrowRight size={16} />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/products">
                    View All Products
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Bundles;
