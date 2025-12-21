import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { 
  RefreshCw, 
  Search,
  Loader2,
  Coins,
  Users,
  Play,
  History,
  TrendingUp,
  Crown,
  Zap
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { format, formatDistanceToNow } from "date-fns";

interface CoachCredit {
  id: string;
  user_id: string;
  balance: number;
  monthly_allowance: number;
  last_reset_at: string;
  created_at: string;
  profile?: {
    email: string;
    full_name: string | null;
  };
}

interface CreditTransaction {
  id: string;
  user_id: string;
  change_amount: number;
  reason: string;
  mode: string | null;
  created_at: string;
  profile?: {
    email: string;
    full_name: string | null;
  };
}

interface Stats {
  totalUsers: number;
  totalCreditsUsed: number;
  recentResets: number;
  proUsers: number;
  expertUsers: number;
}

const CoachCreditsAdminContent = () => {
  const { toast } = useToast();
  const { isAuthenticated, isAdmin } = useAdminAuth();

  const [credits, setCredits] = useState<CoachCredit[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [triggeringReset, setTriggeringReset] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCreditsUsed: 0,
    recentResets: 0,
    proUsers: 0,
    expertUsers: 0,
  });

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchData();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: creditsData, error: creditsError } = await supabase
        .from("coach_credits")
        .select("*")
        .order("created_at", { ascending: false });

      if (creditsError) throw creditsError;

      if (creditsData && creditsData.length > 0) {
        const userIds = creditsData.map(c => c.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .in("id", userIds);

        const creditsWithProfiles = creditsData.map(credit => ({
          ...credit,
          profile: profiles?.find(p => p.id === credit.user_id),
        }));
        setCredits(creditsWithProfiles);

        const proUsers = creditsWithProfiles.filter(c => c.monthly_allowance === 40).length;
        const expertUsers = creditsWithProfiles.filter(c => c.monthly_allowance === 120).length;
        
        setStats(prev => ({
          ...prev,
          totalUsers: creditsData.length,
          proUsers,
          expertUsers,
        }));
      }

      const { data: transactionsData, error: transactionsError } = await supabase
        .from("credit_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (transactionsError) throw transactionsError;

      if (transactionsData && transactionsData.length > 0) {
        const userIds = [...new Set(transactionsData.map(t => t.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .in("id", userIds);

        const transactionsWithProfiles = transactionsData.map(tx => ({
          ...tx,
          profile: profiles?.find(p => p.id === tx.user_id),
        }));
        setTransactions(transactionsWithProfiles);

        const totalUsed = transactionsData
          .filter(t => t.change_amount < 0)
          .reduce((sum, t) => sum + Math.abs(t.change_amount), 0);
        
        const recentResets = transactionsData
          .filter(t => t.reason === "monthly_reset")
          .length;

        setStats(prev => ({
          ...prev,
          totalCreditsUsed: totalUsed,
          recentResets,
        }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerReset = async () => {
    setTriggeringReset(true);
    try {
      const { data, error } = await supabase.functions.invoke("reset-coach-credits");
      
      if (error) throw error;

      toast({
        title: "Reset triggered",
        description: data.message || "Credit reset completed",
      });

      fetchData();
    } catch (error) {
      console.error("Error triggering reset:", error);
      toast({
        title: "Error",
        description: "Failed to trigger credit reset",
        variant: "destructive",
      });
    } finally {
      setTriggeringReset(false);
    }
  };

  const filteredCredits = credits.filter(credit => 
    credit.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    credit.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransactions = transactions.filter(tx =>
    tx.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.mode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTierBadge = (allowance: number) => {
    if (allowance === 120) {
      return (
        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
          <Crown size={12} className="mr-1" /> Expert
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
        <Zap size={12} className="mr-1" /> Pro
      </Badge>
    );
  };

  const getReasonBadge = (reason: string) => {
    switch (reason) {
      case "monthly_reset":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600">Monthly Reset</Badge>;
      case "mode_use":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600">Mode Use</Badge>;
      default:
        return <Badge variant="outline">{reason}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading">Coach Credits</h1>
          <p className="text-muted-foreground text-sm">Manage user credits and view history</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
          <Button 
            variant="accent" 
            size="sm" 
            onClick={handleTriggerReset}
            disabled={triggeringReset}
          >
            {triggeringReset ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Play size={14} />
            )}
            Trigger Reset
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users size={16} />
            <span className="text-sm">Total Users</span>
          </div>
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Zap size={16} className="text-blue-500" />
            <span className="text-sm">Pro Users</span>
          </div>
          <p className="text-2xl font-bold">{stats.proUsers}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Crown size={16} className="text-amber-500" />
            <span className="text-sm">Expert Users</span>
          </div>
          <p className="text-2xl font-bold">{stats.expertUsers}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp size={16} />
            <span className="text-sm">Credits Used</span>
          </div>
          <p className="text-2xl font-bold">{stats.totalCreditsUsed}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <History size={16} />
            <span className="text-sm">Resets</span>
          </div>
          <p className="text-2xl font-bold">{stats.recentResets}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          placeholder="Search by email, name, or reason..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">
            <Users size={14} className="mr-2" />
            Users ({filteredCredits.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            <History size={14} className="mr-2" />
            Transactions ({filteredTransactions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Allowance</TableHead>
                  <TableHead>Last Reset</TableHead>
                  <TableHead>Next Reset</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCredits.map((credit) => {
                  const nextReset = new Date(credit.last_reset_at);
                  nextReset.setMonth(nextReset.getMonth() + 1);
                  
                  return (
                    <TableRow key={credit.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{credit.profile?.full_name || "—"}</p>
                          <p className="text-sm text-muted-foreground">{credit.profile?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getTierBadge(credit.monthly_allowance)}</TableCell>
                      <TableCell className="text-right font-mono">{credit.balance}</TableCell>
                      <TableCell className="text-right font-mono">{credit.monthly_allowance}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(credit.last_reset_at), "MMM d, yyyy")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {formatDistanceToNow(nextReset, { addSuffix: true })}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredCredits.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(tx.created_at), "MMM d, HH:mm")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{tx.profile?.email || tx.user_id.slice(0, 8)}</p>
                    </TableCell>
                    <TableCell>{getReasonBadge(tx.reason)}</TableCell>
                    <TableCell>
                      {tx.mode ? (
                        <span className="text-sm capitalize">{tx.mode}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-mono ${tx.change_amount > 0 ? "text-green-600" : "text-red-600"}`}>
                        {tx.change_amount > 0 ? "+" : ""}{tx.change_amount}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No transactions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoachCreditsAdminContent;
