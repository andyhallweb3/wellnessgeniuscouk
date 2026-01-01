import { Check, Circle, FileText, DollarSign, Users, TrendingUp, Settings2 } from "lucide-react";
import { useCoachDocuments } from "@/hooks/useCoachDocuments";

interface DocumentCategory {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  keywords: string[];
}

const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  {
    id: "financial",
    label: "Financial",
    description: "P&L, cash flow, budgets",
    icon: <DollarSign size={16} />,
    keywords: ["financial", "p&l", "profit", "loss", "budget", "revenue", "expense", "cash", "invoice", "accounting"]
  },
  {
    id: "customer",
    label: "Customer",
    description: "Feedback, NPS, testimonials",
    icon: <Users size={16} />,
    keywords: ["customer", "client", "feedback", "nps", "survey", "testimonial", "review", "churn", "retention"]
  },
  {
    id: "marketing",
    label: "Marketing",
    description: "Campaigns, analytics, leads",
    icon: <TrendingUp size={16} />,
    keywords: ["marketing", "campaign", "lead", "funnel", "analytics", "seo", "social", "ads", "content", "email"]
  },
  {
    id: "operations",
    label: "Operations",
    description: "SOPs, org charts, processes",
    icon: <Settings2 size={16} />,
    keywords: ["operations", "sop", "process", "procedure", "org", "team", "workflow", "manual", "policy"]
  }
];

const DocumentChecklist = () => {
  const { documents } = useCoachDocuments();

  const getCategoryStatus = (category: DocumentCategory): boolean => {
    return documents.some(doc => {
      const searchText = `${doc.file_name} ${doc.description || ""} ${doc.category || ""}`.toLowerCase();
      return category.keywords.some(keyword => searchText.includes(keyword)) || 
             doc.category?.toLowerCase() === category.id;
    });
  };

  const uploadedCount = DOCUMENT_CATEGORIES.filter(getCategoryStatus).length;
  const totalCount = DOCUMENT_CATEGORIES.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-muted-foreground" />
          <span className="text-sm font-medium">Document Context</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {uploadedCount}/{totalCount} categories
        </span>
      </div>

      <div className="space-y-2">
        {DOCUMENT_CATEGORIES.map((category) => {
          const hasDocuments = getCategoryStatus(category);
          return (
            <div
              key={category.id}
              className={`flex items-center gap-3 p-2 rounded-lg border transition-colors ${
                hasDocuments 
                  ? "border-accent/30 bg-accent/5" 
                  : "border-border bg-secondary/30"
              }`}
            >
              <div className={`shrink-0 ${hasDocuments ? "text-accent" : "text-muted-foreground"}`}>
                {category.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${hasDocuments ? "text-foreground" : "text-muted-foreground"}`}>
                  {category.label}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {category.description}
                </p>
              </div>
              <div className="shrink-0">
                {hasDocuments ? (
                  <div className="h-5 w-5 rounded-full bg-accent/20 flex items-center justify-center">
                    <Check size={12} className="text-accent" />
                  </div>
                ) : (
                  <Circle size={16} className="text-muted-foreground/40" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {uploadedCount < totalCount && (
        <p className="text-xs text-muted-foreground text-center pt-2">
          Upload documents to each category for more personalized advice
        </p>
      )}
    </div>
  );
};

export default DocumentChecklist;
