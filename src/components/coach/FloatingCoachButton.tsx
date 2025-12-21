import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import FloatingCoachPanel from "./FloatingCoachPanel";
import { useAuth } from "@/contexts/AuthContext";

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
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-accent hover:bg-accent/90 text-accent-foreground"
        size="icon"
      >
        <Sparkles size={24} />
      </Button>

      {/* Coach Panel */}
      <FloatingCoachPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default FloatingCoachButton;
