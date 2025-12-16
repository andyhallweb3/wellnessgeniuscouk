import { useMemo, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertTriangle, TrendingUp, CheckCircle, Sparkles, X, Check, Mail, Loader2 } from "lucide-react";
import { AssessmentAnswers, UserInfo } from "@/pages/AIReadinessIndex";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  pillar: string;
  text: string;
}

interface AssessmentResultsProps {
  answers: AssessmentAnswers;
  questions: Question[];
  userInfo: UserInfo;
}

type PillarStatus = "critical" | "warning" | "healthy" | "strong";

interface PillarInsight {
  status: PillarStatus;
  statusLabel: string;
  observedBehavior: string[];
  consequence: string;
}

const getPillarInsight = (pillar: string, score: number): PillarInsight => {
  const insights: Record<string, Record<PillarStatus, Omit<PillarInsight, "status" | "statusLabel">>> = {
    "Leadership & Strategy": {
      critical: {
        observedBehavior: [
          "AI discussed as a 'nice to have', not a business priority",
          "No single executive accountable for AI outcomes",
          "Budget requests stuck in approval cycles",
        ],
        consequence: "AI initiatives will fragment. Teams wait for permission or go rogue with shadow tools.",
      },
      warning: {
        observedBehavior: [
          "AI on the agenda, but competing with other priorities",
          "Ownership exists but lacks authority or resource",
          "Success metrics not clearly defined",
        ],
        consequence: "Pilots may launch, but will struggle to scale without clearer mandate.",
      },
      healthy: {
        observedBehavior: [
          "Clear executive sponsor with authority",
          "AI tied to specific business outcomes",
          "Budget allocated for experimentation",
        ],
        consequence: "You can move forward with confidence on focused initiatives.",
      },
      strong: {
        observedBehavior: [
          "AI embedded in strategic planning",
          "Leadership actively champions AI adoption",
          "Clear success metrics and accountability",
        ],
        consequence: "Foundation is strong. Focus on execution and scaling.",
      },
    },
    "Data & Infrastructure": {
      critical: {
        observedBehavior: [
          "Data exists but ownership is unclear",
          "Manual workarounds are common",
          "Systems don't talk to each other",
        ],
        consequence: "AI outputs won't be trusted. Automation increases risk instead of reducing it.",
      },
      warning: {
        observedBehavior: [
          "Some data is accessible, but quality varies",
          "Integration requires significant manual effort",
          "Technical debt slowing progress",
        ],
        consequence: "AI pilots will work in isolation but won't scale without infrastructure investment.",
      },
      healthy: {
        observedBehavior: [
          "Core data is documented and accessible",
          "Key systems are integrated",
          "Data quality processes in place",
        ],
        consequence: "Infrastructure can support task-specific AI agents.",
      },
      strong: {
        observedBehavior: [
          "Unified data layer across systems",
          "Real-time data access for automation",
          "Strong data governance",
        ],
        consequence: "Ready for sophisticated AI applications and multi-agent systems.",
      },
    },
    "People & Skills": {
      critical: {
        observedBehavior: [
          "Leadership sees AI as IT's problem",
          "Fear of job displacement is widespread",
          "No one knows what AI can realistically do",
        ],
        consequence: "Resistance will kill any AI initiative. People will work around, not with, new tools.",
      },
      warning: {
        observedBehavior: [
          "Curiosity exists but understanding is surface-level",
          "A few champions, but not enough advocates",
          "Training is ad-hoc or non-existent",
        ],
        consequence: "Early adopters will succeed, but organisation-wide rollout will stall.",
      },
      healthy: {
        observedBehavior: [
          "Leadership understands AI capabilities and limits",
          "Team open to new tools and processes",
          "Some practical experience with AI tools",
        ],
        consequence: "Human side is ready for focused AI deployment.",
      },
      strong: {
        observedBehavior: [
          "AI literacy embedded in leadership culture",
          "Teams actively exploring AI applications",
          "Change resistance is minimal",
        ],
        consequence: "People are your accelerator, not your blocker.",
      },
    },
    "Process & Operations": {
      critical: {
        observedBehavior: [
          "Key processes live in people's heads",
          "No one has mapped the repetitive tasks",
          "Decisions bottleneck at individuals",
        ],
        consequence: "You can't automate chaos. AI will expose and amplify existing dysfunction.",
      },
      warning: {
        observedBehavior: [
          "Some processes documented, many aren't",
          "Repetitive tasks identified but not prioritised",
          "Workflow visibility is limited",
        ],
        consequence: "Quick wins are possible, but scaling will require process work.",
      },
      healthy: {
        observedBehavior: [
          "Core workflows are documented",
          "High-value automation targets identified",
          "Decision points are clear",
        ],
        consequence: "Process clarity means AI can be deployed safely and measured accurately.",
      },
      strong: {
        observedBehavior: [
          "Processes optimised and continuously improved",
          "Clear candidates for automation across functions",
          "End-to-end visibility",
        ],
        consequence: "Operations are ready for significant AI-driven efficiency gains.",
      },
    },
    "Risk, Ethics & Governance": {
      critical: {
        observedBehavior: [
          "No guidelines for AI use exist",
          "GDPR and data privacy are afterthoughts",
          "No one is thinking about AI accountability",
        ],
        consequence: "You're one bad AI output away from a compliance incident or PR crisis.",
      },
      warning: {
        observedBehavior: [
          "Awareness of risks, but no formal framework",
          "Human oversight is inconsistent",
          "Policies haven't caught up with tool adoption",
        ],
        consequence: "Safe for low-risk pilots, but governance gap will limit what you can deploy.",
      },
      healthy: {
        observedBehavior: [
          "Guidelines for responsible AI use in place",
          "Human-in-the-loop for important decisions",
          "Data privacy properly considered",
        ],
        consequence: "Governance framework supports safe deployment.",
      },
      strong: {
        observedBehavior: [
          "Comprehensive AI governance framework",
          "Clear accountability and audit trails",
          "Proactive approach to AI ethics",
        ],
        consequence: "Risk posture enables ambitious AI deployment with confidence.",
      },
    },
  };

  let status: PillarStatus;
  if (score < 40) status = "critical";
  else if (score < 60) status = "warning";
  else if (score < 80) status = "healthy";
  else status = "strong";

  const statusLabels: Record<PillarStatus, string> = {
    critical: "Critical",
    warning: "Needs Work",
    healthy: "Healthy",
    strong: "Strong",
  };

  const pillarInsights = insights[pillar] || insights["Leadership & Strategy"];
  
  return {
    status,
    statusLabel: statusLabels[status],
    ...pillarInsights[status],
  };
};

const getBandContent = (score: number, weakestPillar: string, userRole: string) => {
  const roleInsights: Record<string, string> = {
    "CEO / Founder": "Your biggest leverage point is ownership. AI needs a named exec sponsor with real authority — and that's probably you.",
    "Head of Operations": "Your opportunity is process clarity. AI will expose messy workflows fast. Start by documenting what you want to automate.",
    "Head of Marketing": "You can move quickly on content and campaign automation — but risk inconsistency without guardrails.",
    "Head of Growth": "AI can accelerate lead qualification and sales velocity. Focus on one conversion bottleneck first.",
    "Head of Technology": "Your role is to enable, not own. Push for business ownership while you handle integration.",
    "Other": "Focus on finding the right internal champion. AI succeeds when business leaders own the outcome.",
  };

  if (score < 40) {
    return {
      headline: "Your business isn't ready for AI — and that's okay.",
      subheadline: "Most organisations at this stage waste money on tools. You're in a position to avoid that.",
      whatThisMeans: `Your biggest risk isn't technology — it's organisational readiness. Rushing into AI now will create frustration, wasted budget, and cynicism that makes future adoption harder. The good news? You've identified this before writing a single cheque.`,
      doList: [
        "Get clear on 2-3 business problems before touching tools",
        "Assign explicit AI ownership at exec level",
        "Document your most painful manual processes",
      ],
      dontList: [
        "Buy AI tools (you'll waste money)",
        "Let teams experiment without coordination",
        "Promise AI outcomes to the board yet",
      ],
      roleInsight: roleInsights[userRole] || roleInsights["Other"],
      roiSignal: "Organisations at your readiness level typically see value from AI only after fixing fundamentals — usually a 3-6 month investment before meaningful returns.",
      recommendation: "AI Readiness Sprint",
      recommendationDesc: "A 60-90 minute diagnostic that identifies exactly what's blocking you and creates a 90-day action plan.",
    };
  }
  
  if (score < 60) {
    return {
      headline: "You're AI-curious — but the foundations need work.",
      subheadline: `Your ${weakestPillar} is the bottleneck. Fix that, and you'll unlock real progress.`,
      whatThisMeans: `You have some building blocks in place, but gaps in ${weakestPillar.toLowerCase()} will cause pilots to stall. We see this pattern often: eager teams, promising starts, then frustration when things don't scale. The fix is usually education and alignment, not more tech.`,
      doList: [
        "Run 1 tightly scoped pilot in a low-risk area",
        "Invest in AI literacy for leadership",
        "Map your top 5 time-consuming manual tasks",
      ],
      dontList: [
        "Roll out AI tools company-wide",
        "Skip the education step",
        "Automate customer-facing processes yet",
      ],
      roleInsight: roleInsights[userRole] || roleInsights["Other"],
      roiSignal: "Organisations at your readiness level typically see early wins in internal admin tasks — often saving 3-5 hours per week per person once foundations are solid.",
      recommendation: "AI Literacy for Leaders",
      recommendationDesc: "Practical AI education that gets your leadership team aligned on what AI can (and can't) do — before you invest in builds.",
    };
  }
  
  if (score < 80) {
    return {
      headline: "Your business is ready for AI pilots — but not for scale.",
      subheadline: "You can deploy task-specific agents safely. The question is where to start.",
      whatThisMeans: `You have enough structure to test AI in narrow use cases. However, if you try to roll AI out across teams now, you'll likely see inconsistent usage, shadow AI tools, and limited ROI beyond early wins. This is where most organisations stall — not because they can't start, but because they scale too fast.`,
      doList: [
        "Identify 1 high-impact use case with clear metrics",
        "Start with an AI agent that replaces tasks, not roles",
        "Keep a human-in-the-loop for all outputs initially",
      ],
      dontList: [
        "Try to automate everything at once",
        "Skip the measurement framework",
        "Replace human decision-making prematurely",
      ],
      roleInsight: roleInsights[userRole] || roleInsights["Other"],
      roiSignal: "Organisations at your readiness level typically see 2-5x productivity gains in targeted areas — often saving 5-10 hours per week per function within the first quarter.",
      recommendation: "AI Agent Build",
      recommendationDesc: "One agent. One job. Real ROI. We design and deploy a working AI agent inside your business — something that actually runs.",
    };
  }
  
  return {
    headline: "You're in the top tier of AI readiness.",
    subheadline: "The question isn't whether to use AI — it's how to make it a competitive moat.",
    whatThisMeans: `Your organisation has the foundations to do more than pilot — you can build. The risk at your stage isn't readiness, it's ambition: either moving too slowly while competitors advance, or building disconnected point solutions that don't compound. Think systems, not tools.`,
    doList: [
      "Build AI agents that create lasting competitive advantage",
      "Design for multi-agent workflows",
      "Measure AI impact at the business level, not task level",
    ],
    dontList: [
      "Settle for off-the-shelf tools",
      "Wait for perfect conditions",
      "Underestimate the change management required",
    ],
    roleInsight: roleInsights[userRole] || roleInsights["Other"],
    roiSignal: "Organisations at your readiness level often see AI as a differentiator, not just an efficiency play — with the potential to reshape how you compete.",
    recommendation: "AI Agent Build",
    recommendationDesc: "Let's build a multi-agent system that creates lasting competitive advantage. You're ready to ship.",
  };
};

const statusConfig: Record<PillarStatus, { icon: string; color: string; bgColor: string }> = {
  critical: { icon: "❌", color: "text-red-500", bgColor: "bg-red-500/10" },
  warning: { icon: "⚠️", color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
  healthy: { icon: "✓", color: "text-accent", bgColor: "bg-accent/10" },
  strong: { icon: "★", color: "text-green-500", bgColor: "bg-green-500/10" },
};

const AssessmentResults = ({ answers, questions, userInfo }: AssessmentResultsProps) => {
  const { toast } = useToast();
  const emailSentRef = useRef(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const results = useMemo(() => {
    const pillarScores: { [key: string]: { total: number; count: number } } = {};
    
    questions.forEach((q) => {
      const answer = answers[q.id] || 3;
      if (!pillarScores[q.pillar]) {
        pillarScores[q.pillar] = { total: 0, count: 0 };
      }
      pillarScores[q.pillar].total += answer;
      pillarScores[q.pillar].count += 1;
    });

    const pillarResults = Object.entries(pillarScores).map(([pillar, { total, count }]) => ({
      pillar,
      score: Math.round((total / (count * 5)) * 100),
    }));

    const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
    const maxScore = questions.length * 5;
    const overallScore = Math.round((totalScore / maxScore) * 100);

    const weakestPillar = pillarResults.reduce((min, p) => 
      p.score < min.score ? p : min
    , pillarResults[0]);

    return { pillarResults, overallScore, weakestPillar };
  }, [answers, questions]);

  const content = getBandContent(results.overallScore, results.weakestPillar.pillar, userInfo.role);

  // Send email report once on mount
  useEffect(() => {
    if (emailSentRef.current) return;
    emailSentRef.current = true;

    const sendReport = async () => {
      setEmailStatus('sending');
      
      try {
        const { data, error } = await supabase.functions.invoke('send-readiness-report', {
          body: {
            userInfo,
            overallScore: results.overallScore,
            pillarResults: results.pillarResults.map(p => ({
              pillar: p.pillar,
              score: p.score,
              status: p.score < 40 ? 'Critical' : p.score < 60 ? 'Needs Work' : p.score < 80 ? 'Healthy' : 'Strong',
            })),
            headline: content.headline,
            recommendation: content.recommendation,
          },
        });

        if (error) throw error;

        setEmailStatus('sent');
        toast({
          title: "Report sent!",
          description: `Your AI Readiness Report has been emailed to ${userInfo.email}`,
        });
      } catch (err) {
        console.error('Failed to send report email:', err);
        setEmailStatus('error');
        toast({
          title: "Email delivery issue",
          description: "We couldn't send your report by email, but your results are shown below.",
          variant: "destructive",
        });
      }
    };

    sendReport();
  }, [userInfo, results, content, toast]);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Email status indicator */}
      {emailStatus !== 'idle' && (
        <div className={`mb-6 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm ${
          emailStatus === 'sending' ? 'bg-blue-500/10 text-blue-400' :
          emailStatus === 'sent' ? 'bg-green-500/10 text-green-400' :
          'bg-red-500/10 text-red-400'
        }`}>
          {emailStatus === 'sending' && (
            <>
              <Loader2 size={14} className="animate-spin" />
              Sending your report to {userInfo.email}...
            </>
          )}
          {emailStatus === 'sent' && (
            <>
              <Mail size={14} />
              Report sent to {userInfo.email}
            </>
          )}
          {emailStatus === 'error' && (
            <>
              <X size={14} />
              Couldn't send email — view results below
            </>
          )}
        </div>
      )}

      {/* Insight-Led Headline */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-muted-foreground text-sm mb-6">
          <span>AI Readiness Score:</span>
          <span className="font-semibold text-foreground">{results.overallScore}/100</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-heading font-medium mb-4">
          {content.headline}
        </h1>
        <p className="text-lg text-muted-foreground">
          {content.subheadline}
        </p>
      </div>

      {/* What This Means */}
      <div className="bg-card rounded-xl p-8 border border-border shadow-elegant mb-8">
        <h2 className="text-xl font-heading mb-4">What this means</h2>
        <p className="text-muted-foreground leading-relaxed">
          {content.whatThisMeans}
        </p>
      </div>

      {/* Pillar Insights */}
      <div className="bg-card rounded-xl p-8 border border-border shadow-elegant mb-8">
        <h2 className="text-xl font-heading mb-6">Where you're strong — and where you're exposed</h2>
        <div className="space-y-8">
          {results.pillarResults.map((pillar) => {
            const insight = getPillarInsight(pillar.pillar, pillar.score);
            const config = statusConfig[insight.status];
            
            return (
              <div key={pillar.pillar} className="border-b border-border pb-6 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading font-medium">{pillar.pillar}</h3>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${config.bgColor} ${config.color}`}>
                    <span>{config.icon}</span>
                    {insight.statusLabel}
                  </span>
                </div>
                
                <div className="mb-3">
                  <p className="text-sm text-muted-foreground mb-2">What we typically see at this stage:</p>
                  <ul className="space-y-1">
                    {insight.observedBehavior.map((behavior, idx) => (
                      <li key={idx} className="text-sm text-foreground/80 flex items-start gap-2">
                        <span className="text-muted-foreground mt-1">–</span>
                        {behavior}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className={`p-3 rounded-lg ${config.bgColor}`}>
                  <p className="text-sm">
                    <span className="font-medium">If left unresolved: </span>
                    <span className="text-muted-foreground">{insight.consequence}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Do / Don't Framework */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-accent/5 rounded-xl p-6 border border-accent/20">
          <h3 className="font-heading font-medium mb-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-accent" />
            What to do next
          </h3>
          <ul className="space-y-3">
            {content.doList.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-red-500/5 rounded-xl p-6 border border-red-500/20">
          <h3 className="font-heading font-medium mb-4 flex items-center gap-2">
            <X className="w-5 h-5 text-red-500" />
            What NOT to do (yet)
          </h3>
          <ul className="space-y-3">
            {content.dontList.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Role-Specific Insight */}
      <div className="bg-secondary/50 rounded-xl p-6 border border-border mb-8">
        <p className="text-sm text-muted-foreground mb-2">Based on your role as {userInfo.role}:</p>
        <p className="text-foreground font-medium">
          {content.roleInsight}
        </p>
      </div>

      {/* ROI Signal */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-elegant mb-8">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
          What to expect
        </h3>
        <p className="text-foreground">
          {content.roiSignal}
        </p>
      </div>

      {/* Recommendation & CTA */}
      <div className="bg-accent/10 rounded-xl p-8 border border-accent/20 mb-8">
        <p className="text-sm font-medium text-accent uppercase tracking-wider mb-2">
          Recommended Next Step
        </p>
        <h3 className="text-2xl font-heading mb-2">{content.recommendation}</h3>
        <p className="text-muted-foreground mb-6">
          {content.recommendationDesc}
        </p>
      </div>

      {/* Calendly Section */}
      <div id="book-call" className="bg-card rounded-xl p-8 border border-border shadow-elegant mb-8">
        <h3 className="text-xl font-heading mb-2 text-center">
          Pressure-test this with a human.
        </h3>
        <p className="text-muted-foreground text-center mb-2">
          In a 30-minute AI Readiness Review, we will:
        </p>
        <ul className="text-sm text-muted-foreground text-center mb-6 space-y-1">
          <li>– Validate this diagnosis</li>
          <li>– Identify 1 high-ROI AI use case</li>
          <li>– Flag risks before money is wasted</li>
        </ul>
        <div className="text-center mb-6">
          <Button variant="accent" size="lg" asChild>
            <a href="https://calendly.com/andy-wellnessgenius/30min" target="_blank" rel="noopener noreferrer">
              Book AI Readiness Review
              <ArrowRight size={16} />
            </a>
          </Button>
        </div>
        <div 
          className="calendly-inline-widget rounded-lg overflow-hidden" 
          data-url="https://calendly.com/andy-wellnessgenius/30min?hide_gdpr_banner=1"
          style={{ minWidth: '320px', height: '700px' }}
        />
        <script 
          type="text/javascript" 
          src="https://assets.calendly.com/assets/external/widget.js" 
          async 
        />
      </div>

      {/* Consultant's Note */}
      <div className="bg-secondary/30 rounded-xl p-6 border border-border">
        <p className="text-sm text-muted-foreground italic">
          <span className="font-medium not-italic">Consultant's note: </span>
          The biggest mistake organisations at your stage make is mistaking early success for readiness. AI amplifies what already exists — good or bad. The honest conversation is always more valuable than the quick fix.
        </p>
      </div>
    </div>
  );
};

export default AssessmentResults;
