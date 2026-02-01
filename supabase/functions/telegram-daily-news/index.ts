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
}

function escapeMarkdown(text: string): string {
  // Escape special characters for Telegram MarkdownV2
  return text.replace(/[_*\[\]()~`>#+=|{}.!-]/g, '\\$&');
}

function formatNewsMessage(items: NewsItem[]): string {
  const header = `🌟 *Wellness Genius Daily*\n_Your morning intelligence briefing_\n\n`;
  
  const newsItems = items.slice(0, 5).map((item, index) => {
    const emoji = ['📊', '💡', '🏋️', '🧘', '📈'][index % 5];
    const title = escapeMarkdown(item.title);
    const source = escapeMarkdown(item.source_name);
    const category = escapeMarkdown(item.category);
    
    return `${emoji} *${title}*\n_${source} \\| ${category}_\n[Read more](${item.source_url})\n`;
  }).join('\n');

  const footer = `\n━━━━━━━━━━━━━━━━━━━━\n🔗 [View all news](https://www.wellnessgenius.co.uk/news)\n💬 [Chat with AI Advisor](https://t.me/Wellnessgenius_bot)`;

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
      parse_mode: 'MarkdownV2',
      disable_web_page_preview: false,
      link_preview_options: {
        is_disabled: true
      }
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

    // Fetch latest news from cache
    const { data: newsItems, error } = await supabase
      .from('rss_news_cache')
      .select('title, summary, source_url, source_name, category')
      .order('published_date', { ascending: false })
      .limit(5);

    if (error) throw error;

    if (!newsItems || newsItems.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'No news items found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const message = formatNewsMessage(newsItems);
    const sent = await sendTelegramMessage(chatId, message, botToken);

    return new Response(
      JSON.stringify({ 
        success: sent, 
        message: sent ? 'Daily news sent to Telegram' : 'Failed to send message',
        items_count: newsItems.length
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
