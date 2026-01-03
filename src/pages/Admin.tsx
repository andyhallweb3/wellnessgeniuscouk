import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminAuth } from "@/hooks/useAdminAuth";
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
  Gift
} from "lucide-react";

const ADMIN_SECTIONS = [
  { 
    id: "newsletter", 
    label: "Newsletter", 
    description: "Manage articles, subscribers, and send newsletters",
    icon: Newspaper,
    path: "/news/admin",
    color: "bg-blue-500/10 text-blue-600"
  },
  { 
    id: "downloads", 
    label: "Downloads & Upsells", 
    description: "Track downloads, manage upsell campaigns, view A/B tests",
    icon: Download,
    path: "/downloads/admin",
    color: "bg-green-500/10 text-green-600"
  },
  { 
    id: "emails", 
    label: "Email Templates", 
    description: "Create and manage email templates for automation",
    icon: Mail,
    path: "/emails/admin",
    color: "bg-purple-500/10 text-purple-600"
  },
  { 
    id: "credits", 
    label: "Coach Credits", 
    description: "Manage user credits, view transactions, trigger resets",
    icon: Coins,
    path: "/coach/admin",
    color: "bg-amber-500/10 text-amber-600"
  },
  { 
    id: "feedback", 
    label: "Feedback Reports", 
    description: "View and manage user-reported problems and feature requests",
    icon: MessageSquareWarning,
    path: "/feedback/admin",
    color: "bg-rose-500/10 text-rose-600"
  },
  { 
    id: "validation", 
    label: "Validation Errors", 
    description: "Track API validation errors and request issues over time",
    icon: Shield,
    path: "/validation/admin",
    color: "bg-orange-500/10 text-orange-600"
  },
  { 
    id: "knowledge", 
    label: "Knowledge Base", 
    description: "Add resources and insights the AI advisor uses in responses",
    icon: BookOpen,
    path: "/knowledge/admin",
    color: "bg-teal-500/10 text-teal-600"
  },
  { 
    id: "coupons", 
    label: "Coupon Analytics", 
    description: "Track newsletter coupon redemptions and conversion rates",
    icon: Gift,
    path: "/coupons/admin",
    color: "bg-pink-500/10 text-pink-600"
  },
];

const Admin = () => {
  const navigate = useNavigate();
  const { 
    isAdmin, 
    isLoading: authLoading, 
    isAuthenticated, 
    signIn, 
    signOut,
  } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    setError(null);
    
    const result = await signIn(email, password);
    
    if (result.error) {
      setError(result.error.message);
    }
    
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
          <title>Admin Login | Wellness Genius</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-elegant">
            <div className="flex items-center gap-3 mb-8 justify-center">
              <div className="p-3 rounded-full bg-accent/10">
                <Lock size={24} className="text-accent" />
              </div>
              <div>
                <h1 className="text-2xl font-heading">Admin Dashboard</h1>
                <p className="text-muted-foreground text-sm">Sign in to continue</p>
              </div>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={isSigningIn}>
                {isSigningIn ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
                ← Back to site
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Admin Dashboard | Wellness Genius</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container-wide flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-accent/10">
              <Shield size={20} className="text-accent" />
            </div>
            <h1 className="font-heading text-xl">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              View Site
            </Link>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut size={16} />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container-wide py-8 px-6">
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-2">Welcome back</h2>
          <p className="text-muted-foreground">
            Select a section to manage your platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ADMIN_SECTIONS.map((section) => {
            const Icon = section.icon;
            
            return (
              <button
                key={section.id}
                onClick={() => navigate(section.path)}
                className="group text-left p-6 rounded-2xl border border-border bg-card hover:border-accent/50 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${section.color}`}>
                    <Icon size={24} />
                  </div>
                  <ArrowRight 
                    size={20} 
                    className="text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" 
                  />
                </div>
                <h3 className="text-lg font-heading mb-2">{section.label}</h3>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Admin;
