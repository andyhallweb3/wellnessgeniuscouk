import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn, ChevronDown, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/wellness-genius-logo-teal.png";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const mainNavLinks = [
    { href: "/ai-readiness", label: "AI Assessment", isRoute: true },
    { href: "/insights", label: "Insights", isRoute: true },
    { href: "/news", label: "News", isRoute: true },
    { href: "/speaker-kit", label: "Speaking", isRoute: true },
  ];

  const productLinks = [
    { href: "/products", label: "All Products" },
    { href: "/bundles", label: "Bundles & Deals" },
  ];

  const serviceLinks = [
    { href: "/#services", label: "Services", isAnchor: true },
    { href: "/#proof", label: "Proof", isAnchor: true },
    { href: "/#how-it-works", label: "How It Works", isAnchor: true },
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

            {/* Main Nav Links */}
            {mainNavLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                  isActive(link.href) 
                    ? "text-accent bg-accent/5" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/5"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* About Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent/5">
                About
                <ChevronDown size={14} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-popover border border-border shadow-lg z-50">
                {serviceLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <a href={link.href} className="w-full">
                      {link.label}
                    </a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {!isLoading && (
              user ? (
                <Link
                  to="/hub"
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full border-2 transition-all ${
                    isActive("/hub") || location.pathname.startsWith("/hub")
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-accent/50 bg-accent/10 text-accent hover:bg-accent/20 hover:border-accent"
                  }`}
                >
                  <img src={logo} alt="" className="h-5 w-5 object-contain" />
                  My Hub
                </Link>
              ) : (
                <Link
                  to="/auth"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full border-2 border-accent/50 bg-accent/10 text-accent hover:bg-accent/20 hover:border-accent transition-all"
                >
                  <img src={logo} alt="" className="h-5 w-5 object-contain" />
                  Sign In
                </Link>
              )
            )}
            <Button variant="accent" size="sm" asChild>
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

              {/* Main Nav */}
              <p className="text-xs font-medium text-muted-foreground px-2 pt-4 pb-1">Resources</p>
              {mainNavLinks.map((link) => (
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
              {serviceLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-base font-medium text-foreground hover:bg-accent/5 transition-colors rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}

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
                <Button variant="accent" asChild>
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