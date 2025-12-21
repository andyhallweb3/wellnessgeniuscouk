import { useState, useCallback, useEffect } from "react";

const ONBOARDING_COMPLETED_KEY = "wellness-genius-onboarding-completed";
const ONBOARDING_STEPS_KEY = "wellness-genius-onboarding-steps";

export interface OnboardingStep {
  id: string;
  title: string;
  completed: boolean;
}

export const ONBOARDING_STEP_IDS = [
  { id: "welcome", title: "Welcome Tour" },
  { id: "genie", title: "Try Wellness Genie" },
  { id: "hub", title: "Explore My Hub" },
  { id: "assessment", title: "Take AI Assessment" },
  { id: "products", title: "Browse Products" },
] as const;

export type OnboardingStepId = typeof ONBOARDING_STEP_IDS[number]["id"];

export const useOnboarding = () => {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<OnboardingStepId[]>([]);

  // Load completed steps from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ONBOARDING_STEPS_KEY);
      if (stored) {
        setCompletedSteps(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load onboarding steps:", error);
    }
  }, []);

  // Save completed steps to localStorage whenever they change
  useEffect(() => {
    if (completedSteps.length > 0) {
      localStorage.setItem(ONBOARDING_STEPS_KEY, JSON.stringify(completedSteps));
    }
  }, [completedSteps]);

  const hasCompletedOnboarding = useCallback(() => {
    return localStorage.getItem(ONBOARDING_COMPLETED_KEY) === "true";
  }, []);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
    // Mark welcome step as completed when tour finishes
    setCompletedSteps(prev => {
      if (!prev.includes("welcome")) {
        return [...prev, "welcome"];
      }
      return prev;
    });
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

  const markStepCompleted = useCallback((stepId: OnboardingStepId) => {
    setCompletedSteps(prev => {
      if (!prev.includes(stepId)) {
        const newSteps = [...prev, stepId];
        localStorage.setItem(ONBOARDING_STEPS_KEY, JSON.stringify(newSteps));
        return newSteps;
      }
      return prev;
    });
  }, []);

  const isStepCompleted = useCallback((stepId: OnboardingStepId) => {
    return completedSteps.includes(stepId);
  }, [completedSteps]);

  const getCompletionPercentage = useCallback(() => {
    return Math.round((completedSteps.length / ONBOARDING_STEP_IDS.length) * 100);
  }, [completedSteps]);

  const resetProgress = useCallback(() => {
    setCompletedSteps([]);
    localStorage.removeItem(ONBOARDING_STEPS_KEY);
    localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
  }, []);

  return {
    isOnboardingOpen,
    setIsOnboardingOpen,
    hasCompletedOnboarding,
    completeOnboarding,
    restartOnboarding,
    openOnboarding,
    closeOnboarding,
    completedSteps,
    markStepCompleted,
    isStepCompleted,
    getCompletionPercentage,
    resetProgress,
    totalSteps: ONBOARDING_STEP_IDS.length,
  };
};
