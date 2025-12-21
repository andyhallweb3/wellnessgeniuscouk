import { 
  Brain, 
  Lightbulb, 
  CheckCircle2, 
  AlertTriangle,
  Bell,
  TrendingUp,
  Building2,
  Target,
  Users,
  DollarSign,
  ChevronRight,
  Sparkles,
  Eye,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BusinessMemory, GenieInsight, GenieDecision } from "@/hooks/useBusinessMemory";
import { GenieNotification } from "@/hooks/useGenieNotifications";
import { formatDistanceToNow } from "date-fns";

interface GenieDashboardProps {
  memory: BusinessMemory | null;
  insights: GenieInsight[];
  recentDecisions: GenieDecision[];
  notifications: GenieNotification[];
  onStartChat: () => void;
  onEditProfile: () => void;
  onDismissNotification: (id: string) => void;
  onMarkNotificationRead: (id: string) => void;
}

const InsightTypeBadge = ({ type }: { type: GenieInsight["insight_type"] }) => {
  const config = {
    observation: { label: "Observation", variant: "secondary" as const, icon: Eye },
    preference: { label: "Preference", variant: "outline" as const, icon: Sparkles },
    commitment: { label: "Commitment", variant: "default" as const, icon: CheckCircle2 },
    warning: { label: "Warning", variant: "destructive" as const, icon: AlertTriangle },
  };
  
  const { label, variant, icon: Icon } = config[type] || config.observation;
  
  return (
    <Badge variant={variant} className="text-xs gap-1">
      <Icon size={10} />
      {label}
    </Badge>
  );
};

interface NotificationCardProps {
  notification: GenieNotification;
  onDismiss: (id: string) => void;
  onMarkRead: (id: string) => void;
}

const NotificationCard = ({ notification, onDismiss, onMarkRead }: NotificationCardProps) => {
  const priorityColors = {
    high: "border-l-destructive bg-destructive/5",
    medium: "border-l-accent bg-accent/5",
    low: "border-l-muted-foreground bg-secondary/50",
  };
  
  const icons = {
    alert: AlertTriangle,
    insight: Lightbulb,
    reminder: Bell,
    nudge: Sparkles,
  };
  
  const Icon = icons[notification.type] || Bell;
  
  return (
    <div 
      className={`p-3 rounded-lg border-l-4 ${priorityColors[notification.priority]} ${!notification.read ? 'ring-1 ring-accent/20' : ''}`}
      onClick={() => !notification.read && onMarkRead(notification.id)}
    >
      <div className="flex items-start gap-3">
        <Icon size={16} className="text-muted-foreground mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium">{notification.title}</p>
            <button 
              onClick={(e) => { e.stopPropagation(); onDismiss(notification.id); }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={14} />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
          <p className="text-xs text-muted-foreground/60 mt-2">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
};

const GenieDashboard = ({ 
  memory, 
  insights, 
  recentDecisions,
  notifications,
  onStartChat,
  onEditProfile,
  onDismissNotification,
  onMarkNotificationRead
}: GenieDashboardProps) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left Column - Business Memory Summary */}
      <div className="lg:col-span-1 space-y-6">
        {/* Business Profile Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 size={18} className="text-accent" />
                Business Profile
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onEditProfile}>
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {memory ? (
              <>
                <div>
                  <h3 className="font-medium text-lg">{memory.business_name || "Your Business"}</h3>
                  <p className="text-sm text-muted-foreground">{memory.business_type || "Not specified"}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-muted-foreground" />
                    <span>{memory.team_size || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign size={14} className="text-muted-foreground" />
                    <span>{memory.annual_revenue_band || "—"}</span>
                  </div>
                </div>

                {memory.primary_goal && (
                  <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                    <div className="flex items-center gap-2 text-xs font-medium text-accent mb-1">
                      <Target size={12} />
                      Primary Goal
                    </div>
                    <p className="text-sm">{memory.primary_goal}</p>
                  </div>
                )}

                {memory.biggest_challenge && (
                  <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                    <div className="flex items-center gap-2 text-xs font-medium text-destructive mb-1">
                      <AlertTriangle size={12} />
                      Biggest Challenge
                    </div>
                    <p className="text-sm">{memory.biggest_challenge}</p>
                  </div>
                )}

                {memory.key_metrics && memory.key_metrics.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Key Metrics</p>
                    <div className="flex flex-wrap gap-1">
                      {memory.key_metrics.map((metric, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {memory.known_weak_spots && memory.known_weak_spots.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Known Weak Spots</p>
                    <div className="flex flex-wrap gap-1">
                      {memory.known_weak_spots.map((spot, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {spot}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <Brain size={32} className="mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground mb-4">
                  No business profile yet. Help the Genie understand your business.
                </p>
                <Button variant="accent" size="sm" onClick={onEditProfile}>
                  Set Up Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-4">
            <Button 
              variant="accent" 
              className="w-full justify-between" 
              onClick={onStartChat}
            >
              <span className="flex items-center gap-2">
                <Brain size={18} />
                Start Genie Session
              </span>
              <ChevronRight size={18} />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Middle Column - Notifications & Insights */}
      <div className="lg:col-span-1 space-y-6">
        {/* Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell size={18} className="text-accent" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="default" className="ml-auto bg-accent text-accent-foreground">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <NotificationCard 
                    key={notification.id} 
                    notification={notification} 
                    onDismiss={onDismissNotification}
                    onMarkRead={onMarkNotificationRead}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Bell size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">All caught up!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Insights */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb size={18} className="text-accent" />
              Remembered Insights
              <Badge variant="secondary" className="ml-auto">
                {insights.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.length > 0 ? (
              <ScrollArea className="h-[280px] pr-2">
                <div className="space-y-3">
                  {insights.map((insight) => (
                    <div 
                      key={insight.id} 
                      className="p-3 rounded-lg bg-secondary/50 border border-border/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <InsightTypeBadge type={insight.insight_type} />
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(insight.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm">{insight.content}</p>
                      {insight.source && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Source: {insight.source}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Lightbulb size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No insights yet</p>
                <p className="text-xs mt-1">The Genie will remember important things from your conversations.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Recent Decisions */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp size={18} className="text-accent" />
              Decision Log
              <Badge variant="secondary" className="ml-auto">
                {recentDecisions.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentDecisions.length > 0 ? (
              <ScrollArea className="h-[480px] pr-2">
                <div className="space-y-4">
                  {recentDecisions.map((decision) => (
                    <div 
                      key={decision.id} 
                      className="p-4 rounded-lg border border-border bg-card"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-accent" />
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(decision.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        {decision.mode && (
                          <Badge variant="outline" className="text-xs">
                            {decision.mode}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium">{decision.decision_summary}</p>
                      {decision.context && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {decision.context}
                        </p>
                      )}
                      {decision.outcome && (
                        <div className="mt-3 p-2 rounded bg-accent/5 border border-accent/20">
                          <p className="text-xs font-medium text-accent">Outcome</p>
                          <p className="text-sm mt-1">{decision.outcome}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp size={32} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">No decisions logged yet</p>
                <p className="text-xs mt-1">
                  Your important decisions will appear here for future reference.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GenieDashboard;
