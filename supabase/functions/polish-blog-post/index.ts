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

RULES:
1. Maintain the original meaning and key points
2. Improve clarity, flow, and readability
3. Fix any grammar, spelling, or punctuation errors
4. Use proper HTML formatting for web publishing:
   - Use <h2> for main sections, <h3> for subsections
   - Use <p> tags for paragraphs
   - Use <ul>/<li> for bullet points where appropriate
   - Use <strong> for emphasis on key terms
   - Use <blockquote> for important quotes or callouts
5. Ensure the tone is professional yet approachable
6. Keep paragraphs concise (3-4 sentences max)
7. Add engaging subheadings to break up long content
8. Ensure the content is actionable and valuable for wellness business owners

Return ONLY the polished HTML content, no explanations or markdown.`;

    const userPrompt = `Please polish and format this blog post for publishing:

Title: ${title || 'Untitled'}

Excerpt: ${excerpt || 'No excerpt provided'}

Content:
${content}

Return the polished HTML content only.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error('Failed to polish content');
    }

    const data = await response.json();
    let polishedContent = data.choices?.[0]?.message?.content || '';

    // Clean up any markdown code blocks if present
    polishedContent = polishedContent
      .replace(/^```html?\n?/i, '')
      .replace(/\n?```$/i, '')
      .trim();

    // Also generate an improved excerpt if needed
    let improvedExcerpt = excerpt;
    if (!excerpt || excerpt.length < 50) {
      const excerptResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
              content: 'Generate a compelling 1-2 sentence excerpt/summary for this blog post. It should entice readers to click and read more. Return ONLY the excerpt text, no quotes or explanations.' 
            },
            { role: 'user', content: `Title: ${title}\n\nContent: ${polishedContent.substring(0, 1000)}` },
          ],
          temperature: 0.5,
          max_tokens: 150,
        }),
      });

      if (excerptResponse.ok) {
        const excerptData = await excerptResponse.json();
        improvedExcerpt = excerptData.choices?.[0]?.message?.content?.trim() || excerpt;
      }
    }

    // Generate meta description if not present
    const metaResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: 'Generate an SEO-optimized meta description (max 155 characters) for this blog post. Return ONLY the meta description text.' 
          },
          { role: 'user', content: `Title: ${title}\n\nContent: ${polishedContent.substring(0, 500)}` },
        ],
        temperature: 0.3,
        max_tokens: 50,
      }),
    });

    let metaDescription = '';
    if (metaResponse.ok) {
      const metaData = await metaResponse.json();
      metaDescription = metaData.choices?.[0]?.message?.content?.trim() || '';
    }

    return new Response(
      JSON.stringify({
        polishedContent,
        improvedExcerpt,
        metaDescription,
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
