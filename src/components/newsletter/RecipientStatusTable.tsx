import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Recipient {
  id: string;
  email: string;
  status: string;
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
}

interface RecipientStatusTableProps {
  sendId: string;
  getAuthHeaders: () => Record<string, string>;
  onClose: () => void;
}

const PAGE_SIZE = 20;

export const RecipientStatusTable = ({
  sendId,
  getAuthHeaders,
  onClose,
}: RecipientStatusTableProps) => {
  const { toast } = useToast();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [retryingAll, setRetryingAll] = useState(false);

  const fetchRecipients = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("newsletter_send_recipients")
        .select("id, email, status, error_message, sent_at, created_at", { count: "exact" })
        .eq("send_id", sendId)
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (searchQuery) {
        query = query.ilike("email", `%${searchQuery}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      setRecipients(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Failed to fetch recipients:", error);
      toast({
        title: "Error",
        description: "Failed to load recipients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [sendId, page, statusFilter, searchQuery, toast]);

  useEffect(() => {
    fetchRecipients();
  }, [fetchRecipients]);

  useEffect(() => {
    setPage(0);
  }, [searchQuery, statusFilter]);

  const retryRecipient = async (recipientId: string, email: string) => {
    setRetryingId(recipientId);
    try {
      const { data, error } = await supabase.functions.invoke("newsletter-run", {
        body: { action: "retry-recipient", sendId, recipientId, email },
        headers: getAuthHeaders(),
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "Retry queued",
        description: `Retrying delivery to ${email}`,
      });

      // Refresh after a short delay
      setTimeout(fetchRecipients, 1500);
    } catch (error) {
      toast({
        title: "Retry failed",
        description: error instanceof Error ? error.message : "Failed to retry",
        variant: "destructive",
      });
    } finally {
      setRetryingId(null);
    }
  };

  const retryAllFailed = async () => {
    setRetryingAll(true);
    try {
      const { data, error } = await supabase.functions.invoke("newsletter-run", {
        body: { action: "resume", sendId },
        headers: getAuthHeaders(),
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "Retry started",
        description: "Retrying all failed recipients",
      });

      setTimeout(fetchRecipients, 2000);
    } catch (error) {
      toast({
        title: "Retry failed",
        description: error instanceof Error ? error.message : "Failed to retry",
        variant: "destructive",
      });
    } finally {
      setRetryingAll(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "pending":
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClass = "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs";
    switch (status) {
      case "sent":
        return <span className={`${baseClass} bg-green-500/10 text-green-500`}>Sent</span>;
      case "failed":
        return <span className={`${baseClass} bg-destructive/10 text-destructive`}>Failed</span>;
      case "pending":
      default:
        return <span className={`${baseClass} bg-muted text-muted-foreground`}>Pending</span>;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString();
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const failedCount = statusFilter === "failed" ? totalCount : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          {statusFilter === "failed" && totalCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={retryAllFailed}
              disabled={retryingAll}
              className="gap-1"
            >
              {retryingAll ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RotateCcw className="h-3 w-3" />
              )}
              Retry All ({totalCount})
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={fetchRecipients} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Status</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-40">Sent At</TableHead>
              <TableHead>Error</TableHead>
              <TableHead className="w-20 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : recipients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No recipients found
                </TableCell>
              </TableRow>
            ) : (
              recipients.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{getStatusBadge(r.status)}</TableCell>
                  <TableCell className="font-mono text-sm">{r.email}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(r.sent_at)}
                  </TableCell>
                  <TableCell className="text-sm text-destructive max-w-xs truncate">
                    {r.error_message || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {r.status === "failed" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => retryRecipient(r.id, r.email)}
                        disabled={retryingId === r.id}
                      >
                        {retryingId === r.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RotateCcw className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
