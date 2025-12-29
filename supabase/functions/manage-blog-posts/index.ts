import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { validateAdminAuth, unauthorizedResponse } from '../_shared/admin-auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BlogPostInput {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  published?: boolean;
  featured?: boolean;
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
  read_time?: string;
  image_url?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate admin auth
  const authResult = await validateAdminAuth(req);
  if (!authResult.isAdmin) {
    console.log('Admin auth failed:', authResult.error);
    return unauthorizedResponse(authResult.error || 'Unauthorized', corsHeaders);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await req.json();
    const { action, post, postId, limit = 50 } = body;

    console.log('manage-blog-posts action:', action);

    // Helper to log admin actions
    const logAudit = async (actionType: string, resourceCount?: number, details?: string) => {
      await supabase.from('admin_audit_logs').insert({
        admin_user_id: authResult.userId,
        action: actionType,
        resource_type: 'blog_posts',
        resource_count: resourceCount,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip'),
        user_agent: req.headers.get('user-agent'),
      });
      console.log('Audit log:', actionType, 'blog_posts', details || '');
    };

    switch (action) {
      case 'list': {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;

        await logAudit('list', data?.length || 0);

        return new Response(
          JSON.stringify({ posts: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get': {
        if (!postId) {
          return new Response(
            JSON.stringify({ error: 'Post ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('id', postId)
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ post: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create': {
        if (!post || !post.title || !post.slug || !post.content) {
          return new Response(
            JSON.stringify({ error: 'Title, slug, and content are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Generate slug from title if not provided
        const slug = post.slug || post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const { data, error } = await supabase
          .from('blog_posts')
          .insert({
            title: post.title,
            slug,
            excerpt: post.excerpt || post.content.substring(0, 200) + '...',
            content: post.content,
            category: post.category || 'AI',
            published: post.published ?? false,
            featured: post.featured ?? false,
            meta_title: post.meta_title || post.title,
            meta_description: post.meta_description || post.excerpt?.substring(0, 160),
            keywords: post.keywords || [],
            read_time: post.read_time || '5 min read',
            image_url: post.image_url || null,
          })
          .select()
          .single();

        if (error) throw error;

        console.log('Created blog post:', data.id);
        await logAudit('create', 1, `id: ${data.id}, title: ${post.title}`);

        return new Response(
          JSON.stringify({ post: data, message: 'Blog post created successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update': {
        if (!post || !post.id) {
          return new Response(
            JSON.stringify({ error: 'Post ID required for update' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const updateData: Partial<BlogPostInput> = {};
        if (post.title !== undefined) updateData.title = post.title;
        if (post.slug !== undefined) updateData.slug = post.slug;
        if (post.excerpt !== undefined) updateData.excerpt = post.excerpt;
        if (post.content !== undefined) updateData.content = post.content;
        if (post.category !== undefined) updateData.category = post.category;
        if (post.published !== undefined) updateData.published = post.published;
        if (post.featured !== undefined) updateData.featured = post.featured;
        if (post.meta_title !== undefined) updateData.meta_title = post.meta_title;
        if (post.meta_description !== undefined) updateData.meta_description = post.meta_description;
        if (post.keywords !== undefined) updateData.keywords = post.keywords;
        if (post.read_time !== undefined) updateData.read_time = post.read_time;
        if (post.image_url !== undefined) updateData.image_url = post.image_url;

        const { data, error } = await supabase
          .from('blog_posts')
          .update(updateData)
          .eq('id', post.id)
          .select()
          .single();

        if (error) throw error;

        console.log('Updated blog post:', data.id);
        await logAudit('update', 1, `id: ${data.id}`);

        return new Response(
          JSON.stringify({ post: data, message: 'Blog post updated successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete': {
        if (!postId) {
          return new Response(
            JSON.stringify({ error: 'Post ID required for deletion' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabase
          .from('blog_posts')
          .delete()
          .eq('id', postId);

        if (error) throw error;

        console.log('Deleted blog post:', postId);
        await logAudit('delete', 1, `id: ${postId}`);

        return new Response(
          JSON.stringify({ message: 'Blog post deleted successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'create-from-news': {
        // Create a blog post from a news item
        if (!post || !post.title) {
          return new Response(
            JSON.stringify({ error: 'News item data required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const slug = post.slug || post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const { data, error } = await supabase
          .from('blog_posts')
          .insert({
            title: post.title,
            slug,
            excerpt: post.excerpt || post.summary || '',
            content: post.content || `<p>${post.summary || ''}</p>\n\n<p><a href="${post.source_url}" target="_blank" rel="noopener noreferrer">Read the original article →</a></p>`,
            category: post.category || 'AI',
            published: false, // Always start as draft
            featured: false,
            meta_title: post.meta_title || post.title,
            meta_description: post.meta_description || post.summary?.substring(0, 160),
            keywords: post.keywords || [],
            read_time: post.read_time || '3 min read',
            image_url: post.image_url || null,
          })
          .select()
          .single();

        if (error) throw error;

        console.log('Created blog post from news:', data.id);
        await logAudit('create-from-news', 1, `id: ${data.id}, title: ${post.title}`);

        return new Response(
          JSON.stringify({ post: data, message: 'Blog post created from news item' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('manage-blog-posts error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
