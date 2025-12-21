import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BriefData } from "@/components/genie/DailyBriefCard";

export type BriefType = "daily" | "weekly" | "whatChanged" | "decision" | "board" | "alert";

interface VoiceBriefOptions {
  briefType: BriefType;
  briefData: {
    headline?: string;
    changes?: { text: string; severity?: string }[];
    actions?: string[];
    confidence?: string;
    topic?: string;
    recommendation?: string;
    alert?: string;
    isAllClear?: boolean;
    businessName?: string;
  };
}

export const useVoiceBrief = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const playBrief = useCallback(async (options: VoiceBriefOptions): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Stop any existing playback
      stopPlayback();

      const { data, error: fnError } = await supabase.functions.invoke("genie-voice-brief", {
        body: options,
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (!data?.audioContent) {
        throw new Error("No audio content received");
      }

      // Create audio element with data URI
      const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Set up event handlers
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
      };
      audio.onerror = (e) => {
        console.error("Audio playback error:", e);
        setError("Failed to play audio");
        setIsPlaying(false);
        audioRef.current = null;
      };

      // Start playback
      await audio.play();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate voice brief";
      console.error("[useVoiceBrief] Error:", message);
      setError(message);
      toast.error("Voice brief failed: " + message);
    } finally {
      setIsLoading(false);
    }
  }, [stopPlayback]);

  // Convenience method for daily brief
  const playDailyBrief = useCallback(async (brief: BriefData, businessName?: string) => {
    // Determine if it's an "all clear" brief (no warnings)
    const hasWarnings = brief.changes.some(c => c.severity === "warning");
    const isAllClear = !hasWarnings && brief.changes.length <= 1;

    await playBrief({
      briefType: "daily",
      briefData: {
        headline: brief.headline,
        changes: brief.changes,
        actions: brief.actions,
        confidence: brief.confidence,
        isAllClear,
        businessName,
      },
    });
  }, [playBrief]);

  // Convenience method for weekly review
  const playWeeklyReview = useCallback(async (brief: BriefData) => {
    await playBrief({
      briefType: "weekly",
      briefData: {
        headline: brief.headline,
        changes: brief.changes,
        actions: brief.actions,
        confidence: brief.confidence,
      },
    });
  }, [playBrief]);

  // Convenience method for "what changed" brief
  const playWhatChanged = useCallback(async (changes: { text: string; severity?: string }[]) => {
    await playBrief({
      briefType: "whatChanged",
      briefData: { changes },
    });
  }, [playBrief]);

  // Convenience method for decision support
  const playDecisionBrief = useCallback(async (topic: string, recommendation: string) => {
    await playBrief({
      briefType: "decision",
      briefData: { topic, recommendation },
    });
  }, [playBrief]);

  // Convenience method for board mode
  const playBoardBrief = useCallback(async (brief: BriefData) => {
    await playBrief({
      briefType: "board",
      briefData: {
        headline: brief.headline,
        changes: brief.changes,
        actions: brief.actions,
      },
    });
  }, [playBrief]);

  // Convenience method for alerts
  const playAlertBrief = useCallback(async (alert: string, action: string) => {
    await playBrief({
      briefType: "alert",
      briefData: { alert, actions: [action] },
    });
  }, [playBrief]);

  return {
    isLoading,
    isPlaying,
    error,
    playBrief,
    playDailyBrief,
    playWeeklyReview,
    playWhatChanged,
    playDecisionBrief,
    playBoardBrief,
    playAlertBrief,
    stopPlayback,
  };
};
