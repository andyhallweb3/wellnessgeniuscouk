import { Building2, Target, Brain, User, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface ProfileData {
  business_type: string | null;
  business_name: string | null;
  business_size_band: string | null;
  team_size: string | null;
  role: string | null;
  primary_goal: string | null;
  frustration: string | null;
  current_tech: string | null;
  ai_experience: string | null;
  biggest_win: string | null;
  decision_style: string | null;
}

interface ProfileSummaryProps {
  profile: ProfileData | null;
  documentCount: number;
  onEditProfile: () => void;
  compact?: boolean;
}

const PROFILE_FIELDS = [
  { key: "business_type", label: "Business type", weight: 15 },
  { key: "business_name", label: "Business name", weight: 5 },
  { key: "business_size_band", label: "Revenue band", weight: 10 },
  { key: "team_size", label: "Team size", weight: 10 },
  { key: "role", label: "Your role", weight: 10 },
  { key: "primary_goal", label: "Primary focus", weight: 15 },
  { key: "frustration", label: "Current frustration", weight: 10 },
  { key: "current_tech", label: "Tech stack", weight: 5 },
  { key: "ai_experience", label: "AI experience", weight: 10 },
  { key: "biggest_win", label: "Recent win", weight: 5 },
  { key: "decision_style", label: "Decision style", weight: 5 },
] as const;

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  gym: "Gym / Fitness Centre",
  app: "Wellness App",
  hospitality: "Spa / Hospitality",
  corporate: "Corporate Wellness",
  studio: "Studio / Boutique",
  platform: "Platform / Marketplace",
  coaching: "Coaching / PT",
  retreat: "Retreat / Experience",
  other: "Other",
};

const ROLE_LABELS: Record<string, string> = {
  founder: "Founder / CEO",
  exec: "Executive / Director",
  gm: "General Manager",
  product: "Product",
  ops: "Operations",
  commercial: "Commercial / Sales",
  marketing: "Marketing",
  tech: "Tech / Engineering",
};

const GOAL_LABELS: Record<string, string> = {
  retention: "Retention & Engagement",
  monetisation: "Monetisation & Revenue",
  ai: "AI Implementation",
  risk: "Risk & Compliance",
  growth: "Growth & Acquisition",
  product: "Product Development",
  operations: "Operations & Efficiency",
  team: "Team & Culture",
};

const AI_EXPERIENCE_LABELS: Record<string, string> = {
  curious: "Curious but not started",
  experimenting: "Experimenting with AI tools",
  piloting: "Running small AI pilots",
  implementing: "Actively implementing AI",
  advanced: "AI is core to product",
};

export const calculateProfileCompleteness = (profile: ProfileData | null): number => {
  if (!profile) return 0;

  let totalWeight = 0;
  let completedWeight = 0;

  for (const field of PROFILE_FIELDS) {
    totalWeight += field.weight;
    const value = profile[field.key as keyof ProfileData];
    if (value && value.trim() !== "") {
      completedWeight += field.weight;
    }
  }

  return Math.round((completedWeight / totalWeight) * 100);
};

export const getProfileSummaryText = (profile: ProfileData | null, documentCount: number): string => {
  if (!profile) return "";

  const parts: string[] = [];

  if (profile.business_type) {
    const businessLabel = BUSINESS_TYPE_LABELS[profile.business_type] || profile.business_type;
    parts.push(profile.business_name ? `${profile.business_name} (${businessLabel})` : businessLabel);
  }

  if (profile.role) {
    parts.push(ROLE_LABELS[profile.role] || profile.role);
  }

  if (profile.primary_goal) {
    parts.push(`focused on ${GOAL_LABELS[profile.primary_goal] || profile.primary_goal}`);
  }

  if (profile.ai_experience) {
    parts.push(AI_EXPERIENCE_LABELS[profile.ai_experience] || profile.ai_experience);
  }

  if (documentCount > 0) {
    parts.push(`${documentCount} document${documentCount > 1 ? "s" : ""} uploaded`);
  }

  return parts.join(" • ");
};

const ProfileSummary = ({ profile, documentCount, onEditProfile, compact = false }: ProfileSummaryProps) => {
  const completeness = calculateProfileCompleteness(profile);
  const summaryText = getProfileSummaryText(profile, documentCount);
  const missingFields = PROFILE_FIELDS.filter(field => {
    const value = profile?.[field.key as keyof ProfileData];
    return !value || value.trim() === "";
  });

  if (compact) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 bg-secondary/50 rounded-lg border border-border/50">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
              completeness >= 80 ? "bg-green-500/20 text-green-500" :
              completeness >= 50 ? "bg-yellow-500/20 text-yellow-500" :
              "bg-orange-500/20 text-orange-500"
            }`}>
              {completeness}%
            </div>
          </div>
          <p className="text-xs text-muted-foreground truncate flex-1">
            {summaryText || "Complete your profile for better responses"}
          </p>
        </div>
        {completeness < 80 && (
          <Button variant="ghost" size="sm" className="shrink-0 h-6 text-xs" onClick={onEditProfile}>
            Complete
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <User size={14} className="text-accent" />
          Your Coach Context
        </h3>
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onEditProfile}>
          Edit Profile
        </Button>
      </div>

      {/* Completeness Score */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Profile completeness</span>
          <span className={`font-medium ${
            completeness >= 80 ? "text-green-500" :
            completeness >= 50 ? "text-yellow-500" :
            "text-orange-500"
          }`}>{completeness}%</span>
        </div>
        <Progress value={completeness} className="h-1.5" />
      </div>

      {/* Summary */}
      {summaryText && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          {summaryText}
        </p>
      )}

      {/* Missing fields hint */}
      {missingFields.length > 0 && completeness < 80 && (
        <div className="flex items-start gap-2 p-2 bg-accent/5 rounded-lg border border-accent/10">
          <AlertCircle size={12} className="text-accent shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Add {missingFields.slice(0, 3).map(f => f.label.toLowerCase()).join(", ")}
            {missingFields.length > 3 ? ` and ${missingFields.length - 3} more` : ""} for better personalisation
          </p>
        </div>
      )}

      {/* Quick context pills */}
      {profile && (
        <div className="flex flex-wrap gap-1.5">
          {profile.business_type && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary rounded text-xs">
              <Building2 size={10} />
              {BUSINESS_TYPE_LABELS[profile.business_type] || profile.business_type}
            </span>
          )}
          {profile.primary_goal && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary rounded text-xs">
              <Target size={10} />
              {GOAL_LABELS[profile.primary_goal] || profile.primary_goal}
            </span>
          )}
          {profile.ai_experience && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary rounded text-xs">
              <Brain size={10} />
              {AI_EXPERIENCE_LABELS[profile.ai_experience]?.split(" ")[0] || profile.ai_experience}
            </span>
          )}
          {documentCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent/10 text-accent rounded text-xs">
              {documentCount} doc{documentCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileSummary;