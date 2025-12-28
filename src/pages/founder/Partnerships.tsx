import { Helmet } from "react-helmet-async";
import FounderLayout from "@/components/founder/FounderLayout";
import { cn } from "@/lib/utils";
import { MessageCircle, Clock, Pause, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type PartnershipStatus = 'active' | 'dormant' | 'paused';

interface Partnership {
  name: string;
  type: string;
  status: PartnershipStatus;
  lastContact: string;
  fitScore: number;
  nextMove: string;
  insight: string;
}

export default function Partnerships() {
  const partnerships: Partnership[] = [
    {
      name: 'Wellness Tech Vendor A',
      type: 'Integration partner',
      status: 'active',
      lastContact: '3 days ago',
      fitScore: 85,
      nextMove: 'Schedule technical demo',
      insight: 'Strong alignment on target market. Ready for deeper technical discussion.'
    },
    {
      name: 'Industry Association',
      type: 'Content partner',
      status: 'active',
      lastContact: '1 week ago',
      fitScore: 78,
      nextMove: 'Submit guest article draft',
      insight: 'Good reach but limited conversion potential. Brand building only.'
    },
    {
      name: 'Fitness Equipment Brand',
      type: 'Distribution partner',
      status: 'dormant',
      lastContact: '3 weeks ago',
      fitScore: 72,
      nextMove: 'Follow up on proposal',
      insight: 'Initial interest but no response to detailed proposal. May need different approach.'
    },
    {
      name: 'Retreat Network',
      type: 'Referral partner',
      status: 'paused',
      lastContact: '2 months ago',
      fitScore: 65,
      nextMove: 'Re-evaluate fit',
      insight: 'Aligned with long-term positioning but will distract from current revenue focus.'
    }
  ];

  const StatusIcon = ({ status }: { status: PartnershipStatus }) => {
    switch (status) {
      case 'active':
        return <MessageCircle className="h-4 w-4 text-accent" />;
      case 'dormant':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const FitScoreBar = ({ score }: { score: number }) => (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-accent rounded-full"
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">{score}</span>
    </div>
  );

  return (
    <FounderLayout>
      <Helmet>
        <title>Partnerships | Wellness Genius</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Partnerships</h1>
        <p className="text-muted-foreground mt-1">
          Strategic relationships as leverage
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="founder-card text-center">
          <p className="founder-stat">{partnerships.filter(p => p.status === 'active').length}</p>
          <p className="founder-stat-label">Active</p>
        </div>
        <div className="founder-card text-center">
          <p className="founder-stat">{partnerships.filter(p => p.status === 'dormant').length}</p>
          <p className="founder-stat-label">Dormant</p>
        </div>
        <div className="founder-card text-center">
          <p className="founder-stat">{partnerships.filter(p => p.status === 'paused').length}</p>
          <p className="founder-stat-label">Paused</p>
        </div>
      </div>

      {/* Partnerships List */}
      <div className="space-y-4">
        {partnerships.map((partnership, index) => (
          <div key={index} className="founder-card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <StatusIcon status={partnership.status} />
                <div>
                  <h3 className="text-sm font-medium text-foreground">{partnership.name}</h3>
                  <p className="text-xs text-muted-foreground">{partnership.type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Strategic fit</p>
                <FitScoreBar score={partnership.fitScore} />
              </div>
            </div>

            <p className="founder-insight-text mb-4">{partnership.insight}</p>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Last contact: {partnership.lastContact}
              </p>
              <Button size="sm" variant="ghost" className="gap-1 text-xs h-7">
                {partnership.nextMove}
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </FounderLayout>
  );
}