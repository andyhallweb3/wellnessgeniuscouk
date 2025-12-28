import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// System prompt placeholder - will be replaced with full prompt later
const SYSTEM_PROMPT = `You are an AI advisor for a wellness technology founder. Analyze the provided business context and return strategic insights.

You MUST respond with ONLY valid JSON matching this exact schema - no markdown, no explanation, just the JSON object:

{
  "founder_focus": [
    {
      "priority": "string - the priority item",
      "why_now": "string - why this is urgent now",
      "if_ignored": "string - consequence of ignoring",
      "next_step": "string - concrete next action"
    }
  ],
  "signals": [
    {
      "signal": "string - the metric or trend",
      "direction": "up|down|neutral",
      "meaning": "string - what this means for the business"
    }
  ],
  "decisions_pending": [
    {
      "decision": "string - what needs deciding",
      "context": "string - background info",
      "recommended_option": "string - suggested choice",
      "confidence": "high|medium|low",
      "tradeoffs": "string - pros and cons"
    }
  ],
  "risks_and_distractions": [
    {
      "item": "string - the risk or distraction",
      "reason": "string - why it's risky or distracting"
    }
  ],
  "narrative_suggestions": [
    {
      "angle": "string - content angle",
      "why_it_matters": "string - relevance",
      "suggested_channel": "string - where to publish"
    }
  ],
  "meta": {
    "generated_at": "ISO timestamp",
    "confidence_note": "string - overall confidence assessment"
  }
}

Focus on actionable, founder-relevant insights. Be direct and specific.`;

// Function to fetch real data from the database
async function fetchLiveData(): Promise<{ stats: string; journalEntries: string }> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials");
    return { stats: "Unable to fetch live data - missing credentials.", journalEntries: "" };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 1. Fetch total count of profiles (users)
    const { count: profileCount, error: profileError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (profileError) {
      console.error("Error fetching profiles count:", profileError);
    }

    // 2. Fetch total newsletter subscribers
    const { count: subscriberCount, error: subError } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (subError) {
      console.error("Error fetching subscriber count:", subError);
    }

    // 3. Fetch last 5 newsletter subscribers as recent activity
    const { data: recentSubscribers, error: recentSubError } = await supabase
      .from('newsletter_subscribers')
      .select('email, subscribed_at, source')
      .order('subscribed_at', { ascending: false })
      .limit(5);

    if (recentSubError) {
      console.error("Error fetching recent subscribers:", recentSubError);
    }

    // 4. Fetch recent articles count
    const { count: articleCount, error: articleError } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('processed', true);

    if (articleError) {
      console.error("Error fetching article count:", articleError);
    }

    // 5. Fetch pending decisions count
    const { count: pendingDecisions, error: decisionError } = await supabase
      .from('genie_decisions')
      .select('*', { count: 'exact', head: true })
      .is('outcome', null);

    if (decisionError) {
      console.error("Error fetching decisions count:", decisionError);
    }

    // 6. Fetch recent product downloads
    const { data: recentDownloads, error: downloadError } = await supabase
      .from('product_downloads')
      .select('product_name, email, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (downloadError) {
      console.error("Error fetching downloads:", downloadError);
    }

    // 7. Fetch last 3 founder journal entries
    const { data: journalEntries, error: journalError } = await supabase
      .from('founder_journal')
      .select('content, created_at')
      .order('created_at', { ascending: false })
      .limit(3);

    if (journalError) {
      console.error("Error fetching journal entries:", journalError);
    }

    // Build the current_stats string
    const recentActivityList = recentSubscribers?.map(sub => 
      `${sub.email.split('@')[0]}@... subscribed via ${sub.source || 'website'}`
    ).join('; ') || 'No recent subscribers';

    const recentDownloadList = recentDownloads?.map(dl => 
      `${dl.product_name} downloaded`
    ).join('; ') || 'No recent downloads';

    const stats = `
LIVE DATABASE SNAPSHOT (${new Date().toISOString()}):
- Total Registered Users: ${profileCount || 0}
- Active Newsletter Subscribers: ${subscriberCount || 0}
- Published Articles: ${articleCount || 0}
- Pending Decisions (no outcome): ${pendingDecisions || 0}

RECENT ACTIVITY (Last 5 Subscribers):
${recentActivityList}

RECENT DOWNLOADS (Last 5):
${recentDownloadList}
`.trim();

    // Build journal context
    const journalContext = journalEntries?.length 
      ? journalEntries.map((entry, idx) => 
          `[${new Date(entry.created_at).toLocaleDateString()}]: ${entry.content}`
        ).join('\n\n')
      : '';

    console.log("Fetched live stats and journal entries");
    return { stats, journalEntries: journalContext };

  } catch (error) {
    console.error("Error fetching live data:", error);
    return { stats: "Error fetching live data from database.", journalEntries: "" };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch live data from the database
    console.log("Fetching live data from database...");
    const { stats, journalEntries } = await fetchLiveData();

    // Build the user message with real data and founder context
    let userMessage = `Here is the live data from the database:

${stats}`;

    // Add founder journal entries if available
    if (journalEntries) {
      userMessage += `

FOUNDER'S RECENT THOUGHTS/CONTEXT:
${journalEntries}

Use this context to refine the priorities and advice. The founder's notes reveal what's on their mind right now.`;
    }

    // Add any additional business context
    if (businessContext) {
      userMessage += `

ADDITIONAL CONTEXT:
${JSON.stringify(businessContext, null, 2)}`;
    }

    userMessage += `

Based on this real data and founder context, generate the founder brief with actionable insights for a wellness technology B2B company.`;

    console.log("Calling Lovable AI Gateway for founder insights...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("Raw AI response:", content.substring(0, 200));

    // Parse the JSON response - handle potential markdown wrapping
    let parsedData;
    try {
      // Remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      cleanContent = cleanContent.trim();
      
      parsedData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      console.error("Content was:", content);
      throw new Error("AI response was not valid JSON");
    }

    // Ensure meta.generated_at is set
    if (!parsedData.meta) {
      parsedData.meta = {};
    }
    parsedData.meta.generated_at = new Date().toISOString();

    console.log("Successfully generated founder insights with live data");

    return new Response(JSON.stringify(parsedData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in founder-agent function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
