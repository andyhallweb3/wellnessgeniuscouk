import { Shield, Eye, AlertTriangle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type ConfidenceLevel = "high" | "medium" | "low";
export type DataSensitivity = "standard" | "sensitive" | "health-adjacent";

interface TrustModeIndicatorProps {
  confidenceLevel: ConfidenceLevel;
  dataSensitivity?: DataSensitivity;
  isInference?: boolean;
  compact?: boolean;
}

const confidenceConfig = {
  high: {
    label: "High confidence",
    description: "Based on confirmed data",
    color: "text-green-600",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
  medium: {
    label: "Medium confidence",
    description: "Some inputs estimated",
    color: "text-amber-600",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  low: {
    label: "Low confidence",
    description: "Limited data available",
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
};

const sensitivityConfig = {
  standard: {
    label: "Standard data",
    icon: Info,
  },
  sensitive: {
    label: "Behavioural data used",
    icon: Eye,
  },
  "health-adjacent": {
    label: "Health-adjacent signals used",
    icon: AlertTriangle,
  },
};

const TrustModeIndicator = ({
  confidenceLevel,
  dataSensitivity = "standard",
  isInference = false,
  compact = false,
}: TrustModeIndicatorProps) => {
  const confidence = confidenceConfig[confidenceLevel];
  const sensitivity = sensitivityConfig[dataSensitivity];
  const SensitivityIcon = sensitivity.icon;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex items-center gap-1.5">
              <Shield size={12} className={confidence.color} />
              <span className={cn("text-xs", confidence.color)}>
                {confidenceLevel === "high" ? "●" : confidenceLevel === "medium" ? "◐" : "○"}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Shield size={12} className={confidence.color} />
                <span className="font-medium">{confidence.label}</span>
              </div>
              <p className="text-muted-foreground">{confidence.description}</p>
              {isInference && (
                <p className="text-amber-600">
                  ⚠ This includes AI inferences (treated as probabilities, not facts)
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-2">
      {/* Confidence Badge */}
      <div className="flex items-center gap-2">
        <Badge 
          variant="outline" 
          className={cn("text-xs", confidence.bg, confidence.border, confidence.color)}
        >
          <Shield size={10} className="mr-1" />
          {confidence.label}
        </Badge>
        
        {dataSensitivity !== "standard" && (
          <Badge variant="outline" className="text-xs bg-secondary">
            <SensitivityIcon size={10} className="mr-1" />
            {sensitivity.label}
          </Badge>
        )}
      </div>

      {/* Inference warning */}
      {isInference && (
        <p className="text-xs text-amber-600 flex items-center gap-1.5">
          <AlertTriangle size={12} />
          This insight includes AI inferences — treat as early signal, not certainty.
        </p>
      )}

      {/* Transparency note */}
      <p className="text-xs text-muted-foreground">
        {confidence.description}. AI supports decisions; it doesn't make them for you.
      </p>
    </div>
  );
};

export default TrustModeIndicator;
