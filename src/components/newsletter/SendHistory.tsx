import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  Loader2, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Eye,
  Users,
  Mail,
  MousePointer,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  XCircle,
  UserPlus,
  MailCheck
} from "lucide-react";
import EmailDeliveryMetrics from "@/components/admin/EmailDeliveryMetrics";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface NewsletterSend {
  id: string;
  sent_at: string;
  recipient_count: number;
  article_count: number;
  status: string;
  unique_opens: number;
  total_opens: number;
  unique_clicks: number;
  total_clicks: number;
  error_message?: string | null;
}

interface RecipientError {
  id: string;
  email: string;
  status: string;
  error_message: string | null;
  sent_at: string | null;
}

interface SendHistoryProps {
  getAuthHeaders: () => Record<string, string>;
}

export const SendHistory = ({ getAuthHeaders }: SendHistoryProps) => {
  const { toast } = useToast();
  const [recentSends, setRecentSends] = useState<NewsletterSend[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSendId, setSelectedSendId] = useState<string | null>(null);
  const [expandedErrorId, setExpandedErrorId] = useState<string | null>(null);
  const [recipientErrors, setRecipientErrors] = useState<Record<string, RecipientError[]>>({});
  const [loadingErrors, setLoadingErrors] = useState<Record<string, boolean>>({});
  const [retrying, setRetrying] = useState<string | null>(null);
  const [resending, setResending] = useState<string | null>(null);
  const [resendingMissing, setResendingMissing] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentSends();
  }, []);

  const fetchRecentSends = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("newsletter-run", {
        body: { action: "history", limit: 20 },
        headers: getAuthHeaders(),
      });

      if (error) throw error;
      setRecentSends(data.sends || []);
    } catch (error) {
      console.error("Failed to fetch send history:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipientErrors = async (sendId: string) => {
    if (recipientErrors[sendId] || loadingErrors[sendId]) return;
    
    setLoadingErrors(prev => ({ ...prev, [sendId]: true }));
    try {
      const { data, error } = await supabase
        .from("newsletter_send_recipients")
        .select("id, email, status, error_message, sent_at")
        .eq("send_id", sendId)
        .eq("status", "failed")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setRecipientErrors(prev => ({ ...prev, [sendId]: data || [] }));
    } catch (error) {
      console.error("Failed to fetch recipient errors:", error);
    } finally {
      setLoadingErrors(prev => ({ ...prev, [sendId]: false }));
    }
  };

  const resumeSend = async (sendId: string) => {
    setRetrying(sendId);
    try {
      const { data, error } = await supabase.functions.invoke("newsletter-run", {
        body: { action: "resume", sendId },
        headers: getAuthHeaders(),
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "Retry started",
        description: "Resuming delivery to failed/pending recipients.",
      });

      fetchRecentSends();
    } catch (error) {
      toast({
        title: "Retry failed",
        description: error instanceof Error ? error.message : "Failed to retry send",
        variant: "destructive",
      });
    } finally {
      setRetrying(null);
    }
  };

  const resendToNewSubscribers = async (sendId: string) => {
    setResending(sendId);
    try {
      const { data, error } = await supabase.functions.invoke("newsletter-run", {
        body: { action: "resend-to-new", sendId },
        headers: getAuthHeaders(),
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data.count === 0) {
        toast({
          title: "No new subscribers",
          description: data.message || "All subscribers have already received this newsletter.",
        });
      } else {
        toast({
          title: "Sending to new subscribers",
          description: `Sending to ${data.count} subscriber(s) who joined after this newsletter.`,
        });
        fetchRecentSends();
      }
    } catch (error) {
      toast({
        title: "Resend failed",
        description: error instanceof Error ? error.message : "Failed to resend to new subscribers",
        variant: "destructive",
      });
    } finally {
      setResending(null);
    }
  };

  const resendToMissing = async (sendId: string) => {
    setResendingMissing(sendId);
    try {
      const { data, error } = await supabase.functions.invoke("newsletter-run", {
        body: { action: "resend-to-missing", sendId },
        headers: getAuthHeaders(),
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data.count === 0) {
        toast({
          title: "All caught up",
          description: data.message || "All subscribers have already received this newsletter.",
        });
      } else {
        toast({
          title: "Sending to missing subscribers",
          description: `Sending to ${data.count} subscriber(s) who haven't received this newsletter.`,
        });
        fetchRecentSends();
      }
    } catch (error) {
      toast({
        title: "Resend failed",
        description: error instanceof Error ? error.message : "Failed to resend to missing subscribers",
        variant: "destructive",
      });
    } finally {
      setResendingMissing(null);
    }
  };

  const updateSendStatus = async (sendId: string, newStatus: "sent" | "failed") => {
    try {
      const { data, error } = await supabase.functions.invoke("newsletter-run", {
        body: { action: "updateStatus", sendId, newStatus },
        headers: getAuthHeaders(),
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: "Status Updated",
        description: `Send marked as ${newStatus}.`,
      });

      fetchRecentSends();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-400">
            <CheckCircle className="h-3 w-3" /> Sent
          </span>
        );
      case "sending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-500/10 text-blue-400">
            <Loader2 className="h-3 w-3 animate-spin" /> Sending
          </span>
        );
      case "partial":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-yellow-500/10 text-yellow-400">
            <AlertCircle className="h-3 w-3" /> Partial
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-500/10 text-red-400">
            <XCircle className="h-3 w-3" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-muted">
            {status}
          </span>
        );
    }
  };

  const toggleErrorExpand = (sendId: string) => {
    if (expandedErrorId === sendId) {
      setExpandedErrorId(null);
    } else {
      setExpandedErrorId(sendId);
      fetchRecipientErrors(sendId);
    }
  };

  // Calculate totals
  const totalEmailsSent = recentSends.reduce((sum, s) => sum + (s.recipient_count || 0), 0);
  const avgOpenRate = recentSends.length > 0
    ? (recentSends.reduce((sum, s) => {
        if (s.recipient_count > 0 && s.unique_opens) {
          return sum + (s.unique_opens / s.recipient_count) * 100;
        }
        return sum;
      }, 0) / recentSends.filter(s => s.unique_opens !== null).length) || 0
    : 0;
  const failedCount = recentSends.filter(s => s.status === "failed" || s.status === "partial").length;

  return (
    <div className="space-y-6">
      {/* Email Delivery Metrics from Resend */}
      <EmailDeliveryMetrics getAuthHeaders={getAuthHeaders} />
      
      {/* Summary stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Mail className="h-4 w-4" />
              <span className="text-sm">Total Sends</span>
            </div>
            <p className="text-2xl font-bold">{recentSends.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-sm">Emails Sent</span>
            </div>
            <p className="text-2xl font-bold">{totalEmailsSent.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Eye className="h-4 w-4" />
              <span className="text-sm">Avg Open Rate</span>
            </div>
            <p className="text-2xl font-bold">{avgOpenRate.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Failed/Partial</span>
            </div>
            <p className={`text-2xl font-bold ${failedCount > 0 ? "text-destructive" : ""}`}>
              {failedCount}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Send History
            </span>
            <Button variant="outline" size="sm" onClick={fetchRecentSends} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && recentSends.length === 0 ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : recentSends.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No newsletters sent yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSends.map((send) => (
                <div
                  key={send.id}
                  className="p-4 rounded-lg border hover:border-muted-foreground/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(send.status)}
                        <span className="text-sm text-muted-foreground">
                          {formatDate(send.sent_at)}
                        </span>
                      </div>
                      <p className="text-sm">
                        {send.article_count} articles to {send.recipient_count} recipients
                      </p>
                      
                      {/* Error message display */}
                      {send.error_message && (
                        <div className="mt-2 p-3 rounded-md bg-destructive/10 border border-destructive/20">
                          <p className="text-sm text-destructive font-medium flex items-center gap-2">
                            <XCircle className="h-4 w-4 flex-shrink-0" />
                            <span className="break-all">{send.error_message}</span>
                          </p>
                        </div>
                      )}
                      
                      {(send.unique_opens || send.unique_clicks) && (
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {send.unique_opens || 0} opens ({send.total_opens || 0} total)
                          </span>
                          <span className="flex items-center gap-1">
                            <MousePointer className="h-3 w-3" />
                            {send.unique_clicks || 0} clicks ({send.total_clicks || 0} total)
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {send.status === "sent" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resendToNewSubscribers(send.id)}
                            disabled={resending === send.id}
                            className="gap-1"
                          >
                            {resending === send.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <UserPlus className="h-3 w-3" />
                            )}
                            Send to New
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resendToMissing(send.id)}
                            disabled={resendingMissing === send.id}
                            className="gap-1"
                          >
                            {resendingMissing === send.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <MailCheck className="h-3 w-3" />
                            )}
                            Send to Missing
                          </Button>
                        </>
                      )}
                      {(send.status === "failed" || send.status === "partial") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resumeSend(send.id)}
                          disabled={retrying === send.id}
                          className="gap-1"
                        >
                          {retrying === send.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <RotateCcw className="h-3 w-3" />
                          )}
                          Retry
                        </Button>
                      )}
                      {send.status === "sending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateSendStatus(send.id, "sent")}
                        >
                          Mark Sent
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedSendId(selectedSendId === send.id ? null : send.id)}
                      >
                        {selectedSendId === send.id ? "Hide" : "Details"}
                      </Button>
                    </div>
                  </div>

                  {/* Expandable recipient errors for failed/partial sends */}
                  {(send.status === "failed" || send.status === "partial") && (
                    <Collapsible 
                      open={expandedErrorId === send.id}
                      onOpenChange={() => toggleErrorExpand(send.id)}
                      className="mt-3"
                    >
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                          {expandedErrorId === send.id ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                          View recipient errors
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2">
                        {loadingErrors[send.id] ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground p-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading errors...
                          </div>
                        ) : recipientErrors[send.id]?.length === 0 ? (
                          <p className="text-sm text-muted-foreground p-2">
                            No per-recipient errors recorded
                          </p>
                        ) : (
                          <div className="max-h-48 overflow-y-auto rounded-md border bg-muted/30">
                            <table className="w-full text-sm">
                              <thead className="sticky top-0 bg-muted">
                                <tr>
                                  <th className="text-left p-2 font-medium">Email</th>
                                  <th className="text-left p-2 font-medium">Error</th>
                                </tr>
                              </thead>
                              <tbody>
                                {recipientErrors[send.id]?.map((r) => (
                                  <tr key={r.id} className="border-t">
                                    <td className="p-2 font-mono text-xs">{r.email}</td>
                                    <td className="p-2 text-destructive text-xs">
                                      {r.error_message || "Unknown error"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  {selectedSendId === send.id && (
                    <div className="mt-4 pt-4 border-t">
                      <EmailDeliveryMetrics getAuthHeaders={getAuthHeaders} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
