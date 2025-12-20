import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { 
  Download, 
  RefreshCw, 
  ArrowLeft,
  Lock,
  Search,
  Mail,
  Loader2,
  FileText,
  CheckCircle,
  Send,
  Calendar,
  User
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface ProductDownload {
  id: string;
  email: string;
  name: string | null;
  product_id: string;
  product_name: string;
  product_type: string;
  download_type: string;
  created_at: string;
  upsell_email_sent: boolean;
  upsell_email_sent_at: string | null;
}

interface DownloadStats {
  totalDownloads: number;
  uniqueEmails: number;
  downloadsToday: number;
  pendingUpsells: number;
}

const DownloadsAdmin = () => {
  const { toast } = useToast();
  const { 
    isAdmin, 
    isLoading: authLoading, 
    isAuthenticated, 
    signIn, 
    signOut,
  } = useAdminAuth();
  
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  
  const [downloads, setDownloads] = useState<ProductDownload[]>([]);
  const [stats, setStats] = useState<DownloadStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [sendingUpsell, setSendingUpsell] = useState<string | null>(null);
  const [sendingBulkUpsell, setSendingBulkUpsell] = useState(false);

  useEffect(() => {
    document.title = "Downloads Admin | Wellness Genius";
  }, []);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchDownloads();
      fetchStats();
    }
  }, [isAuthenticated, isAdmin]);

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
      description: "Welcome to the downloads admin panel.",
    });
  };

  const fetchDownloads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("product_downloads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;
      setDownloads((data as ProductDownload[]) || []);
    } catch (error) {
      console.error("Error fetching downloads:", error);
      toast({
        title: "Error",
        description: "Failed to fetch downloads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: allDownloads, error } = await supabase
        .from("product_downloads")
        .select("email, created_at, upsell_email_sent");

      if (error) throw error;

      const today = new Date().toISOString().split("T")[0];
      const uniqueEmails = new Set((allDownloads || []).map((d: { email: string }) => d.email));
      const downloadsToday = (allDownloads || []).filter(
        (d: { created_at: string }) => d.created_at.startsWith(today)
      ).length;
      const pendingUpsells = (allDownloads || []).filter(
        (d: { upsell_email_sent: boolean }) => !d.upsell_email_sent
      ).length;

      setStats({
        totalDownloads: (allDownloads || []).length,
        uniqueEmails: uniqueEmails.size,
        downloadsToday,
        pendingUpsells,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const sendUpsellEmail = async (download: ProductDownload) => {
    setSendingUpsell(download.id);
    try {
      const { error } = await supabase.functions.invoke("send-download-upsell", {
        body: {
          email: download.email,
          name: download.name,
          productId: download.product_id,
          productName: download.product_name,
          forceResend: true,
        },
      });

      if (error) throw error;

      toast({
        title: "Upsell Email Sent",
        description: `Email sent to ${download.email}`,
      });

      fetchDownloads();
      fetchStats();
    } catch (error) {
      console.error("Error sending upsell:", error);
      toast({
        title: "Error",
        description: "Failed to send upsell email",
        variant: "destructive",
      });
    } finally {
      setSendingUpsell(null);
    }
  };

  const sendBulkUpsells = async () => {
    const pending = downloads.filter((d) => !d.upsell_email_sent);
    if (pending.length === 0) {
      toast({
        title: "No Pending Upsells",
        description: "All downloads have already received upsell emails.",
      });
      return;
    }

    setSendingBulkUpsell(true);
    let sent = 0;
    let failed = 0;

    for (const download of pending.slice(0, 50)) { // Limit to 50 at a time
      try {
        await supabase.functions.invoke("send-download-upsell", {
          body: {
            email: download.email,
            name: download.name,
            productId: download.product_id,
            productName: download.product_name,
            forceResend: true,
          },
        });
        sent++;
      } catch {
        failed++;
      }
    }

    toast({
      title: "Bulk Upsell Complete",
      description: `Sent: ${sent}, Failed: ${failed}`,
    });

    fetchDownloads();
    fetchStats();
    setSendingBulkUpsell(false);
  };

  const filteredDownloads = downloads.filter((d) => {
    const matchesSearch =
      d.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.name && d.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      d.product_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProduct = productFilter === "all" || d.product_id === productFilter;
    return matchesSearch && matchesProduct;
  });

  const uniqueProducts = [...new Set(downloads.map((d) => d.product_id))];

  // Login form for non-authenticated users
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container-wide section-padding">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Lock size={32} className="text-accent" />
                </div>
                <h1 className="text-2xl font-heading mb-2">Downloads Admin</h1>
                <p className="text-muted-foreground">Sign in to access the downloads dashboard</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Admin email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                  />
                </div>
                <Button type="submit" variant="accent" className="w-full">
                  Sign In
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/news/admin" className="text-sm text-accent hover:underline">
                  Back to Newsletter Admin
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container-wide section-padding">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/news/admin">
                  <ArrowLeft size={20} />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-heading">Downloads Admin</h1>
                <p className="text-sm text-muted-foreground">Track downloads and send upsell emails</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => { fetchDownloads(); fetchStats(); }} disabled={loading}>
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                Refresh
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Download size={14} />
                  Total Downloads
                </div>
                <div className="text-2xl font-heading">{stats.totalDownloads}</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <User size={14} />
                  Unique Emails
                </div>
                <div className="text-2xl font-heading">{stats.uniqueEmails}</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Calendar size={14} />
                  Today
                </div>
                <div className="text-2xl font-heading">{stats.downloadsToday}</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Mail size={14} />
                  Pending Upsells
                </div>
                <div className="text-2xl font-heading text-amber-500">{stats.pendingUpsells}</div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by email, name, or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {uniqueProducts.map((id) => (
                  <SelectItem key={id} value={id}>
                    {id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="accent"
              onClick={sendBulkUpsells}
              disabled={sendingBulkUpsell || !stats?.pendingUpsells}
            >
              {sendingBulkUpsell ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send All Upsells ({stats?.pendingUpsells || 0})
                </>
              )}
            </Button>
          </div>

          {/* Downloads Table */}
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Upsell Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredDownloads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No downloads found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDownloads.map((download) => (
                    <TableRow key={download.id}>
                      <TableCell className="font-medium">{download.email}</TableCell>
                      <TableCell>{download.name || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-muted-foreground" />
                          {download.product_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={download.product_type === "free" ? "outline" : "default"}>
                          {download.product_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(download.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        {download.upsell_email_sent ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle size={14} />
                            <span className="text-sm">Sent</span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-amber-600 border-amber-600">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => sendUpsellEmail(download)}
                          disabled={sendingUpsell === download.id}
                        >
                          {sendingUpsell === download.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Mail size={14} />
                          )}
                          {download.upsell_email_sent ? "Resend" : "Send"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredDownloads.length} of {downloads.length} downloads
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DownloadsAdmin;
