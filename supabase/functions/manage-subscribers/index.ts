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

    const { action, subscriber, emails, since, email } = await req.json();

    // Helper to log admin actions
    const logAudit = async (actionType: string, resourceCount?: number, details?: string) => {
      await supabase.from('admin_audit_logs').insert({
        admin_user_id: authResult.userId,
        action: actionType,
        resource_type: 'newsletter_subscribers',
        resource_count: resourceCount,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip'),
        user_agent: req.headers.get('user-agent'),
      });
      console.log('Audit log:', actionType, 'newsletter_subscribers', details || '');
    };

    // Handle coupon analytics action
    if (action === 'coupon-analytics') {
      // Get all subscribers
      const { data: allSubscribers, error: subError } = await supabase
        .from('newsletter_subscribers')
        .select('email, coupon_code, subscribed_at, coupon_used_at, coupon_product_id')
        .order('subscribed_at', { ascending: false });

      if (subError) throw subError;

      const totalSubscribers = allSubscribers?.length || 0;
      const subscribersWithCoupon = allSubscribers?.filter(s => s.coupon_code).length || 0;
      const couponsRedeemed = allSubscribers?.filter(s => s.coupon_used_at).length || 0;
      
      // Calculate rates
      const redemptionRate = subscribersWithCoupon > 0 ? (couponsRedeemed / subscribersWithCoupon) * 100 : 0;
      const conversionRate = totalSubscribers > 0 ? (couponsRedeemed / totalSubscribers) * 100 : 0;

      // Get recent redemptions for the table
      const redemptions = allSubscribers?.filter(s => s.coupon_code)?.slice(0, 50) || [];

      await logAudit('coupon-analytics', totalSubscribers);

      return new Response(
        JSON.stringify({
          stats: {
            totalSubscribers,
            subscribersWithCoupon,
            couponsRedeemed,
            redemptionRate,
            conversionRate,
          },
          redemptions,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    switch (action) {
      case 'list': {
        let query = supabase
          .from('newsletter_subscribers')
          .select('*')
          .order('subscribed_at', { ascending: false });
        
        // Filter by date if 'since' parameter is provided
        if (since) {
          query = query.gte('subscribed_at', since);
        }
        
        const { data, error } = await query;

        if (error) throw error;

        await logAudit('list', data?.length || 0);

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

        await logAudit('add', 1, `email: ${subscriber.email}`);

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

        await logAudit('bulk-add', added, `added: ${added}, skipped: ${skipped}`);

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

        await logAudit('update', 1, `id: ${subscriber.id}`);

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

        // First get the subscriber email before deleting
        const { data: subData, error: fetchError } = await supabase
          .from('newsletter_subscribers')
          .select('email')
          .eq('id', subscriber.id)
          .single();

        if (fetchError) throw fetchError;
        
        const subscriberEmail = subData?.email;

        // Delete from database
        const { error } = await supabase
          .from('newsletter_subscribers')
          .delete()
          .eq('id', subscriber.id);

        if (error) throw error;

        // Also delete from Resend audience if we have the API key
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        let resendDeleted = false;
        
        if (resendApiKey && subscriberEmail) {
          try {
            // First, find the contact ID in Resend by listing contacts and filtering
            const audienceId = 'f04e56ce-de81-43e9-aab3-fb0e10d1a1a0'; // Default audience
            
            // Search for the contact by email
            const searchRes = await fetch(
              `https://api.resend.com/audiences/${audienceId}/contacts?email=${encodeURIComponent(subscriberEmail)}`,
              {
                headers: {
                  'Authorization': `Bearer ${resendApiKey}`,
                },
              }
            );

            if (searchRes.ok) {
              const searchData = await searchRes.json();
              const contact = searchData?.data?.find((c: any) => c.email.toLowerCase() === subscriberEmail.toLowerCase());
              
              if (contact?.id) {
                // Delete the contact from Resend
                const deleteRes = await fetch(
                  `https://api.resend.com/audiences/${audienceId}/contacts/${contact.id}`,
                  {
                    method: 'DELETE',
                    headers: {
                      'Authorization': `Bearer ${resendApiKey}`,
                    },
                  }
                );

                if (deleteRes.ok) {
                  resendDeleted = true;
                  console.log('Deleted from Resend:', subscriberEmail);
                } else {
                  console.error('Failed to delete from Resend:', await deleteRes.text());
                }
              } else {
                console.log('Contact not found in Resend audience:', subscriberEmail);
              }
            } else {
              console.error('Failed to search Resend contacts:', await searchRes.text());
            }
          } catch (resendError) {
            console.error('Resend deletion error:', resendError);
            // Don't fail the whole operation if Resend fails
          }
        }

        await logAudit('delete', 1, `id: ${subscriber.id}, email: ${subscriberEmail}, resend_deleted: ${resendDeleted}`);

        return new Response(
          JSON.stringify({ success: true, resendDeleted }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get-send-history': {
        if (!email) {
          return new Response(
            JSON.stringify({ error: 'Email is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get send history for this email from newsletter_send_recipients
        // Join with newsletter_sends to get template info
        const { data: recipients, error: recipientsError } = await supabase
          .from('newsletter_send_recipients')
          .select(`
            id,
            email,
            status,
            sent_at,
            error_message,
            send_id
          `)
          .eq('email', email.toLowerCase())
          .order('created_at', { ascending: false })
          .limit(50);

        if (recipientsError) throw recipientsError;

        // Get the send details to find template info
        const sendIds = [...new Set(recipients?.map(r => r.send_id) || [])];
        
        let sendDetails: Record<string, { template_name?: string; template_subject?: string }> = {};
        
        if (sendIds.length > 0) {
          // Get newsletter_sends
          const { data: sends } = await supabase
            .from('newsletter_sends')
            .select('id, article_ids')
            .in('id', sendIds);

          // For each send, try to get template info from email_templates if article_ids contains a template ID
          if (sends) {
            for (const send of sends) {
              // article_ids might contain template IDs for campaign emails
              if (send.article_ids && send.article_ids.length > 0) {
                const templateId = send.article_ids[0];
                const { data: template } = await supabase
                  .from('email_templates')
                  .select('name, subject')
                  .eq('id', templateId)
                  .single();
                
                if (template) {
                  sendDetails[send.id] = {
                    template_name: template.name,
                    template_subject: template.subject,
                  };
                }
              }
            }
          }
        }

        // Merge template info into history
        const history = (recipients || []).map(r => ({
          ...r,
          template_name: sendDetails[r.send_id]?.template_name,
          template_subject: sendDetails[r.send_id]?.template_subject,
        }));

        await logAudit('get-send-history', history.length, `email: ${email}`);

        return new Response(
          JSON.stringify({ history }),
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
