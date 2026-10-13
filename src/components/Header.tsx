import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles, User, LogOut, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/wellness-genius-logo-teal.webp";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [latestReportId, setLatestReportId] = useState<string | null>(null);
  const { user, isLoading, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) { setIsAdmin(false); return; }
      try {
        const { data } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
        setIsAdmin(data === true);
      } catch { setIsAdmin(false); }
    }
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    async function fetchLatestReport() {
      if (!user) { setLatestReportId(null); return; }
      try {
        const { data } = await supabase
          .from('ai_readiness_completions')
          .select('id')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        setLatestReportId(data?.id ?? null);
      } catch { setLatestReportId(null); }
    }
    fetchLatestReport();
  }, [user]);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  type NavItem = { href: string; label: string; dropdown?: { href: string; label: string }[] };
  const navLinks: NavItem[] = [
    { href: "/advisor", label: "AI Advisor" },
    { href: "/ai-readiness", label: "Assessments", dropdown: [
      { href: "/ai-readiness", label: "AI Readiness Assessment" },
      { href: "/privacy-readiness", label: "Privacy Readiness Check" },
    ]},
    { href: "/products", label: "Resources", dropdown: [
      { href: "/products", label: "Playbooks & Downloads" },
      { href: "/bundles", label: "Bundles" },
      { href: "/insights", label: "Blog & Insights" },
      { href: "/news", label: "Operator Intel" },
      { href: "/newsletter", label: "Weekly Newsletter" },
    ]},
    { href: "/#pricing", label: "Pricing" },
    { href: "/services", label: "Consulting" },
  ];
  const mobileLinks = navLinks.flatMap((l) => l.dropdown ?? [l]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
      <div className="container-wide px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={logo} alt="Wellness Genius" className="h-9 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => (
              link.dropdown ? (
                <DropdownMenu key={link.href}>
                  <DropdownMenuTrigger className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                    link.dropdown.some(d => isActive(d.href))
                      ? "text-accent"
                      : "text-muted-foreground hover:text-foreground"
                  }`}>
                    {link.label}
                    <ChevronDown size={13} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-[180px]">
                    {link.dropdown.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link to={item.href} className="w-full">{item.label}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : link.href.startsWith("/#") ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium transition-colors rounded-md text-muted-foreground hover:text-foreground"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                    isActive(link.href.split("?")[0]) ? "text-accent" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              )
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-2">
            {!isLoading && (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md">
                    <User size={15} />
                    My Hub
                    {isAdmin && (
                      <Badge variant="outline" className="ml-1 px-1.5 py-0 text-[10px] font-bold border-amber-500/50 text-amber-600">
                        Admin
                      </Badge>
                    )}
                    <ChevronDown size={13} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[160px]">
                    <DropdownMenuItem asChild>
                      <Link to="/hub" className="w-full">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/hub?tab=knowledge" className="w-full">Knowledge Base</Link>
                    </DropdownMenuItem>
                    {latestReportId && (
                      <DropdownMenuItem asChild>
                        <Link to={`/ai-readiness/report/${latestReportId}`} className="w-full">My Results</Link>
                      </DropdownMenuItem>
                    )}
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="w-full text-amber-600">Admin</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/founder" className="w-full text-amber-600">Founder</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()} className="text-muted-foreground">
                      <LogOut size={14} className="mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  to="/auth"
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
              )
            )}
            <Button variant="accent" size="sm" asChild className="gap-1.5">
              <Link to={user ? "/genie" : "/auth?redirect=/genie"}>
                <Sparkles size={14} />
                Try free
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border/30 animate-fade-in">
            <nav className="flex flex-col gap-1">
              {mobileLinks.map((item) =>
                item.href.startsWith("/#") ? (
                  <a key={item.href} href={item.href} className="px-3 py-2.5 text-base font-medium text-foreground rounded-md" onClick={() => setIsMenuOpen(false)}>
                    {item.label}
                  </a>
                ) : (
                  <Link key={item.href} to={item.href} className={`px-3 py-2.5 text-base font-medium transition-colors rounded-md ${isActive(item.href) ? "text-accent bg-accent/5" : "text-foreground"}`} onClick={() => setIsMenuOpen(false)}>
                    {item.label}
                  </Link>
                )
              )}

              <div className="my-3 border-t border-border/30" />

              {!isLoading && (
                user ? (
                  <>
                    <Link to="/hub" className="px-3 py-2.5 text-base font-medium text-foreground" onClick={() => setIsMenuOpen(false)}>My Hub</Link>
                    {isAdmin && (
                      <Link to="/admin" className="px-3 py-2.5 text-base font-medium text-amber-600" onClick={() => setIsMenuOpen(false)}>Admin</Link>
                    )}
                    <button onClick={() => { signOut(); setIsMenuOpen(false); }} className="px-3 py-2.5 text-base font-medium text-muted-foreground text-left">Sign Out</button>
                  </>
                ) : (
                  <Link to="/auth" className="px-3 py-2.5 text-base font-medium text-foreground" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                )
              )}

              <div className="mt-3 px-3">
                <Button variant="accent" asChild className="w-full gap-2">
                  <Link to={user ? "/genie" : "/auth?redirect=/genie"} onClick={() => setIsMenuOpen(false)}>
                    <Sparkles size={16} />
                    Try free: 10 AI sessions
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
