import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, ArrowLeft, Brain, Building2, Target, Zap, CheckCircle } from "lucide-react";

interface GenieOnboardingData {
  business_name: string;
  business_type: string;
  revenue_model: string;
  annual_revenue_band: string;
  team_size: string;
  primary_goal: string;
  biggest_challenge: string;
  known_weak_spots: string[];
  key_metrics: string[];
  communication_style: string;
  decision_style: string;
}

interface GenieOnboardingProps {
  onComplete: (data: GenieOnboardingData) => void;
  onSkip?: () => void;
}

const WEAK_SPOT_OPTIONS = [
  "Data quality",
  "Member retention", 
  "Staff capacity",
  "Tech infrastructure",
  "Cash flow",
  "Marketing ROI",
  "Compliance/Risk",
  "Leadership alignment",
];

const METRIC_OPTIONS = [
  "Monthly revenue",
  "Member retention rate",
  "NPS / satisfaction",
  "Cost per acquisition",
  "Lifetime value",
  "Churn rate",
  "Staff productivity",
  "Utilisation rate",
];

const GenieOnboarding = ({ onComplete, onSkip }: GenieOnboardingProps) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<GenieOnboardingData>({
    business_name: "",
    business_type: "",
    revenue_model: "",
    annual_revenue_band: "",
    team_size: "",
    primary_goal: "",
    biggest_challenge: "",
    known_weak_spots: [],
    key_metrics: [],
    communication_style: "balanced",
    decision_style: "deliberate",
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(data);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleArrayItem = (field: "known_weak_spots" | "key_metrics", item: string) => {
    const current = data[field];
    if (current.includes(item)) {
      setData({ ...data, [field]: current.filter((i) => i !== item) });
    } else if (current.length < 4) {
      setData({ ...data, [field]: [...current, item] });
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.business_type && data.revenue_model;
      case 2:
        return data.primary_goal;
      case 3:
        return data.known_weak_spots.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              s <= step ? "bg-accent" : "bg-border"
            }`}
          />
        ))}
      </div>

      {/* Step 1: Business Fundamentals */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
              <Building2 size={32} className="text-accent" />
            </div>
            <h2 className="text-2xl font-heading mb-2">Tell me about your business</h2>
            <p className="text-sm text-muted-foreground">
              I'll remember this context for every conversation.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Business name</Label>
              <Input
                placeholder="e.g. FitLife Studios"
                value={data.business_name}
                onChange={(e) => setData({ ...data, business_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>What type of business?</Label>
              <Select
                value={data.business_type}
                onValueChange={(v) => setData({ ...data, business_type: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gym">Gym / Fitness Centre</SelectItem>
                  <SelectItem value="studio">Boutique Studio</SelectItem>
                  <SelectItem value="app">Wellness App / Platform</SelectItem>
                  <SelectItem value="spa">Spa / Hospitality</SelectItem>
                  <SelectItem value="corporate">Corporate Wellness</SelectItem>
                  <SelectItem value="coaching">Coaching / PT</SelectItem>
                  <SelectItem value="retreat">Retreat / Experience</SelectItem>
                  <SelectItem value="multi">Multi-site Operator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Primary revenue model</Label>
              <Select
                value={data.revenue_model}
                onValueChange={(v) => setData({ ...data, revenue_model: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="How do you make money?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="membership">Recurring memberships</SelectItem>
                  <SelectItem value="class_packs">Class packs / credits</SelectItem>
                  <SelectItem value="subscription">Digital subscription</SelectItem>
                  <SelectItem value="one_time">One-time purchases</SelectItem>
                  <SelectItem value="hybrid">Hybrid model</SelectItem>
                  <SelectItem value="b2b">B2B contracts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Annual revenue</Label>
                <Select
                  value={data.annual_revenue_band}
                  onValueChange={(v) => setData({ ...data, annual_revenue_band: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Band" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pre_revenue">Pre-revenue</SelectItem>
                    <SelectItem value="under_100k">Under £100k</SelectItem>
                    <SelectItem value="100k_500k">£100k - £500k</SelectItem>
                    <SelectItem value="500k_2m">£500k - £2m</SelectItem>
                    <SelectItem value="2m_10m">£2m - £10m</SelectItem>
                    <SelectItem value="10m_plus">£10m+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Team size</Label>
                <Select
                  value={data.team_size}
                  onValueChange={(v) => setData({ ...data, team_size: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="People" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solo">Just me</SelectItem>
                    <SelectItem value="2_5">2-5</SelectItem>
                    <SelectItem value="6_15">6-15</SelectItem>
                    <SelectItem value="16_50">16-50</SelectItem>
                    <SelectItem value="51_200">51-200</SelectItem>
                    <SelectItem value="200_plus">200+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Strategic Focus */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
              <Target size={32} className="text-accent" />
            </div>
            <h2 className="text-2xl font-heading mb-2">What are you focused on?</h2>
            <p className="text-sm text-muted-foreground">
              This shapes the lens I use when advising you.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Primary goal right now</Label>
              <Select
                value={data.primary_goal}
                onValueChange={(v) => setData({ ...data, primary_goal: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="What matters most?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retention">Improve retention & engagement</SelectItem>
                  <SelectItem value="revenue">Increase revenue & monetisation</SelectItem>
                  <SelectItem value="efficiency">Operational efficiency</SelectItem>
                  <SelectItem value="growth">Member/customer growth</SelectItem>
                  <SelectItem value="ai_adoption">AI adoption & innovation</SelectItem>
                  <SelectItem value="risk_reduction">Risk & compliance</SelectItem>
                  <SelectItem value="team_building">Team & leadership</SelectItem>
                  <SelectItem value="product">Product development</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Biggest challenge blocking progress</Label>
              <Textarea
                placeholder="What's keeping you up at night? Be specific — the more honest, the better the guidance."
                value={data.biggest_challenge}
                onChange={(e) => setData({ ...data, biggest_challenge: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Known Weak Spots & Metrics */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
              <Zap size={32} className="text-accent" />
            </div>
            <h2 className="text-2xl font-heading mb-2">Weak spots & metrics</h2>
            <p className="text-sm text-muted-foreground">
              I'll flag risks and opportunities in these areas proactively.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Known weak spots (select up to 4)</Label>
              <div className="grid grid-cols-2 gap-2">
                {WEAK_SPOT_OPTIONS.map((item) => {
                  const selected = data.known_weak_spots.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleArrayItem("known_weak_spots", item)}
                      className={`px-3 py-2 text-sm rounded-lg border text-left transition-all ${
                        selected
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border bg-card hover:border-accent/50"
                      } ${
                        !selected && data.known_weak_spots.length >= 4
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {selected && <CheckCircle size={12} className="inline mr-2" />}
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Key metrics you track (select up to 4)</Label>
              <div className="grid grid-cols-2 gap-2">
                {METRIC_OPTIONS.map((item) => {
                  const selected = data.key_metrics.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleArrayItem("key_metrics", item)}
                      className={`px-3 py-2 text-sm rounded-lg border text-left transition-all ${
                        selected
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border bg-card hover:border-accent/50"
                      } ${
                        !selected && data.key_metrics.length >= 4
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {selected && <CheckCircle size={12} className="inline mr-2" />}
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Communication Preferences */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
              <Brain size={32} className="text-accent" />
            </div>
            <h2 className="text-2xl font-heading mb-2">How should I communicate?</h2>
            <p className="text-sm text-muted-foreground">
              I'll adapt my style to match your preferences.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Response style</Label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { value: "brief", label: "Brief", desc: "Get to the point. Short, punchy responses." },
                  { value: "balanced", label: "Balanced", desc: "Clear structure with enough detail." },
                  { value: "detailed", label: "Detailed", desc: "Thorough analysis with supporting context." },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setData({ ...data, communication_style: option.value })}
                    className={`px-4 py-3 text-left rounded-lg border transition-all ${
                      data.communication_style === option.value
                        ? "border-accent bg-accent/10"
                        : "border-border bg-card hover:border-accent/50"
                    }`}
                  >
                    <span className="font-medium">{option.label}</span>
                    <span className="text-sm text-muted-foreground ml-2">{option.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Decision style</Label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { value: "fast", label: "Fast & intuitive", desc: "I trust my gut and move quickly." },
                  { value: "deliberate", label: "Deliberate", desc: "I like to think things through." },
                  { value: "data_driven", label: "Data-driven", desc: "Show me the numbers." },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setData({ ...data, decision_style: option.value })}
                    className={`px-4 py-3 text-left rounded-lg border transition-all ${
                      data.decision_style === option.value
                        ? "border-accent bg-accent/10"
                        : "border-border bg-card hover:border-accent/50"
                    }`}
                  >
                    <span className="font-medium">{option.label}</span>
                    <span className="text-sm text-muted-foreground ml-2">{option.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <div>
          {step > 1 && (
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft size={16} />
              Back
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {step === 1 && onSkip && (
            <Button variant="ghost" onClick={onSkip}>
              Skip for now
            </Button>
          )}
          <Button variant="accent" onClick={handleNext} disabled={!canProceed()}>
            {step === totalSteps ? "Start Using Genie" : "Continue"}
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GenieOnboarding;
