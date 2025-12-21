import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const COOKIE_CONSENT_KEY = "wg_cookie_consent";
const COOKIE_PREFERENCES_KEY = "wg_cookie_preferences";

export interface CookiePreferences {
  essential: boolean; // Always true, can't be disabled
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

const defaultPreferences: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  functional: false,
};

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences));
      } catch {
        setPreferences(defaultPreferences);
      }
    }
    
    if (!consent) {
      const timer = setTimeout(() => {
        setShowBanner(true);
        setTimeout(() => setIsAnimating(true), 50);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences, consentType: string) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, consentType);
    localStorage.setItem(COOKIE_CONSENT_KEY + "_date", new Date().toISOString());
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    savePreferences(allAccepted, "accepted");
    closeBanner();
  };

  const handleRejectAll = () => {
    const onlyEssential: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    savePreferences(onlyEssential, "rejected");
    closeBanner();
  };

  const handleSavePreferences = () => {
    const hasNonEssential = preferences.analytics || preferences.marketing || preferences.functional;
    savePreferences(preferences, hasNonEssential ? "custom" : "rejected");
    setShowPreferencesModal(false);
    closeBanner();
  };

  const closeBanner = () => {
    setIsAnimating(false);
    setTimeout(() => setShowBanner(false), 300);
  };

  const openPreferencesModal = () => {
    setShowPreferencesModal(true);
  };

  // Allow reopening preferences from anywhere
  useEffect(() => {
    const handleOpenPreferences = () => {
      const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPreferences) {
        try {
          setPreferences(JSON.parse(savedPreferences));
        } catch {
          setPreferences(defaultPreferences);
        }
      }
      setShowPreferencesModal(true);
    };
    
    window.addEventListener('openCookiePreferences', handleOpenPreferences);
    return () => window.removeEventListener('openCookiePreferences', handleOpenPreferences);
  }, []);

  return (
    <>
      {showBanner && (
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
                    We use essential cookies to make our site work. With your consent, we may also use non-essential cookies to improve your experience.{" "}
                    <Link to="/cookies" className="text-accent hover:underline">
                      Learn more
                    </Link>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openPreferencesModal}
                  className="flex-1 md:flex-none"
                >
                  <Settings size={16} className="mr-1" />
                  Customize
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRejectAll}
                  className="flex-1 md:flex-none"
                >
                  Reject All
                </Button>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={handleAcceptAll}
                  className="flex-1 md:flex-none"
                >
                  Accept All
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsAnimating(false);
                    setTimeout(() => setShowBanner(false), 300);
                  }}
                  className="md:hidden"
                >
                  <X size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={showPreferencesModal} onOpenChange={setShowPreferencesModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="w-5 h-5" />
              Cookie Preferences
            </DialogTitle>
            <DialogDescription>
              Manage your cookie preferences. Essential cookies are always enabled as they are necessary for the site to function.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Essential Cookies */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
              <div className="space-y-1">
                <Label className="text-base font-medium">Essential Cookies</Label>
                <p className="text-sm text-muted-foreground">
                  Required for the website to function. These cannot be disabled.
                </p>
              </div>
              <Switch checked={true} disabled className="data-[state=checked]:bg-accent" />
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
              <div className="space-y-1">
                <Label className="text-base font-medium">Analytics Cookies</Label>
                <p className="text-sm text-muted-foreground">
                  Help us understand how visitors interact with our website to improve user experience.
                </p>
              </div>
              <Switch
                checked={preferences.analytics}
                onCheckedChange={(checked) => setPreferences({ ...preferences, analytics: checked })}
                className="data-[state=checked]:bg-accent"
              />
            </div>

            {/* Marketing Cookies */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
              <div className="space-y-1">
                <Label className="text-base font-medium">Marketing Cookies</Label>
                <p className="text-sm text-muted-foreground">
                  Used to track visitors across websites to display relevant advertisements.
                </p>
              </div>
              <Switch
                checked={preferences.marketing}
                onCheckedChange={(checked) => setPreferences({ ...preferences, marketing: checked })}
                className="data-[state=checked]:bg-accent"
              />
            </div>

            {/* Functional Cookies */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <Label className="text-base font-medium">Functional Cookies</Label>
                <p className="text-sm text-muted-foreground">
                  Enable personalized features and remember your preferences for future visits.
                </p>
              </div>
              <Switch
                checked={preferences.functional}
                onCheckedChange={(checked) => setPreferences({ ...preferences, functional: checked })}
                className="data-[state=checked]:bg-accent"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button variant="outline" onClick={handleRejectAll} className="flex-1">
              Reject All
            </Button>
            <Button variant="outline" onClick={handleAcceptAll} className="flex-1">
              Accept All
            </Button>
            <Button variant="accent" onClick={handleSavePreferences} className="flex-1">
              Save Preferences
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Hook to check if specific cookie category is allowed
export const useCookiePreferences = (): CookiePreferences => {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  
  useEffect(() => {
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences));
      } catch {
        setPreferences(defaultPreferences);
      }
    }
  }, []);
  
  return preferences;
};

// Helper to open cookie preferences modal from anywhere
export const openCookiePreferences = () => {
  window.dispatchEvent(new CustomEvent('openCookiePreferences'));
};

// Legacy hook for backwards compatibility
export const useAnalyticsCookies = (): boolean => {
  const preferences = useCookiePreferences();
  return preferences.analytics;
};

export default CookieConsent;
