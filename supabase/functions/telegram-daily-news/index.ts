import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsItem {
  title: string;
  summary: string;
  source_url: string;
  source_name: string;
  category: string;
  published_date: string;
}

function formatDate(): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const now = new Date();
  const day = days[now.getUTCDay()];
  const date = now.getUTCDate().toString().padStart(2, '0');
  const month = months[now.getUTCMonth()];
  const year = now.getUTCFullYear();
  return `${day}, ${date} ${month} ${year}`;
}

function formatNewsMessage(items: NewsItem[]): string {
  const header = `📰 Daily Wellness & AI Briefing\n${formatDate()}\n\n`;
  
  const newsItems = items.slice(0, 5).map((item, index) => {
    const num = index + 1;
    return `${num}. ${item.title} (${item.source_name})\n🔗 ${item.source_url}`;
  }).join('\n\n');

  const footer = `\n\n━━━━━━━━━━━━━━━━━━━━━\n💬 Questions? Tag @Wellnessgenius_bot\n📊 AI Readiness: /readiness\n🤖 Try AI Advisor: https://www.wellnessgenius.co.uk/genie`;

  return header + newsItems + footer;
}

async function sendTelegramMessage(chatId: string, text: string, botToken: string): Promise<boolean> {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      disable_web_page_preview: true,
    }),
  });

  const result = await response.json();
  
  if (!result.ok) {
    console.error('Telegram API error:', result);
    return false;
  }
  
  return true;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID');
    
    if (!botToken || !chatId) {
      throw new Error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the last sent timestamp from metadata
    const { data: metadata } = await supabase
      .from('rss_cache_metadata')
      .select('last_telegram_send')
      .eq('id', 'global')
      .single();

    const lastSentAt = metadata?.last_telegram_send 
      ? new Date(metadata.last_telegram_send) 
      : new Date(0);

    console.log(`Last Telegram send: ${lastSentAt.toISOString()}`);

    // Fetch only news added to cache after the last send (using created_at, not published_date)
    // This ensures we only send truly new items that weren't in the previous batch
    const { data: newsItems, error } = await supabase
      .from('rss_news_cache')
      .select('title, summary, source_url, source_name, category, published_date, created_at')
      .gt('created_at', lastSentAt.toISOString())
      .order('published_date', { ascending: false })
      .limit(5);

    if (error) throw error;

    if (!newsItems || newsItems.length === 0) {
      console.log('No new news items since last send, skipping');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No new news items to send',
          skipped: true,
          last_sent_at: lastSentAt.toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${newsItems.length} new items since ${lastSentAt.toISOString()}`);

    const message = formatNewsMessage(newsItems);
    const sent = await sendTelegramMessage(chatId, message, botToken);

    if (sent) {
      // Update the last sent timestamp
      await supabase
        .from('rss_cache_metadata')
        .update({ last_telegram_send: new Date().toISOString() })
        .eq('id', 'global');
    }

    return new Response(
      JSON.stringify({ 
        success: sent, 
        message: sent ? 'Daily news sent to Telegram' : 'Failed to send message',
        items_count: newsItems.length,
        skipped: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in telegram-daily-news:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send news' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
