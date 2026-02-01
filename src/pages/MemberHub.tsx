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
  History as HistoryIcon,
  Trophy,
  Home,
  Flame,
  Shield,
  Search
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
  generateEngagementPlaybook,
  generateGamificationPlaybook
} from "@/lib/pdf-generators";
import PromptLibrary from "@/components/hub/PromptLibrary";
import SavedInsights from "@/components/hub/SavedInsights";
import OnboardingBanner from "@/components/hub/OnboardingBanner";
import OnboardingProgress from "@/components/hub/OnboardingProgress";
import DownloadHistory from "@/components/hub/DownloadHistory";
import ReadinessScoreHistory from "@/components/hub/ReadinessScoreHistory";
import GenieLeaderboard from "@/components/genie/GenieLeaderboard";
import { ProfessionalFeed } from "@/components/feed";
import ResearchAssistant from "@/components/research/ResearchAssistant";
import WelcomeModal from "@/components/hub/WelcomeModal";
import TelegramLinkCard from "@/components/hub/TelegramLinkCard";
import { ReportProblemButton } from "@/components/feedback/ReportProblemButton";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useDownloadTracking } from "@/hooks/useDownloadTracking";
import { useLeaderboard } from "@/hooks/useLeaderboard";

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

interface ReadinessScore {
  id: string;
  overall_score: number;
  score_band: string | null;
  completed_at: string;
}

const MemberHub = () => {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [savedOutputs, setSavedOutputs] = useState<SavedOutput[]>([]);
  const [recentDownloads, setRecentDownloads] = useState<RecentDownload[]>([]);
  const [latestReadiness, setLatestReadiness] = useState<ReadinessScore | null>(null);
  const { restartOnboarding, hasCompletedOnboarding } = useOnboarding();
  const { trackDownload } = useDownloadTracking();
  const { userEntry } = useLeaderboard();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserData();
      checkAdminRole();
    }
  }, [user]);

  const checkAdminRole = async () => {
    if (!user) return;
    const { data } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });
    setIsAdmin(data === true);
  };

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const { data: purchaseData, error: purchaseError } = await supabase
        .from("user_purchases")
        .select("*")
        .order("purchased_at", { ascending: false });

      if (purchaseError) throw purchaseError;
      setPurchases(purchaseData || []);

      const { data: outputData, error: outputError } = await supabase
        .from("user_saved_outputs")
        .select("*")
        .order("created_at", { ascending: false });

      if (outputError) throw outputError;
      setSavedOutputs(outputData || []);

      const { data: downloadData, error: downloadError } = await supabase
        .from("product_downloads")
        .select("id, product_id, product_name, created_at, download_type, product_type")
        .order("created_at", { ascending: false })
        .limit(20);

      if (downloadError) {
        console.error("Error fetching downloads:", downloadError);
      } else {
        const seen = new Set<string>();
        const uniqueDownloads = (downloadData || []).filter((d) => {
          if (seen.has(d.product_id)) return false;
          seen.add(d.product_id);
          return true;
        });
        setRecentDownloads(uniqueDownloads);
      }

      // Fetch latest AI readiness score
      const { data: readinessData } = await supabase
        .from("ai_readiness_completions")
        .select("id, overall_score, score_band, completed_at")
        .order("completed_at", { ascending: false })
        .limit(1)
        .single();

      if (readinessData) {
        setLatestReadiness(readinessData);
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
      
      <WelcomeModal userEmail={user?.email} />
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container-wide section-padding">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading mb-2">My Intelligence Hub</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.user_metadata?.full_name || user?.email?.split("@")[0]}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="accent" size="sm" asChild>
                <Link to="/hub/downloads">
                  <Library size={16} />
                  Downloads Library
                </Link>
              </Button>
              <ReportProblemButton featureArea="Navigation" />
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

          {/* Onboarding Banner - Top Priority */}
          <OnboardingBanner />

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-8">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Home size={16} />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center gap-2">
                  <Package size={16} />
                  Products
                </TabsTrigger>
                <TabsTrigger value="feed" className="flex items-center gap-2">
                  <MessageCircle size={16} />
                  Feed
                </TabsTrigger>
                <TabsTrigger value="community" className="flex items-center gap-2">
                  <Trophy size={16} />
                  Community
                </TabsTrigger>
                <TabsTrigger value="research" className="flex items-center gap-2">
                  <Search size={16} />
                  Research
                </TabsTrigger>
                <TabsTrigger value="resources" className="flex items-center gap-2">
                  <BookOpen size={16} />
                  Resources
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <User size={16} />
                  Settings
                </TabsTrigger>
                {isAdmin && (
                  <TabsTrigger value="admin" className="flex items-center gap-2 text-accent">
                    <Shield size={16} />
                    Admin
                  </TabsTrigger>
                )}
              </TabsList>

              {/* OVERVIEW TAB */}
              <TabsContent value="overview">
                <div className="space-y-8">
                  {/* Getting Started - Top Priority */}
                  <OnboardingProgress />

                  {/* AI Advisor Hero */}
                  <div className="rounded-2xl border-2 border-accent/30 bg-gradient-to-br from-accent/10 via-accent/5 to-background overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-6 p-6 md:p-8">
                      <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-2 rounded-full bg-accent/20">
                            <Brain size={24} className="text-accent" />
                          </div>
                          <span className="text-xs font-medium uppercase tracking-wider text-accent">Your AI Business Partner</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-heading mb-3">AI Advisor</h2>
                        <p className="text-muted-foreground mb-4">
                          Your strategic business partner. Get guidance, stress-test decisions, and build action plans with AI that understands your wellness business.
                        </p>
                        
                        <div className="mb-5">
                          <p className="text-xs text-muted-foreground mb-2">Quick start a conversation:</p>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" className="text-xs" asChild>
                              <Link to="/genie?mode=daily_briefing">
                                <span className="mr-1">📊</span> Daily Briefing
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs" asChild>
                              <Link to="/genie?mode=decision_support">
                                <span className="mr-1">🧠</span> Decision Support
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs" asChild>
                              <Link to="/genie?mode=build_mode">
                                <span className="mr-1">🔧</span> 90-Day Builder
                              </Link>
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                          <Button variant="accent" size="lg" asChild>
                            <Link to="/genie">
                              <Brain size={18} />
                              Open AI Advisor
                              <ArrowRight size={16} />
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
                          <p className="text-xs text-muted-foreground">Talk naturally with hands-free voice</p>
                        </div>
                        <div className="rounded-xl bg-background/60 border border-border/50 p-4">
                          <div className="p-2 rounded-lg bg-purple-500/10 w-fit mb-2">
                            <Sparkles size={18} className="text-purple-400" />
                          </div>
                          <h4 className="font-medium text-sm mb-1">Smart Memory</h4>
                          <p className="text-xs text-muted-foreground">Remembers your business context</p>
                        </div>
                        <div className="rounded-xl bg-background/60 border border-border/50 p-4">
                          <div className="p-2 rounded-lg bg-green-500/10 w-fit mb-2">
                            <BarChart3 size={18} className="text-green-400" />
                          </div>
                          <h4 className="font-medium text-sm mb-1">8 Expert Modes</h4>
                          <p className="text-xs text-muted-foreground">From quick questions to planning</p>
                        </div>
                        <div className="rounded-xl bg-background/60 border border-border/50 p-4">
                          <div className="p-2 rounded-lg bg-orange-500/10 w-fit mb-2">
                            <HistoryIcon size={18} className="text-orange-400" />
                          </div>
                          <h4 className="font-medium text-sm mb-1">Pay As You Go</h4>
                          <p className="text-xs text-muted-foreground">Buy credits when you need them</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats Grid */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-xl border border-border bg-card p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-accent/10">
                          <Package size={18} className="text-accent" />
                        </div>
                        <span className="text-sm text-muted-foreground">Products</span>
                      </div>
                      <p className="text-2xl font-heading">{purchases.length}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                          <Sparkles size={18} className="text-purple-500" />
                        </div>
                        <span className="text-sm text-muted-foreground">Saved Outputs</span>
                      </div>
                      <p className="text-2xl font-heading">{savedOutputs.length}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <Download size={18} className="text-green-500" />
                        </div>
                        <span className="text-sm text-muted-foreground">Downloads</span>
                      </div>
                      <p className="text-2xl font-heading">{recentDownloads.length}</p>
                    </div>
                    <Link 
                      to={latestReadiness ? `/ai-readiness/report/${latestReadiness.id}` : "/ai-readiness"}
                      className="rounded-xl border border-border bg-card p-5 hover:border-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-amber-500/10">
                          <Sparkles size={18} className="text-amber-500" />
                        </div>
                        <span className="text-sm text-muted-foreground">AI Readiness</span>
                      </div>
                      {latestReadiness ? (
                        <div>
                          <p className="text-2xl font-heading">{latestReadiness.overall_score}%</p>
                          <p className="text-xs text-muted-foreground">{latestReadiness.score_band}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Take assessment →</p>
                      )}
                    </Link>
                  </div>

                  {/* Two Column Layout */}
                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left: Quick Actions */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* Quick Actions */}
                      <div className="rounded-xl border border-border bg-card p-6">
                        <h3 className="font-heading mb-4">Quick Actions</h3>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <Button variant="outline" className="justify-start h-auto py-3" asChild>
                            <Link to="/ai-readiness">
                              <Sparkles size={16} className="text-accent mr-2" />
                              <div className="text-left">
                                <p className="font-medium">AI Readiness Assessment</p>
                                <p className="text-xs text-muted-foreground">Check your AI maturity</p>
                              </div>
                            </Link>
                          </Button>
                          <Button variant="outline" className="justify-start h-auto py-3" asChild>
                            <Link to="/hub/downloads">
                              <Library size={16} className="text-accent mr-2" />
                              <div className="text-left">
                                <p className="font-medium">Downloads Library</p>
                                <p className="text-xs text-muted-foreground">Access all your resources</p>
                              </div>
                            </Link>
                          </Button>
                          <Button variant="outline" className="justify-start h-auto py-3" asChild>
                            <Link to="/insights">
                              <BookOpen size={16} className="text-accent mr-2" />
                              <div className="text-left">
                                <p className="font-medium">Latest Insights</p>
                                <p className="text-xs text-muted-foreground">Read industry news</p>
                              </div>
                            </Link>
                          </Button>
                          <Button variant="outline" className="justify-start h-auto py-3" asChild>
                            <Link to="/hub/coach">
                              <MessageCircle size={16} className="text-accent mr-2" />
                              <div className="text-left">
                                <p className="font-medium">AI Advisor</p>
                                <p className="text-xs text-muted-foreground">Get expert AI guidance</p>
                              </div>
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Right: Account + Help */}
                    <div className="space-y-6">
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
                        <div className="pt-4 border-t border-border">
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

                      {/* Help */}
                      <div className="rounded-xl border border-accent/20 bg-accent/5 p-6">
                        <h3 className="font-heading mb-2">Need Help?</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Questions about your products or downloads?
                        </p>
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <a href="mailto:hello@wellnessgenius.co.uk">Contact Support</a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* PRODUCTS TAB */}
              <TabsContent value="products">
                <div className="grid lg:grid-cols-3 gap-8">
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
                            Your purchased products will appear here.
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
                          {recentDownloads.slice(0, 5).map((download) => {
                            const isFree = download.product_type === "free" || download.download_type === "free";
                            return (
                              <div
                                key={download.id}
                                className="rounded-xl border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                              >
                                <div className="p-3 rounded-lg bg-muted shrink-0">
                                  {PRODUCT_ICONS[download.product_id] || <FileText size={20} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-heading text-base mb-1">{download.product_name}</h3>
                                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                                      isFree ? "bg-green-500/10 text-green-600" : "bg-accent/10 text-accent"
                                    }`}>
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
                              <Button variant="outline" size="sm">View Report</Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    <ReadinessScoreHistory />
                    <DownloadHistory />
                    
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
                          <Link to="/products">
                            <Package size={16} />
                            Browse All Products
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* FEED TAB */}
              <TabsContent value="feed">
                <ProfessionalFeed />
              </TabsContent>

              {/* COMMUNITY TAB */}
              <TabsContent value="community">
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <GenieLeaderboard />
                  </div>
                  <div className="space-y-6">
                    <div className="rounded-xl border border-border bg-card p-6">
                      <h3 className="font-heading mb-4">Community Highlights</h3>
                      <p className="text-sm text-muted-foreground">
                        Opt in to the leaderboard to see how you compare with other operators in your segment.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* RESEARCH TAB */}
              <TabsContent value="research">
                <ResearchAssistant />
              </TabsContent>

              {/* RESOURCES TAB */}
              <TabsContent value="resources">
                <div className="grid lg:grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <Terminal size={20} className="text-accent" />
                      </div>
                      <h2 className="text-xl font-heading">Prompt Library</h2>
                    </div>
                    <PromptLibrary />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <Bookmark size={20} className="text-purple-500" />
                      </div>
                      <h2 className="text-xl font-heading">Saved Insights</h2>
                    </div>
                    <SavedInsights />
                  </div>
                </div>
              </TabsContent>

              {/* SETTINGS TAB */}
              <TabsContent value="settings">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <User size={20} className="text-accent" />
                    </div>
                    <h2 className="text-xl font-heading">Account Settings</h2>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Account Info */}
                    <div className="rounded-xl border border-border bg-card p-6">
                      <h3 className="font-heading mb-4">Account</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email</span>
                          <span>{user?.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Member since</span>
                          <span>{user?.created_at ? formatDate(user.created_at) : 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Telegram Link */}
                    <TelegramLinkCard />

                    {/* Onboarding Reset */}
                    {hasCompletedOnboarding && (
                      <div className="rounded-xl border border-border bg-card p-6">
                        <h3 className="font-heading mb-2">Onboarding</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Restart the guided tour to rediscover features.
                        </p>
                        <Button variant="outline" size="sm" onClick={restartOnboarding}>
                          <RotateCcw size={16} />
                          Restart Onboarding
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* ADMIN TAB - Only shown to admins */}
              {isAdmin && (
                <TabsContent value="admin">
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="p-4 rounded-full bg-accent/10">
                      <Shield size={32} className="text-accent" />
                    </div>
                    <h2 className="text-xl font-heading">Admin Dashboard</h2>
                    <p className="text-muted-foreground text-center max-w-md">
                      Access the full admin dashboard to manage newsletters, downloads, email templates, and more.
                    </p>
                    <Button variant="accent" size="lg" asChild>
                      <Link to="/admin">
                        <Shield size={18} />
                        Go to Admin Dashboard
                        <ArrowRight size={16} />
                      </Link>
                    </Button>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MemberHub;
