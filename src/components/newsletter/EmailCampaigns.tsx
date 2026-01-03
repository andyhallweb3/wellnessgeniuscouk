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
  RefreshCw
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
  });
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [sendingCampaign, setSendingCampaign] = useState(false);
  const [onlyDelivered, setOnlyDelivered] = useState(false);

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
    try {
      // Get all subscribers with their status
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("is_active, bounced, last_delivered_at");

      if (error) throw error;

      const stats: SubscriberStats = {
        total: data?.length || 0,
        active: data?.filter(s => s.is_active && !s.bounced).length || 0,
        delivered: data?.filter(s => s.is_active && !s.bounced && s.last_delivered_at).length || 0,
        bounced: data?.filter(s => s.bounced).length || 0,
        neverDelivered: data?.filter(s => s.is_active && !s.bounced && !s.last_delivered_at).length || 0,
      };

      setSubscriberStats(stats);
    } catch (error) {
      console.error("Error fetching subscriber stats:", error);
    }
  };

  const handlePreview = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  const handleSendDialog = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setSendDialogOpen(true);
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
        },
        headers: getAuthHeaders(),
      });

      if (error) throw error;

      toast({
        title: "Campaign sent!",
        description: `Email sent to ${data?.recipientCount || subscriberStats.active} subscribers`,
      });
      setSendDialogOpen(false);
      fetchSubscriberStats(); // Refresh stats
      setSendDialogOpen(false);
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3">
          <div className="text-sm text-muted-foreground">Total</div>
          <div className="text-2xl font-bold">{subscriberStats.total}</div>
        </Card>
        <Card className="p-3 border-green-200 bg-green-50 dark:bg-green-950/20">
          <div className="text-sm text-green-600 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Delivered
          </div>
          <div className="text-2xl font-bold text-green-700">{subscriberStats.delivered}</div>
        </Card>
        <Card className="p-3">
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Users className="h-3 w-3" />
            Active (will receive)
          </div>
          <div className="text-2xl font-bold">{subscriberStats.active}</div>
        </Card>
        <Card className="p-3 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <div className="text-sm text-amber-600">New (no delivery yet)</div>
          <div className="text-2xl font-bold text-amber-700">{subscriberStats.neverDelivered}</div>
        </Card>
        <Card className="p-3 border-red-200 bg-red-50 dark:bg-red-950/20">
          <div className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Bounced
          </div>
          <div className="text-2xl font-bold text-red-700">{subscriberStats.bounced}</div>
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
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(template)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSendDialog(template)}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Campaign
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
    </div>
  );
};
