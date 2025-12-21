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
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, User, FileText, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import DocumentLibrary from "./DocumentLibrary";

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
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
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

  useEffect(() => {
    if (isOpen) {
      setSaved(false);
    }
  }, [isOpen]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const success = await onSave(formData);
      if (success) {
        setSaved(true);
        toast.success("Profile saved! Your AI coach is now personalised to your business.");
        // Don't close immediately so user sees the confirmation
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        toast.error("Failed to save profile. Please try again.");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Coach Personalisation</DialogTitle>
          <DialogDescription>
            The more context you provide, the more relevant your AI coach responses will be.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User size={14} />
              Business Profile
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText size={14} />
              Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="flex-1 overflow-y-auto mt-4">
            <div className="space-y-6 py-2 pr-2">
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
          </TabsContent>

          <TabsContent value="documents" className="flex-1 overflow-hidden mt-4">
            <div className="h-full flex flex-col">
              <div className="bg-secondary/50 rounded-lg p-3 mb-4">
                <p className="text-xs text-muted-foreground text-center">
                  Upload business plans, financials, or other documents to give the coach deeper context. Documents are saved automatically.
                </p>
              </div>
              <div className="flex-1 border border-border rounded-xl overflow-hidden min-h-[300px]">
                <DocumentLibrary />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center gap-3 pt-4 border-t mt-4">
          <p className="text-xs text-muted-foreground">
            {activeTab === "profile" ? "Profile data personalises AI responses" : "Documents are saved automatically"}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {activeTab === "profile" && (
              <Button variant="accent" onClick={handleSave} disabled={saving || saved}>
                {saved ? (
                  <>
                    <CheckCircle size={16} className="text-green-500" />
                    Saved!
                  </>
                ) : saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Profile
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditor;