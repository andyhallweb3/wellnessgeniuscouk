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

// Wellness Data Maturity Map - benchmarked expectations by vertical
const WELLNESS_MATURITY_MAP = `
## WELLNESS DATA MATURITY MAP (Use this to benchmark their responses)

| Level | Gyms & Studios | Wellness Apps | Hospitality/Spa | Corporate Wellness |
|-------|---------------|---------------|-----------------|-------------------|
| Poor (0-2) | Attendance only | App opens only | Room check-ins | Signup counts |
| Functional (2-3) | Class bookings, checkins | Session completions | Spa bookings | Participation rates |
| Valuable (3-4) | Habit streaks, member journeys | Behaviour cohorts, retention flags | In-stay behaviour patterns | Engagement by department |
| Monetisable (4-5) | Retention drivers, LTV prediction | Churn prediction, upsell timing | Guest value prediction, upsell moments | ROI per employee, absenteeism correlation |

Use this map to assess where they actually sit vs where they think they sit.
Flag any mismatches between self-reported maturity and likely reality based on business type.
`;

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
    const systemPrompt = `You are an AI commercial analyst specialising in wellness businesses.
Your job is to turn structured assessment inputs into credible, conservative, decision-grade intelligence.

You must prioritise:
- commercial clarity (speak in revenue, retention, LTV, not features)
- defensible logic (show your reasoning)
- calm, professional judgement
- wellness-specific context (gyms, apps, spas, corporate wellness)

Avoid:
- hype or enthusiasm
- guarantees or promises
- wellness clichés ("holistic", "journey", "transform")
- tool evangelism or vendor recommendations

Use British English at all times.

This powers a £99 paid diagnostic product. Outputs must justify that price.

${WELLNESS_MATURITY_MAP}`;

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

      userPrompt = `Analyse this wellness business AI readiness assessment and generate a COMMERCIAL EDITION intelligence report.

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

Generate a JSON response with this COMMERCIAL EDITION structure:

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
  "executive_summary": "2-3 paragraphs executive summary suitable for board/investor consumption. Include: current state, key risks, opportunity size, recommended path.",
  "band_summary": "2-3 sentences explaining what this band means commercially for a ${businessProfile!.businessType}",
  
  "data_maturity_assessment": {
    "current_level": "Poor/Functional/Valuable/Monetisable",
    "expected_level": "What level a ${businessProfile!.businessType} of size ${businessProfile!.sizeBand} should be at",
    "gap_analysis": "Plain English explanation of the gap",
    "what_good_looks_like": "Specific example of monetisable data for their business type"
  },
  
  "blockers": [
    {
      "blocker": "First critical blocker in plain English",
      "commercial_impact": "How this costs them money or limits growth",
      "section_affected": "Which pillar this relates to"
    },
    {
      "blocker": "Second blocker",
      "commercial_impact": "Impact",
      "section_affected": "Pillar"
    },
    {
      "blocker": "Third blocker",
      "commercial_impact": "Impact",
      "section_affected": "Pillar"
    }
  ],
  
  "revenue_upside": {
    "low": "Conservative minimum (e.g. £25,000)",
    "high": "Conservative maximum (e.g. £75,000)",
    "currency": "GBP",
    "confidence": "${confidenceLevel}",
    "rationale": "One sentence explaining the estimate",
    "assumptions": [
      "First assumption (e.g. 'Assumes 5% improvement in retention')",
      "Second assumption",
      "Third assumption"
    ]
  },
  
  "revenue_translation_table": {
    "engagement_behaviour": "The key engagement metric to focus on (e.g. 'Weekly active sessions')",
    "retention_impact_assumption": "What improvement you'd expect (e.g. '+2% monthly retention')",
    "confidence_level": "${confidenceLevel}",
    "annual_upside_low": "Low estimate",
    "annual_upside_high": "High estimate",
    "risk_if_ignored": "What happens if they don't address this"
  },
  
  "actions_90_day": [
    {
      "title": "Specific actionable task",
      "why_it_matters": "One sentence on commercial impact",
      "effort": "Low/Medium/High",
      "expected_impact": "Low/Medium/High",
      "suggested_owner": "Product/Ops/Marketing/Data/Finance",
      "week": "1-2",
      "section_fixed": "Which pillar this addresses",
      "what_not_to_do": "A related action they should NOT take yet, and why"
    }
  ],
  
  "monetisation_paths": [
    {
      "opportunity": "Revenue opportunity name",
      "rationale": "Why this fits a ${businessProfile!.businessType}",
      "potential_value": "Indicative range",
      "time_to_value": "How long before this generates revenue",
      "prerequisite": "What they need to fix first from their assessment"
    }
  ],
  
  "do_list": [
    "First priority action to take this week (specific, actionable)",
    "Second priority",
    "Third priority",
    "Fourth priority",
    "Fifth priority"
  ],
  
  "dont_list": [
    {
      "action": "First thing they should NOT do yet",
      "reason": "Why this would be premature or risky given their current state"
    },
    {
      "action": "Second warning",
      "reason": "Why"
    },
    {
      "action": "Third warning",
      "reason": "Why"
    }
  ],
  
  "investment_guidance": {
    "budget_range": "Suggested 90-day investment range (e.g. £5,000-£15,000)",
    "key_investments": [
      "First priority investment area",
      "Second",
      "Third"
    ],
    "avoid_spending": "Where NOT to spend money right now and why"
  },
  
  "success_metrics": [
    {
      "metric": "KPI name (e.g. Monthly Active Rate)",
      "baseline": "Where they likely are now based on assessment",
      "target": "Realistic 90-day target"
    },
    {
      "metric": "Second KPI",
      "baseline": "Baseline",
      "target": "Target"
    },
    {
      "metric": "Third KPI",
      "baseline": "Baseline",
      "target": "Target"
    }
  ],
  
  "role_insight": "Specific advice based on their role and what they personally should focus on",
  "next_step": "The single most important next action - make it specific and immediately actionable",
  "disclaimer": "All figures are indicative estimates based on supplied inputs and industry benchmarks. This assessment does not constitute financial, legal, or medical advice."
}

CRITICAL RULES:
1. actions_90_day should have exactly 5 actions spread across weeks 1-12, prioritised by lowest section scores
2. Each action MUST include "what_not_to_do" - this is unique to our product
3. Revenue estimates must be CONSERVATIVE - never overpromise
4. If confidence is Low, widen ranges significantly and add caveats
5. monetisation_paths should be 3-4 items SPECIFIC to ${businessProfile!.businessType}
6. Blockers should translate low scores into plain-English commercial problems with £ impact
7. Never mention specific vendors or tools by name
8. data_maturity_assessment must reference the Wellness Data Maturity Map
9. revenue_translation_table must be fillable/actionable - the kind of table a CFO would accept
10. success_metrics must have realistic baselines and targets for a ${businessProfile!.businessType}
11. All text must be British English`;

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
  "executiveSummary": "2-3 paragraph executive summary for board consumption",
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
    {
      "opportunity": "Revenue opportunity",
      "potentialValue": "Indicative range",
      "timeToValue": "Timeline",
      "prerequisite": "What needs fixing first"
    }
  ],
  "doList": [
    "First priority action",
    "Second priority",
    "Third priority",
    "Fourth priority",
    "Fifth priority"
  ],
  "dontList": [
    {
      "action": "First thing NOT to do yet",
      "reason": "Why this would be premature"
    },
    {
      "action": "Second warning",
      "reason": "Why"
    },
    {
      "action": "Third warning",
      "reason": "Why"
    }
  ],
  "investmentGuidance": {
    "budgetRange": "Suggested 90-day investment",
    "keyInvestments": ["First area", "Second", "Third"],
    "avoidSpending": "Where NOT to spend"
  },
  "successMetrics": [
    {
      "metric": "KPI name",
      "baseline": "Current estimate",
      "target": "90-day target"
    }
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
      hasActions: !!insights.actions_90_day || !!insights.priorityPlan,
      hasMaturityAssessment: !!insights.data_maturity_assessment,
      hasRevenueTable: !!insights.revenue_translation_table
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
