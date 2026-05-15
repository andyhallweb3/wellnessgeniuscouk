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
import { ArrowRight, Loader2, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingData {
  business_name: string;
  sector: string;
  business_size: string;
  goals: string[];
  biggest_challenge: string;
  current_stack: string[];
  initial_kpis?: Record<string, string>;
}

interface AdvisorOnboardingProps {
  onComplete: (data: OnboardingData) => Promise<void>;
  existingData?: Partial<OnboardingData>;
}

// ─── Sector presets ──────────────────────────────────────────────────────────

const SECTORS = [
  {
    id: "gym",
    label: "Gym / Health Club",
    emoji: "🏋️",
    description: "Multi-equipment facility, memberships",
    sectorValue: "Fitness operator",
    goals: ["Retention", "Member acquisition", "Class fill rate", "Upsell/cross-sell"],
    challenges: ["High churn", "Low class attendance", "Competition", "Staff capacity", "Pricing pressure"],
    kpiKeys: ["total_members", "monthly_revenue", "retention_rate", "churn_rate", "class_fill_rate"],
  },
  {
    id: "boutique",
    label: "Boutique Studio",
    emoji: "🧘",
    description: "Yoga, Pilates, spin, CrossFit",
    sectorValue: "Studio/boutique",
    goals: ["Retention", "Class fill rate", "Member acquisition", "Engagement"],
    challenges: ["High churn", "Underbooked classes", "Pricing pressure", "Competition", "Limited data"],
    kpiKeys: ["total_members", "monthly_revenue", "class_fill_rate", "churn_rate", "nps_score"],
  },
  {
    id: "hotel_spa",
    label: "Hotel / Resort Spa",
    emoji: "🏨",
    description: "Spa, wellness, treatment rooms",
    sectorValue: "Hospitality/spa",
    goals: ["Upsell/cross-sell", "Engagement", "Operational efficiency", "Data quality"],
    challenges: ["Seasonal revenue", "Low rebooking rate", "Treatment room utilisation", "Staff retention", "Budget constraints"],
    kpiKeys: ["monthly_revenue", "avg_member_ltv", "nps_score", "staff_headcount"],
  },
  {
    id: "golf",
    label: "Golf & Country Club",
    emoji: "⛳",
    description: "Members club, F&B, facilities",
    sectorValue: "Fitness operator",
    goals: ["Retention", "Upsell/cross-sell", "Member acquisition", "Engagement"],
    challenges: ["High churn", "Underused facilities", "Attracting younger members", "F&B performance", "Competition"],
    kpiKeys: ["total_members", "monthly_revenue", "retention_rate", "nps_score"],
  },
  {
    id: "corporate",
    label: "Corporate Wellness",
    emoji: "🏢",
    description: "Employee wellbeing programmes",
    sectorValue: "Corporate wellbeing",
    goals: ["Engagement", "Operational efficiency", "AI adoption", "Data quality"],
    challenges: ["Low engagement", "Budget constraints", "Measuring ROI", "Leadership buy-in", "Tech integration"],
    kpiKeys: ["staff_headcount", "retention_rate", "nps_score", "monthly_revenue"],
  },
  {
    id: "other",
    label: "Other Wellness",
    emoji: "🌿",
    description: "Retreats, marketplace, clinic",
    sectorValue: "Other",
    goals: ["Retention", "Member acquisition", "Engagement", "Operational efficiency"],
    challenges: ["Low engagement", "High churn", "Limited data", "No clear strategy", "Competition"],
    kpiKeys: ["total_members", "monthly_revenue", "retention_rate", "nps_score"],
  },
] as const;

const BUSINESS_SIZES = [
  "1 site",
  "2–5 sites",
  "6–20 sites",
  "Enterprise (20+ sites)",
  "Pre-launch",
];

const KPI_META: Record<string, { label: string; unit: string; placeholder: string }> = {
  total_members: { label: "Total members", unit: "", placeholder: "e.g. 450" },
  monthly_revenue: { label: "Monthly revenue", unit: "£", placeholder: "e.g. 28000" },
  retention_rate: { label: "Retention rate", unit: "%", placeholder: "e.g. 78" },
  churn_rate: { label: "Monthly churn", unit: "%", placeholder: "e.g. 4.2" },
  avg_member_ltv: { label: "Avg member LTV", unit: "£", placeholder: "e.g. 840" },
  class_fill_rate: { label: "Class fill rate", unit: "%", placeholder: "e.g. 65" },
  staff_headcount: { label: "Staff headcount", unit: "", placeholder: "e.g. 12" },
  nps_score: { label: "NPS score", unit: "", placeholder: "e.g. 42" },
};

// ─── Component ───────────────────────────────────────────────────────────────

const AdvisorOnboarding = ({ onComplete, existingData }: AdvisorOnboardingProps) => {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSectorId, setSelectedSectorId] = useState<string>("");
  const [data, setData] = useState<OnboardingData>({
    business_name: existingData?.business_name || "",
    sector: existingData?.sector || "",
    business_size: existingData?.business_size || "",
    goals: existingData?.goals || [],
    biggest_challenge: existingData?.biggest_challenge || "",
    current_stack: existingData?.current_stack || [],
    initial_kpis: {},
  });
  const [kpiValues, setKpiValues] = useState<Record<string, string>>({});

  const selectedSector = SECTORS.find(s => s.id === selectedSectorId);

  const handleSectorSelect = (sectorId: string) => {
    const sector = SECTORS.find(s => s.id === sectorId);
    if (!sector) return;
    setSelectedSectorId(sectorId);
    setData(prev => ({
      ...prev,
      sector: sector.sectorValue,
      goals: [sector.goals[0], sector.goals[1]],
      biggest_challenge: "",
    }));
  };

  const handleGoalToggle = (goal: string) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : prev.goals.length < 3
        ? [...prev.goals, goal]
        : prev.goals,
    }));
  };

  const handleSubmit = async (skipKpis = false) => {
    setIsSubmitting(true);
    try {
      const kpis = skipKpis ? {} : Object.fromEntries(
        Object.entries(kpiValues).filter(([, v]) => v.trim() !== "")
      );
      await onComplete({ ...data, initial_kpis: kpis });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    if (step === 0) return !!selectedSectorId;
    if (step === 1) return !!data.business_name && !!data.business_size;
    if (step === 2) return data.goals.length > 0 && !!data.biggest_challenge;
    return true;
  };

  const TOTAL_STEPS = 4;
  const stepLabels = ["Your sector", "Your business", "Goals", "Key metrics"];

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Set up your Advisor</CardTitle>
          <CardDescription>{stepLabels[step]} — step {step + 1} of {TOTAL_STEPS}</CardDescription>
          {/* Progress bar */}
          <div className="mt-3 h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* STEP 0 — Sector picker */}
          {step === 0 && (
            <div className="grid grid-cols-2 gap-3">
              {SECTORS.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSectorSelect(s.id)}
                  className={cn(
                    "text-left p-4 rounded-xl border transition-all",
                    selectedSectorId === s.id
                      ? "border-accent bg-accent/5"
                      : "border-border bg-card hover:border-accent/40"
                  )}
                >
                  <div className="text-2xl mb-2">{s.emoji}</div>
                  <p className={cn("text-sm font-medium", selectedSectorId === s.id ? "text-accent" : "")}>{s.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                </button>
              ))}
            </div>
          )}

          {/* STEP 1 — Business name + size */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="business_name">Business name</Label>
                <Input
                  id="business_name"
                  value={data.business_name}
                  onChange={e => setData({ ...data, business_name: e.target.value })}
                  placeholder={
                    selectedSectorId === "hotel_spa" ? "e.g. The Spa at Gleneagles" :
                    selectedSectorId === "golf" ? "e.g. Wentworth Golf Club" :
                    selectedSectorId === "boutique" ? "e.g. Studio One Yoga" :
                    selectedSectorId === "corporate" ? "e.g. Acme Corp Wellbeing" :
                    "e.g. Fitness First Manchester"
                  }
                  autoFocus
                />
              </div>
              <div>
                <Label>Scale</Label>
                <Select value={data.business_size} onValueChange={v => setData({ ...data, business_size: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="How many sites?" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_SIZES.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* STEP 2 — Goals + challenge */}
          {step === 2 && selectedSector && (
            <div className="space-y-5">
              <div>
                <Label className="mb-2 block">Top priorities (select up to 3)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedSector.goals.map(goal => (
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
              <div>
                <Label>Biggest bottleneck right now</Label>
                <Select value={data.biggest_challenge} onValueChange={v => setData({ ...data, biggest_challenge: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your main challenge" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedSector.challenges.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* STEP 3 — KPI pre-load */}
          {step === 3 && selectedSector && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Add your current numbers so the Advisor can give specific advice from day one. Skip any you don't have yet — you can add them later in your Knowledge Base.
              </p>
              <div className="space-y-3">
                {selectedSector.kpiKeys.map(key => {
                  const meta = KPI_META[key];
                  if (!meta) return null;
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <Label className="w-36 text-xs text-muted-foreground shrink-0">{meta.label}</Label>
                      <div className="relative flex-1">
                        {meta.unit && (
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{meta.unit}</span>
                        )}
                        <Input
                          type="number"
                          min={0}
                          value={kpiValues[key] || ""}
                          onChange={e => setKpiValues(prev => ({ ...prev, [key]: e.target.value }))}
                          placeholder={meta.placeholder}
                          className={cn("h-9 text-sm", meta.unit ? "pl-7" : "")}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep(s => s - 1)}>Back</Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleSubmit(true)} disabled={isSubmitting}>
                  <SkipForward size={14} />
                  Skip
                </Button>
                <Button onClick={() => handleSubmit(false)} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Setting up…</>
                  ) : (
                    <>Start Advisor<ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvisorOnboarding;
