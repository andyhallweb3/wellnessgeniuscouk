import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Sparkles, User, LogOut } from "lucide-react";
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
  const { user, isLoading, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      try {
        const { data } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });
        setIsAdmin(data === true);
      } catch {
        setIsAdmin(false);
      }
    }
    checkAdminStatus();
  }, [user]);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  // Simplified navigation structure
  const navLinks = [
    { href: "/ai-readiness", label: "AI Assessment" },
    { href: "/products", label: "Products" },
    { href: "/services", label: "Services" },
    { href: "/insights", label: "Insights" },
    { href: "/news", label: "News" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
      <div className="container-wide px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Wellness Genius" className="h-9 w-auto" />
          </Link>

          {/* Desktop Navigation - Clean single-level */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                  isActive(link.href)
                    ? "text-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-2">
            {!isLoading && (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md">
                    <User size={16} />
                    My Hub
                    {isAdmin && (
                      <Badge variant="outline" className="ml-1 px-1.5 py-0 text-[10px] font-bold border-amber-500/50 text-amber-600">
                        Admin
                      </Badge>
                    )}
                    <ChevronDown size={14} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[160px]">
                    <DropdownMenuItem asChild>
                      <Link to="/hub" className="w-full">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/genie" className="w-full">AI Advisor</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/ai-readiness-results" className="w-full">My Results</Link>
                    </DropdownMenuItem>
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
              <Link to="/advisor">
                <Sparkles size={14} />
                Try AI Advisor
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
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-3 py-2.5 text-base font-medium transition-colors rounded-md ${
                    isActive(link.href) ? "text-accent bg-accent/5" : "text-foreground"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="my-3 border-t border-border/30" />
              
              {!isLoading && (
                user ? (
                  <>
                    <Link
                      to="/hub"
                      className="px-3 py-2.5 text-base font-medium text-foreground"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Hub
                    </Link>
                    <Link
                      to="/genie"
                      className="px-3 py-2.5 text-base font-medium text-foreground"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      AI Advisor
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="px-3 py-2.5 text-base font-medium text-amber-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={() => { signOut(); setIsMenuOpen(false); }}
                      className="px-3 py-2.5 text-base font-medium text-muted-foreground text-left"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    className="px-3 py-2.5 text-base font-medium text-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )
              )}
              
              <div className="mt-3 px-3">
                <Button variant="accent" asChild className="w-full gap-2">
                  <Link to="/advisor" onClick={() => setIsMenuOpen(false)}>
                    <Sparkles size={16} />
                    Try AI Advisor
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
