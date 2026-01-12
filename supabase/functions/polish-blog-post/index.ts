import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validateAdminAuth, unauthorizedResponse } from '../_shared/admin-auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate admin auth
    const authResult = await validateAdminAuth(req);
    if (!authResult.isAdmin) {
      return unauthorizedResponse(authResult.error || 'Unauthorized', corsHeaders);
    }

    const { title, excerpt, content } = await req.json();

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a professional editor for Wellness Genius, a platform helping wellness business owners leverage AI and technology. Your task is to polish and format blog posts to be professional, engaging, and publish-ready.

CRITICAL RULES:
1. DO NOT include the title as an H1 - the title is displayed separately in the page header
2. Start the content directly with the first paragraph or an H2 section heading
3. Maintain the original meaning and key points
4. Improve clarity, flow, and readability
5. Fix any grammar, spelling, or punctuation errors
6. Use proper HTML formatting for web publishing:
   - Use <h2> for main section headings (NOT H1)
   - Use <h3> for subsections
   - Use <p> tags for paragraphs
   - Use <ul>/<li> for bullet points where appropriate
   - Use <strong> for emphasis on key terms
   - Use <blockquote> for important quotes or callouts
7. Ensure the tone is professional yet approachable
8. Keep paragraphs concise (3-4 sentences max)
9. Add engaging subheadings (<h2>) to break up long content
10. Ensure the content is actionable and valuable for wellness business owners

Return ONLY the polished HTML content starting with <p> or <h2>, no explanations or markdown.`;

    const userPrompt = `Please polish and format this blog post for publishing:

Title (DO NOT include this in the output, it's shown separately): ${title || 'Untitled'}

Excerpt: ${excerpt || 'No excerpt provided'}

Content to polish (start with <p> or <h2>, never <h1>):
${content}

Return the polished HTML content only. Do not include the title.`;

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    console.log('[POLISH] Starting polish request, API key present:', !!apiKey);
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    console.log('[POLISH] AI response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[POLISH] AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    let polishedContent = data.choices?.[0]?.message?.content || '';

    // Clean up any markdown code blocks if present
    polishedContent = polishedContent
      .replace(/^```html?\n?/i, '')
      .replace(/\n?```$/i, '')
      .trim();

    // Generate all SEO fields in parallel
    const [excerptResponse, metaResponse, keywordsResponse, metaTitleResponse] = await Promise.all([
      // Improved excerpt/summary - PLAIN TEXT ONLY
      fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { 
              role: 'system', 
              content: `Generate a compelling 1-2 sentence excerpt/summary for this blog post that entices readers to click and read more.

CRITICAL RULES:
- Return PLAIN TEXT ONLY - NO HTML tags, NO <p>, NO <strong>, NO formatting
- Keep it under 160 characters
- Make it engaging and action-oriented
- Do not include quotes around the text
- Do not include any explanation, just the excerpt itself` 
            },
            { role: 'user', content: `Title: ${title}\n\nContent: ${polishedContent.substring(0, 1500)}` },
          ],
          temperature: 0.5,
          max_tokens: 100,
        }),
      }),
      
      // Meta description - PLAIN TEXT ONLY
      fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { 
              role: 'system', 
              content: `Generate an SEO-optimized meta description for this blog post.

CRITICAL RULES:
- Return PLAIN TEXT ONLY - NO HTML tags whatsoever
- Maximum 155 characters
- Focus on the main benefit/insight for wellness business owners
- Do not include quotes around the text
- Do not include any explanation, just the meta description itself` 
            },
            { role: 'user', content: `Title: ${title}\n\nContent: ${polishedContent.substring(0, 1000)}` },
          ],
          temperature: 0.3,
          max_tokens: 60,
        }),
      }),
      
      // Keywords - comma-separated list
      fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { 
              role: 'system', 
              content: `Generate 5-8 SEO keywords for this wellness/AI blog post.

CRITICAL RULES:
- Return ONLY a comma-separated list of keywords
- NO HTML tags, NO formatting
- Focus on: AI, wellness, fitness, health tech, automation, business terms
- Example format: AI wellness, fitness technology, health automation
- Do not include any explanation, just the keywords` 
            },
            { role: 'user', content: `Title: ${title}\n\nContent: ${polishedContent.substring(0, 1000)}` },
          ],
          temperature: 0.3,
          max_tokens: 80,
        }),
      }),
      
      // Meta title - PLAIN TEXT ONLY
      fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { 
              role: 'system', 
              content: `Generate an SEO-optimized meta title for this blog post.

CRITICAL RULES:
- Return PLAIN TEXT ONLY - NO HTML tags
- Maximum 60 characters
- Include primary keyword near the start
- Add "| Wellness Genius" at the end if space permits
- Do not include quotes around the text
- Do not include any explanation, just the title itself` 
            },
            { role: 'user', content: `Original Title: ${title}\n\nContent summary: ${polishedContent.substring(0, 500)}` },
          ],
          temperature: 0.3,
          max_tokens: 30,
        }),
      }),
    ]);

    // Helper to strip any HTML tags and clean up text
    const stripHtml = (text: string): string => {
      return text
        .replace(/<[^>]*>/g, '')  // Remove HTML tags
        .replace(/&nbsp;/g, ' ')  // Replace nbsp
        .replace(/&amp;/g, '&')   // Replace amp
        .replace(/&lt;/g, '<')    // Replace lt
        .replace(/&gt;/g, '>')    // Replace gt
        .replace(/&quot;/g, '"')  // Replace quot
        .replace(/&#39;/g, "'")   // Replace single quote
        .replace(/\s+/g, ' ')     // Normalize whitespace
        .trim();
    };

    // Extract results - ensure all are plain text
    let improvedExcerpt = excerpt;
    let metaDescription = '';
    let keywords = '';
    let metaTitle = title;

    if (excerptResponse.ok) {
      const data = await excerptResponse.json();
      const raw = data.choices?.[0]?.message?.content?.trim() || '';
      improvedExcerpt = stripHtml(raw) || excerpt;
    }

    if (metaResponse.ok) {
      const data = await metaResponse.json();
      const raw = data.choices?.[0]?.message?.content?.trim() || '';
      metaDescription = stripHtml(raw);
    }

    if (keywordsResponse.ok) {
      const data = await keywordsResponse.json();
      const raw = data.choices?.[0]?.message?.content?.trim() || '';
      keywords = stripHtml(raw);
    }

    if (metaTitleResponse.ok) {
      const data = await metaTitleResponse.json();
      const raw = data.choices?.[0]?.message?.content?.trim() || '';
      metaTitle = stripHtml(raw) || title;
    }

    return new Response(
      JSON.stringify({
        polishedContent,
        improvedExcerpt,
        metaDescription,
        metaTitle,
        keywords,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Polish blog post error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to polish content';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
