import { useState } from "react";
import { Button } from "@/components/ui/button";
import FloatingCoachPanel from "./FloatingCoachPanel";
import { useAuth } from "@/contexts/AuthContext";
import wellnessGeniusLogo from "@/assets/wellness-genius-logo-teal.png";

const FloatingCoachButton = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Don't show if not logged in
  if (!user) return null;

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-accent hover:bg-accent/90 p-0 overflow-hidden"
        size="icon"
      >
        <img src={wellnessGeniusLogo} alt="Wellness Genie" className="h-10 w-10 object-contain" />
      </Button>

      {/* Coach Panel */}
      <FloatingCoachPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default FloatingCoachButton;
