import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Contact from "@/components/Contact";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Bot, Code, Zap, Globe, Layers, Clock, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const softwareServices = [
  {
    icon: Bot,
    title: "AI Agent Build",
    tagline: "One agent. One job. Real ROI.",
    description: "We design and deploy a working AI agent inside your business. No theory. No decks. Something that runs.",
    price: "From £8,000",
    timeline: "4-8 weeks",
    whoItsFor: [
      "Companies past the AI-curious phase",
      "Teams drowning in admin, sales ops, support",
      "Organisations ready to prove ROI",
    ],
    deliverables: [
      "Use case definition + success metric",
      "Working AI agent (web / internal tool)",
      "Integrations (CRM, calendar, email, forms)",
      "Documentation + handover",
      "Optional ongoing support (£750–£1,500/month)",
    ],
    format: "MVP deployment with optional maintenance retainer",
    popular: true,
  },
  {
    icon: Code,
    title: "Bespoke Tech Build",
    tagline: "Websites, apps, platforms — built for your business.",
    description: "Custom digital products designed and developed from scratch. From marketing sites to full platforms.",
    price: "From £10,000",
    timeline: "4-12 weeks",
    whoItsFor: [
      "Brands needing a new website",
      "Startups building MVPs",
      "Operators wanting custom platforms",
    ],
    deliverables: [
      "Discovery & scoping workshop",
      "UI/UX design",
      "Full development & deployment",
      "Integrations (payments, CRM, APIs)",
      "Training & handover documentation",
    ],
    format: "End-to-end product build with ongoing support options",
    popular: false,
  },
];

const techStack = [
  { name: "React / Next.js", category: "Frontend" },
  { name: "TypeScript", category: "Language" },
  { name: "Supabase", category: "Backend" },
  { name: "OpenAI / Anthropic", category: "AI" },
  { name: "Stripe", category: "Payments" },
  { name: "Vercel / AWS", category: "Hosting" },
];

const SoftwarePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Software Development | Wellness Genius</title>
        <meta name="description" content="Custom AI agents, websites, apps, and platforms built for wellness businesses. From MVPs to full-scale deployments." />
      </Helmet>
      
      <Header />
      
      <main className="pt-24">
        {/* Hero */}
        <section className="section-padding bg-gradient-to-b from-background to-card">
          <div className="container-wide">
            <Button variant="ghost" size="sm" className="mb-6" asChild>
              <Link to="/">
                <ArrowLeft size={16} />
                Back to Home
              </Link>
            </Button>
            
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
                Software Development
              </p>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl tracking-tight mb-4">
                Build with purpose
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                Custom AI agents, websites, apps, and platforms designed and built specifically for your wellness business.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="accent" size="lg" asChild>
                  <a href="#contact">
                    Discuss Your Project
                    <ArrowRight size={16} />
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/services">
                    View Consulting Services
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* What We Build */}
        <section className="section-padding bg-card">
          <div className="container-wide">
            <div className="max-w-2xl mb-12">
              <h2 className="text-3xl lg:text-4xl mb-4 tracking-tight">What we build</h2>
              <p className="text-muted-foreground text-lg">
                From AI-powered automation to complete digital platforms, we handle the technical heavy lifting.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {softwareServices.map((service, index) => (
                <div
                  key={index}
                  className={`relative bg-secondary/50 rounded-2xl p-8 transition-all duration-300 hover:bg-secondary ${
                    service.popular ? "ring-2 ring-accent shadow-glow-sm" : "border border-border/50"
                  }`}
                >
                  {service.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
                      Most Popular
                    </div>
                  )}

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-accent/10 border border-accent/20">
                      <service.icon className="w-6 h-6 text-accent" />
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mb-2 tracking-tight">
                    {service.title}
                  </h3>
                  <p className="text-accent text-sm font-medium mb-3">
                    {service.tagline}
                  </p>
                  <p className="text-muted-foreground text-sm mb-6">
                    {service.description}
                  </p>

                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-2xl font-semibold tracking-tight">
                      {service.price}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    Timeline: {service.timeline}
                  </p>

                  <div className="mb-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Who it's for
                    </p>
                    <ul className="space-y-1">
                      {service.whoItsFor.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <div className="w-1 h-1 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-6">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      What you get
                    </p>
                    <ul className="space-y-2">
                      {service.deliverables.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-xs text-muted-foreground mb-6 border-t border-border/50 pt-4">
                    {service.format}
                  </p>

                  <Button
                    variant={service.popular ? "accent" : "outline"}
                    className="w-full"
                    asChild
                  >
                    <a href="#contact">
                      Get Started
                      <ArrowRight size={16} />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="section-padding">
          <div className="container-wide">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl lg:text-4xl mb-4 tracking-tight">Our tech stack</h2>
              <p className="text-muted-foreground">
                We use modern, scalable technologies that grow with your business.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
              {techStack.map((tech, index) => (
                <div
                  key={index}
                  className="px-4 py-2 rounded-full bg-secondary border border-border/50 text-sm"
                >
                  <span className="font-medium">{tech.name}</span>
                  <span className="text-muted-foreground ml-2">· {tech.category}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="section-padding bg-card">
          <div className="container-wide">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl lg:text-4xl mb-4 tracking-tight">How we work</h2>
              <p className="text-muted-foreground">
                A clear, collaborative process from idea to deployment.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { step: "01", title: "Discovery", desc: "Understand your business, goals, and technical requirements" },
                { step: "02", title: "Design", desc: "Create wireframes, prototypes, and technical architecture" },
                { step: "03", title: "Build", desc: "Develop, test, and iterate with regular check-ins" },
                { step: "04", title: "Launch", desc: "Deploy, document, and train your team" },
              ].map((phase, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-sm font-semibold text-accent">{phase.step}</span>
                  </div>
                  <h3 className="font-semibold mb-2">{phase.title}</h3>
                  <p className="text-sm text-muted-foreground">{phase.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding">
          <div className="container-wide">
            <div className="rounded-2xl bg-gradient-to-br from-accent/10 via-accent/5 to-background border border-accent/20 p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-heading mb-4">Ready to build?</h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Tell us about your project and we'll get back to you within 24 hours with next steps.
              </p>
              <Button variant="accent" size="lg" asChild>
                <a href="#contact">
                  Start a Conversation
                  <ArrowRight size={16} />
                </a>
              </Button>
            </div>
          </div>
        </section>

        <Contact />
      </main>
      
      <Footer />
    </div>
  );
};

export default SoftwarePage;