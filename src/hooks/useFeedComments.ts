import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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

export const useFeedComments = (postId: string) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch comments for a post
  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("feed_comments")
        .select("*")
        .eq("post_id", postId)
        .eq("moderation_status", "approved")
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch author info and likes for each comment
      const commentsWithDetails = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: authorData } = await supabase
            .from("professional_scores")
            .select("role, organisation")
            .eq("user_id", comment.author_id)
            .maybeSingle();

          let user_has_liked = false;
          if (user?.id) {
            const { data: likeData } = await supabase
              .from("feed_likes")
              .select("id")
              .eq("user_id", user.id)
              .eq("comment_id", comment.id)
              .maybeSingle();
            user_has_liked = !!likeData;
          }

          return {
            ...comment,
            author: authorData || undefined,
            user_has_liked,
          } as FeedComment;
        })
      );

      // Organize into parent/child hierarchy
      const parentComments = commentsWithDetails.filter((c) => !c.parent_comment_id);
      const childComments = commentsWithDetails.filter((c) => c.parent_comment_id);

      const organizedComments = parentComments.map((parent) => ({
        ...parent,
        replies: childComments.filter((c) => c.parent_comment_id === parent.id),
      }));

      setComments(organizedComments);
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  }, [postId, user?.id]);

  // Create a comment
  const createComment = useCallback(async (
    content: string,
    parentCommentId?: string
  ) => {
    if (!user?.id) {
      toast.error("Please sign in to comment");
      return null;
    }

    if (content.length > 600) {
      toast.error("Comments must be 600 characters or less");
      return null;
    }

    // Check for low-effort comments
    const lowEffortPatterns = [
      /^great\s*post[!.]*$/i,
      /^love\s*this[!.]*$/i,
      /^nice[!.]*$/i,
      /^thanks[!.]*$/i,
      /^agreed[!.]*$/i,
      /^same[!.]*$/i,
      /^\+1[!.]*$/i,
      /^this[!.]*$/i,
    ];

    if (lowEffortPatterns.some((p) => p.test(content.trim()))) {
      toast.error("Please add more substance to your comment");
      return null;
    }

    const { data, error } = await supabase
      .from("feed_comments")
      .insert({
        post_id: postId,
        author_id: user.id,
        parent_comment_id: parentCommentId || null,
        content,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating comment:", error);
      toast.error("Failed to post comment");
      return null;
    }

    // Update user's total comments
    await supabase.rpc("get_user_rate_limits", { p_user_id: user.id });

    toast.success("Comment posted");
    fetchComments();
    return data;
  }, [user?.id, postId, fetchComments]);

  // Like/unlike a comment
  const toggleCommentLike = useCallback(async (commentId: string) => {
    if (!user?.id) {
      toast.error("Please sign in to like comments");
      return;
    }

    const { data: existingLike } = await supabase
      .from("feed_likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("comment_id", commentId)
      .maybeSingle();

    if (existingLike) {
      await supabase.from("feed_likes").delete().eq("id", existingLike.id);
    } else {
      await supabase.from("feed_likes").insert({
        user_id: user.id,
        comment_id: commentId,
      });
    }

    // Update local state
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            like_count: existingLike ? comment.like_count - 1 : comment.like_count + 1,
            user_has_liked: !existingLike,
          };
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply.id === commentId
                ? {
                    ...reply,
                    like_count: existingLike ? reply.like_count - 1 : reply.like_count + 1,
                    user_has_liked: !existingLike,
                  }
                : reply
            ),
          };
        }
        return comment;
      })
    );
  }, [user?.id]);

  // Delete a comment
  const deleteComment = useCallback(async (commentId: string) => {
    if (!user?.id) return false;

    const { error } = await supabase
      .from("feed_comments")
      .delete()
      .eq("id", commentId)
      .eq("author_id", user.id);

    if (error) {
      toast.error("Failed to delete comment");
      return false;
    }

    fetchComments();
    toast.success("Comment deleted");
    return true;
  }, [user?.id, fetchComments]);

  // Report a comment
  const reportComment = useCallback(async (commentId: string, reason: string, details?: string) => {
    if (!user?.id) {
      toast.error("Please sign in to report");
      return false;
    }

    const { error } = await supabase.from("feed_reports").insert({
      reporter_id: user.id,
      comment_id: commentId,
      reason,
      details,
    });

    if (error) {
      toast.error("Failed to submit report");
      return false;
    }

    toast.success("Report submitted");
    return true;
  }, [user?.id]);

  // Mark comment as helpful
  const toggleHelpful = useCallback(async (commentId: string, isHelpful: boolean) => {
    // Only post authors or admins can mark as helpful
    const { error } = await supabase
      .from("feed_comments")
      .update({ is_helpful: !isHelpful })
      .eq("id", commentId);

    if (error) {
      toast.error("Failed to update");
      return;
    }

    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    loading,
    fetchComments,
    createComment,
    toggleCommentLike,
    deleteComment,
    reportComment,
    toggleHelpful,
  };
};
