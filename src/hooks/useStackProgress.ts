import { useState, useEffect } from "react";

const STORAGE_KEY = "wellness-genius-stack-progress";

export interface StackProgress {
  completedSteps: string[];
  lastUpdated: string;
}

const defaultProgress: StackProgress = {
  completedSteps: [],
  lastUpdated: new Date().toISOString(),
};

export const STACK_STEP_IDS = [
  "ai-readiness-score",
  "build-vs-buy",
  "ai-builder-prompts",
  "engagement-systems",
  "engagement-revenue",
  "activation-playbook",
  "prompt-library",
] as const;

export type StackStepId = typeof STACK_STEP_IDS[number];

export const useStackProgress = () => {
  const [progress, setProgress] = useState<StackProgress>(defaultProgress);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StackProgress;
        setProgress(parsed);
      }
    } catch (error) {
      console.error("Failed to load stack progress:", error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever progress changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      } catch (error) {
        console.error("Failed to save stack progress:", error);
      }
    }
  }, [progress, isLoaded]);

  const toggleStep = (stepId: StackStepId) => {
    setProgress((prev) => {
      const isCompleted = prev.completedSteps.includes(stepId);
      return {
        completedSteps: isCompleted
          ? prev.completedSteps.filter((id) => id !== stepId)
          : [...prev.completedSteps, stepId],
        lastUpdated: new Date().toISOString(),
      };
    });
  };

  const isStepCompleted = (stepId: StackStepId) => {
    return progress.completedSteps.includes(stepId);
  };

  const getCompletionPercentage = () => {
    return Math.round((progress.completedSteps.length / STACK_STEP_IDS.length) * 100);
  };

  const resetProgress = () => {
    setProgress({
      completedSteps: [],
      lastUpdated: new Date().toISOString(),
    });
  };

  return {
    progress,
    isLoaded,
    toggleStep,
    isStepCompleted,
    getCompletionPercentage,
    resetProgress,
    completedCount: progress.completedSteps.length,
    totalSteps: STACK_STEP_IDS.length,
  };
};
