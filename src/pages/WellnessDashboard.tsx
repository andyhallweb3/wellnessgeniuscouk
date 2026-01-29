import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Moon,
  Brain,
  Apple,
  Users,
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Calendar,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import { WellnessGoal, WellnessPlan } from "@/types/agenticWellness";

const domainConfig = {
  physical: {
    icon: Activity,
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
  },
  sleep: {
    icon: Moon,
    color: "from-indigo-500 to-purple-600",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-700",
  },
  mental: {
    icon: Brain,
    color: "from-teal-500 to-cyan-600",
    bgColor: "bg-teal-50",
    textColor: "text-teal-700",
  },
  nutritional: {
    icon: Apple,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
  },
  social: {
    icon: Users,
    color: "from-pink-500 to-rose-600",
    bgColor: "bg-pink-50",
    textColor: "text-pink-700",
  },
  spiritual: {
    icon: Heart,
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-50",
    textColor: "text-violet-700",
  },
};

interface DomainScore {
  domain: string;
  score: number;
  trend: "up" | "down" | "stable";
  change: string;
  status: "excellent" | "on_track" | "needs_attention";
}

const WellnessDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [overallScore, setOverallScore] = useState(0);
  const [domainScores, setDomainScores] = useState<DomainScore[]>([]);
  const [goals, setGoals] = useState<WellnessGoal[]>([]);
  const [plan, setPlan] = useState<WellnessPlan | null>(null);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load active goals
      const { data: goalsData } = await supabase
        .from("wellness_goals")
        .select("*")
        .eq("user_id", user?.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (goalsData) {
        setGoals(goalsData as unknown as WellnessGoal[]);
      }

      // Load active plan
      const { data: planData } = await supabase
        .from("wellness_plans")
        .select("*")
        .eq("user_id", user?.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (planData) {
        setPlan(planData as unknown as WellnessPlan);
      }

      // Load recent progress
      const { data: progressData } = await supabase
        .from("wellness_progress")
        .select("*")
        .eq("user_id", user?.id)
        .order("recorded_at", { ascending: false })
        .limit(6);

      // Calculate domain scores from progress
      if (progressData && progressData.length > 0) {
        const scores: DomainScore[] = progressData.map((p) => ({
          domain: p.domain,
          score: Number(p.progress_percentage) || 0,
          trend: p.status === "improving" ? "up" : p.status === "declining" ? "down" : "stable",
          change: p.status === "improving" ? "+5%" : p.status === "declining" ? "-3%" : "0%",
          status: Number(p.progress_percentage) >= 80 
            ? "excellent" 
            : Number(p.progress_percentage) >= 50 
              ? "on_track" 
              : "needs_attention",
        }));
        setDomainScores(scores);

        // Calculate overall score
        const avg = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
        setOverallScore(Math.round(avg));

        // Generate insights
        const lowDomains = scores.filter((s) => s.status === "needs_attention");
        const newInsights = [];
        if (lowDomains.length > 0) {
          newInsights.push(`Focus on ${lowDomains[0].domain} this week for maximum impact`);
        }
        newInsights.push("Consistency beats intensity - small daily habits compound");
        newInsights.push("Your sleep quality directly affects your mental wellness scores");
        setInsights(newInsights);
      } else {
        // Set demo data if no progress yet
        setDomainScores([
          { domain: "physical", score: 65, trend: "up", change: "+8%", status: "on_track" },
          { domain: "sleep", score: 72, trend: "stable", change: "0%", status: "on_track" },
          { domain: "mental", score: 58, trend: "down", change: "-4%", status: "needs_attention" },
          { domain: "nutritional", score: 70, trend: "up", change: "+5%", status: "on_track" },
          { domain: "social", score: 45, trend: "stable", change: "0%", status: "needs_attention" },
          { domain: "spiritual", score: 55, trend: "up", change: "+3%", status: "needs_attention" },
        ]);
        setOverallScore(61);
        setInsights([
          "Complete your first wellness assessment to get personalised insights",
          "Track your progress daily for the best results",
          "Connect with others in the social domain for accountability",
        ]);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "excellent":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Excellent</Badge>;
      case "on_track":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">On Track</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Needs Focus</Badge>;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-teal-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-heading text-gray-900 mb-4">
            Sign in to view your dashboard
          </h1>
          <p className="text-gray-600 mb-8">
            Track your wellness journey across all six domains
          </p>
          <Link to="/auth">
            <Button className="bg-gradient-to-r from-green-600 to-teal-600">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-teal-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading text-gray-900">Wellness Dashboard</h1>
            <p className="text-gray-600">Track your progress across all domains</p>
          </div>
          <Button
            variant="outline"
            onClick={loadDashboardData}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Overall Score */}
        <Card className="bg-white/80 backdrop-blur border-0 shadow-lg mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-4xl font-bold text-gray-900">{overallScore}</span>
                      <p className="text-xs text-gray-500">Overall Score</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-heading text-gray-900 mb-2">
                  {overallScore >= 70
                    ? "Great progress!"
                    : overallScore >= 50
                    ? "Keep going!"
                    : "Let's build momentum"}
                </h2>
                <p className="text-gray-600 mb-4">
                  {overallScore >= 70
                    ? "You're making excellent strides in your wellness journey."
                    : overallScore >= 50
                    ? "You're on the right track. Focus on consistency."
                    : "Every journey starts with a single step. You've got this!"}
                </p>
                <Link to="/wellness">
                  <Button className="gap-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
                    Take New Assessment
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Domain Scores */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-teal-600" />
                  Domain Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {domainScores.map((domain) => {
                  const config = domainConfig[domain.domain as keyof typeof domainConfig];
                  const Icon = config?.icon || Activity;

                  return (
                    <div
                      key={domain.domain}
                      className={`p-4 rounded-xl ${config?.bgColor || "bg-gray-50"}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
                              config?.color || "from-gray-500 to-gray-600"
                            } flex items-center justify-center`}
                          >
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 capitalize">
                              {domain.domain}
                            </p>
                            <div className="flex items-center gap-2">
                              {getTrendIcon(domain.trend)}
                              <span className="text-xs text-gray-500">{domain.change}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{domain.score}%</p>
                          {getStatusBadge(domain.status)}
                        </div>
                      </div>
                      <Progress value={domain.score} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Active Goals */}
            <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-600" />
                  Active Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {goals.length > 0 ? (
                  goals.slice(0, 3).map((goal) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {goal.description}
                        </p>
                        <span className="text-xs text-gray-500">
                          {goal.current_progress}/{goal.target_value}
                        </span>
                      </div>
                      <Progress
                        value={
                          goal.target_value && goal.target_value > 0
                            ? ((goal.current_progress || 0) / goal.target_value) * 100
                            : 0
                        }
                        className="h-1.5"
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-3">No active goals yet</p>
                    <Link to="/wellness">
                      <Button variant="outline" size="sm">
                        Set Your First Goal
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weekly Insights */}
            <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                  Weekly Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.map((insight, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 bg-gradient-to-r from-teal-50 to-green-50 rounded-lg"
                  >
                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-teal-700">{i + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700">{insight}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Current Plan */}
            {plan && (
              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-900">
                    Current Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium text-gray-900 mb-2">
                    {plan.plan_name || "12-Week Wellness Plan"}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    Week {Math.ceil(((new Date().getTime() - new Date(plan.created_at).getTime()) / (1000 * 60 * 60 * 24 * 7)))} of {plan.duration_weeks}
                  </p>
                  <Progress
                    value={
                      (Math.ceil(
                        (new Date().getTime() - new Date(plan.created_at).getTime()) /
                          (1000 * 60 * 60 * 24 * 7)
                      ) /
                        plan.duration_weeks) *
                      100
                    }
                    className="h-2"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WellnessDashboard;
