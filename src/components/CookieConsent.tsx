import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import { Link } from "react-router-dom";

const COOKIE_CONSENT_KEY = "wg_cookie_consent";

type ConsentStatus = "accepted" | "rejected" | null;

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Delay showing banner for better UX
      const timer = setTimeout(() => {
        setShowBanner(true);
        setTimeout(() => setIsAnimating(true), 50);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (status: ConsentStatus) => {
    if (status) {
      localStorage.setItem(COOKIE_CONSENT_KEY, status);
      localStorage.setItem(COOKIE_CONSENT_KEY + "_date", new Date().toISOString());
    }
    setIsAnimating(false);
    setTimeout(() => setShowBanner(false), 300);
  };

  if (!showBanner) return null;

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 p-4 transition-all duration-300 ${
        isAnimating ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      <div className="container-wide">
        <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-prominent flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm md:text-base font-medium">We use cookies</p>
              <p className="text-xs md:text-sm text-muted-foreground">
                We use essential cookies to make our site work. With your consent, we may also use non-essential cookies to improve your experience and understand how you use our site.{" "}
                <Link to="/cookies" className="text-accent hover:underline">
                  Learn more
                </Link>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleConsent("rejected")}
              className="flex-1 md:flex-none"
            >
              Reject All
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={() => handleConsent("accepted")}
              className="flex-1 md:flex-none"
            >
              Accept All
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleConsent(null)}
              className="md:hidden"
            >
              <X size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook to check if analytics cookies are allowed
export const useAnalyticsCookies = (): boolean => {
  const [allowed, setAllowed] = useState(false);
  
  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    setAllowed(consent === "accepted");
  }, []);
  
  return allowed;
};

export default CookieConsent;
