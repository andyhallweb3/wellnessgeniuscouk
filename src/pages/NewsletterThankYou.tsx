import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, ArrowRight, Mail, Sparkles, FileText, Star, BarChart3, Lightbulb, ExternalLink, Lock } from "lucide-react";
import logo from "@/assets/wellness-genius-logo-teal.webp";
import { supabase } from "@/integrations/supabase/client";
import { generateQuickCheck } from "@/lib/pdf-generators";
import { toast } from "sonner";

const NewsletterThankYou = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated and email is confirmed
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email_confirmed_at) {
        setIsVerified(true);
        setUserEmail(session.user.email ?? null);
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.email_confirmed_at) {
        setIsVerified(true);
        setUserEmail(session.user.email ?? null);
      } else {
        setIsVerified(false);
        setUserEmail(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleDownload = async () => {
    if (!isVerified) {
      toast.error("Please verify your email first to download");
      return;
    }

    setIsDownloading(true);
    try {
      // Log the download
      if (userEmail) {
        await supabase.from("product_downloads").insert({
          email: userEmail,
          product_id: "quick-check-lite",
          product_name: "AI Prompt Guide for Wellness Operators",
          product_type: "free",
          download_type: "free",
        });
      }

      // Generate and download PDF
      const doc = generateQuickCheck();
      doc.save("AI-Prompt-Guide-Wellness-Operators.pdf");
      toast.success("Download started!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Download failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleVerifyRedirect = () => {
    navigate("/auth?redirect=/newsletter/thank-you");
  };

  // Email preview content with premium icons instead of emojis
  const emailSections = [
    { icon: Star, label: "Editor's Choice", desc: "The story with full strategic analysis" },
    { icon: BarChart3, label: "Why It Matters", desc: "Executive summary and action points" },
    { icon: Lightbulb, label: "Commercial Angle", desc: "Revenue and efficiency opportunities" },
    { icon: ExternalLink, label: "Full Article Links", desc: "Quick access to original sources" },
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg space-y-8">
          {/* Logo */}
          <Link to="/" className="flex justify-center">
            <img src={logo} alt="Wellness Genius" className="h-10" />
          </Link>

          {/* Success Card */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg text-center space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
            </div>

            {/* Success Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
                You're in!
                <Sparkles className="h-5 w-5 text-primary" />
              </h1>
              <p className="text-muted-foreground">
                Check your inbox for a confirmation email. Your first strategic briefing will arrive soon.
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Free Resource CTA */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 text-left space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-primary font-semibold uppercase tracking-wide">
                    Your Free Resource
                  </p>
                  <h3 className="text-lg font-semibold text-foreground">
                    AI Prompt Guide for Wellness Operators
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    20+ battle-tested prompts to automate marketing, operations, and client engagement in your wellness business.
                  </p>
                </div>
              </div>

              {isVerified ? (
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleDownload}
                  disabled={isDownloading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isDownloading ? "Downloading..." : "Download Free Guide"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleVerifyRedirect}
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Verify Email to Download
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Create an account or sign in to access your free guide
                  </p>
                </div>
              )}
            </div>

            {/* Email Preview */}
            <div className="text-left space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">
                  What to expect in your inbox
                </h3>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-3 border border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Wellness Genius Weekly</p>
                    <p className="text-xs text-muted-foreground">AI & Wellness Weekly: Strategic Industry Intelligence</p>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-3">
                  "This week's top developments at the intersection of AI and the wellness economy—with strategic implications for your business."
                </p>

                <div className="space-y-2">
                  {emailSections.map((section, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <section.icon className="h-3.5 w-3.5 text-primary/70" />
                      <span className="font-medium">{section.label}</span>
                      <span className="text-muted-foreground/60">— {section.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Secondary Links */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link to="/insights">
                <Button variant="outline" size="sm">
                  Read Latest Insights
                </Button>
              </Link>
              <Link to="/ai-readiness">
                <Button variant="ghost" size="sm">
                  Take AI Readiness Index
                </Button>
              </Link>
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-center text-muted-foreground">
            Didn't receive the email? Check your spam folder or{" "}
            <Link to="/newsletter" className="text-primary hover:underline">
              try again
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default NewsletterThankYou;
