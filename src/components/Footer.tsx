import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Linkedin, Twitter } from "lucide-react";

const Footer = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    toast({
      title: "Subscribed",
      description: "You'll receive insights on AI and automation for wellness brands.",
    });

    setEmail("");
    setIsSubmitting(false);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Newsletter Section */}
      <div className="section-padding border-b border-primary-foreground/10">
        <div className="container-wide">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl lg:text-3xl font-heading mb-4">
              Get insights delivered
            </h2>
            <p className="text-primary-foreground/70 mb-8">
              Monthly insights on AI automation, wellness tech, and growth strategies. No spam, just value.
            </p>
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
              />
              <Button
                type="submit"
                variant="accent"
                disabled={isSubmitting}
                className="flex-shrink-0"
              >
                {isSubmitting ? "..." : "Subscribe"}
                <ArrowRight size={16} />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="px-6 lg:px-12 py-12">
        <div className="container-wide">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <span className="text-xl font-heading font-medium mb-4 block">
                Wellness Genius
              </span>
              <p className="text-primary-foreground/70 text-sm mb-4">
                AI-powered growth and automation for wellness, fitness, and hospitality businesses.
              </p>
              <a 
                href="mailto:andy@wellnessgenius.co.uk" 
                className="text-sm text-accent hover:underline mb-6 block"
              >
                andy@wellnessgenius.co.uk
              </a>
              <div className="flex gap-4">
                <a
                  href="https://www.linkedin.com/in/andyhallwellnessgenius"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={18} />
                </a>
                <a
                  href="https://twitter.com/wellnessgeniu5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter size={18} />
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-medium mb-4">Services</h3>
              <ul className="space-y-3 text-sm text-primary-foreground/70">
                <li>
                  <a href="#services" className="hover:text-primary-foreground transition-colors">
                    AI Agent Starter
                  </a>
                </li>
                <li>
                  <a href="#services" className="hover:text-primary-foreground transition-colors">
                    Growth Accelerator
                  </a>
                </li>
                <li>
                  <a href="#services" className="hover:text-primary-foreground transition-colors">
                    Enterprise Partnership
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-4">Resources</h3>
              <ul className="space-y-3 text-sm text-primary-foreground/70">
                <li>
                  <a href="#insights" className="hover:text-primary-foreground transition-colors">
                    Insights
                  </a>
                </li>
                <li>
                  <a href="#proof" className="hover:text-primary-foreground transition-colors">
                    Case Studies
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-foreground transition-colors">
                    Speaker Kit
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-4">Legal</h3>
              <ul className="space-y-3 text-sm text-primary-foreground/70">
                <li>
                  <a href="/privacy" className="hover:text-primary-foreground transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="hover:text-primary-foreground transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="/cookies" className="hover:text-primary-foreground transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-primary-foreground/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/50">
            <p>© {currentYear} Wellness Genius. All rights reserved.</p>
            <p>London, United Kingdom</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
