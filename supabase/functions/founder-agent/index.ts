import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Base system prompt template - will be customized per user
const getSystemPrompt = (businessProfile: any) => {
  const businessName = businessProfile?.business_name || 'your company';
  const industry = businessProfile?.industry || 'technology';
  const targetAudience = businessProfile?.target_audience || 'business customers';
  const currentGoal = businessProfile?.current_goal || 'growth and success';

  return `You are a Strategic Founder Agent for ${businessName}, a company in the ${industry} space. Their target audience is ${targetAudience}. Their current goal is ${currentGoal}.

You are their personal AI strategic advisor. Analyze the provided business context and return strategic insights tailored to their specific situation.

You MUST respond with ONLY valid JSON matching this exact schema:

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

Focus on actionable, founder-relevant insights specific to ${businessName}. Be direct and specific to their ${industry} context and their goal of ${currentGoal}.`;
};

// Function to fetch user-specific data from the database
async function fetchUserData(userId: string): Promise<{ 
  businessProfile: any;
  stats: string; 
  journalEntries: string 
}> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials");
    return { 
      businessProfile: null,
      stats: "Unable to fetch live data - missing credentials.", 
      journalEntries: "" 
    };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 1. Fetch user's business profile
    const { data: businessProfile, error: profileError } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching business profile:", profileError);
    }

    console.log("Fetched business profile:", businessProfile?.business_name);

    // 2. Fetch user's recent journal entries
    const { data: journalEntries, error: journalError } = await supabase
      .from('founder_journal')
      .select('content, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3);

    if (journalError) {
      console.error("Error fetching journal entries:", journalError);
    }

    // Build journal context
    const journalContext = journalEntries?.length 
      ? journalEntries.map((entry) => 
          `[${new Date(entry.created_at).toLocaleDateString()}]: ${entry.content}`
        ).join('\n\n')
      : '';

    // 3. Build generic stats (can be customized per user later)
    const stats = `
BUSINESS CONTEXT:
- Business Name: ${businessProfile?.business_name || 'Not set'}
- Industry: ${businessProfile?.industry || 'Not set'}
- Target Audience: ${businessProfile?.target_audience || 'Not set'}
- Current Goal: ${businessProfile?.current_goal || 'Not set'}
- Profile Last Updated: ${businessProfile?.updated_at || 'Never'}
`.trim();

    console.log("Fetched user data successfully");
    return { businessProfile, stats, journalEntries: journalContext };

  } catch (error) {
    console.error("Error fetching user data:", error);
    return { 
      businessProfile: null,
      stats: "Error fetching data from database.", 
      journalEntries: "" 
    };
  }
}

// Helper to fetch image as base64 for Gemini
async function fetchImageAsBase64(imageUrl: string): Promise<{ data: string; mimeType: string } | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error("Failed to fetch image:", response.status);
      return null;
    }
    
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    return {
      data: base64,
      mimeType: contentType,
    };
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessContext, imageUrl } = await req.json();
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

    console.log("Authenticated user:", userId);

    // Fetch user-specific data from the database
    console.log("Fetching user data from database...");
    const { businessProfile, stats, journalEntries } = await fetchUserData(userId);

    if (!businessProfile) {
      throw new Error("Business profile not found. Please complete onboarding.");
    }

    // Build the dynamic system prompt based on user's business profile
    let systemPrompt = getSystemPrompt(businessProfile);

    // If image is provided, add image analysis instructions
    if (imageUrl) {
      systemPrompt += `

IMPORTANT: You have been provided an image of the founder's work (website screenshot, ad creative, or marketing material). 

Critique it RUTHLESSLY for:
1. CLARITY - Is the value proposition immediately clear? Can a stranger understand what this does in 3 seconds?
2. CONVERSION - Are there clear CTAs? Is the user journey obvious? What's blocking someone from taking action?
3. TRUST - Does it look professional? Are there trust signals (testimonials, logos, guarantees)?

Add these specific critiques to the 'signals' section of the JSON output with direction "neutral" and detailed meaning explaining the specific issues found.`;
    }

    // Build the user message with real data and founder context
    let userMessage = `Here is my current business situation:

${stats}`;

    // Add founder journal entries if available
    if (journalEntries) {
      userMessage += `

MY RECENT THOUGHTS/CONTEXT:
${journalEntries}

Use this context to refine the priorities and advice. These notes reveal what's on my mind right now.`;
    }

    // Add any additional business context
    if (businessContext) {
      userMessage += `

ADDITIONAL CONTEXT:
${JSON.stringify(businessContext, null, 2)}`;
    }

    if (imageUrl) {
      userMessage += `

I've attached an image of my website/ad/marketing material. Please analyze it and add critiques to the signals section.`;
    }

    userMessage += `

Based on my specific business context and goals, generate my personalized founder brief with actionable insights.`;

    console.log("Calling Google Gemini for personalized founder insights...");
    console.log("Image analysis requested:", !!imageUrl);

    // Initialize the Google Generative AI client
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    // Build the content parts
    const parts: any[] = [{ text: `${systemPrompt}\n\n---\n\n${userMessage}` }];

    // If image URL is provided, fetch and add to prompt
    if (imageUrl) {
      console.log("Fetching image for analysis:", imageUrl);
      const imageData = await fetchImageAsBase64(imageUrl);
      
      if (imageData) {
        parts.push({
          inlineData: {
            mimeType: imageData.mimeType,
            data: imageData.data,
          },
        });
        console.log("Image successfully added to prompt");
      } else {
        console.warn("Could not fetch image, proceeding without image analysis");
      }
    }

    const result = await model.generateContent(parts);
    const response = result.response;
    const content = response.text();

    if (!content) {
      throw new Error("No content in Gemini response");
    }

    console.log("Raw Gemini response:", content.substring(0, 200));

    // Parse the JSON response
    let parsedData;
    try {
      parsedData = JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", parseError);
      console.error("Content was:", content);
      throw new Error("Gemini response was not valid JSON");
    }

    // Ensure meta.generated_at is set
    if (!parsedData.meta) {
      parsedData.meta = {};
    }
    parsedData.meta.generated_at = new Date().toISOString();
    parsedData.meta.business_name = businessProfile.business_name;
    parsedData.meta.image_analyzed = !!imageUrl;

    console.log("Successfully generated personalized founder insights for", businessProfile.business_name);

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
