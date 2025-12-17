import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validateAdminAuth, unauthorizedResponse } from '../_shared/admin-auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SourceArticle {
  headline: string;
  summary: string;
  source: string;
  date: string;
  category: string;
  url: string;
  business_lens?: string;
}

interface EditorialControls {
  audience: 'operators' | 'suppliers' | 'founders' | 'investors' | 'general';
  tone: 'analytical' | 'conversational' | 'authoritative' | 'provocative';
  channel: 'blog' | 'linkedin_post' | 'linkedin_newsletter' | 'email_newsletter';
  length: 'short' | 'medium' | 'long';
  business_lens?: string;
}

const EDITORIAL_SYSTEM_PROMPT = `You are the internal editorial analyst and thought partner for Wellness Genius.

This is a private, admin-only content creation feature used to produce original insight articles from curated news. Content created here is published across the Wellness Genius website, newsletter, and selected social channels.

Your role is not to summarise news.
Your role is to interpret signals and translate them into strategic, commercial insight for operators, suppliers, founders, and decision-makers across wellness, fitness, hospitality, and health-adjacent sectors.

Write with the clarity, confidence, and judgement of an experienced wellness and technology leader. The tone should feel human, credible, and opinion-aware, not automated or generic.

## Editorial rules

- Do not rewrite or paraphrase the source article.
- Assume the reader has not seen the original piece.
- Focus on implications rather than events.
- Write with commercial awareness and healthy scepticism.
- Avoid hype, buzzwords, and generic AI phrasing.
- Be comfortable expressing informed judgement where appropriate.
- Write as Wellness Genius, not as a neutral journalist.
- If the source article is weak, marginal, or not genuinely relevant to the selected audience, say so clearly and explain why in a brief note before the content.

## Required structure

### Headline
Create an editorial, insight-led headline that is clear and business-relevant.
Avoid clickbait. Do not use emojis.

### Context
Write two to three sentences explaining what has happened and why it is appearing now.
Keep this factual and neutral.

### Why this matters
Explain explicitly why this development matters to the selected audience.
Focus on second-order effects rather than obvious headline impact.

### Commercial and operational implications
Present clear points covering, where relevant:
- Revenue impact
- Cost pressures or efficiencies
- Competitive dynamics
- Supplier or platform implications
- Regulatory, data, or trust considerations

### Practical takeaways or questions
Provide two to four concrete points highlighting what leaders should review, question, or prepare for.

### Forward signal (optional)
Highlight what to watch next and which early indicators may follow.

## Final internal check

Before completing the output, ensure that:
- The content clearly explains why an operator or supplier should care
- The article translates news into practical decisions
- The insight would still be useful in three to six months

If it does not meet these standards, revise until it does.`;

function getChannelGuidance(channel: string): string {
  switch (channel) {
    case 'blog':
      return `## Channel: Blog Article
- Use clear subheadings and an editorial tone.
- Write for senior operators and decision-makers.
- Do not use emojis.
- Format with proper HTML tags for subheadings (<h2>, <h3>) and paragraphs (<p>).`;
    
    case 'linkedin_post':
      return `## Channel: LinkedIn Post
- Open with a strong, thoughtful hook.
- Use short paragraphs (1-2 sentences each).
- Remain insight-led rather than promotional.
- End with a reflective or strategic question.
- Keep total length under 1300 characters.
- Do not use emojis.`;
    
    case 'linkedin_newsletter':
      return `## Channel: LinkedIn Newsletter
- Write with calm authority and a clear narrative flow.
- Frame the piece as part of a wider weekly intelligence briefing.
- Use clear section breaks.
- Do not use emojis.`;
    
    case 'email_newsletter':
      return `## Channel: Email Newsletter
- Use a conversational but senior tone.
- Make the main takeaway clear and prominent.
- Include one clear call to action only.
- Keep it scannable with short paragraphs.
- Do not use emojis.`;
    
    default:
      return '';
  }
}

function getLengthGuidance(length: string): string {
  switch (length) {
    case 'short':
      return '## Length: Short (300-500 words)\nKeep it tight and focused. Cut anything that doesn\'t add insight.';
    case 'medium':
      return '## Length: Medium (500-800 words)\nBalance depth with readability. Include key implications but stay focused.';
    case 'long':
      return '## Length: Long (800-1200 words)\nProvide comprehensive analysis. Include multiple implications and forward signals.';
    default:
      return '## Length: Medium (500-800 words)';
  }
}

function getAudienceGuidance(audience: string): string {
  switch (audience) {
    case 'operators':
      return `## Target Audience: Operators
Write for gym owners, studio operators, spa directors, and hospitality managers. Focus on:
- Operational efficiency and cost management
- Member experience and retention
- Revenue opportunities and pricing implications
- Staff and resource allocation
- Technology adoption decisions`;
    
    case 'suppliers':
      return `## Target Audience: Suppliers
Write for equipment manufacturers, software vendors, and service providers. Focus on:
- Market positioning and competitive dynamics
- Partnership and distribution opportunities
- Product development signals
- Customer acquisition trends
- Pricing and margin implications`;
    
    case 'founders':
      return `## Target Audience: Founders & Executives
Write for CEOs, founders, and C-suite leaders. Focus on:
- Strategic implications and market positioning
- Investment and growth opportunities
- Competitive threats and defensive moves
- Technology and innovation adoption
- Leadership and organizational decisions`;
    
    case 'investors':
      return `## Target Audience: Investors
Write for VCs, PE firms, and strategic investors. Focus on:
- Market size and growth signals
- Valuation and exit implications
- Competitive landscape shifts
- Technology and regulatory trends
- Portfolio company implications`;
    
    default:
      return `## Target Audience: General Decision-Makers
Write for senior leaders across wellness, fitness, and hospitality sectors.`;
  }
}

function getToneGuidance(tone: string): string {
  switch (tone) {
    case 'analytical':
      return '## Tone: Analytical\nBe precise, data-aware, and methodical. Support points with logic and evidence where available.';
    case 'conversational':
      return '## Tone: Conversational\nBe approachable and direct. Write as if explaining to a smart colleague over coffee.';
    case 'authoritative':
      return '## Tone: Authoritative\nBe confident and definitive. Take clear positions and express informed opinions.';
    case 'provocative':
      return '## Tone: Provocative\nChallenge conventional thinking. Ask uncomfortable questions and highlight overlooked risks or opportunities.';
    default:
      return '## Tone: Analytical';
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate admin auth
  const authResult = await validateAdminAuth(req);
  if (!authResult.isAdmin) {
    console.log('Admin auth failed:', authResult.error);
    return unauthorizedResponse(authResult.error || 'Unauthorized', corsHeaders);
  }

  try {
    const { sourceArticle, editorialControls } = await req.json() as {
      sourceArticle: SourceArticle;
      editorialControls: EditorialControls;
    };

    console.log('Generating article content for:', sourceArticle.headline);
    console.log('Editorial controls:', editorialControls);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build the user prompt with source article data
    const userPrompt = `## Source Article

**Headline:** ${sourceArticle.headline}
**Summary:** ${sourceArticle.summary}
**Source:** ${sourceArticle.source}
**Published:** ${sourceArticle.date}
**Category:** ${sourceArticle.category}
**URL:** ${sourceArticle.url}
${sourceArticle.business_lens ? `**Business Lens:** ${sourceArticle.business_lens}` : ''}

${getAudienceGuidance(editorialControls.audience)}

${getToneGuidance(editorialControls.tone)}

${getChannelGuidance(editorialControls.channel)}

${getLengthGuidance(editorialControls.length)}

---

Now generate the insight article based on the source article and editorial guidelines above. Remember:
- Do NOT just summarize the news
- Focus on what it MEANS for the target audience
- Be specific about commercial and operational implications
- Write with the voice of an experienced wellness and technology leader`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: EDITORIAL_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content;

    if (!generatedContent) {
      throw new Error('No content generated from AI');
    }

    console.log('Generated content length:', generatedContent.length);

    // Parse the generated content to extract headline and body
    const lines = generatedContent.split('\n');
    let headline = '';
    let body = '';
    let foundHeadline = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Look for headline markers
      if (!foundHeadline && (line.startsWith('# ') || line.startsWith('## Headline') || line.startsWith('**Headline'))) {
        if (line.startsWith('# ')) {
          headline = line.replace(/^#+ /, '').trim();
        } else {
          // Next non-empty line is the headline
          for (let j = i + 1; j < lines.length; j++) {
            if (lines[j].trim()) {
              headline = lines[j].trim().replace(/^\*\*/, '').replace(/\*\*$/, '').replace(/^#+\s*/, '');
              i = j;
              break;
            }
          }
        }
        foundHeadline = true;
        continue;
      }
      
      if (foundHeadline) {
        body += lines[i] + '\n';
      }
    }

    // Fallback if no headline marker found
    if (!headline && lines.length > 0) {
      headline = lines[0].replace(/^#+\s*/, '').replace(/^\*\*/, '').replace(/\*\*$/, '').trim();
      body = lines.slice(1).join('\n');
    }

    // Clean up the body
    body = body.trim();

    // Convert markdown to HTML for blog channel
    if (editorialControls.channel === 'blog') {
      body = body
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^\*\*(.+?)\*\*$/gm, '<strong>$1</strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/^\* (.+)$/gm, '<li>$1</li>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
        .split('\n\n')
        .map(para => {
          if (para.startsWith('<h') || para.startsWith('<ul') || para.startsWith('<li')) {
            return para;
          }
          return `<p>${para}</p>`;
        })
        .join('\n\n');
    }

    return new Response(
      JSON.stringify({
        headline,
        body,
        raw: generatedContent,
        sourceUrl: sourceArticle.url,
        channel: editorialControls.channel,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('generate-article-content error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
