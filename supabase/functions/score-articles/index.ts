import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validateAdminAuth, unauthorizedResponse } from '../_shared/admin-auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Source authority tiers
const SOURCE_TIERS: Record<string, number> = {
  // Tier 1 (16-20)
  'TechCrunch': 18,
  'Financial Times': 20,
  'Wall Street Journal': 20,
  'MIT Tech Review': 19,
  'MobiHealthNews': 17,
  'Fitt Insider': 17,
  'STAT News': 18,
  'VentureBeat': 17,
  'Crunchbase': 16,
  'Crunchbase Health': 17,
  'Sifted': 16,
  'Club Industry': 16,
  'Athletech News': 16,
  'Skift': 17,
  // Tier 2 (10-15)
  'Healthcare IT News': 14,
  'Fierce Healthcare': 14,
  'Global Wellness Institute': 15,
  'Longevity Technology': 13,
  'Athletic Business': 13,
  'Hotel Management': 12,
  'Phocuswire': 13,
  'Employee Benefit News': 12,
  'HR Dive': 12,
  'SHRM': 13,
  'Forbes Health': 14,
  'Fast Company': 13,
  'Google AI': 15,
  // Tier 3 (0-9)
  'Spa Business': 10,
  'Well+Good': 6,
  'MindBodyGreen': 5,
};

const SCORING_PROMPT = `You are a news scoring agent for Wellness Genius, a B2B intelligence service for wellness, fitness, and hospitality operators and investors.

Score this article using the following criteria. Be brutally practical - this system surfaces what matters, not what's noisy.

SCORING CRITERIA (respond with JSON only):

1. COMMERCIAL_IMPACT (0-25): Does this change money flows, budgets, or decisions?
   - 20-25: Funding round, M&A, major partnership
   - 15-19: Operator expansion, new revenue model
   - 10-14: Product launch with adoption signal
   - 0-9: Thought leadership / opinion only
   CFO test: If a CFO would forward this, score high.

2. OPERATOR_RELEVANCE (0-20): Who should care?
   - 16-20: Fitness operators, wellness brands, investors directly affected
   - 10-15: Adjacent relevance (healthcare, insurance, hospitality)
   - 0-9: General consumer wellness
   Test: If it doesn't affect buying, staffing, tech, or strategy, it's not newsletter-worthy.

3. NOVELTY (0-15): Is this new or reheated?
   - 12-15: First-of-its-kind / early signal
   - 8-11: Clear trend confirmation
   - 0-7: Widely covered, nothing new
   Anti-noise rule: If LinkedIn already ran it into the ground, downgrade.

4. TIMELINESS (0-10): Why this week?
   - 8-10: Published this week, time-sensitive
   - 4-7: Last 2 weeks but still relevant
   - 0-3: Evergreen / old

5. WG_FIT (0-10): Does this align with Wellness Genius POV?
   - 8-10: Data, engagement, AI, behaviour, monetisation
   - 4-7: Adjacent but useful
   - 0-3: Soft lifestyle wellness
   Wellness Genius is an insight engine, not a wellness blog.

6. BUSINESS_LENS: What is the PRIMARY business impact angle? Choose exactly ONE:
   - "revenue_growth": Directly affects top-line revenue, pricing, new markets, customer acquisition
   - "cost_efficiency": Reduces costs, improves margins, automation, operational efficiency
   - "retention_engagement": Member/customer retention, engagement, experience, loyalty
   - "risk_regulation": Compliance, legal, regulatory, liability, industry standards
   - "investment_ma": Funding, M&A, valuations, investor activity, market consolidation
   - "technology_enablement": Tech adoption, digital transformation, AI/automation tools, platforms

ARTICLE TO SCORE:
Title: {{TITLE}}
Source: {{SOURCE}}
Summary: {{SUMMARY}}
Category: {{CATEGORY}}
Published: {{PUBLISHED}}

Respond with ONLY this JSON structure, no other text:
{
  "commercial_impact": <number>,
  "operator_relevance": <number>,
  "novelty": <number>,
  "timeliness": <number>,
  "wg_fit": <number>,
  "business_lens": "<one of: revenue_growth, cost_efficiency, retention_engagement, risk_regulation, investment_ma, technology_enablement>",
  "reasoning": "<1-2 sentence explanation of the score>"
}`;

interface Article {
  id: string;
  title: string;
  source: string;
  excerpt: string | null;
  category: string;
  published_at: string;
}

interface ScoreResult {
  commercial_impact: number;
  operator_relevance: number;
  novelty: number;
  timeliness: number;
  wg_fit: number;
  business_lens: string;
  reasoning: string;
}

const VALID_LENSES = ['revenue_growth', 'cost_efficiency', 'retention_engagement', 'risk_regulation', 'investment_ma', 'technology_enablement'];

async function scoreArticle(article: Article, apiKey: string): Promise<ScoreResult | null> {
  try {
    const prompt = SCORING_PROMPT
      .replace('{{TITLE}}', article.title)
      .replace('{{SOURCE}}', article.source)
      .replace('{{SUMMARY}}', article.excerpt || 'No summary available')
      .replace('{{CATEGORY}}', article.category)
      .replace('{{PUBLISHED}}', article.published_at);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error(`AI scoring failed for "${article.title}": ${response.status}`);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error(`No content in AI response for "${article.title}"`);
      return null;
    }

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error(`No JSON found in response for "${article.title}": ${content}`);
      return null;
    }

    const scores = JSON.parse(jsonMatch[0]) as ScoreResult;
    
    // Validate score ranges
    scores.commercial_impact = Math.min(25, Math.max(0, scores.commercial_impact || 0));
    scores.operator_relevance = Math.min(20, Math.max(0, scores.operator_relevance || 0));
    scores.novelty = Math.min(15, Math.max(0, scores.novelty || 0));
    scores.timeliness = Math.min(10, Math.max(0, scores.timeliness || 0));
    scores.wg_fit = Math.min(10, Math.max(0, scores.wg_fit || 0));
    
    // Validate business lens
    if (!VALID_LENSES.includes(scores.business_lens)) {
      scores.business_lens = 'technology_enablement'; // default fallback
    }

    return scores;
  } catch (error) {
    console.error(`Error scoring article "${article.title}":`, error);
    return null;
  }
}

function getSourceAuthorityScore(source: string): number {
  // Check for exact match first
  if (SOURCE_TIERS[source]) {
    return SOURCE_TIERS[source];
  }
  
  // Check for partial match
  for (const [key, score] of Object.entries(SOURCE_TIERS)) {
    if (source.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(source.toLowerCase())) {
      return score;
    }
  }
  
  // Default for unknown sources
  return 8;
}

Deno.serve(async (req) => {
  console.log('Score-articles function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const adminSecret = Deno.env.get('ADMIN_SECRET');
    
    console.log('Env check:', { 
      hasSupabaseUrl: !!supabaseUrl, 
      hasServiceKey: !!supabaseKey, 
      hasLovableKey: !!lovableApiKey,
      hasAdminSecret: !!adminSecret 
    });
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!lovableApiKey) {
      console.error('Missing LOVABLE_API_KEY');
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check admin auth via JWT
    const authResult = await validateAdminAuth(req);
    console.log('Admin auth check:', { isAdmin: authResult.isAdmin, userId: authResult.userId });
    
    if (!authResult.isAdmin) {
      console.log('Auth failed - not admin');
      return unauthorizedResponse(authResult.error || 'Unauthorized', corsHeaders);
    }
    
    console.log('Auth passed');

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '5'); // Reduced from 20 to avoid timeout
    const forceRescore = url.searchParams.get('force') === 'true';

    console.log(`Scoring articles - limit: ${limit}, force: ${forceRescore}`);

    // Fetch unscored articles (or all if force rescore)
    let query = supabase
      .from('articles')
      .select('id, title, source, excerpt, category, published_at')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (!forceRescore) {
      query = query.is('scored_at', null);
    }

    const { data: articles, error: fetchError } = await query;

    if (fetchError) {
      throw fetchError;
    }

    if (!articles || articles.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No articles to score', scored: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${articles.length} articles to score`);

    const results: { id: string; title: string; score: number; qualified: boolean }[] = [];

    for (const article of articles) {
      console.log(`Scoring: "${article.title.substring(0, 50)}..."`);
      
      const aiScores = await scoreArticle(article, lovableApiKey);
      
      if (!aiScores) {
        console.warn(`Skipping article due to scoring failure: ${article.id}`);
        continue;
      }

      const sourceAuthority = getSourceAuthorityScore(article.source);
      
      const totalScore = 
        sourceAuthority +
        aiScores.commercial_impact +
        aiScores.operator_relevance +
        aiScores.novelty +
        aiScores.timeliness +
        aiScores.wg_fit;

      console.log(`Score breakdown for "${article.title.substring(0, 30)}...": SA=${sourceAuthority} CI=${aiScores.commercial_impact} OR=${aiScores.operator_relevance} N=${aiScores.novelty} T=${aiScores.timeliness} WG=${aiScores.wg_fit} TOTAL=${totalScore} LENS=${aiScores.business_lens}`);

      // Update article with scores
      const { error: updateError } = await supabase
        .from('articles')
        .update({
          score_source_authority: sourceAuthority,
          score_commercial_impact: aiScores.commercial_impact,
          score_operator_relevance: aiScores.operator_relevance,
          score_novelty: aiScores.novelty,
          score_timeliness: aiScores.timeliness,
          score_wg_fit: aiScores.wg_fit,
          score_total: totalScore,
          score_reasoning: aiScores.reasoning,
          business_lens: aiScores.business_lens,
          scored_at: new Date().toISOString(),
        })
        .eq('id', article.id);

      if (updateError) {
        console.error(`Failed to update scores for ${article.id}:`, updateError);
        continue;
      }

      results.push({
        id: article.id,
        title: article.title,
        score: totalScore,
        qualified: totalScore >= 65,
      });

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const qualified = results.filter(r => r.qualified).length;
    
    console.log(`Scoring complete: ${results.length} scored, ${qualified} qualified (≥65)`);

    return new Response(
      JSON.stringify({
        success: true,
        scored: results.length,
        qualified,
        results: results.sort((a, b) => b.score - a.score),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in score-articles:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to score articles' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});