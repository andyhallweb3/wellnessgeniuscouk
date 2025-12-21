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
        <title>Consulting Services | Wellness Genius</title>
        <meta name="description" content="AI consulting and custom builds for wellness businesses. From readiness sprints to full AI agent deployments." />
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

        <Services />
        <Contact />
      </main>
      
      <Footer />
    </div>
  );
};

export default ServicesPage;
