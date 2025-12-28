import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import FounderLayout from "@/components/founder/FounderLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, subDays } from "date-fns";
import { ArrowUp, ArrowDown, Minus, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Signal {
  type: 'positive' | 'negative' | 'neutral';
  label: string;
  detail: string;
}

interface Priority {
  id: string;
  title: string;
  why: string;
  consequence: string;
  action: string;
}

interface PendingDecision {
  id: string;
  summary: string;
  context: string | null;
  confidence: number;
  recommendation: string;
  created_at: string;
}

export default function FounderToday() {
  const { user } = useAuth();
  const [subscriberCount, setSubscriberCount] = useState<number>(0);
  const [weeklyGrowth, setWeeklyGrowth] = useState<number>(0);
  const [recentArticles, setRecentArticles] = useState<number>(0);
  const [pendingDecisions, setPendingDecisions] = useState<PendingDecision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFounderData() {
      if (!user) return;

      try {
        // Fetch newsletter subscriber count
        const { count: totalSubs } = await supabase
          .from('newsletter_subscribers')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        setSubscriberCount(totalSubs || 0);

        // Fetch subscribers from last 7 days for growth
        const weekAgo = subDays(new Date(), 7).toISOString();
        const { count: newSubs } = await supabase
          .from('newsletter_subscribers')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)
          .gte('subscribed_at', weekAgo);

        setWeeklyGrowth(newSubs || 0);

        // Fetch recent articles count (last 7 days)
        const { count: articlesCount } = await supabase
          .from('articles')
          .select('*', { count: 'exact', head: true })
          .eq('processed', true)
          .gte('published_at', weekAgo);

        setRecentArticles(articlesCount || 0);

        // Fetch pending decisions (decisions without outcomes)
        const { data: decisions } = await supabase
          .from('genie_decisions')
          .select('*')
          .eq('user_id', user.id)
          .is('outcome', null)
          .order('created_at', { ascending: false })
          .limit(5);

        if (decisions) {
          setPendingDecisions(decisions.map(d => ({
            id: d.id,
            summary: d.decision_summary,
            context: d.context,
            confidence: 75, // Placeholder - could be calculated
            recommendation: 'Review context and decide',
            created_at: d.created_at
          })));
        }
      } catch (error) {
        console.error('Error fetching founder data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFounderData();
  }, [user]);

  // Generate signals based on data
  const signals: Signal[] = [
    {
      type: weeklyGrowth > 0 ? 'positive' : weeklyGrowth < 0 ? 'negative' : 'neutral',
      label: 'Subscriber momentum',
      detail: weeklyGrowth > 0 
        ? `${weeklyGrowth} new subscribers this week` 
        : 'Subscriber growth flat this week'
    },
    {
      type: recentArticles >= 3 ? 'positive' : recentArticles > 0 ? 'neutral' : 'negative',
      label: 'Content pipeline',
      detail: `${recentArticles} articles published in the last 7 days`
    },
    {
      type: pendingDecisions.length > 3 ? 'negative' : pendingDecisions.length > 0 ? 'neutral' : 'positive',
      label: 'Decision backlog',
      detail: pendingDecisions.length > 0 
        ? `${pendingDecisions.length} decisions awaiting resolution` 
        : 'All decisions resolved'
    }
  ];

  // Generate priorities based on data
  const priorities: Priority[] = [
    {
      id: '1',
      title: 'Review newsletter content quality',
      why: 'Subscriber engagement directly impacts retention and word-of-mouth growth',
      consequence: 'Declining open rates and increased unsubscribes',
      action: 'Audit last 3 newsletters for relevance and value density'
    },
    {
      id: '2',
      title: 'Strengthen partnership pipeline',
      why: 'Partnerships provide leverage without linear effort investment',
      consequence: 'Growth remains dependent on content alone',
      action: 'Identify 2-3 complementary brands for outreach'
    },
    {
      id: '3',
      title: 'Clarify monetisation pathway',
      why: 'Revenue enables reinvestment and sustainability',
      consequence: 'Prolonged dependency on time-for-value exchange',
      action: 'Define MVP offering and pricing structure'
    }
  ];

  const SignalIcon = ({ type }: { type: Signal['type'] }) => {
    switch (type) {
      case 'positive':
        return <ArrowUp className="h-4 w-4 text-accent" />;
      case 'negative':
        return <ArrowDown className="h-4 w-4 text-destructive" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <FounderLayout>
      <Helmet>
        <title>Founder Today | Wellness Genius</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Founder Focus</h1>
        <p className="text-muted-foreground mt-1">
          {format(new Date(), 'EEEE, d MMMM yyyy')}
        </p>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Priorities */}
        <div className="founder-card">
          <h2 className="founder-section-title">Today's Priorities</h2>
          <div className="space-y-4">
            {priorities.map((priority, index) => (
              <div key={priority.id} className="founder-priority-card">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-medium flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground leading-tight">
                      {priority.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-2">
                      <span className="font-medium">Why now:</span> {priority.why}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium">If ignored:</span> {priority.consequence}
                    </p>
                    <p className="text-xs text-accent mt-2">
                      {priority.action}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Signals */}
        <div className="founder-card">
          <h2 className="founder-section-title">Live Signals</h2>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="founder-stat">{subscriberCount.toLocaleString()}</p>
              <p className="founder-stat-label">Active subscribers</p>
            </div>
            <div>
              <p className={cn(
                "founder-stat",
                weeklyGrowth > 0 ? "founder-signal-positive" : "text-foreground"
              )}>
                {weeklyGrowth > 0 ? '+' : ''}{weeklyGrowth}
              </p>
              <p className="founder-stat-label">This week</p>
            </div>
          </div>

          {/* Signal List */}
          <div className="space-y-3">
            {signals.map((signal, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 py-3 border-t border-border first:border-0 first:pt-0"
              >
                <SignalIcon type={signal.type} />
                <div>
                  <p className="text-sm font-medium text-foreground">{signal.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{signal.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Pending Decisions */}
        <div className="founder-card">
          <h2 className="founder-section-title">Decisions Pending</h2>
          
          {pendingDecisions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle className="h-8 w-8 text-accent mb-3" />
              <p className="text-sm font-medium text-foreground">All clear</p>
              <p className="text-xs text-muted-foreground mt-1">
                No decisions awaiting your input
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingDecisions.map((decision) => (
                <div key={decision.id} className="founder-priority-card">
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground leading-tight">
                        {decision.summary}
                      </p>
                      {decision.context && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {decision.context}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-3">
                        <Button size="sm" variant="default" className="h-7 text-xs">
                          Decide
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs">
                          Defer
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </FounderLayout>
  );
}