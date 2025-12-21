import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, ArrowLeft, Brain, Target, AlertTriangle, Sparkles, Building2, Users, FileText, Upload } from "lucide-react";
import DocumentLibrary from "./DocumentLibrary";

interface CoachOnboardingProps {
  onComplete: (profile: {
    business_type: string;
    business_name: string;
    business_size_band: string;
    team_size: string;
    role: string;
    primary_goal: string;
    frustration: string;
    current_tech: string;
    ai_experience: string;
    biggest_win: string;
    decision_style: string;
  }) => void;
}

const CoachOnboarding = ({ onComplete }: CoachOnboardingProps) => {
  const [step, setStep] = useState(1);
  const [acknowledged, setAcknowledged] = useState(false);
  const [profile, setProfile] = useState({
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

  const totalSteps = 7;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(profile);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return true;
      case 2:
        return acknowledged;
      case 3:
        return profile.business_type && profile.role;
      case 4:
        return profile.primary_goal;
      case 5:
        return profile.ai_experience;
      case 6:
        return true; // Documents optional
      case 7:
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
          
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 text-left">
            <p className="text-sm font-medium text-accent mb-2">🎯 Personalised to you</p>
            <p className="text-xs text-muted-foreground">
              Over the next few steps, you'll build your coach profile. The more context you share about your business, the more relevant and actionable the guidance becomes.
            </p>
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

      {/* Step 3: Business Context */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
              <Building2 size={32} className="text-accent" />
            </div>
            <h2 className="text-2xl font-heading mb-2">Your Business Profile</h2>
            <p className="text-sm text-muted-foreground">
              This context shapes every response. Be specific for better guidance.
            </p>
          </div>

          <div className="bg-secondary/50 rounded-lg p-3 mb-2">
            <p className="text-xs text-muted-foreground text-center">
              <Users size={12} className="inline mr-1" />
              Your profile is used to personalise all AI coach responses
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>What type of wellness business do you run?</Label>
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
                  <SelectItem value="coaching">Coaching / PT</SelectItem>
                  <SelectItem value="retreat">Retreat / Experience</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Business name (optional)</Label>
              <Input
                placeholder="e.g. FitLife Studios"
                value={profile.business_name}
                onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>What is your role?</Label>
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
                  <SelectItem value="gm">General Manager</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="ops">Operations</SelectItem>
                  <SelectItem value="commercial">Commercial / Sales</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="tech">Tech / Engineering</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Business size</Label>
                <Select
                  value={profile.business_size_band}
                  onValueChange={(v) => setProfile({ ...profile, business_size_band: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Revenue band" />
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
                  value={profile.team_size}
                  onValueChange={(v) => setProfile({ ...profile, team_size: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="People" />
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
        </div>
      )}

      {/* Step 4: Goals & Frustrations */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
              <Target size={32} className="text-accent" />
            </div>
            <h2 className="text-2xl font-heading mb-2">Your Priorities</h2>
            <p className="text-sm text-muted-foreground">
              The coach will tailor advice to what matters most to you right now.
            </p>
          </div>

          <div className="bg-secondary/50 rounded-lg p-3 mb-2">
            <p className="text-xs text-muted-foreground text-center">
              💡 Tip: The more honest you are about frustrations, the better the guidance
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Primary focus right now</Label>
              <Select
                value={profile.primary_goal}
                onValueChange={(v) => setProfile({ ...profile, primary_goal: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="What is your main priority?" />
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
              <Label>What is your biggest frustration right now?</Label>
              <Textarea
                placeholder="Be specific. What is blocking your progress or keeping you up at night?"
                value={profile.frustration}
                onChange={(e) => setProfile({ ...profile, frustration: e.target.value })}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>What is a recent win you are proud of? (optional)</Label>
              <Textarea
                placeholder="This helps me understand what success looks like for you."
                value={profile.biggest_win}
                onChange={(e) => setProfile({ ...profile, biggest_win: e.target.value })}
                className="min-h-[80px]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 5: AI & Tech Context */}
      {step === 5 && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
              <Brain size={32} className="text-accent" />
            </div>
            <h2 className="text-2xl font-heading mb-2">Your tech and AI context</h2>
            <p className="text-sm text-muted-foreground">
              This helps me gauge what is realistic for you.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>How would you describe your AI experience?</Label>
              <Select
                value={profile.ai_experience}
                onValueChange={(v) => setProfile({ ...profile, ai_experience: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your AI familiarity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="curious">Curious but not started</SelectItem>
                  <SelectItem value="experimenting">Experimenting with tools like ChatGPT</SelectItem>
                  <SelectItem value="piloting">Running small AI pilots</SelectItem>
                  <SelectItem value="implementing">Actively implementing AI features</SelectItem>
                  <SelectItem value="advanced">AI is core to our product</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>What tech do you currently use? (optional)</Label>
              <Textarea
                placeholder="e.g. Mindbody, custom app, Excel, Stripe, Mailchimp..."
                value={profile.current_tech}
                onChange={(e) => setProfile({ ...profile, current_tech: e.target.value })}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label>How do you prefer to make decisions?</Label>
              <Select
                value={profile.decision_style}
                onValueChange={(v) => setProfile({ ...profile, decision_style: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="data">Data-driven, show me the numbers</SelectItem>
                  <SelectItem value="instinct">Instinct-led, I trust my gut</SelectItem>
                  <SelectItem value="collaborative">Collaborative, I like to discuss</SelectItem>
                  <SelectItem value="cautious">Cautious, I prefer low-risk moves</SelectItem>
                  <SelectItem value="fast">Fast, I prefer speed over perfection</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Step 6: Document Upload */}
      {step === 6 && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
              <FileText size={32} className="text-accent" />
            </div>
            <h2 className="text-2xl font-heading mb-2">Share Business Documents</h2>
            <p className="text-sm text-muted-foreground">
              Upload documents to give the coach deeper context about your business.
            </p>
          </div>

          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground text-center">
              <Upload size={12} className="inline mr-1" />
              Optional but recommended: business plans, financials, member data exports, competitor research
            </p>
          </div>

          <div className="border border-border rounded-xl overflow-hidden max-h-[320px]">
            <DocumentLibrary />
          </div>

          <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-accent">Why share documents?</span><br />
              The coach can reference your actual data, business plans, and metrics to give more specific, actionable advice tailored to your situation.
            </p>
          </div>
        </div>
      )}

      {/* Step 7: Mode Education */}
      {step === 7 && (
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
                desc: "Use when something feels wrong but you cannot pinpoint why",
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
                desc: "Use when you are ready to act",
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

          <div className="bg-accent/10 rounded-lg p-4 text-center space-y-2">
            <p className="text-sm text-accent font-medium">
              ✅ Your profile is saved
            </p>
            <p className="text-xs text-muted-foreground">
              All your context (business info, goals, documents) will be used to personalise every response. You can update your profile anytime from the settings.
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        {step > 1 ? (
          <Button onClick={handleBack} variant="ghost">
            <ArrowLeft size={16} />
            Back
          </Button>
        ) : (
          <div />
        )}
        <Button onClick={handleNext} disabled={!canProceed()} variant="accent">
          {step === totalSteps ? "Enter AI Coach" : "Continue"}
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
};

export default CoachOnboarding;