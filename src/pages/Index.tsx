import Header from "@/components/Header";
import HeroNew from "@/components/HeroNew";
import CredibilityStack from "@/components/CredibilityStack";
import ChooseYourPath from "@/components/ChooseYourPath";
import ValueFlowSection from "@/components/ValueFlowSection";
import AIAdvisorSection from "@/components/AIAdvisorSection";
import PricingComparison from "@/components/PricingComparison";
import FAQSection from "@/components/FAQSection";
import CaseStudySection from "@/components/CaseStudySection";
import ProductsSection from "@/components/ProductsSection";
import Proof from "@/components/Proof";
import FounderSection from "@/components/FounderSection";
import ServicesTeaser from "@/components/ServicesTeaser";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import MobileBookCTA from "@/components/MobileBookCTA";
import ScrollIndicator from "@/components/ScrollIndicator";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroNew />
        <CredibilityStack />
        <ScrollIndicator label="Find your starting point" />
        <ChooseYourPath />
        <ScrollIndicator label="See the journey" />
        <ValueFlowSection />
        <ScrollIndicator label="Meet your AI advisor" />
        <AIAdvisorSection />
        <PricingComparison />
        <FAQSection />
        <ScrollIndicator label="Real results" />
        <CaseStudySection />
        <ProductsSection />
        <Proof />
        <FounderSection />
        <ServicesTeaser />
        <ScrollIndicator label="Let's talk" variant="prominent" />
        <Contact />
      </main>
      <Footer />
      <MobileBookCTA />
    </div>
  );
};

export default Index;
