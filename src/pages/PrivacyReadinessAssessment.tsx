import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Shield } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AssessmentQuestion from "@/components/assessment/AssessmentQuestion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AssessmentAnswers {
  [key: string]: number;
}

interface UserInfo {
  name: string;
  email: string;
  company: string;
  role: string;
}

// Privacy Readiness Questions - 2 per category = 10 total
const privacyQuestions = [
  // Data Classification (2 questions)
  {
    id: "data_class_1",
    pillar: "Data Classification",
    text: "We have documented what data categories we collect (personal, behavioural, health-adjacent, inferred).",
    context: "You can't protect what you haven't mapped.",
    examples: [
      "Data inventory exists and is current",
      "Categories are clearly defined",
      "Sensitivity levels assigned",
    ],
  },
  {
    id: "data_class_2",
    pillar: "Data Classification",
    text: "We understand that AI inferences create new data with its own privacy implications.",
    context: "Inference risk is the silent problem.",
    examples: [
      "\"Likely to churn\" is treated as sensitive data",
      "Risk scores are not exposed to users",
      "Soft language used for predictions",
    ],
  },
  // Consent (2 questions)
  {
    id: "consent_1",
    pillar: "Consent & Transparency",
    text: "Our consent mechanisms are layered, purpose-specific, and revocable.",
    context: "Tick-box consent isn't good consent.",
    examples: [
      "Plain English first, detail later",
      "Specific purposes explained",
      "Easy opt-out available",
    ],
  },
  {
    id: "consent_2",
    pillar: "Consent & Transparency",
    text: "We explicitly disclose AI use to users, including what it does and doesn't do.",
    context: "AI disclosure is increasingly expected.",
    examples: [
      "AI personalisation explained",
      "Limitations acknowledged",
      "No harmful automated decisions",
    ],
  },
  // AI Governance (2 questions)
  {
    id: "ai_gov_1",
    pillar: "AI Governance",
    text: "We maintain human-in-the-loop for AI decisions that could affect users (risk flags, churn predictions, scoring).",
    context: "AI should support decisions, not silently make them.",
    examples: [
      "Staff review AI recommendations",
      "Override paths exist",
      "No automated penalties",
    ],
  },
  {
    id: "ai_gov_2",
    pillar: "AI Governance",
    text: "Leadership understands inference risk and the difference between prediction and truth.",
    context: "Unrealistic expectations create liability.",
    examples: [
      "Predictions treated as probabilities",
      "Confidence levels communicated",
      "Error rates acknowledged",
    ],
  },
  // Security (2 questions)
  {
    id: "security_1",
    pillar: "Security & Vendors",
    text: "We minimise data sent to external AI providers and avoid sending raw PII unnecessarily.",
    context: "Data minimisation is foundational.",
    examples: [
      "Only necessary fields sent",
      "Anonymisation where possible",
      "Data retention limits enforced",
    ],
  },
  {
    id: "security_2",
    pillar: "Security & Vendors",
    text: "We have asked our AI vendors: Do you train on our data? Where is it stored? Can we delete it?",
    context: "Vague answers should be red flags.",
    examples: [
      "Vendor due diligence completed",
      "Training policies understood",
      "Deletion rights confirmed",
    ],
  },
  // Incident Planning (2 questions)
  {
    id: "incident_1",
    pillar: "Incident Planning",
    text: "We have a named owner and escalation path for AI/data incidents.",
    context: "The worst position is improvising under pressure.",
    examples: [
      "Incident owner assigned",
      "Clear escalation steps",
      "Communication templates ready",
    ],
  },
  {
    id: "incident_2",
    pillar: "Incident Planning",
    text: "We assume models will fail and have documented what happens when they do.",
    context: "Assume failure, plan for recovery.",
    examples: [
      "Failure scenarios documented",
      "User communication planned",
      "Regulator notification criteria known",
    ],
  },
];

const PrivacyReadinessAssessment = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"intro" | "questions">("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<AssessmentAnswers>({});
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: "",
    email: "",
    company: "",
    role: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartAssessment = () => {
    if (!userInfo.email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    setStep("questions");
  };

  const handleAnswer = (questionId: string, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));
  };

  const calculateSectionScore = (sectionPrefix: string) => {
    const sectionQuestions = privacyQuestions.filter(q => q.id.startsWith(sectionPrefix));
    const total = sectionQuestions.reduce((sum, q) => sum + (answers[q.id] || 3), 0);
    return Math.round((total / (sectionQuestions.length * 5)) * 100);
  };

  const getScoreBand = (score: number) => {
    if (score < 40) return 'At Risk';
    if (score < 60) return 'Emerging';
    if (score < 80) return 'Maturing';
    return 'Leading';
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
      const maxScore = privacyQuestions.length * 5;
      const overallScore = Math.round((totalScore / maxScore) * 100);
      
      const dataClassScore = calculateSectionScore('data_class');
      const consentScore = calculateSectionScore('consent');
      const aiGovScore = calculateSectionScore('ai_gov');
      const securityScore = calculateSectionScore('security');
      const incidentScore = calculateSectionScore('incident');

      // Store results in localStorage for results page
      const results = {
        overallScore,
        scoreBand: getScoreBand(overallScore),
        sections: {
          dataClassification: dataClassScore,
          consent: consentScore,
          aiGovernance: aiGovScore,
          security: securityScore,
          incidentPlanning: incidentScore,
        },
        userInfo,
        completedAt: new Date().toISOString(),
      };

      localStorage.setItem('privacy_readiness_results', JSON.stringify(results));
      
      navigate('/privacy-readiness/results');
    } catch (err) {
      console.error('Failed to calculate assessment:', err);
      toast.error("Failed to complete assessment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentQuestion < privacyQuestions.length - 1) {
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

  const currentQuestionData = privacyQuestions[currentQuestion];
  const hasCurrentAnswer = answers[currentQuestionData?.id] !== undefined;
  const progress = ((currentQuestion + 1) / privacyQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Privacy Readiness Assessment | Wellness Genius</title>
        <meta 
          name="description" 
          content="Take our 5-minute Privacy Readiness assessment to discover your score." 
        />
      </Helmet>
      
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container-wide section-padding">
          {step === "intro" && (
            <div className="max-w-lg mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
                  <Shield size={16} />
                  Privacy Readiness
                </div>
                <h1 className="text-3xl font-heading mb-4">Start Your Assessment</h1>
                <p className="text-muted-foreground">
                  10 questions • 5 minutes • Instant results
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name (optional)</Label>
                  <Input
                    id="name"
                    value={userInfo.name}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company (optional)</Label>
                  <Input
                    id="company"
                    value={userInfo.company}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Your company"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role (optional)</Label>
                  <Input
                    id="role"
                    value={userInfo.role}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="Your role"
                  />
                </div>

                <Button 
                  variant="accent" 
                  className="w-full mt-6" 
                  onClick={handleStartAssessment}
                >
                  Start Assessment
                  <ArrowRight size={16} />
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  We'll only use your email to send your results.
                </p>
              </div>
            </div>
          )}

          {step === "questions" && (
            <div className="max-w-2xl mx-auto">
              {/* Badge */}
              <div className="text-center mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium gap-2">
                  <Shield size={12} />
                  Privacy Readiness • 10 Questions
                </span>
              </div>

              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Question {currentQuestion + 1} of {privacyQuestions.length}</span>
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
                      Calculating...
                    </>
                  ) : currentQuestion === privacyQuestions.length - 1 ? (
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

export default PrivacyReadinessAssessment;
