import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Rocket } from "lucide-react";

interface BusinessOnboardingModalProps {
  open: boolean;
  onComplete: () => void;
  userId: string;
}

export default function BusinessOnboardingModal({ 
  open, 
  onComplete,
  userId 
}: BusinessOnboardingModalProps) {
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [currentGoal, setCurrentGoal] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessName.trim()) {
      toast.error("Please enter your business name");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('business_profiles')
        .insert({
          user_id: userId,
          business_name: businessName.trim(),
          industry: industry.trim() || null,
          target_audience: targetAudience.trim() || null,
          current_goal: currentGoal.trim() || null,
        });

      if (error) throw error;

      toast.success("Business profile created!");
      onComplete();
    } catch (err) {
      console.error("Error creating business profile:", err);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Rocket className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Welcome to Founder Agent</DialogTitle>
              <DialogDescription>
                Let's set up your strategic AI advisor
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">What is your business name? *</Label>
            <Input
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g., Acme Wellness Tech"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">What industry are you in?</Label>
            <Input
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g., B2B SaaS, Fitness Technology, Health & Wellness"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAudience">Who is your target customer?</Label>
            <Input
              id="targetAudience"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g., Gym owners, Corporate HR teams, Health coaches"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentGoal">What is your main goal right now?</Label>
            <Textarea
              id="currentGoal"
              value={currentGoal}
              onChange={(e) => setCurrentGoal(e.target.value)}
              placeholder="e.g., Launch MVP, Reach 100 paying customers, Raise seed funding"
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Setting up..." : "Launch My Agent"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
