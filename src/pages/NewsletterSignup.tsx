import { Helmet } from "react-helmet-async";
import { useNewsletter } from "@/hooks/useNewsletter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Sparkles, ArrowRight, CheckCircle, Users, Linkedin, TrendingUp, Building2 } from "lucide-react";
import logo from "@/assets/wellness-genius-logo-teal.webp";

const NewsletterSignup = () => {
  const { email, setEmail, isSubmitting, subscribe } = useNewsletter(true);

  const linkedInProfiles = [
    { name: "Andy", url: "https://www.linkedin.com/in/andyweb3", role: "Founder" },
    { name: "GWI AI Initiative", url: "https://www.linkedin.com/company/global-wellness-institute-ai-initiative/", role: "Partner" },
    { name: "Wellness Genius", url: "https://www.linkedin.com/company/wellnessgenius/", role: "Company" },
  ];

  return (
    <>
      <Helmet>
        <title>Subscribe to Wellness Genius | AI Strategy for Wellness Executives</title>
        <meta 
          name="description" 
          content="Weekly AI insights for wellness industry leaders. Strategic automation guidance, industry intelligence, and transformation strategies for CEOs, founders, and senior operators." 
        />
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.wellnessgenius.co.uk/newsletter" />
        <meta property="og:title" content="Subscribe to Wellness Genius | AI Strategy Newsletter" />
        <meta property="og:description" content="Join 2,600+ wellness executives getting weekly AI strategy insights. Strategic automation guidance, industry intelligence, and transformation playbooks." />
        <meta property="og:image" content="https://www.wellnessgenius.co.uk/images/wellness-genius-news-og.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Wellness Genius" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.wellnessgenius.co.uk/newsletter" />
        <meta name="twitter:title" content="Subscribe to Wellness Genius | AI Strategy Newsletter" />
        <meta name="twitter:description" content="Join 2,600+ wellness executives getting weekly AI strategy insights. No fluff—just actionable intelligence." />
        <meta name="twitter:image" content="https://www.wellnessgenius.co.uk/images/wellness-genius-news-og.png" />
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
                Free Weekly Intelligence
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                AI Strategy for Wellness Leaders
              </h1>
              <p className="text-muted-foreground">
                Join 2,600+ executives and senior operators getting strategic AI insights for the wellness industry.
              </p>
            </div>

            {/* Social Proof - Subscriber Count */}
            <div className="flex items-center justify-center gap-2 py-3 px-4 bg-muted/50 rounded-lg">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                2,600+ subscribers
              </span>
              <span className="text-xs text-muted-foreground">from our LinkedIn network</span>
            </div>

            {/* Benefits - Senior focused */}
            <ul className="space-y-3 text-sm">
              {[
                { icon: TrendingUp, text: "Strategic AI trends shaping the wellness economy" },
                { icon: Building2, text: "Transformation playbooks from industry leaders" },
                { icon: Sparkles, text: "Automation ROI frameworks for decision-makers" },
                { icon: CheckCircle, text: "No fluff—actionable insights only" },
              ].map((benefit, i) => (
                <li key={i} className="flex items-start gap-2">
                  <benefit.icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{benefit.text}</span>
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
                    Get Strategic Insights <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Subscribe now and get a free AI Prompt Guide for wellness operators
              </p>
            </form>

            {/* LinkedIn Social Proof */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-center text-muted-foreground mb-3">Connect with us</p>
              <div className="flex justify-center gap-3">
                {linkedInProfiles.map((profile) => (
                  <a
                    key={profile.url}
                    href={profile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-[#0A66C2] rounded-full text-xs font-medium transition-colors"
                  >
                    <Linkedin className="h-3 w-3" />
                    {profile.name}
                  </a>
                ))}
              </div>
            </div>

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
