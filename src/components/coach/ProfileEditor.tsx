import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

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

interface ProfileEditorProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData | null;
  onSave: (profile: Partial<ProfileData>) => Promise<boolean>;
}

const ProfileEditor = ({ isOpen, onClose, profile, onSave }: ProfileEditorProps) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    business_type: "",
    business_name: "",
    business_size_band: "",
    team_size: "",
    role: "",
    primary_goal: "",
    frustration: "",
    current_tech: "",
    ai_experience: "",
    biggest_win: "",
    decision_style: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        business_type: profile.business_type || "",
        business_name: profile.business_name || "",
        business_size_band: profile.business_size_band || "",
        team_size: profile.team_size || "",
        role: profile.role || "",
        primary_goal: profile.primary_goal || "",
        frustration: profile.frustration || "",
        current_tech: profile.current_tech || "",
        ai_experience: profile.ai_experience || "",
        biggest_win: profile.biggest_win || "",
        decision_style: profile.decision_style || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await onSave(formData);
      if (success) {
        toast.success("Profile updated successfully");
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Your Coach Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Business Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Business Information</h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Business name</Label>
                <Input
                  placeholder="e.g. FitLife Studios"
                  value={formData.business_name || ""}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Business type</Label>
                <Select
                  value={formData.business_type || ""}
                  onValueChange={(v) => setFormData({ ...formData, business_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gym">Gym / Fitness Centre</SelectItem>
                    <SelectItem value="app">Wellness App</SelectItem>
                    <SelectItem value="hospitality">Spa / Hospitality</SelectItem>
                    <SelectItem value="corporate">Corporate Wellness</SelectItem>
                    <SelectItem value="studio">Studio / Boutique</SelectItem>
                    <SelectItem value="platform">Platform / Marketplace</SelectItem>
                    <SelectItem value="coaching">Coaching / PT</SelectItem>
                    <SelectItem value="retreat">Retreat / Experience</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Revenue band</Label>
                <Select
                  value={formData.business_size_band || ""}
                  onValueChange={(v) => setFormData({ ...formData, business_size_band: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select band" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">Pre-revenue</SelectItem>
                    <SelectItem value="small">Under £100k</SelectItem>
                    <SelectItem value="growing">£100k - £500k</SelectItem>
                    <SelectItem value="established">£500k - £2m</SelectItem>
                    <SelectItem value="scaling">£2m - £10m</SelectItem>
                    <SelectItem value="enterprise">£10m+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Team size</Label>
                <Select
                  value={formData.team_size || ""}
                  onValueChange={(v) => setFormData({ ...formData, team_size: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solo">Just me</SelectItem>
                    <SelectItem value="micro">2-5</SelectItem>
                    <SelectItem value="small">6-15</SelectItem>
                    <SelectItem value="medium">16-50</SelectItem>
                    <SelectItem value="large">51-200</SelectItem>
                    <SelectItem value="enterprise">200+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Your Role */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Your Role</h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Your role</Label>
                <Select
                  value={formData.role || ""}
                  onValueChange={(v) => setFormData({ ...formData, role: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="founder">Founder / CEO</SelectItem>
                    <SelectItem value="exec">Executive / Director</SelectItem>
                    <SelectItem value="gm">General Manager</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="ops">Operations</SelectItem>
                    <SelectItem value="commercial">Commercial / Sales</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="tech">Tech / Engineering</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Decision style</Label>
                <Select
                  value={formData.decision_style || ""}
                  onValueChange={(v) => setFormData({ ...formData, decision_style: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="data">Data-driven</SelectItem>
                    <SelectItem value="instinct">Instinct-led</SelectItem>
                    <SelectItem value="collaborative">Collaborative</SelectItem>
                    <SelectItem value="cautious">Cautious</SelectItem>
                    <SelectItem value="fast">Fast-moving</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Goals & Focus */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Goals and Focus</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Primary focus right now</Label>
                <Select
                  value={formData.primary_goal || ""}
                  onValueChange={(v) => setFormData({ ...formData, primary_goal: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select focus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retention">Retention and Engagement</SelectItem>
                    <SelectItem value="monetisation">Monetisation and Revenue</SelectItem>
                    <SelectItem value="ai">AI Implementation</SelectItem>
                    <SelectItem value="risk">Risk and Compliance</SelectItem>
                    <SelectItem value="growth">Growth and Acquisition</SelectItem>
                    <SelectItem value="product">Product Development</SelectItem>
                    <SelectItem value="operations">Operations and Efficiency</SelectItem>
                    <SelectItem value="team">Team and Culture</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Biggest frustration right now</Label>
                <Textarea
                  placeholder="What is blocking your progress?"
                  value={formData.frustration || ""}
                  onChange={(e) => setFormData({ ...formData, frustration: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Recent win you are proud of</Label>
                <Textarea
                  placeholder="What success have you had recently?"
                  value={formData.biggest_win || ""}
                  onChange={(e) => setFormData({ ...formData, biggest_win: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </div>

          {/* Tech & AI */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Tech and AI</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>AI experience level</Label>
                <Select
                  value={formData.ai_experience || ""}
                  onValueChange={(v) => setFormData({ ...formData, ai_experience: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="curious">Curious but not started</SelectItem>
                    <SelectItem value="experimenting">Experimenting with tools</SelectItem>
                    <SelectItem value="piloting">Running small AI pilots</SelectItem>
                    <SelectItem value="implementing">Actively implementing AI</SelectItem>
                    <SelectItem value="advanced">AI is core to our product</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Current tech stack</Label>
                <Textarea
                  placeholder="e.g. Mindbody, custom app, Excel, Stripe, Mailchimp..."
                  value={formData.current_tech || ""}
                  onChange={(e) => setFormData({ ...formData, current_tech: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditor;