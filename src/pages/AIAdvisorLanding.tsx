import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { ADVISOR_MODES, CREDIT_PACKS, getModesByCategory } from "@/components/advisor/AdvisorModes";
import { getAdvisorIcon } from "@/components/advisor/AdvisorIcons";
import AnimatedConversation from "@/components/advisor/AnimatedConversation";
import {
  Brain,
  Mic,
  Database,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Shield,
  Clock,
  Target,
} from "lucide-react";

const AIAdvisorLanding = () => {
  const { user } = useAuth();

  const coreFeatures = [
    {
      icon: Brain,
      title: "8 Expert Modes",
      description:
        "Purpose-built thinking styles from quick questions to board-ready analysis. Each mode uses the right depth for the decision at hand.",
    },
    {
      icon: Database,
      title: "Business Memory",
      description:
        "Your context persists. The advisor learns your business model, key metrics, and weak spots—so every conversation builds on what came before.",
    },
    {
      icon: Mic,
      title: "Voice Mode",
      description:
        "Speak your question, hear the answer. Perfect for thinking aloud while driving, walking, or when typing feels like friction.",
    },
    {
      icon: CreditCard,
      title: "Pay As You Go",
      description:
        "No subscriptions. Buy credits when you need them. Simple questions cost less; deep analysis costs more. You control the spend.",
    },
  ];

  const differentiators = [
    {
      icon: Target,
      title: "Built for Wellness Operators",
      description:
        "Not a generic AI. Every prompt is tuned for gyms, studios, spas, and wellness businesses. Industry benchmarks and commercial patterns baked in.",
    },
    {
      icon: Shield,
      title: "Challenges Your Assumptions",
      description:
        "This isn't a yes-machine. It stress-tests decisions, surfaces trade-offs, and tells you what could go wrong before you commit.",
    },
    {
      icon: Clock,
      title: "Time-Aware Context",
      description:
        "Knows what day it is, what quarter you're in, and what seasonal patterns matter. Advice that fits where you are in the year.",
    },
    {
      icon: Sparkles,
      title: "Action-Ready Output",
      description:
        "No fluff. Every response ends with what to do next. Decisions, not just information.",
    },
  ];

  const dailyModes = getModesByCategory("daily");
  const strategicModes = getModesByCategory("strategic");
  const planningModes = getModesByCategory("planning");

  return (
    <>
      <Helmet>
        <title>AI Business Advisor for Wellness Operators | Wellness Genius</title>
        <meta
          name="description"
          content="Get strategic AI guidance tailored for gyms, studios, and wellness businesses. 8 expert modes, business memory, voice input. Pay only for what you use."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main>
          {/* Hero Section */}
          <section className="relative py-20 lg:py-28 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
            <div className="container mx-auto px-4 relative">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
                  <Sparkles className="h-4 w-4" />
                  AI-Powered Business Guidance
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                  Your Strategic Advisor,
                  <br />
                  <span className="text-primary">Available 24/7</span>
                </h1>

                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Purpose-built AI for wellness business owners. Ask anything from quick
                  questions to complex strategy. Get answers that challenge your thinking and
                  move your business forward.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="xl" variant="hero" asChild>
                    <Link to={user ? "/genie" : "/auth"}>
                      Try AI Advisor Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="xl" variant="heroOutline" asChild>
                    <a href="#demo">
                      <Sparkles className="mr-2 h-5 w-5" />
                      See Demo
                    </a>
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground mt-4">
                  5 free credits to start • No card required
                </p>
              </div>
            </div>
          </section>

          {/* Demo Section */}
          <section id="demo" className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-foreground mb-4">See It In Action</h2>
                  <p className="text-muted-foreground">
                    Watch how wellness operators use the AI Advisor to make better decisions
                  </p>
                </div>

                <AnimatedConversation />
              </div>
            </div>
          </section>

          {/* Core Features */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Everything You Need to Think Clearly
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Four capabilities that make this different from any AI you've used before
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {coreFeatures.map((feature) => (
                  <Card key={feature.title} className="border-border/50 bg-card/50">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <feature.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Expert Modes Breakdown */}
          <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  8 Expert Modes for Every Situation
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Each mode is tuned for a specific type of thinking. Pick the right tool for the
                  decision at hand.
                </p>
              </div>

              <div className="space-y-12 max-w-5xl mx-auto">
                {/* Daily Operations */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Daily Operations
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {dailyModes.map((mode) => (
                      <Card key={mode.id} className="border-border/50">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                              {getAdvisorIcon(mode.icon, 20, "text-emerald-600")}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium text-foreground">{mode.name}</h4>
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                  {mode.creditCost} credits
                                </span>
                              </div>
                              <p className="text-sm text-primary font-medium mb-1">{mode.tagline}</p>
                              <p className="text-xs text-muted-foreground">{mode.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Strategic Thinking */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Strategic Thinking
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {strategicModes.map((mode) => (
                      <Card key={mode.id} className="border-border/50">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                              {getAdvisorIcon(mode.icon, 20, "text-blue-600")}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium text-foreground">{mode.name}</h4>
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                  {mode.creditCost} credits
                                </span>
                              </div>
                              <p className="text-sm text-primary font-medium mb-1">{mode.tagline}</p>
                              <p className="text-xs text-muted-foreground">{mode.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Planning & Building */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    Planning & Building
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {planningModes.map((mode) => (
                      <Card key={mode.id} className="border-border/50">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                              {getAdvisorIcon(mode.icon, 20, "text-purple-600")}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium text-foreground">{mode.name}</h4>
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                  {mode.creditCost} credits
                                </span>
                              </div>
                              <p className="text-sm text-primary font-medium mb-1">{mode.tagline}</p>
                              <p className="text-xs text-muted-foreground">{mode.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Differentiators */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Not Just Another AI Chat
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Built specifically for wellness business decisions, not generic conversation
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {differentiators.map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing CTA */}
          <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Simple, Transparent Pricing
                </h2>
                <p className="text-muted-foreground mb-8">
                  Pay only for what you use. No subscriptions, no commitments.
                </p>

                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                  {CREDIT_PACKS.map((pack) => (
                    <Card
                      key={pack.id}
                      className={`border-border/50 ${pack.popular ? "ring-2 ring-primary" : ""}`}
                    >
                      <CardContent className="p-6 text-center">
                        {pack.popular && (
                          <span className="inline-block text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded mb-2">
                            Most Popular
                          </span>
                        )}
                        <div className="text-3xl font-bold text-foreground mb-1">
                          {pack.credits}
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">credits</div>
                        <div className="text-xl font-semibold text-foreground">£{pack.price}</div>
                        {pack.savings && (
                          <div className="text-xs text-primary mt-1">{pack.savings}</div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="space-y-4">
                  <Button size="xl" variant="hero" asChild>
                    <Link to={user ? "/genie" : "/auth"}>
                      Start with 5 Free Credits
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>

                  <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      No card required
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Credits never expire
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Cancel anytime
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AIAdvisorLanding;
