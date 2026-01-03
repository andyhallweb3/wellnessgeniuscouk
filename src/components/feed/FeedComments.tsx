import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { 
  Heart, 
  Reply, 
  MoreHorizontal, 
  Flag, 
  Trash2,
  CheckCircle,
  Briefcase,
  Send,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useFeedComments, FeedComment } from "@/hooks/useFeedComments";
import ReportDialog from "./ReportDialog";

interface FeedCommentsProps {
  postId: string;
  postAuthorId: string | null;
}

const CommentItem = ({ 
  comment, 
  onLike, 
  onReply, 
  onDelete,
  onReport,
  onToggleHelpful,
  isPostAuthor,
  depth = 0 
}: { 
  comment: FeedComment;
  onLike: (id: string) => void;
  onReply: (id: string) => void;
  onDelete: (id: string) => void;
  onReport: (id: string) => void;
  onToggleHelpful: (id: string, isHelpful: boolean) => void;
  isPostAuthor: boolean;
  depth?: number;
}) => {
  const { user } = useAuth();
  const isAuthor = user?.id === comment.author_id;

  return (
    <div className={cn("py-3", depth > 0 && "ml-8 border-l border-border/30 pl-4")}>
      <div className="flex items-start gap-2">
        <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
          <Briefcase size={12} className="text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium">
              {comment.author?.role || "Member"}
            </span>
            {comment.author?.organisation && (
              <span className="text-xs text-muted-foreground">
                at {comment.author.organisation}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
            {comment.is_helpful && (
              <Badge variant="outline" className="text-[10px] text-green-500 border-green-500/30">
                <CheckCircle size={10} className="mr-1" />
                Helpful
              </Badge>
            )}
          </div>
          <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
          
          <div className="flex items-center gap-1 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 px-2 text-xs text-muted-foreground",
                comment.user_has_liked && "text-red-500"
              )}
              onClick={() => onLike(comment.id)}
            >
              <Heart size={12} className={cn(comment.user_has_liked && "fill-current")} />
              <span className="ml-1">{comment.like_count || ""}</span>
            </Button>
            
            {depth === 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground"
                onClick={() => onReply(comment.id)}
              >
                <Reply size={12} />
                <span className="ml-1">Reply</span>
              </Button>
            )}

            {isPostAuthor && !isAuthor && (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-6 px-2 text-xs",
                  comment.is_helpful ? "text-green-500" : "text-muted-foreground"
                )}
                onClick={() => onToggleHelpful(comment.id, comment.is_helpful)}
              >
                <CheckCircle size={12} />
                <span className="ml-1">{comment.is_helpful ? "Helpful" : "Mark helpful"}</span>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-auto">
                  <MoreHorizontal size={12} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isAuthor && (
                  <DropdownMenuItem 
                    className="text-destructive text-xs"
                    onClick={() => onDelete(comment.id)}
                  >
                    <Trash2 size={12} className="mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
                {!isAuthor && user && (
                  <DropdownMenuItem 
                    className="text-xs"
                    onClick={() => onReport(comment.id)}
                  >
                    <Flag size={12} className="mr-2" />
                    Report
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onLike={onLike}
              onReply={onReply}
              onDelete={onDelete}
              onReport={onReport}
              onToggleHelpful={onToggleHelpful}
              isPostAuthor={isPostAuthor}
              depth={1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FeedComments = ({ postId, postAuthorId }: FeedCommentsProps) => {
  const { user } = useAuth();
  const {
    comments,
    loading,
    fetchComments,
    createComment,
    toggleCommentLike,
    deleteComment,
    reportComment,
    toggleHelpful,
  } = useFeedComments(postId);

  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);

  const isPostAuthor = user?.id === postAuthorId;

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    await createComment(newComment.trim(), replyingTo || undefined);
    setNewComment("");
    setReplyingTo(null);
    setSubmitting(false);
  };

  const handleReport = async (reason: string, details?: string) => {
    if (reportingCommentId) {
      await reportComment(reportingCommentId, reason, details);
      setReportingCommentId(null);
    }
  };

  return (
    <div className="space-y-3">
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 size={16} className="animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          No comments yet. Be the first to share your thoughts.
        </p>
      ) : (
        <div className="divide-y divide-border/30">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onLike={toggleCommentLike}
              onReply={setReplyingTo}
              onDelete={deleteComment}
              onReport={setReportingCommentId}
              onToggleHelpful={toggleHelpful}
              isPostAuthor={isPostAuthor}
            />
          ))}
        </div>
      )}

      {/* Comment input */}
      {user && (
        <div className="pt-3 border-t border-border/30">
          {replyingTo && (
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Replying to comment</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 text-xs"
                onClick={() => setReplyingTo(null)}
              >
                Cancel
              </Button>
            </div>
          )}
          <div className="flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a thoughtful comment..."
              className="min-h-[60px] text-sm resize-none"
              maxLength={600}
            />
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!newComment.trim() || submitting}
              className="self-end"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {newComment.length}/600
          </p>
        </div>
      )}

      <ReportDialog
        open={!!reportingCommentId}
        onOpenChange={(open) => !open && setReportingCommentId(null)}
        onSubmit={handleReport}
        type="comment"
      />
    </div>
  );
};

export default FeedComments;
