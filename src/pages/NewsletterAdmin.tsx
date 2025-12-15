import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  Send, 
  Eye, 
  RefreshCw, 
  Users, 
  FileText, 
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Newspaper,
  Lock,
  Plus,
  Pencil,
  Trash2,
  X,
  UserPlus
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Article {
  id: string;
  title: string;
  source: string;
  category: string;
  ai_summary?: string;
  ai_why_it_matters?: string[];
  ai_commercial_angle?: string;
}

interface NewsletterSend {
  id: string;
  sent_at: string;
  recipient_count: number;
  article_count: number;
  status: string;
}

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  source: string | null;
  is_active: boolean;
  subscribed_at: string;
}

const NewsletterAdmin = () => {
  const { toast } = useToast();
  const [adminSecret, setAdminSecret] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [secretInput, setSecretInput] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [sending, setSending] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [unprocessedCount, setUnprocessedCount] = useState(0);
  const [recentSends, setRecentSends] = useState<NewsletterSend[]>([]);
  
  // Subscriber management state
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [showSubscriberModal, setShowSubscriberModal] = useState(false);
  const [editingSubscriber, setEditingSubscriber] = useState<Subscriber | null>(null);
  const [subscriberForm, setSubscriberForm] = useState({ email: '', name: '', source: 'admin-manual', is_active: true });

  useEffect(() => {
    document.title = "Newsletter Admin | Wellness Genius";
    // Check for stored admin secret in sessionStorage
    const storedSecret = sessionStorage.getItem("admin_secret");
    if (storedSecret) {
      setAdminSecret(storedSecret);
      setIsAuthenticated(true);
    }
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      fetchRecentSends();
      fetchSubscribers();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (secretInput.trim()) {
      sessionStorage.setItem("admin_secret", secretInput.trim());
      setAdminSecret(secretInput.trim());
      setIsAuthenticated(true);
      toast({
        title: "Access Granted",
        description: "Admin secret accepted. You can now manage newsletters.",
      });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_secret");
    setAdminSecret("");
    setIsAuthenticated(false);
    setSecretInput("");
    toast({
      title: "Logged Out",
      description: "Admin session ended.",
    });
  };

  const getAuthHeaders = () => ({
    'x-admin-secret': adminSecret,
  });

  const fetchStats = async () => {
    const { count: articleCount } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('processed', false);
    
    setUnprocessedCount(articleCount || 0);
  };

  const fetchRecentSends = async () => {
    const { data } = await supabase
      .from('newsletter_sends')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(5);
    
    setRecentSends(data || []);
  };

  const fetchSubscribers = async () => {
    setLoadingSubscribers(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-subscribers', {
        body: { action: 'list' },
        headers: getAuthHeaders(),
      });

      if (error) throw error;
      setSubscribers(data.subscribers || []);
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
    } finally {
      setLoadingSubscribers(false);
    }
  };

  const openAddSubscriber = () => {
    setEditingSubscriber(null);
    setSubscriberForm({ email: '', name: '', source: 'admin-manual', is_active: true });
    setShowSubscriberModal(true);
  };

  const openEditSubscriber = (subscriber: Subscriber) => {
    setEditingSubscriber(subscriber);
    setSubscriberForm({
      email: subscriber.email,
      name: subscriber.name || '',
      source: subscriber.source || 'admin-manual',
      is_active: subscriber.is_active,
    });
    setShowSubscriberModal(true);
  };

  const handleSaveSubscriber = async () => {
    try {
      const action = editingSubscriber ? 'update' : 'add';
      const { data, error } = await supabase.functions.invoke('manage-subscribers', {
        body: {
          action,
          subscriber: editingSubscriber
            ? { ...subscriberForm, id: editingSubscriber.id }
            : subscriberForm,
        },
        headers: getAuthHeaders(),
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: editingSubscriber ? "Subscriber Updated" : "Subscriber Added",
        description: `${subscriberForm.email} has been ${editingSubscriber ? 'updated' : 'added'}.`,
      });

      setShowSubscriberModal(false);
      fetchSubscribers();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save subscriber",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubscriber = async (subscriber: Subscriber) => {
    if (!confirm(`Are you sure you want to delete ${subscriber.email}?`)) return;

    try {
      const { data, error } = await supabase.functions.invoke('manage-subscribers', {
        body: { action: 'delete', subscriber: { id: subscriber.id } },
        headers: getAuthHeaders(),
      });

      if (error) throw error;

      toast({
        title: "Subscriber Deleted",
        description: `${subscriber.email} has been removed.`,
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

  const toggleSubscriberActive = async (subscriber: Subscriber) => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-subscribers', {
        body: {
          action: 'update',
          subscriber: { id: subscriber.id, ...subscriber, is_active: !subscriber.is_active },
        },
        headers: getAuthHeaders(),
      });

      if (error) throw error;

      toast({
        title: subscriber.is_active ? "Subscriber Deactivated" : "Subscriber Activated",
        description: `${subscriber.email} is now ${subscriber.is_active ? 'inactive' : 'active'}.`,
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

  const syncFromRss = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('newsletter-run', {
        body: { syncFromRss: true, preview: true },
        headers: getAuthHeaders(),
      });

      if (error) {
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          handleLogout();
          toast({
            title: "Authentication Failed",
            description: "Invalid admin secret. Please re-enter.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "RSS Sync Complete",
        description: `Synced articles from RSS feeds. ${data.articleCount} articles ready for processing.`,
      });

      fetchStats();
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync RSS",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const generatePreview = async () => {
    setLoading(true);
    setPreviewHtml(null);
    try {
      const { data, error } = await supabase.functions.invoke('newsletter-run', {
        body: { preview: true },
        headers: getAuthHeaders(),
      });

      if (error) {
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          handleLogout();
          toast({
            title: "Authentication Failed",
            description: "Invalid admin secret. Please re-enter.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      if (data.articleCount === 0) {
        toast({
          title: "No Articles",
          description: "No unprocessed articles found. Try syncing from RSS first.",
          variant: "destructive",
        });
        return;
      }

      setPreviewHtml(data.html);
      setArticles(data.articles || []);

      toast({
        title: "Preview Generated",
        description: `Generated newsletter with ${data.articleCount} articles`,
      });
    } catch (error) {
      toast({
        title: "Preview Failed",
        description: error instanceof Error ? error.message : "Failed to generate preview",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendNewsletter = async () => {
    if (!confirm("Are you sure you want to send this newsletter to all active subscribers?")) {
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('newsletter-run', {
        body: { preview: false },
        headers: getAuthHeaders(),
      });

      if (error) {
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          handleLogout();
          toast({
            title: "Authentication Failed",
            description: "Invalid admin secret. Please re-enter.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Newsletter Sent!",
        description: `Sent to ${data.subscriberCount} subscribers with ${data.articleCount} articles`,
      });

      setPreviewHtml(null);
      fetchStats();
      fetchRecentSends();
    } catch (error) {
      toast({
        title: "Send Failed",
        description: error instanceof Error ? error.message : "Failed to send newsletter",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background dark">
        <Header />
        <main className="pt-24 lg:pt-32 pb-20">
          <section className="section-padding">
            <div className="container-wide max-w-md mx-auto">
              <div className="card-glass p-8 text-center">
                <div className="p-4 rounded-full bg-accent/10 w-fit mx-auto mb-6">
                  <Lock className="h-8 w-8 text-accent" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Newsletter Admin</h1>
                <p className="text-muted-foreground mb-6">
                  Enter your admin secret to access the newsletter management panel.
                </p>
                <form onSubmit={handleLogin} className="space-y-4">
                  <Input
                    type="password"
                    placeholder="Admin Secret"
                    value={secretInput}
                    onChange={(e) => setSecretInput(e.target.value)}
                    className="bg-secondary border-border"
                    autoComplete="off"
                  />
                  <Button type="submit" variant="accent" className="w-full">
                    Access Admin Panel
                  </Button>
                </form>
                <Link 
                  to="/" 
                  className="inline-block mt-4 text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark">
      <Header />
      
      <main className="pt-24 lg:pt-32 pb-20">
        <section className="section-padding">
          <div className="container-wide">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <Link to="/news" className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                  <ArrowLeft size={20} />
                </Link>
                <div>
                  <h1 className="text-3xl font-bold">Newsletter Admin</h1>
                  <p className="text-muted-foreground">Manage and send AI-powered wellness newsletters</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                <Lock size={14} />
                Logout
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="card-tech p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-accent/10 text-accent">
                    <FileText size={20} />
                  </div>
                  <span className="text-muted-foreground text-sm">Unprocessed Articles</span>
                </div>
                <p className="text-3xl font-bold">{unprocessedCount}</p>
              </div>

              <div className="card-tech p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <Users size={20} />
                  </div>
                  <span className="text-muted-foreground text-sm">Active Subscribers</span>
                </div>
                <p className="text-3xl font-bold">{subscribers.filter(s => s.is_active).length}</p>
                <p className="text-xs text-muted-foreground">{subscribers.length} total</p>
              </div>

              <div className="card-tech p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                    <Send size={20} />
                  </div>
                  <span className="text-muted-foreground text-sm">Total Sends</span>
                </div>
                <p className="text-3xl font-bold">{recentSends.length}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="card-glass p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Newspaper size={20} />
                Newsletter Actions
              </h2>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={syncFromRss} 
                  disabled={syncing}
                  variant="secondary"
                  className="gap-2"
                >
                  {syncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  Sync from RSS
                </Button>

                <Button 
                  onClick={generatePreview} 
                  disabled={loading}
                  variant="secondary"
                  className="gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
                  Generate Preview
                </Button>

                <Button 
                  onClick={sendNewsletter} 
                  disabled={sending || !previewHtml}
                  variant="accent"
                  className="gap-2"
                >
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Send Newsletter
                </Button>
              </div>
            </div>

            {/* Preview */}
            {previewHtml && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Mail size={20} />
                  Email Preview
                </h2>
                
                {/* Article Summary */}
                {articles.length > 0 && (
                  <div className="card-tech p-4 mb-4">
                    <h3 className="font-medium mb-3">Articles in this newsletter:</h3>
                    <div className="space-y-2">
                      {articles.map((article, i) => (
                        <div key={article.id} className="flex items-start gap-3 text-sm">
                          <span className="px-2 py-0.5 rounded bg-accent/10 text-accent text-xs">
                            {article.category}
                          </span>
                          <span className="flex-1">{article.title}</span>
                          <span className="text-muted-foreground">{article.source}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* HTML Preview */}
                <div className="border border-border rounded-xl overflow-hidden bg-white">
                  <div className="bg-secondary px-4 py-2 flex items-center gap-2 border-b border-border">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="ml-2 text-xs text-muted-foreground">Email Preview</span>
                  </div>
                  <iframe
                    srcDoc={previewHtml}
                    className="w-full h-[800px] border-0"
                    title="Newsletter Preview"
                  />
                </div>
              </div>
            )}

            {/* Subscribers Management */}
            <div className="card-glass p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Users size={20} />
                  Subscribers
                </h2>
                <Button onClick={openAddSubscriber} variant="accent" size="sm" className="gap-2">
                  <UserPlus size={16} />
                  Add Subscriber
                </Button>
              </div>
              
              {loadingSubscribers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-accent" />
                </div>
              ) : subscribers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No subscribers yet.</p>
              ) : (
                <div className="card-tech overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Source</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Subscribed</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map((subscriber) => (
                        <tr key={subscriber.id} className="border-t border-border">
                          <td className="px-4 py-3 text-sm font-medium">{subscriber.email}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{subscriber.name || '—'}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{subscriber.source || '—'}</td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => toggleSubscriberActive(subscriber)}
                              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 ${
                                subscriber.is_active 
                                  ? 'bg-green-500/10 text-green-400' 
                                  : 'bg-red-500/10 text-red-400'
                              }`}
                            >
                              {subscriber.is_active ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                              {subscriber.is_active ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {new Date(subscriber.subscribed_at).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditSubscriber(subscriber)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil size={14} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSubscriber(subscriber)}
                                className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Sends */}
            {recentSends.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Clock size={20} />
                  Recent Sends
                </h2>
                <div className="card-tech overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Recipients</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Articles</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSends.map((send) => (
                        <tr key={send.id} className="border-t border-border">
                          <td className="px-4 py-3 text-sm">
                            {new Date(send.sent_at).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-4 py-3 text-sm">{send.recipient_count}</td>
                          <td className="px-4 py-3 text-sm">{send.article_count}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                              send.status === 'sent' 
                                ? 'bg-green-500/10 text-green-400' 
                                : send.status === 'partial'
                                ? 'bg-yellow-500/10 text-yellow-400'
                                : 'bg-red-500/10 text-red-400'
                            }`}>
                              {send.status === 'sent' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                              {send.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* Subscriber Modal */}
      <Dialog open={showSubscriberModal} onOpenChange={setShowSubscriberModal}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>{editingSubscriber ? 'Edit Subscriber' : 'Add Subscriber'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={subscriberForm.email}
                onChange={(e) => setSubscriberForm({ ...subscriberForm, email: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={subscriberForm.name}
                onChange={(e) => setSubscriberForm({ ...subscriberForm, name: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                placeholder="admin-manual"
                value={subscriberForm.source}
                onChange={(e) => setSubscriberForm({ ...subscriberForm, source: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="is_active"
                checked={subscriberForm.is_active}
                onCheckedChange={(checked) => setSubscriberForm({ ...subscriberForm, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubscriberModal(false)}>
              Cancel
            </Button>
            <Button variant="accent" onClick={handleSaveSubscriber} disabled={!subscriberForm.email}>
              {editingSubscriber ? 'Update' : 'Add'} Subscriber
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewsletterAdmin;