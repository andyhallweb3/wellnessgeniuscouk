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
  TrendingUp
} from "lucide-react";
import EmailDeliveryMetrics from "@/components/admin/EmailDeliveryMetrics";

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
}

interface SendHistoryProps {
  getAuthHeaders: () => Record<string, string>;
}

export const SendHistory = ({ getAuthHeaders }: SendHistoryProps) => {
  const { toast } = useToast();
  const [recentSends, setRecentSends] = useState<NewsletterSend[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSendId, setSelectedSendId] = useState<string | null>(null);

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

  const resumeSend = async (sendId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("newsletter-run", {
        body: { action: "resume", sendId },
        headers: getAuthHeaders(),
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "Resend started",
        description: "Resuming delivery to unsent recipients.",
      });

      fetchRecentSends();
    } catch (error) {
      toast({
        title: "Resume failed",
        description: error instanceof Error ? error.message : "Failed to resume send",
        variant: "destructive",
      });
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
            <AlertCircle className="h-3 w-3" /> Failed
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

  return (
    <div className="space-y-6">
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
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Recent Status</span>
            </div>
            <p className="text-2xl font-bold">
              {recentSends[0] ? getStatusBadge(recentSends[0].status) : "-"}
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
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(send.status)}
                        <span className="text-sm text-muted-foreground">
                          {formatDate(send.sent_at)}
                        </span>
                      </div>
                      <p className="text-sm">
                        {send.article_count} articles to {send.recipient_count} recipients
                      </p>
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
                    <div className="flex gap-2">
                      {send.status === "partial" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resumeSend(send.id)}
                        >
                          Resume
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
                  {selectedSendId === send.id && (
                    <div className="mt-4 pt-4 border-t">
                      <EmailDeliveryMetrics sendId={send.id} getAuthHeaders={getAuthHeaders} />
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
