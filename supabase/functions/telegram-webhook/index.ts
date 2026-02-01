import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.39.0';
import Stripe from 'https://esm.sh/stripe@18.5.0';

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

interface TelegramUser {
  id: string;
  telegram_user_id: number;
  user_id: string | null;
  daily_messages_used: number;
  daily_messages_reset_at: string;
}

interface WebSearchResult {
  url: string;
  title: string;
  description: string;
  content: string;
}

interface WebSearchResponse {
  success: boolean;
  type: string;
  results?: WebSearchResult[];
  content?: string;
  error?: string;
}

const FREE_DAILY_LIMIT = 3;

// System prompt for FREE users - push to CTAs
const FREE_SYSTEM_PROMPT = `You are Wellness Genius, the AI advisor for wellness business operators (gym owners, studio managers, spa directors, corporate wellness leads).

Your role:
- Provide practical, actionable advice on running wellness businesses
- Share insights on AI adoption, technology, and industry trends
- Help with operational challenges, marketing, retention, and growth
- Be concise, friendly, and professional

IMPORTANT - Always end your responses with a relevant CTA:
- For AI/technology questions → suggest the AI Readiness Assessment: wellnessgenius.co.uk/ai-readiness
- For strategic/business questions → suggest subscribing for premium commands
- For general questions → mention both options

Keep responses brief (2-3 paragraphs max). Use emojis sparingly for warmth.`;

// System prompt for PREMIUM users - self-sufficient, no website pushes except readiness
const PREMIUM_CHAT_PROMPT = `You are Wellness Genius Premium, the AI advisor for wellness business operators.

Your role:
- Provide practical, actionable advice on running wellness businesses
- Share insights on AI adoption, technology, and industry trends  
- Help with operational challenges, marketing, retention, and growth
- Be thorough but focused

The user is a premium subscriber with full access to all commands:
- /strategy [question] - for deep strategic analysis
- /research [topic] - for market intelligence with live web research
- /benchmark - for industry benchmarks

When relevant, remind them of the FREE AI Readiness Assessment at wellnessgenius.co.uk/ai-readiness - this helps personalise your future responses.

Keep responses helpful and complete. No need to push to the website - you can handle their needs right here in Telegram.`;

// Premium deep analysis prompt for /strategy, /research, /benchmark
const PREMIUM_STRATEGY_PROMPT = `You are Wellness Genius Premium, providing deep strategic intelligence for wellness business operators.

Your role:
- Provide comprehensive, strategic analysis
- Reference industry benchmarks (IHRSA, Les Mills, ABC Fitness data where relevant)
- Give actionable, specific recommendations
- Think like a board advisor, not a chatbot

Be thorough but structured. Use bullet points and clear sections.

When relevant, mention that the FREE AI Readiness Assessment at wellnessgenius.co.uk/ai-readiness can help personalise future advice.`;

// Premium research prompt with live data
const PREMIUM_RESEARCH_PROMPT = `You are Wellness Genius Premium Research Assistant, providing deep market intelligence with live web data.

You have access to LIVE WEB RESEARCH DATA provided below. Use this real-time information to:
- Provide current, accurate market insights
- Reference specific companies, products, and trends found in the research
- Give actionable recommendations based on actual market conditions
- Cite sources when referencing specific data points

Be thorough but structured. Use bullet points and clear sections. Always indicate when information comes from live research vs general knowledge.`;

// Use any type since telegram_users table is new and not in generated types yet
type SupabaseClientAny = SupabaseClient<any, any, any>;

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

async function getOrCreateTelegramUser(supabase: SupabaseClientAny, telegramUserId: number, firstName: string, username?: string): Promise<TelegramUser> {
  // Check if user exists
  const { data: existing } = await supabase
    .from('telegram_users')
    .select('*')
    .eq('telegram_user_id', telegramUserId)
    .single();

  if (existing) {
    // Check if we need to reset daily messages (new day)
    const resetAt = new Date(existing.daily_messages_reset_at);
    const now = new Date();
    if (now.toDateString() !== resetAt.toDateString()) {
      const { data: updated } = await supabase
        .from('telegram_users')
        .update({ 
          daily_messages_used: 0, 
          daily_messages_reset_at: now.toISOString() 
        })
        .eq('id', existing.id)
        .select()
        .single();
      return updated || existing;
    }
    return existing;
  }

  // Create new user
  const { data: newUser } = await supabase
    .from('telegram_users')
    .insert({
      telegram_user_id: telegramUserId,
      telegram_first_name: firstName,
      telegram_username: username,
      daily_messages_used: 0,
      daily_messages_reset_at: new Date().toISOString()
    })
    .select()
    .single();

  return newUser!;
}

async function incrementMessageCount(supabase: SupabaseClientAny, telegramUserId: number): Promise<void> {
  const { data } = await supabase
    .from('telegram_users')
    .select('daily_messages_used')
    .eq('telegram_user_id', telegramUserId)
    .single();
  
  if (data) {
    await supabase
      .from('telegram_users')
      .update({ daily_messages_used: data.daily_messages_used + 1 })
      .eq('telegram_user_id', telegramUserId);
  }
}

async function checkUserSubscription(supabase: SupabaseClientAny, userId: string): Promise<boolean> {
  // Check subscriptions table
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (sub) return true;

  // Also check via Stripe directly for coach subscription
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeKey) return false;

  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single();

  if (!profile?.email) return false;

  try {
    const stripe = new Stripe(stripeKey, { apiVersion: '2025-08-27.basil' });
    const customers = await stripe.customers.list({ email: profile.email, limit: 1 });
    
    if (customers.data.length === 0) return false;

    const subscriptions = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: 'active',
      limit: 1
    });

    return subscriptions.data.length > 0;
  } catch (e) {
    console.error('Stripe check error:', e);
    return false;
  }
}

async function generateLinkCode(supabase: SupabaseClientAny, telegramUserId: number): Promise<string> {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await supabase
    .from('telegram_users')
    .update({ 
      link_code: code, 
      link_code_expires_at: expiresAt.toISOString() 
    })
    .eq('telegram_user_id', telegramUserId);

  return code;
}

async function getLatestNews(supabase: SupabaseClientAny): Promise<string> {
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
    `${i + 1}. ${item.title}\n<i>${item.source_name}</i>\n🔗 ${item.source_url}`
  ).join('\n\n');
  
  const footer = `\n\n━━━━━━━━━━━━━━━━━━━━━
📊 AI Readiness: wellnessgenius.co.uk/ai-readiness
🤖 AI Advisor: wellnessgenius.co.uk/genie`;
  
  return header + newsItems + footer;
}

// Web search using Firecrawl
async function performWebSearch(query: string): Promise<WebSearchResponse> {
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!apiKey) {
    console.log('[TELEGRAM] FIRECRAWL_API_KEY not configured');
    return { success: false, type: 'error', error: 'Web search not configured' };
  }

  try {
    console.log(`[TELEGRAM] Web search: ${query}`);
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit: 5,
        scrapeOptions: {
          formats: ['markdown'],
          onlyMainContent: true,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[TELEGRAM] Web search error:', data);
      return { success: false, type: 'error', error: data.error || 'Search failed' };
    }

    const results = (data.data || []).map((item: any) => ({
      url: item.url,
      title: item.title || item.metadata?.title || 'Untitled',
      description: item.description || item.metadata?.description || '',
      content: item.markdown?.slice(0, 2000) || '',
    }));

    console.log(`[TELEGRAM] Web search returned ${results.length} results`);
    return { success: true, type: 'search', results };
  } catch (error) {
    console.error('[TELEGRAM] Web search exception:', error);
    return { success: false, type: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Scrape a specific URL
async function scrapeUrl(url: string): Promise<WebSearchResponse> {
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!apiKey) {
    return { success: false, type: 'error', error: 'Web scraping not configured' };
  }

  try {
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log(`[TELEGRAM] Scraping URL: ${formattedUrl}`);
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['markdown'],
        onlyMainContent: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[TELEGRAM] Scrape error:', data);
      return { success: false, type: 'error', error: data.error || 'Scrape failed' };
    }

    console.log('[TELEGRAM] Scrape successful');
    return {
      success: true,
      type: 'scrape',
      content: data.data?.markdown || data.markdown || '',
    };
  } catch (error) {
    console.error('[TELEGRAM] Scrape exception:', error);
    return { success: false, type: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Detect if message needs web research
function needsWebResearch(message: string): { needsSearch: boolean; needsScrape: boolean; url?: string; searchQuery?: string } {
  const lowerMessage = message.toLowerCase();
  
  // Check for URL patterns
  const urlMatch = message.match(/https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|co\.uk|org|net|io)[^\s]*/i);
  if (urlMatch) {
    return { needsSearch: false, needsScrape: true, url: urlMatch[0] };
  }

  // Keywords that suggest need for live data
  const liveDataKeywords = [
    'latest', 'current', 'recent', 'today', 'now', '2026', '2025',
    'news', 'trends', 'what is', 'who is', 'where is',
    'competitor', 'company', 'business', 'brand',
    'google maps', 'reviews', 'ratings', 'location',
    'pricing', 'cost', 'price',
    'research', 'find', 'search', 'look up', 'check'
  ];

  for (const keyword of liveDataKeywords) {
    if (lowerMessage.includes(keyword)) {
      return { needsSearch: true, needsScrape: false, searchQuery: message };
    }
  }

  return { needsSearch: false, needsScrape: false };
}

async function getAIResponse(
  message: string, 
  userName: string, 
  anthropic: Anthropic, 
  isPremiumCommand: boolean = false, 
  isPremiumUser: boolean = false,
  webContext?: string
): Promise<string> {
  try {
    // Use strategy prompt for premium commands, chat prompts for general chat
    let systemPrompt = FREE_SYSTEM_PROMPT;
    if (webContext) {
      systemPrompt = PREMIUM_RESEARCH_PROMPT;
    } else if (isPremiumCommand) {
      systemPrompt = PREMIUM_STRATEGY_PROMPT;
    } else if (isPremiumUser) {
      systemPrompt = PREMIUM_CHAT_PROMPT;
    }

    let userContent = `[From: ${userName}]\n${message}`;
    if (webContext) {
      userContent = `[From: ${userName}]\n\n## LIVE WEB RESEARCH DATA\n${webContext}\n\n## USER QUERY\n${message}`;
    }

    const response = await anthropic.messages.create({
      model: isPremiumCommand ? 'claude-3-opus-20240229' : 'claude-sonnet-4-20250514',
      max_tokens: isPremiumCommand || webContext ? 1500 : 500,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: userContent
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

function getDailyLimitMessage(used: number): string {
  return `⚠️ You've used ${used}/${FREE_DAILY_LIMIT} free messages today.

<b>Want more?</b>
🔗 /link - Connect your Wellness Genius account
📊 /readiness - Take the AI Readiness Assessment
🤖 /tryai - Try the full AI Advisor

Subscribers get unlimited Telegram access + premium commands!`;
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
    const telegramUserId = message.from.id;

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get or create telegram user record
    const telegramUser = await getOrCreateTelegramUser(
      supabase, 
      telegramUserId, 
      userName, 
      message.from.username
    );

    const isLinked = !!telegramUser.user_id;
    const isSubscribed = isLinked ? await checkUserSubscription(supabase, telegramUser.user_id!) : false;

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

<b>Free commands:</b>
/news - Latest industry news
/readiness - Take the AI assessment
/tryai - Try the full AI Advisor
/link - Connect your account for premium access

<b>Premium commands</b> (subscribers only):
/strategy [question] - Deep strategic analysis
/research [topic] - Market & competitor research
/benchmark - Industry benchmarks for your business

${isLinked ? '✅ Account linked!' : '🔗 Link your account with /link for premium features'}

Or just ask me anything! 💪`;
    } 
    else if (text.startsWith('/link')) {
      if (isLinked) {
        responseText = `✅ Your Telegram is already linked to your Wellness Genius account!

${isSubscribed ? '🌟 You have an active subscription - all premium commands unlocked!' : '⚠️ No active subscription found. Subscribe at wellnessgenius.co.uk/genie for premium commands.'}`;
      } else {
        const linkCode = await generateLinkCode(supabase, telegramUserId);
        responseText = `🔗 <b>Link Your Account</b>

To connect your Telegram to your Wellness Genius account:

1. Go to wellnessgenius.co.uk/hub
2. Navigate to Settings → Telegram
3. Enter this code: <code>${linkCode}</code>

⏰ This code expires in 10 minutes.

Don't have an account yet?
👉 wellnessgenius.co.uk/auth to sign up!`;
      }
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
    else if (text.startsWith('/strategy')) {
      if (!isSubscribed) {
        responseText = `🔒 <b>/strategy is a Premium Command</b>

This command provides deep strategic analysis using our most powerful AI model.

To unlock:
1. Subscribe at wellnessgenius.co.uk/genie
2. Link your account with /link

<b>Or try our free options:</b>
📊 /readiness - AI Readiness Assessment
🤖 /tryai - Try the AI Advisor online`;
      } else {
        const query = text.replace('/strategy', '').trim();
        if (!query) {
          responseText = `📈 <b>/strategy - Strategic Analysis</b>

Usage: /strategy [your question]

Examples:
• /strategy How should I price a new personal training tier?
• /strategy What's the best approach to reduce member churn?
• /strategy Should I invest in AI-powered equipment?`;
        } else if (anthropicKey) {
          const anthropic = new Anthropic({ apiKey: anthropicKey });
          responseText = await getAIResponse(query, userName, anthropic, true, true);
        } else {
          responseText = "Premium AI features are temporarily unavailable. Please try again later.";
        }
      }
    }
    else if (text.startsWith('/research')) {
      if (!isSubscribed) {
        responseText = `🔒 <b>/research is a Premium Command</b>

This command provides deep market and competitor research with <b>live web data</b>.

To unlock:
1. Subscribe at wellnessgenius.co.uk/genie
2. Link your account with /link

<b>Or try our free options:</b>
📊 /readiness - AI Readiness Assessment
🤖 /tryai - Try the AI Advisor online`;
      } else {
        const topic = text.replace('/research', '').trim();
        if (!topic) {
          responseText = `🔍 <b>/research - Live Market Intelligence</b>

Usage: /research [topic or URL]

<b>Web Search Examples:</b>
• /research AI personal training trends 2026
• /research boutique fitness market UK
• /research Les Mills competitor analysis

<b>URL Analysis:</b>
• /research https://competitor-gym.com
• /research puregym.com pricing

🌐 This command uses <b>live web research</b> to provide current data!`;
        } else if (anthropicKey) {
          const anthropic = new Anthropic({ apiKey: anthropicKey });
          
          // Check if it's a URL or search query
          const { needsScrape, url } = needsWebResearch(topic);
          let webContext = '';
          
          if (needsScrape && url) {
            // Scrape specific URL
            const scrapeResult = await scrapeUrl(url);
            if (scrapeResult.success && scrapeResult.content) {
              webContext = `### Content from ${url}\n${scrapeResult.content.slice(0, 4000)}`;
            }
          } else {
            // Web search for the topic
            const searchQuery = `wellness fitness gym ${topic}`;
            const searchResult = await performWebSearch(searchQuery);
            if (searchResult.success && searchResult.results && searchResult.results.length > 0) {
              webContext = searchResult.results.map(r => 
                `### ${r.title}\nSource: ${r.url}\n${r.description}\n${r.content.slice(0, 1000)}`
              ).join('\n\n---\n\n');
            }
          }

          const researchPrompt = `Provide comprehensive market research on: ${topic}

Include:
- Current market size and growth trends
- Key players and competitors
- Emerging trends and opportunities
- Potential risks and challenges
- Strategic recommendations for a wellness business operator`;

          if (webContext) {
            responseText = await getAIResponse(researchPrompt, userName, anthropic, true, true, webContext);
            responseText = '🌐 <i>Live research data included</i>\n\n' + responseText;
          } else {
            responseText = await getAIResponse(researchPrompt, userName, anthropic, true, true);
          }
        } else {
          responseText = "Premium AI features are temporarily unavailable. Please try again later.";
        }
      }
    }
    else if (text.startsWith('/benchmark')) {
      if (!isSubscribed) {
        responseText = `🔒 <b>/benchmark is a Premium Command</b>

This command provides industry benchmark comparisons for your business.

To unlock:
1. Subscribe at wellnessgenius.co.uk/genie
2. Link your account with /link

<b>Or try our free options:</b>
📊 /readiness - AI Readiness Assessment
🤖 /tryai - Try the AI Advisor online`;
      } else if (anthropicKey) {
        const anthropic = new Anthropic({ apiKey: anthropicKey });
        const benchmarkPrompt = `Provide key industry benchmarks for wellness businesses, covering:

1. Member retention rates (by business type)
2. Revenue per member metrics
3. Staff-to-member ratios
4. Marketing spend as % of revenue
5. Technology investment trends
6. AI adoption rates in the industry

Reference IHRSA, Les Mills, and ABC Fitness data where applicable. Format as a clear, actionable benchmark report.`;
        responseText = await getAIResponse(benchmarkPrompt, userName, anthropic, true, true);
      } else {
        responseText = "Premium AI features are temporarily unavailable. Please try again later.";
      }
    }
    else if (text.startsWith('/help')) {
      responseText = `🆘 <b>Wellness Genius Help</b>

<b>🚀 Main Features:</b>
📊 <b>AI Readiness Score</b> - Benchmark your business
👉 wellnessgenius.co.uk/ai-readiness

🤖 <b>AI Advisor</b> - Get strategic guidance
👉 wellnessgenius.co.uk/genie

<b>Free Commands:</b>
/news - Latest wellness & AI news
/readiness - Take AI readiness assessment  
/tryai - Try the AI Advisor
/link - Connect your Wellness Genius account
/help - Show this help

<b>Premium Commands</b> (subscribers only):
/strategy [question] - Deep strategic analysis
/research [topic] - Market & competitor research
/benchmark - Industry benchmarks

<b>Or just chat!</b>
Ask me anything about:
• Running a gym, studio, or spa
• AI and technology for wellness
• Marketing & member retention
• Operations & efficiency

${isLinked ? (isSubscribed ? '🌟 Premium active!' : '⚠️ Link active, subscribe for premium') : '🔗 /link to unlock premium'}

💬 Tag @Wellnessgenius_bot in groups`;
    }
    else {
      // General chat - check limits for non-subscribers
      if (!isSubscribed) {
        if (telegramUser.daily_messages_used >= FREE_DAILY_LIMIT) {
          responseText = getDailyLimitMessage(telegramUser.daily_messages_used);
        } else {
          // AI response for general messages
          if (!anthropicKey) {
            responseText = "I'm currently in limited mode. Please try the commands (/news, /readiness, /tryai) or visit wellnessgenius.co.uk for full AI chat!";
          } else {
            const anthropic = new Anthropic({ apiKey: anthropicKey });
            // Clean the message of bot mentions for cleaner AI input
            const cleanedMessage = text.replace(/@wellnessgenius_bot/gi, '').trim();
            responseText = await getAIResponse(cleanedMessage, userName, anthropic, false, false);
            
            // Increment message count
            await incrementMessageCount(supabase, telegramUserId);
            
            // Add remaining messages note
            const remaining = FREE_DAILY_LIMIT - telegramUser.daily_messages_used - 1;
            if (remaining <= 1) {
              responseText += `\n\n💬 ${remaining} free message${remaining === 1 ? '' : 's'} remaining today. /link to unlock unlimited!`;
            }
          }
        }
      } else {
        // Subscriber - unlimited chat with optional web research
        if (!anthropicKey) {
          responseText = "I'm currently in limited mode. Please try again later or visit wellnessgenius.co.uk/genie";
        } else {
          const anthropic = new Anthropic({ apiKey: anthropicKey });
          const cleanedMessage = text.replace(/@wellnessgenius_bot/gi, '').trim();
          
          // Check if message needs web research for premium users
          const { needsSearch, needsScrape, url, searchQuery } = needsWebResearch(cleanedMessage);
          let webContext = '';
          
          if (needsScrape && url) {
            const scrapeResult = await scrapeUrl(url);
            if (scrapeResult.success && scrapeResult.content) {
              webContext = `### Content from ${url}\n${scrapeResult.content.slice(0, 4000)}`;
            }
          } else if (needsSearch && searchQuery) {
            const searchResult = await performWebSearch(searchQuery);
            if (searchResult.success && searchResult.results && searchResult.results.length > 0) {
              webContext = searchResult.results.slice(0, 3).map(r => 
                `### ${r.title}\nSource: ${r.url}\n${r.content.slice(0, 800)}`
              ).join('\n\n---\n\n');
            }
          }
          
          if (webContext) {
            responseText = await getAIResponse(cleanedMessage, userName, anthropic, false, true, webContext);
            responseText = '🌐 <i>Live data</i>\n\n' + responseText;
          } else {
            responseText = await getAIResponse(cleanedMessage, userName, anthropic, false, true);
          }
        }
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
