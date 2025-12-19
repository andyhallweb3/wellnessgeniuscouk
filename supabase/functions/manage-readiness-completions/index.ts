import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateAdminAuth } from "../_shared/admin-auth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action } = body;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Save completion (public - no auth required)
    if (action === 'save') {
      const { 
        email, name, company, role, industry, companySize,
        overallScore, leadershipScore, dataScore, peopleScore, 
        processScore, riskScore, scoreBand 
      } = body;

      console.log('Saving AI Readiness completion for:', email);

      const { data, error } = await supabase.from('ai_readiness_completions').insert({
        email,
        name,
        company,
        role,
        industry,
        company_size: companySize,
        overall_score: overallScore,
        leadership_score: leadershipScore,
        data_score: dataScore,
        people_score: peopleScore,
        process_score: processScore,
        risk_score: riskScore,
        score_band: scoreBand,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip'),
        user_agent: req.headers.get('user-agent'),
      }).select('id').single();

      if (error) {
        console.error('Error saving completion:', error);
        throw error;
      }

      return new Response(
        JSON.stringify({ success: true, id: data?.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // List completions (admin only)
    if (action === 'list') {
      const authResult = await validateAdminAuth(req);
      if (!authResult.isAdmin) {
        return new Response(
          JSON.stringify({ error: authResult.error || 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const limit = body.limit || 50;
      const offset = body.offset || 0;

      const { data: completions, error, count } = await supabase
        .from('ai_readiness_completions')
        .select('*', { count: 'exact' })
        .order('completed_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Get stats
      const { count: totalCount } = await supabase
        .from('ai_readiness_completions')
        .select('*', { count: 'exact', head: true });

      const { data: recentCompletions } = await supabase
        .from('ai_readiness_completions')
        .select('overall_score')
        .gte('completed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const avgScore = recentCompletions?.length 
        ? Math.round(recentCompletions.reduce((sum, c) => sum + c.overall_score, 0) / recentCompletions.length)
        : 0;

      return new Response(
        JSON.stringify({ 
          completions, 
          total: count,
          stats: {
            totalCompletions: totalCount,
            completionsThisWeek: recentCompletions?.length || 0,
            avgScoreThisWeek: avgScore,
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});