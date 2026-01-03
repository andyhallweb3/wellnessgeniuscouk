import { Helmet } from "react-helmet-async";
import { useNewsletter } from "@/hooks/useNewsletter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import logo from "@/assets/wellness-genius-logo-teal.webp";

const NewsletterSignup = () => {
  const { email, setEmail, isSubmitting, subscribe } = useNewsletter();

  return (
    <>
      <Helmet>
        <title>Subscribe to Wellness Genius | AI Insights for Wellness Operators</title>
        <meta 
          name="description" 
          content="Get weekly AI insights, automation strategies, and industry trends for wellness business operators. Join 500+ operators staying ahead of the curve." 
        />
        <meta property="og:title" content="Subscribe to Wellness Genius Newsletter" />
        <meta property="og:description" content="Weekly AI insights for wellness business operators" />
        <meta property="og:image" content="/images/wellness-genius-news-og.png" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img 
              src={logo} 
              alt="Wellness Genius" 
              className="h-12 w-auto"
            />
          </div>

          {/* Main Card */}
          <div className="bg-card border border-border rounded-2xl shadow-xl p-8 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-2">
                <Sparkles className="h-4 w-4" />
                Free Weekly Insights
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                AI + Wellness Business
              </h1>
              <p className="text-muted-foreground">
                Join 500+ wellness operators getting actionable AI strategies every week.
              </p>
            </div>

            {/* Benefits */}
            <ul className="space-y-3 text-sm">
              {[
                "Curated AI news relevant to wellness operators",
                "Automation strategies that save 10+ hours/week",
                "Industry trends before they go mainstream",
                "No spam, unsubscribe anytime"
              ].map((benefit, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>

            {/* Form */}
            <form onSubmit={(e) => subscribe(e, "landing-page")} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Subscribing..."
                ) : (
                  <>
                    Subscribe <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Trust */}
            <p className="text-xs text-center text-muted-foreground">
              We respect your privacy. Read our{" "}
              <a href="/privacy" className="underline hover:text-foreground">
                privacy policy
              </a>
              .
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            © {new Date().getFullYear()} Wellness Genius
          </p>
        </div>
      </div>
    </>
  );
};

export default NewsletterSignup;
