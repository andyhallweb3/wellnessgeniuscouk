import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BriefData } from "@/components/genie/DailyBriefCard";

export const useDailyBrief = () => {
  const [brief, setBrief] = useState<BriefData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateBrief = useCallback(async (): Promise<BriefData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("generate-daily-brief");

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const briefData: BriefData = {
        headline: data.headline,
        changes: data.changes || [],
        actions: data.actions || [],
        confidence: data.confidence || "low",
        generatedAt: new Date(data.generatedAt || Date.now()),
      };

      setBrief(briefData);
      return briefData;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate brief";
      console.error("[useDailyBrief] Error:", message);
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearBrief = useCallback(() => {
    setBrief(null);
    setError(null);
  }, []);

  return {
    brief,
    isLoading,
    error,
    generateBrief,
    clearBrief,
  };
};
