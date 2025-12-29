import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ReportProblemButton } from "@/components/feedback/ReportProblemButton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AssessmentIntro from "@/components/assessment/AssessmentIntro";
import AssessmentQuestion from "@/components/assessment/AssessmentQuestion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AssessmentAnswers {
  [key: string]: number;
}

export interface UserInfo {
  name: string;
  email: string;
  company: string;
  role: string;
  industry: string;
  companySize: string;
  primaryGoal: string;
}

const questions = [
  // Leadership & Strategy (5 questions)
  {
    id: "leadership_1",
    pillar: "Leadership & Strategy",
    text: "We have clearly defined, measurable business problems we want AI to solve.",
    context: "AI works best when targeting specific, quantifiable challenges rather than vague aspirations. The clearer the problem, the easier it is to measure AI success.",
    examples: [
      "Reducing member churn by 15% by predicting at-risk customers",
      "Cutting admin time by 10 hours per week through automation",
      "Increasing class utilisation from 60% to 80% through smart scheduling",
    ],
  },
  {
    id: "leadership_2",
    pillar: "Leadership & Strategy",
    text: "There is executive-level ownership and dedicated budget allocated for AI initiatives.",
    context: "Successful AI adoption requires visible leadership commitment, ring-fenced resources, and someone accountable for outcomes.",
    examples: [
      "A named C-level sponsor championing AI projects",
      "Annual budget of £10k-50k+ earmarked for AI/automation",
      "AI discussed at monthly board or leadership meetings",
    ],
  },
  {
    id: "leadership_3",
    pillar: "Leadership & Strategy",
    text: "We have a 12-24 month technology roadmap that includes AI and automation milestones.",
    context: "AI success compounds over time. A roadmap prevents reactive, disconnected projects and builds momentum.",
    examples: [
      "Documented phases: pilot → scale → optimise",
      "Clear dependencies between tech projects mapped out",
      "Quarterly review points built into the plan",
    ],
  },
  {
    id: "leadership_4",
    pillar: "Leadership & Strategy",
    text: "We have identified 2-3 specific use cases where AI could deliver the highest ROI within 6 months.",
    context: "Focused pilots beat scattered experiments. Knowing your highest-value opportunities prevents wasted effort.",
    examples: [
      "Automated member win-back campaigns for lapsed customers",
      "AI-powered chatbot for 24/7 membership enquiries",
      "Predictive maintenance for gym equipment to reduce downtime",
    ],
  },
  {
    id: "leadership_5",
    pillar: "Leadership & Strategy",
    text: "We have defined success metrics (KPIs) for measuring AI project outcomes.",
    context: "Without clear metrics, you can't prove value or secure future investment. What gets measured gets managed.",
    examples: [
      "Time saved per week in admin hours",
      "Conversion rate improvement on enquiries",
      "Net Promoter Score changes post-implementation",
    ],
  },

  // Data & Infrastructure (5 questions)
  {
    id: "data_1",
    pillar: "Data & Infrastructure",
    text: "We have a clear inventory of where our critical business data lives and who owns it.",
    context: "AI is only as good as the data it learns from. Unknown or scattered data makes AI projects fail before they start.",
    examples: [
      "Documented list of all systems holding member data",
      "Named data owners for CRM, booking, finance systems",
      "Clear understanding of data retention policies",
    ],
  },
  {
    id: "data_2",
    pillar: "Data & Infrastructure",
    text: "Our core systems are integrated and data flows automatically between them.",
    context: "Siloed systems create incomplete customer views and manual workarounds. Integration is the foundation of AI readiness.",
    examples: [
      "Booking system syncs automatically with your CRM",
      "Payment data links to member profiles without manual entry",
      "You can pull a unified customer view across all touchpoints",
    ],
  },
  {
    id: "data_3",
    pillar: "Data & Infrastructure",
    text: "We have at least 12 months of clean, structured historical data for key business activities.",
    context: "AI learns from patterns in historical data. The more quality data you have, the better predictions and automations work.",
    examples: [
      "Member attendance records going back 12+ months",
      "Historical sales and revenue data cleanly categorised",
      "Customer interaction logs (emails, calls, complaints) stored systematically",
    ],
  },
  {
    id: "data_4",
    pillar: "Data & Infrastructure",
    text: "We have processes to regularly clean, validate, and maintain data quality.",
    context: "Dirty data produces unreliable AI. Garbage in, garbage out applies doubly to machine learning.",
    examples: [
      "Monthly data hygiene checks for duplicates and errors",
      "Automated alerts when data quality drops below thresholds",
      "Clear processes for handling incomplete or outdated records",
    ],
  },
  {
    id: "data_5",
    pillar: "Data & Infrastructure",
    text: "We can easily export data from our systems in standard formats (CSV, API, etc.).",
    context: "Locked-in data prevents AI experimentation. Accessible data enables rapid prototyping and vendor flexibility.",
    examples: [
      "Your CRM allows full data exports without vendor involvement",
      "APIs available for key systems for real-time data access",
      "No contractual restrictions on using your own data externally",
    ],
  },

  // People & Skills (5 questions)
  {
    id: "people_1",
    pillar: "People & Skills",
    text: "Senior leadership understands AI capabilities, limitations, and realistic timelines.",
    context: "Unrealistic expectations kill AI projects. Leaders who understand AI make better investment decisions.",
    examples: [
      "Leaders know AI needs training data and time to improve",
      "Understanding that AI augments humans rather than replacing them",
      "Awareness of typical AI project timelines (3-6 months to value)",
    ],
  },
  {
    id: "people_2",
    pillar: "People & Skills",
    text: "Our frontline team is open to adopting new AI-powered tools and processes.",
    context: "Technology adoption fails without buy-in from daily users. Culture matters more than features.",
    examples: [
      "Staff actively suggest process improvements",
      "History of successfully adopting new software within 2-3 months",
      "Low resistance when new tools are introduced",
    ],
  },
  {
    id: "people_3",
    pillar: "People & Skills",
    text: "We have someone internally who can champion AI projects and bridge business and technical needs.",
    context: "AI projects need a translator between what the business wants and what technology can deliver.",
    examples: [
      "An operations manager comfortable discussing tech with vendors",
      "Someone who attends industry AI/tech events or webinars",
      "A staff member actively experimenting with AI tools like ChatGPT",
    ],
  },
  {
    id: "people_4",
    pillar: "People & Skills",
    text: "We provide or would invest in AI literacy training for key team members.",
    context: "Building internal capability reduces dependency on external consultants and accelerates adoption.",
    examples: [
      "Budget allocated for online AI courses or workshops",
      "Staff encouraged to experiment with AI tools in their roles",
      "Regular knowledge-sharing sessions about new technologies",
    ],
  },
  {
    id: "people_5",
    pillar: "People & Skills",
    text: "We have access to technical expertise (internal or external) to implement AI solutions.",
    context: "AI implementation requires technical skills. Knowing your gaps helps you plan for the right support.",
    examples: [
      "Relationship with a technology partner or consultant",
      "Internal IT team comfortable with API integrations",
      "Budget for external implementation support when needed",
    ],
  },

  // Process & Operations (5 questions)
  {
    id: "process_1",
    pillar: "Process & Operations",
    text: "Our core operational processes are documented, standardised, and consistently followed.",
    context: "AI learns from patterns. Inconsistent processes make automation unreliable and hard to train.",
    examples: [
      "Written SOPs for member onboarding and offboarding",
      "Consistent approach to handling complaints or cancellations",
      "Standardised class scheduling and instructor allocation procedures",
    ],
  },
  {
    id: "process_2",
    pillar: "Process & Operations",
    text: "We have mapped out repetitive, time-consuming tasks that could be automated.",
    context: "The best AI opportunities hide in tedious manual work. Knowing where time is wasted reveals quick wins.",
    examples: [
      "List of tasks taking 5+ hours per week of manual effort",
      "Identified workflows with copy-paste between systems",
      "Customer questions that get asked repeatedly (FAQs)",
    ],
  },
  {
    id: "process_3",
    pillar: "Process & Operations",
    text: "We understand our key decision bottlenecks and where delays hurt the business.",
    context: "AI can accelerate decisions—but only if you know where the hold-ups cost you money or customers.",
    examples: [
      "Membership enquiries waiting 24+ hours for a response",
      "Pricing or promotion decisions delayed by data gathering",
      "Approvals sitting in manager inboxes for days",
    ],
  },
  {
    id: "process_4",
    pillar: "Process & Operations",
    text: "We track and measure operational metrics that AI could help optimise.",
    context: "If you're not measuring it, AI can't improve it. Baseline metrics enable before/after comparisons.",
    examples: [
      "Class occupancy rates tracked weekly or monthly",
      "Member acquisition cost and lifetime value calculated",
      "Staff utilisation and productivity measured",
    ],
  },
  {
    id: "process_5",
    pillar: "Process & Operations",
    text: "We have run pilot projects or experiments with new technology in the past 12 months.",
    context: "Organisations with a test-and-learn culture adopt AI faster. Experimentation builds change muscle.",
    examples: [
      "Trialled a new booking or CRM system recently",
      "Tested marketing automation or email sequences",
      "Piloted any AI tool (ChatGPT, scheduling optimiser, etc.)",
    ],
  },

  // Risk, Ethics & Governance (5 questions)
  {
    id: "risk_1",
    pillar: "Risk, Ethics & Governance",
    text: "We have documented policies for data privacy, GDPR compliance, and responsible data use.",
    context: "Trust is hard to rebuild. Clear policies protect your business, customers, and reputation.",
    examples: [
      "Written data protection policy reviewed in the past year",
      "Staff trained on GDPR and data handling requirements",
      "Clear consent mechanisms for marketing and data processing",
    ],
  },
  {
    id: "risk_2",
    pillar: "Risk, Ethics & Governance",
    text: "We understand how AI decisions could impact different customer groups and have considered fairness.",
    context: "AI can inadvertently discriminate. Awareness of bias risks prevents reputational damage and legal issues.",
    examples: [
      "Considered whether AI recommendations could disadvantage any group",
      "Awareness of how training data biases affect outcomes",
      "Commitment to testing AI outputs for fairness before deployment",
    ],
  },
  {
    id: "risk_3",
    pillar: "Risk, Ethics & Governance",
    text: "We maintain human oversight for AI-assisted decisions that affect customers or staff.",
    context: "AI should support decisions, not make them invisibly. Humans remain accountable for outcomes.",
    examples: [
      "Staff review AI recommendations before customer actions",
      "Clear escalation paths when AI makes errors or edge cases",
      "Regular audits of AI-driven outcomes and decisions",
    ],
  },
  {
    id: "risk_4",
    pillar: "Risk, Ethics & Governance",
    text: "We have vendor due diligence processes for evaluating AI tool providers.",
    context: "Not all AI vendors are equal. Evaluating security, data handling, and reliability protects your business.",
    examples: [
      "Checklist for assessing new software providers",
      "Review of vendor data security certifications (ISO 27001, SOC 2)",
      "Understanding of where vendor-processed data is stored",
    ],
  },
  {
    id: "risk_5",
    pillar: "Risk, Ethics & Governance",
    text: "We have a plan for managing the change impact of AI on staff roles and responsibilities.",
    context: "AI changes jobs, not just processes. Proactive change management prevents resistance and anxiety.",
    examples: [
      "Communication plan for how AI will affect team roles",
      "Commitment to reskilling rather than replacing staff",
      "Clear messaging that AI augments rather than threatens jobs",
    ],
  },
];

const AIReadinessAssessment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<"intro" | "questions">("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<AssessmentAnswers>({});
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartAssessment = (info: UserInfo) => {
    setUserInfo(info);
    setStep("questions");
  };

  const handleAnswer = (questionId: string, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));
  };

  const calculatePillarScore = (pillarName: string) => {
    const pillarQuestions = questions.filter(q => q.pillar === pillarName);
    const total = pillarQuestions.reduce((sum, q) => sum + (answers[q.id] || 3), 0);
    return Math.round((total / (pillarQuestions.length * 5)) * 100);
  };

  const getScoreBand = (score: number) => {
    if (score < 40) return 'AI-Unready';
    if (score < 60) return 'AI-Curious';
    if (score < 80) return 'AI-Ready';
    return 'AI-Native';
  };

  const handleSubmit = async () => {
    if (!userInfo) return;
    
    setIsSubmitting(true);
    
    try {
      const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
      const maxScore = questions.length * 5;
      const overallScore = Math.round((totalScore / maxScore) * 100);
      
      const leadershipScore = calculatePillarScore('Leadership & Strategy');
      const dataScore = calculatePillarScore('Data & Infrastructure');
      const peopleScore = calculatePillarScore('People & Skills');
      const processScore = calculatePillarScore('Process & Operations');
      const riskScore = calculatePillarScore('Risk, Ethics & Governance');

      // Build detailed question answers for the AI insights generator
      const questionAnswers = questions.map(q => ({
        questionId: q.id,
        pillar: q.pillar,
        questionText: q.text,
        score: answers[q.id] || 3,
      }));

      // Store question answers in sessionStorage for the report page
      sessionStorage.setItem('aiReadinessAnswers', JSON.stringify({
        questionAnswers,
        userInfo,
      }));

      const { data, error } = await supabase.functions.invoke('manage-readiness-completions', {
        body: {
          action: 'save',
          email: userInfo.email,
          name: userInfo.name,
          company: userInfo.company,
          role: userInfo.role,
          industry: userInfo.industry,
          companySize: userInfo.companySize,
          overallScore,
          leadershipScore,
          dataScore,
          peopleScore,
          processScore,
          riskScore,
          scoreBand: getScoreBand(overallScore),
        },
      });

      if (error) throw error;

      // Navigate to results page with the completion ID
      if (data?.id) {
        navigate(`/ai-readiness/results/${data.id}`);
      } else {
        // Fallback: show inline results if no ID returned
        toast({
          title: "Assessment Complete",
          description: `Your AI Readiness Score is ${overallScore}/100`,
        });
      }
    } catch (err) {
      console.error('Failed to save assessment:', err);
      toast({
        title: "Error",
        description: "Failed to save your assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const currentQuestionData = questions[currentQuestion];
  const hasCurrentAnswer = answers[currentQuestionData?.id] !== undefined;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>AI Readiness Assessment | Wellness Genius</title>
        <meta 
          name="description" 
          content="Complete your AI Readiness assessment to discover your score and unlock actionable insights." 
        />
      </Helmet>
      
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container-wide section-padding">
          {step === "intro" && (
            <AssessmentIntro onStart={handleStartAssessment} />
          )}

          {step === "questions" && (
            <div className="max-w-2xl mx-auto">
              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Question {currentQuestion + 1} of {questions.length}</span>
                  <span>{currentQuestionData.pillar}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <AssessmentQuestion
                question={currentQuestionData}
                currentAnswer={answers[currentQuestionData.id]}
                onAnswer={handleAnswer}
              />

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                  >
                    <ArrowLeft size={16} />
                    Previous
                  </Button>
                  <ReportProblemButton featureArea="AI Readiness Assessment" />
                </div>
                <Button
                  variant="accent"
                  onClick={handleNext}
                  disabled={!hasCurrentAnswer || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : currentQuestion === questions.length - 1 ? (
                    <>
                      See Results
                      <ArrowRight size={16} />
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight size={16} />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AIReadinessAssessment;
