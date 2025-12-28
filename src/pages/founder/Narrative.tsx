import { Helmet } from "react-helmet-async";
import FounderLayout from "@/components/founder/FounderLayout";
import { Check, X, Lightbulb, TrendingUp, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Narrative() {
  const { toast } = useToast();

  const resonatingThemes = [
    'Practical AI adoption for wellness operators',
    'Data privacy as competitive advantage',
    'Human-centred automation',
    'Measurable ROI from technology investment'
  ];

  const overusedThemes = [
    'Generic AI hype without specifics',
    'Technology for technology\'s sake',
    'Disruption rhetoric'
  ];

  const thoughtLeadershipAngles = [
    {
      headline: 'Why wellness operators should ignore 90% of AI advice',
      hook: 'Most AI guidance comes from people who\'ve never run a gym, spa, or retreat. Here\'s what actually matters.',
      type: 'contrarian'
    },
    {
      headline: 'The hidden cost of not automating member communication',
      hook: 'It\'s not the software cost that matters. It\'s the compounding loss of member lifetime value.',
      type: 'insight'
    },
    {
      headline: 'Three questions before you buy any wellness tech',
      hook: 'The vendors won\'t ask these. Your members will thank you for asking them.',
      type: 'practical'
    }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Ready to paste into LinkedIn or X.",
    });
  };

  return (
    <FounderLayout>
      <Helmet>
        <title>Narrative & Content | Wellness Genius</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Narrative & Content</h1>
        <p className="text-muted-foreground mt-1">
          Protect and sharpen the Wellness Genius story
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Resonating */}
        <div className="founder-card">
          <h2 className="founder-section-title">Themes resonating</h2>
          <div className="space-y-3">
            {resonatingThemes.map((theme, index) => (
              <div key={index} className="flex items-start gap-3">
                <Check className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{theme}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Overused */}
        <div className="founder-card">
          <h2 className="founder-section-title">Avoid overusing</h2>
          <div className="space-y-3">
            {overusedThemes.map((theme, index) => (
              <div key={index} className="flex items-start gap-3">
                <X className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{theme}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Thought Leadership */}
      <div className="founder-card">
        <h2 className="founder-section-title">Suggested thought leadership</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Draft angles based on current signals and audience engagement patterns
        </p>

        <div className="space-y-4">
          {thoughtLeadershipAngles.map((angle, index) => (
            <div key={index} className="founder-priority-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-accent" />
                    <span className="text-xs font-medium text-muted-foreground uppercase">
                      {angle.type}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-foreground mb-2">
                    {angle.headline}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {angle.hook}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => copyToClipboard(`${angle.headline}\n\n${angle.hook}`)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </FounderLayout>
  );
}