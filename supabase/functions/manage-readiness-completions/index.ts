import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { validateAdminAuth } from "../_shared/admin-auth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schemas
const SaveCompletionSchema = z.object({
  action: z.literal('save'),
  email: z.string().email("Invalid email format").max(255, "Email must be less than 255 characters"),
  name: z.string().max(255, "Name must be less than 255 characters").optional().nullable(),
  company: z.string().max(255, "Company must be less than 255 characters").optional().nullable(),
  role: z.string().max(255, "Role must be less than 255 characters").optional().nullable(),
  industry: z.string().max(255, "Industry must be less than 255 characters").optional().nullable(),
  companySize: z.string().max(100, "Company size must be less than 100 characters").optional().nullable(),
  overallScore: z.number().int().min(0).max(100),
  leadershipScore: z.number().int().min(0).max(100).optional().nullable(),
  dataScore: z.number().int().min(0).max(100).optional().nullable(),
  peopleScore: z.number().int().min(0).max(100).optional().nullable(),
  processScore: z.number().int().min(0).max(100).optional().nullable(),
  riskScore: z.number().int().min(0).max(100).optional().nullable(),
  scoreBand: z.string().max(50).optional().nullable(),
});

const ListCompletionsSchema = z.object({
  action: z.literal('list'),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
});

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
      // Validate input
      const validationResult = SaveCompletionSchema.safeParse(body);
      if (!validationResult.success) {
        console.error('Validation error:', validationResult.error.errors);
        return new Response(
          JSON.stringify({ error: 'Invalid request format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { 
        email, name, company, role, industry, companySize,
        overallScore, leadershipScore, dataScore, peopleScore, 
        processScore, riskScore, scoreBand 
      } = validationResult.data;

      console.log('Saving AI Readiness completion for:', email);

      // Check for previous completion by this email to detect score changes
      const { data: previousCompletion } = await supabase
        .from('ai_readiness_completions')
        .select('id, overall_score, score_band')
        .eq('email', email)
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

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
        return new Response(
          JSON.stringify({ error: 'Failed to save completion. Please try again.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Send score change notification if there was a previous completion
      if (previousCompletion && data?.id) {
        const scoreDiff = Math.abs(overallScore - previousCompletion.overall_score);
        if (scoreDiff >= 5) {
          try {
            const notificationUrl = `${supabaseUrl}/functions/v1/send-readiness-score-change`;
            await fetch(notificationUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                completionId: data.id,
                email,
                name: name || 'there',
                currentScore: overallScore,
                previousScore: previousCompletion.overall_score,
                currentBand: scoreBand || 'Unknown',
                previousBand: previousCompletion.score_band || 'Unknown',
              }),
            });
            console.log('Score change notification sent');
          } catch (notifyError) {
            console.error('Failed to send score change notification:', notifyError);
            // Don't fail the main request if notification fails
          }
        }
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

      // Validate input
      const validationResult = ListCompletionsSchema.safeParse(body);
      if (!validationResult.success) {
        return new Response(
          JSON.stringify({ error: 'Invalid request format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const limit = validationResult.data.limit || 50;
      const offset = validationResult.data.offset || 0;

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
    return new Response(
      JSON.stringify({ error: 'Request failed. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});