import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validateAdminAuth, unauthorizedResponse } from '../_shared/admin-auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  source: string | null;
  is_active: boolean;
  subscribed_at: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin auth via JWT
    const authResult = await validateAdminAuth(req);
    
    console.log('Admin auth check:', {
      isAdmin: authResult.isAdmin,
      userId: authResult.userId,
      error: authResult.error,
    });
    
    if (!authResult.isAdmin) {
      console.log('Unauthorized access attempt to manage-subscribers');
      return unauthorizedResponse(authResult.error || 'Unauthorized', corsHeaders);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, subscriber, emails } = await req.json();

    switch (action) {
      case 'list': {
        const { data, error } = await supabase
          .from('newsletter_subscribers')
          .select('*')
          .order('subscribed_at', { ascending: false });

        if (error) throw error;

        return new Response(
          JSON.stringify({ subscribers: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'add': {
        if (!subscriber?.email) {
          return new Response(
            JSON.stringify({ error: 'Email is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data, error } = await supabase
          .from('newsletter_subscribers')
          .insert({
            email: subscriber.email,
            name: subscriber.name || null,
            source: subscriber.source || 'admin-manual',
            is_active: subscriber.is_active !== false,
          })
          .select()
          .single();

        if (error) {
          if (error.code === '23505') {
            return new Response(
              JSON.stringify({ error: 'Email already exists' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          throw error;
        }

        return new Response(
          JSON.stringify({ subscriber: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'bulk-add': {
        if (!emails || !Array.isArray(emails) || emails.length === 0) {
          return new Response(
            JSON.stringify({ error: 'Emails array is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        let added = 0;
        let skipped = 0;

        for (const email of emails) {
          const { error } = await supabase
            .from('newsletter_subscribers')
            .insert({
              email: email.toLowerCase().trim(),
              source: 'bulk-import',
              is_active: true,
            });

          if (error) {
            if (error.code === '23505') {
              skipped++;
            } else {
              console.error('Failed to insert email:', email, error);
            }
          } else {
            added++;
          }
        }

        return new Response(
          JSON.stringify({ added, skipped, total: emails.length }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update': {
        if (!subscriber?.id) {
          return new Response(
            JSON.stringify({ error: 'Subscriber ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data, error } = await supabase
          .from('newsletter_subscribers')
          .update({
            email: subscriber.email,
            name: subscriber.name,
            is_active: subscriber.is_active,
            source: subscriber.source,
          })
          .eq('id', subscriber.id)
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ subscriber: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete': {
        if (!subscriber?.id) {
          return new Response(
            JSON.stringify({ error: 'Subscriber ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabase
          .from('newsletter_subscribers')
          .delete()
          .eq('id', subscriber.id);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Subscriber management error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
