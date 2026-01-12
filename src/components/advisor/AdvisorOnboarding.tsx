import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, Loader2 } from "lucide-react";

interface OnboardingData {
  business_name: string;
  sector: string;
  business_size: string;
  goals: string[];
  biggest_challenge: string;
  current_stack: string[];
}

interface AdvisorOnboardingProps {
  onComplete: (data: OnboardingData) => Promise<void>;
  existingData?: Partial<OnboardingData>;
}

const SECTORS = [
  "Fitness operator",
  "Hospitality/spa",
  "Corporate wellbeing",
  "Retail rewards",
  "Health tech",
  "Wellness marketplace",
  "Studio/boutique",
  "Other",
];

const BUSINESS_SIZES = [
  "Solo/freelancer",
  "1 site",
  "2-5 sites",
  "6-20 sites",
  "Enterprise (20+)",
];

const GOALS = [
  "Retention",
  "Member acquisition",
  "Engagement",
  "Upsell/cross-sell",
  "Sponsorship revenue",
  "Operational efficiency",
  "AI adoption",
  "Data quality",
];

const CHALLENGES = [
  "Low engagement",
  "High churn",
  "Limited data",
  "Team capacity",
  "Budget constraints",
  "Tech integration",
  "No clear strategy",
  "Competition",
];

const AdvisorOnboarding = ({ onComplete, existingData }: AdvisorOnboardingProps) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    business_name: existingData?.business_name || "",
    sector: existingData?.sector || "",
    business_size: existingData?.business_size || "",
    goals: existingData?.goals || [],
    biggest_challenge: existingData?.biggest_challenge || "",
    current_stack: existingData?.current_stack || [],
  });

  const handleGoalToggle = (goal: string) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : prev.goals.length < 2
        ? [...prev.goals, goal]
        : prev.goals,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onComplete(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return data.business_name && data.sector;
    if (step === 2) return data.business_size && data.goals.length > 0;
    if (step === 3) return data.biggest_challenge;
    return false;
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Set up your Advisor</CardTitle>
          <CardDescription>
            {step === 1 && "Tell us about your business (1 of 3)"}
            {step === 2 && "What are you working towards? (2 of 3)"}
            {step === 3 && "What's holding you back? (3 of 3)"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="business_name">Business name</Label>
                <Input
                  id="business_name"
                  value={data.business_name}
                  onChange={(e) => setData({ ...data, business_name: e.target.value })}
                  placeholder="e.g., Fitness First Manchester"
                />
              </div>
              <div>
                <Label>Sector</Label>
                <Select value={data.sector} onValueChange={(v) => setData({ ...data, sector: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTORS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label>Business size</Label>
                <Select value={data.business_size} onValueChange={(v) => setData({ ...data, business_size: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business size" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_SIZES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Top 2 goals (select up to 2)</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {GOALS.map((goal) => (
                    <Button
                      key={goal}
                      type="button"
                      variant={data.goals.includes(goal) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleGoalToggle(goal)}
                      className="justify-start text-xs"
                    >
                      {goal}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label>Biggest bottleneck right now</Label>
                <Select
                  value={data.biggest_challenge}
                  onValueChange={(v) => setData({ ...data, biggest_challenge: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your main challenge" />
                  </SelectTrigger>
                  <SelectContent>
                    {CHALLENGES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                This helps the Advisor prioritise recommendations for your situation.
              </p>
            </div>
          )}

          <div className="flex justify-between pt-4">
            {step > 1 ? (
              <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                Back
              </Button>
            ) : (
              <div />
            )}
            {step < 3 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!canProceed() || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Start using Advisor
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvisorOnboarding;
