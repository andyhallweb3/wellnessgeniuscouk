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
import { ArrowRight, Clock, Target, Shield, BarChart3 } from "lucide-react";
import { UserInfo } from "@/pages/AIReadinessIndex";

interface AssessmentIntroProps {
  onStart: (info: UserInfo) => void;
}

const AssessmentIntro = ({ onStart }: AssessmentIntroProps) => {
  const [formData, setFormData] = useState<UserInfo>({
    name: "",
    email: "",
    company: "",
    role: "",
    industry: "",
    companySize: "",
    primaryGoal: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart(formData);
  };

  const isFormValid = 
    formData.name && 
    formData.email && 
    formData.company && 
    formData.role &&
    formData.industry &&
    formData.companySize &&
    formData.primaryGoal;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
          Free Assessment + Strategy Call
        </div>
        <h1 className="text-4xl lg:text-5xl font-heading mb-4">
          AI Readiness Index
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
          A 10-minute diagnostic that shows whether your business is ready to deploy AI — and where it will fail if you rush.
        </p>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Complete the assessment and book a free 30-minute call to discuss your results and identify your highest-ROI AI opportunities.
        </p>
      </div>

      {/* What you get */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { icon: Clock, label: "10-min assessment", desc: "Quick and focused" },
          { icon: Target, label: "5-pillar analysis", desc: "Comprehensive view" },
          { icon: BarChart3, label: "Personalised score", desc: "With benchmarks" },
          { icon: Shield, label: "30-min call", desc: "Discuss your results" },
        ].map((item, i) => (
          <div key={i} className="text-center p-4">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-3">
              <item.icon className="w-6 h-6 text-accent" />
            </div>
            <p className="font-medium">{item.label}</p>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="bg-card rounded-xl p-8 border border-border shadow-elegant max-w-xl mx-auto">
        <h2 className="text-xl font-heading mb-6 text-center">
          Start your assessment
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@company.com"
                required
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Company name"
                required
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Your role"
                required
              />
            </div>
          </div>

          <div>
            <Label>Industry</Label>
            <Select
              value={formData.industry}
              onValueChange={(value) => setFormData({ ...formData, industry: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wellness">Wellness & Fitness</SelectItem>
                <SelectItem value="hospitality">Hospitality</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="retail">Retail & E-commerce</SelectItem>
                <SelectItem value="professional">Professional Services</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Company Size</Label>
            <Select
              value={formData.companySize}
              onValueChange={(value) => setFormData({ ...formData, companySize: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select company size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-10">1-10 employees</SelectItem>
                <SelectItem value="11-50">11-50 employees</SelectItem>
                <SelectItem value="51-200">51-200 employees</SelectItem>
                <SelectItem value="201-500">201-500 employees</SelectItem>
                <SelectItem value="500+">500+ employees</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Primary Goal</Label>
            <Select
              value={formData.primaryGoal}
              onValueChange={(value) => setFormData({ ...formData, primaryGoal: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="What's your main objective?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="growth">Growth & Revenue</SelectItem>
                <SelectItem value="efficiency">Operational Efficiency</SelectItem>
                <SelectItem value="risk">Risk Reduction</SelectItem>
                <SelectItem value="cx">Customer Experience</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            variant="accent" 
            className="w-full mt-6"
            disabled={!isFormValid}
          >
            Start Assessment
            <ArrowRight size={16} />
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Your data is secure and will only be used to personalise your results.
          </p>
        </form>
      </div>
    </div>
  );
};

export default AssessmentIntro;
