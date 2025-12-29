import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
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
  Upload
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  source: string | null;
  is_active: boolean;
  subscribed_at: string;
}

interface SubscriberManagerProps {
  getAuthHeaders: () => Record<string, string>;
}

export const SubscriberManager = ({ getAuthHeaders }: SubscriberManagerProps) => {
  const { toast } = useToast();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editing, setEditing] = useState<Subscriber | null>(null);
  const [form, setForm] = useState({ email: "", name: "", source: "admin-manual", is_active: true });
  const [bulkEmails, setBulkEmails] = useState("");
  const [bulkImporting, setBulkImporting] = useState(false);

  useEffect(() => {
    fetchSubscribers();
  }, []);

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

  const exportSubscribers = () => {
    const csv = [
      ["Email", "Name", "Source", "Status", "Subscribed At"].join(","),
      ...subscribers.map((s) =>
        [s.email, s.name || "", s.source || "", s.is_active ? "active" : "inactive", s.subscribed_at].join(",")
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
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && sub.is_active) ||
      (statusFilter === "inactive" && !sub.is_active);
    return matchesSearch && matchesStatus;
  });

  const activeCount = subscribers.filter((s) => s.is_active).length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          {subscribers.length} total
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
          <option value="all">All</option>
          <option value="active">Active</option>
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
      </div>

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
          {filtered.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{sub.email}</p>
                <p className="text-xs text-muted-foreground">
                  {sub.name && `${sub.name} • `}
                  {sub.source || "unknown"} •{" "}
                  {new Date(sub.subscribed_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={sub.is_active}
                  onCheckedChange={() => toggleActive(sub)}
                />
                <Button variant="ghost" size="sm" onClick={() => openEdit(sub)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(sub)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
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
