import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Loader2, 
  ArrowLeft,
  Shield,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Clock,
  Filter
} from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ValidationError {
  id: string;
  admin_user_id: string;
  action: string;
  resource_type: string;
  resource_count: number | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface ParsedUserAgent {
  mode?: string;
  errors?: string[];
  timestamp?: string;
}

interface DailyStats {
  date: string;
  count: number;
}

const ValidationErrorsAdmin = () => {
  const { isAdmin, isLoading: authLoading } = useAdminAuth();
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7");

  const fetchErrors = async () => {
    setIsLoading(true);
    try {
      const startDate = subDays(new Date(), parseInt(timeRange));
      
      const { data, error } = await supabase
        .from("admin_audit_logs")
        .select("*")
        .eq("action", "genie_validation_error")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;
      setErrors(data || []);

      // Calculate daily stats
      const statsMap = new Map<string, number>();
      for (let i = parseInt(timeRange) - 1; i >= 0; i--) {
        const date = format(subDays(new Date(), i), "yyyy-MM-dd");
        statsMap.set(date, 0);
      }
      
      (data || []).forEach((err) => {
        const date = format(new Date(err.created_at), "yyyy-MM-dd");
        statsMap.set(date, (statsMap.get(date) || 0) + 1);
      });

      setDailyStats(
        Array.from(statsMap.entries()).map(([date, count]) => ({ date, count }))
      );
    } catch (err) {
      console.error("Failed to fetch validation errors:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchErrors();
    }
  }, [isAdmin, timeRange]);

  const parseUserAgent = (ua: string | null): ParsedUserAgent => {
    if (!ua) return {};
    try {
      return JSON.parse(ua);
    } catch {
      return {};
    }
  };

  const getErrorSummary = () => {
    const modeCount = new Map<string, number>();
    const errorTypeCount = new Map<string, number>();

    errors.forEach((err) => {
      const parsed = parseUserAgent(err.user_agent);
      const mode = parsed.mode || "unknown";
      modeCount.set(mode, (modeCount.get(mode) || 0) + 1);
      
      (parsed.errors || []).forEach((e) => {
        const key = e.split(":")[0] || e;
        errorTypeCount.set(key, (errorTypeCount.get(key) || 0) + 1);
      });
    });

    return {
      byMode: Array.from(modeCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      byErrorType: Array.from(errorTypeCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
    };
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Access denied</p>
      </div>
    );
  }

  const summary = getErrorSummary();
  const maxCount = Math.max(...dailyStats.map((d) => d.count), 1);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Validation Errors | Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container-wide flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-orange-500" />
              <h1 className="font-heading text-xl">Validation Errors</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <Filter size={14} className="mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={fetchErrors} disabled={isLoading}>
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="container-wide py-8 px-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <AlertTriangle size={18} className="text-orange-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">Total Errors</span>
                </div>
                <p className="text-3xl font-heading">{errors.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Last {timeRange} days
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <TrendingUp size={18} className="text-blue-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">Top Mode</span>
                </div>
                <p className="text-3xl font-heading">
                  {summary.byMode[0]?.[0] || "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.byMode[0]?.[1] || 0} errors
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <Clock size={18} className="text-red-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">Top Error Field</span>
                </div>
                <p className="text-3xl font-heading truncate">
                  {summary.byErrorType[0]?.[0] || "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.byErrorType[0]?.[1] || 0} occurrences
                </p>
              </div>
            </div>

            {/* Daily Chart */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-medium mb-4">Errors Over Time</h3>
              <div className="flex items-end gap-1 h-32">
                {dailyStats.map((day) => (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-full bg-orange-500/80 rounded-t transition-all"
                      style={{
                        height: `${(day.count / maxCount) * 100}%`,
                        minHeight: day.count > 0 ? "4px" : "0px",
                      }}
                    />
                    <span className="text-[9px] text-muted-foreground rotate-[-45deg] origin-top-left whitespace-nowrap">
                      {format(new Date(day.date), "MMM d")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Breakdown by Mode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-medium mb-4">Errors by Mode</h3>
                <div className="space-y-3">
                  {summary.byMode.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No data</p>
                  ) : (
                    summary.byMode.map(([mode, count]) => (
                      <div key={mode} className="flex items-center justify-between">
                        <span className="text-sm font-mono">{mode}</span>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-medium mb-4">Top Error Fields</h3>
                <div className="space-y-3">
                  {summary.byErrorType.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No data</p>
                  ) : (
                    summary.byErrorType.map(([field, count]) => (
                      <div key={field} className="flex items-center justify-between">
                        <span className="text-sm font-mono truncate max-w-[200px]">{field}</span>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Recent Errors Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-medium">Recent Validation Errors</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/30">
                    <tr>
                      <th className="text-left p-3 font-medium">Time</th>
                      <th className="text-left p-3 font-medium">Mode</th>
                      <th className="text-left p-3 font-medium">Errors</th>
                      <th className="text-left p-3 font-medium">User ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {errors.slice(0, 50).map((err) => {
                      const parsed = parseUserAgent(err.user_agent);
                      return (
                        <tr key={err.id} className="hover:bg-secondary/20">
                          <td className="p-3 whitespace-nowrap">
                            {format(new Date(err.created_at), "MMM d, HH:mm")}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-secondary rounded text-xs font-mono">
                              {parsed.mode || "unknown"}
                            </span>
                          </td>
                          <td className="p-3 max-w-[300px]">
                            <div className="space-y-1">
                              {(parsed.errors || []).slice(0, 3).map((e, i) => (
                                <p key={i} className="text-xs text-muted-foreground truncate">
                                  {e}
                                </p>
                              ))}
                              {(parsed.errors?.length || 0) > 3 && (
                                <p className="text-xs text-muted-foreground">
                                  +{(parsed.errors?.length || 0) - 3} more
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="p-3 font-mono text-xs text-muted-foreground">
                            {err.admin_user_id.slice(0, 8)}...
                          </td>
                        </tr>
                      );
                    })}
                    {errors.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-muted-foreground">
                          No validation errors found in this time period
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ValidationErrorsAdmin;
