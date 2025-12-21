import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import FloatingCoachPanel from "./FloatingCoachPanel";
import { useAuth } from "@/contexts/AuthContext";
import wellnessGeniusLogo from "@/assets/wellness-genius-logo-teal.png";

const TOOLTIP_DISMISSED_KEY = "wellness-genie-tooltip-dismissed";

const FloatingCoachButton = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const dismissed = localStorage.getItem(TOOLTIP_DISMISSED_KEY);
    if (!dismissed) {
      // Show tooltip after a short delay for new users
      const timer = setTimeout(() => {
        setShowTooltip(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleClick = () => {
    setIsOpen(true);
    setShowTooltip(false);
    setHasInteracted(true);
    localStorage.setItem(TOOLTIP_DISMISSED_KEY, "true");
  };

  const dismissTooltip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTooltip(false);
    localStorage.setItem(TOOLTIP_DISMISSED_KEY, "true");
  };

  // Don't show if not logged in
  if (!user) return null;

  return (
    <>
      {/* Tooltip for new users */}
      {showTooltip && (
        <div className="fixed bottom-24 right-6 z-50 animate-fade-up">
          <div className="relative bg-card border border-accent/30 rounded-xl p-4 shadow-xl max-w-[240px]">
            {/* Arrow pointing down */}
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-card border-r border-b border-accent/30 transform rotate-45" />
            
            <button 
              onClick={dismissTooltip}
              className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={14} />
            </button>
            
            <div className="flex items-start gap-3">
              <div className="shrink-0 p-2 bg-accent/10 rounded-lg">
                <img src={wellnessGeniusLogo} alt="" className="h-8 w-8 object-contain" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground mb-1">
                  Meet Your Wellness Genie! ✨
                </p>
                <p className="text-xs text-muted-foreground">
                  Click here for AI-powered business advice tailored to your wellness business.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button with enhanced visibility */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Pulsing ring effect for attention */}
        {!hasInteracted && (
          <>
            <span className="absolute inset-0 rounded-full bg-accent/40 animate-ping" />
            <span className="absolute inset-0 rounded-full bg-accent/20 animate-[pulse_1.5s_ease-in-out_infinite]" />
          </>
        )}
        
        <Button
          onClick={handleClick}
          className="relative h-16 w-16 rounded-full shadow-xl bg-accent hover:bg-accent/90 p-0 overflow-hidden border-2 border-accent-foreground/20 hover:scale-110 transition-transform duration-200"
          size="icon"
        >
          <img 
            src={wellnessGeniusLogo} 
            alt="Wellness Genie" 
            className="h-11 w-11 object-contain" 
          />
        </Button>
      </div>

      {/* Coach Panel */}
      <FloatingCoachPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default FloatingCoachButton;