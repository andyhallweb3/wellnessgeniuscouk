import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface AdminBreadcrumbProps {
  currentPage: string;
  parentPage?: { label: string; href: string };
}

const AdminBreadcrumb = ({ currentPage, parentPage }: AdminBreadcrumbProps) => {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground py-3 px-6 border-b border-border/50 bg-muted/30" aria-label="Breadcrumb">
      <Link to="/" className="hover:text-foreground transition-colors">
        Home
      </Link>
      <ChevronRight size={14} className="text-border" />
      <Link to="/hub" className="hover:text-foreground transition-colors">
        Hub
      </Link>
      <ChevronRight size={14} className="text-border" />
      <Link to="/admin" className="hover:text-foreground transition-colors">
        Admin
      </Link>
      {parentPage && (
        <>
          <ChevronRight size={14} className="text-border" />
          <Link to={parentPage.href} className="hover:text-foreground transition-colors">
            {parentPage.label}
          </Link>
        </>
      )}
      <ChevronRight size={14} className="text-border" />
      <span className="text-foreground">{currentPage}</span>
    </nav>
  );
};

export default AdminBreadcrumb;
