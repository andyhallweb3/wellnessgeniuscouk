import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, 
  Send, 
  Eye, 
  Users, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Search,
  UserPlus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  preview_text: string | null;
  template_type: string;
  is_active: boolean;
  created_at: string;
}

interface EmailCampaignsProps {
  getAuthHeaders: () => Record<string, string>;
}

interface SubscriberStats {
  total: number;
  active: number;
  delivered: number;
  bounced: number;
  neverDelivered: number;
  unsubscribed: number;
}

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  is_active: boolean;
}

export const EmailCampaigns = ({ getAuthHeaders }: EmailCampaignsProps) => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriberStats, setSubscriberStats] = useState<SubscriberStats>({
    total: 0,
    active: 0,
    delivered: 0,
    bounced: 0,
    neverDelivered: 0,
    unsubscribed: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [sendingCampaign, setSendingCampaign] = useState(false);
  const [onlyDelivered, setOnlyDelivered] = useState(false);
  const [sendMode, setSendMode] = useState<"batch" | "individual">("batch");
  
  // Subscriber search state
  const [subscriberSearch, setSubscriberSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Subscriber[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
  const [sendToSpecificOpen, setSendToSpecificOpen] = useState(false);
  const [sendingToSpecific, setSendingToSpecific] = useState(false);

  useEffect(() => {
    fetchTemplates();
    fetchSubscriberStats();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .in("template_type", ["campaign", "marketing", "announcement"])
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast({
        title: "Error",
        description: "Failed to load email templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriberStats = async () => {
    setStatsLoading(true);
    try {
      // Use edge function to bypass RLS
      const { data, error } = await supabase.functions.invoke("newsletter-run", {
        body: { action: "subscriber-stats" },
        headers: getAuthHeaders(),
      });

      if (error) throw error;

      if (data?.stats) {
        setSubscriberStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching subscriber stats:", error);
      toast({
        title: "Error",
        description: "Failed to load subscriber stats",
        variant: "destructive",
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const searchSubscribers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setSearchLoading(true);
    try {
      // Use edge function to bypass RLS
      const { data, error } = await supabase.functions.invoke("newsletter-run", {
        body: { action: "search-subscribers", query },
        headers: getAuthHeaders(),
      });

      if (error) throw error;
      setSearchResults(data?.subscribers || []);
    } catch (error) {
      console.error("Error searching subscribers:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchSubscribers(subscriberSearch);
    }, 300);
    return () => clearTimeout(debounce);
  }, [subscriberSearch]);

  const handlePreview = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  const handleSendDialog = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setSendDialogOpen(true);
  };

  const handleSendToSpecific = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setSendToSpecificOpen(true);
    setSubscriberSearch("");
    setSearchResults([]);
    setSelectedSubscriber(null);
  };

  const sendToSpecificSubscriber = async () => {
    if (!selectedTemplate || !selectedSubscriber) return;

    setSendingToSpecific(true);
    try {
      const { error } = await supabase.functions.invoke("send-campaign-email", {
        body: {
          templateId: selectedTemplate.id,
          subject: selectedTemplate.subject,
          html: selectedTemplate.html_content,
          previewText: selectedTemplate.preview_text,
          specificEmail: selectedSubscriber.email,
        },
        headers: getAuthHeaders(),
      });

      if (error) throw error;

      toast({
        title: "Email sent!",
        description: `Sent to ${selectedSubscriber.email}`,
      });
      setSendToSpecificOpen(false);
      setSelectedSubscriber(null);
      setSubscriberSearch("");
    } catch (error: any) {
      console.error("Error sending to specific subscriber:", error);
      toast({
        title: "Failed to send",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setSendingToSpecific(false);
    }
  };

  const sendTestEmail = async () => {
    if (!selectedTemplate || !testEmail) return;

    setSendingTest(true);
    try {
      const { error } = await supabase.functions.invoke("send-test-email", {
        body: {
          to: testEmail,
          subject: selectedTemplate.subject,
          html: selectedTemplate.html_content,
          previewText: selectedTemplate.preview_text,
        },
      });

      if (error) throw error;

      toast({
        title: "Test email sent!",
        description: `Sent to ${testEmail}`,
      });
    } catch (error: any) {
      console.error("Error sending test email:", error);
      toast({
        title: "Failed to send test",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setSendingTest(false);
    }
  };

  const sendCampaign = async () => {
    if (!selectedTemplate) return;

    setSendingCampaign(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-campaign-email", {
        body: {
          templateId: selectedTemplate.id,
          subject: selectedTemplate.subject,
          html: selectedTemplate.html_content,
          previewText: selectedTemplate.preview_text,
          onlyDelivered: onlyDelivered,
          sendMode: sendMode,
        },
        headers: getAuthHeaders(),
      });

      if (error) throw error;

      toast({
        title: "Campaign sent!",
        description: `Email sent to ${data?.recipientCount || 0} subscribers${data?.errorCount ? ` (${data.errorCount} failed)` : ''}`,
      });
      setSendDialogOpen(false);
      fetchSubscriberStats();
    } catch (error: any) {
      console.error("Error sending campaign:", error);
      toast({
        title: "Failed to send campaign",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setSendingCampaign(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Campaigns</h2>
          <p className="text-muted-foreground">
            Send email templates to your subscribers via Resend
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { fetchTemplates(); fetchSubscriberStats(); }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Subscriber Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card className="p-3">
          <div className="text-sm text-muted-foreground">Total</div>
          <div className="text-2xl font-bold">
            {statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : subscriberStats.total}
          </div>
        </Card>
        <Card className="p-3 border-green-500/30 bg-green-500/10">
          <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Delivered
          </div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-400">
            {statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : subscriberStats.delivered}
          </div>
          <div className="text-xs text-muted-foreground">confirmed receipt</div>
        </Card>
        <Card className="p-3">
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Users className="h-3 w-3" />
            Active
          </div>
          <div className="text-2xl font-bold">
            {statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : subscriberStats.active}
          </div>
          <div className="text-xs text-muted-foreground">will receive campaign</div>
        </Card>
        <Card className="p-3 border-amber-500/30 bg-amber-500/10">
          <div className="text-sm text-amber-600 dark:text-amber-400">New</div>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
            {statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : subscriberStats.neverDelivered}
          </div>
          <div className="text-xs text-muted-foreground">no delivery yet</div>
        </Card>
        <Card className="p-3 border-red-500/30 bg-red-500/10">
          <div className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Bounced
          </div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-400">
            {statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : subscriberStats.bounced}
          </div>
          <div className="text-xs text-muted-foreground">excluded from sends</div>
        </Card>
        <Card className="p-3 border-muted">
          <div className="text-sm text-muted-foreground">Unsubscribed</div>
          <div className="text-2xl font-bold text-muted-foreground">
            {statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : subscriberStats.unsubscribed}
          </div>
          <div className="text-xs text-muted-foreground">opted out</div>
        </Card>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No campaign templates</h3>
            <p className="text-muted-foreground">
              Create a campaign template in Email Templates Admin to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {template.subject}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{template.template_type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {template.preview_text && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {template.preview_text}
                  </p>
                )}
                <div className="flex items-center gap-3 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(template)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendToSpecific(template)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Send to Email
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSendDialog(template)}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send to All
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              Subject: {selectedTemplate?.subject}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto max-h-[70vh] border rounded-lg">
            <iframe
              srcDoc={selectedTemplate?.html_content}
              className="w-full h-[600px]"
              title="Email Preview"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Dialog */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Campaign</DialogTitle>
            <DialogDescription>
              Send "{selectedTemplate?.name}" to all active subscribers
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Test Email Section */}
            <div className="space-y-3">
              <Label>Send Test Email First</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
                <Button
                  variant="outline"
                  onClick={sendTestEmail}
                  disabled={!testEmail || sendingTest}
                >
                  {sendingTest ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Test"
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Recommended: Test the email before sending to all subscribers
              </p>
            </div>

            <Separator />

            {/* Send to All Section */}
            <div className="space-y-3">
              {/* Send mode toggle */}
              <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
                <div className="space-y-0.5">
                  <Label htmlFor="send-mode" className="font-medium">
                    Individual sending mode
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Send one email per recipient for better delivery tracking (slower)
                  </p>
                </div>
                <Switch
                  id="send-mode"
                  checked={sendMode === "individual"}
                  onCheckedChange={(checked) => setSendMode(checked ? "individual" : "batch")}
                />
              </div>

              {/* Filter toggle */}
              <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
                <div className="space-y-0.5">
                  <Label htmlFor="only-delivered" className="font-medium">
                    Only send to confirmed deliveries
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Exclude new subscribers who haven't received an email yet
                  </p>
                </div>
                <Switch
                  id="only-delivered"
                  checked={onlyDelivered}
                  onCheckedChange={setOnlyDelivered}
                />
              </div>

              <div className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Will be sent to:</span>
                  <span className="font-bold text-lg">
                    {onlyDelivered ? subscriberStats.delivered : subscriberStats.active} subscribers
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    Previously delivered
                  </span>
                  <span className={`font-medium ${onlyDelivered ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {subscriberStats.delivered}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">New (first email)</span>
                  <span className={`font-medium ${onlyDelivered ? 'line-through text-muted-foreground' : 'text-amber-600'}`}>
                    {subscriberStats.neverDelivered} {onlyDelivered && '(excluded)'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    Bounced (always excluded)
                  </span>
                  <span className="font-medium text-red-600">{subscriberStats.bounced}</span>
                </div>
              </div>
              
              <Button
                className="w-full"
                onClick={sendCampaign}
                disabled={sendingCampaign}
              >
                {sendingCampaign ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send to All Subscribers
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send to Specific Email Dialog */}
      <Dialog open={sendToSpecificOpen} onOpenChange={setSendToSpecificOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send to Specific Email</DialogTitle>
            <DialogDescription>
              Search for a subscriber and send "{selectedTemplate?.name}" to them
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Search Subscriber</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Search by email..."
                  value={subscriberSearch}
                  onChange={(e) => setSubscriberSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {searchLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {!searchLoading && searchResults.length > 0 && (
              <div className="border rounded-lg divide-y max-h-48 overflow-auto">
                {searchResults.map((subscriber) => (
                  <button
                    key={subscriber.id}
                    onClick={() => {
                      setSelectedSubscriber(subscriber);
                      setSearchResults([]);
                      setSubscriberSearch(subscriber.email);
                    }}
                    className={`w-full px-3 py-2 text-left hover:bg-muted/50 transition-colors ${
                      selectedSubscriber?.id === subscriber.id ? "bg-accent/10" : ""
                    }`}
                  >
                    <div className="font-medium text-sm">{subscriber.email}</div>
                    {subscriber.name && (
                      <div className="text-xs text-muted-foreground">{subscriber.name}</div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {!searchLoading && subscriberSearch.length >= 2 && searchResults.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active subscribers found matching "{subscriberSearch}"
              </p>
            )}

            {selectedSubscriber && (
              <div className="rounded-lg border p-3 bg-accent/5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{selectedSubscriber.email}</div>
                    {selectedSubscriber.name && (
                      <div className="text-sm text-muted-foreground">{selectedSubscriber.name}</div>
                    )}
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </div>
            )}

            <Button
              className="w-full"
              onClick={sendToSpecificSubscriber}
              disabled={!selectedSubscriber || sendingToSpecific}
            >
              {sendingToSpecific ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send to {selectedSubscriber?.email || "Selected Email"}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
