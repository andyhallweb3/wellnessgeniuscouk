import { 
  BarChart3, 
  MessageCircle, 
  Brain, 
  Search, 
  TrendingUp, 
  Briefcase, 
  Calendar, 
  Wrench,
  Globe
} from "lucide-react";

// Map icon names to Lucide components for use across the app
export const ADVISOR_ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  BarChart3,
  MessageCircle,
  Brain,
  Search,
  TrendingUp,
  Briefcase,
  Calendar,
  Wrench,
  Globe,
};

export const getAdvisorIcon = (iconName: string, size: number = 20, className?: string) => {
  const IconComponent = ADVISOR_ICON_MAP[iconName] || Brain;
  return <IconComponent size={size} className={className} />;
};
