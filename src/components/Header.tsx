import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, LayoutDashboard, Bookmark, Sparkles, Shield, Mail } from "lucide-react";
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

const ADVISOR_VISITED_KEY = "wg_advisor_visited";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdvisorBadge, setShowAdvisorBadge] = useState(false);
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Check if user has visited advisor page before
  useEffect(() => {
    const hasVisited = localStorage.getItem(ADVISOR_VISITED_KEY);
    setShowAdvisorBadge(!hasVisited);
  }, []);

  // Mark as visited when on advisor page
  useEffect(() => {
    if (location.pathname === "/advisor" || location.pathname === "/ai-advisor") {
      localStorage.setItem(ADVISOR_VISITED_KEY, "true");
      setShowAdvisorBadge(false);
    }
  }, [location.pathname]);

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

  const isActive = (path: string) => location.pathname === path;

  const resourcesLinks = [
    { href: "/news", label: "Industry News", isRoute: true },
    { href: "/insights", label: "Insights", isRoute: true },
    { href: "/hub/structured-ai-ebook", label: "Free AI Ebook", isRoute: true },
    { href: "/newsletter", label: "Subscribe", isRoute: true, icon: Mail },
  ];

  const productLinks = [
    { href: "/products", label: "All Products" },
    { href: "/bundles", label: "Bundles & Deals" },
  ];

  const serviceLinks = [
    { href: "/services", label: "Consulting & Training" },
    { href: "/software", label: "Software Development" },
  ];

  const aboutLinks = [
    { href: "/speaker-kit", label: "Speaking", isRoute: true },
  ];

  const hubLinks = [
    { href: "/hub", label: "Dashboard", icon: LayoutDashboard },
    { href: "/genie", label: "AI Advisor", icon: Sparkles },
    { href: "/hub/insights", label: "Saved Insights", icon: Bookmark },
  ];
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/30">
      <div className="container-wide px-6 lg:px-12">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Wellness Genius" className="h-10 lg:h-12 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Products Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent/5">
                Products
                <ChevronDown size={14} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-popover border border-border shadow-lg z-50">
                {productLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link 
                      to={link.href} 
                      className={`w-full ${isActive(link.href) ? "text-accent font-medium" : ""}`}
                    >
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Services Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent/5">
                Services
                <ChevronDown size={14} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-popover border border-border shadow-lg z-50">
                {serviceLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link 
                      to={link.href} 
                      className={`w-full ${isActive(link.href) ? "text-accent font-medium" : ""}`}
                    >
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {/* AI Assessment */}
            <Link
              to="/ai-readiness"
              className={`px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                isActive("/ai-readiness")
                  ? "text-accent bg-accent/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/5"
              }`}
            >
              AI Assessment
            </Link>

            {/* Resources Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent/5">
                Resources
                <ChevronDown size={14} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-popover border border-border shadow-lg z-50">
                {resourcesLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link
                      to={link.href}
                      className={`w-full ${isActive(link.href) ? "text-accent font-medium" : ""}`}
                    >
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {/* About Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent/5">
                About
                <ChevronDown size={14} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-popover border border-border shadow-lg z-50">
                {aboutLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link to={link.href} className={`w-full flex items-center gap-2 ${isActive(link.href) ? "text-accent font-medium" : ""}`}>
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/admin" className={`w-full flex items-center gap-2 ${isActive("/admin") ? "text-accent font-medium" : ""}`}>
                    <Shield size={16} />
                    Admin Login
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {!isLoading && (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full border-2 transition-all animate-[pulse-glow_2s_ease-in-out_infinite] ${
                      isActive("/hub") || location.pathname.startsWith("/hub")
                        ? "border-accent bg-accent text-accent-foreground shadow-[0_0_15px_hsl(var(--accent)/0.4)]"
                        : "border-accent/50 bg-accent/10 text-accent hover:bg-accent/20 hover:border-accent shadow-[0_0_10px_hsl(var(--accent)/0.2)]"
                    }`}
                  >
                    <img src={logo} alt="" className="h-5 w-5 object-contain" />
                    My Hub
                    {isAdmin && (
                      <Badge variant="outline" className="ml-1 px-1.5 py-0 text-[10px] font-bold border-amber-500 text-amber-600 bg-amber-500/10">
                        ADMIN
                      </Badge>
                    )}
                    <ChevronDown size={14} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover border border-border shadow-lg z-50 min-w-[180px]">
                    {hubLinks.map((link) => (
                      <DropdownMenuItem key={link.href} asChild>
                        <Link 
                          to={link.href} 
                          className={`w-full flex items-center gap-2 ${isActive(link.href) ? "text-accent font-medium" : ""}`}
                        >
                          <link.icon size={16} />
                          {link.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="w-full flex items-center gap-2 text-amber-600">
                            <Shield size={16} />
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/hub" className="w-full flex items-center gap-2">
                        <LayoutDashboard size={16} />
                        Go to Hub
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  to="/auth"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full border-2 border-accent/50 bg-accent/10 text-accent hover:bg-accent/20 hover:border-accent transition-all animate-[pulse-glow_2s_ease-in-out_infinite] shadow-[0_0_10px_hsl(var(--accent)/0.2)]"
                >
                  <img src={logo} alt="" className="h-5 w-5 object-contain" />
                  Sign In
                </Link>
              )
            )}
            <Button 
              variant="accent" 
              size="sm" 
              asChild 
              className="gap-1.5 relative animate-[pulse-glow_2s_ease-in-out_infinite] shadow-[0_0_12px_hsl(var(--accent)/0.4)] hover:shadow-[0_0_20px_hsl(var(--accent)/0.6)]"
            >
              <Link to="/advisor">
                <Sparkles size={14} className="animate-pulse" />
                AI Advisor
                {showAdvisorBadge && (
                  <span className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full animate-bounce">
                    Try it!
                  </span>
                )}
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="#contact">Book a Call</a>
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
          <div className="lg:hidden py-6 border-t border-border/30 animate-fade-in">
            <nav className="flex flex-col gap-1">
              {/* Products Section */}
              <p className="text-xs font-medium text-muted-foreground px-2 pt-2 pb-1">Products</p>
              {productLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-3 py-2 text-base font-medium transition-colors rounded-md ${
                    isActive(link.href) ? "text-accent bg-accent/5" : "text-foreground hover:bg-accent/5"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* Services Section */}
              <p className="text-xs font-medium text-muted-foreground px-2 pt-4 pb-1">Services</p>
              {serviceLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-3 py-2 text-base font-medium transition-colors rounded-md ${
                    isActive(link.href) ? "text-accent bg-accent/5" : "text-foreground hover:bg-accent/5"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* Resources */}
              <p className="text-xs font-medium text-muted-foreground px-2 pt-4 pb-1">Resources</p>
              <Link
                to="/ai-readiness"
                className={`px-3 py-2 text-base font-medium transition-colors rounded-md ${
                  isActive("/ai-readiness") ? "text-accent bg-accent/5" : "text-foreground hover:bg-accent/5"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                AI Assessment
              </Link>
              {resourcesLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-3 py-2 text-base font-medium transition-colors rounded-md ${
                    isActive(link.href) ? "text-accent bg-accent/5" : "text-foreground hover:bg-accent/5"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {/* About Section */}
              <p className="text-xs font-medium text-muted-foreground px-2 pt-4 pb-1">About</p>
              {aboutLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-3 py-2 text-base font-medium text-foreground hover:bg-accent/5 transition-colors rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/admin"
                className={`px-3 py-2 text-base font-medium transition-colors rounded-md flex items-center gap-2 ${
                  isActive("/admin") ? "text-accent bg-accent/5" : "text-foreground hover:bg-accent/5"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Shield size={16} />
                Admin Login
              </Link>

              <div className="flex flex-col gap-2 pt-6 border-t border-border/30 mt-4">
                {!isLoading && (
                  user ? (
                    <Link
                      to="/hub"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center gap-2 px-4 py-3 text-base font-semibold rounded-full border-2 border-accent bg-accent/10 text-accent hover:bg-accent/20 transition-all"
                    >
                      <img src={logo} alt="" className="h-6 w-6 object-contain" />
                      My Hub
                      {isAdmin && (
                        <Badge variant="outline" className="ml-1 px-1.5 py-0 text-[10px] font-bold border-amber-500 text-amber-600 bg-amber-500/10">
                          ADMIN
                        </Badge>
                      )}
                    </Link>
                  ) : (
                    <Link
                      to="/auth"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center gap-2 px-4 py-3 text-base font-semibold rounded-full border-2 border-accent bg-accent/10 text-accent hover:bg-accent/20 transition-all"
                    >
                      <img src={logo} alt="" className="h-6 w-6 object-contain" />
                      Sign In
                    </Link>
                  )
                )}
                <Button 
                  variant="accent" 
                  asChild 
                  className="gap-2 relative animate-[pulse-glow_2s_ease-in-out_infinite] shadow-[0_0_12px_hsl(var(--accent)/0.4)]"
                >
                  <Link to="/advisor" onClick={() => setIsMenuOpen(false)}>
                    <Sparkles size={16} className="animate-pulse" />
                    AI Advisor
                    {showAdvisorBadge && (
                      <Badge variant="default" className="ml-1 px-1.5 py-0 text-[10px] font-bold animate-pulse">
                        Try it!
                      </Badge>
                    )}
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <a href="#contact" onClick={() => setIsMenuOpen(false)}>Book a Call</a>
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