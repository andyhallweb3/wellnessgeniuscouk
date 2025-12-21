import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Voice brief script templates
const BRIEF_SCRIPTS = {
  daily: {
    intro: "Here's your daily brief.",
    stable: (headline: string, changes: string[], actions: string[], confidence: string) => `
Here's your daily brief.

${headline}

${changes.length > 0 ? changes.map(c => c).join(" ") : "No significant changes to flag today."}

${actions.length > 0 ? `I'd focus on: ${actions[0]}.${actions[1] ? ` And consider: ${actions[1]}.` : ""}` : "Stay the course for now."}

${confidence === "low" ? "One note: this is based on limited data. Improving data clarity will sharpen future recommendations." : ""}

I'll keep monitoring and flag if anything shifts.
    `.trim(),
    allClear: (businessName?: string) => `
Here's your daily brief.

There's nothing you need to act on today. Core engagement is holding, and no thresholds have been crossed.

If you're planning changes, today is a safe day to do it. Otherwise, I'd stay the course.

I'll let you know if anything shifts.
    `.trim(),
  },

  weekly: {
    script: (headline: string, changes: string[], actions: string[], confidence: string) => `
Here's your weekly review.

${headline}

Compared to last week, ${changes.length > 0 ? changes.join(" ") : "things are broadly stable."}

${actions.length > 0 ? `If I were prioritising next week, I'd focus on: ${actions[0]}.` : "No urgent priorities flagged."}

${confidence === "high" ? "Overall, this was a productive week." : confidence === "medium" ? "This was a steady week." : "The data is limited, so take this with appropriate caution."}

The risk is in doing nothing while small signals accumulate.
    `.trim(),
  },

  whatChanged: {
    script: (changes: string[]) => `
Here's what changed since we last spoke.

${changes.length > 0 ? changes.join(" ") : "No significant changes detected."}

${changes.length > 0 ? "I'll let you know if this continues." : "All signals are stable."}
    `.trim(),
  },

  decision: {
    script: (topic: string, recommendation: string) => `
You're deciding whether to prioritise this now or later.

Based on your data and past behaviour, I would act now, but lightly.

This isn't a full intervention moment. It's a chance to remove friction before it becomes visible in revenue.

The risk of acting is low. The risk of waiting is that this becomes harder to reverse.

My recommendation: ${recommendation}
    `.trim(),
  },

  board: {
    script: (headline: string, changes: string[], actions: string[]) => `
Here's how I'd explain this at board level.

${headline}

The only risk worth noting is ${changes[0] || "no material risks at this stage"}.

Management response is focused on ${actions[0] || "maintaining current trajectory"}.

There's no requirement for escalation at this stage.
    `.trim(),
  },

  alert: {
    script: (alert: string, action: string) => `
I'm interrupting because a threshold you set has been crossed.

${alert}

I'd recommend ${action} rather than waiting for the next review.

I'll stay on this and update you.
    `.trim(),
  },
};

// Generate natural voice script from brief data
function generateVoiceScript(
  briefType: "daily" | "weekly" | "whatChanged" | "decision" | "board" | "alert",
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
  }
): string {
  const changeTexts = (briefData.changes || []).map(c => {
    const text = c.text;
    if (c.severity === "warning") {
      return `${text}. That matters because this is usually where early problems start.`;
    }
    if (c.severity === "good") {
      return `${text}. That's a positive signal.`;
    }
    return text;
  });

  switch (briefType) {
    case "daily":
      if (briefData.isAllClear) {
        return BRIEF_SCRIPTS.daily.allClear(briefData.businessName);
      }
      return BRIEF_SCRIPTS.daily.stable(
        briefData.headline || "Overall performance is stable.",
        changeTexts,
        briefData.actions || [],
        briefData.confidence || "medium"
      );
    
    case "weekly":
      return BRIEF_SCRIPTS.weekly.script(
        briefData.headline || "This week was broadly stable.",
        changeTexts,
        briefData.actions || [],
        briefData.confidence || "medium"
      );
    
    case "whatChanged":
      return BRIEF_SCRIPTS.whatChanged.script(changeTexts);
    
    case "decision":
      return BRIEF_SCRIPTS.decision.script(
        briefData.topic || "this decision",
        briefData.recommendation || "make a small adjustment, measure for one cycle, then reassess."
      );
    
    case "board":
      return BRIEF_SCRIPTS.board.script(
        briefData.headline || "Performance is stable overall.",
        changeTexts,
        briefData.actions || []
      );
    
    case "alert":
      return BRIEF_SCRIPTS.alert.script(
        briefData.alert || "A threshold has been crossed.",
        briefData.actions?.[0] || "review this today"
      );
    
    default:
      return briefData.headline || "No briefing available.";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const { briefType, briefData } = await req.json();

    if (!briefType || !briefData) {
      return new Response(JSON.stringify({ error: "Missing briefType or briefData" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate the voice script
    const script = generateVoiceScript(briefType, briefData);
    console.log("[VOICE-BRIEF] Generated script:", script.substring(0, 100) + "...");

    // Call OpenAI TTS API
    const ttsResponse = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: script,
        voice: "onyx", // Deep, authoritative, calm voice suitable for business briefings
        response_format: "mp3",
        speed: 0.95, // Slightly slower for clarity
      }),
    });

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error("[VOICE-BRIEF] TTS error:", ttsResponse.status, errorText);
      throw new Error("TTS service error");
    }

    // Get audio as array buffer and encode to base64
    const audioBuffer = await ttsResponse.arrayBuffer();
    const base64Audio = base64Encode(audioBuffer);

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        script: script,
        briefType: briefType,
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[VOICE-BRIEF] Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
