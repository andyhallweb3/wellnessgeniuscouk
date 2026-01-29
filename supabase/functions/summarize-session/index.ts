import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode } = await req.json();
    
    if (!messages || messages.length < 2) {
      return new Response(
        JSON.stringify({ summary: null, error: 'Not enough messages to summarize' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    const conversationText = messages
      .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
      .join('\n');

    const systemPrompt = `You are a concise summarizer for business conversations. Create a brief, actionable summary (2-3 sentences max) that captures:
1. The main topic or question discussed
2. Key insights or decisions made
3. Any action items or next steps

Keep it professional and focused on business value. Do not use bullet points, just flowing sentences.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Summarize this ${mode || 'general'} conversation:\n\n${conversationText}`
          }
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.content?.[0]?.text?.trim();

    return new Response(
      JSON.stringify({ summary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Summarization error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage, summary: null }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
