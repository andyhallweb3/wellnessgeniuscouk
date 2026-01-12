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
import ServicesPage from "./pages/ServicesPage";
import SoftwarePage from "./pages/SoftwarePage";
import AIGenius from "./pages/AIGenius";
import Genie from "./pages/Genie";
import AIReadinessLanding from "./pages/AIReadinessLanding";
import AIAdvisorLanding from "./pages/AIAdvisorLanding";
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
import FeedbackAdmin from "./pages/FeedbackAdmin";
import ValidationErrorsAdmin from "./pages/ValidationErrorsAdmin";
import KnowledgeBaseAdmin from "./pages/KnowledgeBaseAdmin";
import KBCanonAdmin from "./pages/KBCanonAdmin";
import KBIntelAdmin from "./pages/KBIntelAdmin";
import WorkspacesAdmin from "./pages/WorkspacesAdmin";
import CouponAnalyticsAdmin from "./pages/CouponAnalyticsAdmin";
import Roadmap from "./pages/Roadmap";
import Admin from "./pages/Admin";
import AdminDocs from "./pages/AdminDocs";
import Unsubscribe from "./pages/Unsubscribe";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import HowToUseStack from "./pages/HowToUseStack";
import PrivacyPlaybook from "./pages/PrivacyPlaybook";
import PrivacyReadinessLanding from "./pages/PrivacyReadinessLanding";
import PrivacyReadinessAssessment from "./pages/PrivacyReadinessAssessment";
import PrivacyReadinessResults from "./pages/PrivacyReadinessResults";
import NotFound from "./pages/NotFound";
import NewsletterSignup from "./pages/NewsletterSignup";
import NewsletterThankYou from "./pages/NewsletterThankYou";
import FounderToday from "./pages/founder/FounderToday";
import BusinessHealth from "./pages/founder/BusinessHealth";
import GrowthLevers from "./pages/founder/GrowthLevers";
import Narrative from "./pages/founder/Narrative";
import Partnerships from "./pages/founder/Partnerships";
import DecisionsLog from "./pages/founder/DecisionsLog";
import Guardrails from "./pages/founder/Guardrails";
import CommandCentre from "./pages/founder/CommandCentre";
import StructuredAIEbook from "./pages/StructuredAIEbook";

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
            <Route path="/hub/structured-ai-ebook" element={<StructuredAIEbook />} />
            <Route path="/structured-ai" element={<Navigate to="/hub/structured-ai-ebook" replace />} />
            <Route path="/hub/coach" element={<Navigate to="/genie" replace />} />
            <Route path="/ai-coach" element={<Navigate to="/genie" replace />} />
            <Route path="/ai-genius" element={<AIGenius />} />
            <Route path="/genie" element={<Genie />} />
            <Route path="/advisor" element={<AIAdvisorLanding />} />
            <Route path="/ai-advisor" element={<AIAdvisorLanding />} />
            <Route path="/ai-readiness" element={<AIReadinessLanding />} />
            <Route path="/ai-readiness/start" element={<AIReadinessAssessmentFree />} />
            <Route path="/ai-readiness/full/:id" element={<AIReadinessAssessmentPaid />} />
            <Route path="/ai-readiness/results/:id" element={<AIReadinessResults />} />
            <Route path="/ai-readiness/checkout/:id" element={<AIReadinessCheckout />} />
            <Route path="/ai-readiness/report/:id" element={<AIReadinessReport />} />
            <Route path="/ai-readiness/share/:token" element={<SharedReport />} />
            <Route path="/privacy-playbook" element={<PrivacyPlaybook />} />
            <Route path="/privacy-readiness" element={<PrivacyReadinessLanding />} />
            <Route path="/privacy-readiness/start" element={<PrivacyReadinessAssessment />} />
            <Route path="/privacy-readiness/results" element={<PrivacyReadinessResults />} />
            <Route path="/speaker-kit" element={<SpeakerKit />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/software" element={<SoftwarePage />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/insights/:slug" element={<BlogPost />} />
            <Route path="/news" element={<LatestNews />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/docs" element={<AdminDocs />} />
            <Route path="/news/admin" element={<NewsletterAdmin />} />
            <Route path="/downloads/admin" element={<DownloadsAdmin />} />
            <Route path="/emails/admin" element={<EmailTemplatesAdmin />} />
            <Route path="/coach/admin" element={<CoachCreditsAdmin />} />
            <Route path="/feedback/admin" element={<FeedbackAdmin />} />
            <Route path="/validation/admin" element={<ValidationErrorsAdmin />} />
            <Route path="/knowledge/admin" element={<KnowledgeBaseAdmin />} />
            <Route path="/admin/kb-canon" element={<KBCanonAdmin />} />
            <Route path="/admin/kb-intel" element={<KBIntelAdmin />} />
            <Route path="/admin/workspaces" element={<WorkspacesAdmin />} />
            <Route path="/coupons/admin" element={<CouponAnalyticsAdmin />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/structured-ai" element={<StructuredAIEbook />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
            <Route path="/subscribe" element={<NewsletterSignup />} />
            <Route path="/newsletter" element={<NewsletterSignup />} />
            <Route path="/newsletter/thank-you" element={<NewsletterThankYou />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/cookies" element={<CookiePolicy />} />
            {/* Founder Command Centre (admin only) */}
            <Route path="/founder" element={<FounderToday />} />
            <Route path="/founder/health" element={<BusinessHealth />} />
            <Route path="/founder/growth" element={<GrowthLevers />} />
            <Route path="/founder/narrative" element={<Narrative />} />
            <Route path="/founder/partnerships" element={<Partnerships />} />
            <Route path="/founder/decisions" element={<DecisionsLog />} />
            <Route path="/founder/guardrails" element={<Guardrails />} />
            <Route path="/founder/command" element={<CommandCentre />} />
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
