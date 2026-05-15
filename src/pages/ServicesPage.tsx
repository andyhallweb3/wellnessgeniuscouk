import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Services from "@/components/Services";
import Contact from "@/components/Contact";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const ServicesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>AI Consulting for Fitness & Wellness Businesses | Wellness Genius</title>
        <meta name="description" content="Hands-on AI consulting, readiness sprints, and custom AI agent builds for gym operators, spa groups, and wellness brands. Delivered by the Chair of the GWI AI Initiative." />
        <link rel="canonical" href="https://wellnessgenius.co.uk/services" />
        <meta property="og:title" content="AI Consulting for Fitness & Wellness Businesses | Wellness Genius" />
        <meta property="og:description" content="From AI strategy to custom agent builds. Consulting for wellness operators who want to move fast." />
        <meta property="og:url" content="https://wellnessgenius.co.uk/services" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://wellnessgenius.co.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Consulting for Fitness & Wellness Businesses" />
        <meta name="twitter:description" content="Strategy to deployment. Consulting for wellness operators who want to move fast." />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://wellnessgenius.co.uk/" },
            { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://wellnessgenius.co.uk/services" }
          ]
        })}</script>
      </Helmet>
      
      <Header />
      
      <main className="pt-24">
        {/* Hero */}
        <section className="section-padding bg-gradient-to-b from-background to-card">
          <div className="container-wide">
            <Button variant="ghost" size="sm" className="mb-6" asChild>
              <Link to="/">
                <ArrowLeft size={16} />
                Back to Home
              </Link>
            </Button>
            
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
                Consulting & Custom Builds
              </p>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl tracking-tight mb-4">
                For when you need more than tools
              </h1>
              <p className="text-xl text-muted-foreground">
                Hands-on consulting, team training, and custom AI agent builds for wellness operators who want to move fast.
              </p>
            </div>
          </div>
        </section>

        <Services hideHeader />
        <Contact />
      </main>
      
      <Footer />
    </div>
  );
};

export default ServicesPage;
