import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2 } from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import GenieOnboarding from "@/components/genie/GenieOnboarding";
import ChatSidebar from "@/components/genie/ChatSidebar";
import ChatInterface from "@/components/genie/ChatInterface";
import DocumentManager from "@/components/genie/DocumentManager";
import TrustSettingsToggle from "@/components/genie/TrustSettingsToggle";
import { ADVISOR_MODES, CREDIT_COST_PER_MESSAGE } from "@/components/advisor/AdvisorModes";
import { useBusinessMemory } from "@/hooks/useBusinessMemory";
import { useCoachCredits } from "@/hooks/useCoachCredits";
import { useCoachDocuments } from "@/hooks/useCoachDocuments";
import { useGenieSessions } from "@/hooks/useGenieSessions";
import { useDailyBrief } from "@/hooks/useDailyBrief";
import { useTrustSettings } from "@/hooks/useTrustSettings";
import { TrustMetadata } from "@/components/genie/GenieMessage";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Message {
  role: "user" | "assistant";
  content: string;
  trustMetadata?: TrustMetadata;
}

interface GenieOnboardingData {
  business_name: string;
  business_type: string;
  revenue_model: string;
  annual_revenue_band: string;
  team_size: string;
  primary_goal: string;
  biggest_challenge: string;
  known_weak_spots: string[];
  key_metrics: string[];
  communication_style: string;
  decision_style: string;
}

const Genie = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMode, setSelectedMode] = useState("quick_question");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);

  const { brief: briefData, isLoading: isBriefLoading, generateBrief } = useDailyBrief();
  const { getMemoryContext, memory, loading: memoryLoading, saveMemory, refetch: refetchMemory } = useBusinessMemory();
  const { credits, loading: creditsLoading, deductCredits } = useCoachCredits();
  const { documents, uploading: uploadingDocument, uploadDocument, deleteDocument, updateDocumentCategory, updateDocumentDescription } = useCoachDocuments();
  const { sessions, loading: sessionsLoading, currentSessionId, setCurrentSessionId, saveSession, loadSession } = useGenieSessions();
  const { displayMode: trustDisplayMode } = useTrustSettings();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/genie");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!memoryLoading && !memory && user) {
      setShowOnboarding(true);
    }
  }, [memoryLoading, memory, user]);

  useEffect(() => {
    const modeFromUrl = searchParams.get("mode");
    if (modeFromUrl && ADVISOR_MODES.some(m => m.id === modeFromUrl)) {
      setSelectedMode(modeFromUrl);
    }
  }, [searchParams]);

  const handleOnboardingComplete = async (data: GenieOnboardingData) => {
    const success = await saveMemory({
      business_name: data.business_name,
      business_type: data.business_type,
      revenue_model: data.revenue_model,
      annual_revenue_band: data.annual_revenue_band,
      team_size: data.team_size,
      primary_goal: data.primary_goal,
      biggest_challenge: data.biggest_challenge,
      known_weak_spots: data.known_weak_spots,
      key_metrics: data.key_metrics,
      communication_style: data.communication_style,
      decision_style: data.decision_style,
    });
    
    if (success) {
      toast.success("Business profile saved!");
      setShowOnboarding(false);
      await refetchMemory();
    } else {
      toast.error("Failed to save profile.");
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setSelectedMode("quick_question");
  };

  const handleLoadSession = (session: { id: string; mode: string; messages: Message[] }) => {
    loadSession(session as Parameters<typeof loadSession>[0]);
    setMessages(session.messages);
    setSelectedMode(session.mode);
  };

  const handleSaveSession = useCallback(async (mode: string, msgs: Message[], sessionId?: string | null) => {
    return saveSession(mode, msgs, sessionId || currentSessionId);
  }, [saveSession, currentSessionId]);

  const handleGenerateBrief = async () => {
    if (credits.balance < CREDIT_COST_PER_MESSAGE) {
      toast.error("Not enough credits for daily briefing.");
      return;
    }
    const deducted = await deductCredits(CREDIT_COST_PER_MESSAGE, "daily_briefing");
    if (!deducted) {
      toast.error("Failed to deduct credits");
      return;
    }
    await generateBrief();
  };

  if (authLoading || creditsLoading || memoryLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Helmet>
          <title>Setup | AI Advisor</title>
        </Helmet>
        <Header />
        <main className="pt-24 pb-16 flex-1">
          <div className="container-narrow section-padding">
            <GenieOnboarding 
              onComplete={handleOnboardingComplete} 
              onSkip={() => setShowOnboarding(false)}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>AI Advisor | Wellness Genius</title>
        <meta name="description" content="Your AI business advisor for strategic decisions, competitive analysis, and growth planning." />
      </Helmet>
      
      <Header />
      
      <main className="pt-16 flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <ChatSidebar
          sessions={sessions}
          loading={sessionsLoading}
          currentSessionId={currentSessionId}
          onLoadSession={handleLoadSession}
          onNewChat={handleNewChat}
          onOpenSettings={() => setShowSettings(true)}
          onOpenDocuments={() => setShowDocuments(true)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Chat */}
        <ChatInterface
          messages={messages}
          setMessages={setMessages}
          selectedMode={selectedMode}
          setSelectedMode={setSelectedMode}
          credits={credits.balance}
          onDeductCredits={deductCredits}
          memoryContext={memory}
          trustDisplayMode={trustDisplayMode}
          onSaveSession={handleSaveSession}
          briefData={briefData}
          isBriefLoading={isBriefLoading}
          onGenerateBrief={handleGenerateBrief}
          documents={documents}
          onUploadDocument={uploadDocument}
          uploadingDocument={uploadingDocument}
          businessName={memory?.business_name || undefined}
          isFreeTrial={credits.isFreeTrial}
          daysRemaining={credits.isFreeTrial ? Math.max(0, Math.ceil((new Date(credits.freeTrialExpiresAt || "").getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : undefined}
        />
      </main>

      {/* Settings Sheet */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent side="right" className="w-[350px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>Settings</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3">Trust Display</h3>
              <TrustSettingsToggle />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Documents Sheet */}
      <Sheet open={showDocuments} onOpenChange={setShowDocuments}>
        <SheetContent side="right" className="w-[400px] sm:w-[500px]">
          <SheetHeader>
            <SheetTitle>Your Documents</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <DocumentManager
              documents={documents}
              onUpload={uploadDocument}
              onDelete={deleteDocument}
              onUpdateCategory={updateDocumentCategory}
              onUpdateDescription={updateDocumentDescription}
              uploading={uploadingDocument}
              loading={false}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Genie;
