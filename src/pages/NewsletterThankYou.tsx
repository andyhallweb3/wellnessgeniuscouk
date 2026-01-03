import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Mail, Sparkles, Star, BarChart3, Lightbulb, ExternalLink, Gift } from "lucide-react";
import logo from "@/assets/wellness-genius-logo-teal.webp";

const NewsletterThankYou = () => {
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
                Create your free account to access your AI Prompt Pack in your Downloads Library.
              </p>
            </div>

            {/* Spam Notice */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm">
              <p className="text-amber-700 dark:text-amber-400 font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Check your inbox
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                We've sent a confirmation email to your inbox. Check <span className="font-medium">spam or promotions</span> if you don't see it.
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Free Resource CTA - Account First Flow */}
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

              {/* Steps to claim */}
              <div className="bg-background/80 border border-border rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-foreground">How to claim your free guide:</p>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Create your free account using the same email</li>
                  <li>Your AI Prompt Pack will be waiting in your <span className="font-medium text-foreground">Downloads Library</span></li>
                  <li>Download anytime — it's yours to keep!</li>
                </ol>
              </div>

              <Link to="/auth?signup=true" className="block">
                <Button className="w-full" size="lg">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create Free Account
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
