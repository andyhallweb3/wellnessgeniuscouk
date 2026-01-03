import { useState } from "react";
import { Link as LinkIcon, Send, Loader2, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { RateLimits } from "@/hooks/useProfessionalFeed";

interface CreatePostFormProps {
  onSubmit: (content: string, linkUrl?: string, linkSummary?: string) => Promise<unknown>;
  rateLimits: RateLimits | null;
}

const CreatePostForm = ({ onSubmit, rateLimits }: CreatePostFormProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [showLinkFields, setShowLinkFields] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkSummary, setLinkSummary] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canPost = rateLimits?.can_post ?? true;
  const postsRemaining = rateLimits ? rateLimits.posts_per_day - rateLimits.posts_today : 0;

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    const result = await onSubmit(
      content.trim(),
      showLinkFields && linkUrl ? linkUrl : undefined,
      showLinkFields && linkSummary ? linkSummary : undefined
    );
    
    if (result) {
      setContent("");
      setLinkUrl("");
      setLinkSummary("");
      setShowLinkFields(false);
    }
    setIsSubmitting(false);
  };

  if (!user) {
    return (
      <Card className="border-border/50 bg-secondary/30">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground text-center">
            Sign in to share insights with the community.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card">
      <CardContent className="p-4 space-y-4">
        {/* Rate limit warning */}
        {!canPost && (
          <Alert variant="destructive">
            <AlertCircle size={14} />
            <AlertDescription className="text-xs">
              You've reached your daily post limit. Your limit increases as your contribution score grows.
            </AlertDescription>
          </Alert>
        )}

        {/* Main content */}
        <div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share an insight, ask a thoughtful question, or contribute to the conversation..."
            className="min-h-[100px] resize-none border-0 p-0 focus-visible:ring-0 text-sm"
            disabled={!canPost}
          />
        </div>

        {/* Link toggle */}
        <div className="flex items-center justify-between border-t border-border/30 pt-3">
          <div className="flex items-center gap-2">
            <Switch
              id="add-link"
              checked={showLinkFields}
              onCheckedChange={setShowLinkFields}
              disabled={!canPost}
            />
            <Label htmlFor="add-link" className="text-xs text-muted-foreground cursor-pointer">
              <LinkIcon size={12} className="inline mr-1" />
              Share an article
            </Label>
          </div>
          {rateLimits && (
            <Badge variant="outline" className="text-[10px]">
              {postsRemaining} post{postsRemaining !== 1 ? "s" : ""} remaining today
            </Badge>
          )}
        </div>

        {/* Link fields */}
        {showLinkFields && (
          <div className="space-y-3 p-3 rounded-lg bg-secondary/30 border border-border/30">
            <Alert>
              <Info size={14} />
              <AlertDescription className="text-xs">
                Articles require a summary explaining why this matters to wellness professionals.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="link-url" className="text-xs">Article URL</Label>
              <Input
                id="link-url"
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-summary" className="text-xs">
                Why this matters <span className="text-muted-foreground">(required)</span>
              </Label>
              <Textarea
                id="link-summary"
                value={linkSummary}
                onChange={(e) => setLinkSummary(e.target.value)}
                placeholder="Explain the key insight or why this is relevant..."
                className="min-h-[60px] resize-none text-sm"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {linkSummary.length}/500
              </p>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || !canPost || isSubmitting || (showLinkFields && linkUrl && !linkSummary)}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send size={14} />
                Share
              </>
            )}
          </Button>
        </div>

        {/* Guidelines hint */}
        <p className="text-[10px] text-muted-foreground text-center border-t border-border/30 pt-3">
          Keep it professional. No LinkedIn URLs. No medical claims. Add context to links.
        </p>
      </CardContent>
    </Card>
  );
};

export default CreatePostForm;
