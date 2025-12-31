import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [unsubscribed, setUnsubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const [manualEmail, setManualEmail] = useState("");

  useEffect(() => {
    document.title = "Unsubscribe | Wellness Genius";
  }, []);

  const performUnsubscribe = async (payload: { token?: string; email?: string }) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("unsubscribe", {
        body: payload,
      });

      if (fnError) throw fnError;

      if (data?.error) {
        setError(data.error);
        return;
      }

      setUnsubscribed(true);
      toast({
        title: "Unsubscribed",
        description: "You've been successfully unsubscribed from our newsletter.",
      });
    } catch (err) {
      console.error("Unsubscribe error:", err);
      setError("An error occurred. Please try again or contact support.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-unsubscribe if token (preferred) or email (legacy) is present
  useEffect(() => {
    if (unsubscribed || loading) return;
    if (token) performUnsubscribe({ token });
    else if (email) performUnsubscribe({ email });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, email]);

  const handleManualUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = manualEmail.trim().toLowerCase();
    if (!cleaned || !cleaned.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    await performUnsubscribe({ email: cleaned });
  };

  return (
    <div className="min-h-screen bg-background dark">
      <Header />
      
      <main className="pt-24 lg:pt-32 pb-20">
        <section className="section-padding">
          <div className="container-wide max-w-md mx-auto">
            <div className="card-glass p-8 text-center">
              {loading ? (
                <>
                  <div className="p-4 rounded-full bg-accent/10 w-fit mx-auto mb-6">
                    <Loader2 className="h-8 w-8 text-accent animate-spin" />
                  </div>
                  <h1 className="text-2xl font-bold mb-2">Processing...</h1>
                  <p className="text-muted-foreground">
                    Please wait while we process your unsubscribe request.
                  </p>
                </>
              ) : unsubscribed ? (
                <>
                  <div className="p-4 rounded-full bg-green-500/10 w-fit mx-auto mb-6">
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  </div>
                  <h1 className="text-2xl font-bold mb-2">You've been unsubscribed</h1>
                  <p className="text-muted-foreground mb-6">
                    You won't receive any more emails from Wellness Genius. We're sorry to see you go!
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Changed your mind? You can always resubscribe on our{" "}
                    <Link to="/insights" className="text-accent hover:underline">
                      Insights page
                    </Link>.
                  </p>
                  <Link to="/">
                    <Button variant="accent">Back to Home</Button>
                  </Link>
                </>
              ) : error ? (
                <>
                  <div className="p-4 rounded-full bg-red-500/10 w-fit mx-auto mb-6">
                    <AlertCircle className="h-8 w-8 text-red-400" />
                  </div>
                  <h1 className="text-2xl font-bold mb-2">Unable to Unsubscribe</h1>
                  <p className="text-muted-foreground mb-6">
                    {error}
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    If you continue to have issues, please contact us at{" "}
                    <a href="mailto:andy@wellnessgenius.co.uk" className="text-accent hover:underline">
                      andy@wellnessgenius.co.uk
                    </a>
                  </p>
                  <Link to="/">
                    <Button variant="accent">Back to Home</Button>
                  </Link>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-full bg-accent/10 w-fit mx-auto mb-6">
                    <Mail className="h-8 w-8 text-accent" />
                  </div>
                  <h1 className="text-2xl font-bold mb-2">Unsubscribe</h1>
                  <p className="text-muted-foreground mb-6">
                    Enter your email address to unsubscribe.
                  </p>

                  <form onSubmit={handleManualUnsubscribe} className="space-y-4 text-left">
                    <div className="space-y-2">
                      <Label htmlFor="manualEmail">Email</Label>
                      <Input
                        id="manualEmail"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={manualEmail}
                        onChange={(e) => setManualEmail(e.target.value)}
                      />
                    </div>
                    <Button type="submit" variant="accent" className="w-full" disabled={loading}>
                      Unsubscribe
                    </Button>
                  </form>

                  <Link
                    to="/"
                    className="mt-6 inline-block text-sm text-muted-foreground hover:text-accent transition-colors"
                  >
                    ← Back to Home
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Unsubscribe;
