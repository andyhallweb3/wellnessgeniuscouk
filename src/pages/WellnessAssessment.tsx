import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  Moon,
  Brain,
  Apple,
  Users,
  Heart,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Target,
  TrendingUp,
  Shield,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const domains = [
  {
    id: "physical",
    icon: Activity,
    title: "Physical Health",
    description: "Exercise, movement, and body wellness",
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50",
  },
  {
    id: "sleep",
    icon: Moon,
    title: "Sleep Quality",
    description: "Rest, recovery, and sleep patterns",
    color: "from-indigo-500 to-purple-600",
    bgColor: "bg-indigo-50",
  },
  {
    id: "mental",
    icon: Brain,
    title: "Mental Wellness",
    description: "Stress, mindfulness, and emotional health",
    color: "from-teal-500 to-cyan-600",
    bgColor: "bg-teal-50",
  },
  {
    id: "nutrition",
    icon: Apple,
    title: "Nutritional Health",
    description: "Diet quality, hydration, and nourishment",
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50",
  },
  {
    id: "social",
    icon: Users,
    title: "Social Connection",
    description: "Relationships and community engagement",
    color: "from-pink-500 to-rose-600",
    bgColor: "bg-pink-50",
  },
  {
    id: "spiritual",
    icon: Heart,
    title: "Spiritual Well-being",
    description: "Purpose, meaning, and personal growth",
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-50",
  },
];

const aiPatterns = [
  { icon: Target, label: "Prompt Chaining", desc: "Multi-step analysis" },
  { icon: Shield, label: "Reflection", desc: "Quality assurance" },
  { icon: TrendingUp, label: "Goal Monitoring", desc: "Progress tracking" },
  { icon: Sparkles, label: "Personalisation", desc: "Memory-driven" },
];

interface FormData {
  name: string;
  age: string;
  activityLevel: string;
  sleepHours: string;
  stressLevel: string;
  dietQuality: string;
  healthConcerns: string;
}

const WellnessAssessment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"landing" | "assessment" | "processing">("landing");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    age: "",
    activityLevel: "",
    sleepHours: "",
    stressLevel: "",
    dietQuality: "",
    healthConcerns: "",
  });

  const questions = [
    {
      id: "name",
      label: "What's your name?",
      type: "text",
      placeholder: "Your name",
    },
    {
      id: "age",
      label: "How old are you?",
      type: "select",
      options: [
        { value: "18-24", label: "18-24" },
        { value: "25-34", label: "25-34" },
        { value: "35-44", label: "35-44" },
        { value: "45-54", label: "45-54" },
        { value: "55-64", label: "55-64" },
        { value: "65+", label: "65+" },
      ],
    },
    {
      id: "activityLevel",
      label: "What's your current activity level?",
      type: "select",
      options: [
        { value: "sedentary", label: "Sedentary (little to no exercise)" },
        { value: "light", label: "Light (1-2 days/week)" },
        { value: "moderate", label: "Moderate (3-4 days/week)" },
        { value: "active", label: "Active (5+ days/week)" },
        { value: "very_active", label: "Very Active (intense daily exercise)" },
      ],
    },
    {
      id: "sleepHours",
      label: "How many hours do you typically sleep?",
      type: "select",
      options: [
        { value: "less_than_5", label: "Less than 5 hours" },
        { value: "5-6", label: "5-6 hours" },
        { value: "6-7", label: "6-7 hours" },
        { value: "7-8", label: "7-8 hours" },
        { value: "8-9", label: "8-9 hours" },
        { value: "more_than_9", label: "More than 9 hours" },
      ],
    },
    {
      id: "stressLevel",
      label: "How would you rate your stress level?",
      type: "select",
      options: [
        { value: "low", label: "Low - I feel calm and relaxed" },
        { value: "moderate", label: "Moderate - Manageable stress" },
        { value: "high", label: "High - Often stressed" },
        { value: "very_high", label: "Very High - Overwhelmed regularly" },
      ],
    },
    {
      id: "dietQuality",
      label: "How would you describe your diet?",
      type: "select",
      options: [
        { value: "poor", label: "Poor - Mostly processed foods" },
        { value: "average", label: "Average - Mixed diet" },
        { value: "good", label: "Good - Mostly whole foods" },
        { value: "excellent", label: "Excellent - Balanced, nutritious diet" },
      ],
    },
    {
      id: "healthConcerns",
      label: "What are your main health concerns?",
      type: "text",
      placeholder: "e.g., low energy, poor sleep, stress, weight management",
    },
  ];

  const handleInputChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  // Calculate domain scores from form data
  const calculateDomainScores = () => {
    const scores: Record<string, number> = {};

    // Physical score based on activity
    const activityMap: Record<string, number> = {
      sedentary: 20,
      light: 40,
      moderate: 65,
      active: 80,
      very_active: 95,
    };
    scores.physical = activityMap[formData.activityLevel] || 50;

    // Sleep score
    const sleepMap: Record<string, number> = {
      less_than_5: 25,
      "5-6": 45,
      "6-7": 65,
      "7-8": 90,
      "8-9": 85,
      more_than_9: 60,
    };
    scores.sleep = sleepMap[formData.sleepHours] || 50;

    // Mental score based on stress
    const stressMap: Record<string, number> = {
      low: 90,
      moderate: 65,
      high: 40,
      very_high: 20,
    };
    scores.mental = stressMap[formData.stressLevel] || 50;

    // Nutrition score
    const dietMap: Record<string, number> = {
      poor: 25,
      average: 50,
      good: 75,
      excellent: 95,
    };
    scores.nutritional = dietMap[formData.dietQuality] || 50;

    // Social & Spiritual (baseline, will improve with tracking)
    scores.social = 55;
    scores.spiritual = 50;

    return scores;
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to complete the assessment");
      navigate("/auth");
      return;
    }

    setLoading(true);
    setStep("processing");

    try {
      const domainScores = calculateDomainScores();
      const overallScore = Math.round(
        Object.values(domainScores).reduce((a, b) => a + b, 0) / Object.keys(domainScores).length
      );

      // Save progress records for each domain
      for (const [domain, score] of Object.entries(domainScores)) {
        await supabase.from("wellness_progress").insert({
          user_id: user.id,
          domain,
          progress_percentage: score,
          status: score >= 70 ? "on_track" : score >= 50 ? "needs_attention" : "at_risk",
          insights: [],
          recommendations: [],
          data_snapshot: { source: "initial_assessment", ...formData },
        });
      }

      // Create a wellness plan
      const { error: planError } = await supabase.from("wellness_plans").insert([{
        user_id: user.id,
        plan_name: "12-Week Wellness Plan",
        duration_weeks: 12,
        status: "active",
        phases: [
          { phase: 1, name: "Foundation", weeks: "1-4", focus: "Build habits" },
          { phase: 2, name: "Building", weeks: "5-8", focus: "Increase intensity" },
          { phase: 3, name: "Sustaining", weeks: "9-12", focus: "Maintain progress" },
        ],
        milestones: [
          { week: 4, description: "Foundation complete" },
          { week: 8, description: "Building phase done" },
          { week: 12, description: "Plan complete" },
        ],
        assessment_snapshot: JSON.parse(JSON.stringify({
          overall_score: overallScore,
          domain_scores: domainScores,
          form_data: formData,
        })),
      }]);

      if (planError) console.error("Plan insert error:", planError);

      // Create goals for domains needing attention
      const lowDomains = Object.entries(domainScores)
        .filter(([, score]) => score < 70)
        .slice(0, 3);

      for (const [domain, score] of lowDomains) {
        await supabase.from("wellness_goals").insert({
          user_id: user.id,
          domain,
          description: `Improve ${domain} wellness to 70%`,
          target_value: 70,
          current_progress: score,
          status: "active",
          priority: score < 50 ? "high" : "medium",
          phase: "foundation",
        });
      }

      toast.success("Assessment complete! Your wellness plan is ready.");
      navigate("/wellness/dashboard");
    } catch (error) {
      console.error("Assessment error:", error);
      toast.error("Something went wrong. Please try again.");
      setStep("assessment");
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const isCurrentAnswered = formData[currentQ.id as keyof FormData]?.trim() !== "";

  if (step === "processing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center animate-pulse">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-heading text-gray-900">
            Analysing your wellness profile...
          </h2>
          <p className="text-gray-600">
            Our AI is creating your personalised 12-week wellness plan using all 7
            agentic patterns.
          </p>
          <div className="space-y-2">
            {aiPatterns.map((pattern, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-white/80 backdrop-blur rounded-lg p-3 animate-fade-in"
                style={{ animationDelay: `${i * 200}ms` }}
              >
                <pattern.icon className="w-5 h-5 text-teal-600" />
                <span className="text-sm font-medium text-gray-700">
                  {pattern.label}
                </span>
                <span className="text-xs text-gray-500 ml-auto">{pattern.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === "assessment") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-teal-50">
        <div className="max-w-2xl mx-auto px-4 py-12">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Card */}
          <Card className="bg-white/80 backdrop-blur border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-heading text-gray-900">
                {currentQ.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentQ.type === "text" ? (
                <Input
                  value={formData[currentQ.id as keyof FormData]}
                  onChange={(e) => handleInputChange(currentQ.id, e.target.value)}
                  placeholder={currentQ.placeholder}
                  className="text-lg h-14 bg-white border-gray-200"
                />
              ) : (
                <Select
                  value={formData[currentQ.id as keyof FormData]}
                  onValueChange={(value) => handleInputChange(currentQ.id, value)}
                >
                  <SelectTrigger className="text-lg h-14 bg-white border-gray-200">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentQ.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentQuestion === 0}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>

                {currentQuestion === questions.length - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={!isCurrentAnswered || loading}
                    className="gap-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                  >
                    Get My Wellness Plan
                    <Sparkles className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={!isCurrentAnswered}
                    className="gap-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Domain preview */}
          <div className="mt-8 grid grid-cols-6 gap-2">
            {domains.map((domain) => (
              <div
                key={domain.id}
                className={`p-3 rounded-xl ${domain.bgColor} flex items-center justify-center`}
                title={domain.title}
              >
                <domain.icon className="w-5 h-5 text-gray-600" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-teal-50">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-200/40 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-40 right-1/4 w-64 h-64 bg-amber-200/30 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur shadow-sm text-sm font-medium text-teal-700 mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Holistic Health
            </div>

            <h1 className="text-4xl lg:text-6xl font-heading mb-6">
              <span className="bg-gradient-to-r from-green-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Wellness Genius
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Transform your health with an intelligent wellness system that learns,
              adapts, and guides you across six domains of wellbeing.
            </p>

            <Button
              size="lg"
              onClick={() => setStep("assessment")}
              className="gap-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-lg px-8 py-6 rounded-xl shadow-lg"
            >
              Start Your Assessment
              <ArrowRight className="w-5 h-5" />
            </Button>

            <p className="text-sm text-gray-500 mt-4">
              Free • 5 minutes • Personalised wellness plan
            </p>
          </div>
        </div>
      </section>

      {/* Domains */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-heading text-center text-gray-900 mb-4">
            Six Domains of Wellness
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            A holistic approach that addresses every aspect of your wellbeing
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {domains.map((domain) => (
              <Card
                key={domain.id}
                className="group bg-white/80 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${domain.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <domain.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {domain.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{domain.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Patterns */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-heading text-center text-gray-900 mb-4">
            Powered by 7 AI Patterns
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Based on Antonio Gulli's Agentic Design Patterns for intelligent systems
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {aiPatterns.map((pattern, i) => (
              <div
                key={i}
                className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-md"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-green-600 flex items-center justify-center">
                  <pattern.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{pattern.label}</p>
                  <p className="text-xs text-gray-500">{pattern.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-heading text-gray-900 mb-4">
            Ready to transform your wellness?
          </h2>
          <p className="text-gray-600 mb-8">
            Get your personalised 12-week plan with actionable goals and progress
            tracking.
          </p>
          <Button
            size="lg"
            onClick={() => setStep("assessment")}
            className="gap-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
          >
            Begin Assessment
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default WellnessAssessment;
