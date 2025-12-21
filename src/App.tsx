import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ScrollToTop from "@/components/ScrollToTop";
import FloatingCoachButton from "@/components/coach/FloatingCoachButton";
import SiteOnboarding from "@/components/onboarding/SiteOnboarding";
import CookieConsent from "@/components/CookieConsent";
import Index from "./pages/Index";
import Products from "./pages/Products";
import Bundles from "./pages/Bundles";
import Auth from "./pages/Auth";
import MemberHub from "./pages/MemberHub";
import DownloadsLibrary from "./pages/DownloadsLibrary";
import AICoach from "./pages/AICoach";
import AIGenius from "./pages/AIGenius";
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
import DownloadsAdmin from "./pages/DownloadsAdmin";
import EmailTemplatesAdmin from "./pages/EmailTemplatesAdmin";
import CoachCreditsAdmin from "./pages/CoachCreditsAdmin";
import Admin from "./pages/Admin";
import Unsubscribe from "./pages/Unsubscribe";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import HowToUseStack from "./pages/HowToUseStack";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/products" element={<Products />} />
            <Route path="/bundles" element={<Bundles />} />
            <Route path="/how-to-use" element={<HowToUseStack />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/member-hub" element={<Navigate to="/hub" replace />} />
            <Route path="/hub" element={<MemberHub />} />
            <Route path="/hub/downloads" element={<DownloadsLibrary />} />
            <Route path="/hub/coach" element={<AICoach />} />
            <Route path="/ai-coach" element={<AICoach />} />
            <Route path="/ai-genius" element={<AIGenius />} />
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
            <Route path="/admin" element={<Admin />} />
            <Route path="/news/admin" element={<NewsletterAdmin />} />
            <Route path="/downloads/admin" element={<DownloadsAdmin />} />
            <Route path="/emails/admin" element={<EmailTemplatesAdmin />} />
            <Route path="/coach/admin" element={<CoachCreditsAdmin />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/cookies" element={<CookiePolicy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <FloatingCoachButton />
          <SiteOnboarding />
          <CookieConsent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
