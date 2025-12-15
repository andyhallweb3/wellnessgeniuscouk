import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [loading, setLoading] = useState(false);
  const [unsubscribed, setUnsubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Unsubscribe | Wellness Genius";
  }, []);

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use edge function to unsubscribe securely
      const { error: fnError } = await supabase.functions.invoke('unsubscribe', {
        body: { email: email.toLowerCase().trim() },
      });

      if (fnError) throw fnError;

      setUnsubscribed(true);
      toast({
        title: "Unsubscribed",
        description: "You've been successfully unsubscribed from our newsletter.",
      });
    } catch (err) {
      console.error("Unsubscribe error:", err);
      // Show success anyway to prevent email enumeration
      setUnsubscribed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark">
      <Header />
      
      <main className="pt-24 lg:pt-32 pb-20">
        <section className="section-padding">
          <div className="container-wide max-w-md mx-auto">
            <div className="card-glass p-8 text-center">
              {unsubscribed ? (
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
              ) : (
                <>
                  <div className="p-4 rounded-full bg-accent/10 w-fit mx-auto mb-6">
                    <Mail className="h-8 w-8 text-accent" />
                  </div>
                  <h1 className="text-2xl font-bold mb-2">Unsubscribe</h1>
                  <p className="text-muted-foreground mb-6">
                    Enter your email address to unsubscribe from our newsletter.
                  </p>
                  
                  <form onSubmit={handleUnsubscribe} className="space-y-4">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-secondary border-border"
                      required
                    />
                    
                    {error && (
                      <div className="flex items-center gap-2 text-red-400 text-sm">
                        <AlertCircle size={16} />
                        {error}
                      </div>
                    )}
                    
                    <Button 
                      type="submit" 
                      variant="destructive" 
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Unsubscribing...
                        </>
                      ) : (
                        "Unsubscribe"
                      )}
                    </Button>
                  </form>
                  
                  <Link 
                    to="/" 
                    className="inline-block mt-4 text-sm text-muted-foreground hover:text-accent transition-colors"
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
