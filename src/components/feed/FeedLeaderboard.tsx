import { useState, useEffect } from "react";
import { Trophy, Users, TrendingUp, Flame, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardEntry {
  role: string | null;
  organisation: string | null;
  total_posts: number;
  total_helpful_marks: number;
  weeks_without_reports: number;
  score: number;
}

const FeedLeaderboard = () => {
  const [contributors, setContributors] = useState<LeaderboardEntry[]>([]);
  const [helpfulVoices, setHelpfulVoices] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboards = async () => {
      setLoading(true);

      // Top Contributors (by post count and score)
      const { data: topContributors } = await supabase
        .from("professional_scores")
        .select("role, organisation, total_posts, total_helpful_marks, weeks_without_reports, score")
        .gte("score", 40) // Must have decent score
        .gt("total_posts", 0)
        .order("total_posts", { ascending: false })
        .limit(5);

      // Most Helpful (by helpful marks)
      const { data: mostHelpful } = await supabase
        .from("professional_scores")
        .select("role, organisation, total_posts, total_helpful_marks, weeks_without_reports, score")
        .gte("score", 40)
        .gt("total_helpful_marks", 0)
        .order("total_helpful_marks", { ascending: false })
        .limit(5);

      setContributors(topContributors || []);
      setHelpfulVoices(mostHelpful || []);
      setLoading(false);
    };

    fetchLeaderboards();
  }, []);

  const renderEntry = (entry: LeaderboardEntry, index: number, highlight: "posts" | "helpful") => (
    <div 
      key={index}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
    >
      <div className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
        index === 0 && "bg-amber-500/20 text-amber-500",
        index === 1 && "bg-slate-400/20 text-slate-400",
        index === 2 && "bg-orange-600/20 text-orange-600",
        index > 2 && "bg-secondary text-muted-foreground"
      )}>
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">
          {entry.role || "Member"}
        </p>
        {entry.organisation && (
          <p className="text-[10px] text-muted-foreground truncate">
            at {entry.organisation}
          </p>
        )}
      </div>
      <div className="text-right">
        <Badge variant="outline" className="text-[10px]">
          {highlight === "posts" ? (
            <>{entry.total_posts} posts</>
          ) : (
            <>{entry.total_helpful_marks} helpful</>
          )}
        </Badge>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card className="border-border/50 bg-secondary/30">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-secondary rounded w-1/2" />
            <div className="h-12 bg-secondary rounded" />
            <div className="h-12 bg-secondary rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-secondary/30">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-accent" />
          <CardTitle className="text-sm">Leaderboard</CardTitle>
        </div>
        <CardDescription className="text-xs">
          This month's standout contributors
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <Tabs defaultValue="contributors" className="w-full">
          <TabsList className="w-full h-8 mb-3">
            <TabsTrigger value="contributors" className="text-xs flex-1">
              <TrendingUp size={12} className="mr-1" />
              Contributors
            </TabsTrigger>
            <TabsTrigger value="helpful" className="text-xs flex-1">
              <Star size={12} className="mr-1" />
              Helpful
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contributors" className="mt-0">
            {contributors.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No contributors yet this month
              </p>
            ) : (
              <div className="space-y-1">
                {contributors.map((entry, i) => renderEntry(entry, i, "posts"))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="helpful" className="mt-0">
            {helpfulVoices.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No helpful comments yet this month
              </p>
            ) : (
              <div className="space-y-1">
                {helpfulVoices.map((entry, i) => renderEntry(entry, i, "helpful"))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <p className="text-[10px] text-muted-foreground text-center mt-3 pt-3 border-t border-border/30">
          Leaderboard resets monthly. No individual scores shown.
        </p>
      </CardContent>
    </Card>
  );
};

export default FeedLeaderboard;
