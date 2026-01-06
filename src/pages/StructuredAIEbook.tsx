import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { generateStructuredAIEbook } from "@/lib/pdf-generators";
import { useDownloadTracking } from "@/hooks/useDownloadTracking";
import { 
  Download, 
  Loader2, 
  CheckCircle, 
  Brain, 
  Target, 
  Shield, 
  BarChart3,
  Lightbulb,
  Building2,
  ExternalLink,
  BookOpen,
  Sparkles,
  ArrowLeft,
  Lock
} from "lucide-react";

const StructuredAIEbook = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { trackDownload } = useDownloadTracking();
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);

  // Check if user has already downloaded this ebook
  useEffect(() => {
    const checkPreviousDownload = async () => {
      if (user) {
        const { data } = await supabase
          .from("product_downloads")
          .select("id")
          .eq("product_id", "structured-ai-ebook")
          .eq("email", user.email)
          .limit(1)
          .maybeSingle();
        
        if (data) {
          setHasDownloaded(true);
        }
      }
    };
    checkPreviousDownload();
  }, [user]);

  const handleDownload = async () => {
    if (!user) {
      // Redirect to auth with return URL
      navigate("/auth?redirect=/hub/structured-ai-ebook&from=download");
      return;
    }

    setIsDownloading(true);

    try {
      // Log the download if first time
      if (!hasDownloaded) {
        await supabase
          .from("product_downloads")
          .insert({
            email: user.email!,
            name: user.user_metadata?.full_name || null,
            product_id: "structured-ai-ebook",
            product_name: "Structured AI for Wellness Operators",
            product_type: "free",
            download_type: "free",
          });
        
        // Also add to newsletter subscribers if not already
        await supabase
          .from("newsletter_subscribers")
          .upsert({
            email: user.email!.toLowerCase(),
            name: user.user_metadata?.full_name || null,
            source: "ebook-structured-ai",
          }, { onConflict: "email" });
      }

      // Track the download
      await trackDownload({
        productId: "structured-ai-ebook",
        productName: "Structured AI for Wellness Operators",
        downloadType: hasDownloaded ? "redownload" : "free",
        productType: "free",
      });

      // Generate and download PDF
      const doc = generateStructuredAIEbook();
      doc.save("Structured-AI-Wellness-Operators.pdf");
      
      setHasDownloaded(true);
      toast.success("Download started!");

      // Trigger upsell email for first-time downloads
      if (!hasDownloaded) {
        supabase.functions.invoke("send-download-upsell", {
          body: { 
            email: user.email!.toLowerCase(), 
            name: user.user_metadata?.full_name || null,
            productId: "structured-ai-ebook",
            productName: "Structured AI for Wellness Operators",
          },
        }).catch(console.error);
      }

    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const frameworkPillars = [
    {
      icon: Target,
      title: "Intent",
      description: "Define which decisions you're improving — retention, yield, utilisation, workforce stability",
    },
    {
      icon: Brain,
      title: "Context",
      description: "AI must understand your business model, market, demographics, and data reality",
    },
    {
      icon: Shield,
      title: "Constraints",
      description: "Define what must not happen — unsafe claims, data misuse, brand inconsistency",
    },
    {
      icon: BarChart3,
      title: "Output Contracts",
      description: "Clear prioritisation, practical next steps, decision-ready insight",
    },
  ];

  const sources = [
    { name: "Global Wellness Institute", url: "https://globalwellnessinstitute.org/industry-research/" },
    { name: "Leisure Database Company", url: "https://www.leisuredatabase.com/" },
    { name: "Health Club Management", url: "https://www.healthclubmanagement.co.uk/" },
    { name: "MVP Index", url: "https://themvpindex.com/" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Structured AI for Wellness Operators | Free Executive Brief</title>
        <meta 
          name="description" 
          content="Download the executive brief on structured AI for wellness operators. Learn the framework for turning AI from chatbots into decision infrastructure." 
        />
        <meta property="og:title" content="Structured AI for Wellness Operators | Free Executive Brief" />
        <meta property="og:description" content="From chatbots to decision infrastructure — the framework wellness leaders need." />
        <meta property="og:image" content="https://wellnessgenius.co.uk/images/wellness-genius-news-og.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://wellnessgenius.co.uk/images/wellness-genius-news-og.png" />
      </Helmet>
      
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container-wide section-padding">
          {/* Back link for logged in users */}
          {user && (
            <Button variant="ghost" size="sm" className="mb-6" asChild>
              <Link to="/hub">
                <ArrowLeft size={16} />
                Back to Hub
              </Link>
            </Button>
          )}

          {/* Hero Section */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
                <BookOpen size={14} className="mr-1" />
                Free Executive Brief
              </Badge>
              
              <h1 className="text-4xl md:text-5xl font-heading mb-4">
                Structured AI for
                <span className="text-accent"> Wellness Operators</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-6">
                From Chatbots to Decision Infrastructure
              </p>
              
              <p className="text-muted-foreground mb-8">
                Most wellness businesses don't have a technology gap — they have a decision-quality gap. 
                This 12-page executive brief shows how structured AI becomes a strategic asset, 
                backed by research from GWI, Leisure DB, and industry benchmarks.
              </p>

              <div className="flex flex-wrap gap-3 mb-8 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CheckCircle size={16} className="text-accent" />
                  12 pages
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle size={16} className="text-accent" />
                  Industry sources
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle size={16} className="text-accent" />
                  Actionable framework
                </span>
              </div>
            </div>

            {/* Download Card */}
            <Card className="border-accent/20 bg-card/50 backdrop-blur">
              <CardContent className="p-8">
                {!user ? (
                  // Not logged in - prompt to sign up
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                      <Lock size={28} className="text-accent" />
                    </div>
                    <h3 className="text-xl font-heading mb-2">Create a Free Account</h3>
                    <p className="text-muted-foreground mb-6">
                      Sign up to download this executive brief and access your downloads anytime from your hub.
                    </p>
                    <Button 
                      variant="accent" 
                      size="lg" 
                      className="w-full"
                      onClick={() => navigate("/auth?redirect=/hub/structured-ai-ebook&from=download")}
                    >
                      <Sparkles size={18} />
                      Create Free Account
                    </Button>
                    <p className="text-xs text-muted-foreground mt-4">
                      Already have an account?{" "}
                      <Link to="/auth?mode=login&redirect=/hub/structured-ai-ebook" className="text-accent hover:underline">
                        Sign in
                      </Link>
                    </p>
                  </div>
                ) : (
                  // Logged in - show download button
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                      {hasDownloaded ? (
                        <CheckCircle size={28} className="text-accent" />
                      ) : (
                        <Download size={28} className="text-accent" />
                      )}
                    </div>
                    <h3 className="text-xl font-heading mb-2">
                      {hasDownloaded ? "Download Again" : "Ready to Download"}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {hasDownloaded 
                        ? "You've downloaded this brief before. Click below to get it again."
                        : "Click below to download your free executive brief."}
                    </p>
                    <Button 
                      variant="accent" 
                      size="lg" 
                      className="w-full"
                      onClick={handleDownload}
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <Download size={18} />
                          {hasDownloaded ? "Re-download PDF" : "Download PDF"}
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-4">
                      This download is saved to your{" "}
                      <Link to="/hub/downloads" className="text-accent hover:underline">
                        Downloads Library
                      </Link>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Problem Statement */}
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-2xl md:text-3xl font-heading mb-4">The Core Problem</h2>
            <p className="text-lg text-muted-foreground mb-6">
              AI adoption is accelerating — but mostly as chatbots and content tools, 
              not as systems that improve decision quality.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4 text-center">
                  <p className="font-medium">Data exists</p>
                  <p className="text-sm text-muted-foreground">but insight does not</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4 text-center">
                  <p className="font-medium">Tools exist</p>
                  <p className="text-sm text-muted-foreground">but clarity does not</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4 text-center">
                  <p className="font-medium">AI outputs exist</p>
                  <p className="text-sm text-muted-foreground">but they're generic</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Framework Preview */}
          <div className="mb-20">
            <div className="text-center mb-10">
              <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
                The Framework
              </Badge>
              <h2 className="text-2xl md:text-3xl font-heading mb-2">
                Wellness AI Operating Framework
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                AI performance scales with structure. The brief covers these four pillars in detail.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {frameworkPillars.map((pillar, index) => (
                <Card key={index} className="bg-card/50 border-border/50 hover:border-accent/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                      <pillar.icon size={24} className="text-accent" />
                    </div>
                    <h3 className="font-heading text-lg mb-2">{pillar.title}</h3>
                    <p className="text-sm text-muted-foreground">{pillar.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Supplier Value */}
          <div className="max-w-3xl mx-auto mb-20">
            <div className="text-center mb-10">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                <Building2 size={24} className="text-purple-500" />
              </div>
              <h2 className="text-2xl md:text-3xl font-heading mb-2">
                For Suppliers & Partners
              </h2>
              <p className="text-muted-foreground">
                The brief includes a dedicated section on commercial opportunities for wellness suppliers.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-5">
                  <Lightbulb size={20} className="text-accent mb-2" />
                  <h4 className="font-medium mb-1">Standardised Intelligence at Scale</h4>
                  <p className="text-sm text-muted-foreground">Deliver expert-level insight without scaling headcount.</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-5">
                  <Sparkles size={20} className="text-accent mb-2" />
                  <h4 className="font-medium mb-1">Faster Client Adoption</h4>
                  <p className="text-sm text-muted-foreground">Your product becomes easier to understand and justify.</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sources */}
          <div className="max-w-3xl mx-auto mb-20">
            <div className="text-center mb-8">
              <h2 className="text-xl font-heading mb-2">Research Sources</h2>
              <p className="text-sm text-muted-foreground">
                All insights backed by credible industry research
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {sources.map((source, index) => (
                <a 
                  key={index}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50 text-sm text-muted-foreground hover:text-accent hover:border-accent/30 transition-colors"
                >
                  {source.name}
                  <ExternalLink size={12} />
                </a>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-heading mb-4">
              Ready to structure your AI strategy?
            </h2>
            <p className="text-muted-foreground mb-6">
              Download the full executive brief and start making AI work for your business.
            </p>
            {!user ? (
              <Button 
                variant="accent" 
                size="lg"
                onClick={() => navigate("/auth?redirect=/hub/structured-ai-ebook&from=download")}
              >
                <Sparkles size={18} />
                Create Free Account to Download
              </Button>
            ) : (
              <Button 
                variant="accent" 
                size="lg"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Download Executive Brief
                  </>
                )}
              </Button>
            )}
            <p className="text-xs text-muted-foreground mt-4">
              By downloading, you agree to our{" "}
              <Link to="/privacy" className="text-accent hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default StructuredAIEbook;
