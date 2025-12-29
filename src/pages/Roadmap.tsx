import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Loader2, 
  MessageSquare,
  Filter,
  Lightbulb,
  Bug,
  Sparkles
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ReportProblemButton } from '@/components/feedback/ReportProblemButton';

interface FeedbackReport {
  id: string;
  feature_area: string;
  description: string;
  severity: string;
  status: string;
  created_at: string;
}

const STATUS_CONFIG = {
  open: { label: 'Under Review', icon: AlertCircle, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  resolved: { label: 'Resolved', icon: CheckCircle, color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  wont_fix: { label: 'Closed', icon: MessageSquare, color: 'bg-muted text-muted-foreground' },
};

const FEATURE_ICONS: Record<string, typeof Bug> = {
  'AI Genie Chat': Sparkles,
  'Daily Brief': Lightbulb,
  'Performance': Clock,
  'Other': MessageSquare,
};

const Roadmap = () => {
  const [reports, setReports] = useState<FeedbackReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [featureFilter, setFeatureFilter] = useState<string>('all');

  const fetchReports = async () => {
    try {
      let query = supabase
        .from('feedback_reports')
        .select('id, feature_area, description, severity, status, created_at')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (featureFilter !== 'all') {
        query = query.eq('feature_area', featureFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReports((data as FeedbackReport[]) || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter, featureFilter]);

  const uniqueFeatures = [...new Set(reports.map(r => r.feature_area))];

  const statusCounts = {
    open: reports.filter(r => r.status === 'open').length,
    in_progress: reports.filter(r => r.status === 'in_progress').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Roadmap & Feedback | Wellness Genius</title>
        <meta name="description" content="See what we're working on and submit your own feedback to help improve Wellness Genius." />
      </Helmet>

      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="container-wide section-padding">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-heading mb-4">
              Roadmap & Feedback
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Transparency in action. See what users are reporting, what we're working on, 
              and help shape the future of Wellness Genius.
            </p>
            <ReportProblemButton 
              variant="default" 
              size="default" 
              className="mx-auto"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto mb-12">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-heading text-yellow-600 mb-1">{statusCounts.open}</div>
                <div className="text-sm text-muted-foreground">Under Review</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-heading text-blue-600 mb-1">{statusCounts.in_progress}</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-heading text-green-600 mb-1">{statusCounts.resolved}</div>
                <div className="text-sm text-muted-foreground">Resolved</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium">Filter:</span>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Under Review</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={featureFilter} onValueChange={setFeatureFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Feature Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Features</SelectItem>
                {uniqueFeatures.map(feature => (
                  <SelectItem key={feature} value={feature}>
                    {feature}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reports List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : reports.length === 0 ? (
            <Card className="max-w-md mx-auto">
              <CardContent className="py-12 text-center">
                <Sparkles className="h-12 w-12 mx-auto text-accent mb-4" />
                <h3 className="font-heading text-lg mb-2">No feedback yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to share your thoughts and help us improve!
                </p>
                <ReportProblemButton variant="default" />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => {
                const statusConfig = STATUS_CONFIG[report.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.open;
                const StatusIcon = statusConfig.icon;
                const FeatureIcon = FEATURE_ICONS[report.feature_area] || Bug;

                return (
                  <Card key={report.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-muted shrink-0">
                            <FeatureIcon size={18} className="text-muted-foreground" />
                          </div>
                          <div>
                            <CardTitle className="text-base font-medium">
                              {report.feature_area}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {format(new Date(report.created_at), 'MMM d, yyyy')}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={statusConfig.color}>
                          <StatusIcon size={12} className="mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground/80 line-clamp-3">
                        {report.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Roadmap;
