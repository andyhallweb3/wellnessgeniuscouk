import { useState, useCallback, useEffect } from "react";

const GUIDED_ONBOARDING_KEY = "wellness-genius-guided-onboarding";

interface GuidedStep {
  id: string;
  title: string;
  content: string;
  field?: string;
  position?: "top" | "bottom" | "left" | "right";
}

export const COACH_GUIDED_STEPS: GuidedStep[] = [
  {
    id: "welcome",
    title: "Welcome to AI Coach Setup",
    content: "Let's personalize your AI coach experience. This guided tour will help you understand each step.",
    position: "bottom",
  },
  {
    id: "business-type",
    title: "Tell us about your business",
    content: "Selecting your business type helps the AI understand your industry context and challenges.",
    field: "business_type",
    position: "top",
  },
  {
    id: "role",
    title: "Your role matters",
    content: "Your role determines the perspective and level of strategic advice you'll receive.",
    field: "role",
    position: "top",
  },
  {
    id: "goals",
    title: "Set your priorities",
    content: "Your primary focus helps the coach tailor recommendations to what matters most right now.",
    field: "primary_goal",
    position: "top",
  },
  {
    id: "ai-experience",
    title: "AI readiness level",
    content: "Being honest about your AI experience ensures recommendations match your capabilities.",
    field: "ai_experience",
    position: "top",
  },
  {
    id: "documents",
    title: "Upload context (optional)",
    content: "Adding business documents gives the AI deeper context for more relevant advice.",
    position: "bottom",
  },
  {
    id: "complete",
    title: "You're all set!",
    content: "Your personalized AI coach is ready. Start asking strategic questions!",
    position: "top",
  },
];

export const useGuidedOnboarding = () => {
  const [guidedStep, setGuidedStep] = useState(0);
  const [showGuidedTour, setShowGuidedTour] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(GUIDED_ONBOARDING_KEY);
    if (seen === "true") {
      setHasSeenTour(true);
    } else {
      // Auto-start tour for new users after a delay
      const timer = setTimeout(() => setShowGuidedTour(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const nextGuidedStep = useCallback(() => {
    if (guidedStep < COACH_GUIDED_STEPS.length - 1) {
      setGuidedStep(guidedStep + 1);
    }
  }, [guidedStep]);

  const skipTour = useCallback(() => {
    setShowGuidedTour(false);
    localStorage.setItem(GUIDED_ONBOARDING_KEY, "true");
    setHasSeenTour(true);
  }, []);

  const completeTour = useCallback(() => {
    setShowGuidedTour(false);
    localStorage.setItem(GUIDED_ONBOARDING_KEY, "true");
    setHasSeenTour(true);
  }, []);

  const restartTour = useCallback(() => {
    setGuidedStep(0);
    setShowGuidedTour(true);
    setHasSeenTour(false);
  }, []);

  const syncWithFormStep = useCallback((formStep: number) => {
    // Map form steps to guided steps
    const stepMapping: Record<number, number> = {
      1: 0, // Welcome
      2: 0, // Expectations
      3: 1, // Business context -> business-type
      4: 3, // Goals -> goals
      5: 4, // AI experience
      6: 5, // Documents
      7: 6, // Complete
    };
    
    if (stepMapping[formStep] !== undefined) {
      setGuidedStep(stepMapping[formStep]);
    }
  }, []);

  return {
    guidedStep,
    showGuidedTour,
    hasSeenTour,
    currentGuidedStepData: COACH_GUIDED_STEPS[guidedStep],
    totalGuidedSteps: COACH_GUIDED_STEPS.length,
    nextGuidedStep,
    skipTour,
    completeTour,
    restartTour,
    syncWithFormStep,
    setShowGuidedTour,
  };
};
