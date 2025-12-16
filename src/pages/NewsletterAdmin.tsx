import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
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
  Search,
  Copy,
  FileDown,
  Zap,
  LogOut,
  Shield,
  ShieldCheck,
  ShieldX,
  Activity,
  TrendingUp
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
  const [searchParams] = useSearchParams();
  const isResetMode = searchParams.get('reset') === 'true';
  
  const { 
    user, 
    session,
    isAdmin, 
    isLoading: authLoading, 
    isAuthenticated, 
    signIn, 
    signUp,
    signOut, 
    resetPassword,
    updatePassword,
    getAuthHeaders,
    error: authError 
  } = useAdminAuth();
  
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login');
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Check if user arrived via password reset link
  useEffect(() => {
    if (isResetMode && session && !isAdmin) {
      setAuthMode('reset');
    }
  }, [isResetMode, session, isAdmin]);
  
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [scoringResults, setScoringResults] = useState<{ scored: number; qualified: number } | null>(null);
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

  // Admin user management state
  interface AdminUser {
    id: string;
    email: string;
    created_at: string;
    email_confirmed_at: string | null;
    is_admin: boolean;
  }
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loadingAdminUsers, setLoadingAdminUsers] = useState(false);
  const [adminUsersExpanded, setAdminUsersExpanded] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');

  // AI Readiness completions state
  interface ReadinessCompletion {
    id: string;
    email: string;
    name: string | null;
    company: string | null;
    role: string | null;
    industry: string | null;
    company_size: string | null;
    overall_score: number;
    leadership_score: number | null;
    data_score: number | null;
    people_score: number | null;
    process_score: number | null;
    risk_score: number | null;
    score_band: string | null;
    completed_at: string;
  }
  interface ReadinessStats {
    totalCompletions: number;
    completionsThisWeek: number;
    avgScoreThisWeek: number;
  }
  const [readinessCompletions, setReadinessCompletions] = useState<ReadinessCompletion[]>([]);
  const [readinessStats, setReadinessStats] = useState<ReadinessStats | null>(null);
  const [loadingReadiness, setLoadingReadiness] = useState(false);
  const [readinessExpanded, setReadinessExpanded] = useState(false);

  useEffect(() => {
    document.title = "Newsletter Admin | Wellness Genius";
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      fetchRecentSends();
      fetchSubscribers();
      fetchAdminUsers();
      fetchReadinessCompletions();
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailInput.trim();
    const password = passwordInput.trim();
    if (!email || !password) return;

    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Authentication Failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Access Granted",
      description: "Welcome to the newsletter admin panel.",
    });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailInput.trim();
    const password = passwordInput.trim();
    const confirmPassword = confirmPasswordInput.trim();
    
    if (!email || !password || !confirmPassword) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    const { error, needsEmailConfirmation } = await signUp(email, password);
    
    if (error) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (needsEmailConfirmation) {
      setShowEmailConfirmation(true);
      toast({
        title: "Verification Email Sent",
        description: "Please check your email to verify your account.",
      });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailInput.trim();
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await resetPassword(email);
    
    if (error) {
      toast({
        title: "Request Failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setResetEmailSent(true);
    toast({
      title: "Reset Email Sent",
      description: "Check your email for a password reset link.",
    });
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const password = passwordInput.trim();
    const confirmPassword = confirmPasswordInput.trim();

    if (!password || !confirmPassword) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await updatePassword(password);
    
    if (error) {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Password Updated",
      description: "Your password has been changed. Please sign in.",
    });

    // Clear form and redirect to login
    setPasswordInput("");
    setConfirmPasswordInput("");
    setAuthMode('login');
    await signOut();
    window.history.replaceState({}, '', '/news/admin');
  };

  const handleLogout = async () => {
    await signOut();
    setEmailInput("");
    setPasswordInput("");
    setConfirmPasswordInput("");
    setShowEmailConfirmation(false);
    setResetEmailSent(false);
    setAuthMode('login');
    toast({
      title: "Logged Out",
      description: "Admin session ended.",
    });
  };

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

  const fetchAdminUsers = async () => {
    setLoadingAdminUsers(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-admins', {
        body: { action: 'list' },
        headers: getAuthHeaders(),
      });

      if (error) throw error;
      setAdminUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch admin users:', error);
    } finally {
      setLoadingAdminUsers(false);
    }
  };

  const fetchReadinessCompletions = async () => {
    setLoadingReadiness(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-readiness-completions', {
        body: { action: 'list', limit: 50 },
        headers: getAuthHeaders(),
      });

      if (error) throw error;
      setReadinessCompletions(data.completions || []);
      setReadinessStats(data.stats || null);
    } catch (error) {
      console.error('Failed to fetch readiness completions:', error);
    } finally {
      setLoadingReadiness(false);
    }
  };

  const grantAdminAccess = async (userId?: string, email?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-admins', {
        body: { action: 'grant', userId, email },
        headers: getAuthHeaders(),
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: "Admin Access Granted",
        description: data.message || "User now has admin privileges.",
      });

      setNewAdminEmail('');
      fetchAdminUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to grant admin access",
        variant: "destructive",
      });
    }
  };

  const revokeAdminAccess = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to revoke admin access for ${userEmail}?`)) return;

    try {
      const { data, error } = await supabase.functions.invoke('manage-admins', {
        body: { action: 'revoke', userId },
        headers: getAuthHeaders(),
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: "Admin Access Revoked",
        description: `${userEmail} no longer has admin privileges.`,
      });

      fetchAdminUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to revoke admin access",
        variant: "destructive",
      });
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

  const scoreArticles = async () => {
    setScoring(true);
    setScoringResults(null);
    try {
      const { data, error } = await supabase.functions.invoke('score-articles', {
        body: null,
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

      setScoringResults({ scored: data.scored, qualified: data.qualified });
      toast({
        title: "Scoring Complete",
        description: `Scored ${data.scored} articles. ${data.qualified} qualified (score ≥65) for newsletter.`,
      });

      fetchStats();
    } catch (error) {
      toast({
        title: "Scoring Failed",
        description: error instanceof Error ? error.message : "Failed to score articles",
        variant: "destructive",
      });
    } finally {
      setScoring(false);
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

  const resumeSend = async (sendId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('newsletter-run', {
        body: { action: 'resume', sendId },
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
      const batchSize = data?.batchSize || 50;

      if (!sendId) {
        throw new Error('Send started but no sendId returned');
      }

      const totalBatches = Math.max(1, Math.ceil(totalSubscribers / batchSize));

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
            currentBatch: Math.min(totalBatches, Math.max(1, Math.ceil(sentCount / batchSize))),
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

  // Show email confirmation message
  if (showEmailConfirmation) {
    return (
      <div className="min-h-screen bg-background dark">
        <Header />
        <main className="pt-24 lg:pt-32 pb-20">
          <section className="section-padding">
            <div className="container-wide max-w-md mx-auto">
              <div className="card-glass p-8 text-center">
                <div className="p-4 rounded-full bg-green-500/10 w-fit mx-auto mb-6">
                  <Mail className="h-8 w-8 text-green-400" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
                <p className="text-muted-foreground mb-6">
                  We've sent a verification link to <strong className="text-foreground">{emailInput}</strong>. 
                  Click the link in the email to verify your account.
                </p>
                <div className="p-4 rounded-lg bg-secondary/50 border border-border text-sm text-muted-foreground mb-6">
                  <p className="mb-2">
                    <strong className="text-foreground">Note:</strong> After verification, an administrator 
                    must grant you admin access before you can use this panel.
                  </p>
                  <p>
                    Contact your admin to add your role:
                  </p>
                  <code className="block mt-2 p-2 bg-background rounded text-xs text-left overflow-x-auto">
                    INSERT INTO user_roles (user_id, role)<br />
                    VALUES ('your-user-id', 'admin');
                  </code>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowEmailConfirmation(false);
                    setAuthMode('login');
                  }}
                  className="w-full"
                >
                  Back to Sign In
                </Button>
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

  // Show password reset form (when user clicked reset link)
  if (authMode === 'reset' && session) {
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
                <h1 className="text-2xl font-bold mb-2">Set New Password</h1>
                <p className="text-muted-foreground mb-6">
                  Enter your new password below.
                </p>
                {authError && (
                  <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {authError}
                  </div>
                )}
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <Input
                    type="password"
                    placeholder="New password (min 6 characters)"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="bg-secondary border-border"
                    autoComplete="new-password"
                  />
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    className="bg-secondary border-border"
                    autoComplete="new-password"
                  />
                  <Button type="submit" variant="accent" className="w-full" disabled={authLoading}>
                    {authLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating password...
                      </>
                    ) : (
                      'Update Password'
                    )}
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

  // Show login/signup/forgot form if not authenticated
  if (!isAuthenticated) {
    // Password reset email sent confirmation
    if (resetEmailSent) {
      return (
        <div className="min-h-screen bg-background dark">
          <Header />
          <main className="pt-24 lg:pt-32 pb-20">
            <section className="section-padding">
              <div className="container-wide max-w-md mx-auto">
                <div className="card-glass p-8 text-center">
                  <div className="p-4 rounded-full bg-green-500/10 w-fit mx-auto mb-6">
                    <Mail className="h-8 w-8 text-green-400" />
                  </div>
                  <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
                  <p className="text-muted-foreground mb-6">
                    We've sent a password reset link to <strong className="text-foreground">{emailInput}</strong>. 
                    Click the link in the email to reset your password.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setResetEmailSent(false);
                      setAuthMode('login');
                    }}
                    className="w-full"
                  >
                    Back to Sign In
                  </Button>
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

    // Forgot password form
    if (authMode === 'forgot') {
      return (
        <div className="min-h-screen bg-background dark">
          <Header />
          <main className="pt-24 lg:pt-32 pb-20">
            <section className="section-padding">
              <div className="container-wide max-w-md mx-auto">
                <div className="card-glass p-8 text-center">
                  <div className="p-4 rounded-full bg-accent/10 w-fit mx-auto mb-6">
                    <Mail className="h-8 w-8 text-accent" />
                  </div>
                  <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
                  <p className="text-muted-foreground mb-6">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                  {authError && (
                    <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                      {authError}
                    </div>
                  )}
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="bg-secondary border-border"
                      autoComplete="email"
                    />
                    <Button type="submit" variant="accent" className="w-full" disabled={authLoading}>
                      {authLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send Reset Link'
                      )}
                    </Button>
                  </form>
                  <button 
                    onClick={() => setAuthMode('login')}
                    className="inline-block mt-4 text-sm text-muted-foreground hover:text-accent transition-colors"
                  >
                    ← Back to Sign In
                  </button>
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
            <div className="container-wide max-w-md mx-auto">
              <div className="card-glass p-8 text-center">
                <div className="p-4 rounded-full bg-accent/10 w-fit mx-auto mb-6">
                  <Lock className="h-8 w-8 text-accent" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Newsletter Admin</h1>
                <p className="text-muted-foreground mb-6">
                  {authMode === 'login' 
                    ? 'Sign in with your admin account to access the newsletter management panel.'
                    : 'Create an admin account. Email verification required.'}
                </p>
                
                {/* Auth mode tabs */}
                <div className="flex mb-6 bg-secondary rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      authMode === 'login' 
                        ? 'bg-accent text-accent-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      authMode === 'signup' 
                        ? 'bg-accent text-accent-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {authError && (
                  <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {authError}
                  </div>
                )}
                
                {authMode === 'login' ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="bg-secondary border-border"
                      autoComplete="email"
                    />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="bg-secondary border-border"
                      autoComplete="current-password"
                    />
                    <Button type="submit" variant="accent" className="w-full" disabled={authLoading}>
                      {authLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('forgot')}
                      className="text-sm text-muted-foreground hover:text-accent transition-colors"
                    >
                      Forgot your password?
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="bg-secondary border-border"
                      autoComplete="email"
                    />
                    <Input
                      type="password"
                      placeholder="Password (min 6 characters)"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="bg-secondary border-border"
                      autoComplete="new-password"
                    />
                    <Input
                      type="password"
                      placeholder="Confirm password"
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      className="bg-secondary border-border"
                      autoComplete="new-password"
                    />
                    <Button type="submit" variant="accent" className="w-full" disabled={authLoading}>
                      {authLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      After signup, you'll need to verify your email and have an admin grant you access.
                    </p>
                  </form>
                )}
                
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
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user?.email}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                  <LogOut size={14} />
                  Sign Out
                </Button>
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
                  onClick={scoreArticles} 
                  disabled={scoring}
                  variant="secondary"
                  className="gap-2"
                >
                  {scoring ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                  Score Articles
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

              {/* Scoring Results */}
              {scoringResults && (
                <div className="mt-4 p-4 bg-accent/10 border border-accent/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium text-accent">Scoring Complete</p>
                      <p className="text-sm text-muted-foreground">
                        Scored {scoringResults.scored} articles. <strong>{scoringResults.qualified} qualified</strong> (score ≥65) for newsletter.
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
                
                {/* Subject Line & Preview Text */}
                {articles.length > 0 && (() => {
                  const topArticle = articles[0];
                  const subjectLine = `Wellness Genius Weekly: ${topArticle.title.length > 50 ? topArticle.title.substring(0, 50) + '...' : topArticle.title}`;
                  const previewText = topArticle.ai_summary || `This week's top stories from AI, wellness, and fitness—with insights for your business.`;
                  
                  return (
                    <div className="card-tech p-4 mb-4 space-y-4">
                      <h3 className="font-medium text-accent">📧 Email Copy (click to copy)</h3>
                      
                      {/* Subject Line */}
                      <div>
                        <label className="text-xs text-muted-foreground uppercase tracking-wide">Subject Line</label>
                        <div 
                          className="mt-1 p-3 bg-secondary rounded-lg cursor-pointer hover:bg-secondary/80 transition-colors flex items-center justify-between group"
                          onClick={() => {
                            navigator.clipboard.writeText(subjectLine);
                            toast({
                              title: "Subject copied",
                              description: "Subject line copied to clipboard.",
                            });
                          }}
                        >
                          <span className="font-medium">{subjectLine}</span>
                          <Copy size={14} className="text-muted-foreground group-hover:text-accent" />
                        </div>
                      </div>
                      
                      {/* Preview Text */}
                      <div>
                        <label className="text-xs text-muted-foreground uppercase tracking-wide">Preview Text</label>
                        <div 
                          className="mt-1 p-3 bg-secondary rounded-lg cursor-pointer hover:bg-secondary/80 transition-colors flex items-start justify-between gap-3 group"
                          onClick={() => {
                            navigator.clipboard.writeText(previewText);
                            toast({
                              title: "Preview text copied",
                              description: "Preview text copied to clipboard.",
                            });
                          }}
                        >
                          <span className="text-sm text-muted-foreground">{previewText}</span>
                          <Copy size={14} className="text-muted-foreground group-hover:text-accent flex-shrink-0 mt-0.5" />
                        </div>
                      </div>
                    </div>
                  );
                })()}

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
                  <div className="bg-secondary px-4 py-2 flex items-center justify-between border-b border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="ml-2 text-xs text-muted-foreground">Email Preview</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1 text-xs h-7"
                        onClick={() => {
                          navigator.clipboard.writeText(previewHtml);
                          toast({
                            title: "HTML Copied",
                            description: "Newsletter HTML copied to clipboard. Paste into Resend's HTML editor.",
                          });
                        }}
                      >
                        <Copy size={14} />
                        Copy HTML
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1 text-xs h-7"
                        onClick={() => {
                          const blob = new Blob([previewHtml], { type: 'text/html' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `newsletter-${new Date().toISOString().split('T')[0]}.html`;
                          a.click();
                          URL.revokeObjectURL(url);
                          toast({
                            title: "HTML Downloaded",
                            description: "Newsletter HTML file saved.",
                          });
                        }}
                      >
                        <FileDown size={14} />
                        Download
                      </Button>
                    </div>
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
                    onClick={() => fetchSubscribers()} 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2"
                    disabled={loadingSubscribers}
                  >
                    <RefreshCw size={16} className={loadingSubscribers ? 'animate-spin' : ''} />
                    Refresh
                  </Button>
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

            {/* Admin User Management */}
            <div className="card-glass p-6 mb-8">
              <button
                onClick={() => setAdminUsersExpanded(!adminUsersExpanded)}
                className="w-full flex items-center justify-between text-left"
              >
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Shield size={20} />
                  Admin Users ({adminUsers.filter(u => u.is_admin).length})
                </h2>
                {adminUsersExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </button>
              
              {adminUsersExpanded && (
                <div className="mt-4">
                  {/* Add admin form */}
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Email of user to grant admin access..."
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="bg-secondary border-border flex-1"
                    />
                    <Button
                      variant="accent"
                      onClick={() => grantAdminAccess(undefined, newAdminEmail)}
                      disabled={!newAdminEmail.trim()}
                    >
                      <ShieldCheck size={16} className="mr-2" />
                      Grant Admin
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    Users must sign up first before you can grant them admin access.
                  </p>

                  {loadingAdminUsers ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-accent" />
                    </div>
                  ) : adminUsers.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No users found.</p>
                  ) : (
                    <div className="card-tech overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-secondary">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Verified</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Joined</th>
                            <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminUsers.map((adminUser) => (
                            <tr key={adminUser.id} className="border-t border-border">
                              <td className="px-4 py-3 text-sm font-medium">{adminUser.email}</td>
                              <td className="px-4 py-3 text-sm">
                                {adminUser.is_admin ? (
                                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                                    <ShieldCheck size={12} />
                                    Admin
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-secondary text-muted-foreground">
                                    User
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {adminUser.email_confirmed_at ? (
                                  <span className="text-green-400">✓ Verified</span>
                                ) : (
                                  <span className="text-yellow-400">Pending</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-muted-foreground">
                                {new Date(adminUser.created_at).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </td>
                              <td className="px-4 py-3 text-sm text-right">
                                {adminUser.is_admin ? (
                                  adminUser.id === user?.id ? (
                                    <span className="text-xs text-muted-foreground">You</span>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => revokeAdminAccess(adminUser.id, adminUser.email)}
                                      className="h-8 text-red-400 hover:text-red-300 gap-1"
                                    >
                                      <ShieldX size={14} />
                                      Revoke
                                    </Button>
                                  )
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => grantAdminAccess(adminUser.id)}
                                    className="h-8 text-accent hover:text-accent/80 gap-1"
                                    disabled={!adminUser.email_confirmed_at}
                                  >
                                    <ShieldCheck size={14} />
                                    Grant Admin
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* AI Readiness Index Usage */}
            <div className="card-glass p-6 mb-8">
              <button
                onClick={() => setReadinessExpanded(!readinessExpanded)}
                className="w-full flex items-center justify-between text-left"
              >
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Activity size={20} className="text-purple-400" />
                  AI Readiness Index ({readinessStats?.totalCompletions || 0} completions)
                </h2>
                {readinessExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </button>

              {/* Quick Stats */}
              {readinessStats && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-secondary/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-purple-400">{readinessStats.totalCompletions}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-accent">{readinessStats.completionsThisWeek}</p>
                    <p className="text-xs text-muted-foreground">This Week</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-blue-400">{readinessStats.avgScoreThisWeek}%</p>
                    <p className="text-xs text-muted-foreground">Avg Score</p>
                  </div>
                </div>
              )}
              
              {readinessExpanded && (
                <div className="mt-4">
                  {loadingReadiness ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-accent" />
                    </div>
                  ) : readinessCompletions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No completions yet.</p>
                  ) : (
                    <div className="card-tech overflow-x-auto">
                      <table className="w-full min-w-[800px]">
                        <thead className="bg-secondary">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Company</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
                            <th className="px-4 py-3 text-center text-sm font-medium">Score</th>
                            <th className="px-4 py-3 text-left text-sm font-medium">Band</th>
                          </tr>
                        </thead>
                        <tbody>
                          {readinessCompletions.map((completion) => (
                            <tr key={completion.id} className="border-t border-border">
                              <td className="px-4 py-3 text-sm text-muted-foreground">
                                {new Date(completion.completed_at).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium">{completion.email}</td>
                              <td className="px-4 py-3 text-sm">{completion.name || '-'}</td>
                              <td className="px-4 py-3 text-sm">{completion.company || '-'}</td>
                              <td className="px-4 py-3 text-sm text-muted-foreground">{completion.role || '-'}</td>
                              <td className="px-4 py-3 text-sm text-center">
                                <span className={`inline-flex items-center justify-center w-12 h-8 rounded font-bold ${
                                  completion.overall_score >= 80 ? 'bg-green-500/10 text-green-400' :
                                  completion.overall_score >= 60 ? 'bg-accent/10 text-accent' :
                                  completion.overall_score >= 40 ? 'bg-yellow-500/10 text-yellow-400' :
                                  'bg-red-500/10 text-red-400'
                                }`}>
                                  {completion.overall_score}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                                  completion.score_band === 'AI-Native' ? 'bg-green-500/10 text-green-400' :
                                  completion.score_band === 'AI-Ready' ? 'bg-accent/10 text-accent' :
                                  completion.score_band === 'AI-Curious' ? 'bg-yellow-500/10 text-yellow-400' :
                                  'bg-red-500/10 text-red-400'
                                }`}>
                                  {completion.score_band || 'Unknown'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

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
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => resumeSend(send.id)}
                                  className="border-border hover:bg-secondary"
                                >
                                  <RefreshCw size={14} className="mr-1" />
                                  Resend Unsent
                                </Button>
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