import { Helmet } from "react-helmet-async";
import FounderLayout from "@/components/founder/FounderLayout";
import { cn } from "@/lib/utils";
import { User, FileText, Store, Code, Users } from "lucide-react";

interface GrowthLever {
  name: string;
  icon: typeof User;
  state: 'active' | 'dormant' | 'potential';
  upside: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  founderNeeded: boolean;
  insight: string;
}

export default function GrowthLevers() {
  const levers: GrowthLever[] = [
    {
      name: 'Partnerships',
      icon: Users,
      state: 'potential',
      upside: 'high',
      effort: 'medium',
      founderNeeded: true,
      insight: 'Strong inbound signal from wellness tech vendors. Low outbound follow-up creating missed opportunities. Founder intro recommended for 2-3 key prospects.'
    },
    {
      name: 'Content',
      icon: FileText,
      state: 'active',
      upside: 'medium',
      effort: 'medium',
      founderNeeded: false,
      insight: 'Consistent newsletter output driving engagement. Opportunity to repurpose into LinkedIn thought leadership. Leverage existing material rather than creating new.'
    },
    {
      name: 'Marketplace',
      icon: Store,
      state: 'dormant',
      upside: 'high',
      effort: 'high',
      founderNeeded: true,
      insight: 'Premium products exist but lack visibility. Requires strategic positioning and sales funnel optimisation. High effort but compounds over time.'
    },
    {
      name: 'SDK / Integrations',
      icon: Code,
      state: 'potential',
      upside: 'high',
      effort: 'high',
      founderNeeded: false,
      insight: 'Technical integration opportunities with wearables and fitness platforms. Long-term strategic value but requires significant development investment.'
    }
  ];

  const StateLabel = ({ state }: { state: GrowthLever['state'] }) => {
    const config = {
      'active': { label: 'Active', class: 'bg-accent/10 text-accent' },
      'dormant': { label: 'Dormant', class: 'bg-muted text-muted-foreground' },
      'potential': { label: 'Potential', class: 'bg-blue-500/10 text-blue-600' }
    };
    
    return (
      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", config[state].class)}>
        {config[state].label}
      </span>
    );
  };

  const UpsideIndicator = ({ level }: { level: 'high' | 'medium' | 'low' }) => {
    const bars = level === 'high' ? 3 : level === 'medium' ? 2 : 1;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "w-1.5 rounded-full",
              i <= bars ? "bg-accent" : "bg-muted",
              i === 1 && "h-2",
              i === 2 && "h-3",
              i === 3 && "h-4"
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <FounderLayout>
      <Helmet>
        <title>Growth Levers | Wellness Genius</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Growth Levers</h1>
        <p className="text-muted-foreground mt-1">
          Where leverage exists right now
        </p>
      </div>

      {/* Levers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {levers.map((lever, index) => {
          const Icon = lever.icon;
          
          return (
            <div key={index} className="founder-card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{lever.name}</h3>
                    <StateLabel state={lever.state} />
                  </div>
                </div>
              </div>

              <p className="founder-insight-text mb-4">{lever.insight}</p>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Upside</p>
                  <div className="flex items-center gap-2">
                    <UpsideIndicator level={lever.upside} />
                    <span className="text-xs font-medium capitalize">{lever.upside}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Effort</p>
                  <span className="text-xs font-medium capitalize">{lever.effort}</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Founder needed</p>
                  <span className={cn(
                    "text-xs font-medium",
                    lever.founderNeeded ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {lever.founderNeeded ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </FounderLayout>
  );
}