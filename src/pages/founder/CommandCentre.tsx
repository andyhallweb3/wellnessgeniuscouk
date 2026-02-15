import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import FounderLayout from "@/components/founder/FounderLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { 
  Drawer, 
  DrawerClose, 
  DrawerContent, 
  DrawerDescription, 
  DrawerFooter, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerTrigger 
} from "@/components/ui/drawer";
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  Lightbulb, 
  RefreshCw,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Brain,
  Save,
  Settings,
  Crosshair,
  Users,
  TrendingUp as Growth,
  DollarSign,
  Wallet,
  Code
} from "lucide-react";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import BusinessOnboardingModal from "@/components/founder/BusinessOnboardingModal";
import SubscriptionPaywall from "@/components/founder/SubscriptionPaywall";
import CompetitorWarRoom from "@/components/founder/CompetitorWarRoom";
import KanbanBoard from "@/components/founder/KanbanBoard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FocusItem {
  priority: string;
  why_now: string;
  if_ignored: string;
  next_step: string;
}

interface Signal {
  signal: string;
  direction: "up" | "down" | "neutral";
  meaning: string;
}

interface Decision {
  decision: string;
  context: string;
  recommended_option: string;
  confidence: string;
  tradeoffs: string;
}

interface Risk {
  item: string;
  reason: string;
}

interface Narrative {
  angle: string;
  why_it_matters: string;
  suggested_channel: string;
}

interface AgentData {
  founder_focus: FocusItem[];
  signals: Signal[];
  decisions_pending: Decision[];
  risks_and_distractions: Risk[];
  narrative_suggestions: Narrative[];
  meta: {
    generated_at: string;
    confidence_note: string;
    business_name?: string;
    perspective?: string;
    rag_used?: boolean;
    image_analyzed?: boolean;
  };
}

type PerspectiveMode = 'ceo' | 'cmo' | 'cfo' | 'cto' | 'investor';
const ALL_PERSPECTIVES: PerspectiveMode[] = ['ceo', 'cmo', 'cfo', 'cto', 'investor'];

interface BusinessProfile {
  id: string;
  user_id: string;
  business_name: string;
  industry: string | null;
  target_audience: string | null;
  current_goal: string | null;
  preferred_perspectives: string[] | null;
}

export default function CommandCentre() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  
  // Business profile state
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Subscription state
  const [subscriptionStatus, setSubscriptionStatus] = useState<'loading' | 'active' | 'inactive'>('loading');
  
  // Brain dump state
  const [brainDump, setBrainDump] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // Perspective mode state - now supports multiple selections
  const [perspectives, setPerspectives] = useState<PerspectiveMode[]>(['ceo']);

  // Check for checkout success
  useEffect(() => {
    const checkoutStatus = searchParams.get('checkout');
    if (checkoutStatus === 'success') {
      toast.success("Subscription activated! Welcome to Founder Agent Pro.");
      // Refresh subscription status
      checkSubscription();
    } else if (checkoutStatus === 'cancelled') {
      toast.info("Checkout cancelled.");
    }
  }, [searchParams]);

  // Check subscription status
  const checkSubscription = async () => {
    if (!user) return;
    
    try {
      const { data: subData, error: subError } = await supabase.functions.invoke('check-agent-subscription');
      
      if (subError) {
        console.error("Error checking subscription:", subError);
        setSubscriptionStatus('inactive');
        return;
      }

      setSubscriptionStatus(subData?.subscribed ? 'active' : 'inactive');
    } catch (err) {
      console.error("Error checking subscription:", err);
      setSubscriptionStatus('inactive');
    }
  };

  // Fetch business profile
  const fetchBusinessProfile = async () => {
    if (!user) return;
    
    setLoadingProfile(true);
    try {
      const { data: profile, error: profileError } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profile) {
        setBusinessProfile(profile);
        // Set perspectives from saved preference
        if (profile.preferred_perspectives && profile.preferred_perspectives.length > 0) {
          const validPerspectives = profile.preferred_perspectives.filter(
            (p: string) => ALL_PERSPECTIVES.includes(p as PerspectiveMode)
          ) as PerspectiveMode[];
          if (validPerspectives.length > 0) {
            setPerspectives(validPerspectives);
          }
        }
        setShowOnboarding(false);
      } else {
        setShowOnboarding(true);
      }
    } catch (err) {
      console.error("Error fetching business profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Fetch agent data
  const fetchAgentData = async () => {
    if (!businessProfile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data: responseData, error: fetchError } = await supabase.functions.invoke('founder-agent', {
        body: { 
          businessContext: null,
          perspectives: perspectives
        }
      });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (responseData.error) {
        throw new Error(responseData.error);
      }

      setData(responseData);
    } catch (err) {
      console.error("Error fetching agent data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch insights");
      toast.error("Failed to load insights");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!brainDump.trim() || !user) {
      toast.error("Please enter some text");
      return;
    }

    setSavingNote(true);
    try {
      const { error: insertError } = await supabase
        .from('founder_journal')
        .insert({
          user_id: user.id,
          content: brainDump.trim()
        });

      if (insertError) throw insertError;

      toast.success("Note saved! Refreshing insights...");
      setBrainDump("");
      
      // Auto-refresh the dashboard
      await fetchAgentData();
    } catch (err) {
      console.error("Error saving note:", err);
      toast.error("Failed to save note");
    } finally {
      setSavingNote(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('agent-customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error("Error opening portal:", err);
      toast.error("Failed to open subscription management");
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    fetchBusinessProfile();
  };

  // Initial data fetching
  useEffect(() => {
    if (user) {
      fetchBusinessProfile();
      checkSubscription();
    }
  }, [user]);

  // Fetch agent data when profile is loaded and subscription is active
  useEffect(() => {
    if (businessProfile && subscriptionStatus === 'active') {
      fetchAgentData();
    } else if (businessProfile && subscriptionStatus === 'inactive') {
      setLoading(false);
    }
  }, [businessProfile, subscriptionStatus, perspectives]);

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      high: "default",
      medium: "secondary",
      low: "outline"
    };
    return (
      <Badge variant={variants[confidence] || "outline"}>
        {confidence}
      </Badge>
    );
  };

  // Show skeleton while loading profile or subscription
  if (loadingProfile || subscriptionStatus === 'loading') {
    return (
      <FounderLayout>
        <Helmet>
          <title>Command Centre | Founder Agent</title>
        </Helmet>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </FounderLayout>
    );
  }

  // Show onboarding modal if no business profile
  if (showOnboarding && user) {
    return (
      <FounderLayout>
        <Helmet>
          <title>Welcome | Founder Agent</title>
        </Helmet>
        <BusinessOnboardingModal 
          open={showOnboarding}
          onComplete={handleOnboardingComplete}
          userId={user.id}
        />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Setting up your Founder Agent...</h2>
            <p className="text-muted-foreground">Complete the onboarding to get started</p>
          </div>
        </div>
      </FounderLayout>
    );
  }

  // Show paywall if not subscribed
  if (subscriptionStatus === 'inactive') {
    return (
      <FounderLayout>
        <Helmet>
          <title>Subscribe | Founder Agent</title>
        </Helmet>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Welcome, {businessProfile?.business_name}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Subscribe to unlock your personal AI strategic advisor
              </p>
            </div>
          </div>
          <SubscriptionPaywall />
        </div>
      </FounderLayout>
    );
  }

  if (loading) {
    return (
      <FounderLayout>
        <Helmet>
          <title>Command Centre | Founder Agent</title>
        </Helmet>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </FounderLayout>
    );
  }

  if (error) {
    return (
      <FounderLayout>
        <Helmet>
          <title>Command Centre | Founder Agent</title>
        </Helmet>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchAgentData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </FounderLayout>
    );
  }

  return (
    <FounderLayout>
      <Helmet>
        <title>Command Centre | {businessProfile?.business_name || 'Founder Agent'}</title>
        <meta name="description" content="Your personal AI strategic advisor" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {businessProfile?.business_name || 'Command Centre'}
            </h1>
            {data?.meta?.generated_at && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" />
                Updated {new Date(data.meta.generated_at).toLocaleTimeString()}
                {data?.meta?.perspective && (
                  <span className="ml-2">• {data.meta.perspective.toUpperCase()} view</span>
                )}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Perspective Selector */}
            <TooltipProvider delayDuration={300}>
              <ToggleGroup 
                type="multiple" 
                value={perspectives} 
                onValueChange={(value) => {
                  if (value.length === 0) return;
                  setPerspectives(value as PerspectiveMode[]);
                  if (businessProfile) {
                    supabase
                      .from('business_profiles')
                      .update({ preferred_perspectives: value })
                      .eq('id', businessProfile.id)
                      .then(({ error }) => {
                        if (error) console.error("Error saving perspectives:", error);
                      });
                  }
                }}
                className="bg-muted rounded-lg p-1"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem 
                      value="ceo" 
                      aria-label="CEO perspective"
                      className="data-[state=on]:bg-background data-[state=on]:shadow-sm px-3 py-1.5 text-xs font-medium"
                    >
                      <Users className="h-3 w-3 mr-1.5" />
                      CEO
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[200px]">
                    <p className="text-xs">Balanced strategic view across all business areas</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem 
                      value="cmo" 
                      aria-label="CMO perspective"
                      className="data-[state=on]:bg-background data-[state=on]:shadow-sm px-3 py-1.5 text-xs font-medium"
                    >
                      <Growth className="h-3 w-3 mr-1.5" />
                      CMO
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[200px]">
                    <p className="text-xs">Focus on growth, CAC, viral loops, and narrative. Ignores technical debt.</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem 
                      value="cfo" 
                      aria-label="CFO perspective"
                      className="data-[state=on]:bg-background data-[state=on]:shadow-sm px-3 py-1.5 text-xs font-medium"
                    >
                      <Wallet className="h-3 w-3 mr-1.5" />
                      CFO
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[200px]">
                    <p className="text-xs">Focus on cash flow, burn rate, runway, and capital allocation.</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem 
                      value="cto" 
                      aria-label="CTO perspective"
                      className="data-[state=on]:bg-background data-[state=on]:shadow-sm px-3 py-1.5 text-xs font-medium"
                    >
                      <Code className="h-3 w-3 mr-1.5" />
                      CTO
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[200px]">
                    <p className="text-xs">Focus on technical debt, architecture, and engineering capacity.</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem 
                      value="investor" 
                      aria-label="Investor perspective"
                      className="data-[state=on]:bg-background data-[state=on]:shadow-sm px-3 py-1.5 text-xs font-medium"
                    >
                      <DollarSign className="h-3 w-3 mr-1.5" />
                      Investor
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[200px]">
                    <p className="text-xs">Focus on ROI, scalability, and defensibility. Skeptical and risk-averse.</p>
                  </TooltipContent>
                </Tooltip>
              </ToggleGroup>
            </TooltipProvider>
            
            <Button onClick={handleManageSubscription} variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Subscription
            </Button>
            <Button onClick={fetchAgentData} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs defaultValue="dashboard">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Focus Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Target className="h-5 w-5 text-primary" />
                      Today's Focus
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {data?.founder_focus?.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <p className="font-medium">{item.priority}</p>
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">Why now:</span> {item.why_now}
                            </p>
                            <p className="text-sm text-amber-600 dark:text-amber-400">
                              <span className="font-medium">If ignored:</span> {item.if_ignored}
                            </p>
                          </div>
                          <Badge variant="secondary" className="shrink-0">
                            {item.next_step}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Decisions Section */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Decisions Pending</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {data?.decisions_pending?.map((decision, idx) => (
                      <Drawer key={idx}>
                        <DrawerTrigger asChild>
                          <button 
                            className="w-full p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-left flex items-center justify-between"
                            onClick={() => setSelectedDecision(decision)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-medium text-primary">{idx + 1}</span>
                              </div>
                              <div>
                                <p className="font-medium">{decision.decision}</p>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {decision.context}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getConfidenceBadge(decision.confidence)}
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </button>
                        </DrawerTrigger>
                        <DrawerContent>
                          <DrawerHeader>
                            <DrawerTitle>{decision.decision}</DrawerTitle>
                            <DrawerDescription>{decision.context}</DrawerDescription>
                          </DrawerHeader>
                          <div className="px-4 space-y-4">
                            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span className="font-medium text-green-800 dark:text-green-200">Recommended</span>
                                {getConfidenceBadge(decision.confidence)}
                              </div>
                              <p className="text-green-700 dark:text-green-300">{decision.recommended_option}</p>
                            </div>
                            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                                <span className="font-medium text-amber-800 dark:text-amber-200">Trade-offs</span>
                              </div>
                              <p className="text-amber-700 dark:text-amber-300">{decision.tradeoffs}</p>
                            </div>
                          </div>
                          <DrawerFooter>
                            <DrawerClose asChild>
                              <Button variant="outline">Close</Button>
                            </DrawerClose>
                          </DrawerFooter>
                        </DrawerContent>
                      </Drawer>
                    ))}
                  </CardContent>
                </Card>

                {/* Narrative Suggestions */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      Content Ideas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {data?.narrative_suggestions?.map((narrative, idx) => (
                        <div 
                          key={idx}
                          className="p-3 rounded-lg border bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30"
                        >
                          <p className="font-medium text-sm">{narrative.angle}</p>
                          <p className="text-xs text-muted-foreground mt-1">{narrative.why_it_matters}</p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {narrative.suggested_channel}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Brain Dump Section */}
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Brain className="h-5 w-5 text-primary" />
                      Brain Dump
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Share what's on your mind. The AI will factor this into its next analysis.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Textarea
                      placeholder="What's on your mind? Any concerns, ideas, or context the AI should know about..."
                      value={brainDump}
                      onChange={(e) => setBrainDump(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleSaveNote} 
                        disabled={savingNote || !brainDump.trim()}
                        size="sm"
                      >
                        {savingNote ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save & Refresh
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Side Column */}
              <div className="space-y-6">
                {/* Competitor War Room */}
                <CompetitorWarRoom />

                {/* Signals Ticker */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Live Signals</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {data?.signals?.map((signal, idx) => (
                      <div 
                        key={idx}
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="mt-0.5">
                          {getDirectionIcon(signal.direction)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{signal.signal}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {signal.meaning}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Risks & Distractions */}
                <Card className="border-red-200 dark:border-red-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg text-red-600 dark:text-red-400">
                      <AlertTriangle className="h-5 w-5" />
                      Risks & Distractions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {data?.risks_and_distractions?.map((risk, idx) => (
                      <div 
                        key={idx}
                        className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900"
                      >
                        <div className="flex items-start gap-2">
                          <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-medium text-sm text-red-800 dark:text-red-200">
                              {risk.item}
                            </p>
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                              {risk.reason}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Meta / Confidence */}
                {data?.meta?.confidence_note && (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">AI Confidence:</span> {data.meta.confidence_note}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <KanbanBoard />
          </TabsContent>
        </Tabs>
      </div>
    </FounderLayout>
  );
}
