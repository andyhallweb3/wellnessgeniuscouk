import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Library, Brain, Sparkles, BookOpen, ArrowRight, Check } from "lucide-react";

const WELCOME_MODAL_KEY = "wellness-genius-welcome-seen";

interface WelcomeModalProps {
  userEmail?: string;
}

const WelcomeModal = ({ userEmail }: WelcomeModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem(WELCOME_MODAL_KEY);
    if (!hasSeenWelcome) {
      // Small delay to let the page load first
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(WELCOME_MODAL_KEY, "true");
    setIsOpen(false);
  };

  const features = [
    {
      icon: Library,
      title: "Downloads Library",
      description: "Access all your free and purchased resources in one place",
      color: "bg-accent/10 text-accent",
      link: "/downloads",
      primary: true,
    },
    {
      icon: Brain,
      title: "AI Advisor",
      description: "Get strategic guidance tailored to your wellness business",
      color: "bg-purple-500/10 text-purple-500",
      link: "/genie",
    },
    {
      icon: Sparkles,
      title: "AI Readiness Score",
      description: "Assess how ready your business is for AI integration",
      color: "bg-blue-500/10 text-blue-500",
      link: "/ai-readiness",
    },
    {
      icon: BookOpen,
      title: "Resource Library",
      description: "Explore playbooks, frameworks, and templates",
      color: "bg-green-500/10 text-green-500",
      link: "/products",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto mb-4 p-3 rounded-full bg-accent/10 w-fit">
            <Sparkles className="h-8 w-8 text-accent" />
          </div>
          <DialogTitle className="text-2xl font-heading">
            Welcome to Wellness Genius! 🎉
          </DialogTitle>
          <DialogDescription className="text-base">
            {userEmail ? `Great to have you, ${userEmail.split("@")[0]}!` : "Great to have you!"} Here's what you can explore:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {features.map((feature) => (
            <Link
              key={feature.title}
              to={feature.link}
              onClick={handleClose}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-all hover:shadow-md hover:border-accent/30 ${
                feature.primary ? "border-accent/50 bg-accent/5" : "border-border bg-card"
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${feature.color}`}>
                <feature.icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{feature.title}</h4>
                  {feature.primary && (
                    <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                      Start here
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
              <ArrowRight size={16} className="shrink-0 text-muted-foreground mt-1" />
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Button variant="accent" onClick={handleClose} asChild>
            <Link to="/downloads">
              <Library size={18} />
              Go to Downloads Library
            </Link>
          </Button>
          <Button variant="ghost" onClick={handleClose}>
            <Check size={16} />
            Got it, explore on my own
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
