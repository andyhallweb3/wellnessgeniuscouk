import { useState } from "react";
import { 
  User, 
  TrendingUp, 
  MessageSquare, 
  Heart, 
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Pencil,
  Linkedin,
  Briefcase,
  Building2,
  Shield
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ProfessionalScore, RateLimits } from "@/hooks/useProfessionalFeed";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface ProfessionalScoreCardProps {
  score: ProfessionalScore | null;
  rateLimits: RateLimits | null;
  onUpdate: () => void;
}

const getScoreLevel = (score: number) => {
  if (score >= 80) return { label: "Trusted Voice", color: "text-green-500", bg: "bg-green-500" };
  if (score >= 60) return { label: "Rising Contributor", color: "text-blue-500", bg: "bg-blue-500" };
  if (score >= 40) return { label: "Active Member", color: "text-amber-500", bg: "bg-amber-500" };
  return { label: "New Member", color: "text-muted-foreground", bg: "bg-muted-foreground" };
};

const ProfessionalScoreCard = ({ score, rateLimits, onUpdate }: ProfessionalScoreCardProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [role, setRole] = useState(score?.role || "");
  const [organisation, setOrganisation] = useState(score?.organisation || "");
  const [linkedinUrl, setLinkedinUrl] = useState(score?.linkedin_url || "");
  const [saving, setSaving] = useState(false);

  if (!score) return null;

  const level = getScoreLevel(score.score);
  const progressToNext = score.score >= 80 ? 100 : ((score.score % 20) / 20) * 100;

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    // Validate LinkedIn URL if provided
    if (linkedinUrl && !linkedinUrl.includes("linkedin.com/in/")) {
      toast.error("Please enter a valid LinkedIn profile URL");
      return;
    }

    setSaving(true);
    
    const { error } = await supabase
      .from("professional_scores")
      .update({
        role: role || null,
        organisation: organisation || null,
        linkedin_url: linkedinUrl || null,
        linkedin_url_added: !!linkedinUrl,
      })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated");
      setIsEditing(false);
      onUpdate();
    }
    setSaving(false);
  };

  return (
    <Card className="border-border/50 bg-secondary/30">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-2">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  level.bg + "/20"
                )}>
                  <Shield size={18} className={level.color} />
                </div>
                <div>
                  <CardTitle className="text-sm font-medium">{level.label}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {score.role || "Set your role"} {score.organisation && `at ${score.organisation}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("text-xs", level.color)}>
                  Score: {score.score}
                </Badge>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4 pt-2">
            {/* Progress to next level */}
            {score.score < 80 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress to next level</span>
                  <span>{Math.round(progressToNext)}%</span>
                </div>
                <Progress value={progressToNext} className="h-1.5" />
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded-lg bg-background/50">
                <MessageSquare size={14} className="mx-auto mb-1 text-muted-foreground" />
                <p className="text-sm font-medium">{score.total_posts}</p>
                <p className="text-[10px] text-muted-foreground">Posts</p>
              </div>
              <div className="p-2 rounded-lg bg-background/50">
                <MessageSquare size={14} className="mx-auto mb-1 text-muted-foreground" />
                <p className="text-sm font-medium">{score.total_comments}</p>
                <p className="text-[10px] text-muted-foreground">Comments</p>
              </div>
              <div className="p-2 rounded-lg bg-background/50">
                <Heart size={14} className="mx-auto mb-1 text-muted-foreground" />
                <p className="text-sm font-medium">{score.total_likes_received}</p>
                <p className="text-[10px] text-muted-foreground">Likes</p>
              </div>
              <div className="p-2 rounded-lg bg-background/50">
                <CheckCircle size={14} className="mx-auto mb-1 text-muted-foreground" />
                <p className="text-sm font-medium">{score.total_helpful_marks}</p>
                <p className="text-[10px] text-muted-foreground">Helpful</p>
              </div>
            </div>

            {/* Rate limits */}
            {rateLimits && (
              <div className="p-3 rounded-lg bg-background/50 space-y-2">
                <p className="text-xs font-medium">Today's limits</p>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Posts</span>
                  <span>{rateLimits.posts_today}/{rateLimits.posts_per_day}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Comments</span>
                  <span>{rateLimits.comments_today}/{rateLimits.comments_per_day}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Limits increase as your score grows
                </p>
              </div>
            )}

            {/* Profile editing */}
            {isEditing ? (
              <div className="space-y-3 p-3 rounded-lg border border-border/50">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-xs">Your Role</Label>
                  <Input
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Fitness Director"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org" className="text-xs">Organisation</Label>
                  <Input
                    id="org"
                    value={organisation}
                    onChange={(e) => setOrganisation(e.target.value)}
                    placeholder="e.g. Acme Wellness"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="text-xs">LinkedIn Profile (optional)</Label>
                  <Input
                    id="linkedin"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="text-sm"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Shown on your profile only, never in posts
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveProfile} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setIsEditing(true)}
              >
                <Pencil size={12} className="mr-2" />
                Edit Profile
              </Button>
            )}

            {/* Score tips */}
            <div className="text-[10px] text-muted-foreground space-y-1 pt-2 border-t border-border/30">
              <p className="font-medium text-foreground">How to increase your score:</p>
              <ul className="space-y-0.5 list-disc list-inside">
                <li>Post quality insights (+3 per approved post)</li>
                <li>Get likes on your content (+2 for 5+ likes)</li>
                <li>Have comments marked helpful (+3)</li>
                <li>Consistent weekly activity (+2)</li>
              </ul>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default ProfessionalScoreCard;
