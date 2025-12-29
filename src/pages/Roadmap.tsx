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
  Sparkles,
  ChevronUp,
  Wrench
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportProblemButton } from '@/components/feedback/ReportProblemButton';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface FeedbackReport {
  id: string;
  feature_area: string;
  description: string;
  severity: string;
  status: string;
  feedback_type: string;
  created_at: string;
  upvote_count: number;
}

const STATUS_CONFIG = {
  open: { label: 'Under Review', icon: AlertCircle, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  resolved: { label: 'Resolved', icon: CheckCircle, color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  wont_fix: { label: 'Closed', icon: MessageSquare, color: 'bg-muted text-muted-foreground' },
};

const TYPE_CONFIG = {
  bug: { label: 'Bug', icon: Bug, color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  feature: { label: 'Feature', icon: Lightbulb, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
  improvement: { label: 'Improvement', icon: Wrench, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
};

const FEATURE_ICONS: Record<string, typeof Bug> = {
  'AI Genie Chat': Sparkles,
  'Daily Brief': Lightbulb,
  'Performance': Clock,
  'Other': MessageSquare,
};

const Roadmap = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<FeedbackReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [userUpvotes, setUserUpvotes] = useState<Set<string>>(new Set());
  const [upvotingId, setUpvotingId] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      let query = supabase
        .from('feedback_reports')
        .select('id, feature_area, description, severity, status, feedback_type, created_at, upvote_count')
        .order('upvote_count', { ascending: false })
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
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

  const fetchUserUpvotes = async () => {
    if (!user) {
      setUserUpvotes(new Set());
      return;
    }

    try {
      const { data, error } = await supabase
        .from('feedback_upvotes')
        .select('feedback_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserUpvotes(new Set(data?.map(u => u.feedback_id) || []));
    } catch (error) {
      console.error('Error fetching user upvotes:', error);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  useEffect(() => {
    fetchUserUpvotes();
  }, [user]);

  const handleUpvote = async (feedbackId: string) => {
    if (!user) {
      toast.error('Please sign in to upvote');
      return;
    }

    setUpvotingId(feedbackId);
    const hasUpvoted = userUpvotes.has(feedbackId);

    try {
      if (hasUpvoted) {
        const { error } = await supabase
          .from('feedback_upvotes')
          .delete()
          .eq('feedback_id', feedbackId)
          .eq('user_id', user.id);

        if (error) throw error;

        setUserUpvotes(prev => {
          const next = new Set(prev);
          next.delete(feedbackId);
          return next;
        });
        setReports(prev => prev.map(r => 
          r.id === feedbackId ? { ...r, upvote_count: r.upvote_count - 1 } : r
        ));
      } else {
        const { error } = await supabase
          .from('feedback_upvotes')
          .insert({ feedback_id: feedbackId, user_id: user.id });

        if (error) throw error;

        setUserUpvotes(prev => new Set(prev).add(feedbackId));
        setReports(prev => prev.map(r => 
          r.id === feedbackId ? { ...r, upvote_count: r.upvote_count + 1 } : r
        ));
      }
    } catch (error) {
      console.error('Error toggling upvote:', error);
      toast.error('Failed to update vote');
    } finally {
      setUpvotingId(null);
    }
  };

  // Filter reports by type
  const filteredReports = activeTab === 'all' 
    ? reports 
    : reports.filter(r => r.feedback_type === activeTab);

  const typeCounts = {
    all: reports.length,
    bug: reports.filter(r => r.feedback_type === 'bug').length,
    feature: reports.filter(r => r.feedback_type === 'feature').length,
    improvement: reports.filter(r => r.feedback_type === 'improvement').length,
  };

  const statusCounts = {
    open: filteredReports.filter(r => r.status === 'open').length,
    in_progress: filteredReports.filter(r => r.status === 'in_progress').length,
    resolved: filteredReports.filter(r => r.status === 'resolved').length,
  };

  const renderReportCard = (report: FeedbackReport) => {
    const statusConfig = STATUS_CONFIG[report.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.open;
    const typeConfig = TYPE_CONFIG[report.feedback_type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.bug;
    const StatusIcon = statusConfig.icon;
    const TypeIcon = typeConfig.icon;
    const FeatureIcon = FEATURE_ICONS[report.feature_area] || Bug;
    const hasUpvoted = userUpvotes.has(report.id);
    const isUpvoting = upvotingId === report.id;

    return (
      <Card key={report.id} className="overflow-hidden">
        <div className="flex">
          {/* Upvote Button */}
          <button
            onClick={() => handleUpvote(report.id)}
            disabled={isUpvoting}
            className={`flex flex-col items-center justify-center px-4 py-4 border-r transition-colors min-w-[70px] ${
              hasUpvoted 
                ? 'bg-accent/10 text-accent border-accent/20' 
                : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
            } ${!user ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
            title={user ? (hasUpvoted ? 'Remove upvote' : 'Upvote this') : 'Sign in to upvote'}
          >
            {isUpvoting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ChevronUp size={20} className={hasUpvoted ? 'text-accent' : ''} />
            )}
            <span className={`text-sm font-medium ${hasUpvoted ? 'text-accent' : ''}`}>
              {report.upvote_count}
            </span>
          </button>

          {/* Content */}
          <div className="flex-1">
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
                <div className="flex items-center gap-2">
                  <Badge className={typeConfig.color}>
                    <TypeIcon size={12} className="mr-1" />
                    {typeConfig.label}
                  </Badge>
                  <Badge className={statusConfig.color}>
                    <StatusIcon size={12} className="mr-1" />
                    {statusConfig.label}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/80 line-clamp-3">
                {report.description}
              </p>
            </CardContent>
          </div>
        </div>
      </Card>
    );
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
            <div className="flex items-center justify-center gap-4">
              <ReportProblemButton 
                variant="default" 
                size="default"
              />
              {!user && (
                <Button variant="outline" asChild>
                  <Link to="/auth">Sign in to upvote</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Type Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-4">
              <TabsTrigger value="all" className="gap-1.5">
                All
                <span className="text-xs opacity-70">({typeCounts.all})</span>
              </TabsTrigger>
              <TabsTrigger value="bug" className="gap-1.5">
                <Bug size={14} />
                Bugs
                <span className="text-xs opacity-70">({typeCounts.bug})</span>
              </TabsTrigger>
              <TabsTrigger value="feature" className="gap-1.5">
                <Lightbulb size={14} />
                Features
                <span className="text-xs opacity-70">({typeCounts.feature})</span>
              </TabsTrigger>
              <TabsTrigger value="improvement" className="gap-1.5">
                <Wrench size={14} />
                Improvements
                <span className="text-xs opacity-70">({typeCounts.improvement})</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

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

          {/* Status Filter */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium">Status:</span>
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
          </div>

          {/* Reports List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredReports.length === 0 ? (
            <Card className="max-w-md mx-auto">
              <CardContent className="py-12 text-center">
                <Sparkles className="h-12 w-12 mx-auto text-accent mb-4" />
                <h3 className="font-heading text-lg mb-2">
                  {activeTab === 'all' ? 'No feedback yet' : `No ${activeTab === 'bug' ? 'bugs' : activeTab === 'feature' ? 'feature requests' : 'improvements'} yet`}
                </h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to share your thoughts and help us improve!
                </p>
                <ReportProblemButton variant="default" />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredReports.map(renderReportCard)}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Roadmap;
