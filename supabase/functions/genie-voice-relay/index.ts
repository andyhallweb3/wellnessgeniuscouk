import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, upgrade, connection, sec-websocket-key, sec-websocket-version, sec-websocket-extensions, sec-websocket-protocol',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check for WebSocket upgrade
  const upgradeHeader = req.headers.get("upgrade") || "";
  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket upgrade", { status: 400, headers: corsHeaders });
  }

  try {
    // Validate JWT from query params (WebSocket can't use headers easily)
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const memoryContext = url.searchParams.get("context") || "";

    if (!token) {
      return new Response(JSON.stringify({ error: "Missing auth token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("[VOICE-RELAY] Auth failed:", authError?.message);
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[VOICE-RELAY] Authenticated user:", user.id);

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    // Build system instructions
    const hasCompleteMemo = memoryContext && 
      memoryContext.includes("Business:") && 
      memoryContext.includes("Primary Goal:");

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

    // Upgrade to WebSocket
    const { socket: clientSocket, response } = Deno.upgradeWebSocket(req);

    // Connect to OpenAI Realtime API via WebSocket
    const openaiWsUrl = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17";
    let openaiSocket: WebSocket | null = null;

    clientSocket.onopen = () => {
      console.log("[VOICE-RELAY] Client WebSocket connected");

      // Connect to OpenAI
      openaiSocket = new WebSocket(openaiWsUrl, [
        "realtime",
        `openai-insecure-api-key.${OPENAI_API_KEY}`,
        "openai-beta.realtime-v1",
      ]);

      openaiSocket.onopen = () => {
        console.log("[VOICE-RELAY] Connected to OpenAI Realtime API");

        // Send session.update with our configuration
        const sessionUpdate = {
          type: "session.update",
          session: {
            modalities: ["text", "audio"],
            instructions,
            voice: "sage",
            input_audio_format: "pcm16",
            output_audio_format: "pcm16",
            input_audio_transcription: {
              model: "whisper-1"
            },
            turn_detection: {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 800,
            },
          },
        };
        openaiSocket!.send(JSON.stringify(sessionUpdate));
      };

      openaiSocket.onmessage = (event) => {
        // Relay OpenAI messages to client
        if (clientSocket.readyState === WebSocket.OPEN) {
          clientSocket.send(event.data);
        }
      };

      openaiSocket.onerror = (error) => {
        console.error("[VOICE-RELAY] OpenAI WebSocket error:", error);
        if (clientSocket.readyState === WebSocket.OPEN) {
          clientSocket.send(JSON.stringify({
            type: "error",
            error: { message: "OpenAI connection error" }
          }));
        }
      };

      openaiSocket.onclose = (event) => {
        console.log("[VOICE-RELAY] OpenAI WebSocket closed:", event.code, event.reason);
        if (clientSocket.readyState === WebSocket.OPEN) {
          clientSocket.close(1000, "OpenAI connection closed");
        }
      };
    };

    clientSocket.onmessage = (event) => {
      // Relay client messages to OpenAI
      if (openaiSocket && openaiSocket.readyState === WebSocket.OPEN) {
        openaiSocket.send(event.data);
      }
    };

    clientSocket.onerror = (error) => {
      console.error("[VOICE-RELAY] Client WebSocket error:", error);
    };

    clientSocket.onclose = () => {
      console.log("[VOICE-RELAY] Client WebSocket closed");
      if (openaiSocket && openaiSocket.readyState === WebSocket.OPEN) {
        openaiSocket.close();
      }
    };

    return response;
  } catch (error) {
    console.error("[VOICE-RELAY] Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
