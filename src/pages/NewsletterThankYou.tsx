import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Mail, Sparkles, FileText, Star, BarChart3, Lightbulb, ExternalLink, Gift, Copy, Check } from "lucide-react";
import logo from "@/assets/wellness-genius-logo-teal.webp";
import { toast } from "sonner";

const DISCOUNT_CODE = "LzcFF5Ii";

const NewsletterThankYou = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(DISCOUNT_CODE);
      setCopied(true);
      toast.success("Discount code copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
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

            {/* Free Resource CTA with Discount Code */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 text-left space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Gift className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-primary font-semibold uppercase tracking-wide">
                    Exclusive Subscriber Gift
                  </p>
                  <h3 className="text-lg font-semibold text-foreground">
                    AI Prompt Guide for Wellness Operators
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    20+ battle-tested prompts to automate marketing, operations, and client engagement. Worth £19.99 — <span className="text-primary font-medium">free for subscribers</span>.
                  </p>
                </div>
              </div>

              {/* Discount Code Box */}
              <div className="bg-background/80 border-2 border-dashed border-primary/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Your 100% Discount Code</p>
                    <p className="text-2xl font-mono font-bold text-primary tracking-wider">{DISCOUNT_CODE}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCopyCode}
                    className="flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-primary" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Apply this code at checkout to download your free guide
                </p>
              </div>

              <Link to="/products" className="block">
                <Button className="w-full" size="lg">
                  <FileText className="mr-2 h-4 w-4" />
                  Get Your Free Guide
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
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
