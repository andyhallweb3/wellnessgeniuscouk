import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
  // Leadership & Strategy (2 questions)
  {
    id: "leadership_1",
    pillar: "Leadership & Strategy",
    text: "We have clearly defined business problems we want AI to solve.",
    context: "AI works best when targeting specific, measurable challenges rather than vague aspirations.",
    examples: [
      "Reducing member churn by predicting at-risk customers",
      "Automating appointment booking and class scheduling",
      "Personalising workout recommendations based on member goals",
    ],
  },
  {
    id: "leadership_2",
    pillar: "Leadership & Strategy",
    text: "There is executive-level ownership and budget allocated for AI initiatives.",
    context: "Successful AI adoption requires visible leadership commitment and dedicated resources.",
    examples: [
      "A C-level sponsor championing AI projects",
      "Ring-fenced budget for pilots (even £5-10k to start)",
      "AI discussed regularly at board or senior leadership meetings",
    ],
  },
  // Data & Infrastructure (2 questions)
  {
    id: "data_1",
    pillar: "Data & Infrastructure",
    text: "We know where our critical data lives and who owns it.",
    context: "AI is only as good as the data it learns from. Knowing your data landscape is step one.",
    examples: [
      "Member data in your CRM vs booking system vs email platform",
      "A named person responsible for data quality",
      "Clear understanding of what data you collect and where it's stored",
    ],
  },
  {
    id: "data_2",
    pillar: "Data & Infrastructure",
    text: "Our core systems are integrated rather than siloed.",
    context: "Disconnected systems make AI insights incomplete and implementation harder.",
    examples: [
      "Your booking system talks to your CRM automatically",
      "Financial data syncs with member records",
      "You can pull a single customer view across touchpoints",
    ],
  },
  // People & Skills (2 questions)
  {
    id: "people_1",
    pillar: "People & Skills",
    text: "Leadership understands AI capabilities and limitations.",
    context: "Realistic expectations prevent disappointment. AI isn't magic—but it can be transformative when applied well.",
    examples: [
      "Leaders know the difference between automation and AI",
      "Awareness that AI needs data to learn and improve",
      "Understanding that AI augments humans, not fully replaces them",
    ],
  },
  {
    id: "people_2",
    pillar: "People & Skills",
    text: "Our team is open to adopting new AI-powered tools and processes.",
    context: "Technology adoption fails without buy-in from the people who'll use it daily.",
    examples: [
      "Staff excited to trial new tools vs resistant to change",
      "History of successfully adopting new software",
      "Culture of continuous improvement and learning",
    ],
  },
  // Process & Operations (3 questions)
  {
    id: "process_1",
    pillar: "Process & Operations",
    text: "Our core operational processes are documented and repeatable.",
    context: "AI learns from patterns. If your processes vary wildly, automation becomes difficult.",
    examples: [
      "Written SOPs for member onboarding",
      "Consistent approach to handling complaints or cancellations",
      "Standardised class scheduling and instructor allocation",
    ],
  },
  {
    id: "process_2",
    pillar: "Process & Operations",
    text: "We have identified repetitive tasks that consume significant time.",
    context: "The best AI opportunities often hide in tedious, time-consuming manual work.",
    examples: [
      "Manually chasing unpaid invoices or lapsed members",
      "Copying data between spreadsheets and systems",
      "Answering the same customer questions repeatedly",
    ],
  },
  {
    id: "process_3",
    pillar: "Process & Operations",
    text: "Decision bottlenecks in our workflows are clearly understood.",
    context: "AI can speed up decisions—but only if you know where the hold-ups are.",
    examples: [
      "Approvals that sit in someone's inbox for days",
      "Waiting on reports before making pricing decisions",
      "Delayed responses to membership enquiries",
    ],
  },
  // Risk, Ethics & Governance (2 questions)
  {
    id: "risk_1",
    pillar: "Risk, Ethics & Governance",
    text: "We have guidelines for responsible AI use and data privacy.",
    context: "Trust is hard to rebuild. Clear policies protect your business and your customers.",
    examples: [
      "GDPR compliance processes already in place",
      "Policies on how customer data can be used",
      "Awareness of bias risks in AI recommendations",
    ],
  },
  {
    id: "risk_2",
    pillar: "Risk, Ethics & Governance",
    text: "We understand the importance of human oversight in AI-assisted decisions.",
    context: "AI should support decisions, not make them in the dark. Humans remain accountable.",
    examples: [
      "Staff review AI-generated recommendations before action",
      "Clear escalation paths when AI makes errors",
      "Regular audits of AI-driven outcomes for fairness",
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
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                >
                  <ArrowLeft size={16} />
                  Previous
                </Button>
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
