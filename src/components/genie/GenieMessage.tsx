import { Brain } from "lucide-react";
import MarkdownRenderer from "@/components/coach/MarkdownRenderer";
import TrustModeIndicator, { ConfidenceLevel, DataSensitivity } from "./TrustModeIndicator";
import ExplainabilityCard from "./ExplainabilityCard";

export interface TrustMetadata {
  confidenceLevel: ConfidenceLevel;
  dataSensitivity: DataSensitivity;
  isInference: boolean;
  dataSignals?: {
    hasBusinessProfile: boolean;
    hasRecentSessions: boolean;
    hasDocuments: boolean;
    hasMetrics: boolean;
    memoryCompleteness: number;
  };
  explanation: string;
  factors: string[];
}

interface GenieMessageProps {
  content: string;
  mode?: string;
  trustMetadata?: TrustMetadata;
  displayMode?: "compact" | "full";
}

// Fallback analysis when no backend metadata is available
const analyzeMessageFallback = (content: string, mode?: string): TrustMetadata => {
  const lowerContent = content.toLowerCase();
  
  const inferenceIndicators = [
    "likely", "probably", "suggests", "indicates", "may", "might",
    "appears to", "seems to", "could be", "potential", "early signal"
  ];
  const isInference = inferenceIndicators.some(ind => lowerContent.includes(ind));
  
  let dataSensitivity: DataSensitivity = "standard";
  if (lowerContent.includes("behavior") || lowerContent.includes("behaviour")) {
    dataSensitivity = "sensitive";
  }
  if (lowerContent.includes("wellness") || lowerContent.includes("health")) {
    dataSensitivity = "health-adjacent";
  }
  
  return {
    confidenceLevel: "medium",
    dataSensitivity,
    isInference,
    explanation: "This insight is based on your conversation context.",
    factors: [
      "Context from this conversation",
      `Mode: ${mode?.replace(/_/g, " ") || "general"}`
    ],
  };
};

// Generate how-to-change message based on data signals
const getHowToChange = (trustMetadata: TrustMetadata): string => {
  const signals = trustMetadata.dataSignals;
  
  if (!signals) {
    return "Provide more context or update your profile for better insights.";
  }
  
  const suggestions: string[] = [];
  
  if (!signals.hasBusinessProfile || signals.memoryCompleteness < 50) {
    suggestions.push("Complete your business profile");
  }
  
  if (!signals.hasDocuments) {
    suggestions.push("Upload relevant documents");
  }
  
  if (!signals.hasMetrics) {
    suggestions.push("Add key metrics you're tracking");
  }
  
  if (suggestions.length === 0) {
    return "Your profile is well configured. Ask follow-up questions for deeper analysis.";
  }
  
  return suggestions.join(", ") + " to improve insight accuracy.";
};

const GenieMessage = ({ 
  content, 
  mode, 
  trustMetadata,
  displayMode = "compact" 
}: GenieMessageProps) => {
  // Use backend metadata if available, otherwise fall back to content analysis
  const metadata = trustMetadata || analyzeMessageFallback(content, mode);
  
  // Don't show trust indicators for very short responses
  const showTrustIndicators = content.length > 100;
  const isFullMode = displayMode === "full";
  
  return (
    <div className="flex gap-3">
      <div className="p-2 rounded-full bg-accent/10 h-fit shrink-0">
        <Brain size={16} className="text-accent" />
      </div>
      <div className="flex-1 space-y-3 max-w-[80%]">
        {/* Main message content */}
        <div className="rounded-xl px-4 py-3 bg-secondary">
          <MarkdownRenderer content={content} />
        </div>
        
        {/* Trust indicators */}
        {showTrustIndicators && (
          <div className="space-y-2">
            {isFullMode ? (
              // Full mode - show detailed trust information
              <>
                <TrustModeIndicator
                  confidenceLevel={metadata.confidenceLevel}
                  dataSensitivity={metadata.dataSensitivity}
                  isInference={metadata.isInference}
                  compact={false}
                />
                <ExplainabilityCard
                  title="Why am I seeing this?"
                  explanation={metadata.explanation}
                  factors={metadata.factors}
                  howToChange={getHowToChange(metadata)}
                />
                
                {/* Data signals breakdown in full mode */}
                {metadata.dataSignals && (
                  <div className="text-xs text-muted-foreground px-3 py-2 rounded-lg bg-secondary/30 border border-border/30">
                    <span className="font-medium">Data signals: </span>
                    Profile {metadata.dataSignals.memoryCompleteness}% complete
                    {metadata.dataSignals.hasDocuments && " • Documents attached"}
                    {metadata.dataSignals.hasMetrics && " • Metrics tracked"}
                  </div>
                )}
              </>
            ) : (
              // Compact mode - minimal trust badge
              <div className="flex items-center gap-2">
                <TrustModeIndicator
                  confidenceLevel={metadata.confidenceLevel}
                  dataSensitivity={metadata.dataSensitivity}
                  isInference={metadata.isInference}
                  compact
                />
                <span className="text-xs text-muted-foreground">
                  AI supports decisions; it doesn't make them for you.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GenieMessage;
