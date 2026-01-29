import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

// Research categories
type ResearchCategory = 'market_trends' | 'competitive' | 'evidence' | 'roi' | 'policy' | 'demographics';
type ConfidenceLevel = 'high' | 'medium' | 'low';
type InsightType = 'opportunity' | 'risk' | 'trend' | 'benchmark' | 'evidence' | 'caution';
type ImpactLevel = 'high' | 'medium' | 'low';
type Timeframe = 'immediate' | 'short_term' | 'long_term';

interface ResearchSource {
  title: string;
  url: string | null;
  source_date: string;
  credibility_score: number;
  source_type: 'academic' | 'industry_report' | 'news' | 'blog' | 'government';
}

interface KeyFinding {
  title: string;
  data: string;
  change: string | null;
  source: string | null;
  confidence: ConfidenceLevel;
  supporting_evidence: string[];
}

interface StrategicInsight {
  insight_type: InsightType;
  title: string;
  text: string;
  impact: ImpactLevel;
  timeframe: Timeframe;
  recommended_actions: string[];
}

// Agent base class logic
function getDataSources(category: ResearchCategory): string[] {
  const sources: Record<ResearchCategory, string[]> = {
    market_trends: [
      'Global Wellness Institute',
      'McKinsey & Company',
      'Deloitte',
      'PwC',
      'Industry trade publications'
    ],
    competitive: [
      'Gartner Magic Quadrant',
      'Forrester Wave',
      'G2 reviews',
      'Company websites',
      'Financial reports'
    ],
    evidence: [
      'PubMed',
      'Google Scholar',
      'JAMA',
      'Cochrane Library',
      'Health Affairs'
    ],
    roi: [
      'Industry benchmarking reports',
      'Academic studies',
      'Company case studies',
      'Financial databases'
    ],
    policy: [
      'Government health departments',
      'WHO',
      'FDA',
      'NICE guidelines',
      'Regulatory bodies'
    ],
    demographics: [
      'Census data',
      'Nielsen',
      'Euromonitor',
      'Statista',
      'Industry surveys'
    ]
  };
  return sources[category] || ['General web search'];
}

// Create research plan (Planning pattern)
function createResearchPlan(query: string, category: ResearchCategory) {
  const baseSteps = [
    { step: 1, action: 'Query analysis and decomposition', agent: 'orchestrator' },
    { step: 2, action: 'Source identification and credibility check', agent: 'all' }
  ];

  const categorySteps: Record<ResearchCategory, Array<{ step: number; action: string; agent: string }>> = {
    market_trends: [
      { step: 3, action: 'Market size and growth analysis', agent: 'market' },
      { step: 4, action: 'Trend identification and validation', agent: 'market' },
      { step: 5, action: 'Forecast generation', agent: 'market' }
    ],
    competitive: [
      { step: 3, action: 'Competitor identification', agent: 'competitive' },
      { step: 4, action: 'Feature and pricing comparison', agent: 'competitive' },
      { step: 5, action: 'Market gap analysis', agent: 'competitive' }
    ],
    evidence: [
      { step: 3, action: 'Literature search (peer-reviewed)', agent: 'evidence' },
      { step: 4, action: 'Quality assessment', agent: 'evidence' },
      { step: 5, action: 'Effect size calculation', agent: 'evidence' }
    ],
    roi: [
      { step: 3, action: 'Cost-benefit analysis', agent: 'roi' },
      { step: 4, action: 'Benchmark comparison', agent: 'roi' },
      { step: 5, action: 'Sensitivity analysis', agent: 'roi' }
    ],
    policy: [
      { step: 3, action: 'Regulatory landscape scan', agent: 'policy' },
      { step: 4, action: 'Compliance requirements', agent: 'policy' },
      { step: 5, action: 'Policy trend analysis', agent: 'policy' }
    ],
    demographics: [
      { step: 3, action: 'Population data collection', agent: 'demographics' },
      { step: 4, action: 'Segmentation analysis', agent: 'demographics' },
      { step: 5, action: 'Trend projection', agent: 'demographics' }
    ]
  };

  const steps = [...baseSteps, ...(categorySteps[category] || [])];
  steps.push({ step: steps.length + 1, action: 'Synthesis and report generation', agent: 'orchestrator' });

  return {
    query,
    category,
    steps,
    estimated_time: `${steps.length * 15} seconds`,
    data_sources: getDataSources(category)
  };
}

// Reflection pattern - assess quality
function reflectOnQuality(findings: KeyFinding[], insights: StrategicInsight[], sources: ResearchSource[]): number {
  const criteriaScores: Record<string, number> = {};

  // Source credibility
  const avgCredibility = sources.length > 0
    ? sources.reduce((sum, s) => sum + s.credibility_score, 0) / sources.length
    : 0;
  criteriaScores.source_credibility = avgCredibility * 10;

  // Data recency
  const currentYear = new Date().getFullYear();
  const recentSources = sources.filter(s => {
    const year = parseInt(s.source_date?.slice(0, 4) || '0');
    return year >= currentYear - 1;
  }).length;
  criteriaScores.data_recency = sources.length > 0 ? (recentSources / sources.length) * 10 : 0;

  // Finding confidence
  const highConfidence = findings.filter(f => f.confidence === 'high').length;
  criteriaScores.finding_confidence = findings.length > 0 ? (highConfidence / findings.length) * 10 : 0;

  // Insight actionability
  const actionable = insights.filter(i => i.recommended_actions.length >= 2).length;
  criteriaScores.actionability = insights.length > 0 ? (actionable / insights.length) * 10 : 0;

  // Overall score
  const values = Object.values(criteriaScores);
  return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

serve(async (req) => {
  const dynamicCorsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: dynamicCorsHeaders });
  }

  try {
    const { query, category } = await req.json() as { query: string; category: ResearchCategory };

    if (!query || !category) {
      return new Response(
        JSON.stringify({ error: 'Query and category are required' }),
        { status: 400, headers: { ...dynamicCorsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    // Get user from auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...dynamicCorsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const anonClient = createClient(supabaseUrl!, Deno.env.get("SUPABASE_ANON_KEY")!);
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await anonClient.auth.getUser(token);

    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...dynamicCorsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = userData.user.id;
    console.log(`Research request from user ${userId}: ${category} - ${query}`);

    // Step 1: Create research plan
    const plan = createResearchPlan(query, category);
    console.log(`Research plan created with ${plan.steps.length} steps`);

    // Step 2: Build category-specific system prompt
    const categoryPrompts: Record<ResearchCategory, string> = {
      market_trends: `You are an expert market research analyst specializing in the wellness industry. Analyze market trends, growth projections, key players, and forecasts. Focus on data from Global Wellness Institute, McKinsey, Deloitte, and industry reports.`,
      competitive: `You are a competitive intelligence analyst specializing in wellness technology. Analyze competitor positioning, feature comparisons, pricing strategies, and market gaps. Reference Gartner, Forrester, and industry benchmarks.`,
      evidence: `You are a medical research analyst specializing in evidence-based wellness interventions. Analyze peer-reviewed studies, meta-analyses, effect sizes, and clinical evidence. Reference PubMed, Cochrane reviews, and academic journals.`,
      roi: `You are a financial analyst specializing in wellness program ROI. Analyze cost-benefit ratios, productivity gains, healthcare savings, and investment returns. Reference industry benchmarks and case studies.`,
      policy: `You are a healthcare policy analyst. Analyze regulatory requirements, compliance standards, policy trends, and governance implications. Reference government agencies, WHO, and regulatory bodies.`,
      demographics: `You are a demographics researcher. Analyze population trends, customer segmentation, adoption patterns, and demographic shifts in wellness. Reference census data, Nielsen, and consumer surveys.`
    };

    const systemPrompt = `${categoryPrompts[category]}

You are part of the Wellness Genius Research Assistant, providing intelligence for wellness industry executives.

CRITICAL: You must respond with ONLY valid JSON matching this exact schema:

{
  "executive_summary": "2-3 sentence summary of key findings and strategic direction",
  "key_findings": [
    {
      "title": "Finding title",
      "data": "Key data point or statistic",
      "change": "Change or trend indicator (e.g., +15% YoY)",
      "source": "Source attribution",
      "confidence": "high|medium|low",
      "supporting_evidence": ["Evidence point 1", "Evidence point 2"]
    }
  ],
  "strategic_insights": [
    {
      "insight_type": "opportunity|risk|trend|benchmark|evidence|caution",
      "title": "Insight title",
      "text": "Detailed insight explanation",
      "impact": "high|medium|low",
      "timeframe": "immediate|short_term|long_term",
      "recommended_actions": ["Action 1", "Action 2", "Action 3"]
    }
  ],
  "sources": [
    {
      "title": "Source title",
      "url": "https://...",
      "source_date": "2025-01-15",
      "credibility_score": 0.95,
      "source_type": "academic|industry_report|news|blog|government"
    }
  ]
}

Guidelines:
- Provide 3-5 key findings with specific data points
- Generate 2-4 strategic insights with actionable recommendations
- Include 3-5 credible sources with realistic credibility scores
- Use British English
- Be specific and commercially relevant
- Focus on decision-grade intelligence, not generic observations`;

    const userPrompt = `Research Query: ${query}

Category: ${category.replace('_', ' ').toUpperCase()}

Research Plan:
${plan.steps.map(s => `${s.step}. ${s.action}`).join('\n')}

Data Sources to Consider:
${plan.data_sources.join(', ')}

Conduct comprehensive research and provide structured findings, insights, and sources.`;

    // Step 3: Call Claude for research synthesis
    console.log("Calling Claude for research synthesis...");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4096,
        messages: [
          { role: "user", content: userPrompt }
        ],
        system: systemPrompt
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", errorText);
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.content?.[0]?.text;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response
    let researchData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        researchData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.log("Raw response:", content);
      throw new Error("Failed to parse research results");
    }

    // Step 4: Reflection - assess quality
    const qualityScore = reflectOnQuality(
      researchData.key_findings || [],
      researchData.strategic_insights || [],
      researchData.sources || []
    );

    console.log(`Research quality score: ${qualityScore.toFixed(1)}/10`);

    // Step 5: Save to database
    const { data: reportData, error: reportError } = await supabase
      .from('research_reports')
      .insert({
        user_id: userId,
        query,
        category,
        executive_summary: researchData.executive_summary,
        confidence_score: qualityScore / 10,
        research_plan: plan
      })
      .select()
      .single();

    if (reportError) {
      console.error("Failed to save report:", reportError);
      throw new Error("Failed to save research report");
    }

    const reportId = reportData.id;

    // Save findings
    if (researchData.key_findings?.length > 0) {
      const findings = researchData.key_findings.map((f: KeyFinding) => ({
        report_id: reportId,
        title: f.title,
        data: f.data,
        change: f.change,
        source: f.source,
        confidence: f.confidence,
        supporting_evidence: f.supporting_evidence || []
      }));

      await supabase.from('research_findings').insert(findings);
    }

    // Save insights
    if (researchData.strategic_insights?.length > 0) {
      const insights = researchData.strategic_insights.map((i: StrategicInsight) => ({
        report_id: reportId,
        insight_type: i.insight_type,
        title: i.title,
        text: i.text,
        impact: i.impact,
        timeframe: i.timeframe,
        recommended_actions: i.recommended_actions || []
      }));

      await supabase.from('research_insights').insert(insights);
    }

    // Save sources
    if (researchData.sources?.length > 0) {
      const sources = researchData.sources.map((s: ResearchSource) => ({
        report_id: reportId,
        title: s.title,
        url: s.url,
        source_date: s.source_date,
        credibility_score: s.credibility_score,
        source_type: s.source_type
      }));

      await supabase.from('research_sources').insert(sources);
    }

    console.log(`Research report saved: ${reportId}`);

    // Return complete response
    return new Response(
      JSON.stringify({
        success: true,
        report_id: reportId,
        query,
        category,
        executive_summary: researchData.executive_summary,
        key_findings: researchData.key_findings,
        strategic_insights: researchData.strategic_insights,
        sources: researchData.sources,
        confidence_score: qualityScore / 10,
        research_plan: plan,
        generated_at: new Date().toISOString()
      }),
      { headers: { ...dynamicCorsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Research assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...dynamicCorsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
