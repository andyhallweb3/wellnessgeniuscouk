import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle, Clock, Loader2, MessageSquare, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface FeedbackReport {
  id: string;
  user_email: string | null;
  feature_area: string;
  description: string;
  severity: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open', icon: AlertCircle, color: 'text-yellow-500' },
  { value: 'in_progress', label: 'In Progress', icon: Clock, color: 'text-blue-500' },
  { value: 'resolved', label: 'Resolved', icon: CheckCircle, color: 'text-green-500' },
  { value: 'wont_fix', label: "Won't Fix", icon: MessageSquare, color: 'text-muted-foreground' },
];

const SEVERITY_COLORS: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  critical: 'bg-destructive text-destructive-foreground',
};

export function FeedbackAdminList() {
  const [reports, setReports] = useState<FeedbackReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchReports = async () => {
    try {
      let query = supabase
        .from('feedback_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReports((data as FeedbackReport[]) || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: 'Error loading reports',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const updateReport = async (id: string, updates: Partial<FeedbackReport>) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from('feedback_reports')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
      );

      toast({
        title: 'Report updated',
        description: 'Changes saved successfully',
      });
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: 'Update failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteReport = async (id: string) => {
    try {
      const { error } = await supabase
        .from('feedback_reports')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setReports((prev) => prev.filter((r) => r.id !== id));

      toast({
        title: 'Report deleted',
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete failed',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Feedback Reports</h2>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No feedback reports yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const statusOption = STATUS_OPTIONS.find((s) => s.value === report.status);
            const StatusIcon = statusOption?.icon || AlertCircle;

            return (
              <Card key={report.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        <StatusIcon className={`h-4 w-4 ${statusOption?.color}`} />
                        {report.feature_area}
                      </CardTitle>
                      <CardDescription>
                        {report.user_email || 'Anonymous'} •{' '}
                        {format(new Date(report.created_at), 'MMM d, yyyy h:mm a')}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={SEVERITY_COLORS[report.severity]}>
                        {report.severity}
                      </Badge>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this report?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteReport(report.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm bg-muted/50 p-3 rounded-md">{report.description}</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Select
                        value={report.status}
                        onValueChange={(value) => updateReport(report.id, { status: value })}
                        disabled={updatingId === report.id}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Admin Notes</label>
                      <Textarea
                        placeholder="Add notes..."
                        value={report.admin_notes || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          setReports((prev) =>
                            prev.map((r) =>
                              r.id === report.id ? { ...r, admin_notes: value } : r
                            )
                          );
                        }}
                        onBlur={(e) => {
                          if (e.target.value !== report.admin_notes) {
                            updateReport(report.id, { admin_notes: e.target.value });
                          }
                        }}
                        className="min-h-[60px]"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
