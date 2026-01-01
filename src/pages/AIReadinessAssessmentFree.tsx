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
import { FREE_QUESTIONS, PILLARS, getScoreBand, calculatePillarScore } from "@/data/aiReadinessQuestions";

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

  const calculatePillarScoreLocal = (pillarName: string) => {
    return calculatePillarScore(pillarName, answers, FREE_QUESTIONS);
  };

  const handleSubmit = async () => {
    if (!userInfo) return;
    
    setIsSubmitting(true);
    
    try {
      const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
      const maxScore = FREE_QUESTIONS.length * 5;
      const overallScore = Math.round((totalScore / maxScore) * 100);
      
      // Calculate scores for each pillar
      const transformationScore = calculatePillarScoreLocal("AI Transformation Readiness");
      const architectureScore = calculatePillarScoreLocal("AI Architecture Confidence");
      const governanceScore = calculatePillarScoreLocal("AI Governance Reality Check");
      const valueScore = calculatePillarScoreLocal("AI Value Engine");
      const operatingScore = calculatePillarScoreLocal("AI Operating Style");

      const scoreBandResult = getScoreBand(overallScore);

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
          leadershipScore: transformationScore,
          dataScore: architectureScore,
          peopleScore: governanceScore,
          processScore: valueScore,
          riskScore: operatingScore,
          scoreBand: scoreBandResult.label,
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
    if (currentQuestion < FREE_QUESTIONS.length - 1) {
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

  const currentQuestionData = FREE_QUESTIONS[currentQuestion];
  const hasCurrentAnswer = answers[currentQuestionData?.id] !== undefined;
  const progress = ((currentQuestion + 1) / FREE_QUESTIONS.length) * 100;

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
                  <span>Question {currentQuestion + 1} of {FREE_QUESTIONS.length}</span>
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
                  ) : currentQuestion === FREE_QUESTIONS.length - 1 ? (
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
