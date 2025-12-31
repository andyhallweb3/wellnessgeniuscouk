import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  Filter,
  Download,
  Mail,
  Bell,
  Settings,
  Check
} from "lucide-react";
import { format, subDays } from "date-fns";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

interface AlertSettings {
  enabled: boolean;
  email: string;
  threshold: number;
  windowHours: number;
}

const ALERT_SETTINGS_KEY = "validation_alert_settings";

const ValidationErrorsAdmin = () => {
  const { isAdmin, isLoading: authLoading } = useAdminAuth();
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7");
  const [isExporting, setIsExporting] = useState(false);
  const [isSendingAlert, setIsSendingAlert] = useState(false);
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    enabled: false,
    email: "",
    threshold: 10,
    windowHours: 1,
  });
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);

  // Load alert settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(ALERT_SETTINGS_KEY);
    if (saved) {
      try {
        setAlertSettings(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  const saveAlertSettings = (settings: AlertSettings) => {
    setAlertSettings(settings);
    localStorage.setItem(ALERT_SETTINGS_KEY, JSON.stringify(settings));
    toast.success("Alert settings saved");
    setAlertDialogOpen(false);
  };

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

      // Check if alert should be triggered
      if (alertSettings.enabled && alertSettings.email) {
        const windowStart = subDays(new Date(), alertSettings.windowHours / 24);
        const recentErrors = (data || []).filter(
          (e) => new Date(e.created_at) >= windowStart
        );
        if (recentErrors.length >= alertSettings.threshold) {
          // Could auto-trigger alert here, but we'll use manual trigger
        }
      }
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

  // Export to CSV
  const exportToCSV = () => {
    setIsExporting(true);
    try {
      const headers = ["Date", "Time", "Mode", "Errors", "User ID", "IP Address"];
      const rows = errors.map((err) => {
        const parsed = parseUserAgent(err.user_agent);
        const date = new Date(err.created_at);
        return [
          format(date, "yyyy-MM-dd"),
          format(date, "HH:mm:ss"),
          parsed.mode || "unknown",
          (parsed.errors || []).join("; "),
          err.admin_user_id,
          err.ip_address || "",
        ];
      });

      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `validation-errors-${format(new Date(), "yyyy-MM-dd")}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("CSV exported successfully");
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Failed to export CSV");
    } finally {
      setIsExporting(false);
    }
  };

  // Send alert email
  const sendAlertEmail = async () => {
    if (!alertSettings.email) {
      toast.error("Please configure an email address first");
      setAlertDialogOpen(true);
      return;
    }

    setIsSendingAlert(true);
    try {
      const summary = getErrorSummary();
      const { error } = await supabase.functions.invoke("send-validation-alert", {
        body: {
          email: alertSettings.email,
          totalErrors: errors.length,
          timeRange: `${timeRange} days`,
          topMode: summary.byMode[0]?.[0] || "N/A",
          topModeCount: summary.byMode[0]?.[1] || 0,
          topErrorField: summary.byErrorType[0]?.[0] || "N/A",
          topErrorCount: summary.byErrorType[0]?.[1] || 0,
          recentErrors: errors.slice(0, 10).map((err) => {
            const parsed = parseUserAgent(err.user_agent);
            return {
              time: format(new Date(err.created_at), "MMM d, HH:mm"),
              mode: parsed.mode || "unknown",
              errors: (parsed.errors || []).slice(0, 3),
            };
          }),
        },
      });

      if (error) throw error;
      toast.success(`Alert sent to ${alertSettings.email}`);
    } catch (err) {
      console.error("Failed to send alert:", err);
      toast.error("Failed to send alert email");
    } finally {
      setIsSendingAlert(false);
    }
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
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[130px]">
                <Filter size={14} className="mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
              </SelectContent>
            </Select>

            {/* Alert Settings */}
            <Dialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Settings size={16} />
                  {alertSettings.enabled && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Bell size={18} />
                    Alert Settings
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="alert-enabled">Enable email alerts</Label>
                    <Switch
                      id="alert-enabled"
                      checked={alertSettings.enabled}
                      onCheckedChange={(checked) =>
                        setAlertSettings((s) => ({ ...s, enabled: checked }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alert-email">Alert email</Label>
                    <Input
                      id="alert-email"
                      type="email"
                      placeholder="admin@example.com"
                      value={alertSettings.email}
                      onChange={(e) =>
                        setAlertSettings((s) => ({ ...s, email: e.target.value }))
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="alert-threshold">Error threshold</Label>
                      <Input
                        id="alert-threshold"
                        type="number"
                        min={1}
                        value={alertSettings.threshold}
                        onChange={(e) =>
                          setAlertSettings((s) => ({
                            ...s,
                            threshold: parseInt(e.target.value) || 10,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alert-window">Time window (hrs)</Label>
                      <Input
                        id="alert-window"
                        type="number"
                        min={1}
                        value={alertSettings.windowHours}
                        onChange={(e) =>
                          setAlertSettings((s) => ({
                            ...s,
                            windowHours: parseInt(e.target.value) || 1,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Alert triggers when {alertSettings.threshold}+ errors occur
                    within {alertSettings.windowHours} hour(s).
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => saveAlertSettings(alertSettings)}
                  >
                    <Check size={16} className="mr-2" />
                    Save Settings
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Send Alert */}
            <Button
              variant="outline"
              size="sm"
              onClick={sendAlertEmail}
              disabled={isSendingAlert || errors.length === 0}
            >
              {isSendingAlert ? (
                <Loader2 size={14} className="animate-spin mr-1" />
              ) : (
                <Mail size={14} className="mr-1" />
              )}
              Send Alert
            </Button>

            {/* Export CSV */}
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              disabled={isExporting || errors.length === 0}
            >
              {isExporting ? (
                <Loader2 size={14} className="animate-spin mr-1" />
              ) : (
                <Download size={14} className="mr-1" />
              )}
              Export CSV
            </Button>

            <Button variant="outline" size="sm" onClick={fetchErrors} disabled={isLoading}>
              <RefreshCw size={14} className={isLoading ? "animate-spin mr-1" : "mr-1"} />
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
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-medium">Recent Validation Errors</h3>
                <span className="text-xs text-muted-foreground">
                  Showing {Math.min(errors.length, 50)} of {errors.length}
                </span>
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
