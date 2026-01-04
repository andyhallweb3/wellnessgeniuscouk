import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { NewsletterWorkflow } from "@/components/newsletter";
import AdminBreadcrumb from "@/components/admin/AdminBreadcrumb";
import { 
  Mail, 
  Lock,
  Loader2,
  ArrowLeft
} from "lucide-react";

const NewsletterAdmin = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const isResetMode = searchParams.get('reset') === 'true';
  const initialTab = searchParams.get('tab') || undefined;
  
  const { 
    user, 
    session,
    isAdmin, 
    isLoading: authLoading, 
    isAuthenticated, 
    signIn, 
    signUp,
    signOut, 
    resetPassword,
    updatePassword,
    getAuthHeaders,
    error: authError 
  } = useAdminAuth();
  
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login');
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  useEffect(() => {
    document.title = "Newsletter Admin | Wellness Genius";
  }, []);

  useEffect(() => {
    if (isResetMode && session && !isAdmin) {
      setAuthMode('reset');
    }
  }, [isResetMode, session, isAdmin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailInput.trim();
    const password = passwordInput.trim();
    if (!email || !password) return;

    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Authentication Failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Access Granted",
      description: "Welcome to the newsletter admin panel.",
    });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailInput.trim();
    const password = passwordInput.trim();
    const confirmPassword = confirmPasswordInput.trim();
    
    if (!email || !password || !confirmPassword) {
      toast({ title: "Missing Fields", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: "Password Mismatch", description: "Passwords do not match.", variant: "destructive" });
      return;
    }

    if (password.length < 6) {
      toast({ title: "Weak Password", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    const { error, needsEmailConfirmation } = await signUp(email, password);
    
    if (error) {
      toast({ title: "Sign Up Failed", description: error.message, variant: "destructive" });
      return;
    }

    if (needsEmailConfirmation) {
      setShowEmailConfirmation(true);
      toast({ title: "Verification Email Sent", description: "Please check your email to verify your account." });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailInput.trim();
    if (!email) {
      toast({ title: "Email Required", description: "Please enter your email address.", variant: "destructive" });
      return;
    }

    const { error } = await resetPassword(email);
    if (error) {
      toast({ title: "Request Failed", description: error.message, variant: "destructive" });
      return;
    }

    setResetEmailSent(true);
    toast({ title: "Reset Email Sent", description: "Check your email for a password reset link." });
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const password = passwordInput.trim();
    const confirmPassword = confirmPasswordInput.trim();

    if (!password || !confirmPassword) {
      toast({ title: "Missing Fields", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: "Password Mismatch", description: "Passwords do not match.", variant: "destructive" });
      return;
    }

    if (password.length < 6) {
      toast({ title: "Weak Password", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    const { error } = await updatePassword(password);
    if (error) {
      toast({ title: "Reset Failed", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Password Updated", description: "Your password has been changed. Please sign in." });
    setPasswordInput("");
    setConfirmPasswordInput("");
    setAuthMode('login');
    await signOut();
    window.history.replaceState({}, '', '/news/admin');
  };

  const handleLogout = async () => {
    await signOut();
    setEmailInput("");
    setPasswordInput("");
    setConfirmPasswordInput("");
    setShowEmailConfirmation(false);
    setResetEmailSent(false);
    setAuthMode('login');
    toast({ title: "Logged Out", description: "Admin session ended." });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  // Email confirmation screen
  if (showEmailConfirmation) {
    return (
      <div className="min-h-screen bg-background dark">
        <Header />
        <main className="pt-24 lg:pt-32 pb-20">
          <section className="section-padding">
            <div className="container-wide max-w-md mx-auto">
              <div className="card-glass p-8 text-center">
                <div className="p-4 rounded-full bg-green-500/10 w-fit mx-auto mb-6">
                  <Mail className="h-8 w-8 text-green-400" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
                <p className="text-muted-foreground mb-6">
                  We've sent a verification link to <strong className="text-foreground">{emailInput}</strong>.
                </p>
                <Button variant="outline" onClick={() => { setShowEmailConfirmation(false); setAuthMode('login'); }} className="w-full">
                  Back to Sign In
                </Button>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  // Password reset form
  if (authMode === 'reset' && session) {
    return (
      <div className="min-h-screen bg-background dark">
        <Header />
        <main className="pt-24 lg:pt-32 pb-20">
          <section className="section-padding">
            <div className="container-wide max-w-md mx-auto">
              <div className="card-glass p-8 text-center">
                <div className="p-4 rounded-full bg-accent/10 w-fit mx-auto mb-6">
                  <Lock className="h-8 w-8 text-accent" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Set New Password</h1>
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <Input type="password" placeholder="New password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="bg-secondary border-border" />
                  <Input type="password" placeholder="Confirm password" value={confirmPasswordInput} onChange={(e) => setConfirmPasswordInput(e.target.value)} className="bg-secondary border-border" />
                  <Button type="submit" variant="accent" className="w-full">Update Password</Button>
                </form>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  // Login/Signup forms
  if (!isAuthenticated) {
    if (resetEmailSent) {
      return (
        <div className="min-h-screen bg-background dark">
          <Header />
          <main className="pt-24 lg:pt-32 pb-20">
            <section className="section-padding">
              <div className="container-wide max-w-md mx-auto">
                <div className="card-glass p-8 text-center">
                  <Mail className="h-8 w-8 text-green-400 mx-auto mb-4" />
                  <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
                  <p className="text-muted-foreground mb-6">Password reset link sent to {emailInput}</p>
                  <Button variant="outline" onClick={() => { setResetEmailSent(false); setAuthMode('login'); }} className="w-full">Back to Sign In</Button>
                </div>
              </div>
            </section>
          </main>
          <Footer />
        </div>
      );
    }

    if (authMode === 'forgot') {
      return (
        <div className="min-h-screen bg-background dark">
          <Header />
          <main className="pt-24 lg:pt-32 pb-20">
            <section className="section-padding">
              <div className="container-wide max-w-md mx-auto">
                <div className="card-glass p-8 text-center">
                  <Mail className="h-8 w-8 text-accent mx-auto mb-4" />
                  <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <Input type="email" placeholder="Email address" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="bg-secondary border-border" />
                    <Button type="submit" variant="accent" className="w-full">Send Reset Link</Button>
                  </form>
                  <button onClick={() => setAuthMode('login')} className="mt-4 text-sm text-muted-foreground hover:text-accent">← Back to Sign In</button>
                </div>
              </div>
            </section>
          </main>
          <Footer />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background dark">
        <Header />
        <main className="pt-24 lg:pt-32 pb-20">
          <section className="section-padding">
            <div className="container-wide max-w-md mx-auto">
              <div className="card-glass p-8 text-center">
                <Lock className="h-8 w-8 text-accent mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">Newsletter Admin</h1>
                <p className="text-muted-foreground mb-6">{authMode === 'login' ? 'Sign in to access the admin panel.' : 'Create an admin account.'}</p>
                
                <div className="flex mb-6 bg-secondary rounded-lg p-1">
                  <button type="button" onClick={() => setAuthMode('login')} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${authMode === 'login' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}>Sign In</button>
                  <button type="button" onClick={() => setAuthMode('signup')} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${authMode === 'signup' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}>Sign Up</button>
                </div>

                {authError && <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">{authError}</div>}

                {authMode === 'login' ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <Input type="email" placeholder="Email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="bg-secondary border-border" />
                    <Input type="password" placeholder="Password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="bg-secondary border-border" />
                    <Button type="submit" variant="accent" className="w-full" disabled={authLoading}>
                      {authLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Sign In
                    </Button>
                    <button type="button" onClick={() => setAuthMode('forgot')} className="text-sm text-muted-foreground hover:text-accent">Forgot password?</button>
                  </form>
                ) : (
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <Input type="email" placeholder="Email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="bg-secondary border-border" />
                    <Input type="password" placeholder="Password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="bg-secondary border-border" />
                    <Input type="password" placeholder="Confirm password" value={confirmPasswordInput} onChange={(e) => setConfirmPasswordInput(e.target.value)} className="bg-secondary border-border" />
                    <Button type="submit" variant="accent" className="w-full" disabled={authLoading}>
                      {authLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Sign Up
                    </Button>
                  </form>
                )}
                <Link to="/" className="inline-block mt-4 text-sm text-muted-foreground hover:text-accent">← Back to Home</Link>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  // Main admin panel with workflow
  const getTabLabel = () => {
    switch (initialTab) {
      case 'campaigns': return 'Email Campaigns';
      case 'articles': return 'Select Articles';
      case 'preview': return 'Preview';
      case 'send': return 'Send';
      case 'history': return 'Send History';
      case 'manage': return 'Manage';
      default: return null;
    }
  };

  const tabLabel = getTabLabel();

  return (
    <div className="min-h-screen bg-background dark">
      <Header />
      <AdminBreadcrumb currentPage={tabLabel ? `Newsletter › ${tabLabel}` : "Newsletter"} />
      <main className="pt-8 pb-20">
        <section className="section-padding">
          <div className="container-wide">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Newsletter Admin</h1>
              <p className="text-muted-foreground">Manage your newsletter, subscribers, and content.</p>
            </div>

            <NewsletterWorkflow getAuthHeaders={getAuthHeaders} onLogout={handleLogout} initialTab={initialTab} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default NewsletterAdmin;
