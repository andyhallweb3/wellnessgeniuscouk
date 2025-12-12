import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const MobileBookCTA = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/95 backdrop-blur-md border-t border-border p-4">
      <Button variant="accent" size="lg" className="w-full" asChild>
        <a href="#contact">
          Book a Call
          <ArrowRight size={18} />
        </a>
      </Button>
    </div>
  );
};

export default MobileBookCTA;
