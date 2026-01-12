import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bookmark, Target, AlertTriangle, TrendingUp, Check } from "lucide-react";
import { toast } from "sonner";

interface AdvisorSaveActionsProps {
  messageContent: string;
  mode: string;
  onSaveDecision: (summary: string, context: string, decisionType: string) => Promise<boolean>;
  onAddGoal: (goal: string) => Promise<boolean>;
  onAddConstraint: (constraint: string) => Promise<boolean>;
  onUpdateMetric: (metric: string, value: string) => Promise<boolean>;
}

const AdvisorSaveActions = ({
  messageContent,
  mode,
  onSaveDecision,
  onAddGoal,
  onAddConstraint,
  onUpdateMetric,
}: AdvisorSaveActionsProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  const extractSummary = (content: string): string => {
    // Try to extract the first heading or first paragraph
    const lines = content.split("\n").filter((l) => l.trim());
    const heading = lines.find((l) => l.startsWith("#"));
    if (heading) return heading.replace(/^#+\s*/, "").slice(0, 100);
    return lines[0]?.slice(0, 100) || "Decision from Advisor";
  };

  const handleSaveDecision = async () => {
    setIsSaving(true);
    try {
      const summary = extractSummary(messageContent);
      const success = await onSaveDecision(summary, messageContent, mode);
      if (success) {
        setSaved("decision");
        toast.success("Decision saved to workspace");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddGoal = async () => {
    setIsSaving(true);
    try {
      const goal = extractSummary(messageContent);
      const success = await onAddGoal(goal);
      if (success) {
        setSaved("goal");
        toast.success("Goal added to workspace");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddConstraint = async () => {
    setIsSaving(true);
    try {
      const constraint = extractSummary(messageContent);
      const success = await onAddConstraint(constraint);
      if (success) {
        setSaved("constraint");
        toast.success("Constraint noted in workspace");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (saved) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Check className="h-4 w-4 text-green-500" />
        <span>Saved as {saved}</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isSaving}>
          <Bookmark className="h-4 w-4 mr-2" />
          Save to workspace
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={handleSaveDecision}>
          <Bookmark className="h-4 w-4 mr-2" />
          Save as decision
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleAddGoal}>
          <Target className="h-4 w-4 mr-2" />
          Add as goal
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleAddConstraint}>
          <AlertTriangle className="h-4 w-4 mr-2" />
          Add as constraint
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AdvisorSaveActions;
