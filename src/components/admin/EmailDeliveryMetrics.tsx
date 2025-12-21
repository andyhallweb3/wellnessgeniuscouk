import { useState, useEffect } from "react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { 
  Mail, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Loader2,
  TrendingUp,
  Eye,
  MousePointer,
  CalendarIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface EmailMetrics {
  totalOpens: number;
  uniqueOpens: number;
  totalClicks: number;
  uniqueClicks: number;
  bounces: number;
  complaints: number;
  deliveryDelays: number;
}

interface EmailEvent {
  id: string;
  event_type: string;
  subscriber_email: string;
  send_id: string;
  link_url: string | null;
  created_at: string;
}

interface EmailDeliveryMetricsProps {
  getAuthHeaders: () => { Authorization: string } | { Authorization?: undefined };
}

const EmailDeliveryMetrics = ({ getAuthHeaders }: EmailDeliveryMetricsProps) => {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<EmailMetrics | null>(null);
  const [recentEvents, setRecentEvents] = useState<EmailEvent[]>([]);
  const [issueEvents, setIssueEvents] = useState<EmailEvent[]>([]);
  
  // Date range state - default to last 30 days
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [datePreset, setDatePreset] = useState<string>('30d');

  const applyPreset = (preset: string) => {
    const now = new Date();
    setDatePreset(preset);
    setEndDate(now);
    
    switch (preset) {
      case '7d':
        setStartDate(subDays(now, 7));
        break;
      case '30d':
        setStartDate(subDays(now, 30));
        break;
      case '90d':
        setStartDate(subDays(now, 90));
        break;
      case 'all':
        setStartDate(new Date('2020-01-01'));
        break;
      default:
        setStartDate(subDays(now, 30));
    }
  };

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('newsletter-run', {
        body: { 
          action: 'email-metrics',
          startDate: startOfDay(startDate).toISOString(),
          endDate: endOfDay(endDate).toISOString(),
        },
        headers: getAuthHeaders(),
      });

      if (error) throw error;

      setMetrics(data.metrics || null);
      setRecentEvents(data.recentEvents || []);
      setIssueEvents(data.issueEvents || []);
    } catch (error) {
      console.error('Failed to fetch email metrics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch email delivery metrics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (expanded && !metrics) {
      fetchMetrics();
    }
  }, [expanded]);

  // Refetch when date range changes
  useEffect(() => {
    if (expanded && metrics) {
      fetchMetrics();
    }
  }, [startDate, endDate]);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'open': return <Eye size={14} className="text-blue-400" />;
      case 'click': return <MousePointer size={14} className="text-accent" />;
      case 'bounce': return <XCircle size={14} className="text-red-400" />;
      case 'complaint': return <AlertTriangle size={14} className="text-orange-400" />;
      case 'delivery_delayed': return <Clock size={14} className="text-yellow-400" />;
      default: return <Mail size={14} className="text-muted-foreground" />;
    }
  };

  const getEventBadgeColor = (eventType: string) => {
    switch (eventType) {
      case 'open': return 'bg-blue-500/10 text-blue-400';
      case 'click': return 'bg-accent/10 text-accent';
      case 'bounce': return 'bg-red-500/10 text-red-400';
      case 'complaint': return 'bg-orange-500/10 text-orange-400';
      case 'delivery_delayed': return 'bg-yellow-500/10 text-yellow-400';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  const formatEventType = (eventType: string) => {
    return eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="card-glass p-6 mb-8">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <TrendingUp size={20} className="text-accent" />
          Email Delivery Metrics
        </h2>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchMetrics}
            disabled={loading}
            className="h-8 gap-1"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
          {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </button>

      {/* Date Range Filter */}
      {expanded && (
        <div className="flex flex-wrap items-center gap-3 mt-4 p-3 bg-secondary/30 rounded-lg border border-border">
          <span className="text-sm text-muted-foreground">Period:</span>
          
          {/* Preset buttons */}
          <div className="flex gap-1">
            {[
              { value: '7d', label: '7 days' },
              { value: '30d', label: '30 days' },
              { value: '90d', label: '90 days' },
              { value: 'all', label: 'All time' },
            ].map((preset) => (
              <Button
                key={preset.value}
                variant={datePreset === preset.value ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => applyPreset(preset.value)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          
          <span className="text-muted-foreground">|</span>
          
          {/* Custom date pickers */}
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd MMM yyyy") : "Start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    if (date) {
                      setStartDate(date);
                      setDatePreset('custom');
                    }
                  }}
                  disabled={(date) => date > endDate || date > new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            
            <span className="text-muted-foreground">to</span>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd MMM yyyy") : "End date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => {
                    if (date) {
                      setEndDate(date);
                      setDatePreset('custom');
                    }
                  }}
                  disabled={(date) => date < startDate || date > new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      {/* Summary Stats - Always Visible */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Eye size={16} className="text-blue-400" />
              <span className="text-xs text-muted-foreground">Opens</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">{metrics.uniqueOpens}</p>
            <p className="text-xs text-muted-foreground">{metrics.totalOpens} total</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <MousePointer size={16} className="text-accent" />
              <span className="text-xs text-muted-foreground">Clicks</span>
            </div>
            <p className="text-2xl font-bold text-accent">{metrics.uniqueClicks}</p>
            <p className="text-xs text-muted-foreground">{metrics.totalClicks} total</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <XCircle size={16} className="text-red-400" />
              <span className="text-xs text-muted-foreground">Bounces</span>
            </div>
            <p className="text-2xl font-bold text-red-400">{metrics.bounces}</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} className="text-yellow-400" />
              <span className="text-xs text-muted-foreground">Delays</span>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{metrics.deliveryDelays}</p>
            {metrics.complaints > 0 && (
              <p className="text-xs text-orange-400">{metrics.complaints} complaints</p>
            )}
          </div>
        </div>
      )}

      {expanded && (
        <div className="mt-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
            </div>
          ) : (
            <>
              {/* Delivery Issues Section */}
              {issueEvents.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-orange-400" />
                    Delivery Issues ({issueEvents.length})
                  </h3>
                  <div className="card-tech overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-secondary">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium">Time</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Send ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {issueEvents.map((event) => (
                          <tr key={event.id} className="border-t border-border">
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {new Date(event.created_at).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getEventBadgeColor(event.event_type)}`}>
                                {getEventIcon(event.event_type)}
                                {formatEventType(event.event_type)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium">{event.subscriber_email}</td>
                            <td className="px-4 py-3 text-sm text-muted-foreground font-mono text-xs">
                              {event.send_id.slice(0, 8)}...
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Recent Events Section */}
              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <Mail size={18} className="text-blue-400" />
                  Email Events ({recentEvents.length})
                </h3>
                {recentEvents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No email events in this date range.</p>
                ) : (
                  <div className="card-tech overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-secondary">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium">Time</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Link</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentEvents.map((event) => (
                          <tr key={event.id} className="border-t border-border">
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {new Date(event.created_at).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getEventBadgeColor(event.event_type)}`}>
                                {getEventIcon(event.event_type)}
                                {formatEventType(event.event_type)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium">{event.subscriber_email}</td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {event.link_url ? (
                                <a
                                  href={event.link_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-accent hover:underline truncate block max-w-[200px]"
                                >
                                  {event.link_url}
                                </a>
                              ) : (
                                '-'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default EmailDeliveryMetrics;
