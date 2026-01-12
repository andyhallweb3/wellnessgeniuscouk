import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, Shield, Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import AdminBreadcrumb from "@/components/admin/AdminBreadcrumb";
import { toast } from "sonner";

interface KBCanonEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  priority: number;
  is_active: boolean;
  created_at: string;
}

const CATEGORIES = [
  "ai-readiness",
  "engagement",
  "monetisation",
  "governance",
  "product",
  "prompts",
  "general",
];

const KBCanonAdmin = () => {
  const { isAdmin, isLoading: authLoading, isAuthenticated } = useAdminAuth();
  const [entries, setEntries] = useState<KBCanonEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KBCanonEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [tags, setTags] = useState("");
  const [priority, setPriority] = useState(50);
  const [isActive, setIsActive] = useState(true);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("kb_canon")
        .select("*")
        .order("priority", { ascending: false });
      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error("Error fetching entries:", error);
      toast.error("Failed to load knowledge base");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchEntries();
  }, [isAdmin]);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategory("general");
    setTags("");
    setPriority(50);
    setIsActive(true);
    setEditingEntry(null);
  };

  const openEditDialog = (entry: KBCanonEntry) => {
    setEditingEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setCategory(entry.category);
    setTags(entry.tags.join(", "));
    setPriority(entry.priority);
    setIsActive(entry.is_active);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    const entryData = {
      title: title.trim(),
      content: content.trim(),
      category,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      priority,
      is_active: isActive,
    };

    try {
      if (editingEntry) {
        const { error } = await supabase
          .from("kb_canon")
          .update(entryData)
          .eq("id", editingEntry.id);
        if (error) throw error;
        toast.success("Entry updated");
      } else {
        const { error } = await supabase.from("kb_canon").insert(entryData);
        if (error) throw error;
        toast.success("Entry created");
      }
      setDialogOpen(false);
      resetForm();
      fetchEntries();
    } catch (error) {
      console.error("Error saving entry:", error);
      toast.error("Failed to save entry");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    try {
      const { error } = await supabase.from("kb_canon").delete().eq("id", id);
      if (error) throw error;
      toast.success("Entry deleted");
      fetchEntries();
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error("Failed to delete entry");
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from("kb_canon")
        .update({ is_active: !currentState })
        .eq("id", id);
      if (error) throw error;
      fetchEntries();
    } catch (error) {
      console.error("Error toggling active:", error);
    }
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || entry.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Helmet>
          <title>Access Denied | Wellness Genius</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-heading mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">Admin access required.</p>
          <Link to="/admin">
            <Button>Go to Admin Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>KB Canon Admin | Wellness Genius</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container-wide flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-accent" />
              <h1 className="font-heading text-xl">Knowledge Base (Canon)</h1>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingEntry ? "Edit Entry" : "Add Canon Entry"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., AI Readiness Framework" />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Full content of the knowledge entry..." rows={10} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority (1-100)</Label>
                    <Input id="priority" type="number" min={1} max={100} value={priority} onChange={(e) => setPriority(parseInt(e.target.value) || 50)} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="retention, engagement, AI" />
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
                  <Label htmlFor="active">Active</Label>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="ghost" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
                  <Button type="submit">{editingEntry ? "Update" : "Create"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <AdminBreadcrumb currentPage="KB Canon" />

      <main className="container-wide py-8 px-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredEntries.map((entry) => (
              <Card key={entry.id} className={!entry.is_active ? "opacity-50" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{entry.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{entry.category}</Badge>
                        <span className="text-xs text-muted-foreground">Priority: {entry.priority}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={entry.is_active}
                        onCheckedChange={() => toggleActive(entry.id, entry.is_active)}
                      />
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(entry)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(entry.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">{entry.content}</p>
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {entry.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {filteredEntries.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No entries found.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default KBCanonAdmin;
