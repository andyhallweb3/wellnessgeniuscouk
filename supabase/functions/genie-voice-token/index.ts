import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate JWT authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("[VOICE-TOKEN] Missing authorization header");
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("[VOICE-TOKEN] Auth validation failed:", authError?.message);
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[VOICE-TOKEN] Authenticated user:", user.id);

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const body = await req.json().catch(() => ({}));
    const rawMemoryContext = body.memoryContext;
    
    // Normalize memoryContext to string
    const memoryContext = typeof rawMemoryContext === 'string' 
      ? rawMemoryContext 
      : (rawMemoryContext ? JSON.stringify(rawMemoryContext) : '');

    // Check if user has a complete profile or needs onboarding
    const hasCompleteMemo = memoryContext && 
      memoryContext.includes("Business:") && 
      memoryContext.includes("Primary Goal:");

    // Build system instructions with business context and personalization behavior
    let instructions = `You are the Wellness Genie, an expert AI business operator for wellness, fitness, and health businesses.

## YOUR ROLE
- You're a senior operator who has run successful wellness businesses
- You give direct, actionable business advice  
- You understand the unique challenges of wellness industry operators
- You're conversational but efficient - respect their time

## COMMUNICATION STYLE
- Be warm but professional - sound like a trusted advisor, not a chatbot
- British English (colour, behaviour, organisation)
- Give specific, implementable suggestions
- Keep responses focused and actionable (30-60 seconds of speech max)

## CRITICAL: PERSONALISATION THROUGH QUESTIONS

You MUST ask questions to personalise your advice. Never give generic advice.

${hasCompleteMemo ? `Since you know this business, ask follow-up questions to go DEEPER:
- "Last time we discussed X - how did that go?"
- "You mentioned Y was a challenge - has anything changed?"
- "What's the most pressing thing on your mind today?"
- Reference their specific metrics, goals, and challenges` :

`Since this is a new user or incomplete profile, ask DISCOVERY questions first:
- "What type of wellness business do you run?"
- "What's your biggest challenge right now?"
- "How many people are on your team?"
- "What's the one thing that would make the biggest difference this quarter?"
- Build understanding before giving advice`}

## MEMORY BEHAVIOUR
- If context is provided below, use it to personalise EVERY response
- Reference their business name, type, goals, and challenges
- Connect advice to their specific situation
- If something seems out of date, ask: "Is this still accurate?"`;

    if (memoryContext && memoryContext.trim()) {
      instructions += `\n\n## BUSINESS CONTEXT (Use this to personalise responses):\n${memoryContext}`;
    } else {
      instructions += `\n\n## NO PROFILE YET
The user hasn't set up their business profile. Start by learning about them:
1. Greet them warmly
2. Ask what type of wellness business they run
3. Understand their role and team size
4. Learn their primary goal and biggest challenge
5. THEN provide personalised advice`;
    }

    // Request an ephemeral token from OpenAI
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "sage",
        instructions,
        input_audio_transcription: {
          model: "whisper-1"
        },
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 800
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("[VOICE-TOKEN] Session created successfully for user:", user.id);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
