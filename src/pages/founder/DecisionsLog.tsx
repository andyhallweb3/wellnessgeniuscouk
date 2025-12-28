import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import FounderLayout from "@/components/founder/FounderLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { CheckCircle, Clock, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Decision {
  id: string;
  decision_summary: string;
  context: string | null;
  outcome: string | null;
  mode: string | null;
  created_at: string;
}

export default function DecisionsLog() {
  const { user } = useAuth();
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDecisions() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('genie_decisions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        setDecisions(data || []);
      } catch (error) {
        console.error('Error fetching decisions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDecisions();
  }, [user]);

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const StatusIcon = ({ outcome }: { outcome: string | null }) => {
    if (!outcome) {
      return <Clock className="h-4 w-4 text-amber-500" />;
    }
    if (outcome.toLowerCase().includes('success') || outcome.toLowerCase().includes('positive')) {
      return <CheckCircle className="h-4 w-4 text-accent" />;
    }
    if (outcome.toLowerCase().includes('fail') || outcome.toLowerCase().includes('negative')) {
      return <XCircle className="h-4 w-4 text-destructive" />;
    }
    return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <FounderLayout>
      <Helmet>
        <title>Decisions Log | Wellness Genius</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Decisions Log</h1>
        <p className="text-muted-foreground mt-1">
          Build founder judgment over time
        </p>
      </div>

      {/* Explanation */}
      <div className="founder-card mb-6 bg-muted/30">
        <p className="text-sm text-muted-foreground">
          Every decision logged here trains your strategic intuition. 
          Review outcomes to identify patterns in what works and what doesn't for your business.
        </p>
      </div>

      {/* Decisions List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="founder-card">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : decisions.length === 0 ? (
        <div className="founder-card text-center py-12">
          <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">No decisions logged yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Decisions made in the AI advisor will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {decisions.map((decision) => (
            <div key={decision.id} className="founder-card">
              <button
                className="w-full text-left"
                onClick={() => toggleExpanded(decision.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <StatusIcon outcome={decision.outcome} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground leading-tight">
                        {decision.decision_summary}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(decision.created_at), 'd MMM yyyy')}
                        {decision.mode && ` · ${decision.mode}`}
                      </p>
                    </div>
                  </div>
                  {(decision.context || decision.outcome) && (
                    expandedId === decision.id 
                      ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {expandedId === decision.id && (decision.context || decision.outcome) && (
                <div className="mt-4 pt-4 border-t border-border space-y-3">
                  {decision.context && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Context at the time</p>
                      <p className="text-sm text-foreground">{decision.context}</p>
                    </div>
                  )}
                  {decision.outcome && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Outcome</p>
                      <p className="text-sm text-foreground">{decision.outcome}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </FounderLayout>
  );
}