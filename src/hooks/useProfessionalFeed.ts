import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface FeedPost {
  id: string;
  author_id: string | null;
  post_type: "user_post" | "shared_article" | "system_article" | "blog_post";
  content: string;
  link_url: string | null;
  link_summary: string | null;
  source_article_id: string | null;
  source_blog_id: string | null;
  is_featured: boolean;
  like_count: number;
  comment_count: number;
  quality_score: number;
  tags: string[];
  created_at: string;
  author?: {
    role: string | null;
    organisation: string | null;
    score: number;
  };
  user_has_liked?: boolean;
}

export interface FeedComment {
  id: string;
  post_id: string;
  author_id: string;
  parent_comment_id: string | null;
  content: string;
  like_count: number;
  is_helpful: boolean;
  created_at: string;
  author?: {
    role: string | null;
    organisation: string | null;
  };
  user_has_liked?: boolean;
  replies?: FeedComment[];
}

export interface ProfessionalScore {
  id: string;
  user_id: string;
  score: number;
  profile_photo_added: boolean;
  linkedin_url_added: boolean;
  role: string | null;
  organisation: string | null;
  linkedin_url: string | null;
  total_posts: number;
  total_comments: number;
  total_likes_received: number;
  total_helpful_marks: number;
  weeks_without_reports: number;
  posting_suspended_until: string | null;
}

export interface RateLimits {
  posts_per_day: number;
  comments_per_day: number;
  posts_today: number;
  comments_today: number;
  can_post: boolean;
  can_comment: boolean;
}

export const useProfessionalFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [userScore, setUserScore] = useState<ProfessionalScore | null>(null);
  const [rateLimits, setRateLimits] = useState<RateLimits | null>(null);

  const PAGE_SIZE = 20;

  // Fetch user's professional score
  const fetchUserScore = useCallback(async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("professional_scores")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching professional score:", error);
      return;
    }

    if (data) {
      setUserScore(data as ProfessionalScore);
    } else {
      // Create initial score for new user
      const { data: newScore, error: insertError } = await supabase
        .from("professional_scores")
        .insert({ user_id: user.id })
        .select()
        .single();

      if (!insertError && newScore) {
        setUserScore(newScore as ProfessionalScore);
      }
    }
  }, [user?.id]);

  // Fetch rate limits
  const fetchRateLimits = useCallback(async () => {
    if (!user?.id) return;

    // Get rate limits from function
    const { data: limits } = await supabase
      .rpc("get_user_rate_limits", { p_user_id: user.id });

    // Count today's posts
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: postsToday } = await supabase
      .from("feed_posts")
      .select("*", { count: "exact", head: true })
      .eq("author_id", user.id)
      .gte("created_at", today.toISOString());

    const { count: commentsToday } = await supabase
      .from("feed_comments")
      .select("*", { count: "exact", head: true })
      .eq("author_id", user.id)
      .gte("created_at", today.toISOString());

    const rateLimit = limits?.[0] || { posts_per_day: 1, comments_per_day: 3 };
    
    setRateLimits({
      posts_per_day: rateLimit.posts_per_day,
      comments_per_day: rateLimit.comments_per_day,
      posts_today: postsToday || 0,
      comments_today: commentsToday || 0,
      can_post: (postsToday || 0) < rateLimit.posts_per_day,
      can_comment: (commentsToday || 0) < rateLimit.comments_per_day,
    });
  }, [user?.id]);

  // Fetch posts with pagination
  const fetchPosts = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    setLoading(true);
    try {
      const { data: postsData, error } = await supabase
        .from("feed_posts")
        .select(`
          *
        `)
        .eq("moderation_status", "approved")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      if (error) throw error;

      // Fetch author info for each post
      const postsWithAuthors = await Promise.all(
        (postsData || []).map(async (post) => {
          let author = undefined;
          if (post.author_id) {
            const { data: authorData } = await supabase
              .from("professional_scores")
              .select("role, organisation, score")
              .eq("user_id", post.author_id)
              .maybeSingle();
            author = authorData || undefined;
          }

          // Check if user has liked
          let user_has_liked = false;
          if (user?.id) {
            const { data: likeData } = await supabase
              .from("feed_likes")
              .select("id")
              .eq("user_id", user.id)
              .eq("post_id", post.id)
              .maybeSingle();
            user_has_liked = !!likeData;
          }

          return { ...post, author, user_has_liked } as FeedPost;
        })
      );

      if (append) {
        setPosts((prev) => [...prev, ...postsWithAuthors]);
      } else {
        setPosts(postsWithAuthors);
      }

      setHasMore(postsWithAuthors.length === PAGE_SIZE);
      setPage(pageNum);
    } catch (err) {
      console.error("Error fetching posts:", err);
      toast.error("Failed to load feed");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Create a new post
  const createPost = useCallback(async (
    content: string,
    linkUrl?: string,
    linkSummary?: string,
    tags?: string[]
  ) => {
    if (!user?.id) {
      toast.error("Please sign in to post");
      return null;
    }

    if (!rateLimits?.can_post) {
      toast.error("You've reached your daily post limit");
      return null;
    }

    // Validate LinkedIn URLs are not in content
    if (content.toLowerCase().includes("linkedin.com")) {
      toast.error("LinkedIn URLs are not allowed in posts");
      return null;
    }

    // Check for link without summary
    if (linkUrl && !linkSummary) {
      toast.error("Please add a summary explaining why this link matters");
      return null;
    }

    const postType = linkUrl ? "shared_article" : "user_post";

    const { data, error } = await supabase
      .from("feed_posts")
      .insert({
        author_id: user.id,
        post_type: postType,
        content,
        link_url: linkUrl || null,
        link_summary: linkSummary || null,
        tags: tags || [],
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
      return null;
    }

    // Update user's total posts
    await supabase
      .from("professional_scores")
      .update({ 
        total_posts: (userScore?.total_posts || 0) + 1,
        last_activity_at: new Date().toISOString()
      })
      .eq("user_id", user.id);

    toast.success("Post published");
    fetchPosts(0, false);
    fetchRateLimits();
    return data;
  }, [user?.id, rateLimits, userScore, fetchPosts, fetchRateLimits]);

  // Like/unlike a post
  const togglePostLike = useCallback(async (postId: string) => {
    if (!user?.id) {
      toast.error("Please sign in to like posts");
      return;
    }

    // Check if already liked
    const { data: existingLike } = await supabase
      .from("feed_likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("post_id", postId)
      .maybeSingle();

    if (existingLike) {
      // Unlike
      await supabase.from("feed_likes").delete().eq("id", existingLike.id);
    } else {
      // Like
      await supabase.from("feed_likes").insert({
        user_id: user.id,
        post_id: postId,
      });
    }

    // Update local state
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              like_count: existingLike ? post.like_count - 1 : post.like_count + 1,
              user_has_liked: !existingLike,
            }
          : post
      )
    );
  }, [user?.id]);

  // Delete a post
  const deletePost = useCallback(async (postId: string) => {
    if (!user?.id) return false;

    const { error } = await supabase
      .from("feed_posts")
      .delete()
      .eq("id", postId)
      .eq("author_id", user.id);

    if (error) {
      toast.error("Failed to delete post");
      return false;
    }

    setPosts((prev) => prev.filter((post) => post.id !== postId));
    toast.success("Post deleted");
    return true;
  }, [user?.id]);

  // Report a post
  const reportPost = useCallback(async (postId: string, reason: string, details?: string) => {
    if (!user?.id) {
      toast.error("Please sign in to report");
      return false;
    }

    const { error } = await supabase.from("feed_reports").insert({
      reporter_id: user.id,
      post_id: postId,
      reason,
      details,
    });

    if (error) {
      toast.error("Failed to submit report");
      return false;
    }

    toast.success("Report submitted. Thank you for helping keep our community professional.");
    return true;
  }, [user?.id]);

  // Load more posts
  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchPosts(page + 1, true);
    }
  }, [hasMore, loading, page, fetchPosts]);

  // Initial fetch
  useEffect(() => {
    fetchPosts(0, false);
    if (user?.id) {
      fetchUserScore();
      fetchRateLimits();
    }
  }, [user?.id, fetchPosts, fetchUserScore, fetchRateLimits]);

  return {
    posts,
    loading,
    hasMore,
    userScore,
    rateLimits,
    createPost,
    togglePostLike,
    deletePost,
    reportPost,
    loadMore,
    refetch: () => fetchPosts(0, false),
    refetchUserScore: fetchUserScore,
  };
};
