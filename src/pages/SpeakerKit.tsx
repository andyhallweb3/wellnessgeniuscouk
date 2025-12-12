import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Mic, Users, Lightbulb, Bot, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const topics = [
  {
    icon: Bot,
    title: "AI Agents for Business",
    description: "How to identify, build, and deploy AI agents that actually work — without the hype.",
    formats: ["Keynote", "Workshop", "Panel"],
  },
  {
    icon: TrendingUp,
    title: "Scaling with Automation",
    description: "Practical strategies for growing operations without proportionally growing headcount.",
    formats: ["Keynote", "Fireside Chat"],
  },
  {
    icon: Lightbulb,
    title: "AI Readiness for Leadership",
    description: "How to assess whether your organisation is truly ready for AI — and what to fix first.",
    formats: ["Workshop", "Executive Briefing"],
  },
  {
    icon: Users,
    title: "The Future of Wellness Tech",
    description: "Where technology and wellbeing intersect — trends, opportunities, and pitfalls.",
    formats: ["Keynote", "Panel"],
  },
];

const SpeakerKit = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="section-padding pt-32 lg:pt-40">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
                <Mic size={14} />
                <span>Speaker Kit</span>
              </div>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl mb-6 tracking-tight">
                Book Andy Hall for your event
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Practical, no-hype talks on AI, automation, and the future of wellness tech. 
                Available for keynotes, workshops, panels, and executive briefings.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="accent" size="lg" asChild>
                  <a href="mailto:andy@wellnessgenius.co.uk?subject=Speaking%20Enquiry">
                    Enquire About Speaking
                    <ArrowRight size={18} />
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="#assets">
                    <Download size={18} />
                    Download Assets
                  </a>
                </Button>
              </div>
            </div>
            
            {/* Headshot placeholder */}
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-32 h-32 rounded-full bg-accent/10 border border-accent/20 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-4xl font-semibold text-accent">AH</span>
                  </div>
                  <p className="text-lg font-semibold">Andy Hall</p>
                  <p className="text-sm text-muted-foreground">Founder, Wellness Genius</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-accent/20 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Bio */}
      <section className="section-padding bg-card">
        <div className="container-wide">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
              Bio
            </p>
            <h2 className="text-2xl lg:text-3xl mb-6 tracking-tight">
              About Andy
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Andy Hall is the founder of Wellness Genius, helping wellness, fitness, and hospitality 
                businesses scale through intelligent automation and AI agents.
              </p>
              <p>
                With a background spanning digital transformation, product development, and the wellness 
                industry, Andy brings a practical, outcome-focused perspective to every engagement. 
                No jargon, no hype — just actionable insights that leadership teams can implement immediately.
              </p>
              <p>
                Andy has worked with brands including Fitter Stock, The Leisure Experts, Nuforma, 
                and Awake Meditation, helping them streamline operations, deploy AI agents, and 
                build custom digital products.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Topics */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="max-w-2xl mb-12">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
              Speaking Topics
            </p>
            <h2 className="text-2xl lg:text-3xl mb-4 tracking-tight">
              What Andy speaks about
            </h2>
            <p className="text-muted-foreground">
              All talks can be tailored to your audience and format requirements.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {topics.map((topic, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl p-8 border border-border/50 hover:border-accent/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6">
                  <topic.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-3 tracking-tight">
                  {topic.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {topic.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {topic.formats.map((format) => (
                    <span
                      key={format}
                      className="px-3 py-1 rounded-full bg-secondary text-xs font-medium text-muted-foreground"
                    >
                      {format}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Downloadable Assets */}
      <section id="assets" className="section-padding bg-card">
        <div className="container-wide">
          <div className="max-w-2xl mb-12">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
              Media Assets
            </p>
            <h2 className="text-2xl lg:text-3xl mb-4 tracking-tight">
              Downloadable assets
            </h2>
            <p className="text-muted-foreground">
              High-resolution photos, logos, and bio text for event promotion.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-secondary/50 rounded-2xl p-6 border border-border/50">
              <div className="aspect-square rounded-xl bg-accent/10 border border-accent/20 mb-4 flex items-center justify-center">
                <span className="text-2xl font-semibold text-accent">AH</span>
              </div>
              <h3 className="font-semibold mb-1">Headshot</h3>
              <p className="text-sm text-muted-foreground mb-4">High-resolution portrait photo</p>
              <Button variant="outline" size="sm" className="w-full" disabled>
                <Download size={14} />
                Coming Soon
              </Button>
            </div>

            <div className="bg-secondary/50 rounded-2xl p-6 border border-border/50">
              <div className="aspect-square rounded-xl bg-accent/10 border border-accent/20 mb-4 flex items-center justify-center">
                <span className="text-lg font-semibold text-accent">WG</span>
              </div>
              <h3 className="font-semibold mb-1">Logo Pack</h3>
              <p className="text-sm text-muted-foreground mb-4">Wellness Genius logos (PNG, SVG)</p>
              <Button variant="outline" size="sm" className="w-full" disabled>
                <Download size={14} />
                Coming Soon
              </Button>
            </div>

            <div className="bg-secondary/50 rounded-2xl p-6 border border-border/50">
              <div className="aspect-square rounded-xl bg-accent/10 border border-accent/20 mb-4 flex items-center justify-center p-4">
                <p className="text-xs text-center text-muted-foreground">Speaker bio and credentials in text format</p>
              </div>
              <h3 className="font-semibold mb-1">Bio Text</h3>
              <p className="text-sm text-muted-foreground mb-4">Short and long bio versions</p>
              <Button variant="outline" size="sm" className="w-full" disabled>
                <Download size={14} />
                Coming Soon
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="bg-accent/10 border border-accent/20 rounded-3xl p-8 lg:p-12 text-center">
            <h2 className="text-2xl lg:text-3xl mb-4 tracking-tight">
              Interested in booking Andy?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Get in touch to discuss availability, topics, and format requirements for your event.
            </p>
            <Button variant="accent" size="lg" asChild>
              <a href="mailto:andy@wellnessgenius.co.uk?subject=Speaking%20Enquiry">
                Get in Touch
                <ArrowRight size={18} />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Back to Home */}
      <section className="section-padding pt-0">
        <div className="container-wide text-center">
          <Link 
            to="/" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </section>
    </div>
  );
};

export default SpeakerKit;