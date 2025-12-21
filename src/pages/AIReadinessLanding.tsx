import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, BarChart3, FileText, Lock, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageBreadcrumb from "@/components/PageBreadcrumb";

const targetAudience = [
  "Gym & fitness operators",
  "Hospitality & spa groups",
  "Wellness app founders",
  "Corporate wellbeing providers",
  "Innovation & product leads",
];

const freeFeatures = [
  "AI Readiness Score (0–100)",
  "Maturity band assessment",
  "Headline diagnosis",
  "Section score breakdown",
];

const paidFeatures = [
  "Full diagnostic report",
  "Revenue upside range",
  "Top 3 blockers identified",
  "90-day priority plan",
  "Monetisation paths",
  "Downloadable PDF",
];

const AIReadinessLanding = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>AI Readiness Score for Wellness Businesses | Wellness Genius</title>
        <meta 
          name="description" 
          content="A commercial diagnostic that shows what to fix, what it's worth, and what to do next. Get your AI readiness score in 5-7 minutes." 
        />
      </Helmet>
      
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="section-padding">
          <div className="container-narrow text-center">
            <PageBreadcrumb items={[{ label: "AI Readiness Assessment" }]} />
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
              Commercial Diagnostic
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading mb-6">
              AI Readiness Score for Wellness Businesses
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              A commercial diagnostic that shows what to fix, what it's worth, and what to do next.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button variant="accent" size="lg" asChild>
                <Link to="/ai-readiness/start">
                  Start Assessment
                  <ArrowRight size={16} />
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Clock size={16} />
                5-7 minutes
              </span>
              <span className="flex items-center gap-2">
                <BarChart3 size={16} />
                Instant results
              </span>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="section-padding bg-secondary/30">
          <div className="container-narrow">
            <h2 className="text-3xl font-heading text-center mb-12">How it works</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  step: "1", 
                  title: "Answer structured questions", 
                  desc: "5-7 minutes of focused assessment across five key pillars" 
                },
                { 
                  step: "2", 
                  title: "Get your readiness score", 
                  desc: "Instant score with maturity band and headline diagnosis" 
                },
                { 
                  step: "3", 
                  title: "Unlock your full report", 
                  desc: "Revenue upside, blockers, and 90-day action plan" 
                },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-lg font-semibold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-heading mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why this exists */}
        <section className="section-padding">
          <div className="container-narrow">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-heading mb-6">Why this exists</h2>
              <p className="text-lg text-muted-foreground mb-4">
                Most wellness businesses are investing in engagement and AI without knowing:
              </p>
              <ul className="text-left max-w-md mx-auto space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-accent mt-1">–</span>
                  <span>What's actually working</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent mt-1">–</span>
                  <span>Where value is leaking</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent mt-1">–</span>
                  <span>What to prioritise next</span>
                </li>
              </ul>
              <p className="text-lg font-medium">This fixes that.</p>
            </div>
          </div>
        </section>

        {/* Who it's for */}
        <section className="section-padding bg-secondary/30">
          <div className="container-narrow">
            <h2 className="text-3xl font-heading text-center mb-8">Who it's for</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {targetAudience.map((audience) => (
                <span 
                  key={audience}
                  className="px-4 py-2 rounded-full bg-card border border-border text-sm"
                >
                  {audience}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="section-padding">
          <div className="container-narrow">
            <h2 className="text-3xl font-heading text-center mb-12">Pricing</h2>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {/* Free tier */}
              <div className="bg-card rounded-xl p-8 border border-border">
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Score</p>
                  <p className="text-3xl font-heading">Free</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {freeFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <CheckCircle size={16} className="text-accent mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/ai-readiness/start">
                    Start Assessment
                  </Link>
                </Button>
              </div>
              
              {/* Paid tier */}
              <div className="bg-accent/5 rounded-xl p-8 border-2 border-accent/30 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-full">
                    Full Report
                  </span>
                </div>
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Complete Diagnostic</p>
                  <p className="text-3xl font-heading">£39.99</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {paidFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <CheckCircle size={16} className="text-accent mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="accent" className="w-full" asChild>
                  <Link to="/ai-readiness/start">
                    Start Assessment
                    <ArrowRight size={16} />
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Optional add-on */}
            <div className="mt-8 text-center">
              <p className="text-muted-foreground text-sm">
                Optional: 30-minute debrief call — £249
              </p>
            </div>
          </div>
        </section>

        {/* What it is / What it isn't */}
        <section className="section-padding bg-secondary/30">
          <div className="container-narrow">
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <div>
                <h3 className="text-lg font-heading mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-accent" />
                  What this is
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>– AI-readiness and commercial intelligence tool</li>
                  <li>– Designed for decision-makers, not consumers</li>
                  <li>– Built to surface uncomfortable truth</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-heading mb-4 flex items-center gap-2">
                  <Lock size={20} className="text-muted-foreground" />
                  What this is NOT
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>– Not a wellness quiz</li>
                  <li>– Not a lead-gen gimmick</li>
                  <li>– Not generic "AI advice"</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="section-padding">
          <div className="container-narrow text-center">
            <h2 className="text-3xl font-heading mb-4">
              Find out where you really stand
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              And what it's costing you not to know.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="accent" size="lg" asChild>
                <Link to="/ai-readiness/start">
                  Start Assessment
                  <ArrowRight size={16} />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/products">
                  Browse All Products
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AIReadinessLanding;
