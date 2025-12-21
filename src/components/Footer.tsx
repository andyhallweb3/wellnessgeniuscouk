import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Linkedin, Twitter } from "lucide-react";
import logo from "@/assets/wellness-genius-logo-teal.png";
import { useNewsletter } from "@/hooks/useNewsletter";

const Footer = () => {
  const { email, setEmail, isSubmitting, subscribe } = useNewsletter();

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
              onSubmit={(e) => subscribe(e, "footer")}
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
              <img src={logo} alt="Wellness Genius" className="h-12 w-auto mb-4" />
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
                  href="https://www.linkedin.com/in/andyweb3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={18} />
                </a>
                <a
                  href="https://twitter.com/andy_web_3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter size={18} />
                </a>
              </div>
              
              {/* AI Initiative */}
              <div className="mt-6 pt-4 border-t border-primary-foreground/10">
                <p className="text-xs text-primary-foreground/50 mb-2">Chair of</p>
                <a
                  href="https://globalwellnessinstitute.org/ai-initiative/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-accent hover:underline block mb-1"
                >
                  GWI AI Initiative
                </a>
                <a
                  href="https://www.linkedin.com/company/global-wellness-institute-ai-initiative/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary-foreground/50 hover:text-primary-foreground transition-colors inline-flex items-center gap-1"
                >
                  <Linkedin size={12} />
                  Follow on LinkedIn
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
                  <Link to="/insights" className="hover:text-primary-foreground transition-colors">
                    Insights
                  </Link>
                </li>
                <li>
                  <Link to="/news" className="hover:text-primary-foreground transition-colors">
                    Latest News
                  </Link>
                </li>
                <li>
                  <Link to="/speaker-kit" className="hover:text-primary-foreground transition-colors">
                    Speaker Kit
                  </Link>
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
