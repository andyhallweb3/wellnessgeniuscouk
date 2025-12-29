import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  FileText, 
  Loader2, 
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  published: boolean;
  featured: boolean;
  meta_title: string | null;
  meta_description: string | null;
  keywords: string[] | null;
  read_time: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

interface BlogPostManagerProps {
  getAuthHeaders: () => Record<string, string>;
}

export const BlogPostManager = ({ getAuthHeaders }: BlogPostManagerProps) => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "AI",
    published: false,
    featured: false,
    meta_title: "",
    meta_description: "",
    keywords: "",
    read_time: "5 min read",
    image_url: "",
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-blog-posts", {
        body: { action: "list", limit: 50 },
        headers: getAuthHeaders(),
      });

      if (error) throw error;
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Failed to fetch blog posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      category: "AI",
      published: false,
      featured: false,
      meta_title: "",
      meta_description: "",
      keywords: "",
      read_time: "5 min read",
      image_url: "",
    });
    setShowModal(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditing(post);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      published: post.published,
      featured: post.featured,
      meta_title: post.meta_title || "",
      meta_description: post.meta_description || "",
      keywords: post.keywords?.join(", ") || "",
      read_time: post.read_time || "5 min read",
      image_url: post.image_url || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const action = editing ? "update" : "create";
      const slug =
        form.slug ||
        form.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

      const postData = {
        ...form,
        slug,
        keywords: form.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
        ...(editing ? { id: editing.id } : {}),
      };

      const { data, error } = await supabase.functions.invoke("manage-blog-posts", {
        body: { action, post: postData },
        headers: getAuthHeaders(),
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: editing ? "Blog Post Updated" : "Blog Post Created",
        description: data.message || `${form.title} has been saved.`,
      });

      setShowModal(false);
      fetchPosts();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save blog post",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (post: BlogPost) => {
    if (!confirm(`Are you sure you want to delete "${post.title}"?`)) return;

    try {
      const { error } = await supabase.functions.invoke("manage-blog-posts", {
        body: { action: "delete", postId: post.id },
        headers: getAuthHeaders(),
      });

      if (error) throw error;

      toast({
        title: "Blog Post Deleted",
        description: `${post.title} has been removed.`,
      });

      fetchPosts();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete blog post",
        variant: "destructive",
      });
    }
  };

  const togglePublished = async (post: BlogPost) => {
    try {
      const { error } = await supabase.functions.invoke("manage-blog-posts", {
        body: {
          action: "update",
          post: { id: post.id, published: !post.published },
        },
        headers: getAuthHeaders(),
      });

      if (error) throw error;

      toast({
        title: post.published ? "Blog Post Unpublished" : "Blog Post Published",
        description: `${post.title} is now ${post.published ? "hidden" : "live"}.`,
      });

      fetchPosts();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update blog post",
        variant: "destructive",
      });
    }
  };

  const publishedCount = posts.filter((p) => p.published).length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <FileText className="h-4 w-4" />
          {posts.length} total
        </span>
        <span>{publishedCount} published</span>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" />
          New Post
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No blog posts yet
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{post.title}</p>
                  {post.featured && (
                    <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {post.category} • {post.read_time} •{" "}
                  {new Date(post.updated_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => togglePublished(post)}
                  title={post.published ? "Unpublish" : "Publish"}
                >
                  {post.published ? (
                    <Eye className="h-4 w-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openEdit(post)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(post)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Blog Post" : "Create Blog Post"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <Input
                placeholder="Slug (auto-generated if empty)"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="bg-secondary border border-border rounded-md px-3 py-2"
              >
                <option value="AI">AI</option>
                <option value="Wellness">Wellness</option>
                <option value="Technology">Technology</option>
                <option value="Industry">Industry</option>
                <option value="Strategy">Strategy</option>
              </select>
              <Input
                placeholder="Read time (e.g., 5 min read)"
                value={form.read_time}
                onChange={(e) => setForm({ ...form, read_time: e.target.value })}
              />
            </div>
            <Textarea
              placeholder="Excerpt (short summary)"
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              rows={2}
            />
            <div>
              <label className="text-sm font-medium mb-2 block">Content</label>
              <RichTextEditor
                content={form.content}
                onChange={(content) => setForm({ ...form, content })}
              />
            </div>
            <Input
              placeholder="Image URL"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                placeholder="Meta title"
                value={form.meta_title}
                onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
              />
              <Input
                placeholder="Keywords (comma-separated)"
                value={form.keywords}
                onChange={(e) => setForm({ ...form, keywords: e.target.value })}
              />
            </div>
            <Textarea
              placeholder="Meta description"
              value={form.meta_description}
              onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
              rows={2}
            />
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.published}
                  onCheckedChange={(checked) => setForm({ ...form, published: checked })}
                />
                <span className="text-sm">Published</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.featured}
                  onCheckedChange={(checked) => setForm({ ...form, featured: checked })}
                />
                <span className="text-sm">Featured</span>
              </div>
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
    </div>
  );
};
