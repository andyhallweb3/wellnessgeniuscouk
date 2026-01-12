import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, Shield, Users, Target, AlertTriangle, CheckCircle } from "lucide-react";
import AdminBreadcrumb from "@/components/admin/AdminBreadcrumb";
import { format } from "date-fns";

interface WorkspaceProfile {
  id: string;
  user_id: string;
  business_name: string | null;
  sector: string | null;
  geography: string | null;
  business_size: string | null;
  primary_offer: string | null;
  ai_readiness_score: number | null;
  ai_readiness_band: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

interface WorkspaceDecision {
  id: string;
  user_id: string;
  decision_type: string;
  summary: string;
  status: string;
  mode: string | null;
  created_at: string;
}

interface AdvisorMetrics {
  id: string;
  user_id: string;
  onboarding_completed_at: string | null;
  first_plan_at: string | null;
  total_sessions: number;
  decisions_saved: number;
  last_session_at: string | null;
  weekly_active: boolean;
}

const WorkspacesAdmin = () => {
  const { isAdmin, isLoading: authLoading, isAuthenticated } = useAdminAuth();
  const [profiles, setProfiles] = useState<WorkspaceProfile[]>([]);
  const [decisions, setDecisions] = useState<WorkspaceDecision[]>([]);
  const [metrics, setMetrics] = useState<AdvisorMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    try {
      const [profilesRes, decisionsRes, metricsRes] = await Promise.all([
        supabase.from("workspace_profile").select("*").order("updated_at", { ascending: false }),
        supabase.from("workspace_decisions").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("advisor_metrics").select("*").order("last_session_at", { ascending: false }),
      ]);

      setProfiles((profilesRes.data || []) as WorkspaceProfile[]);
      setDecisions((decisionsRes.data || []) as WorkspaceDecision[]);
      setMetrics((metricsRes.data || []) as AdvisorMetrics[]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin]);

  const filteredProfiles = profiles.filter((p) =>
    (p.business_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.sector || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const totalWorkspaces = profiles.length;
  const onboardedCount = profiles.filter((p) => p.onboarding_completed).length;
  const totalDecisions = decisions.length;
  const activeThisWeek = metrics.filter((m) => m.weekly_active).length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Helmet>
          <title>Access Denied | Wellness Genius</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-heading mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">Admin access required.</p>
          <Link to="/admin"><Button>Go to Admin Login</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Workspaces Admin | Wellness Genius</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container-wide flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-4">
            <Link to="/admin"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button></Link>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" />
              <h1 className="font-heading text-xl">Workspaces</h1>
            </div>
          </div>
        </div>
      </header>

      <AdminBreadcrumb currentPage="Workspaces" />

      <main className="container-wide py-8 px-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Workspaces</CardDescription>
              <CardTitle className="text-2xl">{totalWorkspaces}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Onboarded</CardDescription>
              <CardTitle className="text-2xl">{onboardedCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Decisions Saved</CardDescription>
              <CardTitle className="text-2xl">{totalDecisions}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active This Week</CardDescription>
              <CardTitle className="text-2xl">{activeThisWeek}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="profiles">
          <TabsList className="mb-4">
            <TabsTrigger value="profiles">Profiles</TabsTrigger>
            <TabsTrigger value="decisions">Recent Decisions</TabsTrigger>
          </TabsList>

          <TabsContent value="profiles">
            <div className="mb-4">
              <Input
                placeholder="Search by business name or sector..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead>Sector</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>AI Score</TableHead>
                      <TableHead>Onboarded</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProfiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">{profile.business_name || "Unnamed"}</TableCell>
                        <TableCell>{profile.sector || "-"}</TableCell>
                        <TableCell>{profile.business_size || "-"}</TableCell>
                        <TableCell>
                          {profile.ai_readiness_score ? (
                            <Badge variant={profile.ai_readiness_score >= 70 ? "default" : profile.ai_readiness_score >= 40 ? "secondary" : "outline"}>
                              {profile.ai_readiness_score}%
                            </Badge>
                          ) : "-"}
                        </TableCell>
                        <TableCell>
                          {profile.onboarding_completed ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(profile.updated_at), "d MMM yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="decisions">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Summary</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {decisions.map((decision) => (
                      <TableRow key={decision.id}>
                        <TableCell className="max-w-md truncate">{decision.summary}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{decision.decision_type}</Badge>
                        </TableCell>
                        <TableCell>{decision.mode || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={decision.status === "done" ? "default" : decision.status === "in progress" ? "secondary" : "outline"}>
                            {decision.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(decision.created_at), "d MMM yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default WorkspacesAdmin;
