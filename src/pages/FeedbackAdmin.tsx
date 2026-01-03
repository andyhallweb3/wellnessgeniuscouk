import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Lock } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { FeedbackAdminList } from "@/components/feedback/FeedbackAdminList";
import { Button } from "@/components/ui/button";
import AdminBreadcrumb from "@/components/admin/AdminBreadcrumb";

const FeedbackAdmin = () => {
  const { isAdmin, isLoading: authLoading, isAuthenticated } = useAdminAuth();

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
          <title>Admin Access Required | Wellness Genius</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="text-center">
          <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-xl font-heading mb-2">Admin Access Required</h1>
          <p className="text-muted-foreground mb-4">
            You need to be an admin to view this page.
          </p>
          <Link to="/admin">
            <Button>Go to Admin Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Feedback Reports | Admin | Wellness Genius</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container-wide flex items-center h-16 px-6">
          <Link
            to="/admin"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Admin</span>
          </Link>
        </div>
      </header>

      <AdminBreadcrumb currentPage="Feedback Reports" />

      <main className="container-wide py-8 px-6 max-w-4xl mx-auto">
        <FeedbackAdminList />
      </main>
    </div>
  );
};

export default FeedbackAdmin;
