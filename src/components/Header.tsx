import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogIn } from "lucide-react";
import logo from "@/assets/wellness-genius-logo-teal.png";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isLoading } = useAuth();

  const navLinks = [
    { href: "/ai-readiness", label: "Free AI Assessment", isRoute: true },
    { href: "/products", label: "Products", isRoute: true },
    { href: "/#services", label: "Services", isRoute: false },
    { href: "/#proof", label: "Proof", isRoute: false },
    { href: "/#how-it-works", label: "How It Works", isRoute: false },
    { href: "/insights", label: "Insights", isRoute: true },
    { href: "/news", label: "Latest News", isRoute: true },
    { href: "/speaker-kit", label: "Speaker Kit", isRoute: true },
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
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              link.isRoute ? (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm font-medium text-accent hover:text-accent/80 transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              )
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {!isLoading && (
              user ? (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/hub">
                    <User size={16} />
                    My Hub
                  </Link>
                </Button>
              ) : (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">
                    <LogIn size={16} />
                    Sign In
                  </Link>
                </Button>
              )
            )}
            <Button variant="accent" size="default" asChild>
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
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                link.isRoute ? (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-base font-medium text-accent hover:text-accent/80 transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                )
              ))}
              <div className="flex flex-col gap-3 pt-4">
                {!isLoading && (
                  user ? (
                    <Button variant="outline" asChild>
                      <Link to="/hub" onClick={() => setIsMenuOpen(false)}>
                        <User size={16} />
                        My Hub
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" asChild>
                      <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                        <LogIn size={16} />
                        Sign In
                      </Link>
                    </Button>
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