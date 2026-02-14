import { useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import HeroNew from "@/components/HeroNew";
import AIAdvisorSection from "@/components/AIAdvisorSection";
import SocialProofStrip from "@/components/SocialProofStrip";
import GuidedDiscovery from "@/components/GuidedDiscovery";
import PricingSimple from "@/components/PricingSimple";
import FAQSection from "@/components/FAQSection";
import FounderSection from "@/components/FounderSection";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import MobileBookCTA from "@/components/MobileBookCTA";

const Index = () => {
  const [discoveryContext, setDiscoveryContext] = useState<{ challenge: string; stage: string } | null>(null);

  const handleDiscoveryComplete = useCallback((challenge: string, stage: string) => {
    setDiscoveryContext({ challenge, stage });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Wellness Genius | AI Business Intelligence for Fitness & Wellness Operators</title>
        <meta name="description" content="AI-powered business intelligence for fitness and wellness operators. Get ROI calculators, industry benchmarks, and partnership insights. Trusted by 16,000+ leaders. Free assessment." />
        <link rel="canonical" href="https://wellnessgenius.co/" />
      </Helmet>
      <Header />
      <main>
        <HeroNew />
        <AIAdvisorSection />
        <SocialProofStrip />
        <GuidedDiscovery onDiscoveryComplete={handleDiscoveryComplete} />
        <PricingSimple discoveryContext={discoveryContext} />
        <FAQSection />
        <FounderSection />
        <Contact />
      </main>
      <Footer />
      <MobileBookCTA />
    </div>
  );
};

export default Index;
