import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface ReadinessAssessment {
  id: string;
  overall_score: number;
  score_band: string | null;
  completed_at: string;
  data_score: number | null;
  people_score: number | null;
  process_score: number | null;
  leadership_score: number | null;
  risk_score: number | null;
}

const SCORE_BAND_COLORS: Record<string, string> = {
  "AI-Native": "text-green-500",
  "Scalable": "text-blue-500",
  "Operational": "text-amber-500",
  "Emerging": "text-orange-500",
  "Foundational": "text-red-500",
};

const ReadinessScoreHistory = () => {
  const [assessments, setAssessments] = useState<ReadinessAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_readiness_completions")
        .select("id, overall_score, score_band, completed_at, data_score, people_score, process_score, leadership_score, risk_score")
        .order("completed_at", { ascending: true });

      if (error) throw error;
      setAssessments(data || []);
    } catch (error) {
      console.error("Error fetching assessments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (assessments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 size={20} className="text-accent" />
            AI Readiness History
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground mb-4">No assessments yet</p>
          <Button variant="accent" asChild>
            <Link to="/ai-readiness">Take Your First Assessment</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const chartData = assessments.map((a) => ({
    date: format(new Date(a.completed_at), "MMM d"),
    fullDate: format(new Date(a.completed_at), "MMM d, yyyy"),
    score: a.overall_score,
    band: a.score_band,
    data: a.data_score,
    people: a.people_score,
    process: a.process_score,
    leadership: a.leadership_score,
    risk: a.risk_score,
  }));

  const latestScore = assessments[assessments.length - 1]?.overall_score || 0;
  const previousScore = assessments.length > 1 ? assessments[assessments.length - 2]?.overall_score : null;
  const scoreDiff = previousScore !== null ? latestScore - previousScore : null;

  const getTrendIcon = () => {
    if (scoreDiff === null) return <Minus size={16} className="text-muted-foreground" />;
    if (scoreDiff > 0) return <TrendingUp size={16} className="text-green-500" />;
    if (scoreDiff < 0) return <TrendingDown size={16} className="text-red-500" />;
    return <Minus size={16} className="text-muted-foreground" />;
  };

  const latestBand = assessments[assessments.length - 1]?.score_band;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 size={20} className="text-accent" />
            AI Readiness History
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/ai-readiness">New Assessment</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Current Score Summary */}
        <div className="flex items-center gap-4 mb-6 p-4 rounded-lg bg-muted/50">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">Current Score</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-heading">{latestScore}%</span>
              {latestBand && (
                <span className={`text-sm font-medium ${SCORE_BAND_COLORS[latestBand] || "text-muted-foreground"}`}>
                  {latestBand}
                </span>
              )}
            </div>
          </div>
          {scoreDiff !== null && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Change</p>
              <div className="flex items-center gap-1 justify-end">
                {getTrendIcon()}
                <span className={`text-lg font-medium ${
                  scoreDiff > 0 ? "text-green-500" : scoreDiff < 0 ? "text-red-500" : "text-muted-foreground"
                }`}>
                  {scoreDiff > 0 ? "+" : ""}{scoreDiff}%
                </span>
              </div>
            </div>
          )}
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Assessments</p>
            <span className="text-lg font-medium">{assessments.length}</span>
          </div>
        </div>

        {/* Chart */}
        {assessments.length > 1 ? (
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                  }}
                  labelFormatter={(_, payload) => payload[0]?.payload?.fullDate || ""}
                  formatter={(value: number, name: string) => [
                    `${value}%`,
                    name === "score" ? "Overall Score" : name
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={2}
                  fill="url(#scoreGradient)"
                  dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "hsl(var(--accent))", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Complete more assessments to see your progress chart
          </p>
        )}

        {/* Recent Assessments List */}
        {assessments.length > 0 && (
          <div className="mt-6 space-y-2">
            <p className="text-sm font-medium text-muted-foreground mb-3">Recent Assessments</p>
            {assessments.slice(-5).reverse().map((assessment) => (
              <Link
                key={assessment.id}
                to={`/ai-readiness/report/${assessment.id}`}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`text-lg font-heading ${
                    assessment.overall_score >= 80 ? "text-green-500" :
                    assessment.overall_score >= 60 ? "text-amber-500" : "text-red-500"
                  }`}>
                    {assessment.overall_score}%
                  </div>
                  <span className={`text-sm ${SCORE_BAND_COLORS[assessment.score_band || ""] || "text-muted-foreground"}`}>
                    {assessment.score_band}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(assessment.completed_at), "MMM d, yyyy")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReadinessScoreHistory;
