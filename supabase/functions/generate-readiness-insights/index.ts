import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SectionScores {
  data: number[];
  engagement: number[];
  monetisation: number[];
  automation: number[];
  trust: number[];
}

interface BusinessProfile {
  businessType: string;
  region: string;
  sizeBand: string;
  arpuBand: string;
  churnBand: string;
  activeRateBand: string;
  unknownArpu: boolean;
  unknownChurn: boolean;
  unknownActiveRate: boolean;
}

interface QuestionAnswer {
  questionId: string;
  pillar: string;
  questionText: string;
  score: number;
}

interface InsightRequest {
  businessProfile?: BusinessProfile;
  sectionScores?: SectionScores;
  questionAnswers?: QuestionAnswer[];
  completionId?: string;
  // Legacy support
  businessType?: string;
  companySize?: string;
  industry?: string;
  overallScore?: number;
  pillarScores?: { pillar: string; score: number; status: string }[];
  role?: string;
  company?: string;
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
    logStep("Request parsed", { 
      hasBusinessProfile: !!body.businessProfile,
      hasSectionScores: !!body.sectionScores,
      hasQuestionAnswers: !!body.questionAnswers,
      questionCount: body.questionAnswers?.length || 0
    });

    // Build the comprehensive Synta prompt
    const systemPrompt = `You are an AI commercial analyst for wellness businesses.
Your job is to turn structured assessment inputs into credible, conservative, decision-grade insight.

You must prioritise:
- commercial clarity
- defensible logic
- calm, professional judgement

Avoid:
- hype
- guarantees
- wellness clichés
- tool evangelism

Use British English at all times.

This workflow powers a paid diagnostic product. Treat outputs accordingly.`;

    // Determine if we have the new detailed format or legacy format
    const isDetailedAssessment = body.businessProfile && body.sectionScores;

    let userPrompt: string;

    if (isDetailedAssessment) {
      // New detailed assessment format
      const { businessProfile, sectionScores, questionAnswers } = body;
      
      // Calculate section scores (each score 0-4, 5 questions = max 20 per section)
      const calcSectionScore = (scores: number[]) => scores.reduce((a, b) => a + b, 0);
      
      const dataMat = calcSectionScore(sectionScores!.data || []);
      const engagement = calcSectionScore(sectionScores!.engagement || []);
      const monetisation = calcSectionScore(sectionScores!.monetisation || []);
      const automation = calcSectionScore(sectionScores!.automation || []);
      const trust = calcSectionScore(sectionScores!.trust || []);
      const totalScore = dataMat + engagement + monetisation + automation + trust;

      // Determine confidence level based on unknown flags
      const unknownCount = [
        businessProfile!.unknownArpu, 
        businessProfile!.unknownChurn, 
        businessProfile!.unknownActiveRate
      ].filter(Boolean).length;
      
      const confidenceLevel = unknownCount === 0 ? "High" : unknownCount === 1 ? "Medium" : "Low";

      // Determine band
      let band: string;
      if (totalScore < 40) band = "Not AI Ready";
      else if (totalScore < 60) band = "Emerging";
      else if (totalScore < 80) band = "Operational";
      else band = "Scalable / Investor Ready";

      // Build question details for context
      const lowScoreQuestions = questionAnswers?.filter(q => q.score <= 2) || [];
      const highScoreQuestions = questionAnswers?.filter(q => q.score >= 4) || [];

      userPrompt = `Analyse this wellness business AI readiness assessment and generate a commercial intelligence report.

## BUSINESS PROFILE
- Business Type: ${businessProfile!.businessType}
- Region: ${businessProfile!.region}
- Size Band: ${businessProfile!.sizeBand || body.companySize || 'Unknown'}

## REVENUE INPUTS
- ARPU Band: ${businessProfile!.arpuBand}${businessProfile!.unknownArpu ? ' (UNKNOWN)' : ''}
- Churn Band: ${businessProfile!.churnBand}${businessProfile!.unknownChurn ? ' (UNKNOWN)' : ''}
- Active Rate Band: ${businessProfile!.activeRateBand}${businessProfile!.unknownActiveRate ? ' (UNKNOWN)' : ''}

## CONFIDENCE LEVEL: ${confidenceLevel}
${confidenceLevel === 'Low' ? 'IMPORTANT: Widen financial ranges and soften language due to incomplete data.' : ''}

## SECTION SCORES (max 20 each)
- Data Maturity: ${dataMat}/20
- Engagement: ${engagement}/20
- Monetisation: ${monetisation}/20
- AI & Automation: ${automation}/20
- Trust & Compliance: ${trust}/20

## TOTAL SCORE: ${totalScore}/100
## BAND: ${band}

## CRITICAL GAPS (Questions scored 1-2)
${lowScoreQuestions.length > 0 
  ? lowScoreQuestions.map(q => `- [${q.pillar}] ${q.questionText}`).join('\n')
  : '- No critical gaps identified'}

## STRENGTHS (Questions scored 4-5)
${highScoreQuestions.length > 0 
  ? highScoreQuestions.map(q => `- [${q.pillar}] ${q.questionText}`).join('\n')
  : '- No strong areas identified'}

---

Generate a JSON response with this exact structure:

{
  "total_score": ${totalScore},
  "band": "${band}",
  "confidence_level": "${confidenceLevel}",
  "section_scores": {
    "data_maturity": ${dataMat},
    "engagement": ${engagement},
    "monetisation": ${monetisation},
    "ai_automation": ${automation},
    "trust_compliance": ${trust}
  },
  "headline_insight": "One-sentence diagnosis (max 15 words, direct, no hype)",
  "band_summary": "2-3 sentences explaining what this band means commercially",
  "blockers": [
    "First critical blocker in plain English with commercial impact",
    "Second blocker",
    "Third blocker"
  ],
  "revenue_upside": {
    "low": "Conservative minimum (e.g. £25,000)",
    "high": "Conservative maximum (e.g. £75,000)",
    "currency": "GBP",
    "confidence": "${confidenceLevel}",
    "rationale": "One sentence explaining the estimate"
  },
  "actions_90_day": [
    {
      "title": "Specific actionable task",
      "why_it_matters": "One sentence on commercial impact",
      "effort": "Low/Medium/High",
      "expected_impact": "Low/Medium/High",
      "suggested_owner": "Product/Ops/Marketing/Data",
      "week": "1-2"
    }
  ],
  "monetisation_paths": [
    {
      "path": "Revenue opportunity name",
      "rationale": "Why this fits their business type",
      "potential_value": "Indicative range"
    }
  ],
  "do_list": [
    "First priority action to take this week",
    "Second priority",
    "Third priority"
  ],
  "dont_list": [
    "First thing they should NOT do yet and why",
    "Second warning",
    "Third warning"
  ],
  "role_insight": "Specific advice based on their role and assessment results",
  "next_step": "The single most important next action",
  "disclaimer": "All figures are indicative estimates based on supplied inputs and industry benchmarks. This assessment does not constitute financial, legal, or medical advice."
}

CRITICAL RULES:
1. actions_90_day should have 5 actions spread across weeks 1-12, prioritised by lowest section scores
2. Revenue estimates must be CONSERVATIVE - never overpromise
3. If confidence is Low, widen ranges and add caveats
4. monetisation_paths should be 2-3 items relevant to ${businessProfile!.businessType}
5. Blockers should translate low scores into plain-English commercial problems
6. Never mention specific vendors or tools by name
7. All text must be British English`;

    } else {
      // Legacy format support
      const { overallScore, pillarScores, role, companySize, industry, company } = body;
      
      const scoreBand = (overallScore || 0) < 40 ? 'Not AI Ready' 
        : (overallScore || 0) < 60 ? 'Emerging' 
        : (overallScore || 0) < 80 ? 'Operational' 
        : 'Scalable';

      const sortedPillars = [...(pillarScores || [])].sort((a, b) => a.score - b.score);
      const weakestPillar = sortedPillars[0];
      const strongestPillar = sortedPillars[sortedPillars.length - 1];

      userPrompt = `Analyse this AI readiness assessment and generate a commercial intelligence report.

## Business Context
- Industry: ${industry || 'Wellness & Fitness'}
- Company Size: ${companySize || 'Unknown'}
- Company: ${company || 'Unknown'}
- Role: ${role || 'Unknown'}

## Assessment Results
- Overall Score: ${overallScore}/100
- Band: ${scoreBand}

## Pillar Scores
${pillarScores?.map(p => `- ${p.pillar}: ${p.score}% (${p.status})`).join('\n') || 'No pillar scores'}

## Weakest Area: ${weakestPillar?.pillar} (${weakestPillar?.score}%)
## Strongest Area: ${strongestPillar?.pillar} (${strongestPillar?.score}%)

---

Generate a JSON response with this structure:

{
  "headline": "One-sentence diagnosis (max 15 words)",
  "revenueUpside": {
    "min": "Conservative minimum (e.g. £25,000)",
    "max": "Conservative maximum (e.g. £75,000)",
    "confidence": "Low/Medium/High",
    "rationale": "One sentence explaining the estimate"
  },
  "topBlockers": [
    "First critical blocker",
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
    "First revenue opportunity",
    "Second opportunity",
    "Third opportunity"
  ],
  "doList": [
    "First priority action",
    "Second priority",
    "Third priority"
  ],
  "dontList": [
    "First thing NOT to do yet",
    "Second warning",
    "Third warning"
  ],
  "roleInsight": "Specific advice based on their role as ${role || 'a decision-maker'}",
  "nextStep": "The single most important next action"
}

priorityPlan should have 5 actions spread across weeks 1-12.
All estimates must be conservative. No hype. British English.`;
    }

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

    let insights;
    try {
      insights = JSON.parse(content);
    } catch (parseError) {
      logStep("Failed to parse Synta response", { content: content.substring(0, 200) });
      throw new Error('Invalid JSON in Synta response');
    }

    logStep("Insights generated successfully", {
      isDetailedFormat: isDetailedAssessment,
      hasBlockers: !!insights.blockers || !!insights.topBlockers,
      hasActions: !!insights.actions_90_day || !!insights.priorityPlan
    });

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
