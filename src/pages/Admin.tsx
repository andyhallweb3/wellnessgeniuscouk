import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2,
  Lock,
  LogOut,
  Newspaper,
  Download,
  Mail,
  Coins,
  ArrowRight,
  Shield,
  MessageSquareWarning,
  BookOpen,
  Gift,
  Home,
  LayoutDashboard,
  FileText,
  Users,
  SendHorizonal,
  RefreshCcw,
  TrendingUp,
} from "lucide-react";

interface EmailStats {
  totalSubscribers: number;
  activeSubscribers: number;
  reengagementTotal: number;
  weeklyNewsThisWeek: number;
  recentLog: { email_type: string; email: string | null; sent_at: string }[];
}

const ADMIN_SECTIONS = [
  {
    id: "newsletter",
    label: "Newsletter",
    description: "Articles, subscribers, send history",
    icon: Newspaper,
    path: "/news/admin",
    color: "text-blue-400",
  },
  {
    id: "campaigns",
    label: "Email Campaigns",
    description: "Send campaigns via templates",
    icon: Mail,
    path: "/news/admin?tab=campaigns",
    color: "text-indigo-400",
  },
  {
    id: "emails",
    label: "Email Templates",
    description: "Create and manage templates",
    icon: Mail,
    path: "/emails/admin",
    color: "text-purple-400",
  },
  {
    id: "downloads",
    label: "Downloads & Upsells",
    description: "Downloads, upsells, A/B tests",
    icon: Download,
    path: "/downloads/admin",
    color: "text-green-400",
  },
  {
    id: "credits",
    label: "Coach Credits",
    description: "Credits, transactions, resets",
    icon: Coins,
    path: "/coach/admin",
    color: "text-amber-400",
  },
  {
    id: "knowledge",
    label: "Knowledge Base",
    description: "General AI advisor resources",
    icon: BookOpen,
    path: "/knowledge/admin",
    color: "text-teal-400",
  },
  {
    id: "kb-canon",
    label: "KB Canon",
    description: "Core IP frameworks & principles",
    icon: BookOpen,
    path: "/admin/kb-canon",
    color: "text-cyan-400",
  },
  {
    id: "kb-intel",
    label: "KB Intel",
    description: "Curated industry intelligence",
    icon: BookOpen,
    path: "/admin/kb-intel",
    color: "text-sky-400",
  },
  {
    id: "feedback",
    label: "Feedback",
    description: "User problems and requests",
    icon: MessageSquareWarning,
    path: "/feedback/admin",
    color: "text-rose-400",
  },
  {
    id: "coupons",
    label: "Coupon Analytics",
    description: "Redemptions and conversions",
    icon: Gift,
    path: "/coupons/admin",
    color: "text-pink-400",
  },
  {
    id: "docs",
    label: "Documentation",
    description: "Architecture and data models",
    icon: FileText,
    path: "/admin/docs",
    color: "text-slate-400",
  },
];

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: authLoading, isAuthenticated, signIn, signOut } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchStats = async () => {
      setStatsLoading(true);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [totalRes, activeRes, reengagementRes, reengagementWeekRes, weeklyRes, recentRes] =
        await Promise.all([
          supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }),
          supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("is_active", true).eq("bounced", false),
          supabase.from("email_automation_log").select("*", { count: "exact", head: true }).eq("email_type", "reengagement"),
          supabase.from("email_automation_log").select("*", { count: "exact", head: true }).eq("email_type", "reengagement").gte("sent_at", weekAgo),
          supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("is_active", true).gte("last_delivered_at", weekAgo),
          supabase.from("email_automation_log").select("email_type, email, sent_at").order("sent_at", { ascending: false }).limit(6),
        ]);

      setEmailStats({
        totalSubscribers: totalRes.count ?? 0,
        activeSubscribers: activeRes.count ?? 0,
        reengagementTotal: reengagementRes.count ?? 0,
        weeklyNewsThisWeek: weeklyRes.count ?? 0,
        recentLog: recentRes.data ?? [],
      });
      setStatsLoading(false);
    };
    fetchStats();
  }, [isAdmin]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    setError(null);
    const result = await signIn(email, password);
    if (result.error) setError(result.error.message);
    setIsSigningIn(false);
  };

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
          <title>Admin | Wellness Genius</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-elegant">
            <div className="flex items-center gap-3 mb-8 justify-center">
              <div className="p-2.5 rounded-full bg-accent/10">
                <Lock size={20} className="text-accent" />
              </div>
              <h1 className="text-xl font-heading">Admin</h1>
            </div>
            <form onSubmit={handleSignIn} className="space-y-3">
              <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              <Button type="submit" className="w-full" disabled={isSigningIn}>
                {isSigningIn ? <Loader2 className="animate-spin" size={16} /> : "Sign In"}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Back to site</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Admin | Wellness Genius</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container-wide flex items-center justify-between h-14 px-6">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-accent" />
            <span className="font-heading text-lg">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/hub"><LayoutDashboard size={14} className="mr-1.5" />Hub</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">Site</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut size={14} className="mr-1.5" />Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container-wide py-8 px-6 max-w-5xl">

        {/* Email Performance */}
        <section className="mb-10">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Email Performance</h2>
          {statsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 size={13} className="animate-spin" />Loading…
            </div>
          ) : emailStats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Total contacts", value: emailStats.totalSubscribers.toLocaleString(), icon: Users, color: "text-blue-400" },
                  { label: "Active subscribers", value: emailStats.activeSubscribers.toLocaleString(), icon: TrendingUp, color: "text-green-400" },
                  { label: "Re-engagement sent", value: emailStats.reengagementTotal.toLocaleString(), icon: RefreshCcw, color: "text-purple-400" },
                  { label: "Delivered this week", value: emailStats.weeklyNewsThisWeek.toLocaleString(), icon: SendHorizonal, color: "text-accent" },
                ].map(stat => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
                      <Icon size={13} className={`${stat.color} mb-2`} />
                      <p className="text-2xl font-bold font-heading leading-none mb-1">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              {emailStats.recentLog.length > 0 && (
                <div className="rounded-xl border border-border bg-card divide-y divide-border">
                  {emailStats.recentLog.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${entry.email_type === "reengagement" ? "bg-purple-400" : "bg-blue-400"}`} />
                        <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">{entry.email_type}</span>
                        <span className="text-muted-foreground truncate max-w-[200px]">{entry.email ?? "—"}</span>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                        {new Date(entry.sent_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </section>

        {/* Admin Sections */}
        <section>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Manage</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ADMIN_SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => navigate(section.path)}
                  className="group text-left p-4 rounded-xl border border-border bg-card hover:border-accent/40 hover:bg-card/80 transition-all duration-150 flex items-start gap-3"
                >
                  <Icon size={16} className={`${section.color} mt-0.5 shrink-0`} />
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{section.label}</p>
                      <ArrowRight size={13} className="text-muted-foreground/40 group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{section.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Admin;
