import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Target,
  BarChart3,
  Layers,
  Calendar,
  BookOpen,
  AlertTriangle,
  Lightbulb,
  Building2,
  TrendingUp,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";

const HowToUseStack = () => {
  return (
    <>
      <Helmet>
        <title>How to Use the Stack | Wellness Genius</title>
        <meta 
          name="description" 
          content="A practical guide to using the Wellness Genius product stack in sequence for maximum impact." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-24 pb-16">
          {/* Hero */}
          <section className="container mx-auto px-4 mb-16">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
                <Layers size={16} />
                Decision Infrastructure
              </div>
              <h1 className="text-4xl md:text-5xl font-heading mb-6">
                How to Use the Stack
              </h1>
              <p className="text-xl text-muted-foreground">
                A practical guide for turning insight into action.
                Each product answers a different question. Skipping steps increases risk and wasted effort.
              </p>
            </div>
          </section>

          {/* Core Principle */}
          <section className="container mx-auto px-4 mb-16">
            <div className="max-w-4xl mx-auto">
              <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-background border border-primary/20 p-8 md:p-12">
                <h2 className="text-2xl font-heading mb-6 text-center">The Core Principle</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                      <Target className="text-primary" size={24} />
                    </div>
                    <p className="font-heading text-lg">Clarity before tools</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="text-accent" size={24} />
                    </div>
                    <p className="font-heading text-lg">Behaviour before automation</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                      <Shield className="text-green-500" size={24} />
                    </div>
                    <p className="font-heading text-lg">Control before scale</p>
                  </div>
                </div>
                <p className="text-center text-muted-foreground mt-6">
                  Follow the stack in order to reduce wasted AI spend, over-incentivisation, trust and governance risk, and internal confusion.
                </p>
              </div>
            </div>
          </section>

          {/* Stack Overview */}
          <section className="container mx-auto px-4 mb-16">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-heading mb-8 text-center">The Stack at a Glance</h2>
              <div className="space-y-3">
                {STACK_STEPS.map((step, index) => (
                  <div 
                    key={step.title}
                    className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-heading text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.purpose}</p>
                    </div>
                    <step.icon className="text-muted-foreground shrink-0" size={20} />
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-muted-foreground mt-6">
                You do not need to use everything at once.
              </p>
            </div>
          </section>

          {/* Detailed Steps */}
          <section className="container mx-auto px-4 mb-16">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-heading mb-8 text-center">Step-by-Step Guide</h2>
              <div className="space-y-8">
                {DETAILED_STEPS.map((step, index) => (
                  <StepCard key={step.title} step={step} number={index + 1} />
                ))}
              </div>
            </div>
          </section>

          {/* Common Mistakes */}
          <section className="container mx-auto px-4 mb-16">
            <div className="max-w-4xl mx-auto">
              <div className="rounded-2xl bg-destructive/5 border border-destructive/20 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <AlertTriangle className="text-destructive" size={24} />
                  <h2 className="text-2xl font-heading">Common Mistakes to Avoid</h2>
                </div>
                <ul className="space-y-3">
                  {COMMON_MISTAKES.map((mistake) => (
                    <li key={mistake} className="flex items-start gap-3">
                      <XCircle className="text-destructive shrink-0 mt-0.5" size={18} />
                      <span className="text-muted-foreground">{mistake}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted-foreground mt-6 pt-6 border-t border-destructive/20">
                  The stack is designed to prevent these.
                </p>
              </div>
            </div>
          </section>

          {/* When to Use AI Coach */}
          <section className="container mx-auto px-4 mb-16">
            <div className="max-w-4xl mx-auto">
              <div className="rounded-2xl bg-accent/5 border border-accent/20 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Lightbulb className="text-accent" size={24} />
                  <h2 className="text-2xl font-heading">When to Use the AI Coach</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  Use the Wellness Genius AI Coach when:
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-accent shrink-0 mt-0.5" size={18} />
                    <span>Decisions feel ambiguous</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-accent shrink-0 mt-0.5" size={18} />
                    <span>Trade-offs matter</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-accent shrink-0 mt-0.5" size={18} />
                    <span>Pressure is coming from above</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-accent shrink-0 mt-0.5" size={18} />
                    <span>You need a second, conservative view</span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  The coach complements the stack — it does not replace it.
                </p>
              </div>
            </div>
          </section>

          {/* Final Guidance */}
          <section className="container mx-auto px-4 mb-16">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-heading mb-4">Final Guidance</h2>
              <p className="text-xl text-muted-foreground mb-6">
                The Wellness Genius stack is not about moving faster.
                <br />
                <strong className="text-foreground">It's about moving with intent.</strong>
              </p>
              <p className="text-muted-foreground mb-8">
                Use it properly and you will reduce wasted spend, protect trust, align teams, and build wellness systems that actually scale.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg">
                  <Link to="/products">
                    View Products <ArrowRight size={18} />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/hub">
                    Enter Member Hub
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

const STACK_STEPS = [
  { title: "AI Readiness Score", purpose: "Establish reality", icon: BarChart3 },
  { title: "Build vs Buy: AI in Wellness", purpose: "Choose the right path", icon: Building2 },
  { title: "Wellness AI Builder – Prompt Pack", purpose: "Define what (if anything) to build", icon: Target },
  { title: "Wellness Engagement Systems Playbook", purpose: "Fix engagement properly", icon: Layers },
  { title: "Engagement → Revenue Framework", purpose: "Translate value commercially", icon: TrendingUp },
  { title: "90-Day AI Activation Playbook", purpose: "Execute with discipline", icon: Calendar },
  { title: "Wellness AI Prompt Library", purpose: "Maintain judgement over time", icon: BookOpen },
];

interface DetailedStep {
  title: string;
  question: string;
  howToUse: string[];
  whatNext: { condition: string; action: string }[];
  highlight?: string;
}

const DETAILED_STEPS: DetailedStep[] = [
  {
    title: "AI Readiness Score – Commercial Edition",
    question: "Are we actually ready to use AI and engagement data without creating risk or waste?",
    howToUse: [
      "Complete the assessment honestly",
      "Share the Executive Summary with senior stakeholders",
      "Focus on the top 3 blockers, not the score itself"
    ],
    whatNext: [
      { condition: "If readiness is low", action: "Stop here and fix foundations" },
      { condition: "If mixed", action: "Proceed cautiously" },
      { condition: "If strong", action: "Move to Step 2" }
    ],
    highlight: "Do not jump to AI tools based on optimism."
  },
  {
    title: "Build vs Buy: AI in Wellness",
    question: "Should we build AI, buy it, partner, or wait?",
    howToUse: [
      "Use this with leadership or board-level stakeholders",
      "Run the decision once per major initiative",
      "Document the decision and revisit only if conditions change"
    ],
    whatNext: [
      { condition: "If the answer is Wait", action: "Skip to Step 4" },
      { condition: "If Buy or Partner", action: "Protect scope and governance" },
      { condition: "If Build", action: "Proceed to Step 3" }
    ],
    highlight: "This step prevents expensive mistakes."
  },
  {
    title: "Wellness AI Builder – Prompt Pack",
    question: "If we do build AI, what exactly should it do — and what should it not do?",
    howToUse: [
      "Start with the One-Sentence Purpose prompt",
      "Map User × Decision, not features",
      "Run the Data Reality Check before any build discussion",
      "Apply the Governance Test before approving scope"
    ],
    whatNext: [
      { condition: "If clarity collapses", action: "Pause" },
      { condition: "If purpose is clear", action: "Move to engagement systems" }
    ],
    highlight: "This step turns vague ideas into executable intent."
  },
  {
    title: "Wellness Engagement Systems Playbook",
    question: "How do we drive behaviour change and retention without burning margin?",
    howToUse: [
      "Build your Habit → Outcome Map",
      "Identify which behaviours actually matter",
      "Design journeys using the Intervention Ladder",
      "Implement IF/THEN logic, not campaigns"
    ],
    whatNext: [
      { condition: "Remove unnecessary incentives", action: "" },
      { condition: "Simplify journeys", action: "" },
      { condition: "Focus on consistency over volume", action: "" }
    ],
    highlight: "This step fixes the problem most wellness platforms avoid."
  },
  {
    title: "Engagement → Revenue Framework",
    question: "How do we explain engagement value to finance, partners, and boards?",
    howToUse: [
      "Translate engagement behaviours into retention and LTV sensitivity",
      "Use conservative assumptions",
      "Share outputs with finance early"
    ],
    whatNext: [
      { condition: "Align product, ops, and finance on the same language", action: "" },
      { condition: "Adjust engagement priorities based on commercial signal", action: "" }
    ],
    highlight: "If engagement can't be translated, it shouldn't be scaled."
  },
  {
    title: "90-Day AI Activation Playbook",
    question: "How do we move forward without rushing or losing control?",
    howToUse: [
      "Treat this as an execution discipline, not a sprint",
      "Follow the month-by-month structure",
      "Apply stop rules as seriously as success criteria"
    ],
    whatNext: [
      { condition: "Review progress weekly", action: "" },
      { condition: "Re-run the AI Readiness Score after 90 days", action: "" }
    ],
    highlight: "This is where confidence comes from evidence, not optimism."
  },
  {
    title: "Wellness AI Prompt Library (Ongoing)",
    question: "How do we keep making good decisions as the environment changes?",
    howToUse: [
      "Use prompts for diagnostics, not creativity",
      "Revisit assumptions quarterly",
      "Learn from 'why this didn't work' as much as success"
    ],
    whatNext: [],
    highlight: "This is your long-term judgement layer."
  }
];

const COMMON_MISTAKES = [
  "Skipping the Readiness Score",
  "Treating AI as a feature, not a decision support system",
  "Over-incentivising instead of fixing journeys",
  "Modelling upside without modelling risk",
  "Letting tools dictate strategy"
];

const StepCard = ({ step, number }: { step: DetailedStep; number: number }) => (
  <div className="rounded-2xl border border-border bg-card overflow-hidden">
    <div className="p-6 md:p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0 text-primary-foreground font-heading text-lg">
          {number}
        </div>
        <div>
          <h3 className="text-xl font-heading mb-2">{step.title}</h3>
          <p className="text-muted-foreground">
            <strong className="text-foreground">Question it answers:</strong> {step.question}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-heading text-sm uppercase tracking-wider text-muted-foreground mb-3">
            How to use it
          </h4>
          <ul className="space-y-2">
            {step.howToUse.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="text-primary shrink-0 mt-0.5" size={16} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {step.whatNext.length > 0 && (
          <div>
            <h4 className="font-heading text-sm uppercase tracking-wider text-muted-foreground mb-3">
              What to do next
            </h4>
            <ul className="space-y-2">
              {step.whatNext.map((item) => (
                <li key={item.condition} className="text-sm">
                  <span className="text-muted-foreground">{item.condition}</span>
                  {item.action && (
                    <>
                      <ArrowRight className="inline mx-2" size={14} />
                      <span className="text-foreground">{item.action}</span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {step.highlight && (
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-sm font-medium text-accent">{step.highlight}</p>
        </div>
      )}
    </div>
  </div>
);

export default HowToUseStack;
