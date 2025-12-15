import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  UserPlus,
  Download,
  ChevronDown,
  ChevronRight,
  Search
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
  unique_opens: number;
  total_opens: number;
  unique_clicks: number;
  total_clicks: number;
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
  const [totalSends, setTotalSends] = useState(0);
  const [totalEmailsSent, setTotalEmailsSent] = useState(0);
  const [activeSend, setActiveSend] = useState<NewsletterSend | null>(null);
  
  // Send progress tracking
  const [sendProgress, setSendProgress] = useState<{
    totalSubscribers: number;
    sentCount: number;
    currentBatch: number;
    totalBatches: number;
    sendId: string | null;
  } | null>(null);
  
  // Subscriber management state
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [showSubscriberModal, setShowSubscriberModal] = useState(false);
  const [editingSubscriber, setEditingSubscriber] = useState<Subscriber | null>(null);
  const [subscriberForm, setSubscriberForm] = useState({ email: '', name: '', source: 'admin-manual', is_active: true });
  
  // Bulk import state
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [bulkEmails, setBulkEmails] = useState('');
  const [bulkImporting, setBulkImporting] = useState(false);
  
  // Subscriber list state
  const [subscribersExpanded, setSubscribersExpanded] = useState(false);
  const [subscriberSearch, setSubscriberSearch] = useState('');
  const [subscriberStatusFilter, setSubscriberStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [subscriberPage, setSubscriberPage] = useState(1);
  const [subscribersPerPage, setSubscribersPerPage] = useState(25);

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

  // Auto-refresh send history every 15 seconds while a send is in progress
  useEffect(() => {
    if (!isAuthenticated || !activeSend) return;

    const interval = setInterval(() => {
      console.log('Auto-refreshing send history...');
      fetchRecentSends();
    }, 15000);

    return () => clearInterval(interval);
  }, [isAuthenticated, activeSend]);

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
    'x-admin-secret': sessionStorage.getItem('admin_secret') || adminSecret,
  });

  const fetchStats = async () => {
    const { count: articleCount } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('processed', false);
    
    setUnprocessedCount(articleCount || 0);
  };

  const fetchRecentSends = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('newsletter-run', {
        body: { action: 'history', limit: 10 },
        headers: getAuthHeaders(),
      });

      if (error) throw error;
      
      const sends = data.sends || [];
      setRecentSends(sends);
      setTotalSends(data.totalCount || 0);
      
      // Check for any active sends (status = 'sending')
      const active = sends.find((s: NewsletterSend) => s.status === 'sending');
      setActiveSend(active || null);
      
      // Calculate total emails sent from the fetched sends
      const total = sends.reduce((sum: number, send: NewsletterSend) => sum + (send.recipient_count || 0), 0);
      setTotalEmailsSent(total);
    } catch (error) {
      console.error('Failed to fetch send history:', error);
    }
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

  const handleBulkImport = async () => {
    const emails = bulkEmails
      .split(/[\n,;]+/)
      .map(e => e.trim().toLowerCase())
      .filter(e => e && e.includes('@'));

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
      const { data, error } = await supabase.functions.invoke('manage-subscribers', {
        body: { action: 'bulk-add', emails },
        headers: getAuthHeaders(),
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: "Import Complete",
        description: `Added ${data.added} new subscribers (${data.skipped} already existed)`,
      });

      setShowBulkImportModal(false);
      setBulkEmails('');
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

  const updateSendStatus = async (sendId: string, newStatus: 'sent' | 'failed') => {
    try {
      const { data, error } = await supabase.functions.invoke('newsletter-run', {
        body: { action: 'updateStatus', sendId, newStatus },
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
    // Check for active sends first
    if (activeSend) {
      toast({
        title: "Send in Progress",
        description: `A newsletter send is already in progress (${activeSend.recipient_count} recipients). Please wait for it to complete.`,
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Are you sure you want to send this newsletter to all active subscribers?")) {
      return;
    }

    setSending(true);

    const BATCH_SIZE = 10;

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

      const totalSubscribers = data?.subscriberCount || 0;
      const sendId = data?.sendId as string | undefined;

      if (!sendId) {
        throw new Error('Send started but no sendId returned');
      }

      const totalBatches = Math.max(1, Math.ceil(totalSubscribers / BATCH_SIZE));

      setSendProgress({
        totalSubscribers,
        sentCount: 0,
        currentBatch: 1,
        totalBatches,
        sendId,
      });

      toast({
        title: "Sending started",
        description: `Queued ${totalSubscribers} emails. This will run in the background.`,
      });

      // Poll DB for real progress (via admin-authenticated backend function)
      const poll = setInterval(async () => {
        const { data: statusData, error: statusError } = await supabase.functions.invoke('newsletter-run', {
          body: { action: 'status', sendId },
          headers: getAuthHeaders(),
        });

        if (statusError) {
          return;
        }

        const sendRow = statusData?.send;
        const sentCount = sendRow?.recipient_count || 0;
        const status = sendRow?.status || 'sending';

        setSendProgress((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            sentCount,
            currentBatch: Math.min(totalBatches, Math.max(1, Math.ceil(sentCount / BATCH_SIZE))),
          };
        });

        if (status === 'sent' || status === 'partial' || status === 'failed') {
          clearInterval(poll);
          setSending(false);

          if (status === 'sent') {
            toast({
              title: "Newsletter sent",
              description: `Sent ${sentCount} emails successfully.`,
            });
          } else if (status === 'partial') {
            toast({
              title: "Partially sent",
              description: sendRow?.error_message || `Sent ${sentCount} emails with some failures.`,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Send failed",
              description: sendRow?.error_message || "Newsletter send failed.",
              variant: "destructive",
            });
          }

          setTimeout(() => setSendProgress(null), 1500);
          setPreviewHtml(null);
          fetchStats();
          fetchRecentSends();
        }
      }, 2000);
    } catch (err) {
      toast({
        title: "Send Failed",
        description: err instanceof Error ? err.message : "Failed to start sending",
        variant: "destructive",
      });
      setSending(false);
      setSendProgress(null);
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
                  <span className="text-muted-foreground text-sm">Newsletter Sends</span>
                </div>
                <p className="text-3xl font-bold">{totalSends}</p>
                <p className="text-xs text-muted-foreground">{totalEmailsSent.toLocaleString()} emails delivered</p>
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
                  disabled={sending || !previewHtml || !!activeSend}
                  variant="accent"
                  className="gap-2"
                >
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Send Newsletter
                </Button>
              </div>

              {/* Active Send Warning */}
              {activeSend && !sendProgress && (
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="font-medium text-yellow-500">Send in Progress</p>
                      <p className="text-sm text-muted-foreground">
                        A newsletter is currently being sent to {activeSend.recipient_count} recipients. 
                        Started {new Date(activeSend.sent_at).toLocaleTimeString()}.
                      </p>
                    </div>
                    <Button 
                      onClick={fetchRecentSends} 
                      variant="ghost" 
                      size="sm"
                      className="ml-auto"
                    >
                      <RefreshCw size={14} className="mr-1" />
                      Refresh
                    </Button>
                  </div>
                </div>
              )}

              {/* Send Progress Indicator */}
              {sendProgress && (
                <div className="mt-4 p-4 bg-accent/10 border border-accent/20 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Loader2 className="h-5 w-5 animate-spin text-accent" />
                    <span className="font-medium text-accent">Sending Newsletter...</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Batch {sendProgress.currentBatch} of {sendProgress.totalBatches}
                      </span>
                      <span className="text-foreground font-medium">
                        {sendProgress.sentCount} / {sendProgress.totalSubscribers} sent
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-accent h-full transition-all duration-500 ease-out"
                        style={{ 
                          width: `${sendProgress.totalSubscribers > 0 
                            ? (sendProgress.sentCount / sendProgress.totalSubscribers * 100) 
                            : 0}%` 
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Sending 10 emails per batch with 20 second delays between batches
                    </p>
                  </div>
                </div>
              )}
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
              <button
                onClick={() => setSubscribersExpanded(!subscribersExpanded)}
                className="w-full flex items-center justify-between"
              >
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  {subscribersExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  <Users size={20} />
                  Subscribers ({subscribers.length})
                </h2>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button 
                    onClick={() => setShowBulkImportModal(true)} 
                    variant="secondary" 
                    size="sm" 
                    className="gap-2"
                  >
                    <Download size={16} />
                    Bulk Import
                  </Button>
                  <Button onClick={openAddSubscriber} variant="accent" size="sm" className="gap-2">
                    <UserPlus size={16} />
                    Add Subscriber
                  </Button>
                </div>
              </button>
              
              {subscribersExpanded && (
                <div className="mt-4">
                  {/* Filters */}
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search by email..."
                        value={subscriberSearch}
                        onChange={(e) => {
                          setSubscriberSearch(e.target.value);
                          setSubscriberPage(1);
                        }}
                        className="pl-9 bg-secondary border-border"
                      />
                    </div>
                    <select
                      value={subscriberStatusFilter}
                      onChange={(e) => {
                        setSubscriberStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
                        setSubscriberPage(1);
                      }}
                      className="px-3 py-2 rounded-md bg-secondary border border-border text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active Only</option>
                      <option value="inactive">Inactive Only</option>
                    </select>
                    <select
                      value={subscribersPerPage}
                      onChange={(e) => {
                        setSubscribersPerPage(Number(e.target.value));
                        setSubscriberPage(1);
                      }}
                      className="px-3 py-2 rounded-md bg-secondary border border-border text-sm"
                    >
                      <option value={25}>25 per page</option>
                      <option value={50}>50 per page</option>
                      <option value={100}>100 per page</option>
                    </select>
                  </div>

                  {loadingSubscribers ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-accent" />
                    </div>
                  ) : subscribers.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No subscribers yet.</p>
                  ) : (() => {
                    const filteredSubscribers = subscribers.filter(sub => {
                      const matchesSearch = subscriberSearch === '' || 
                        sub.email.toLowerCase().includes(subscriberSearch.toLowerCase()) ||
                        (sub.name && sub.name.toLowerCase().includes(subscriberSearch.toLowerCase()));
                      const matchesStatus = subscriberStatusFilter === 'all' ||
                        (subscriberStatusFilter === 'active' && sub.is_active) ||
                        (subscriberStatusFilter === 'inactive' && !sub.is_active);
                      return matchesSearch && matchesStatus;
                    });
                    const totalPages = Math.ceil(filteredSubscribers.length / subscribersPerPage);
                    const paginatedSubscribers = filteredSubscribers.slice(
                      (subscriberPage - 1) * subscribersPerPage,
                      subscriberPage * subscribersPerPage
                    );

                    return (
                      <>
                        <div className="text-sm text-muted-foreground mb-2">
                          Showing {paginatedSubscribers.length} of {filteredSubscribers.length} subscribers
                          {filteredSubscribers.length !== subscribers.length && ` (filtered from ${subscribers.length})`}
                        </div>
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
                              {paginatedSubscribers.map((subscriber) => (
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
                        
                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-muted-foreground">
                              Page {subscriberPage} of {totalPages}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSubscriberPage(p => Math.max(1, p - 1))}
                                disabled={subscriberPage === 1}
                              >
                                Previous
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSubscriberPage(p => Math.min(totalPages, p + 1))}
                                disabled={subscriberPage === totalPages}
                              >
                                Next
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Stuck Sends */}
            {recentSends.filter(s => ['partial', 'pending', 'sending'].includes(s.status)).length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-yellow-400">
                  <AlertCircle size={20} />
                  Stuck Sends ({recentSends.filter(s => ['partial', 'pending', 'sending'].includes(s.status)).length})
                </h2>
                <div className="card-tech overflow-hidden border border-yellow-500/30">
                  <table className="w-full">
                    <thead className="bg-yellow-500/10">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Sent</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Opens</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSends
                        .filter(s => ['partial', 'pending', 'sending'].includes(s.status))
                        .map((send) => (
                          <tr key={send.id} className="border-t border-border">
                            <td className="px-4 py-3 text-sm">
                              {new Date(send.sent_at).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="px-4 py-3 text-sm">{send.recipient_count}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className="text-green-400">{send.unique_opens || 0}</span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                                send.status === 'partial'
                                  ? 'bg-yellow-500/10 text-yellow-400'
                                  : send.status === 'sending'
                                  ? 'bg-blue-500/10 text-blue-400'
                                  : 'bg-orange-500/10 text-orange-400'
                              }`}>
                                <AlertCircle size={12} />
                                {send.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateSendStatus(send.id, 'sent')}
                                  className="text-green-400 border-green-500/30 hover:bg-green-500/10"
                                >
                                  <CheckCircle size={14} className="mr-1" />
                                  Mark Complete
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateSendStatus(send.id, 'failed')}
                                  className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                                >
                                  <X size={14} className="mr-1" />
                                  Mark Failed
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

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
                        <th className="px-4 py-3 text-left text-sm font-medium">Opens</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Open Rate</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Clicks</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Click Rate</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSends.map((send) => {
                        const openRate = send.recipient_count > 0 
                          ? ((send.unique_opens || 0) / send.recipient_count * 100).toFixed(1)
                          : '0.0';
                        const clickRate = send.recipient_count > 0 
                          ? ((send.unique_clicks || 0) / send.recipient_count * 100).toFixed(1)
                          : '0.0';
                        return (
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
                            <td className="px-4 py-3 text-sm">
                              <span className="text-green-400">{send.unique_opens || 0}</span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className="text-green-400 font-medium">{openRate}%</span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className="text-blue-400">{send.unique_clicks || 0}</span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className="text-blue-400 font-medium">{clickRate}%</span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                                send.status === 'sent' 
                                  ? 'bg-green-500/10 text-green-400' 
                                  : send.status === 'partial'
                                  ? 'bg-yellow-500/10 text-yellow-400'
                                  : send.status === 'pending'
                                  ? 'bg-blue-500/10 text-blue-400'
                                  : 'bg-red-500/10 text-red-400'
                              }`}>
                                {send.status === 'sent' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                {send.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
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

      {/* Bulk Import Modal */}
      <Dialog open={showBulkImportModal} onOpenChange={setShowBulkImportModal}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download size={20} className="text-accent" />
              Bulk Import Emails
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Paste email addresses below (one per line, or separated by commas/semicolons).
            </p>
            <div className="space-y-2">
              <Label htmlFor="bulkEmails">Email addresses *</Label>
              <Textarea
                id="bulkEmails"
                placeholder="email1@example.com\nemail2@example.com\nemail3@example.com"
                value={bulkEmails}
                onChange={(e) => setBulkEmails(e.target.value)}
                className="bg-secondary border-border min-h-40"
              />
              <p className="text-xs text-muted-foreground">
                {bulkEmails
                  .split(/[\n,;]+/)
                  .map((e) => e.trim())
                  .filter((e) => e && e.includes('@')).length}{' '}
                emails detected
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkImportModal(false)}>
              Cancel
            </Button>
            <Button
              variant="accent"
              onClick={handleBulkImport}
              disabled={!bulkEmails.trim() || bulkImporting}
              className="gap-2"
            >
              {bulkImporting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Import
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default NewsletterAdmin;