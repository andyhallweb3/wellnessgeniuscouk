import { Helmet } from "react-helmet-async";
import FounderLayout from "@/components/founder/FounderLayout";
import { ArrowUp, ArrowDown, Minus, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type HealthStatus = 'strong' | 'steady' | 'at-risk';

interface HealthMetric {
  label: string;
  status: HealthStatus;
  insight: string;
}

export default function BusinessHealth() {
  // These would be calculated from real data
  const overallHealth: HealthStatus = 'steady' as HealthStatus;
  
  const metrics: HealthMetric[] = [
    {
      label: 'Engagement health',
      status: 'strong',
      insight: 'Newsletter open rates remain above 45%, indicating strong content-market fit. Click-through rates suggest readers find value in curated insights.'
    },
    {
      label: 'Retention trajectory',
      status: 'steady',
      insight: 'Unsubscribe rate stable at 0.3% per send. No concerning patterns detected. Long-term subscriber cohorts showing consistent engagement.'
    },
    {
      label: 'Revenue motion',
      status: 'at-risk',
      insight: 'Monetisation remains flat due to limited product exposure. Premium offerings not yet visible to engaged audience segments.'
    },
    {
      label: 'Product signal',
      status: 'steady',
      insight: 'AI Readiness Assessment showing moderate completion rates. Users who complete are highly engaged. Drop-off occurs at email capture.'
    }
  ];

  const StatusIcon = ({ status }: { status: HealthStatus }) => {
    switch (status) {
      case 'strong':
        return <CheckCircle className="h-5 w-5 text-accent" />;
      case 'at-risk':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <Minus className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const StatusLabel = ({ status }: { status: HealthStatus }) => {
    const labels = {
      'strong': 'Strong',
      'steady': 'Steady',
      'at-risk': 'Needs attention'
    };
    
    return (
      <span className={cn(
        "text-xs font-medium px-2 py-0.5 rounded-full",
        status === 'strong' && "bg-accent/10 text-accent",
        status === 'steady' && "bg-muted text-muted-foreground",
        status === 'at-risk' && "bg-amber-500/10 text-amber-600"
      )}>
        {labels[status]}
      </span>
    );
  };

  return (
    <FounderLayout>
      <Helmet>
        <title>Business Health | Wellness Genius</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Business Health</h1>
        <p className="text-muted-foreground mt-1">
          Trajectory and momentum indicators
        </p>
      </div>

      {/* Overall Status */}
      <div className="founder-card mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="founder-section-title mb-0">Overall trajectory</h2>
            <p className="text-xl font-semibold mt-2">
              {overallHealth === 'strong' ? 'Moving forward' : overallHealth === 'at-risk' ? 'Needs attention' : 'Holding steady'}
            </p>
          </div>
          <StatusIcon status={overallHealth} />
        </div>
        <p className="founder-insight-text mt-4">
          The business is maintaining momentum with strong engagement fundamentals. 
          Revenue remains the primary constraint, limiting reinvestment capacity. 
          Content quality continues to drive organic growth.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="founder-card">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground">{metric.label}</h3>
              <StatusLabel status={metric.status} />
            </div>
            <p className="founder-insight-text">{metric.insight}</p>
          </div>
        ))}
      </div>
    </FounderLayout>
  );
}