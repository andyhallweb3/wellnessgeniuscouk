import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0";
import { getCorsHeaders, corsHeaders } from "../_shared/cors.ts";

async function fetchPageContent(url: string): Promise<string> {
  try {
    // First try Firecrawl if API key is configured
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    
    if (firecrawlKey) {
      console.log("Using Firecrawl API to fetch content");
      const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          formats: ['markdown'],
          onlyMainContent: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.data?.markdown || data.markdown || '';
      }
    }

    // Fallback: Direct fetch with text extraction
    console.log("Using direct fetch for content");
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CompetitorAnalyzer/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    
    // Basic HTML to text extraction
    const textContent = html
      // Remove scripts and styles
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      // Remove HTML tags
      .replace(/<[^>]+>/g, ' ')
      // Decode HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      // Clean up whitespace
      .replace(/\s+/g, ' ')
      .trim();
    
    // Limit content length for AI processing
    return textContent.substring(0, 15000);
  } catch (error) {
    console.error("Error fetching page content:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to fetch page content: ${errorMessage}`);
  }
}

serve(async (req) => {
  const dynamicCorsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: dynamicCorsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...dynamicCorsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // Get the authenticated user
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    if (authHeader) {
      const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabase.auth.getUser(token);
      userId = userData.user?.id || null;
    }

    if (!userId) {
      throw new Error("User not authenticated");
    }

    console.log("Analyzing competitor URL for user:", userId);

    // Fetch user's business profile for context
    const supabase = createClient(supabaseUrl!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: businessProfile, error: profileError } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError || !businessProfile) {
      throw new Error("Business profile not found. Please complete onboarding first.");
    }

    console.log("Fetching competitor page content...");
    const pageContent = await fetchPageContent(url);

    if (!pageContent || pageContent.length < 100) {
      throw new Error("Could not extract meaningful content from the page");
    }

    console.log(`Extracted ${pageContent.length} characters of content`);

    // Build the analysis prompt
    const userContext = `
YOUR BUSINESS CONTEXT:
- Business Name: ${businessProfile.business_name}
- Industry: ${businessProfile.industry || 'Not specified'}
- Target Audience: ${businessProfile.target_audience || 'Not specified'}
- Current Goal: ${businessProfile.current_goal || 'Growth'}
`;

    const systemPrompt = `You are a competitive intelligence analyst for founders. Your job is to analyze competitor landing pages and provide actionable differentiation strategies.

You MUST respond with ONLY valid JSON matching this exact schema:

{
  "competitor_summary": "Brief 2-sentence summary of what this competitor does and their main value proposition",
  "strengths_identified": ["string - competitor strength 1", "string - competitor strength 2", "string - competitor strength 3"],
  "differentiation_strategies": [
    {
      "strategy": "string - specific differentiation approach",
      "why_it_works": "string - why this will help the user stand out",
      "messaging_example": "string - example copy or headline they could use"
    }
  ],
  "competitive_gaps": ["string - gap or weakness in competitor's positioning 1", "string - gap 2"],
  "action_items": ["string - immediate action 1", "string - immediate action 2", "string - immediate action 3"]
}

Be specific and actionable. Reference the user's actual business context. Provide 3 differentiation strategies.`;

    const userPrompt = `${userContext}

COMPETITOR PAGE CONTENT:
${pageContent}

Analyze this competitor landing page content. Compare it to my business context above. Output 3 specific ways I can differentiate my messaging, identify competitive gaps, and suggest immediate action items.`;

    console.log("Calling Gemini for competitor analysis...");

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent(`${systemPrompt}\n\n---\n\n${userPrompt}`);
    const response = result.response;
    const content = response.text();

    if (!content) {
      throw new Error("No content in Gemini response");
    }

    console.log("Competitor analysis complete");

    const parsedData = JSON.parse(content);
    parsedData.analyzed_url = url;
    parsedData.analyzed_at = new Date().toISOString();

    return new Response(JSON.stringify(parsedData), {
      headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in analyze-url function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }), {
      status: 500,
      headers: { ...dynamicCorsHeaders, "Content-Type": "application/json" },
    });
  }
});
