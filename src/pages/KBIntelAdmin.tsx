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
import { Loader2, ArrowLeft, Shield, Plus, Pencil, Trash2, Globe, ExternalLink, AlertTriangle } from "lucide-react";
import AdminBreadcrumb from "@/components/admin/AdminBreadcrumb";
import { toast } from "sonner";
import { format, differenceInMonths } from "date-fns";

interface KBIntelEntry {
  id: string;
  title: string;
  summary: string;
  source_url: string | null;
  source_name: string | null;
  published_date: string | null;
  content_type: string;
  category: string;
  tags: string[];
  is_outdated: boolean;
  is_active: boolean;
  created_at: string;
}

const CATEGORIES = ["news", "report", "competitor", "regulatory", "trend", "general"];
const CONTENT_TYPES = ["news", "report", "competitor-snapshot", "benchmark", "regulatory", "case-study"];

const KBIntelAdmin = () => {
  const { isAdmin, isLoading: authLoading, isAuthenticated } = useAdminAuth();
  const [entries, setEntries] = useState<KBIntelEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KBIntelEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Form state
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [publishedDate, setPublishedDate] = useState("");
  const [contentType, setContentType] = useState("news");
  const [category, setCategory] = useState("general");
  const [tags, setTags] = useState("");
  const [isActive, setIsActive] = useState(true);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("kb_intel")
        .select("*")
        .order("published_date", { ascending: false });
      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error("Error fetching entries:", error);
      toast.error("Failed to load intel entries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchEntries();
  }, [isAdmin]);

  const resetForm = () => {
    setTitle("");
    setSummary("");
    setSourceUrl("");
    setSourceName("");
    setPublishedDate("");
    setContentType("news");
    setCategory("general");
    setTags("");
    setIsActive(true);
    setEditingEntry(null);
  };

  const openEditDialog = (entry: KBIntelEntry) => {
    setEditingEntry(entry);
    setTitle(entry.title);
    setSummary(entry.summary);
    setSourceUrl(entry.source_url || "");
    setSourceName(entry.source_name || "");
    setPublishedDate(entry.published_date || "");
    setContentType(entry.content_type);
    setCategory(entry.category);
    setTags(entry.tags.join(", "));
    setIsActive(entry.is_active);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) {
      toast.error("Title and summary are required");
      return;
    }

    const entryData = {
      title: title.trim(),
      summary: summary.trim(),
      source_url: sourceUrl.trim() || null,
      source_name: sourceName.trim() || null,
      published_date: publishedDate || null,
      content_type: contentType,
      category,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      is_active: isActive,
      is_outdated: publishedDate ? differenceInMonths(new Date(), new Date(publishedDate)) > 12 : false,
    };

    try {
      if (editingEntry) {
        const { error } = await supabase.from("kb_intel").update(entryData).eq("id", editingEntry.id);
        if (error) throw error;
        toast.success("Entry updated");
      } else {
        const { error } = await supabase.from("kb_intel").insert(entryData);
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
      const { error } = await supabase.from("kb_intel").delete().eq("id", id);
      if (error) throw error;
      toast.success("Entry deleted");
      fetchEntries();
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error("Failed to delete entry");
    }
  };

  const isEntryOutdated = (publishedDate: string | null) => {
    if (!publishedDate) return false;
    return differenceInMonths(new Date(), new Date(publishedDate)) > 12;
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.summary.toLowerCase().includes(searchQuery.toLowerCase());
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
          <Link to="/admin"><Button>Go to Admin Login</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>KB Intel Admin | Wellness Genius</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container-wide flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-4">
            <Link to="/admin"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button></Link>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-accent" />
              <h1 className="font-heading text-xl">Industry Intelligence</h1>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Intel</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingEntry ? "Edit Intel" : "Add Intel Entry"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Mindbody Acquires ClassPass" />
                </div>
                <div>
                  <Label htmlFor="summary">Summary</Label>
                  <Textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Key points from this intel..." rows={6} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sourceUrl">Source URL</Label>
                    <Input id="sourceUrl" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://..." />
                  </div>
                  <div>
                    <Label htmlFor="sourceName">Source Name</Label>
                    <Input id="sourceName" value={sourceName} onChange={(e) => setSourceName(e.target.value)} placeholder="e.g., TechCrunch" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="publishedDate">Published Date</Label>
                    <Input id="publishedDate" type="date" value={publishedDate} onChange={(e) => setPublishedDate(e.target.value)} />
                  </div>
                  <div>
                    <Label>Content Type</Label>
                    <Select value={contentType} onValueChange={setContentType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CONTENT_TYPES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="M&A, fitness, tech" />
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

      <AdminBreadcrumb currentPage="KB Intel" />

      <main className="container-wide py-8 px-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input placeholder="Search intel..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="max-w-sm" />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>
        ) : (
          <div className="grid gap-4">
            {filteredEntries.map((entry) => {
              const outdated = isEntryOutdated(entry.published_date);
              return (
                <Card key={entry.id} className={!entry.is_active ? "opacity-50" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{entry.title}</CardTitle>
                          {outdated && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Outdated
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{entry.category}</Badge>
                          <Badge variant="outline">{entry.content_type}</Badge>
                          {entry.published_date && (
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(entry.published_date), "d MMM yyyy")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {entry.source_url && (
                          <a href={entry.source_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm"><ExternalLink className="h-4 w-4" /></Button>
                          </a>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(entry)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(entry.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">{entry.summary}</p>
                    {entry.source_name && (
                      <p className="text-xs text-muted-foreground mt-2">Source: {entry.source_name}</p>
                    )}
                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {entry.tags.map((tag) => (<Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {filteredEntries.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No entries found.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default KBIntelAdmin;
