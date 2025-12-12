import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AssessmentIntro from "@/components/assessment/AssessmentIntro";
import AssessmentQuestion from "@/components/assessment/AssessmentQuestion";
import AssessmentResults from "@/components/assessment/AssessmentResults";

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
  },
  {
    id: "leadership_2",
    pillar: "Leadership & Strategy",
    text: "There is executive-level ownership and budget allocated for AI initiatives.",
  },
  // Data & Infrastructure (2 questions)
  {
    id: "data_1",
    pillar: "Data & Infrastructure",
    text: "We know where our critical data lives and who owns it.",
  },
  {
    id: "data_2",
    pillar: "Data & Infrastructure",
    text: "Our core systems are integrated rather than siloed.",
  },
  // People & Skills (2 questions)
  {
    id: "people_1",
    pillar: "People & Skills",
    text: "Leadership understands AI capabilities and limitations.",
  },
  {
    id: "people_2",
    pillar: "People & Skills",
    text: "Our team is open to adopting new AI-powered tools and processes.",
  },
  // Process & Operations (3 questions)
  {
    id: "process_1",
    pillar: "Process & Operations",
    text: "Our core operational processes are documented and repeatable.",
  },
  {
    id: "process_2",
    pillar: "Process & Operations",
    text: "We have identified repetitive tasks that consume significant time.",
  },
  {
    id: "process_3",
    pillar: "Process & Operations",
    text: "Decision bottlenecks in our workflows are clearly understood.",
  },
  // Risk, Ethics & Governance (2 questions)
  {
    id: "risk_1",
    pillar: "Risk, Ethics & Governance",
    text: "We have guidelines for responsible AI use and data privacy (e.g., GDPR).",
  },
  {
    id: "risk_2",
    pillar: "Risk, Ethics & Governance",
    text: "We understand the importance of human oversight in AI-assisted decisions.",
  },
];

const AIReadinessIndex = () => {
  const [step, setStep] = useState<"intro" | "questions" | "results">("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<AssessmentAnswers>({});
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const handleStartAssessment = (info: UserInfo) => {
    setUserInfo(info);
    setStep("questions");
  };

  const handleAnswer = (questionId: string, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setStep("results");
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
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container-wide">
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
                  disabled={!hasCurrentAnswer}
                >
                  {currentQuestion === questions.length - 1 ? "See Results" : "Next"}
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {step === "results" && userInfo && (
            <AssessmentResults 
              answers={answers} 
              questions={questions}
              userInfo={userInfo}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AIReadinessIndex;
