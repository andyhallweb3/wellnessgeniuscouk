import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PillarScore {
  pillar: string;
  score: number;
  status: string;
}

interface InsightRequest {
  businessType: string;
  companySize: string;
  industry: string;
  overallScore: number;
  pillarScores: PillarScore[];
  role: string;
}

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-READINESS-INSIGHTS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const syntaApiKey = Deno.env.get('SYNTA_API_KEY');
    if (!syntaApiKey) {
      throw new Error('SYNTA_API_KEY is not configured');
    }
    logStep("Synta API key verified");

    const body: InsightRequest = await req.json();
    const { businessType, companySize, industry, overallScore, pillarScores, role } = body;

    logStep("Request parsed", { overallScore, industry, companySize });

    // Get score band
    const scoreBand = overallScore < 40 ? 'AI-Unready' 
      : overallScore < 60 ? 'AI-Curious' 
      : overallScore < 80 ? 'AI-Ready' 
      : 'AI-Native';

    // Find weakest and strongest pillars
    const sortedPillars = [...pillarScores].sort((a, b) => a.score - b.score);
    const weakestPillar = sortedPillars[0];
    const strongestPillar = sortedPillars[sortedPillars.length - 1];

    // Build the prompt for Synta.io
    const systemPrompt = `You are an AI readiness consultant for wellness and fitness businesses. You provide commercial intelligence that is:
- Conservative in estimates (never overpromise)
- Direct and actionable (no fluff)
- British English spelling
- Decision-maker focused (no jargon)

You never use wellness clichés or generic AI hype. You focus on practical business outcomes.`;

    const userPrompt = `Analyse this AI readiness assessment and generate a commercial intelligence report.

## Business Context
- Industry: ${industry || 'Wellness & Fitness'}
- Business Type: ${businessType || 'Wellness operator'}
- Company Size: ${companySize || 'Unknown'}
- Respondent Role: ${role || 'Unknown'}

## Assessment Results
- Overall Score: ${overallScore}/100
- Band: ${scoreBand}

## Pillar Scores
${pillarScores.map(p => `- ${p.pillar}: ${p.score}% (${p.status})`).join('\n')}

## Weakest Area: ${weakestPillar?.pillar} (${weakestPillar?.score}%)
## Strongest Area: ${strongestPillar?.pillar} (${strongestPillar?.score}%)

---

Generate a JSON response with this exact structure:

{
  "headline": "One-sentence diagnosis of their readiness (max 15 words)",
  "revenueUpside": {
    "min": "Conservative minimum annual revenue opportunity (e.g. £25,000)",
    "max": "Conservative maximum annual revenue opportunity (e.g. £75,000)",
    "confidence": "Low/Medium/High based on data quality",
    "rationale": "One sentence explaining the estimate"
  },
  "topBlockers": [
    "First critical blocker preventing AI adoption",
    "Second blocker",
    "Third blocker"
  ],
  "priorityPlan": [
    {
      "action": "Specific actionable task",
      "effort": "Low/Medium/High",
      "impact": "Low/Medium/High",
      "week": "1-2"
    }
  ],
  "monetisationPaths": [
    "First revenue opportunity AI could unlock",
    "Second opportunity",
    "Third opportunity"
  ],
  "doList": [
    "First thing they should do",
    "Second thing",
    "Third thing"
  ],
  "dontList": [
    "First thing they should NOT do yet",
    "Second thing",
    "Third thing"
  ],
  "roleInsight": "Specific advice based on their role as ${role || 'a decision-maker'}",
  "nextStep": "The single most important next action"
}

The priorityPlan should have 5 actions spread across weeks 1-12.
Keep all text concise and direct. No marketing speak.`;

    logStep("Calling Synta.io API");

    const response = await fetch('https://api.synta.io/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${syntaApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'synta-1',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logStep("Synta API error", { status: response.status, error: errorText });
      throw new Error(`Synta API error: ${response.status}`);
    }

    const data = await response.json();
    logStep("Synta API response received");

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in Synta response');
    }

    // Parse the JSON response
    let insights;
    try {
      insights = JSON.parse(content);
    } catch (parseError) {
      logStep("Failed to parse Synta response", { content: content.substring(0, 200) });
      throw new Error('Invalid JSON in Synta response');
    }

    logStep("Insights generated successfully");

    return new Response(
      JSON.stringify({ success: true, insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logStep("ERROR", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
