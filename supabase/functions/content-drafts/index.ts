import { validateAdminAuth, unauthorizedResponse } from "../_shared/admin-auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Platform = "linkedin" | "x" | "telegram" | "newsletter" | "all";

type Story = {
  id?: string;
  title: string;
  source_name?: string;
  source_url?: string;
  summary?: string;
  category?: string;
  business_lens?: string | null;
  published_date?: string;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function extractJson(content: string) {
  const m = content.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[0]);
  } catch {
    return null;
  }
}

async function callOpenAI(args: {
  apiKey: string;
  model: string;
  system: string;
  user: string;
}) {
  const { apiKey, model, system, user } = args;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`OpenAI error ${res.status}: ${txt.slice(0, 300)}`);
  }

  const data = await res.json();
  return String(data?.choices?.[0]?.message?.content || "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = await validateAdminAuth(req);
    if (!auth.isAdmin) return unauthorizedResponse(auth.error || "Unauthorized", corsHeaders);

    const body = await req.json().catch(() => ({}));
    const platform: Platform = body.platform || "all";
    const story: Story | null = body.story && typeof body.story === "object" ? body.story : null;
    const context: string = typeof body.context === "string" ? body.context.trim() : "";
    const goal: string = typeof body.goal === "string" ? body.goal.trim() : "";
    const ctaUrl: string = typeof body.ctaUrl === "string" && body.ctaUrl.trim()
      ? body.ctaUrl.trim()
      : "https://www.wellnessgenius.co.uk/ai-readiness/start";

    const openaiKey = Deno.env.get("OPENAI_API_KEY") || "";
    const model = Deno.env.get("OPENAI_MODEL") || "gpt-4.1-mini";
    if (!openaiKey) return jsonResponse({ success: false, error: "Missing OPENAI_API_KEY secret" }, 500);

    const storyBlock = story
      ? [
        `Story title: ${story.title}`,
        `Source: ${story.source_name || "Unknown"}`,
        `Category: ${story.category || "Unknown"}`,
        `Business lens: ${story.business_lens || "Unknown"}`,
        `Published: ${story.published_date || "Unknown"}`,
        `URL: ${story.source_url || "Unknown"}`,
        `Summary: ${story.summary || ""}`,
      ].join("\n")
      : "No specific story selected.";

    const system = [
      "You are the content and thought leadership assistant for Andy Hall (Founder & CEO, Wellness Genius).",
      "Voice: direct, operator-first, experienced, no hype, no generic AI fluff.",
      "Never use: game-changer, revolutionary, unlock, leverage, cutting-edge, seamlessly, robust, scalable solution, empower.",
      "Always include: one concrete operator takeaway and one honest caveat/tradeoff when relevant.",
      "Output MUST be valid JSON only (no markdown fences).",
    ].join("\n");

    const user = [
      "Create platform-native drafts. Prioritise UK/Europe operator relevance where possible.",
      "",
      `Requested platform: ${platform}`,
      `Primary CTA URL: ${ctaUrl}`,
      goal ? `Goal: ${goal}` : "",
      context ? `Extra context: ${context}` : "",
      "",
      storyBlock,
      "",
      "Return JSON in this shape:",
      "{",
      '  "linkedin": "150-250 words, ends with a real question, include CTA url at end",',
      '  "x": "one post <= 240 chars, include link if it fits, end with question/challenge",',
      '  "telegram": "120-180 words, conversational, one clear link at end",',
      '  "newsletter": { "subject_options": ["...","...","..."], "body": "250-450 words, includes 3 bullets + one CTA link" }',
      "}",
      "If platform != all, still return the full JSON but leave unrelated fields as empty strings/empty lists.",
    ].filter(Boolean).join("\n");

    const content = await callOpenAI({ apiKey: openaiKey, model, system, user });
    const parsed = extractJson(content);
    if (!parsed) {
      return jsonResponse({ success: false, error: "Failed to parse model output as JSON", raw: content.slice(0, 2000) }, 500);
    }

    return jsonResponse({ success: true, drafts: parsed });
  } catch (e) {
    return jsonResponse({ success: false, error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

