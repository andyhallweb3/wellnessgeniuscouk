import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Brain, Target, AlertTriangle, Sparkles } from "lucide-react";

interface CoachOnboardingProps {
  onComplete: (profile: {
    business_type: string;
    role: string;
    primary_goal: string;
    frustration: string;
  }) => void;
}

const CoachOnboarding = ({ onComplete }: CoachOnboardingProps) => {
  const [step, setStep] = useState(1);
  const [acknowledged, setAcknowledged] = useState(false);
  const [profile, setProfile] = useState({
    business_type: "",
    role: "",
    primary_goal: "",
    frustration: "",
  });

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onComplete(profile);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return true;
      case 2:
        return acknowledged;
      case 3:
        return profile.business_type && profile.role && profile.primary_goal;
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
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              s <= step ? "bg-accent" : "bg-border"
            }`}
          />
        ))}
      </div>

      {/* Step 1: Positioning */}
      {step === 1 && (
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10">
            <AlertTriangle size={32} className="text-accent" />
          </div>
          <h2 className="text-2xl font-heading">This is not a chatbot.</h2>
          <p className="text-muted-foreground">
            The Wellness Genius AI Coach is a decision-grade intelligence agent
            for people building real wellness businesses.
          </p>
          <div className="text-left bg-secondary rounded-lg p-6 space-y-3">
            <p className="font-medium">It will:</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-accent">•</span>
                Challenge weak assumptions
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">•</span>
                Slow you down when foundations are missing
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">•</span>
                Prioritise commercial outcomes over novelty
              </li>
            </ul>
            <p className="font-medium pt-2">It will not:</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-destructive">•</span>
                Motivate you
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">•</span>
                Validate bad ideas
              </li>
              <li className="flex items-start gap-2">
                <span className="text-destructive">•</span>
                Promise results
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Step 2: Expectation Setting */}
      {step === 2 && (
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10">
            <Target size={32} className="text-accent" />
          </div>
          <h2 className="text-2xl font-heading">What this coach is optimised for</h2>
          <div className="text-left bg-secondary rounded-lg p-6 space-y-3">
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-accent text-xs">✓</span>
                </div>
                Making better decisions
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-accent text-xs">✓</span>
                </div>
                Protecting margin and trust
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-accent text-xs">✓</span>
                </div>
                Reducing wasted effort
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-accent text-xs">✓</span>
                </div>
                Improving clarity, not confidence theatre
              </li>
            </ul>
          </div>
          <div className="flex items-start gap-3 text-left pt-4">
            <Checkbox
              id="acknowledge"
              checked={acknowledged}
              onCheckedChange={(checked) => setAcknowledged(checked === true)}
            />
            <Label htmlFor="acknowledge" className="text-sm cursor-pointer">
              I want honest guidance, not reassurance
            </Label>
          </div>
        </div>
      )}

      {/* Step 3: Context Capture */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
              <Brain size={32} className="text-accent" />
            </div>
            <h2 className="text-2xl font-heading mb-2">Set your context</h2>
            <p className="text-sm text-muted-foreground">
              This helps the coach challenge you properly.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Business type</Label>
              <Select
                value={profile.business_type}
                onValueChange={(v) => setProfile({ ...profile, business_type: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gym">Gym / Fitness Centre</SelectItem>
                  <SelectItem value="app">Wellness App</SelectItem>
                  <SelectItem value="hospitality">Spa / Hospitality</SelectItem>
                  <SelectItem value="corporate">Corporate Wellness</SelectItem>
                  <SelectItem value="studio">Studio / Boutique</SelectItem>
                  <SelectItem value="platform">Platform / Marketplace</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Your role</Label>
              <Select
                value={profile.role}
                onValueChange={(v) => setProfile({ ...profile, role: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="founder">Founder / CEO</SelectItem>
                  <SelectItem value="exec">Executive / Director</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="ops">Operations</SelectItem>
                  <SelectItem value="commercial">Commercial / Sales</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="tech">Tech / Engineering</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Primary focus right now</Label>
              <Select
                value={profile.primary_goal}
                onValueChange={(v) => setProfile({ ...profile, primary_goal: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="What's your main priority?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retention">Retention & Engagement</SelectItem>
                  <SelectItem value="monetisation">Monetisation & Revenue</SelectItem>
                  <SelectItem value="ai">AI Implementation</SelectItem>
                  <SelectItem value="risk">Risk & Compliance</SelectItem>
                  <SelectItem value="growth">Growth & Acquisition</SelectItem>
                  <SelectItem value="product">Product Development</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Biggest frustration right now (optional)</Label>
              <Textarea
                placeholder="What's blocking your progress?"
                value={profile.frustration}
                onChange={(e) => setProfile({ ...profile, frustration: e.target.value })}
                className="min-h-[80px]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Mode Education */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
              <Sparkles size={32} className="text-accent" />
            </div>
            <h2 className="text-2xl font-heading mb-2">How to use the coach</h2>
            <p className="text-sm text-muted-foreground">
              Different modes for different thinking needs.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                icon: "🔍",
                name: "Diagnostic Mode",
                desc: "Use when something feels wrong but you can't pinpoint why",
              },
              {
                icon: "🧠",
                name: "Decision Coach",
                desc: "Use when choosing between paths",
              },
              {
                icon: "📈",
                name: "Commercial Lens",
                desc: "Use when translating ideas into money or risk",
              },
              {
                icon: "🧱",
                name: "Foundations First",
                desc: "Use before building anything new",
              },
              {
                icon: "📋",
                name: "90-Day Planner",
                desc: "Use when you're ready to act",
              },
            ].map((mode) => (
              <div
                key={mode.name}
                className="flex items-start gap-3 p-3 rounded-lg bg-secondary"
              >
                <span className="text-xl">{mode.icon}</span>
                <div>
                  <p className="font-medium text-sm">{mode.name}</p>
                  <p className="text-xs text-muted-foreground">{mode.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex justify-end">
        <Button onClick={handleNext} disabled={!canProceed()} variant="accent">
          {step === 4 ? "Enter AI Coach" : "Continue"}
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
};

export default CoachOnboarding;
