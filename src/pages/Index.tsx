import Header from "@/components/Header";
import HeroNew from "@/components/HeroNew";
import CredibilityStack from "@/components/CredibilityStack";
import HowItWorksSimple from "@/components/HowItWorksSimple";
import DemoVideoSection from "@/components/DemoVideoSection";
import SocialProofStrip from "@/components/SocialProofStrip";
import AIAdvisorSection from "@/components/AIAdvisorSection";
import PricingSimple from "@/components/PricingSimple";
import FAQSection from "@/components/FAQSection";
import FounderSection from "@/components/FounderSection";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import MobileBookCTA from "@/components/MobileBookCTA";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroNew />
        <CredibilityStack />
        <HowItWorksSimple />
        <DemoVideoSection />
        <SocialProofStrip />
        <AIAdvisorSection />
        <PricingSimple />
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
