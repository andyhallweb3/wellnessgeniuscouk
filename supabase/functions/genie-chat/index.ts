import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Trust metadata calculation based on actual data signals
interface TrustMetadata {
  confidenceLevel: "high" | "medium" | "low";
  dataSensitivity: "standard" | "sensitive" | "health-adjacent";
  isInference: boolean;
  dataSignals: {
    hasBusinessProfile: boolean;
    hasRecentSessions: boolean;
    hasDocuments: boolean;
    hasMetrics: boolean;
    memoryCompleteness: number; // 0-100
  };
  explanation: string;
  factors: string[];
}

function calculateTrustMetadata(
  mode: string,
  memoryContext: string | undefined,
  documentContext: string | undefined
): TrustMetadata {
  const hasMemory = !!memoryContext && memoryContext.trim().length > 50;
  const hasDocs = !!documentContext && documentContext.trim().length > 0;
  
  // Parse memory context to check completeness
  const memoryFields = [
    "business_name", "business_type", "revenue_model", "team_size",
    "primary_goal", "biggest_challenge", "key_metrics", "known_weak_spots"
  ];
  
  let filledFields = 0;
  if (memoryContext) {
    memoryFields.forEach(field => {
      if (memoryContext.toLowerCase().includes(field.replace("_", " ")) || 
          memoryContext.toLowerCase().includes(field)) {
        filledFields++;
      }
    });
  }
  
  const memoryCompleteness = Math.round((filledFields / memoryFields.length) * 100);
  
  // Determine confidence level based on data signals
  let confidenceLevel: "high" | "medium" | "low" = "low";
  if (memoryCompleteness >= 70 && hasMemory) {
    confidenceLevel = "high";
  } else if (memoryCompleteness >= 40 || hasMemory) {
    confidenceLevel = "medium";
  }
  
  // Documents boost confidence
  if (hasDocs && confidenceLevel !== "high") {
    confidenceLevel = confidenceLevel === "low" ? "medium" : "high";
  }
  
  // Determine data sensitivity based on mode and context
  let dataSensitivity: "standard" | "sensitive" | "health-adjacent" = "standard";
  const sensitiveKeywords = ["behavior", "behaviour", "usage", "engagement", "retention", "churn"];
  const healthKeywords = ["wellness", "health", "fitness", "stress", "recovery", "sleep", "mood", "mental"];
  
  const contextLower = (memoryContext || "").toLowerCase();
  
  if (healthKeywords.some(k => contextLower.includes(k))) {
    dataSensitivity = "health-adjacent";
  } else if (sensitiveKeywords.some(k => contextLower.includes(k))) {
    dataSensitivity = "sensitive";
  }
  
  // Mode-based adjustments
  const inferentialModes = ["diagnostic", "decision_support", "commercial_lens"];
  const isInference = inferentialModes.includes(mode);
  
  // Build explanation and factors
  const factors: string[] = [];
  let explanation = "";
  
  if (hasMemory) {
    factors.push(`Business profile (${memoryCompleteness}% complete)`);
  } else {
    factors.push("No business profile configured");
  }
  
  if (hasDocs) {
    factors.push("Uploaded documents available");
  }
  
  factors.push(`Mode: ${mode.replace(/_/g, " ")}`);
  
  switch (confidenceLevel) {
    case "high":
      explanation = "Based on your complete business profile and provided context.";
      break;
    case "medium":
      explanation = "Based on partial business information. Complete your profile for better insights.";
      break;
    case "low":
      explanation = "Limited data available. Add your business profile for personalised insights.";
      break;
  }
  
  return {
    confidenceLevel,
    dataSensitivity,
    isInference,
    dataSignals: {
      hasBusinessProfile: hasMemory,
      hasRecentSessions: false, // Could be enhanced with session data
      hasDocuments: hasDocs,
      hasMetrics: memoryContext?.includes("key_metrics") || false,
      memoryCompleteness,
    },
    explanation,
    factors,
  };
}

// Genie Core System Prompt - Business Operator, not Coach
const GENIE_SYSTEM_PROMPT = `You are the Wellness Genie — a senior business operator for wellness, fitness, and health businesses.

## YOUR ROLE

You are NOT a chatbot. You are NOT a coach. You are NOT a therapist.

You are a senior operator who:
- Watches the business
- Understands context
- Speaks like an experienced COO/CFO
- Takes positions and defends them
- Tells people what they NEED to hear, not what they WANT to hear

## VOICE & TONE

- Calm, commercial, measured, slightly sceptical
- Direct without being harsh
- Confident but not arrogant
- British English always
- No emojis, no excitement, no motivation speak
- Sound like a trusted advisor in a boardroom

## CORE PRINCIPLES

1. CLARITY before tools
2. BEHAVIOUR before automation  
3. CONTROL before scale
4. Conservative with assumptions
5. Honest about uncertainty

## CRITICAL RULES

- Never guarantee outcomes
- Use ranges, not point estimates
- Flag anything uncomfortable to explain publicly
- If data quality is weak, say so
- Challenge assumptions before accepting them
- Recommend the lightest effective intervention first
- If something is a bad idea, say so clearly

## RESPONSE STRUCTURE

Always structure responses with:
1. **Key Insight** — What actually matters here
2. **Commercial Implication** — Why it matters financially
3. **Risk or Limitation** — What could go wrong
4. **Recommended Action** — Specific next step

Keep responses tight. No waffle. Every sentence should add value.`;

// Mode-specific prompts that change behavior
const MODE_CONFIGS: Record<string, { prompt: string; responseFormat: string }> = {
  // Daily Operations
  daily_briefing: {
    prompt: `MODE: Daily Briefing
    
You're giving a morning briefing. Be concise. Focus on:
- What needs attention TODAY
- Any risks that emerged
- Quick wins available
- What to ignore for now

Keep it under 200 words unless critical issues require more.`,
    responseFormat: "brief",
  },
  quick_question: {
    prompt: `MODE: Quick Question

Simple, direct answer. No deep analysis unless asked.
- Answer the specific question
- Keep it short (under 100 words ideal)
- Only add context if essential
- No structured output needed`,
    responseFormat: "brief",
  },
  
  // Strategic Thinking
  decision_support: {
    prompt: `MODE: Decision Support

The user is stress-testing a decision. Your job:
- Surface hidden assumptions
- Identify trade-offs they haven't considered
- Challenge the timing (why now? why not wait?)
- Estimate what could go wrong
- Give your honest opinion with reasoning

Take a position. Don't hedge everything.`,
    responseFormat: "detailed",
  },
  diagnostic: {
    prompt: `MODE: Diagnostic

Find what's broken or missing. Your job:
- Identify weak assumptions
- Find missing inputs
- Surface hidden risks
- Point out blind spots
- Be constructively critical

Don't accept the premise at face value. Challenge it.`,
    responseFormat: "detailed",
  },
  commercial_lens: {
    prompt: `MODE: Commercial Lens

Translate to financial implications. Focus on:
- Revenue impact (ranges, not points)
- Cost implications
- ROI estimation
- Risk quantification
- Payback period

Use conservative assumptions. Show your working.`,
    responseFormat: "structured",
  },
  board_mode: {
    prompt: `MODE: Board / Investor

Speak in CFO language. The user needs to present to sophisticated audiences.

- Use conservative, defensible numbers
- Anticipate challenges and objections
- Frame negatives honestly but constructively
- No spin, no excuses, no fluff
- What will they be asked? Prepare them.

Format for executive consumption.`,
    responseFormat: "structured",
  },
  
  // Planning & Building
  weekly_review: {
    prompt: `MODE: Weekly Review

Compare this week to last. Focus on:
- What changed (delta, not absolutes)
- Trends emerging (good and bad)
- Where are we drifting from plan?
- What needs course correction?

Use a structured format with clear sections.`,
    responseFormat: "structured",
  },
  build_mode: {
    prompt: `MODE: 90-Day Builder

Create a prioritised action plan. Focus on:
- What to do FIRST (highest impact, lowest risk)
- What NOT to do (common mistakes to avoid)
- Dependencies and sequencing
- Resource requirements (time, money, people)
- Clear milestones

Be specific. "Improve retention" is not an action. "Implement a 7-day inactive member outreach sequence" is.`,
    responseFormat: "structured",
  },
  
  // Legacy mode mappings for backwards compatibility
  daily_operator: {
    prompt: `MODE: Daily Briefing
    
You're giving a morning briefing. Be concise. Focus on:
- What needs attention TODAY
- Any risks that emerged
- Quick wins available
- What to ignore for now`,
    responseFormat: "brief",
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode = "daily_operator", memoryContext, documentContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const modeConfig = MODE_CONFIGS[mode] || MODE_CONFIGS.daily_briefing;
    
    // Calculate trust metadata based on actual data signals
    const trustMetadata = calculateTrustMetadata(mode, memoryContext, documentContext);
    
    // Build full system prompt with context
    let fullSystemPrompt = GENIE_SYSTEM_PROMPT;
    
    if (memoryContext && memoryContext.trim()) {
      fullSystemPrompt += `\n\n## BUSINESS CONTEXT (Use this to personalise responses):\n${memoryContext}`;
    }
    
    if (documentContext && documentContext.trim()) {
      fullSystemPrompt += `\n\n## UPLOADED DOCUMENTS:\n${documentContext}`;
    }
    
    fullSystemPrompt += `\n\n${modeConfig.prompt}`;

    console.log("[GENIE] Mode:", mode, "Messages:", messages.length, "Trust:", trustMetadata.confidenceLevel);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: fullSystemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[GENIE] Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create a transform stream to prepend trust metadata
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const reader = response.body!.getReader();

    // Send trust metadata as first event
    const trustEvent = `data: ${JSON.stringify({ type: "trust_metadata", ...trustMetadata })}\n\n`;
    
    (async () => {
      try {
        await writer.write(new TextEncoder().encode(trustEvent));
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          await writer.write(value);
        }
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("[GENIE] Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
