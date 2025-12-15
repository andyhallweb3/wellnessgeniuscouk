import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret',
};

interface ZeroBounceEmail {
  email: string;
  status: string;
  sub_status: string;
  free_email: boolean;
  did_you_mean: string | null;
  account: string;
  domain: string;
  domain_age_days: string;
  smtp_provider: string;
  mx_found: string;
  mx_record: string;
  firstname: string;
  lastname: string;
  gender: string;
  country: string;
  region: string;
  city: string;
  zipcode: string;
  processed_at: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin secret
    const adminSecret = req.headers.get('x-admin-secret');
    const expectedSecret = Deno.env.get('ADMIN_SECRET');
    
    if (!adminSecret || adminSecret !== expectedSecret) {
      console.error('Unauthorized: Invalid admin secret');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const zeroBounceApiKey = Deno.env.get('ZEROBOUNCE_API_KEY');
    if (!zeroBounceApiKey) {
      return new Response(JSON.stringify({ error: 'ZeroBounce API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { action, fileId } = body;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (action === 'list-files') {
      // List available files from ZeroBounce
      console.log('Fetching file list from ZeroBounce...');
      const response = await fetch(
        `https://bulkapi.zerobounce.net/v2/scoring/filetatus?api_key=${zeroBounceApiKey}`
      );
      
      // ZeroBounce may not have a list endpoint, let's use getapiusage to verify API works
      const usageResponse = await fetch(
        `https://api.zerobounce.net/v2/getcredits?api_key=${zeroBounceApiKey}`
      );
      const usageData = await usageResponse.json();
      
      console.log('ZeroBounce API response:', usageData);
      
      return new Response(JSON.stringify({ 
        credits: usageData.Credits,
        message: 'API connection verified. Please provide a file_id to download results.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'import') {
      if (!fileId) {
        return new Response(JSON.stringify({ error: 'file_id is required for import' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`Fetching results for file: ${fileId}`);
      
      // Download the validated file results from ZeroBounce
      const downloadResponse = await fetch(
        `https://bulkapi.zerobounce.net/v2/getfile?api_key=${zeroBounceApiKey}&file_id=${fileId}`
      );
      
      if (!downloadResponse.ok) {
        const errorText = await downloadResponse.text();
        console.error('ZeroBounce download error:', errorText);
        return new Response(JSON.stringify({ error: 'Failed to download file from ZeroBounce', details: errorText }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const csvText = await downloadResponse.text();
      console.log('CSV preview:', csvText.substring(0, 500));
      
      // Parse CSV
      const lines = csvText.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        return new Response(JSON.stringify({ error: 'No data found in file' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
      const emailIndex = headers.findIndex(h => h === 'email' || h === 'email address' || h === 'email_address');
      const statusIndex = headers.findIndex(h => h === 'status' || h === 'zb_status');
      const firstnameIndex = headers.findIndex(h => h === 'firstname' || h === 'first_name' || h === 'name');
      const lastnameIndex = headers.findIndex(h => h === 'lastname' || h === 'last_name');

      if (emailIndex === -1) {
        return new Response(JSON.stringify({ 
          error: 'Could not find email column in CSV',
          headers: headers 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const validEmails: { email: string; name: string | null }[] = [];
      const validStatuses = ['valid', 'catch-all', 'unknown']; // Accept these statuses

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const email = values[emailIndex]?.toLowerCase();
        const status = statusIndex !== -1 ? values[statusIndex]?.toLowerCase() : 'valid';
        
        // Only import valid/catch-all emails (skip invalid, abuse, spamtrap, etc.)
        if (email && (statusIndex === -1 || validStatuses.includes(status))) {
          let name: string | null = null;
          if (firstnameIndex !== -1) {
            const firstName = values[firstnameIndex] || '';
            const lastName = lastnameIndex !== -1 ? values[lastnameIndex] || '' : '';
            name = [firstName, lastName].filter(Boolean).join(' ') || null;
          }
          validEmails.push({ email, name });
        }
      }

      console.log(`Found ${validEmails.length} valid emails to import`);

      // Import emails to newsletter_subscribers using upsert
      let imported = 0;
      let skipped = 0;

      for (const { email, name } of validEmails) {
        const { error } = await supabase
          .from('newsletter_subscribers')
          .upsert(
            { 
              email, 
              name: name || undefined,
              source: 'zerobounce-import',
              is_active: true 
            },
            { onConflict: 'email', ignoreDuplicates: true }
          );

        if (error) {
          console.error(`Failed to import ${email}:`, error);
          skipped++;
        } else {
          imported++;
        }
      }

      return new Response(JSON.stringify({ 
        success: true,
        imported,
        skipped,
        total: validEmails.length,
        message: `Successfully imported ${imported} emails from ZeroBounce`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'check-credits') {
      const response = await fetch(
        `https://api.zerobounce.net/v2/getcredits?api_key=${zeroBounceApiKey}`
      );
      const data = await response.json();
      
      return new Response(JSON.stringify({ 
        credits: data.Credits 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action. Use: check-credits, list-files, or import' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('ZeroBounce import error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
