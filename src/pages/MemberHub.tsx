import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  FileText, 
  Package, 
  LogOut, 
  User,
  Clock,
  BookOpen,
  Zap,
  BarChart3,
  Sparkles,
  Loader2,
  Terminal,
  MessageCircle,
  Bookmark,
  RotateCcw,
  Library,
  Brain,
  Mic,
  ArrowRight,
  History as HistoryIcon
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  generatePromptPack, 
  generateRevenueFramework, 
  generateBuildVsBuy,
  generateActivationPlaybook,
  generateEngagementPlaybook
} from "@/lib/pdf-generators";
import PromptLibrary from "@/components/hub/PromptLibrary";
import SavedInsights from "@/components/hub/SavedInsights";
import OnboardingBanner from "@/components/hub/OnboardingBanner";
import OnboardingProgress from "@/components/hub/OnboardingProgress";
import DownloadHistory from "@/components/hub/DownloadHistory";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useDownloadTracking } from "@/hooks/useDownloadTracking";
import { generateGamificationPlaybook } from "@/lib/pdf-generators";

interface Purchase {
  id: string;
  product_id: string;
  product_name: string;
  price_paid: number;
  currency: string;
  purchased_at: string;
}

interface SavedOutput {
  id: string;
  output_type: string;
  title: string;
  data: unknown;
  created_at: string;
}

interface RecentDownload {
  id: string;
  product_id: string;
  product_name: string;
  created_at: string;
  download_type: string;
  product_type: string;
}

const PRODUCT_ICONS: Record<string, React.ReactNode> = {
  "prompt-pack": <Zap size={20} />,
  "revenue-framework": <BarChart3 size={20} />,
  "build-vs-buy": <BookOpen size={20} />,
  "activation-playbook": <BookOpen size={20} />,
  "engagement-playbook": <BarChart3 size={20} />,
  "gamification-playbook": <Zap size={20} />,
  "readiness-score": <Sparkles size={20} />,
  "reality-checklist": <FileText size={20} />,
  "myths-deck": <FileText size={20} />,
};

const MemberHub = () => {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [savedOutputs, setSavedOutputs] = useState<SavedOutput[]>([]);
  const [recentDownloads, setRecentDownloads] = useState<RecentDownload[]>([]);
  const { restartOnboarding } = useOnboarding();
  const { trackDownload } = useDownloadTracking();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      // Fetch purchases
      const { data: purchaseData, error: purchaseError } = await supabase
        .from("user_purchases")
        .select("*")
        .order("purchased_at", { ascending: false });

      if (purchaseError) throw purchaseError;
      setPurchases(purchaseData || []);

      // Fetch saved outputs
      const { data: outputData, error: outputError } = await supabase
        .from("user_saved_outputs")
        .select("*")
        .order("created_at", { ascending: false });

      if (outputError) throw outputError;
      setSavedOutputs(outputData || []);

      // Fetch recent downloads (free + paid)
      const { data: downloadData, error: downloadError } = await supabase
        .from("product_downloads")
        .select("id, product_id, product_name, created_at, download_type, product_type")
        .order("created_at", { ascending: false })
        .limit(20);

      if (downloadError) {
        console.error("Error fetching downloads:", downloadError);
      } else {
        // Deduplicate by product_id (keep most recent)
        const seen = new Set<string>();
        const uniqueDownloads = (downloadData || []).filter((d) => {
          if (seen.has(d.product_id)) return false;
          seen.add(d.product_id);
          return true;
        });
        setRecentDownloads(uniqueDownloads);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load your data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const handleDownload = async (productId: string, productName: string, isPaid: boolean = true) => {
    try {
      let doc;
      let filename = "wellness-genius-download.pdf";
      
      switch (productId) {
        case "prompt-pack":
          doc = generatePromptPack();
          filename = "wellness-ai-builder-operator-edition.pdf";
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
        default:
          toast.error("Download not available for this product");
          return;
      }
      
      if (doc) {
        doc.save(filename);
        toast.success("Download started!");
        
        // Track the download
        await trackDownload({
          productId,
          productName,
          downloadType: isPaid ? "redownload" : "free",
          productType: isPaid ? "paid" : "free",
        });
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to generate download");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(price / 100);
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>My Intelligence Hub | Wellness Genius</title>
        <meta name="description" content="Access your purchased products, downloads, and saved outputs." />
      </Helmet>
      
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container-wide section-padding">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading mb-2">My Intelligence Hub</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.user_metadata?.full_name || user?.email?.split("@")[0]}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link to="/products">
                  <Package size={16} />
                  Browse Products
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut size={16} />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Genie Hero Section */}
          <div className="mb-12 rounded-2xl border-2 border-accent/30 bg-gradient-to-br from-accent/10 via-accent/5 to-background overflow-hidden">
            <div className="grid md:grid-cols-2 gap-6 p-6 md:p-8">
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-full bg-accent/20">
                    <Brain size={24} className="text-accent" />
                  </div>
                  <span className="text-xs font-medium uppercase tracking-wider text-accent">Your AI Business Partner</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-heading mb-3">Wellness Genie</h2>
                <p className="text-muted-foreground mb-6">
                  Your always-on business operator. Get strategic guidance, make better decisions, and solve operational challenges with AI that understands your wellness business.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="accent" size="lg" asChild>
                    <Link to="/genie">
                      <Brain size={18} />
                      Open Genie
                      <ArrowRight size={16} />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/hub/coach">
                      <MessageCircle size={18} />
                      AI Coach
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-background/60 border border-border/50 p-4">
                  <div className="p-2 rounded-lg bg-blue-500/10 w-fit mb-2">
                    <Mic size={18} className="text-blue-400" />
                  </div>
                  <h4 className="font-medium text-sm mb-1">Voice Mode</h4>
                  <p className="text-xs text-muted-foreground">Talk naturally with hands-free voice conversations</p>
                </div>
                <div className="rounded-xl bg-background/60 border border-border/50 p-4">
                  <div className="p-2 rounded-lg bg-purple-500/10 w-fit mb-2">
                    <Sparkles size={18} className="text-purple-400" />
                  </div>
                  <h4 className="font-medium text-sm mb-1">Smart Memory</h4>
                  <p className="text-xs text-muted-foreground">Remembers your business context across sessions</p>
                </div>
                <div className="rounded-xl bg-background/60 border border-border/50 p-4">
                  <div className="p-2 rounded-lg bg-green-500/10 w-fit mb-2">
                    <BarChart3 size={18} className="text-green-400" />
                  </div>
                  <h4 className="font-medium text-sm mb-1">Decision Support</h4>
                  <p className="text-xs text-muted-foreground">Get data-driven recommendations for key choices</p>
                </div>
                <div className="rounded-xl bg-background/60 border border-border/50 p-4">
                  <div className="p-2 rounded-lg bg-orange-500/10 w-fit mb-2">
                    <HistoryIcon size={18} className="text-orange-400" />
                  </div>
                  <h4 className="font-medium text-sm mb-1">Session History</h4>
                  <p className="text-xs text-muted-foreground">Search and resume past conversations anytime</p>
                </div>
              </div>
            </div>
          </div>

          {/* Onboarding Banner */}
          <OnboardingBanner />

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : (
            <Tabs defaultValue="products" className="w-full">
              <TabsList className="mb-8">
                <TabsTrigger value="products" className="flex items-center gap-2">
                  <Package size={16} />
                  Products & Reports
                </TabsTrigger>
                <TabsTrigger value="insights" className="flex items-center gap-2">
                  <Bookmark size={16} />
                  Saved Insights
                </TabsTrigger>
                <TabsTrigger value="prompts" className="flex items-center gap-2">
                  <Terminal size={16} />
                  Prompt Library
                </TabsTrigger>
              </TabsList>

              <TabsContent value="products">
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Main Content - Purchases */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Purchased Products */}
                    <section>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-accent/10">
                          <Package size={20} className="text-accent" />
                        </div>
                        <h2 className="text-xl font-heading">Your Products</h2>
                      </div>

                      {purchases.length === 0 ? (
                        <div className="rounded-xl border border-border bg-card p-8 text-center">
                          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-heading mb-2">No purchases yet</h3>
                          <p className="text-muted-foreground mb-4">
                            Your purchased products will appear here for easy access.
                          </p>
                          <Button variant="accent" asChild>
                            <Link to="/products">Browse Products</Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {purchases.map((purchase) => (
                            <div
                              key={purchase.id}
                              className="rounded-xl border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                            >
                              <div className="p-3 rounded-lg bg-accent/10 shrink-0">
                                {PRODUCT_ICONS[purchase.product_id] || <FileText size={20} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-heading text-base mb-1">{purchase.product_name}</h3>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock size={14} />
                                    {formatDate(purchase.purchased_at)}
                                  </span>
                                  <span>{formatPrice(purchase.price_paid, purchase.currency)}</span>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(purchase.product_id, purchase.product_name, true)}
                              >
                                <Download size={14} />
                                Download
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>

                    {/* Recent Downloads */}
                    {recentDownloads.length > 0 && (
                      <section>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 rounded-lg bg-accent/10">
                            <Download size={20} className="text-accent" />
                          </div>
                          <h2 className="text-xl font-heading">Recent Downloads</h2>
                        </div>

                        <div className="space-y-4">
                          {recentDownloads.map((download) => {
                            const isFree =
                              download.product_type === "free" || download.download_type === "free";

                            return (
                              <div
                                key={download.id}
                                className="rounded-xl border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                              >
                                <div className="p-3 rounded-lg bg-muted shrink-0">
                                  {PRODUCT_ICONS[download.product_id] || <FileText size={20} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-heading text-base mb-1">
                                    {download.product_name}
                                  </h3>
                                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <span
                                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                                        isFree
                                          ? "bg-green-500/10 text-green-600"
                                          : "bg-accent/10 text-accent"
                                      }`}
                                    >
                                      {isFree ? "Free" : "Paid"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock size={14} />
                                      {formatDate(download.created_at)}
                                    </span>
                                  </div>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                  <Link to="/products">
                                    <Download size={14} />
                                    Download again
                                  </Link>
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    )}

                    {/* Saved Outputs */}
                    <section>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                          <Sparkles size={20} className="text-purple-500" />
                        </div>
                        <h2 className="text-xl font-heading">Saved Reports & Outputs</h2>
                      </div>

                      {savedOutputs.length === 0 ? (
                        <div className="rounded-xl border border-border bg-card p-8 text-center">
                          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-heading mb-2">No saved outputs yet</h3>
                          <p className="text-muted-foreground mb-4">
                            Complete an AI Readiness Assessment to save your results here.
                          </p>
                          <Button variant="accent" asChild>
                            <Link to="/ai-readiness">Take Assessment</Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {savedOutputs.map((output) => (
                            <div
                              key={output.id}
                              className="rounded-xl border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                            >
                              <div className="p-3 rounded-lg bg-purple-500/10 shrink-0">
                                <Sparkles size={20} className="text-purple-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-heading text-base mb-1">{output.title}</h3>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                  <span>{output.output_type}</span>
                                  <span className="flex items-center gap-1">
                                    <Clock size={14} />
                                    {formatDate(output.created_at)}
                                  </span>
                                </div>
                              </div>
                              <Button variant="outline" size="sm">
                                View Report
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  </div>
                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Onboarding Progress */}
                    <OnboardingProgress />
                    
                    {/* Download History */}
                    <DownloadHistory />
                    
                    {/* Account Card */}
                    <div className="rounded-xl border border-border bg-card p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-full bg-accent/10">
                          <User size={20} className="text-accent" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {user?.user_metadata?.full_name || "Member"}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-border space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Products owned</span>
                          <span className="font-medium">{purchases.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Saved outputs</span>
                          <span className="font-medium">{savedOutputs.length}</span>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-border mt-4">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start text-muted-foreground hover:text-foreground"
                          onClick={restartOnboarding}
                        >
                          <RotateCcw size={14} />
                          Restart Site Tour
                        </Button>
                      </div>
                    </div>

                    {/* AI Coach CTA */}
                    <div className="rounded-xl border-2 border-accent bg-gradient-to-br from-accent/10 to-accent/5 p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-full bg-accent/20">
                          <MessageCircle size={20} className="text-accent" />
                        </div>
                        <h3 className="font-heading">AI Coach</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Get expert AI guidance for building apps and strategic decisions.
                      </p>
                      <Button variant="accent" size="sm" className="w-full" asChild>
                        <Link to="/hub/coach">
                          <Sparkles size={14} />
                          Open AI Coach
                        </Link>
                      </Button>
                    </div>

                    {/* Quick Actions */}
                    <div className="rounded-xl border border-border bg-card p-6">
                      <h3 className="font-heading mb-4">Quick Actions</h3>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start" asChild>
                          <Link to="/hub/downloads">
                            <Library size={16} />
                            Downloads Library
                          </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start" asChild>
                          <Link to="/ai-readiness">
                            <Sparkles size={16} />
                            Take AI Readiness Assessment
                          </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start" asChild>
                          <Link to="/products">
                            <Package size={16} />
                            Browse All Products
                          </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start" asChild>
                          <Link to="/insights">
                            <BookOpen size={16} />
                            Read Latest Insights
                          </Link>
                        </Button>
                      </div>
                    </div>

                    {/* Help */}
                    <div className="rounded-xl border border-accent/20 bg-accent/5 p-6">
                      <h3 className="font-heading mb-2">Need Help?</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Questions about your products or downloads? We're here to help.
                      </p>
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <a href="mailto:hello@wellnessgenius.io">Contact Support</a>
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="insights">
                <SavedInsights />
              </TabsContent>

              <TabsContent value="prompts">
                <PromptLibrary />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MemberHub;
