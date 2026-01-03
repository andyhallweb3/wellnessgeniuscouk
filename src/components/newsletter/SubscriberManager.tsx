import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Users, 
  Loader2, 
  Plus,
  Pencil,
  Trash2,
  Search,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Mail,
  RefreshCw
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  source: string | null;
  is_active: boolean;
  subscribed_at: string;
  // Resend delivery metrics
  last_delivered_at: string | null;
  delivery_count: number | null;
  bounced: boolean | null;
  bounced_at: string | null;
  bounce_type: string | null;
}

interface SubscriberManagerProps {
  getAuthHeaders: () => Record<string, string>;
}

export const SubscriberManager = ({ getAuthHeaders }: SubscriberManagerProps) => {
  const { toast } = useToast();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "delivered" | "bounced" | "new">("all");
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editing, setEditing] = useState<Subscriber | null>(null);
  const [form, setForm] = useState({ email: "", name: "", source: "admin-manual", is_active: true });
  const [bulkEmails, setBulkEmails] = useState("");
  const [bulkImporting, setBulkImporting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  useEffect(() => {
    if (!syncing) {
      setSyncProgress(0);
      return;
    }

    // Indeterminate-ish progress while request is in-flight
    setSyncProgress(12);
    const id = window.setInterval(() => {
      setSyncProgress((p) => (p >= 92 ? 92 : p + Math.max(1, Math.round((92 - p) * 0.08))));
    }, 300);

    return () => window.clearInterval(id);
  }, [syncing]);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-subscribers", {
        body: { action: "list" },
        headers: getAuthHeaders(),
      });

      if (error) throw error;
      setSubscribers(data.subscribers || []);
    } catch (error) {
      console.error("Failed to fetch subscribers:", error);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ email: "", name: "", source: "admin-manual", is_active: true });
    setShowModal(true);
  };

  const openEdit = (sub: Subscriber) => {
    setEditing(sub);
    setForm({
      email: sub.email,
      name: sub.name || "",
      source: sub.source || "admin-manual",
      is_active: sub.is_active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const action = editing ? "update" : "add";
      const { data, error } = await supabase.functions.invoke("manage-subscribers", {
        body: {
          action,
          subscriber: editing ? { ...form, id: editing.id } : form,
        },
        headers: getAuthHeaders(),
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: editing ? "Subscriber Updated" : "Subscriber Added",
        description: `${form.email} has been ${editing ? "updated" : "added"}.`,
      });

      setShowModal(false);
      fetchSubscribers();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save subscriber",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (sub: Subscriber) => {
    if (!confirm(`Are you sure you want to delete ${sub.email}?`)) return;

    try {
      const { error } = await supabase.functions.invoke("manage-subscribers", {
        body: { action: "delete", subscriber: { id: sub.id } },
        headers: getAuthHeaders(),
      });

      if (error) throw error;

      toast({
        title: "Subscriber Deleted",
        description: `${sub.email} has been removed.`,
      });

      fetchSubscribers();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete subscriber",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (sub: Subscriber) => {
    try {
      const { error } = await supabase.functions.invoke("manage-subscribers", {
        body: {
          action: "update",
          subscriber: { id: sub.id, ...sub, is_active: !sub.is_active },
        },
        headers: getAuthHeaders(),
      });

      if (error) throw error;

      toast({
        title: sub.is_active ? "Subscriber Deactivated" : "Subscriber Activated",
        description: `${sub.email} is now ${sub.is_active ? "inactive" : "active"}.`,
      });

      fetchSubscribers();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update subscriber",
        variant: "destructive",
      });
    }
  };

  const handleBulkImport = async () => {
    const emails = bulkEmails
      .split(/[\n,;]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e && e.includes("@"));

    if (emails.length === 0) {
      toast({
        title: "Error",
        description: "No valid emails found",
        variant: "destructive",
      });
      return;
    }

    setBulkImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-subscribers", {
        body: { action: "bulk-add", emails },
        headers: getAuthHeaders(),
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: "Import Complete",
        description: `Added ${data.added} new subscribers (${data.skipped} already existed)`,
      });

      setShowBulkModal(false);
      setBulkEmails("");
      fetchSubscribers();
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import emails",
        variant: "destructive",
      });
    } finally {
      setBulkImporting(false);
    }
  };

  const syncResendDelivery = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-resend-delivery", {
        headers: getAuthHeaders(),
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // New behavior: backend runs in background to avoid timeouts
      if (data?.started) {
        toast({
          title: "Sync started",
          description: data.message || "Sync is running in the background. Refresh in a minute.",
        });
      } else {
        toast({
          title: "Sync Complete",
          description: data?.message || `Updated ${data?.stats?.updated || 0} subscribers`,
        });
        fetchSubscribers();
      }
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync delivery data",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
      setSyncProgress(100);
      window.setTimeout(() => setSyncProgress(0), 500);
    }
  };

  const exportSubscribers = () => {
    const csv = [
      ["Email", "Name", "Source", "Status", "Subscribed At", "Last Delivered", "Delivery Count", "Bounced", "Bounce Type"].join(","),
      ...subscribers.map((s) =>
        [
          s.email, 
          s.name || "", 
          s.source || "", 
          s.is_active ? "active" : "inactive", 
          s.subscribed_at,
          s.last_delivered_at || "",
          s.delivery_count || 0,
          s.bounced ? "yes" : "no",
          s.bounce_type || ""
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = subscribers.filter((sub) => {
    const matchesSearch =
      !search ||
      sub.email.toLowerCase().includes(search.toLowerCase()) ||
      sub.name?.toLowerCase().includes(search.toLowerCase());
    
    let matchesStatus = true;
    switch (statusFilter) {
      case "active":
        matchesStatus = sub.is_active && !sub.bounced;
        break;
      case "inactive":
        matchesStatus = !sub.is_active;
        break;
      case "delivered":
        matchesStatus = !!sub.last_delivered_at && !sub.bounced;
        break;
      case "bounced":
        matchesStatus = !!sub.bounced;
        break;
      case "new":
        matchesStatus = !sub.last_delivered_at && !sub.bounced && sub.is_active;
        break;
    }
    return matchesSearch && matchesStatus;
  });

  const activeCount = subscribers.filter((s) => s.is_active && !s.bounced).length;
  const deliveredCount = subscribers.filter((s) => s.last_delivered_at && !s.bounced).length;
  const bouncedCount = subscribers.filter((s) => s.bounced).length;
  const newCount = subscribers.filter((s) => !s.last_delivered_at && !s.bounced && s.is_active).length;

  const getSubscriberStatus = (sub: Subscriber) => {
    if (sub.bounced) return { label: "Bounced", color: "destructive" as const, icon: XCircle };
    if (!sub.is_active) return { label: "Unsubscribed", color: "secondary" as const, icon: AlertTriangle };
    if (sub.last_delivered_at) return { label: "Delivered", color: "default" as const, icon: CheckCircle };
    return { label: "New", color: "outline" as const, icon: Mail };
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          {subscribers.length} total
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-green-500" />
          {deliveredCount} delivered
        </span>
        <span className="flex items-center gap-1">
          <Mail className="h-3 w-3 text-blue-500" />
          {newCount} new
        </span>
        <span className="flex items-center gap-1">
          <XCircle className="h-3 w-3 text-red-500" />
          {bouncedCount} bounced
        </span>
        <span>{activeCount} active</span>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subscribers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-secondary border border-border rounded-md px-3 py-2"
        >
          <option value="all">All ({subscribers.length})</option>
          <option value="delivered">Delivered ({deliveredCount})</option>
          <option value="new">New ({newCount})</option>
          <option value="bounced">Bounced ({bouncedCount})</option>
          <option value="active">Active ({activeCount})</option>
          <option value="inactive">Inactive</option>
        </select>
        <Button variant="outline" onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
        <Button variant="outline" onClick={() => setShowBulkModal(true)}>
          <Upload className="h-4 w-4 mr-1" />
          Bulk Import
        </Button>
        <Button variant="outline" onClick={exportSubscribers}>
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
        <Button variant="outline" onClick={syncResendDelivery} disabled={syncing}>
          <RefreshCw className={`h-4 w-4 mr-1 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync Resend"}
        </Button>
      </div>

      {syncing && (
        <div className="rounded-lg border bg-card p-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Syncing delivery data (runs in background to avoid timeouts)…
          </div>
          <div className="mt-2">
            <Progress value={syncProgress || 12} />
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No subscribers found
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filtered.map((sub) => {
            const status = getSubscriberStatus(sub);
            const StatusIcon = status.icon;
            return (
              <div
                key={sub.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${sub.bounced ? 'border-red-500/30 bg-red-500/5' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{sub.email}</p>
                    <Badge variant={status.color} className="text-xs flex items-center gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {sub.name && `${sub.name} • `}
                    {sub.source || "unknown"} •{" "}
                    {new Date(sub.subscribed_at).toLocaleDateString()}
                    {sub.last_delivered_at && (
                      <span className="text-green-600"> • Last delivered: {new Date(sub.last_delivered_at).toLocaleDateString()}</span>
                    )}
                    {sub.delivery_count ? ` • ${sub.delivery_count} delivered` : ''}
                    {sub.bounced && sub.bounce_type && (
                      <span className="text-red-500"> • Bounce: {sub.bounce_type}</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={sub.is_active}
                    onCheckedChange={() => toggleActive(sub)}
                    disabled={!!sub.bounced}
                  />
                  <Button variant="ghost" size="sm" onClick={() => openEdit(sub)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(sub)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
              </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Subscriber" : "Add Subscriber"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              placeholder="Name (optional)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              placeholder="Source"
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
            />
            <div className="flex items-center gap-2">
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
              />
              <span className="text-sm">Active</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Modal */}
      <Dialog open={showBulkModal} onOpenChange={setShowBulkModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Import Subscribers</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Paste email addresses separated by commas, semicolons, or new lines.
            </p>
            <Textarea
              placeholder="email1@example.com, email2@example.com..."
              value={bulkEmails}
              onChange={(e) => setBulkEmails(e.target.value)}
              rows={8}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkImport} disabled={bulkImporting}>
              {bulkImporting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
