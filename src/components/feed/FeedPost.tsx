import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  ExternalLink,
  Flag,
  Trash2,
  Star,
  Briefcase,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { FeedPost as FeedPostType } from "@/hooks/useProfessionalFeed";
import FeedComments from "./FeedComments";
import ReportDialog from "./ReportDialog";

interface FeedPostProps {
  post: FeedPostType;
  onLike: (postId: string) => void;
  onDelete: (postId: string) => Promise<boolean>;
  onReport: (postId: string, reason: string, details?: string) => Promise<boolean>;
}

const getPostTypeLabel = (type: string) => {
  switch (type) {
    case "system_article": return "Industry News";
    case "blog_post": return "Wellness Genius";
    case "shared_article": return "Shared Article";
    default: return null;
  }
};

const FeedPost = ({ post, onLike, onDelete, onReport }: FeedPostProps) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAuthor = user?.id === post.author_id;
  const typeLabel = getPostTypeLabel(post.post_type);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(post.id);
    setIsDeleting(false);
    setShowDeleteDialog(false);
  };

  const handleReport = async (reason: string, details?: string) => {
    await onReport(post.id, reason, details);
    setShowReportDialog(false);
  };

  return (
    <>
      <Card className={cn(
        "border-border/50 bg-card",
        post.is_featured && "border-accent/30 bg-accent/5"
      )}>
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <Briefcase size={18} className="text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  {post.author ? (
                    <>
                      <span className="font-medium text-sm">
                        {post.author.role || "Member"}
                      </span>
                      {post.author.organisation && (
                        <>
                          <span className="text-muted-foreground">at</span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Building2 size={12} />
                            {post.author.organisation}
                          </span>
                        </>
                      )}
                    </>
                  ) : (
                    <span className="font-medium text-sm text-accent">Wellness Genius</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                  {typeLabel && (
                    <>
                      <span>•</span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {typeLabel}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {post.is_featured && (
                <Badge variant="outline" className="text-accent border-accent/30 text-[10px]">
                  <Star size={10} className="mr-1" />
                  High Signal
                </Badge>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isAuthor && (
                    <>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 size={14} className="mr-2" />
                        Delete post
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {!isAuthor && user && (
                    <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                      <Flag size={14} className="mr-2" />
                      Report
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Content */}
          <div className="mb-4">
            <p className="text-sm whitespace-pre-wrap">{post.content}</p>
            
            {/* Link preview */}
            {post.link_url && (
              <a
                href={post.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block p-3 rounded-lg border border-border/50 bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <ExternalLink size={12} />
                  <span className="truncate">{new URL(post.link_url).hostname}</span>
                </div>
                {post.link_summary && (
                  <p className="text-sm text-foreground/80 italic">
                    "{post.link_summary}"
                  </p>
                )}
              </a>
            )}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 pt-3 border-t border-border/30">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-muted-foreground hover:text-foreground",
                post.user_has_liked && "text-red-500 hover:text-red-600"
              )}
              onClick={() => onLike(post.id)}
            >
              <Heart size={16} className={cn(post.user_has_liked && "fill-current")} />
              <span className="ml-1 text-xs">{post.like_count || ""}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle size={16} />
              <span className="ml-1 text-xs">{post.comment_count || ""}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground ml-auto"
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin + `/feed/post/${post.id}`);
              }}
            >
              <Share2 size={16} />
            </Button>
          </div>

          {/* Comments section */}
          {showComments && (
            <div className="mt-4 pt-4 border-t border-border/30">
              <FeedComments postId={post.id} postAuthorId={post.author_id} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Your post and all its comments will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report dialog */}
      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        onSubmit={handleReport}
        type="post"
      />
    </>
  );
};

export default FeedPost;
