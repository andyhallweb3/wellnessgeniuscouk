import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, corsHeaders } from "../_shared/cors.ts";

// Perspective mode configurations
const PERSPECTIVE_MODES = {
  ceo: {
    name: "CEO",
    instructions: "You are the Strategic CEO Advisor. Balance all aspects of the business - growth, operations, team, finance, and long-term vision. Provide holistic leadership guidance."
  },
  cmo: {
    name: "CMO",
    instructions: "You are a Growth-Obsessed CMO Advisor. Focus ENTIRELY on growth, customer acquisition cost (CAC), viral loops, brand narrative, and marketing leverage. Ignore technical debt and operational concerns - that's not your domain. Push aggressive growth strategies and creative marketing angles. Every recommendation should drive awareness, conversion, or retention."
  },
  cfo: {
    name: "CFO",
    instructions: "You are a Financially Rigorous CFO Advisor. Focus ENTIRELY on cash flow, burn rate, financial runway, unit economics, and capital allocation. Be conservative with spending recommendations. Scrutinize every expense and investment for ROI. Prioritize extending runway, improving margins, and building financial resilience. Flag cash flow risks early and recommend cost optimization strategies."
  },
  cto: {
    name: "CTO",
    instructions: "You are a Technically Strategic CTO Advisor. Focus ENTIRELY on technical debt, system architecture, engineering capacity, and technology choices. Evaluate build vs buy decisions, scalability concerns, and technical risk. Prioritize developer productivity, system reliability, and sustainable technical foundations. Flag architectural decisions that could become costly to reverse."
  },
  investor: {
    name: "Investor",
    instructions: "You are a Skeptical Investor Advisor. Focus on ROI, unit economics, scalability, and defensibility. Be skeptical and risk-averse. Question assumptions, probe for weaknesses, and demand evidence. Prioritize capital efficiency, market size validation, and competitive moats. Flag anything that could scare away serious investors."
  }
};

// Build blended system prompt for multiple perspectives
const getSystemPrompt = (businessProfile: any, perspectives: string[] = ['ceo']) => {
  const businessName = businessProfile?.business_name || 'your company';
  const industry = businessProfile?.industry || 'technology';
  const targetAudience = businessProfile?.target_audience || 'business customers';
  const currentGoal = businessProfile?.current_goal || 'growth and success';
  
  // Get all selected perspective modes
  const selectedModes = perspectives
    .filter(p => PERSPECTIVE_MODES[p as keyof typeof PERSPECTIVE_MODES])
    .map(p => PERSPECTIVE_MODES[p as keyof typeof PERSPECTIVE_MODES]);
  
  // If no valid perspectives, default to CEO
  if (selectedModes.length === 0) {
    selectedModes.push(PERSPECTIVE_MODES.ceo);
  }
  
  // Build blended instructions
  let perspectiveInstructions: string;
  let perspectiveLabel: string;
  
  if (selectedModes.length === 1) {
    perspectiveInstructions = selectedModes[0].instructions;
    perspectiveLabel = selectedModes[0].name;
  } else {
    // Blend multiple perspectives
    const names = selectedModes.map(m => m.name).join(' + ');
    const blendedInstructions = selectedModes
      .map(m => `**${m.name} Lens**: ${m.instructions}`)
      .join('\n\n');
    
    perspectiveInstructions = `You are a Multi-Perspective Strategic Advisor blending ${names} viewpoints. You must consider insights from ALL of these perspectives and synthesize them into cohesive recommendations:\n\n${blendedInstructions}\n\nWhen perspectives conflict, acknowledge the tension and provide balanced guidance that weighs each viewpoint appropriately.`;
    perspectiveLabel = `Blended (${names})`;
  }

  return `${perspectiveInstructions}

You are advising ${businessName}, a company in the ${industry} space. Their target audience is ${targetAudience}. Their current goal is ${currentGoal}.

CURRENT PERSPECTIVE: ${perspectiveLabel}

Analyze the provided business context and return strategic insights tailored to their specific situation FROM YOUR ${perspectiveLabel} PERSPECTIVE.

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
    "confidence_note": "string - overall confidence assessment",
    "perspective": "${perspectiveLabel}"
  }
}

Focus on actionable insights specific to ${businessName} FROM YOUR ${perspectiveLabel} LENS. Be direct and specific to their ${industry} context and their goal of ${currentGoal}.`;
};

// Function to fetch user-specific data from the database
async function fetchUserData(
  userId: string,
  currentContext: string | null
): Promise<{ 
  businessProfile: any;
  stats: string; 
  journalEntries: string;
  ragUsed: boolean;
}> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials");
    return { 
      businessProfile: null,
      stats: "Unable to fetch live data - missing credentials.", 
      journalEntries: "",
      ragUsed: false
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

    // 2. Fetch recent journal entries (fallback without embeddings)
    let journalContext = '';
    const ragUsed = false;

    console.log("Fetching recent journal entries...");
    const { data: journalEntries, error: journalError } = await supabase
      .from('founder_journal')
      .select('content, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (journalError) {
      console.error("Error fetching journal entries:", journalError);
    }

    journalContext = journalEntries?.length 
      ? journalEntries.map((entry: any) => 
          `[${new Date(entry.created_at).toLocaleDateString()}]: ${entry.content}`
        ).join('\n\n')
      : '';

    // 3. Build generic stats
    const stats = `
BUSINESS CONTEXT:
- Business Name: ${businessProfile?.business_name || 'Not set'}
- Industry: ${businessProfile?.industry || 'Not set'}
- Target Audience: ${businessProfile?.target_audience || 'Not set'}
- Current Goal: ${businessProfile?.current_goal || 'Not set'}
- Profile Last Updated: ${businessProfile?.updated_at || 'Never'}
`.trim();

    console.log("Fetched user data successfully");
    return { businessProfile, stats, journalEntries: journalContext, ragUsed };

  } catch (error) {
    console.error("Error fetching user data:", error);
    return { 
      businessProfile: null,
      stats: "Error fetching data from database.", 
      journalEntries: "",
      ragUsed: false
    };
  }
}

// Helper to fetch image as base64 for Claude vision
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
    const { businessContext, imageUrl, weeklyCheckinText, perspectives = ['ceo'] } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
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

    // Use weekly check-in text for context, or fall back to businessContext
    const searchContext = weeklyCheckinText || 
      (businessContext ? JSON.stringify(businessContext) : null);

    // Fetch user-specific data from the database
    console.log("Fetching user data from database...");
    const { businessProfile, stats, journalEntries, ragUsed } = await fetchUserData(
      userId,
      searchContext
    );

    if (!businessProfile) {
      throw new Error("Business profile not found. Please complete onboarding.");
    }

    // Normalize perspectives to array
    const perspectiveArray = Array.isArray(perspectives) ? perspectives : [perspectives];
    console.log("Perspective modes:", perspectiveArray);

    // Build the dynamic system prompt based on user's business profile and perspective(s)
    let systemPrompt = getSystemPrompt(businessProfile, perspectiveArray);

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

    console.log("Calling Claude for personalized founder insights...");
    console.log("Image analysis requested:", !!imageUrl);

    // Build the messages array for Claude
    const messages: any[] = [];
    
    if (imageUrl) {
      // Fetch image and include in message
      const imageData = await fetchImageAsBase64(imageUrl);
      
      if (imageData) {
        messages.push({
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: imageData.mimeType,
                data: imageData.data,
              },
            },
            {
              type: "text",
              text: userMessage,
            },
          ],
        });
        console.log("Image successfully added to prompt");
      } else {
        // Image fetch failed, proceed without
        messages.push({
          role: "user",
          content: userMessage,
        });
        console.warn("Could not fetch image, proceeding without image analysis");
      }
    } else {
      messages.push({
        role: "user",
        content: userMessage,
      });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        system: systemPrompt,
        messages,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Claude API error:", response.status, errorText);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      throw new Error("No content in Claude response");
    }

    console.log("Raw Claude response:", content.substring(0, 200));

    // Parse the JSON response
    let parsedData;
    try {
      // Extract JSON from response (handle markdown code blocks if present)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                       content.match(/```\s*([\s\S]*?)\s*```/) ||
                       [null, content];
      const jsonStr = jsonMatch[1] || content;
      parsedData = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse Claude response as JSON:", parseError);
      console.error("Content was:", content);
      throw new Error("Claude response was not valid JSON");
    }

    // Ensure meta.generated_at is set
    if (!parsedData.meta) {
      parsedData.meta = {};
    }
    parsedData.meta.generated_at = new Date().toISOString();
    parsedData.meta.business_name = businessProfile.business_name;
    parsedData.meta.image_analyzed = !!imageUrl;
    parsedData.meta.rag_used = ragUsed;

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
