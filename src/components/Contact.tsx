import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Calendar, Mail } from "lucide-react";

type InterestArea = "ai-agents" | "wellness-engagement" | "partnerships" | "";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    interestArea: "" as InterestArea,
    goal: "",
    timeline: "",
    consent: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.consent) {
      toast({
        title: "Consent required",
        description: "Please agree to the privacy policy to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "Message sent",
      description: "Thanks for reaching out. I'll be in touch within 24 hours.",
    });

    setFormData({
      name: "",
      email: "",
      company: "",
      role: "",
      interestArea: "",
      goal: "",
      timeline: "",
      consent: false,
    });
    setIsSubmitting(false);
  };

  return (
    <section id="contact" className="section-padding">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left Column - Info */}
          <div>
            <p className="text-sm font-medium text-accent uppercase tracking-wider mb-3">
              Get Started
            </p>
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-heading mb-6">
              Let's discuss your automation goals
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Book a 30-minute discovery call to explore how AI agents can transform your operations and accelerate growth.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50 border border-border/50">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Book a Call</h3>
                  <p className="text-sm text-muted-foreground">
                    30-minute video call to discuss your specific needs and opportunities.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50 border border-border/50">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Email Directly</h3>
                  <p className="text-sm text-muted-foreground">
                    hello@wellnessgenius.co
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="bg-card rounded-2xl p-8 shadow-elevated border border-border/50">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Jane Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="jane@company.com"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    required
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    placeholder="Your company"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Input
                    id="role"
                    required
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    placeholder="Head of Operations"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interest">Primary Interest *</Label>
                <select
                  id="interest"
                  required
                  value={formData.interestArea}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      interestArea: e.target.value as InterestArea,
                    })
                  }
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select an option</option>
                  <option value="ai-agents">AI Agents & Automation</option>
                  <option value="wellness-engagement">
                    Wellness Engagement & Rewards
                  </option>
                  <option value="partnerships">Partnerships / Speaking</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">What's your primary goal? *</Label>
                <Textarea
                  id="goal"
                  required
                  value={formData.goal}
                  onChange={(e) =>
                    setFormData({ ...formData, goal: e.target.value })
                  }
                  placeholder="Tell me about the challenges you're facing and what success looks like for you..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeline">Timeline</Label>
                <select
                  id="timeline"
                  value={formData.timeline}
                  onChange={(e) =>
                    setFormData({ ...formData, timeline: e.target.value })
                  }
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select timeline</option>
                  <option value="asap">ASAP</option>
                  <option value="1-3-months">1-3 months</option>
                  <option value="3-6-months">3-6 months</option>
                  <option value="exploring">Just exploring</option>
                </select>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent"
                  checked={formData.consent}
                  onChange={(e) =>
                    setFormData({ ...formData, consent: e.target.checked })
                  }
                  className="mt-1 h-4 w-4 rounded border-border text-accent focus:ring-accent"
                />
                <Label htmlFor="consent" className="text-sm text-muted-foreground font-normal">
                  I agree to the{" "}
                  <a href="/privacy" className="text-accent hover:underline">
                    privacy policy
                  </a>{" "}
                  and consent to being contacted about my enquiry.
                </Label>
              </div>

              <Button
                type="submit"
                variant="accent"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
                <ArrowRight size={18} />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
