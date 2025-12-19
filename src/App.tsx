import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Products from "./pages/Products";
import AIReadinessLanding from "./pages/AIReadinessLanding";
import AIReadinessAssessmentFree from "./pages/AIReadinessAssessmentFree";
import AIReadinessAssessmentPaid from "./pages/AIReadinessAssessmentPaid";
import AIReadinessResults from "./pages/AIReadinessResults";
import AIReadinessCheckout from "./pages/AIReadinessCheckout";
import AIReadinessReport from "./pages/AIReadinessReport";
import SharedReport from "./pages/SharedReport";
import SpeakerKit from "./pages/SpeakerKit";
import Insights from "./pages/Insights";
import BlogPost from "./pages/BlogPost";
import LatestNews from "./pages/LatestNews";
import NewsletterAdmin from "./pages/NewsletterAdmin";
import Unsubscribe from "./pages/Unsubscribe";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/products" element={<Products />} />
          <Route path="/ai-readiness" element={<AIReadinessLanding />} />
          <Route path="/ai-readiness/start" element={<AIReadinessAssessmentFree />} />
          <Route path="/ai-readiness/full/:id" element={<AIReadinessAssessmentPaid />} />
          <Route path="/ai-readiness/results/:id" element={<AIReadinessResults />} />
          <Route path="/ai-readiness/checkout/:id" element={<AIReadinessCheckout />} />
          <Route path="/ai-readiness/report/:id" element={<AIReadinessReport />} />
          <Route path="/ai-readiness/share/:token" element={<SharedReport />} />
          <Route path="/speaker-kit" element={<SpeakerKit />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/insights/:slug" element={<BlogPost />} />
          <Route path="/news" element={<LatestNews />} />
          <Route path="/news/admin" element={<NewsletterAdmin />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/cookies" element={<CookiePolicy />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
