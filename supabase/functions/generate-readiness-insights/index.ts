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

interface QuestionAnswer {
  questionId: string;
  pillar: string;
  questionText: string;
  score: number; // 1-5
}

interface InsightRequest {
  businessType: string;
  companySize: string;
  industry: string;
  overallScore: number;
  pillarScores: PillarScore[];
  role: string;
  company?: string;
  primaryGoal?: string;
  questionAnswers?: QuestionAnswer[];
}

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-READINESS-INSIGHTS] ${step}${detailsStr}`);
};

// Map scores to descriptive labels
const getScoreLabel = (score: number): string => {
  switch (score) {
    case 1: return "Strongly Disagree";
    case 2: return "Disagree";
    case 3: return "Neutral";
    case 4: return "Agree";
    case 5: return "Strongly Agree";
    default: return "Unknown";
  }
};

// Identify weak areas (scores 1-2) and strengths (scores 4-5)
const analyseAnswers = (answers: QuestionAnswer[]) => {
  const weakAreas = answers.filter(a => a.score <= 2);
  const moderateAreas = answers.filter(a => a.score === 3);
  const strongAreas = answers.filter(a => a.score >= 4);
  
  return { weakAreas, moderateAreas, strongAreas };
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
    const { 
      businessType, 
      companySize, 
      industry, 
      overallScore, 
      pillarScores, 
      role,
      company,
      primaryGoal,
      questionAnswers 
    } = body;

    logStep("Request parsed", { 
      overallScore, 
      industry, 
      companySize, 
      hasQuestionAnswers: !!questionAnswers,
      questionCount: questionAnswers?.length || 0
    });

    // Get score band
    const scoreBand = overallScore < 40 ? 'AI-Unready' 
      : overallScore < 60 ? 'AI-Curious' 
      : overallScore < 80 ? 'AI-Ready' 
      : 'AI-Native';

    // Find weakest and strongest pillars
    const sortedPillars = [...pillarScores].sort((a, b) => a.score - b.score);
    const weakestPillar = sortedPillars[0];
    const strongestPillar = sortedPillars[sortedPillars.length - 1];

    // Analyse individual question answers if available
    let detailedAnalysis = '';
    if (questionAnswers && questionAnswers.length > 0) {
      const { weakAreas, moderateAreas, strongAreas } = analyseAnswers(questionAnswers);
      
      detailedAnalysis = `
## Detailed Question Analysis (25 questions answered)

### Critical Gaps (Scored 1-2 - Immediate Attention Required)
${weakAreas.length > 0 
  ? weakAreas.map(a => `- [${a.pillar}] "${a.questionText}" → ${getScoreLabel(a.score)}`).join('\n')
  : '- No critical gaps identified'}

### Development Areas (Scored 3 - Needs Improvement)
${moderateAreas.length > 0 
  ? moderateAreas.map(a => `- [${a.pillar}] "${a.questionText}" → ${getScoreLabel(a.score)}`).join('\n')
  : '- No moderate gaps identified'}

### Strengths to Leverage (Scored 4-5 - Build On These)
${strongAreas.length > 0 
  ? strongAreas.map(a => `- [${a.pillar}] "${a.questionText}" → ${getScoreLabel(a.score)}`).join('\n')
  : '- No strong areas identified'}

### Gap Count by Pillar
${pillarScores.map(p => {
  const pillarWeak = weakAreas.filter(a => a.pillar === p.pillar).length;
  const pillarModerate = moderateAreas.filter(a => a.pillar === p.pillar).length;
  return `- ${p.pillar}: ${pillarWeak} critical gaps, ${pillarModerate} development areas`;
}).join('\n')}
`;
    }

    // Build the enhanced prompt
    const systemPrompt = `You are an elite AI readiness consultant specialising in wellness, fitness, and leisure businesses. You create bespoke 90-day transformation plans based on detailed assessment data.

Your approach:
- Conservative estimates (never overpromise ROI)
- Direct and actionable (no fluff or generic advice)
- British English spelling throughout
- Decision-maker focused (commercial language, not technical jargon)
- Prioritise quick wins in weeks 1-4, foundations in weeks 5-8, and scale in weeks 9-12

You never use wellness clichés or generic AI hype. Every recommendation must tie directly to a specific gap identified in their assessment.`;

    const userPrompt = `Create a bespoke 90-day AI readiness plan based on this detailed assessment.

## Business Profile
- Company: ${company || 'Not specified'}
- Industry: ${industry || 'Wellness & Fitness'}
- Business Type: ${businessType || 'Wellness operator'}
- Company Size: ${companySize || 'Unknown'}
- Decision-Maker Role: ${role || 'Unknown'}
- Primary Goal: ${primaryGoal || 'General AI adoption'}

## Overall Assessment
- Score: ${overallScore}/100
- Band: ${scoreBand}

## Pillar Breakdown
${pillarScores.map(p => `- ${p.pillar}: ${p.score}% (${p.status})`).join('\n')}

## Weakest Pillar: ${weakestPillar?.pillar} (${weakestPillar?.score}%)
## Strongest Pillar: ${strongestPillar?.pillar} (${strongestPillar?.score}%)
${detailedAnalysis}

---

Based on this detailed analysis, generate a comprehensive JSON response with this exact structure:

{
  "headline": "One-sentence diagnosis of their readiness state (max 15 words)",
  "executiveSummary": "2-3 sentence summary for the CEO/owner explaining the key finding and what it means commercially",
  "revenueUpside": {
    "min": "Conservative minimum annual revenue/savings opportunity (e.g. £25,000)",
    "max": "Conservative maximum annual revenue/savings opportunity (e.g. £75,000)",
    "confidence": "Low/Medium/High based on data quality",
    "rationale": "One sentence explaining how this estimate was derived from their specific gaps"
  },
  "topBlockers": [
    "First critical blocker - directly linked to a low-scoring question",
    "Second blocker - directly linked to assessment data",
    "Third blocker - with commercial impact explained"
  ],
  "ninetyDayPlan": {
    "phase1": {
      "name": "Quick Wins (Weeks 1-4)",
      "focus": "What this phase achieves",
      "actions": [
        {
          "week": "1-2",
          "action": "Specific task addressing their weakest score",
          "owner": "Who should do this (e.g. Operations Manager)",
          "effort": "Low/Medium/High",
          "impact": "Low/Medium/High",
          "linkedGap": "Which specific question/pillar this addresses"
        },
        {
          "week": "2-3",
          "action": "Second quick win task",
          "owner": "Role",
          "effort": "Low/Medium/High",
          "impact": "Low/Medium/High",
          "linkedGap": "Linked pillar or gap"
        },
        {
          "week": "3-4",
          "action": "Third quick win task",
          "owner": "Role",
          "effort": "Low/Medium/High",
          "impact": "Low/Medium/High",
          "linkedGap": "Linked pillar or gap"
        }
      ]
    },
    "phase2": {
      "name": "Build Foundations (Weeks 5-8)",
      "focus": "What this phase achieves",
      "actions": [
        {
          "week": "5-6",
          "action": "Foundation task 1",
          "owner": "Role",
          "effort": "Low/Medium/High",
          "impact": "Low/Medium/High",
          "linkedGap": "Linked pillar or gap"
        },
        {
          "week": "6-7",
          "action": "Foundation task 2",
          "owner": "Role",
          "effort": "Low/Medium/High",
          "impact": "Low/Medium/High",
          "linkedGap": "Linked pillar or gap"
        },
        {
          "week": "7-8",
          "action": "Foundation task 3",
          "owner": "Role",
          "effort": "Low/Medium/High",
          "impact": "Low/Medium/High",
          "linkedGap": "Linked pillar or gap"
        }
      ]
    },
    "phase3": {
      "name": "Scale & Optimise (Weeks 9-12)",
      "focus": "What this phase achieves",
      "actions": [
        {
          "week": "9-10",
          "action": "Scale task 1",
          "owner": "Role",
          "effort": "Low/Medium/High",
          "impact": "Low/Medium/High",
          "linkedGap": "Linked pillar or gap"
        },
        {
          "week": "10-11",
          "action": "Scale task 2",
          "owner": "Role",
          "effort": "Low/Medium/High",
          "impact": "Low/Medium/High",
          "linkedGap": "Linked pillar or gap"
        },
        {
          "week": "11-12",
          "action": "Scale task 3",
          "owner": "Role",
          "effort": "Low/Medium/High",
          "impact": "Low/Medium/High",
          "linkedGap": "Linked pillar or gap"
        }
      ]
    }
  },
  "pillarRecommendations": {
    "leadership": {
      "status": "Critical/Needs Work/On Track/Strong",
      "priority": 1-5,
      "keyAction": "The single most important action for this pillar",
      "rationale": "Why this matters for their business"
    },
    "data": {
      "status": "Critical/Needs Work/On Track/Strong",
      "priority": 1-5,
      "keyAction": "The single most important action",
      "rationale": "Why this matters"
    },
    "people": {
      "status": "Critical/Needs Work/On Track/Strong",
      "priority": 1-5,
      "keyAction": "The single most important action",
      "rationale": "Why this matters"
    },
    "process": {
      "status": "Critical/Needs Work/On Track/Strong",
      "priority": 1-5,
      "keyAction": "The single most important action",
      "rationale": "Why this matters"
    },
    "risk": {
      "status": "Critical/Needs Work/On Track/Strong",
      "priority": 1-5,
      "keyAction": "The single most important action",
      "rationale": "Why this matters"
    }
  },
  "monetisationPaths": [
    {
      "opportunity": "First revenue/savings opportunity",
      "potentialValue": "Estimated annual value range",
      "timeToValue": "Weeks/months to realise",
      "prerequisite": "What needs to be in place first"
    },
    {
      "opportunity": "Second opportunity",
      "potentialValue": "Value range",
      "timeToValue": "Timeline",
      "prerequisite": "Prerequisite"
    },
    {
      "opportunity": "Third opportunity",
      "potentialValue": "Value range",
      "timeToValue": "Timeline",
      "prerequisite": "Prerequisite"
    }
  ],
  "doList": [
    "First priority action they should take this week",
    "Second priority",
    "Third priority",
    "Fourth priority",
    "Fifth priority"
  ],
  "dontList": [
    "First thing they should NOT do yet and why",
    "Second warning",
    "Third warning"
  ],
  "roleInsight": "Specific advice for ${role || 'decision-makers'} based on their assessment results and typical challenges in that role",
  "investmentGuidance": {
    "budgetRange": "Recommended budget range for the 90-day plan",
    "keyInvestments": ["First investment area", "Second investment area"],
    "avoidSpending": "Where NOT to spend money yet"
  },
  "successMetrics": [
    {
      "metric": "First KPI to track",
      "baseline": "How to measure starting point",
      "target": "Target for week 12"
    },
    {
      "metric": "Second KPI",
      "baseline": "Starting measurement",
      "target": "Week 12 target"
    },
    {
      "metric": "Third KPI",
      "baseline": "Starting measurement",
      "target": "Week 12 target"
    }
  ],
  "nextStep": "The single most important next action to take today"
}

CRITICAL: Every recommendation must be directly linked to a specific gap or strength from their assessment. No generic advice. Tailor everything to their ${companySize || 'business'} size, ${industry || 'wellness'} industry, and ${role || 'decision-maker'} role.`;

    logStep("Calling Synta.io API with enhanced prompt");

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

    logStep("Enhanced insights generated successfully", {
      hasNinetyDayPlan: !!insights.ninetyDayPlan,
      hasPillarRecommendations: !!insights.pillarRecommendations
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
