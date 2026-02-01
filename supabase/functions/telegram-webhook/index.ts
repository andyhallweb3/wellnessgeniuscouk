import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TelegramUpdate {
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: 'private' | 'group' | 'supergroup' | 'channel';
      title?: string;
    };
    text?: string;
    date: number;
  };
}

interface NewsItem {
  title: string;
  source_url: string;
  source_name: string;
}

const SYSTEM_PROMPT = `You are Wellness Genius, the AI advisor for wellness business operators (gym owners, studio managers, spa directors, corporate wellness leads).

Your role:
- Provide practical, actionable advice on running wellness businesses
- Share insights on AI adoption, technology, and industry trends
- Help with operational challenges, marketing, retention, and growth
- Be concise, friendly, and professional

IMPORTANT - Always end your responses with a relevant CTA:
- For AI/technology questions → suggest the AI Readiness Assessment: wellnessgenius.co.uk/ai-readiness
- For strategic/business questions → suggest the full AI Advisor: wellnessgenius.co.uk/genie
- For general questions → mention both options

Keep responses brief (2-3 paragraphs max). Use emojis sparingly for warmth.

Example sign-offs:
- "Want to see how AI-ready your business is? Take the free assessment: wellnessgenius.co.uk/ai-readiness"
- "For deeper strategic guidance, try our AI Advisor: wellnessgenius.co.uk/genie"
- "Ready to level up? Start with your AI Readiness score: wellnessgenius.co.uk/ai-readiness"`;

async function sendTelegramMessage(chatId: number, text: string, botToken: string, replyToMessageId?: number): Promise<boolean> {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
  };
  
  if (replyToMessageId) {
    body.reply_to_message_id = replyToMessageId;
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const result = await response.json();
  if (!result.ok) {
    console.error('Telegram send error:', result);
  }
  return result.ok;
}

async function getLatestNews(supabase: any): Promise<string> {
  const { data: items } = await supabase
    .from('rss_news_cache')
    .select('title, source_url, source_name')
    .order('published_date', { ascending: false })
    .limit(5);

  if (!items || items.length === 0) {
    return "📰 No news available at the moment. Check back later!";
  }

  const header = "📰 <b>Latest Wellness & AI News</b>\n\n";
  const newsItems = items.map((item: NewsItem, i: number) => 
    `${i + 1}. ${item.title}\n<i>${item.source_name}</i>\n${item.source_url}`
  ).join('\n\n');
  
  return header + newsItems;
}

async function getAIResponse(message: string, userName: string, anthropic: Anthropic): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `[From: ${userName}]\n${message}`
      }]
    });

    const textBlock = response.content.find(block => block.type === 'text');
    return textBlock?.text || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error('Anthropic API error:', error);
    return "Sorry, I'm having trouble thinking right now. Please try again in a moment! 🤔";
  }
}

function shouldRespond(update: TelegramUpdate): boolean {
  const message = update.message;
  if (!message?.text) return false;
  
  // Always respond in private chats
  if (message.chat.type === 'private') return true;
  
  // In groups, only respond if mentioned or replied to
  const text = message.text.toLowerCase();
  if (text.includes('@wellnessgenius_bot') || text.includes('@wellness')) return true;
  
  // Respond to commands in groups
  if (text.startsWith('/')) return true;
  
  return false;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    
    if (!botToken) {
      throw new Error('Missing TELEGRAM_BOT_TOKEN');
    }

    const update: TelegramUpdate = await req.json();
    console.log('Received update:', JSON.stringify(update, null, 2));

    const message = update.message;
    if (!message?.text) {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if we should respond
    if (!shouldRespond(update)) {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const userName = message.from.first_name || 'there';
    const messageId = message.message_id;

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let responseText: string;

    // Handle commands
    if (text.startsWith('/start')) {
      responseText = `👋 Welcome to <b>Wellness Genius</b>, ${userName}!

I'm your AI advisor for running a smarter wellness business.

<b>🚀 Get Started:</b>
📊 <b>AI Readiness Score</b> - See how prepared your business is for AI
👉 wellnessgenius.co.uk/ai-readiness

🤖 <b>AI Advisor</b> - Get instant answers to your business questions
👉 wellnessgenius.co.uk/genie

<b>Quick commands:</b>
/news - Latest industry news
/readiness - Take the AI assessment
/tryai - Try the full AI Advisor

Or just ask me anything! 💪`;
    } 
    else if (text.startsWith('/news')) {
      responseText = await getLatestNews(supabase);
    }
    else if (text.startsWith('/readiness')) {
      responseText = `📊 <b>AI Readiness Assessment</b>

Discover how prepared your wellness business is for AI adoption in just 5 minutes.

You'll get:
✅ Your AI Readiness Score (0-100)
✅ Breakdown across 5 key pillars
✅ Personalised recommendations
✅ Comparison to industry benchmarks

<b>Take the free assessment now:</b>
👉 wellnessgenius.co.uk/ai-readiness

Then explore deeper insights with our AI Advisor:
👉 wellnessgenius.co.uk/genie`;
    }
    else if (text.startsWith('/tryai')) {
      responseText = `🤖 <b>AI Advisor - Your 24/7 Business Intelligence</b>

Get instant, decision-grade answers to your wellness business questions.

What you can ask:
💡 "How do I improve member retention?"
📈 "What AI tools should I consider for my gym?"
🎯 "Help me plan a January marketing campaign"

<b>Start chatting now:</b>
👉 wellnessgenius.co.uk/genie

Not sure where to start? Take the AI Readiness Assessment first:
👉 wellnessgenius.co.uk/ai-readiness`;
    }
    else if (text.startsWith('/help')) {
      responseText = `🆘 <b>Wellness Genius Help</b>

<b>🚀 Main Features:</b>
📊 <b>AI Readiness Score</b> - Benchmark your business
👉 wellnessgenius.co.uk/ai-readiness

🤖 <b>AI Advisor</b> - Get strategic guidance
👉 wellnessgenius.co.uk/genie

<b>Commands:</b>
/news - Latest wellness & AI news
/readiness - Take AI readiness assessment  
/tryai - Try the AI Advisor
/help - Show this help

<b>Or just chat!</b>
Ask me anything about:
• Running a gym, studio, or spa
• AI and technology for wellness
• Marketing & member retention
• Operations & efficiency

💬 Tag @Wellnessgenius_bot in groups`;
    }
    else {
      // AI response for general messages
      if (!anthropicKey) {
        responseText = "I'm currently in limited mode. Please try the commands (/news, /readiness, /tryai) or visit wellnessgenius.co.uk for full AI chat!";
      } else {
        const anthropic = new Anthropic({ apiKey: anthropicKey });
        // Clean the message of bot mentions for cleaner AI input
        const cleanedMessage = text.replace(/@wellnessgenius_bot/gi, '').trim();
        responseText = await getAIResponse(cleanedMessage, userName, anthropic);
      }
    }

    // Send the response
    const replyTo = message.chat.type !== 'private' ? messageId : undefined;
    await sendTelegramMessage(chatId, responseText, botToken, replyTo);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
