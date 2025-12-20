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
  User,
  MousePointer,
  Eye,
  TrendingUp,
  BarChart3
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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
  ab_variant: string | null;
  ab_subject_line: string | null;
  email_opened: boolean;
  email_opened_at: string | null;
  email_clicked: boolean;
  email_clicked_at: string | null;
  converted: boolean;
  converted_at: string | null;
  conversion_product: string | null;
  conversion_value: number | null;
}

interface DownloadStats {
  totalDownloads: number;
  uniqueEmails: number;
  downloadsToday: number;
  pendingUpsells: number;
}

interface ABStats {
  variant: string;
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
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
  const [abStats, setAbStats] = useState<ABStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [sendingUpsell, setSendingUpsell] = useState<string | null>(null);
  const [sendingBulkUpsell, setSendingBulkUpsell] = useState(false);
  const [activeTab, setActiveTab] = useState("downloads");

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
      const typedData = (data || []) as ProductDownload[];
      setDownloads(typedData);
      calculateABStats(typedData);
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

  const calculateABStats = (data: ProductDownload[]) => {
    const variantMap = new Map<string, { sent: number; opened: number; clicked: number; converted: number }>();
    
    data.forEach((d) => {
      if (!d.ab_variant || !d.upsell_email_sent) return;
      
      const key = d.ab_variant;
      const current = variantMap.get(key) || { sent: 0, opened: 0, clicked: 0, converted: 0 };
      
      current.sent++;
      if (d.email_opened) current.opened++;
      if (d.email_clicked) current.clicked++;
      if (d.converted) current.converted++;
      
      variantMap.set(key, current);
    });

    const stats: ABStats[] = [];
    variantMap.forEach((value, key) => {
      stats.push({
        variant: key,
        sent: value.sent,
        opened: value.opened,
        clicked: value.clicked,
        converted: value.converted,
        openRate: value.sent > 0 ? (value.opened / value.sent) * 100 : 0,
        clickRate: value.opened > 0 ? (value.clicked / value.opened) * 100 : 0,
        conversionRate: value.clicked > 0 ? (value.converted / value.clicked) * 100 : 0,
      });
    });

    // Sort by conversion rate descending
    stats.sort((a, b) => b.conversionRate - a.conversionRate);
    setAbStats(stats);
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

  const sendUpsellEmail = async (download: ProductDownload, forceVariant?: string) => {
    setSendingUpsell(download.id);
    try {
      const { error } = await supabase.functions.invoke("send-download-upsell", {
        body: {
          email: download.email,
          name: download.name,
          productId: download.product_id,
          productName: download.product_name,
          forceResend: true,
          forceVariant,
        },
      });

      if (error) throw error;

      toast({
        title: "Upsell Email Sent",
        description: `Email sent to ${download.email}${forceVariant ? ` (Variant ${forceVariant})` : ''}`,
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

    for (const download of pending.slice(0, 50)) {
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

  // Overall email metrics
  const emailMetrics = {
    totalSent: downloads.filter(d => d.upsell_email_sent).length,
    totalOpened: downloads.filter(d => d.email_opened).length,
    totalClicked: downloads.filter(d => d.email_clicked).length,
    totalConverted: downloads.filter(d => d.converted).length,
  };

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
                <Input
                  type="email"
                  placeholder="Admin email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                />
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
                <p className="text-sm text-muted-foreground">Track downloads, A/B tests, and conversions</p>
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
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Download size={14} />
                  Downloads
                </div>
                <div className="text-2xl font-heading">{stats.totalDownloads}</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <User size={14} />
                  Unique
                </div>
                <div className="text-2xl font-heading">{stats.uniqueEmails}</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Mail size={14} />
                  Sent
                </div>
                <div className="text-2xl font-heading">{emailMetrics.totalSent}</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Eye size={14} />
                  Opened
                </div>
                <div className="text-2xl font-heading text-blue-500">{emailMetrics.totalOpened}</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <MousePointer size={14} />
                  Clicked
                </div>
                <div className="text-2xl font-heading text-purple-500">{emailMetrics.totalClicked}</div>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <TrendingUp size={14} />
                  Converted
                </div>
                <div className="text-2xl font-heading text-green-500">{emailMetrics.totalConverted}</div>
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
                  <Send size={14} />
                  Pending
                </div>
                <div className="text-2xl font-heading text-amber-500">{stats.pendingUpsells}</div>
              </div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="downloads">
                <FileText size={16} className="mr-2" />
                Downloads
              </TabsTrigger>
              <TabsTrigger value="ab-testing">
                <BarChart3 size={16} className="mr-2" />
                A/B Testing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="downloads" className="space-y-6">
              {/* Actions */}
              <div className="flex flex-col md:flex-row gap-4">
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
                      Send All ({stats?.pendingUpsells || 0})
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
                      <TableHead>Product</TableHead>
                      <TableHead>Variant</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Funnel</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : filteredDownloads.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No downloads found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDownloads.map((download) => (
                        <TableRow key={download.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{download.email}</div>
                              {download.name && (
                                <div className="text-sm text-muted-foreground">{download.name}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText size={14} className="text-muted-foreground" />
                              <span className="text-sm">{download.product_id}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {download.ab_variant ? (
                              <Badge variant="outline">{download.ab_variant}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(download.created_at).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span title="Sent">
                                {download.upsell_email_sent ? (
                                  <Mail size={14} className="text-green-500" />
                                ) : (
                                  <Mail size={14} className="text-muted-foreground" />
                                )}
                              </span>
                              <span title="Opened">
                                {download.email_opened ? (
                                  <Eye size={14} className="text-blue-500" />
                                ) : (
                                  <Eye size={14} className="text-muted-foreground" />
                                )}
                              </span>
                              <span title="Clicked">
                                {download.email_clicked ? (
                                  <MousePointer size={14} className="text-purple-500" />
                                ) : (
                                  <MousePointer size={14} className="text-muted-foreground" />
                                )}
                              </span>
                              <span title="Converted">
                                {download.converted ? (
                                  <TrendingUp size={14} className="text-green-500" />
                                ) : (
                                  <TrendingUp size={14} className="text-muted-foreground" />
                                )}
                              </span>
                            </div>
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
            </TabsContent>

            <TabsContent value="ab-testing" className="space-y-6">
              <div className="rounded-lg border bg-card p-6">
                <h2 className="text-lg font-heading mb-4 flex items-center gap-2">
                  <BarChart3 size={20} />
                  A/B Test Results
                </h2>
                
                {abStats.length === 0 ? (
                  <p className="text-muted-foreground">No A/B test data yet. Send some upsell emails to start collecting data.</p>
                ) : (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Variant</TableHead>
                          <TableHead className="text-right">Sent</TableHead>
                          <TableHead className="text-right">Opened</TableHead>
                          <TableHead className="text-right">Open Rate</TableHead>
                          <TableHead className="text-right">Clicked</TableHead>
                          <TableHead className="text-right">Click Rate</TableHead>
                          <TableHead className="text-right">Converted</TableHead>
                          <TableHead className="text-right">Conv. Rate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {abStats.map((stat, index) => (
                          <TableRow key={stat.variant} className={index === 0 ? "bg-green-500/10" : ""}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge variant={index === 0 ? "default" : "outline"}>
                                  {stat.variant}
                                </Badge>
                                {index === 0 && <span className="text-xs text-green-500">Winner</span>}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{stat.sent}</TableCell>
                            <TableCell className="text-right">{stat.opened}</TableCell>
                            <TableCell className="text-right">
                              <span className={stat.openRate > 30 ? "text-green-500" : stat.openRate > 20 ? "text-yellow-500" : "text-red-500"}>
                                {stat.openRate.toFixed(1)}%
                              </span>
                            </TableCell>
                            <TableCell className="text-right">{stat.clicked}</TableCell>
                            <TableCell className="text-right">
                              <span className={stat.clickRate > 20 ? "text-green-500" : stat.clickRate > 10 ? "text-yellow-500" : "text-red-500"}>
                                {stat.clickRate.toFixed(1)}%
                              </span>
                            </TableCell>
                            <TableCell className="text-right">{stat.converted}</TableCell>
                            <TableCell className="text-right">
                              <span className={stat.conversionRate > 5 ? "text-green-500" : stat.conversionRate > 2 ? "text-yellow-500" : "text-muted-foreground"}>
                                {stat.conversionRate.toFixed(1)}%
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <div className="rounded-lg border p-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Subject Lines Being Tested</h3>
                        <div className="space-y-2">
                          {[...new Set(downloads.filter(d => d.ab_subject_line).map(d => d.ab_subject_line))].slice(0, 5).map((subject, i) => (
                            <p key={i} className="text-sm truncate" title={subject || ''}>
                              {subject}
                            </p>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-lg border p-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Recommendation</h3>
                        {abStats.length > 0 && abStats[0].sent >= 30 ? (
                          <p className="text-sm">
                            Based on {abStats[0].sent} emails, <strong>Variant {abStats[0].variant}</strong> is performing best with a {abStats[0].conversionRate.toFixed(1)}% conversion rate.
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Need at least 30 emails per variant for statistically meaningful results.
                          </p>
                        )}
                      </div>
                      <div className="rounded-lg border p-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Revenue</h3>
                        <p className="text-2xl font-heading">
                          £{downloads.filter(d => d.converted && d.conversion_value).reduce((sum, d) => sum + (d.conversion_value || 0), 0).toFixed(0)}
                        </p>
                        <p className="text-sm text-muted-foreground">from {emailMetrics.totalConverted} conversions</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DownloadsAdmin;