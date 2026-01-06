import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Search,
  FileText,
  Zap,
  BarChart3,
  BookOpen,
  Sparkles,
  Loader2,
  Filter,
  Clock,
  ArrowLeft,
  CheckCircle,
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
  generateGamificationPlaybook,
  generateStructuredAIEbook,
} from "@/lib/pdf-generators";
import { useDownloadTracking } from "@/hooks/useDownloadTracking";
import { ReportProblemButton } from "@/components/feedback/ReportProblemButton";

interface DownloadRecord {
  id: string;
  product_id: string;
  product_name: string;
  download_type: string;
  product_type: string;
  created_at: string;
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
  "structured-ai-ebook": <BookOpen size={20} />,
};

const DownloadsLibrary = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { trackDownload } = useDownloadTracking();

  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "free" | "paid">("all");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDownloads();
    }
  }, [user]);

  const fetchDownloads = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("product_downloads")
        .select("id, product_id, product_name, download_type, product_type, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Deduplicate by product_id (keep most recent)
      const seen = new Set<string>();
      const uniqueDownloads = (data || []).filter((d) => {
        if (seen.has(d.product_id)) return false;
        seen.add(d.product_id);
        return true;
      });

      setDownloads(uniqueDownloads);
    } catch (error) {
      console.error("Error fetching downloads:", error);
      toast.error("Failed to load your downloads");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDownloads = useMemo(() => {
    return downloads.filter((download) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        download.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        download.product_id.toLowerCase().includes(searchQuery.toLowerCase());

      // Type filter
      const isFree = download.product_type === "free" || download.download_type === "free";
      const matchesType =
        filterType === "all" ||
        (filterType === "free" && isFree) ||
        (filterType === "paid" && !isFree);

      return matchesSearch && matchesType;
    });
  }, [downloads, searchQuery, filterType]);

  const handleRedownload = async (download: DownloadRecord) => {
    setDownloadingId(download.id);

    try {
      let doc;
      let filename = "wellness-genius-download.pdf";

      switch (download.product_id) {
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
        case "structured-ai-ebook":
          doc = generateStructuredAIEbook();
          filename = "Structured-AI-Wellness-Operators.pdf";
          break;
        default:
          // For products without PDF generators, redirect to products page
          toast.info("Please download this product from the Products page");
          navigate("/products");
          return;
      }

      if (doc) {
        doc.save(filename);
        toast.success("Download started!");

        const isFree = download.product_type === "free" || download.download_type === "free";
        await trackDownload({
          productId: download.product_id,
          productName: download.product_name,
          downloadType: "redownload",
          productType: isFree ? "free" : "paid",
        });
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to generate download");
    } finally {
      setDownloadingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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
        <title>Downloads Library | Wellness Genius</title>
        <meta
          name="description"
          content="Access and re-download all your purchased and free resources."
        />
      </Helmet>

      <Header />

      <main className="pt-24 pb-16">
        <div className="container-wide section-padding">
          {/* Back link */}
          <Button variant="ghost" size="sm" className="mb-6" asChild>
            <Link to="/hub">
              <ArrowLeft size={16} />
              Back to Hub
            </Link>
          </Button>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading mb-2">Downloads Library</h1>
              <p className="text-muted-foreground">
              All your downloads in one place. Search, filter, and re-download anytime.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ReportProblemButton featureArea="Document Upload" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText size={16} />
              <span>{downloads.length} products</span>
            </div>
          </div>
        </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search downloads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filterType}
              onValueChange={(value: "all" | "free" | "paid") => setFilterType(value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter size={16} className="mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Downloads</SelectItem>
                <SelectItem value="free">Free Only</SelectItem>
                <SelectItem value="paid">Paid Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Downloads List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : filteredDownloads.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              {downloads.length === 0 ? (
                <>
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-heading mb-2">No downloads yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Download free resources or purchase products to see them here.
                  </p>
                  <Button variant="accent" asChild>
                    <Link to="/products">Browse Products</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-heading mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or filter.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterType("all");
                    }}
                  >
                    Clear filters
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredDownloads.map((download) => {
                const isFree =
                  download.product_type === "free" || download.download_type === "free";
                const isDownloading = downloadingId === download.id;

                return (
                  <div
                    key={download.id}
                    className="rounded-xl border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-accent/30 transition-colors"
                  >
                    <div
                      className={`p-3 rounded-lg shrink-0 ${
                        isFree ? "bg-green-500/10" : "bg-accent/10"
                      }`}
                    >
                      {PRODUCT_ICONS[download.product_id] || (
                        <FileText size={20} className={isFree ? "text-green-600" : "text-accent"} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading text-base mb-1">{download.product_name}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            isFree
                              ? "bg-green-500/10 text-green-600"
                              : "bg-accent/10 text-accent"
                          }`}
                        >
                          {isFree ? "Free" : "Paid"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          Downloaded {formatDate(download.created_at)}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRedownload(download)}
                      disabled={isDownloading}
                      className="shrink-0"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download size={14} />
                          Re-download
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Stats summary */}
          {downloads.length > 0 && (
            <div className="mt-12 grid sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border bg-card p-5 text-center">
                <div className="text-2xl font-heading text-accent mb-1">
                  {downloads.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Products</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 text-center">
                <div className="text-2xl font-heading text-green-600 mb-1">
                  {downloads.filter((d) => d.product_type === "free" || d.download_type === "free").length}
                </div>
                <div className="text-sm text-muted-foreground">Free Downloads</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 text-center">
                <div className="text-2xl font-heading text-purple-600 mb-1">
                  {downloads.filter((d) => d.product_type === "paid" && d.download_type !== "free").length}
                </div>
                <div className="text-sm text-muted-foreground">Paid Products</div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DownloadsLibrary;
