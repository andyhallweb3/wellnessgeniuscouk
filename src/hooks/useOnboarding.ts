import { useState, useCallback } from "react";

const ONBOARDING_COMPLETED_KEY = "wellness-genius-onboarding-completed";

export const useOnboarding = () => {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const hasCompletedOnboarding = useCallback(() => {
    return localStorage.getItem(ONBOARDING_COMPLETED_KEY) === "true";
  }, []);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
    setIsOnboardingOpen(false);
  }, []);

  const restartOnboarding = useCallback(() => {
    localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
    setIsOnboardingOpen(true);
  }, []);

  const openOnboarding = useCallback(() => {
    setIsOnboardingOpen(true);
  }, []);

  const closeOnboarding = useCallback(() => {
    setIsOnboardingOpen(false);
  }, []);

  return {
    isOnboardingOpen,
    setIsOnboardingOpen,
    hasCompletedOnboarding,
    completeOnboarding,
    restartOnboarding,
    openOnboarding,
    closeOnboarding,
  };
};
