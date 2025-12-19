import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Building2, TrendingUp, Users, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AssessmentQuestion from "@/components/assessment/AssessmentQuestion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BusinessProfile {
  businessType: string;
  region: string;
  arpuBand: string;
  churnBand: string;
  activeRateBand: string;
  unknownArpu: boolean;
  unknownChurn: boolean;
  unknownActiveRate: boolean;
}

interface AssessmentAnswers {
  [key: string]: number;
}

// Full paid assessment: 5 questions per section = 25 questions total
const paidQuestions = [
  // Data Maturity (5 questions)
  {
    id: "data_1",
    pillar: "Data Maturity",
    text: "We have a clear inventory of where our critical business data lives and who owns it.",
    context: "AI is only as good as the data it learns from.",
    examples: ["Documented list of all systems holding member data", "Named data owners", "Clear retention policies"],
  },
  {
    id: "data_2",
    pillar: "Data Maturity",
    text: "Our core systems are integrated and data flows automatically between them.",
    context: "Siloed systems create incomplete customer views.",
    examples: ["Booking syncs with CRM", "Payment links to profiles", "Unified customer view"],
  },
  {
    id: "data_3",
    pillar: "Data Maturity",
    text: "We have at least 12 months of clean, structured historical data.",
    context: "AI learns from patterns in historical data.",
    examples: ["Attendance records 12+ months", "Historical sales categorised", "Interaction logs stored"],
  },
  {
    id: "data_4",
    pillar: "Data Maturity",
    text: "We have processes to regularly clean and validate data quality.",
    context: "Dirty data produces unreliable AI.",
    examples: ["Monthly hygiene checks", "Automated quality alerts", "Duplicate handling processes"],
  },
  {
    id: "data_5",
    pillar: "Data Maturity",
    text: "We can easily export data in standard formats (CSV, API).",
    context: "Locked-in data prevents AI experimentation.",
    examples: ["Full CRM exports available", "APIs for key systems", "No contractual data restrictions"],
  },
  // Engagement (5 questions)
  {
    id: "engagement_1",
    pillar: "Engagement",
    text: "We track customer engagement metrics consistently across channels.",
    context: "You can't improve what you don't measure.",
    examples: ["Class occupancy tracked", "App engagement monitored", "Multi-channel attribution"],
  },
  {
    id: "engagement_2",
    pillar: "Engagement",
    text: "We segment customers based on behaviour and engagement patterns.",
    context: "Not all customers are equal.",
    examples: ["High/low engagement tiers", "Behaviour-based segments", "Predictive churn flags"],
  },
  {
    id: "engagement_3",
    pillar: "Engagement",
    text: "Engagement data directly informs our retention strategy.",
    context: "Data should drive action.",
    examples: ["At-risk interventions automated", "Engagement triggers outreach", "Churn prediction in use"],
  },
  {
    id: "engagement_4",
    pillar: "Engagement",
    text: "We personalise customer experiences based on their data.",
    context: "Personalisation drives loyalty.",
    examples: ["Recommended classes", "Personalised content", "Tailored offers"],
  },
  {
    id: "engagement_5",
    pillar: "Engagement",
    text: "We measure the ROI of our engagement initiatives.",
    context: "Engagement must connect to revenue.",
    examples: ["Retention lift measured", "Campaign ROI tracked", "LTV by segment calculated"],
  },
  // Monetisation (5 questions)
  {
    id: "monetisation_1",
    pillar: "Monetisation",
    text: "We have identified clear revenue opportunities from better data use.",
    context: "AI should generate ROI, not just insights.",
    examples: ["Upsell from behaviour", "Pricing optimisation", "Partner revenue from data"],
  },
  {
    id: "monetisation_2",
    pillar: "Monetisation",
    text: "We capture value from engagement (not just create it).",
    context: "Engagement without monetisation is a cost centre.",
    examples: ["Premium data-driven tier", "Personalised offers driving revenue", "B2B licensing"],
  },
  {
    id: "monetisation_3",
    pillar: "Monetisation",
    text: "We have multiple revenue streams beyond core membership.",
    context: "Diversification reduces risk.",
    examples: ["Retail/F&B revenue", "Partner/sponsor income", "Digital products"],
  },
  {
    id: "monetisation_4",
    pillar: "Monetisation",
    text: "We know our customer acquisition cost and lifetime value.",
    context: "Unit economics guide investment.",
    examples: ["CAC calculated by channel", "LTV tracked by segment", "Payback period known"],
  },
  {
    id: "monetisation_5",
    pillar: "Monetisation",
    text: "We have a clear pricing strategy informed by data.",
    context: "Pricing is your biggest lever.",
    examples: ["Dynamic pricing tested", "Demand-based scheduling", "Yield optimisation in place"],
  },
  // AI & Automation (5 questions)
  {
    id: "automation_1",
    pillar: "AI & Automation",
    text: "We have run at least one AI or automation pilot in the past 12 months.",
    context: "Experience beats theory.",
    examples: ["Chatbot deployed", "Email automation", "AI recommendations tested"],
  },
  {
    id: "automation_2",
    pillar: "AI & Automation",
    text: "Leadership understands AI capabilities and realistic timelines.",
    context: "Unrealistic expectations kill projects.",
    examples: ["Leaders know AI needs data", "Understand augmentation vs replacement", "3-6 month value expectation"],
  },
  {
    id: "automation_3",
    pillar: "AI & Automation",
    text: "We have identified repetitive tasks that consume significant time.",
    context: "Best AI opportunities hide in tedious manual work.",
    examples: ["5+ hours/week on manual tasks", "Copy-paste between systems", "Repetitive customer questions"],
  },
  {
    id: "automation_4",
    pillar: "AI & Automation",
    text: "We have someone internally who can champion AI projects.",
    context: "AI needs a translator between business and tech.",
    examples: ["Tech-comfortable ops manager", "Someone attending AI events", "Staff experimenting with AI tools"],
  },
  {
    id: "automation_5",
    pillar: "AI & Automation",
    text: "We have budget allocated for AI/automation initiatives.",
    context: "AI requires investment to deliver value.",
    examples: ["Ring-fenced tech budget", "Pilot funding available", "ROI expectations documented"],
  },
  // Trust & Compliance (5 questions)
  {
    id: "trust_1",
    pillar: "Trust & Compliance",
    text: "We have documented policies for data privacy and GDPR compliance.",
    context: "Trust is hard to rebuild.",
    examples: ["Written data protection policy", "Staff GDPR trained", "Consent mechanisms in place"],
  },
  {
    id: "trust_2",
    pillar: "Trust & Compliance",
    text: "We understand how AI could impact different customer groups.",
    context: "AI can inadvertently discriminate.",
    examples: ["Bias risk awareness", "Fairness testing planned", "Inclusive design considered"],
  },
  {
    id: "trust_3",
    pillar: "Trust & Compliance",
    text: "We maintain human oversight for AI-assisted decisions.",
    context: "AI should support decisions, not make them invisibly.",
    examples: ["Staff review AI recommendations", "Escalation paths defined", "Regular outcome audits"],
  },
  {
    id: "trust_4",
    pillar: "Trust & Compliance",
    text: "We have vendor due diligence processes for AI tools.",
    context: "Not all AI vendors are equal.",
    examples: ["Checklist for new vendors", "Security certifications reviewed", "Data storage understood"],
  },
  {
    id: "trust_5",
    pillar: "Trust & Compliance",
    text: "We have a plan for managing AI's impact on staff roles.",
    context: "AI changes jobs, not just processes.",
    examples: ["Communication plan exists", "Reskilling commitment", "Augmentation messaging clear"],
  },
];

const businessTypes = [
  { value: "gym", label: "Gym / Fitness Club" },
  { value: "hotel_spa", label: "Hotel Spa / Wellness Resort" },
  { value: "corporate_wellbeing", label: "Corporate Wellbeing" },
  { value: "wellness_app", label: "Wellness App / Platform" },
  { value: "marketplace", label: "Wellness Marketplace" },
  { value: "other", label: "Other" },
];

const regions = [
  { value: "uk", label: "United Kingdom" },
  { value: "europe", label: "Europe" },
  { value: "north_america", label: "North America" },
  { value: "asia_pacific", label: "Asia Pacific" },
  { value: "middle_east", label: "Middle East" },
  { value: "other", label: "Other" },
];

const arpuBands = [
  { value: "under_20", label: "Under £20/month" },
  { value: "20_50", label: "£20-50/month" },
  { value: "50_100", label: "£50-100/month" },
  { value: "100_plus", label: "£100+/month" },
  { value: "unknown", label: "I don't know" },
];

const churnBands = [
  { value: "under_2", label: "Under 2% monthly" },
  { value: "2_5", label: "2-5% monthly" },
  { value: "5_10", label: "5-10% monthly" },
  { value: "over_10", label: "Over 10% monthly" },
  { value: "unknown", label: "I don't know" },
];

const activeRateBands = [
  { value: "over_80", label: "Over 80% active" },
  { value: "60_80", label: "60-80% active" },
  { value: "40_60", label: "40-60% active" },
  { value: "under_40", label: "Under 40% active" },
  { value: "unknown", label: "I don't know" },
];

const AIReadinessAssessmentPaid = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<"profile" | "questions">("profile");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<AssessmentAnswers>({});
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    businessType: "",
    region: "",
    arpuBand: "",
    churnBand: "",
    activeRateBand: "",
    unknownArpu: false,
    unknownChurn: false,
    unknownActiveRate: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProfileChange = (field: keyof BusinessProfile, value: string) => {
    setBusinessProfile(prev => {
      const updated = { ...prev, [field]: value };
      // Track unknown flags
      if (field === "arpuBand") updated.unknownArpu = value === "unknown";
      if (field === "churnBand") updated.unknownChurn = value === "unknown";
      if (field === "activeRateBand") updated.unknownActiveRate = value === "unknown";
      return updated;
    });
  };

  const isProfileComplete = businessProfile.businessType && businessProfile.region && 
    businessProfile.arpuBand && businessProfile.churnBand && businessProfile.activeRateBand;

  const handleStartQuestions = () => {
    if (isProfileComplete) {
      setStep("questions");
    }
  };

  const handleAnswer = (questionId: string, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));
  };

  const calculateSectionScores = () => {
    const sections = ["data", "engagement", "monetisation", "automation", "trust"];
    const scores: { [key: string]: number[] } = {};
    
    sections.forEach(section => {
      scores[section] = paidQuestions
        .filter(q => q.id.startsWith(section))
        .map(q => (answers[q.id] || 3) - 1); // Convert 1-5 to 0-4
    });
    
    return scores;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const sectionScores = calculateSectionScores();
      
      // Store the detailed assessment data and business profile
      const questionAnswers = paidQuestions.map(q => ({
        questionId: q.id,
        pillar: q.pillar,
        questionText: q.text,
        score: answers[q.id] || 3,
      }));

      sessionStorage.setItem('paidAssessmentData', JSON.stringify({
        businessProfile,
        sectionScores,
        questionAnswers,
        completionId: id,
      }));

      // Navigate to the full report
      navigate(`/ai-readiness/report/${id}`);
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
    if (currentQuestion < paidQuestions.length - 1) {
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

  const currentQuestionData = paidQuestions[currentQuestion];
  const hasCurrentAnswer = currentQuestionData && answers[currentQuestionData.id] !== undefined;
  const progress = ((currentQuestion + 1) / paidQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Full AI Readiness Assessment | Wellness Genius</title>
        <meta 
          name="description" 
          content="Complete your detailed AI Readiness assessment for a bespoke 90-day action plan." 
        />
      </Helmet>
      
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container-wide section-padding">
          {step === "profile" && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium mb-4">
                  Full Assessment • Detailed Insights • 90-Day Plan
                </span>
                <h1 className="text-3xl font-heading mb-4">Tell Us About Your Business</h1>
                <p className="text-muted-foreground">
                  This information helps us generate accurate revenue projections and tailored recommendations.
                </p>
              </div>

              <div className="bg-card rounded-xl p-8 border border-border shadow-elegant">
                {/* Business Type */}
                <div className="mb-6">
                  <Label className="flex items-center gap-2 mb-3">
                    <Building2 size={16} className="text-accent" />
                    Business Type
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {businessTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => handleProfileChange("businessType", type.value)}
                        className={`p-3 rounded-lg border text-left text-sm transition-all ${
                          businessProfile.businessType === type.value
                            ? "border-accent bg-accent/10"
                            : "border-border hover:border-accent/50"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Region */}
                <div className="mb-6">
                  <Label className="flex items-center gap-2 mb-3">
                    <Users size={16} className="text-accent" />
                    Primary Region
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {regions.map((region) => (
                      <button
                        key={region.value}
                        onClick={() => handleProfileChange("region", region.value)}
                        className={`p-3 rounded-lg border text-left text-sm transition-all ${
                          businessProfile.region === region.value
                            ? "border-accent bg-accent/10"
                            : "border-border hover:border-accent/50"
                        }`}
                      >
                        {region.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Revenue Metrics */}
                <div className="border-t border-border pt-6 mt-6">
                  <h3 className="font-heading text-lg mb-4 flex items-center gap-2">
                    <TrendingUp size={18} className="text-accent" />
                    Revenue Metrics
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    These help us estimate your revenue upside. Select "I don't know" if unsure.
                  </p>

                  {/* ARPU */}
                  <div className="mb-4">
                    <Label className="text-sm mb-2 block">Average Revenue Per User (ARPU)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {arpuBands.map((band) => (
                        <button
                          key={band.value}
                          onClick={() => handleProfileChange("arpuBand", band.value)}
                          className={`p-2 rounded-lg border text-sm transition-all ${
                            businessProfile.arpuBand === band.value
                              ? "border-accent bg-accent/10"
                              : "border-border hover:border-accent/50"
                          }`}
                        >
                          {band.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Churn */}
                  <div className="mb-4">
                    <Label className="text-sm mb-2 block">Monthly Churn Rate</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {churnBands.map((band) => (
                        <button
                          key={band.value}
                          onClick={() => handleProfileChange("churnBand", band.value)}
                          className={`p-2 rounded-lg border text-sm transition-all ${
                            businessProfile.churnBand === band.value
                              ? "border-accent bg-accent/10"
                              : "border-border hover:border-accent/50"
                          }`}
                        >
                          {band.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Rate */}
                  <div className="mb-4">
                    <Label className="text-sm mb-2 block">Active User Rate</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {activeRateBands.map((band) => (
                        <button
                          key={band.value}
                          onClick={() => handleProfileChange("activeRateBand", band.value)}
                          className={`p-2 rounded-lg border text-sm transition-all ${
                            businessProfile.activeRateBand === band.value
                              ? "border-accent bg-accent/10"
                              : "border-border hover:border-accent/50"
                          }`}
                        >
                          {band.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button 
                  variant="accent" 
                  size="lg" 
                  className="w-full mt-6"
                  onClick={handleStartQuestions}
                  disabled={!isProfileComplete}
                >
                  Continue to Assessment
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {step === "questions" && (
            <div className="max-w-2xl mx-auto">
              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Question {currentQuestion + 1} of {paidQuestions.length}</span>
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
                      <Loader2 size={16} className="animate-spin" />
                      Generating Report...
                    </>
                  ) : currentQuestion === paidQuestions.length - 1 ? (
                    <>
                      Generate Report
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

export default AIReadinessAssessmentPaid;
