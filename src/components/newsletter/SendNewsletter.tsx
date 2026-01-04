import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Send, 
  Loader2, 
  ChevronLeft,
  Users,
  Twitter,
  Linkedin,
  Copy,
  AlertCircle,
  Search,
  UserCheck,
  X
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface SendNewsletterProps {
  previewHtml: string | null;
  articles: any[];
  selectedArticleIds: string[];
  getAuthHeaders: () => Record<string, string>;
  onSendComplete: () => void;
  onBack: () => void;
}

interface SendProgress {
  totalSubscribers: number;
  sentCount: number;
  currentBatch: number;
  totalBatches: number;
  sendId: string | null;
}

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  is_active: boolean;
}

export const SendNewsletter = ({
  previewHtml,
  articles,
  selectedArticleIds,
  getAuthHeaders,
  onSendComplete,
  onBack,
}: SendNewsletterProps) => {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState<SendProgress | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [subscriberSearch, setSubscriberSearch] = useState("");
  const [sendMode, setSendMode] = useState<"all" | "selected">("all");
  const [showTwitterModal, setShowTwitterModal] = useState(false);
  const [customTweet, setCustomTweet] = useState("");
  const [postingToTwitter, setPostingToTwitter] = useState(false);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoadingSubscribers(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-subscribers", {
        body: { action: "list" },
        headers: getAuthHeaders(),
      });

      if (error) throw error;
      const active = (data.subscribers || []).filter((s: any) => s.is_active && !s.bounced);
      setSubscribers(active);
    } catch (error) {
      console.error("Failed to fetch subscribers:", error);
    } finally {
      setLoadingSubscribers(false);
    }
  };

  const subscriberCount = subscribers.length;
  
  const filteredSubscribers = subscribers.filter(sub => 
    sub.email.toLowerCase().includes(subscriberSearch.toLowerCase()) ||
    sub.name?.toLowerCase().includes(subscriberSearch.toLowerCase())
  );

  const toggleSubscriber = (email: string) => {
    const newSelected = new Set(selectedEmails);
    if (newSelected.has(email)) {
      newSelected.delete(email);
    } else {
      newSelected.add(email);
    }
    setSelectedEmails(newSelected);
  };

  const selectAll = () => {
    setSelectedEmails(new Set(filteredSubscribers.map(s => s.email)));
  };

  const clearSelection = () => {
    setSelectedEmails(new Set());
  };

  const recipientCount = sendMode === "all" ? subscriberCount : selectedEmails.size;

  const sendNewsletter = async () => {
    if (!previewHtml) {
      toast({
        title: "No Preview",
        description: "Please generate a preview first.",
        variant: "destructive",
      });
      return;
    }

    if (sendMode === "selected" && selectedEmails.size === 0) {
      toast({
        title: "No Recipients",
        description: "Please select at least one subscriber.",
        variant: "destructive",
      });
      return;
    }

    const recipientLabel = sendMode === "all" 
      ? `${subscriberCount} active subscribers` 
      : `${selectedEmails.size} selected subscriber${selectedEmails.size > 1 ? 's' : ''}`;
    
    if (!confirm(`Are you sure you want to send this newsletter to ${recipientLabel}?`)) {
      return;
    }

    setSending(true);

    try {
      const targetEmails = sendMode === "selected" ? Array.from(selectedEmails) : undefined;
      
      const { data, error } = await supabase.functions.invoke("newsletter-run", {
        body: { preview: false, selectedArticleIds, targetEmails },
        headers: getAuthHeaders(),
      });

      if (error) throw error;

      const totalSubscribers = data?.subscriberCount || 0;
      const sendId = data?.sendId as string | undefined;
      const batchSize = data?.batchSize || 50;

      if (!sendId) {
        throw new Error("Send started but no sendId returned");
      }

      const totalBatches = Math.max(1, Math.ceil(totalSubscribers / batchSize));

      setSendProgress({
        totalSubscribers,
        sentCount: 0,
        currentBatch: 1,
        totalBatches,
        sendId,
      });

      toast({
        title: "Sending started",
        description: `Queued ${totalSubscribers} emails. This will run in the background.`,
      });

      // Poll for progress
      const poll = setInterval(async () => {
        const { data: statusData, error: statusError } = await supabase.functions.invoke(
          "newsletter-run",
          {
            body: { action: "status", sendId },
            headers: getAuthHeaders(),
          }
        );

        if (statusError) return;

        const sendRow = statusData?.send;
        const sentCount = sendRow?.recipient_count || 0;
        const status = sendRow?.status || "sending";

        setSendProgress((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            sentCount,
            currentBatch: Math.min(totalBatches, Math.max(1, Math.ceil(sentCount / batchSize))),
          };
        });

        if (status === "sent" || status === "partial" || status === "failed") {
          clearInterval(poll);
          setSending(false);

          if (status === "sent") {
            toast({
              title: "Newsletter sent",
              description: `Sent ${sentCount} emails successfully.`,
            });
          } else if (status === "partial") {
            toast({
              title: "Partially sent",
              description: sendRow?.error_message || `Sent ${sentCount} emails with some failures.`,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Send failed",
              description: sendRow?.error_message || "Newsletter send failed.",
              variant: "destructive",
            });
          }

          setTimeout(() => {
            setSendProgress(null);
            onSendComplete();
          }, 1500);
        }
      }, 2000);
    } catch (err) {
      toast({
        title: "Send Failed",
        description: err instanceof Error ? err.message : "Failed to start sending",
        variant: "destructive",
      });
      setSending(false);
      setSendProgress(null);
    }
  };

  const generateDefaultTweet = () => {
    if (!articles || articles.length === 0) {
      return "📰 New edition of Wellness Genius Weekly is out! AI insights for the wellness industry. Subscribe at wellnessgenius.co #AI #Wellness #Newsletter";
    }
    const topArticle = articles[0];
    const title = topArticle.title || "industry insights";
    const hashtags = "#AI #Wellness #FitnessTech";
    const cta = "\n\n📬 Subscribe: wellnessgenius.co";
    const fixedLength = hashtags.length + cta.length + 5;
    const maxHeadline = 280 - fixedLength;
    let headline = `🔥 ${title}`;
    if (headline.length > maxHeadline) {
      headline = headline.substring(0, maxHeadline - 3) + "...";
    }
    return `${headline}\n\n${hashtags}${cta}`;
  };

  const postToTwitter = async () => {
    setPostingToTwitter(true);
    try {
      const tweetText = customTweet.trim() || generateDefaultTweet();

      const { data, error } = await supabase.functions.invoke("post-to-twitter", {
        body: {
          articles: articles,
          customTweet: tweetText,
        },
        headers: getAuthHeaders(),
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Failed to post");

      toast({
        title: "Posted to Twitter!",
        description: "Your newsletter summary has been shared on X.",
      });
      setShowTwitterModal(false);
      setCustomTweet("");
    } catch (error) {
      console.error("Twitter post error:", error);
      toast({
        title: "Twitter Post Failed",
        description: error instanceof Error ? error.message : "Failed to post to Twitter",
        variant: "destructive",
      });
    } finally {
      setPostingToTwitter(false);
    }
  };

  const generateLinkedInPost = () => {
    if (!articles || articles.length === 0) {
      return `📰 New edition of Wellness Genius Weekly is out!

AI-powered insights for wellness, fitness and hospitality operators.

📬 Subscribe for free: wellnessgenius.co

#AI #WellnessIndustry #FitnessBusiness #HealthTech`;
    }

    const topArticle = articles[0];
    const otherArticles = articles.slice(1, 4);

    let post = `📰 This week in AI + Wellness:

🔥 ${topArticle.title}`;

    if (otherArticles.length > 0) {
      post += `\n\nAlso in this edition:`;
      otherArticles.forEach((article) => {
        post += `\n• ${article.title.length > 60 ? article.title.substring(0, 57) + "..." : article.title}`;
      });
    }

    post += `\n\n📬 Get the full breakdown: wellnessgenius.co

#AI #WellnessIndustry #FitnessBusiness #HealthTech`;

    return post;
  };

  const copyLinkedInPost = () => {
    const post = generateLinkedInPost();
    navigator.clipboard.writeText(post);
    toast({
      title: "LinkedIn Post Copied",
      description: "Paste into LinkedIn to share your newsletter.",
    });
  };

  if (!previewHtml) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Preview Available</h3>
            <p className="text-muted-foreground mb-4">
              Please go back and generate a preview before sending.
            </p>
            <Button variant="outline" onClick={onBack}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Preview
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Step 3: Send Newsletter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Send progress */}
          {sendProgress && (
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Sending emails...</span>
                <span>
                  {sendProgress.sentCount} / {sendProgress.totalSubscribers}
                </span>
              </div>
              <Progress
                value={(sendProgress.sentCount / sendProgress.totalSubscribers) * 100}
              />
              <p className="text-xs text-muted-foreground">
                Batch {sendProgress.currentBatch} of {sendProgress.totalBatches}
              </p>
            </div>
          )}

          {/* Send Mode Selection */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={sendMode === "all" ? "default" : "outline"}
                onClick={() => setSendMode("all")}
                className="flex-1"
              >
                <Users className="h-4 w-4 mr-2" />
                All Subscribers ({subscriberCount})
              </Button>
              <Button
                variant={sendMode === "selected" ? "default" : "outline"}
                onClick={() => setSendMode("selected")}
                className="flex-1"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Select Recipients {selectedEmails.size > 0 && `(${selectedEmails.size})`}
              </Button>
            </div>

            {/* Subscriber Selection Panel */}
            {sendMode === "selected" && (
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search subscribers..."
                      value={subscriberSearch}
                      onChange={(e) => setSubscriberSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={selectAll}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearSelection}>
                    Clear
                  </Button>
                </div>

                {/* Selected chips */}
                {selectedEmails.size > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from(selectedEmails).slice(0, 10).map(email => (
                      <Badge key={email} variant="secondary" className="gap-1">
                        {email}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-destructive" 
                          onClick={() => toggleSubscriber(email)}
                        />
                      </Badge>
                    ))}
                    {selectedEmails.size > 10 && (
                      <Badge variant="outline">+{selectedEmails.size - 10} more</Badge>
                    )}
                  </div>
                )}

                {/* Subscriber list */}
                <ScrollArea className="h-48 border rounded-md">
                  {loadingSubscribers ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  ) : filteredSubscribers.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      No subscribers found
                    </div>
                  ) : (
                    <div className="p-2 space-y-1">
                      {filteredSubscribers.map(sub => (
                        <label
                          key={sub.id}
                          className="flex items-center gap-3 p-2 rounded hover:bg-accent cursor-pointer"
                        >
                          <Checkbox
                            checked={selectedEmails.has(sub.email)}
                            onCheckedChange={() => toggleSubscriber(sub.email)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{sub.email}</p>
                            {sub.name && (
                              <p className="text-xs text-muted-foreground truncate">{sub.name}</p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}
          </div>

          {/* Send controls */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Recipients</span>
              </div>
              <p className="text-2xl font-bold">
                {recipientCount}
              </p>
              <p className="text-sm text-muted-foreground">
                {sendMode === "all" ? "All active subscribers" : "Selected subscribers"}
              </p>
            </div>

            <div className="p-4 rounded-lg border space-y-3">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Ready to Send</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {articles.length} articles prepared
              </p>
              <Button
                onClick={sendNewsletter}
                disabled={sending || recipientCount === 0}
                className="w-full"
                variant="default"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send to {recipientCount} {recipientCount === 1 ? 'Recipient' : 'Recipients'}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Social sharing */}
          <div className="border-t pt-6">
            <h4 className="font-medium mb-4">Share on Social Media</h4>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowTwitterModal(true)}>
                <Twitter className="h-4 w-4 mr-2" />
                Post to X
              </Button>
              <Button variant="outline" onClick={copyLinkedInPost}>
                <Linkedin className="h-4 w-4 mr-2" />
                Copy for LinkedIn
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-start">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back to Preview
        </Button>
      </div>

      {/* Twitter Modal */}
      <Dialog open={showTwitterModal} onOpenChange={setShowTwitterModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post to X (Twitter)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={customTweet || generateDefaultTweet()}
              onChange={(e) => setCustomTweet(e.target.value)}
              rows={6}
              placeholder="Customize your tweet..."
            />
            <p className="text-xs text-muted-foreground">
              {(customTweet || generateDefaultTweet()).length}/280 characters
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTwitterModal(false)}>
              Cancel
            </Button>
            <Button onClick={postToTwitter} disabled={postingToTwitter}>
              {postingToTwitter ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Twitter className="h-4 w-4 mr-2" />
              )}
              Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
