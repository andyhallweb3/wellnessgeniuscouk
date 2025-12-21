import Header from "@/components/Header";
import HeroNew from "@/components/HeroNew";
import AIAdvisorSection from "@/components/AIAdvisorSection";
import ProductsSection from "@/components/ProductsSection";
import Proof from "@/components/Proof";
import ServicesTeaser from "@/components/ServicesTeaser";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import MobileBookCTA from "@/components/MobileBookCTA";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroNew />
        <AIAdvisorSection />
        <ProductsSection />
        <Proof />
        <ServicesTeaser />
        <Contact />
      </main>
      <Footer />
      <MobileBookCTA />
    </div>
  );
};

export default Index;
