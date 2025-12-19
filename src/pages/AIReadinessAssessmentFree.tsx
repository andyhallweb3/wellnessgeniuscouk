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

// Free assessment: 2 questions per section = 10 questions total
const freeQuestions = [
  // Data Maturity (2 questions)
  {
    id: "data_1",
    pillar: "Data Maturity",
    text: "We know where our critical customer data lives and who owns it.",
    context: "AI is only as good as the data it learns from.",
    examples: [
      "Member data in CRM vs booking vs email systems",
      "Named data owner responsible for quality",
      "Clear understanding of what data you collect",
    ],
  },
  {
    id: "data_2",
    pillar: "Data Maturity",
    text: "Our core systems are integrated rather than siloed.",
    context: "Disconnected systems make AI insights incomplete.",
    examples: [
      "Booking system talks to CRM automatically",
      "Financial data syncs with member records",
      "Single customer view across touchpoints",
    ],
  },
  // Engagement (2 questions)
  {
    id: "engagement_1",
    pillar: "Engagement",
    text: "We track and measure customer engagement consistently.",
    context: "You can't improve what you don't measure.",
    examples: [
      "Class attendance tracked weekly",
      "App usage or session frequency monitored",
      "Customer interaction logs stored systematically",
    ],
  },
  {
    id: "engagement_2",
    pillar: "Engagement",
    text: "We use engagement data to drive retention decisions.",
    context: "Data should inform action, not just sit in reports.",
    examples: [
      "At-risk members identified and contacted",
      "Engagement triggers personalised outreach",
      "Churn prediction informs retention campaigns",
    ],
  },
  // Monetisation (2 questions)
  {
    id: "monetisation_1",
    pillar: "Monetisation",
    text: "We have identified clear revenue opportunities from better data use.",
    context: "AI should generate ROI, not just insights.",
    examples: [
      "Upsell opportunities identified from behaviour",
      "Pricing optimisation based on demand patterns",
      "Partner/sponsor revenue from audience data",
    ],
  },
  {
    id: "monetisation_2",
    pillar: "Monetisation",
    text: "We capture value from engagement (not just create it).",
    context: "Engagement without monetisation is a cost centre.",
    examples: [
      "Premium tier with data-driven features",
      "Personalised offers driving incremental revenue",
      "B2B licensing of insights or methodology",
    ],
  },
  // AI & Automation (2 questions)
  {
    id: "automation_1",
    pillar: "AI & Automation",
    text: "We have run at least one AI or automation pilot in the past 12 months.",
    context: "Experience beats theory. Pilots build capability.",
    examples: [
      "Chatbot for customer enquiries",
      "Automated email sequences",
      "AI-powered scheduling or recommendations",
    ],
  },
  {
    id: "automation_2",
    pillar: "AI & Automation",
    text: "Leadership understands AI capabilities and realistic timelines.",
    context: "Unrealistic expectations kill AI projects.",
    examples: [
      "Leaders know AI needs training data and time",
      "Understanding AI augments rather than replaces",
      "Awareness of typical 3-6 month value timelines",
    ],
  },
  // Trust & Compliance (2 questions)
  {
    id: "trust_1",
    pillar: "Trust & Compliance",
    text: "We have documented policies for data privacy and GDPR compliance.",
    context: "Trust is hard to rebuild. Clear policies protect everyone.",
    examples: [
      "Written data protection policy reviewed recently",
      "Staff trained on GDPR requirements",
      "Clear consent mechanisms in place",
    ],
  },
  {
    id: "trust_2",
    pillar: "Trust & Compliance",
    text: "We maintain human oversight for AI-assisted decisions.",
    context: "AI should support decisions, not make them invisibly.",
    examples: [
      "Staff review AI recommendations before action",
      "Escalation paths when AI makes errors",
      "Regular audits of AI-driven outcomes",
    ],
  },
];

const AIReadinessAssessmentFree = () => {
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

  const calculateSectionScore = (sectionPrefix: string) => {
    const sectionQuestions = freeQuestions.filter(q => q.id.startsWith(sectionPrefix));
    const total = sectionQuestions.reduce((sum, q) => sum + (answers[q.id] || 3), 0);
    return Math.round((total / (sectionQuestions.length * 5)) * 100);
  };

  const getScoreBand = (score: number) => {
    if (score < 40) return 'Not AI Ready';
    if (score < 60) return 'Emerging';
    if (score < 80) return 'Operational';
    return 'Scalable';
  };

  const handleSubmit = async () => {
    if (!userInfo) return;
    
    setIsSubmitting(true);
    
    try {
      const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
      const maxScore = freeQuestions.length * 5;
      const overallScore = Math.round((totalScore / maxScore) * 100);
      
      const dataScore = calculateSectionScore('data');
      const engagementScore = calculateSectionScore('engagement');
      const monetisationScore = calculateSectionScore('monetisation');
      const automationScore = calculateSectionScore('automation');
      const trustScore = calculateSectionScore('trust');

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
          leadershipScore: automationScore, // Map to existing columns
          dataScore,
          peopleScore: engagementScore,
          processScore: monetisationScore,
          riskScore: trustScore,
          scoreBand: getScoreBand(overallScore),
        },
      });

      if (error) throw error;

      if (data?.id) {
        navigate(`/ai-readiness/results/${data.id}`);
      } else {
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
    if (currentQuestion < freeQuestions.length - 1) {
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

  const currentQuestionData = freeQuestions[currentQuestion];
  const hasCurrentAnswer = answers[currentQuestionData?.id] !== undefined;
  const progress = ((currentQuestion + 1) / freeQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Free AI Readiness Assessment | Wellness Genius</title>
        <meta 
          name="description" 
          content="Take our free 2-minute AI Readiness assessment to discover your score." 
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
              {/* Free badge */}
              <div className="text-center mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                  Free Assessment • 10 Questions • 2 Minutes
                </span>
              </div>

              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Question {currentQuestion + 1} of {freeQuestions.length}</span>
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
                  ) : currentQuestion === freeQuestions.length - 1 ? (
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

export default AIReadinessAssessmentFree;
