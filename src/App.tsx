import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ScrollToTop from "@/components/ScrollToTop";
import CookieConsent from "@/components/CookieConsent";
import HubHome from "./pages/hub/HubHome";
import HubResources from "./pages/hub/Resources";
import SectorsIndex from "./pages/hub/SectorsIndex";
import SectorPage from "./pages/hub/SectorPage";
import Briefing from "./pages/hub/Briefing";
import BriefingIssue from "./pages/hub/BriefingIssue";
import Auth from "./pages/Auth";
import DownloadsLibrary from "./pages/DownloadsLibrary";

import AIReadinessLanding from "./pages/AIReadinessLanding";
import AIReadinessAssessmentFree from "./pages/AIReadinessAssessmentFree";
import AIReadinessResults from "./pages/AIReadinessResults";
import SharedReport from "./pages/SharedReport";
import SpeakerKit from "./pages/SpeakerKit";
import Articles from "./pages/hub/Articles";
import BlogPost from "./pages/BlogPost";
import LatestNews from "./pages/LatestNews";
import NewsletterAdmin from "./pages/NewsletterAdmin";
import DownloadsAdmin from "./pages/DownloadsAdmin";
import EmailTemplatesAdmin from "./pages/EmailTemplatesAdmin";
import FeedbackAdmin from "./pages/FeedbackAdmin";
import ValidationErrorsAdmin from "./pages/ValidationErrorsAdmin";
import KnowledgeBaseAdmin from "./pages/KnowledgeBaseAdmin";
import KBCanonAdmin from "./pages/KBCanonAdmin";
import KBIntelAdmin from "./pages/KBIntelAdmin";
import WorkspacesAdmin from "./pages/WorkspacesAdmin";
import CouponAnalyticsAdmin from "./pages/CouponAnalyticsAdmin";
import Admin from "./pages/Admin";
import AdminDocs from "./pages/AdminDocs";
import Unsubscribe from "./pages/Unsubscribe";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import PrivacyPlaybook from "./pages/PrivacyPlaybook";
import PrivacyReadinessLanding from "./pages/PrivacyReadinessLanding";
import PrivacyReadinessAssessment from "./pages/PrivacyReadinessAssessment";
import PrivacyReadinessResults from "./pages/PrivacyReadinessResults";
import NotFound from "./pages/NotFound";
import NewsletterSignup from "./pages/NewsletterSignup";
import NewsletterThankYou from "./pages/NewsletterThankYou";
import StructuredAIEbook from "./pages/StructuredAIEbook";
import WellnessAssessment from "./pages/WellnessAssessment";
import WellnessDashboard from "./pages/WellnessDashboard";
import Developer from "@/pages/Developer";

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
            <Route path="/" element={<HubHome />} />
            <Route path="/resources" element={<HubResources />} />
            <Route path="/sectors" element={<SectorsIndex />} />
            <Route path="/sectors/:slug" element={<SectorPage />} />
            <Route path="/briefing" element={<Briefing />} />
            <Route path="/briefing/:slug" element={<BriefingIssue />} />
            <Route path="/thought-leadership" element={<Navigate to="/briefing" replace />} />
            <Route path="/pricing" element={<Navigate to="/resources" replace />} />
            <Route path="/products" element={<Navigate to="/resources" replace />} />
            <Route path="/products/legacy" element={<Navigate to="/resources" replace />} />
            <Route path="/bundles" element={<Navigate to="/resources" replace />} />
            <Route path="/bundles/legacy" element={<Navigate to="/resources" replace />} />
            <Route path="/how-to-use" element={<Navigate to="/" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/member-hub" element={<Navigate to="/" replace />} />
            <Route path="/hub" element={<Navigate to="/" replace />} />
            <Route path="/hub/downloads" element={<DownloadsLibrary />} />
            <Route path="/hub/structured-ai-ebook" element={<StructuredAIEbook />} />
            <Route path="/structured-ai" element={<Navigate to="/hub/structured-ai-ebook" replace />} />
            <Route path="/hub/coach" element={<Navigate to="/" replace />} />
            <Route path="/ai-coach" element={<Navigate to="/" replace />} />
            <Route path="/ai-genius" element={<Navigate to="/" replace />} />
            <Route path="/genie" element={<Navigate to="/" replace />} />
            <Route path="/advisor" element={<Navigate to="/" replace />} />
            <Route path="/ai-advisor" element={<Navigate to="/" replace />} />
            <Route path="/ai-readiness" element={<AIReadinessLanding />} />
            <Route path="/ai-readiness/start" element={<AIReadinessAssessmentFree />} />
            <Route path="/ai-readiness/full/:id" element={<Navigate to="/ai-readiness" replace />} />
            <Route path="/ai-readiness/results/:id" element={<AIReadinessResults />} />
            <Route path="/ai-readiness/checkout/:id" element={<Navigate to="/ai-readiness" replace />} />
            <Route path="/ai-readiness/report/:id" element={<Navigate to="/ai-readiness" replace />} />
            <Route path="/ai-readiness/share/:token" element={<SharedReport />} />
            <Route path="/privacy-playbook" element={<PrivacyPlaybook />} />
            <Route path="/privacy-readiness" element={<PrivacyReadinessLanding />} />
            <Route path="/privacy-readiness/start" element={<PrivacyReadinessAssessment />} />
            <Route path="/privacy-readiness/results" element={<PrivacyReadinessResults />} />
            <Route path="/speaker-kit" element={<SpeakerKit />} />
            <Route path="/services" element={<Navigate to="/" replace />} />
            <Route path="/software" element={<Navigate to="/" replace />} />
            <Route path="/insights" element={<Articles />} />
            <Route path="/articles" element={<Navigate to="/insights" replace />} />
            <Route path="/insights/:slug" element={<BlogPost />} />
            <Route path="/news" element={<LatestNews />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/docs" element={<AdminDocs />} />
            <Route path="/news/admin" element={<NewsletterAdmin />} />
            <Route path="/downloads/admin" element={<DownloadsAdmin />} />
            <Route path="/emails/admin" element={<EmailTemplatesAdmin />} />
            <Route path="/coach/admin" element={<Navigate to="/admin" replace />} />
            <Route path="/feedback/admin" element={<FeedbackAdmin />} />
            <Route path="/validation/admin" element={<ValidationErrorsAdmin />} />
            <Route path="/knowledge/admin" element={<KnowledgeBaseAdmin />} />
            <Route path="/admin/kb-canon" element={<KBCanonAdmin />} />
            <Route path="/admin/kb-intel" element={<KBIntelAdmin />} />
            <Route path="/admin/workspaces" element={<WorkspacesAdmin />} />
            <Route path="/coupons/admin" element={<CouponAnalyticsAdmin />} />
            <Route path="/roadmap" element={<Navigate to="/" replace />} />
            <Route path="/structured-ai" element={<StructuredAIEbook />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
            <Route path="/subscribe" element={<NewsletterSignup />} />
            <Route path="/newsletter" element={<NewsletterSignup />} />
            <Route path="/newsletter/thank-you" element={<NewsletterThankYou />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/cookies" element={<CookiePolicy />} />
            {/* Consumer Wellness Product */}
            <Route path="/wellness" element={<WellnessAssessment />} />
            <Route path="/wellness/dashboard" element={<WellnessDashboard />} />
            {/* Redirect legacy agent route */}
            <Route path="/agent" element={<Navigate to="/" replace />} />
            {/* Founder Command Centre (admin only) */}
            <Route path="/founder" element={<Navigate to="/" replace />} />
            <Route path="/founder/health" element={<Navigate to="/" replace />} />
            <Route path="/founder/growth" element={<Navigate to="/" replace />} />
            <Route path="/founder/narrative" element={<Navigate to="/" replace />} />
            <Route path="/founder/partnerships" element={<Navigate to="/" replace />} />
            <Route path="/founder/decisions" element={<Navigate to="/" replace />} />
            <Route path="/founder/guardrails" element={<Navigate to="/" replace />} />
            <Route path="/founder/command" element={<Navigate to="/" replace />} />
            <Route path="/founder/content" element={<Navigate to="/" replace />} />
            <Route path="/founder/nudge" element={<Navigate to="/" replace />} />
            <Route path="/developer" element={<Navigate to="/" replace />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          {/* AI advisor floating button hidden while the site runs as a free hub. */}
          {/* Site tour removed: it introduced the AI advisor. */}
          <CookieConsent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
