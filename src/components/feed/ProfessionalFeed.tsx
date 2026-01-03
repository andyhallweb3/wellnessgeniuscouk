import { useEffect, useCallback } from "react";
import { Loader2, RefreshCw, Newspaper, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProfessionalFeed } from "@/hooks/useProfessionalFeed";
import CreatePostForm from "./CreatePostForm";
import FeedPost from "./FeedPost";
import ProfessionalScoreCard from "./ProfessionalScoreCard";
import FeedLeaderboard from "./FeedLeaderboard";

const ProfessionalFeed = () => {
  const {
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
    refetch,
    refetchUserScore,
  } = useProfessionalFeed();

  // Infinite scroll
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 500
    ) {
      if (hasMore && !loading) {
        loadMore();
      }
    }
  }, [hasMore, loading, loadMore]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      {/* Main Feed */}
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-heading flex items-center gap-2">
              <Newspaper size={20} className="text-accent" />
              Professional Feed
            </h2>
            <p className="text-xs text-muted-foreground">
              Industry insights from wellness professionals
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={refetch} disabled={loading}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>

        {/* Create Post */}
        <CreatePostForm onSubmit={createPost} rateLimits={rateLimits} />

        {/* Feed filters */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs cursor-pointer hover:bg-secondary">
            All Posts
          </Badge>
          <Badge variant="outline" className="text-xs cursor-pointer hover:bg-secondary">
            Industry News
          </Badge>
          <Badge variant="outline" className="text-xs cursor-pointer hover:bg-secondary">
            Discussions
          </Badge>
          <Badge variant="outline" className="text-xs cursor-pointer hover:bg-secondary">
            Featured
          </Badge>
        </div>

        {/* Posts */}
        {loading && posts.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-secondary/30 rounded-lg border border-border/50">
            <Users size={32} className="mx-auto mb-3 text-muted-foreground" />
            <h3 className="font-medium mb-1">No posts yet</h3>
            <p className="text-sm text-muted-foreground">
              Be the first to share an insight with the community.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <FeedPost
                key={post.id}
                post={post}
                onLike={togglePostLike}
                onDelete={deletePost}
                onReport={reportPost}
              />
            ))}
            
            {/* Load more */}
            {loading && (
              <div className="flex justify-center py-4">
                <Loader2 size={20} className="animate-spin text-muted-foreground" />
              </div>
            )}
            
            {!hasMore && posts.length > 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                You've reached the end of the feed
              </p>
            )}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Professional Score */}
        <ProfessionalScoreCard 
          score={userScore} 
          rateLimits={rateLimits}
          onUpdate={refetchUserScore}
        />

        {/* Leaderboard */}
        <FeedLeaderboard />

        {/* Community guidelines */}
        <div className="p-4 rounded-lg border border-border/50 bg-secondary/30">
          <h3 className="text-sm font-medium mb-2">Community Guidelines</h3>
          <ul className="text-xs text-muted-foreground space-y-1.5">
            <li>• Share insights, not promotions</li>
            <li>• Add context to linked articles</li>
            <li>• No medical claims or misinformation</li>
            <li>• Keep discussions professional</li>
            <li>• LinkedIn URLs in profiles only</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalFeed;
