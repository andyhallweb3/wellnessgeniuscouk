import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { feedbackType, featureArea, description, severity, userEmail, userName } = await req.json();

    if (!featureArea || !description) {
      return new Response(
        JSON.stringify({ error: 'Feature area and description are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header if present
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    let resolvedEmail = userEmail;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        userId = user.id;
        resolvedEmail = resolvedEmail || user.email;
      }
    }

    // Insert feedback report
    const { data: report, error: insertError } = await supabase
      .from('feedback_reports')
      .insert({
        user_id: userId,
        user_email: resolvedEmail,
        feature_area: featureArea,
        feedback_type: feedbackType || 'bug',
        description,
        severity: severity || 'medium',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw new Error('Failed to save feedback report');
    }

    console.log('Feedback report saved:', report.id);

    // Send email notification to admin
    if (resendApiKey) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Wellness Genius <noreply@wellnessgenius.ai>',
            to: ['support@wellnessgenius.ai'],
            subject: `[${(feedbackType || 'bug').toUpperCase()}] ${severity?.toUpperCase() || 'MEDIUM'}: ${featureArea}`,
            html: `
              <h2>New ${feedbackType === 'feature' ? 'Feature Request' : feedbackType === 'improvement' ? 'Improvement Suggestion' : 'Bug Report'}</h2>
              <p><strong>Type:</strong> ${feedbackType || 'bug'}</p>
              <p><strong>Feature Area:</strong> ${featureArea}</p>
              <p><strong>Severity:</strong> ${severity || 'medium'}</p>
              <p><strong>Submitted by:</strong> ${userName || 'Anonymous'} (${resolvedEmail || 'No email'})</p>
              <p><strong>Description:</strong></p>
              <p style="background: #f5f5f5; padding: 12px; border-radius: 4px;">${description}</p>
              <p><strong>Report ID:</strong> ${report.id}</p>
              <p><strong>Submitted at:</strong> ${new Date().toISOString()}</p>
            `,
          }),
        });

        if (!emailResponse.ok) {
          console.error('Email send failed:', await emailResponse.text());
        } else {
          console.log('Email notification sent');
        }
      } catch (emailError) {
        console.error('Email error:', emailError);
        // Don't fail the request if email fails
      }
    }

    return new Response(
      JSON.stringify({ success: true, reportId: report.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Feedback submission error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
