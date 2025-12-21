import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  Shield, 
  Eye, 
  Lock, 
  AlertTriangle, 
  FileText, 
  CheckCircle,
  Users,
  Database,
  Brain,
  Scale,
  ArrowRight
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const sections = [
  {
    id: "risk-landscape",
    title: "The Real Risk Landscape",
    icon: AlertTriangle,
    content: [
      {
        subtitle: "What regulators actually worry about",
        items: [
          "Misuse of sensitive data",
          "Opaque decision-making",
          "Lack of consent clarity",
          "Secondary use of data",
          "Harm caused by automated decisions"
        ]
      },
      {
        subtitle: "What customers worry about",
        items: [
          "\"What are you collecting?\"",
          "\"Why?\"",
          "\"Who sees it?\"",
          "\"Can this be used against me?\""
        ]
      },
      {
        subtitle: "What boards worry about",
        items: [
          "Reputational damage",
          "Regulatory fines",
          "Loss of enterprise trust",
          "AI becoming ungovernable"
        ]
      }
    ],
    insight: "If your AI strategy can't answer all three, it's fragile."
  },
  {
    id: "data-classification",
    title: "Data Classification",
    icon: Database,
    content: [
      {
        subtitle: "Core data categories in wellness",
        items: [
          "Personal data: name, email, identifiers — always protected",
          "Behavioural data: activity, engagement, usage patterns — becomes sensitive when combined",
          "Health-adjacent data: steps, sleep, stress, recovery, mood — treated increasingly like health data",
          "Inferred data: predictions, risk scores, segments — highest risk category, often overlooked"
        ]
      }
    ],
    insight: "If AI infers something about a person, that inference carries risk — even if the raw data felt harmless."
  },
  {
    id: "consent",
    title: "Consent Done Properly",
    icon: CheckCircle,
    content: [
      {
        subtitle: "What \"good\" consent looks like",
        items: [
          "Layered (simple first, detail later)",
          "Purpose-specific",
          "Revocable",
          "Understandable by a non-expert"
        ]
      },
      {
        subtitle: "Minimum viable consent structure",
        items: [
          "Layer 1 – Plain English: \"We use your data to improve your experience\"",
          "Layer 2 – Purpose clarity: personalisation, insights, service improvement",
          "Layer 3 – AI disclosure: what AI does, what it doesn't, no harmful automated decisions",
          "Layer 4 – Control: opt-out options, data deletion, access requests"
        ]
      }
    ],
    insight: "If you can't explain this out loud, it's not clear enough."
  },
  {
    id: "ai-governance",
    title: "AI Decision Governance",
    icon: Scale,
    content: [
      {
        subtitle: "Mandatory safeguards",
        items: [
          "Human-in-the-loop for: risk flags, churn predictions, behavioural scoring",
          "No fully automated actions that: restrict access, penalise users, materially affect wellbeing",
          "Clear override paths: staff can intervene, users can appeal"
        ]
      }
    ],
    insight: "If an AI output would be uncomfortable to explain to a customer — redesign it."
  },
  {
    id: "security",
    title: "Model & Tool Security",
    icon: Lock,
    content: [
      {
        subtitle: "Data handling",
        items: [
          "No raw PII sent to external models unnecessarily",
          "Minimise data fields",
          "Anonymise where possible"
        ]
      },
      {
        subtitle: "Access control",
        items: [
          "Role-based access",
          "No shared credentials",
          "Audit logs enabled"
        ]
      },
      {
        subtitle: "Vendor due diligence — Ask every AI provider:",
        items: [
          "Do you train on our data?",
          "Where is data stored?",
          "How long is it retained?",
          "Can we delete it?",
          "Who can access it?"
        ]
      }
    ],
    insight: "If answers are vague, walk away."
  },
  {
    id: "inference-risk",
    title: "Inference Risk",
    icon: Brain,
    content: [
      {
        subtitle: "AI often creates new data you never explicitly collected",
        items: [
          "\"Likely to disengage\"",
          "\"High stress profile\"",
          "\"Low motivation segment\"",
          "These can be sensitive, may be incorrect, can cause harm if mishandled"
        ]
      },
      {
        subtitle: "Best practice",
        items: [
          "Treat inferences as probabilities, not truths",
          "Never expose raw inference labels to users",
          "Use soft language internally (\"early signal\", not \"at risk\")"
        ]
      }
    ],
    insight: "The silent problem most operators miss."
  },
  {
    id: "transparency",
    title: "User Transparency",
    icon: Eye,
    content: [
      {
        subtitle: "Good transparency looks like",
        items: [
          "\"Here's why you're seeing this\"",
          "\"Here's what influenced this suggestion\"",
          "\"Here's how to change it\""
        ]
      },
      {
        subtitle: "Bad transparency",
        items: [
          "Vague statements",
          "Defensive language",
          "Silence"
        ]
      }
    ],
    insight: "Trust compounds. Confusion erodes it fast."
  },
  {
    id: "incident-planning",
    title: "Incident & Failure Planning",
    icon: AlertTriangle,
    content: [
      {
        subtitle: "Assume:",
        items: [
          "Data will be wrong",
          "Models will fail",
          "Something will break"
        ]
      },
      {
        subtitle: "Minimum incident plan",
        items: [
          "Named owner",
          "Clear escalation path",
          "User communication template",
          "Regulator notification criteria"
        ]
      }
    ],
    insight: "The worst position is improvising under pressure."
  }
];

const quarterlyChecklist = [
  "Do we still need all the data we collect?",
  "Are AI outputs being used as guidance or gospel?",
  "Can users understand our AI use?",
  "Could this feature cause unintended harm?",
  "Would we defend this in a public forum?"
];

const PrivacyPlaybook = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>AI Privacy & Security Playbook | Wellness Genius</title>
        <meta 
          name="description" 
          content="A practical guide for wellness operators on AI privacy, security, and compliance. Deploy AI responsibly and protect your business and customers." 
        />
      </Helmet>
      
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="section-padding">
          <div className="container-narrow text-center">
            <PageBreadcrumb items={[{ label: "AI Privacy Playbook" }]} />
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
              <Shield size={16} />
              Operator-Grade Security
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading mb-6">
              AI Privacy & Security Playbook
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              A practical guide for operators, founders, and executives. 
              Deploy AI responsibly, protect your business and customers, move forward without paralysis.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button variant="accent" size="lg" asChild>
                <Link to="/privacy-readiness">
                  Take Privacy Readiness Assessment
                  <ArrowRight size={16} />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="#sections">
                  Read the Playbook
                </a>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              This is not legal advice. It is a decision framework that aligns with current UK/EU expectations.
            </p>
          </div>
        </section>

        {/* Why this exists */}
        <section className="section-padding bg-secondary/30">
          <div className="container-narrow">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-heading mb-6">Why this playbook exists</h2>
              <p className="text-lg text-muted-foreground mb-6">
                AI in wellness sits in a high-risk intersection:
              </p>
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {["Behavioural data", "Health-adjacent signals", "Personal habits", "Predictive inference"].map((item) => (
                  <Badge key={item} variant="secondary" className="text-sm py-1.5 px-3">
                    {item}
                  </Badge>
                ))}
              </div>
              <p className="text-lg">
                Most operators are not reckless — they're <strong>under-prepared</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* Sections */}
        <section id="sections" className="section-padding">
          <div className="container-wide">
            <h2 className="text-3xl font-heading text-center mb-12">The Playbook</h2>
            
            <Accordion type="single" collapsible className="space-y-4 max-w-4xl mx-auto">
              {sections.map((section, idx) => (
                <AccordionItem 
                  key={section.id} 
                  value={section.id}
                  className="border border-border rounded-xl bg-card px-6"
                >
                  <AccordionTrigger className="hover:no-underline py-6">
                    <div className="flex items-center gap-4 text-left">
                      <div className="p-2.5 rounded-lg bg-accent/10">
                        <section.icon size={20} className="text-accent" />
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">
                          Section {idx + 1}
                        </span>
                        <h3 className="text-lg font-heading">{section.title}</h3>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <div className="space-y-6 pt-2">
                      {section.content.map((block, blockIdx) => (
                        <div key={blockIdx}>
                          <h4 className="text-sm font-medium text-muted-foreground mb-3">
                            {block.subtitle}
                          </h4>
                          <ul className="space-y-2">
                            {block.items.map((item, itemIdx) => (
                              <li key={itemIdx} className="flex items-start gap-2 text-sm">
                                <span className="text-accent mt-1 shrink-0">–</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      {section.insight && (
                        <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                          <p className="text-sm font-medium text-accent">
                            💡 {section.insight}
                          </p>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Quarterly Checklist */}
        <section className="section-padding bg-secondary/30">
          <div className="container-narrow">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <FileText size={20} className="text-accent" />
                  Operator AI Checklist
                </CardTitle>
                <p className="text-sm text-muted-foreground">Review quarterly</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {quarterlyChecklist.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-accent/50 shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted-foreground mt-6">
                  If answers drift — pause and recalibrate.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* What "Good" Looks Like */}
        <section className="section-padding">
          <div className="container-narrow">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-heading mb-6">What "Good" Looks Like</h2>
              <p className="text-lg text-muted-foreground mb-8">
                A strong wellness AI setup:
              </p>
              <div className="grid sm:grid-cols-2 gap-4 text-left mb-8">
                {[
                  "Uses minimal data",
                  "Explains itself clearly",
                  "Avoids absolute claims",
                  "Keeps humans accountable",
                  "Earns trust through restraint"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <CheckCircle size={16} className="text-green-500 shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-lg font-medium">
                The most trusted AI systems are often the least aggressive.
              </p>
            </div>
          </div>
        </section>

        {/* Positioning Statement */}
        <section className="section-padding bg-accent/5">
          <div className="container-narrow">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-heading mb-6">Operator Positioning Statement</h2>
              <blockquote className="text-xl italic text-muted-foreground border-l-4 border-accent pl-6 text-left">
                "We use AI to support better decisions, not to replace judgement.
                We prioritise transparency, proportionality, and trust."
              </blockquote>
              <p className="text-sm text-muted-foreground mt-6">
                Use this internally and externally.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding">
          <div className="container-narrow text-center">
            <h2 className="text-3xl font-heading mb-4">
              Assess Your Privacy Readiness
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Take the Privacy Readiness Assessment to see where you stand.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="accent" size="lg" asChild>
                <Link to="/privacy-readiness">
                  Start Assessment
                  <ArrowRight size={16} />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/genie">
                  Try AI Advisor
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

export default PrivacyPlaybook;
