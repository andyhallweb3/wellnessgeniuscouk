import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2 } from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import AdvisorOnboarding from "@/components/advisor/AdvisorOnboarding";
import ChatSidebar from "@/components/genie/ChatSidebar";
import ChatInterface from "@/components/genie/ChatInterface";
import DocumentManager from "@/components/genie/DocumentManager";
import TrustSettingsToggle from "@/components/genie/TrustSettingsToggle";
import { ADVISOR_MODES, CREDIT_COST_PER_MESSAGE, getPrimaryModes } from "@/components/advisor/AdvisorModes";
import { useWorkspace } from "@/hooks/useWorkspace";
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
  const { profile, goals, constraints, isLoading: workspaceLoading, needsOnboarding, saveProfile, saveGoals, saveConstraints, addDecision, getContextString } = useWorkspace();
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
    if (!workspaceLoading && needsOnboarding && user) {
      setShowOnboarding(true);
    }
  }, [workspaceLoading, needsOnboarding, user]);

  useEffect(() => {
    const modeFromUrl = searchParams.get("mode");
    if (modeFromUrl && ADVISOR_MODES.some(m => m.id === modeFromUrl)) {
      setSelectedMode(modeFromUrl);
    }
  }, [searchParams]);

  const handleOnboardingComplete = async (data: { business_name: string; sector: string; business_size: string; goals: string[]; biggest_challenge: string; current_stack: string[] }) => {
    const profileSuccess = await saveProfile({
      business_name: data.business_name,
      sector: data.sector,
      business_size: data.business_size,
      onboarding_completed: true,
    });
    
    if (data.goals.length > 0) {
      await saveGoals({ goals: data.goals });
    }
    
    if (data.biggest_challenge) {
      await saveConstraints({ budget_range: data.biggest_challenge });
    }
    
    if (profileSuccess) {
      toast.success("Business profile saved!");
      setShowOnboarding(false);
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

  if (authLoading || creditsLoading || workspaceLoading) {
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
            <AdvisorOnboarding 
              onComplete={handleOnboardingComplete} 
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
        {/* Sidebar - hidden on mobile */}
        <div className="hidden md:block">
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
        </div>

        {/* Main Chat */}
        <ChatInterface
          messages={messages}
          setMessages={setMessages}
          selectedMode={selectedMode}
          setSelectedMode={setSelectedMode}
          credits={credits.balance}
          onDeductCredits={deductCredits}
          memoryContext={profile ? { business_name: profile.business_name, primary_goal: goals?.goals?.[0] } : null}
          trustDisplayMode={trustDisplayMode}
          onSaveSession={handleSaveSession}
          briefData={briefData}
          isBriefLoading={isBriefLoading}
          onGenerateBrief={handleGenerateBrief}
          documents={documents}
          onUploadDocument={uploadDocument}
          uploadingDocument={uploadingDocument}
          businessName={profile?.business_name || undefined}
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
            
            {/* Telegram Support */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-medium mb-3">Need Help?</h3>
              <a
                href="https://t.me/Wellnessgenius_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0088cc]/10 border border-[#0088cc]/30 text-[#0088cc] hover:bg-[#0088cc]/20 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Chat on Telegram
              </a>
              <p className="text-xs text-muted-foreground mt-2">Get instant support 24/7</p>
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
