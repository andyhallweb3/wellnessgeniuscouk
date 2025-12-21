import { Brain } from "lucide-react";
import MarkdownRenderer from "@/components/coach/MarkdownRenderer";
import TrustModeIndicator, { ConfidenceLevel, DataSensitivity } from "./TrustModeIndicator";
import ExplainabilityCard from "./ExplainabilityCard";

interface GenieMessageProps {
  content: string;
  mode?: string;
}

// Analyze message content to determine confidence and sensitivity
const analyzeMessage = (content: string, mode?: string): {
  confidence: ConfidenceLevel;
  sensitivity: DataSensitivity;
  isInference: boolean;
  explanation: string;
  factors: string[];
  howToChange?: string;
} => {
  const lowerContent = content.toLowerCase();
  
  // Detect inference language
  const inferenceIndicators = [
    "likely", "probably", "suggests", "indicates", "may", "might",
    "appears to", "seems to", "could be", "potential", "early signal",
    "trending", "pattern", "prediction"
  ];
  const isInference = inferenceIndicators.some(ind => lowerContent.includes(ind));
  
  // Detect data sensitivity
  let sensitivity: DataSensitivity = "standard";
  if (lowerContent.includes("behavior") || lowerContent.includes("behaviour") || 
      lowerContent.includes("usage") || lowerContent.includes("engagement")) {
    sensitivity = "sensitive";
  }
  if (lowerContent.includes("wellness") || lowerContent.includes("health") || 
      lowerContent.includes("stress") || lowerContent.includes("recovery") ||
      lowerContent.includes("sleep") || lowerContent.includes("mood")) {
    sensitivity = "health-adjacent";
  }
  
  // Determine confidence based on content and mode
  let confidence: ConfidenceLevel = "medium";
  
  // High confidence indicators
  if (lowerContent.includes("based on your data") || 
      lowerContent.includes("confirmed") ||
      lowerContent.includes("your records show")) {
    confidence = "high";
  }
  
  // Low confidence indicators
  if (lowerContent.includes("limited data") || 
      lowerContent.includes("not enough information") ||
      lowerContent.includes("estimate") ||
      lowerContent.includes("rough") ||
      lowerContent.includes("assumption")) {
    confidence = "low";
  }
  
  // Mode-specific adjustments
  if (mode === "decision_support" || mode === "diagnostic") {
    // These modes tend to make more analytical statements
    if (!isInference) confidence = "high";
  }
  
  // Generate explanation based on mode
  let explanation = "This insight is based on your business profile and conversation context.";
  let factors: string[] = [];
  let howToChange: string | undefined;
  
  switch (mode) {
    case "daily_briefing":
      explanation = "This briefing synthesizes signals from your business profile and recent patterns.";
      factors = [
        "Your stated business goals and challenges",
        "Key metrics you're tracking",
        "Communication style preferences"
      ];
      howToChange = "Update your business profile to refine future briefings.";
      break;
    case "decision_support":
      explanation = "This analysis weighs options based on your business context and stated priorities.";
      factors = [
        "Your decision-making style preference",
        "Business goals you've shared",
        "Risk tolerance based on your profile"
      ];
      howToChange = "Ask follow-up questions to explore other factors.";
      break;
    case "diagnostic":
      explanation = "This diagnostic evaluates the situation using available information.";
      factors = [
        "Information provided in this conversation",
        "Your business profile context",
        "Industry patterns and benchmarks"
      ];
      howToChange = "Provide more specific data for a deeper analysis.";
      break;
    case "commercial_lens":
      explanation = "This commercial analysis focuses on revenue and growth opportunities.";
      factors = [
        "Your revenue model",
        "Business size and scale",
        "Stated growth objectives"
      ];
      howToChange = "Share specific metrics for more targeted recommendations.";
      break;
    case "ops_mode":
      explanation = "This operational insight focuses on efficiency and execution.";
      factors = [
        "Your team size and structure",
        "Known operational weak spots",
        "Current processes described"
      ];
      howToChange = "Detail specific workflows for more actionable guidance.";
      break;
    default:
      factors = [
        "Your business profile information",
        "Context from this conversation",
        "General industry knowledge"
      ];
      howToChange = "Provide more context or update your profile for better insights.";
  }
  
  return { confidence, sensitivity, isInference, explanation, factors, howToChange };
};

const GenieMessage = ({ content, mode }: GenieMessageProps) => {
  const analysis = analyzeMessage(content, mode);
  
  // Don't show trust indicators for very short responses or greetings
  const showTrustIndicators = content.length > 100;
  
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
        
        {/* Trust indicators - only for substantive responses */}
        {showTrustIndicators && (
          <div className="space-y-2">
            {/* Compact trust badge */}
            <div className="flex items-center gap-2">
              <TrustModeIndicator
                confidenceLevel={analysis.confidence}
                dataSensitivity={analysis.sensitivity}
                isInference={analysis.isInference}
                compact
              />
              <span className="text-xs text-muted-foreground">
                AI supports decisions; it doesn't make them for you.
              </span>
            </div>
            
            {/* Expandable explainability */}
            <ExplainabilityCard
              title="Why am I seeing this?"
              explanation={analysis.explanation}
              factors={analysis.factors}
              howToChange={analysis.howToChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GenieMessage;
