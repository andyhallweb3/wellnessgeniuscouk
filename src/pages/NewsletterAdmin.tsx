import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
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
  Newspaper
} from "lucide-react";

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

const NewsletterAdmin = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [sending, setSending] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [unprocessedCount, setUnprocessedCount] = useState(0);
  const [recentSends, setRecentSends] = useState<NewsletterSend[]>([]);

  useEffect(() => {
    document.title = "Newsletter Admin | Wellness Genius";
    fetchStats();
    fetchRecentSends();
  }, []);

  const fetchStats = async () => {
    // Note: We can't directly count subscribers due to RLS, but we can get unprocessed articles
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

  const syncFromRss = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('newsletter-run', {
        body: { syncFromRss: true, preview: true }
      });

      if (error) throw error;

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
        body: { preview: true }
      });

      if (error) throw error;

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
        body: { preview: false }
      });

      if (error) throw error;

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

  return (
    <div className="min-h-screen bg-background dark">
      <Header />
      
      <main className="pt-24 lg:pt-32 pb-20">
        <section className="section-padding">
          <div className="container-wide">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Link to="/news" className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-3xl font-bold">Newsletter Admin</h1>
                <p className="text-muted-foreground">Manage and send AI-powered wellness newsletters</p>
              </div>
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
                <p className="text-3xl font-bold">—</p>
                <p className="text-xs text-muted-foreground">Protected by RLS</p>
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
    </div>
  );
};

export default NewsletterAdmin;
