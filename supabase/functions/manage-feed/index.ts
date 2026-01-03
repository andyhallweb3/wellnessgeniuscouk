import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action } = await req.json();

    if (action === 'seed_articles') {
      // Fetch processed articles that aren't already in feed
      const { data: articles, error: articlesError } = await supabase
        .from('articles')
        .select('id, title, ai_summary, url, category, published_at, business_lens')
        .eq('processed', true)
        .order('published_at', { ascending: false })
        .limit(50);

      if (articlesError) throw articlesError;

      // Check which articles are already in feed
      const { data: existingPosts } = await supabase
        .from('feed_posts')
        .select('source_article_id')
        .not('source_article_id', 'is', null);

      const existingIds = new Set((existingPosts || []).map(p => p.source_article_id));

      // Insert new articles as system posts
      const newPosts = (articles || [])
        .filter(article => !existingIds.has(article.id))
        .map(article => ({
          post_type: 'system_article',
          content: article.ai_summary || article.title,
          link_url: article.url,
          link_summary: article.business_lens || `Industry news from ${article.category}`,
          source_article_id: article.id,
          tags: [article.category].filter(Boolean),
          quality_score: 50, // Base quality for curated content
          created_at: article.published_at,
        }));

      if (newPosts.length > 0) {
        const { error: insertError } = await supabase
          .from('feed_posts')
          .insert(newPosts);

        if (insertError) throw insertError;
      }

      // Also seed blog posts
      const { data: blogPosts, error: blogError } = await supabase
        .from('blog_posts')
        .select('id, title, excerpt, slug, category, created_at')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (blogError) throw blogError;

      const { data: existingBlogPosts } = await supabase
        .from('feed_posts')
        .select('source_blog_id')
        .not('source_blog_id', 'is', null);

      const existingBlogIds = new Set((existingBlogPosts || []).map(p => p.source_blog_id));

      const newBlogPosts = (blogPosts || [])
        .filter(post => !existingBlogIds.has(post.id))
        .map(post => ({
          post_type: 'blog_post',
          content: post.excerpt,
          link_url: `/insights/${post.slug}`,
          link_summary: `From the Wellness Genius blog`,
          source_blog_id: post.id,
          tags: [post.category].filter(Boolean),
          quality_score: 60, // Higher quality for our own content
          is_featured: true,
          created_at: post.created_at,
        }));

      if (newBlogPosts.length > 0) {
        const { error: blogInsertError } = await supabase
          .from('feed_posts')
          .insert(newBlogPosts);

        if (blogInsertError) throw blogInsertError;
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          articlesAdded: newPosts.length,
          blogPostsAdded: newBlogPosts.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'update_score') {
      const { userId, change, reason, relatedPostId, relatedCommentId } = await req.json();

      // Get current score
      const { data: currentScore, error: fetchError } = await supabase
        .from('professional_scores')
        .select('score')
        .eq('user_id', userId)
        .single();

      if (fetchError) throw fetchError;

      // Calculate new score (clamped 0-100)
      const newScore = Math.max(0, Math.min(100, (currentScore?.score || 40) + change));

      // Update score
      const { error: updateError } = await supabase
        .from('professional_scores')
        .update({ score: newScore })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Log the change
      const { error: logError } = await supabase
        .from('professional_score_log')
        .insert({
          user_id: userId,
          change_amount: change,
          reason,
          related_post_id: relatedPostId || null,
          related_comment_id: relatedCommentId || null,
        });

      if (logError) console.error('Failed to log score change:', logError);

      return new Response(
        JSON.stringify({ success: true, newScore }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Feed management error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
