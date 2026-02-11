import { Button } from "@/components/ui/button";
import { ArrowRight, Mic, Users, Lightbulb, Bot, TrendingUp, BookOpen, Linkedin, Twitter, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import andyHeadshot from "@/assets/andy-headshot.jpeg";
import beyondRepsCover from "@/assets/beyond-reps-cover.jpeg";
import gwiLogo from "@/assets/logos/gwi-logo.svg";

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
      <Helmet>
        <title>Speaker Kit — Andy Hall | Wellness Genius</title>
        <meta name="description" content="Book Andy Hall for keynotes, workshops, and panels on AI, automation, and the future of wellness tech." />
      </Helmet>
      <Header />
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
              <Button variant="accent" size="lg" asChild>
                <a href="mailto:andy@wellnessgenius.co.uk?subject=Speaking%20Enquiry">
                  Enquire About Speaking
                  <ArrowRight size={18} />
                </a>
              </Button>
            </div>
            
            {/* Headshot */}
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden border border-accent/20">
                <img 
                  src={andyHeadshot} 
                  alt="Andy Hall speaking" 
                  className="w-full h-full object-cover object-top"
                />
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
                businesses scale through intelligent automation and AI agents. He also chairs the{" "}
                <a 
                  href="https://globalwellnessinstitute.org/ai-initiative/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-accent hover:underline inline-flex items-center gap-1"
                >
                  Global Wellness Institute AI Initiative
                  <ExternalLink size={14} />
                </a>
                , shaping policy and best practices for AI adoption across the wellness sector.
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
            
            {/* AI Initiative Card */}
            <div className="mt-8 bg-secondary/50 rounded-2xl p-6 border border-border/50">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Chair of</p>
              <a
                href="https://globalwellnessinstitute.org/ai-initiative/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group"
              >
                <img 
                  src={gwiLogo} 
                  alt="Global Wellness Institute" 
                  className="h-12 w-auto"
                />
                <div>
                  <p className="font-semibold text-foreground group-hover:text-accent transition-colors">
                    AI Initiative
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Shaping AI policy for the wellness industry
                  </p>
                </div>
                <ExternalLink size={16} className="text-muted-foreground ml-auto" />
              </a>
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap gap-3 mt-6">
              <a
                href="https://www.linkedin.com/in/andyweb3"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border/50 text-sm hover:border-accent/30 transition-colors"
              >
                <Linkedin size={16} className="text-accent" />
                LinkedIn
              </a>
              <a
                href="https://twitter.com/andy_web_3"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border/50 text-sm hover:border-accent/30 transition-colors"
              >
                <Twitter size={16} className="text-accent" />
                @andy_web_3
              </a>
              <a
                href="https://www.linkedin.com/company/global-wellness-institute-ai-initiative/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border/50 text-sm hover:border-accent/30 transition-colors"
              >
                <Linkedin size={16} className="text-accent" />
                GWI AI Initiative
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Published Work */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
              Published Work
            </p>
            <h2 className="text-2xl lg:text-3xl mb-6 tracking-tight">
              Beyond Reps: The Rise of Wellbeing in the Fitness Industry
            </h2>
            <div className="bg-card rounded-2xl p-8 border border-border/50">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="w-32 sm:w-40 flex-shrink-0">
                  <img 
                    src={beyondRepsCover} 
                    alt="Beyond Reps book cover" 
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>
                <div>
                  <p className="text-lg font-semibold mb-2">Chapter 13: Proving The Shift</p>
                  <p className="text-muted-foreground mb-4">
                    Andy contributed a chapter on data and AI in the wellness industry, exploring how 
                    data-driven approaches are transforming the sector. Featured alongside 18 other 
                    industry leaders sharing how they're creating a new story for fitness.
                  </p>
                  <blockquote className="border-l-2 border-accent pl-4 italic text-muted-foreground">
                    "Wellness without data is just storytelling and the industry's ready for a new narrative."
                  </blockquote>
                  <p className="text-sm text-muted-foreground mt-4 mb-4">
                    Edited by Dr Glenda Rivoallan & Casey Conrad
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://www.amazon.co.uk/Beyond-Reps-Wellbeing-Fitness-Industry-ebook/dp/B0FQG9D2FP" target="_blank" rel="noopener noreferrer">
                      Buy on Amazon
                      <ArrowRight size={14} />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Topics */}
      <section className="section-padding bg-card">
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
                className="bg-secondary/50 rounded-2xl p-8 border border-border/50 hover:border-accent/30 transition-all duration-300"
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
      <Footer />
    </div>
  );
};

export default SpeakerKit;