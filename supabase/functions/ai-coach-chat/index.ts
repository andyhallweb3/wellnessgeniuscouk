import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { analyzeMessages, logSecurityEvent } from "../_shared/prompt-guard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schemas
const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().max(10000, "Message content must be less than 10,000 characters"),
});

const UserContextSchema = z.object({
  business_name: z.string().max(255).optional(),
  business_type: z.string().max(100).optional(),
  business_size_band: z.string().max(50).optional(),
  team_size: z.string().max(50).optional(),
  role: z.string().max(100).optional(),
  primary_goal: z.string().max(500).optional(),
  frustration: z.string().max(500).optional(),
  ai_experience: z.string().max(255).optional(),
  current_tech: z.string().max(500).optional(),
  decision_style: z.string().max(100).optional(),
  biggest_win: z.string().max(500).optional(),
}).optional();

const RequestSchema = z.object({
  messages: z.array(MessageSchema).max(50, "Maximum 50 messages allowed"),
  mode: z.enum(["general", "strategy", "retention", "monetisation", "risk", "planning"]).default("general"),
  userContext: UserContextSchema,
  documentContext: z.string().max(50000, "Document context must be less than 50,000 characters").optional(),
});

// C.L.E.A.R Framework system prompt
const CLEAR_SYSTEM_PROMPT = `You are the Wellness Genius AI Coach — a commercial advisor for wellness, fitness, and health-adjacent businesses.

## C.L.E.A.R FRAMEWORK (Your Operating System)

C – CONTEXT:
You operate in a trust-sensitive wellness environment where behaviour change, retention, and long-term engagement matter more than short-term activity.

L – LENS:
Adopt a commercial and behavioural lens, not a motivational or therapeutic one. You help leaders make better decisions, not feel more confident.

E – EXPECTATION:
Every response must be actionable and grounded in commercial reality. No hype. No guarantees.

A – ASSUMPTIONS:
Do not assume:
- Perfect data exists
- Unlimited resources are available
- Users will comply with recommendations
- AI is always the answer

R – RESPONSE FORMAT:
Structure responses with:
- Key insight (what matters)
- Commercial implication (why it matters financially)
- Risk or limitation (what could go wrong)
- Recommended next action (what to do)

## CORE PRINCIPLES

1. Clarity before tools
2. Behaviour before automation
3. Control before scale

## DECISION HIERARCHY

1. Retention and lifetime value
2. Decision clarity
3. Risk reduction (regulatory, trust, financial)
4. Sustainable monetisation

## CRITICAL RULES

- Be conservative with financial assumptions
- Use British English
- If data quality or clarity is weak, recommend fixing foundations before scaling
- Never recommend incentives as the first response to disengagement
- Stress-test ideas for trust risk before approving
- If something would be uncomfortable to explain to a regulator, customer, or journalist — flag it

## TONE

Direct, practical, and honest. You are a trusted advisor who tells operators what they need to hear, not what they want to hear.

## SITE HELP & FAQs (Answer these when users ask about the platform)

### Getting Started
Q: How do I use Wellness Genius?
A: Start with the free AI Readiness Assessment to understand where you stand. Then use the AI Coach (me!) for personalised guidance. Your My Hub dashboard stores all your purchases and saved insights.

Q: Where can I find my purchases and downloads?
A: Go to My Hub (click your profile or "My Hub" button in the header). The "Products & Reports" tab shows all your purchased products with download buttons.

Q: Why don't I see my free downloads in My Hub?
A: Free downloads (like the AI Reality Checklist or Myths Deck) are delivered via email and don't appear in My Hub. Only paid purchases are tracked in your account. You can re-download free items from the Products page anytime.

### AI Coach / Wellness Genie
Q: What is the AI Coach / Wellness Genie?
A: I'm your AI-powered business advisor! I help you with strategy, retention, monetisation, risk assessment, and planning for your wellness business. Look for the floating button in the bottom-right corner.

Q: How do I access the AI Coach?
A: Click the floating Genie button (bottom-right of any page) or go to My Hub → AI Coach. You get 40 free credits per month on the free tier.

Q: What are credits and how do they work?
A: Each AI interaction costs credits based on complexity. Free users get 40 credits/month that reset monthly. Pro subscribers get more credits and additional features.

Q: I'm running out of credits. What should I do?
A: Credits reset monthly. If you need more, consider upgrading to AI Coach Pro (40 credits/month) or Expert (120 credits/month) from the Products page.

### Products & Downloads
Q: How do I download a product I purchased?
A: Go to My Hub → Products & Reports tab. Each purchased product has a "Download" button. PDFs are generated fresh each time.

Q: My download isn't working. What should I do?
A: Try refreshing the page and clicking Download again. If issues persist, check that pop-ups aren't blocked. The PDF generates in your browser.

Q: What's included in the bundles?
A: Bundles combine multiple products at a discount. The Operator Bundle includes AI Readiness Score + Engagement Playbook + Prompt Pack. Check the Products page for bundle details.

### AI Readiness Assessment
Q: What is the AI Readiness Assessment?
A: It's a diagnostic tool that scores your wellness business across 5 dimensions: Leadership, Data, People, Process, and Risk. You get personalised recommendations and a priority action plan.

Q: Is there a free version?
A: Yes! The free version gives you a quick score. The Commercial Edition (£39.99) includes detailed revenue modelling, benchmarks, and templates.

Q: Where do I find my assessment results?
A: After completing the assessment, results are shown immediately. If you're logged in, they're saved to My Hub → Saved Insights.

### Account & Subscriptions
Q: How do I reset my password?
A: Click "Sign In" → "Forgot Password" and enter your email to receive a reset link.

Q: How do I cancel my subscription?
A: Go to My Hub and use the subscription management link, or contact support at hello@wellnessgenius.io

Q: How do I restart the site tour?
A: In My Hub, scroll to the Account card in the sidebar and click "Restart Site Tour".

### Technical Issues
Q: The site isn't loading properly. What should I do?
A: Try refreshing the page, clearing your browser cache, or using a different browser. For persistent issues, contact hello@wellnessgenius.io

Q: I can't log in to my account.
A: Use the "Forgot Password" link to reset. If issues persist, ensure you're using the same email you registered with.

Q: How do I contact support?
A: Email hello@wellnessgenius.io or book a call with Andy via Calendly (links on product pages).`;


// Mode-specific prompt additions
const MODE_PROMPTS: Record<string, { prompt: string }> = {
  general: {
    prompt: `MODE: General Advisory
Provide balanced, practical guidance across any wellness business topic.`,
  },
  strategy: {
    prompt: `MODE: Strategy & Planning
Focus on 90-day planning, prioritisation, and avoiding premature AI investment.
Use the 90-Day Planning Engine approach.`,
  },
  retention: {
    prompt: `MODE: Retention & Engagement
Focus on habit formation, behaviour change, and the Intervention Ladder.
Always recommend the lightest effective intervention first.`,
  },
  monetisation: {
    prompt: `MODE: Monetisation & Commercial
Focus on CFO-ready translation, conservative modelling, and revenue attribution.
Use ranges, not guarantees.`,
  },
  risk: {
    prompt: `MODE: Risk & Governance
Focus on trust, consent, regulatory risk, and the Governance Guardrail.
Flag anything uncomfortable to explain publicly.`,
  },
  planning: {
    prompt: `MODE: Execution & Planning
Focus on practical next steps, board-ready updates, and what NOT to do.
Prioritise high-impact, low-risk actions.`,
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate input
    const rawBody = await req.json();
    const validationResult = RequestSchema.safeParse(rawBody);
    
    if (!validationResult.success) {
      console.error("[AI-COACH] Validation error:", validationResult.error.errors);
      return new Response(
        JSON.stringify({ error: "Invalid request format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages, mode, userContext, documentContext } = validationResult.data;

    // Prompt injection detection
    const promptGuardResult = analyzeMessages(messages);
    if (!promptGuardResult.isSafe) {
      logSecurityEvent("blocked", {
        riskScore: promptGuardResult.riskScore,
        patterns: promptGuardResult.detectedPatterns,
        mode,
      });
      return new Response(
        JSON.stringify({ error: "Your message could not be processed. Please rephrase and try again." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log warnings for suspicious but allowed requests
    if (promptGuardResult.riskScore > 10) {
      logSecurityEvent("warning", {
        riskScore: promptGuardResult.riskScore,
        patterns: promptGuardResult.detectedPatterns,
        mode,
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const modeConfig = MODE_PROMPTS[mode] || MODE_PROMPTS.general;
    
    // Build context string from user profile if available
    let contextString = "";
    if (userContext) {
      const parts = [];
      if (userContext.business_name) parts.push(`Business Name: ${userContext.business_name}`);
      if (userContext.business_type) parts.push(`Business Type: ${userContext.business_type}`);
      if (userContext.business_size_band) parts.push(`Revenue Band: ${userContext.business_size_band}`);
      if (userContext.team_size) parts.push(`Team Size: ${userContext.team_size}`);
      if (userContext.role) parts.push(`Role: ${userContext.role}`);
      if (userContext.primary_goal) parts.push(`Primary Goal: ${userContext.primary_goal}`);
      if (userContext.frustration) parts.push(`Current Frustration: ${userContext.frustration}`);
      if (userContext.ai_experience) parts.push(`AI Experience: ${userContext.ai_experience}`);
      if (userContext.current_tech) parts.push(`Current Tech: ${userContext.current_tech}`);
      if (userContext.decision_style) parts.push(`Decision Style: ${userContext.decision_style}`);
      if (userContext.biggest_win) parts.push(`Recent Win: ${userContext.biggest_win}`);
      if (parts.length > 0) {
        contextString = `\n\nUSER CONTEXT (use this to personalise your guidance):\n${parts.join("\n")}`;
      }
    }

    // Add document context if provided (already validated for length)
    if (documentContext && documentContext.trim()) {
      contextString += `\n\nBUSINESS DOCUMENTS (use this information to provide more relevant, personalised advice):\n${documentContext}`;
    }

    const fullSystemPrompt = `${CLEAR_SYSTEM_PROMPT}${contextString}\n\n${modeConfig.prompt}`;

    console.log("[AI-COACH] Starting chat request with mode:", mode, "messages:", messages.length);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: fullSystemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[AI-COACH] Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please contact support." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[AI-COACH] Streaming response started");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("[AI-COACH] Error:", error);
    return new Response(JSON.stringify({ error: "Request failed. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
