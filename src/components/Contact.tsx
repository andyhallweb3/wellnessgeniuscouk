import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Calendar, Mail, MessageSquare } from "lucide-react";

type InterestArea = "ai-agents" | "wellness-engagement" | "partnerships" | "";
type ContactTab = "book" | "message";

const Contact = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ContactTab>("book");
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
    <section id="contact" className="section-padding bg-background">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left Column - Info */}
          <div>
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
              Ready to Move?
            </p>
            <h2 className="text-3xl lg:text-4xl xl:text-5xl mb-6 tracking-tight">
              Book a 30-minute AI Reality Check
            </h2>
            <p className="text-muted-foreground text-lg mb-10">
              No pitch deck. No fluff. Just a frank conversation about what's working, 
              what's not, and what AI can actually do for your business.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border/50 hover:border-accent/30 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Free • No commitment</h3>
                  <p className="text-sm text-muted-foreground">
                    Walk away with 3 actionable ideas — even if we never work together.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border/50 hover:border-accent/30 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Email Directly</h3>
                  <a 
                    href="mailto:andy@wellnessgenius.co.uk" 
                    className="text-sm text-accent hover:underline"
                  >
                    andy@wellnessgenius.co.uk
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Tabs */}
          <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-border/50">
              <button
                onClick={() => setActiveTab("book")}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-all ${
                  activeTab === "book"
                    ? "text-accent border-b-2 border-accent -mb-px bg-accent/5"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Calendar size={18} />
                Book a Call
              </button>
              <button
                onClick={() => setActiveTab("message")}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-all ${
                  activeTab === "message"
                    ? "text-accent border-b-2 border-accent -mb-px bg-accent/5"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MessageSquare size={18} />
                Send Message
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "book" ? (
              <div className="p-0">
                <iframe
                  src="https://calendly.com/andy-wellnessgenius/30min?hide_gdpr_banner=1&background_color=0f0f0f&text_color=fafafa&primary_color=1cd4a0"
                  width="100%"
                  height="650"
                  frameBorder="0"
                  title="Schedule a call with Andy Hall"
                  className="w-full"
                />
              </div>
            ) : (
              <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
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
                        className="bg-secondary border-border/50"
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
                        className="bg-secondary border-border/50"
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
                        className="bg-secondary border-border/50"
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
                        className="bg-secondary border-border/50"
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
                      className="flex h-11 w-full rounded-xl border border-border/50 bg-secondary px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                      placeholder="Tell me about the challenges you're facing..."
                      rows={3}
                      className="bg-secondary border-border/50"
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
                      className="flex h-11 w-full rounded-xl border border-border/50 bg-secondary px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                      className="mt-1 h-4 w-4 rounded border-border bg-secondary text-accent focus:ring-accent"
                    />
                    <Label htmlFor="consent" className="text-sm text-muted-foreground font-normal">
                      I agree to the{" "}
                      <a href="/privacy" className="text-accent hover:underline">
                        privacy policy
                      </a>{" "}
                      and consent to being contacted.
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
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;