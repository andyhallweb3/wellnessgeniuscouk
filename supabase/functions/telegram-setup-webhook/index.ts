import { getCorsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      throw new Error('Missing TELEGRAM_BOT_TOKEN');
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'set';
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const webhookUrl = `${supabaseUrl}/functions/v1/telegram-webhook`;

    let apiUrl: string;
    let body: Record<string, unknown> | undefined;

    if (action === 'set') {
      apiUrl = `https://api.telegram.org/bot${botToken}/setWebhook`;
      body = { url: webhookUrl };
    } else if (action === 'delete') {
      apiUrl = `https://api.telegram.org/bot${botToken}/deleteWebhook`;
    } else if (action === 'info') {
      apiUrl = `https://api.telegram.org/bot${botToken}/getWebhookInfo`;
    } else {
      throw new Error('Invalid action. Use: set, delete, or info');
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });

    const result = await response.json();

    return new Response(
      JSON.stringify({ 
        success: result.ok,
        action,
        webhook_url: action === 'set' ? webhookUrl : undefined,
        result 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Webhook setup error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
