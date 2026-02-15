import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Compass,
  Activity,
  TrendingUp,
  FileText,
  Handshake,
  BookOpen,
  Shield,
  ChevronLeft,
  LogOut,
  LayoutDashboard,
  PenTool
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface FounderLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: "/founder", label: "Founder Today", icon: Compass },
  { path: "/founder/command", label: "Command Centre", icon: LayoutDashboard },
  { path: "/founder/content", label: "Content Drafts", icon: PenTool },
  { path: "/founder/health", label: "Business Health", icon: Activity },
  { path: "/founder/growth", label: "Growth Levers", icon: TrendingUp },
  { path: "/founder/narrative", label: "Narrative & Content", icon: FileText },
  { path: "/founder/partnerships", label: "Partnerships", icon: Handshake },
  { path: "/founder/decisions", label: "Decisions Log", icon: BookOpen },
  { path: "/founder/guardrails", label: "Guardrails & Strategy", icon: Shield },
];

export default function FounderLayout({ children }: FounderLayoutProps) {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) {
        setIsAdmin(false);
        setCheckingAdmin(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data === true);
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    }

    if (!authLoading) {
      checkAdminStatus();
    }
  }, [user, authLoading]);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && !checkingAdmin) {
      if (!user) {
        navigate('/auth', { state: { returnTo: location.pathname } });
      } else if (isAdmin === false) {
        navigate('/');
      }
    }
  }, [user, isAdmin, authLoading, checkingAdmin, navigate, location.pathname]);

  if (authLoading || checkingAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/50 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm">Back to site</span>
          </Link>
          <h1 className="mt-4 text-lg font-semibold tracking-tight">Command Centre</h1>
          <p className="text-xs text-muted-foreground mt-1">Strategic intelligence</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  isActive 
                    ? "bg-accent/10 text-accent font-medium" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
