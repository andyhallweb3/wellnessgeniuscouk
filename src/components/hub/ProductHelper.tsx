import { Sparkles, BarChart3, BookOpen, Target, TrendingUp, Calendar } from "lucide-react";

interface ProductHelperItem {
  id: string;
  name: string;
  helper: string;
  icon: React.ReactNode;
}

const PRODUCT_HELPERS: ProductHelperItem[] = [
  {
    id: "readiness-score",
    name: "AI Readiness",
    helper: "Establish reality and priorities.",
    icon: <Sparkles size={16} />,
  },
  {
    id: "build-vs-buy",
    name: "Build vs Buy",
    helper: "Choose the path and document it.",
    icon: <BookOpen size={16} />,
  },
  {
    id: "prompt-pack",
    name: "AI Builder",
    helper: "Define the decision before you build anything.",
    icon: <Target size={16} />,
  },
  {
    id: "engagement-playbook",
    name: "Engagement Systems",
    helper: "Fix behaviour change without burning margin.",
    icon: <BarChart3 size={16} />,
  },
  {
    id: "revenue-framework",
    name: "Engagement→Revenue",
    helper: "Translate value into CFO language.",
    icon: <TrendingUp size={16} />,
  },
  {
    id: "activation-playbook",
    name: "90-Day Activation",
    helper: "Execute with stop rules.",
    icon: <Calendar size={16} />,
  },
];

interface ProductHelperProps {
  productId?: string;
  className?: string;
}

export const ProductHelper = ({ productId, className = "" }: ProductHelperProps) => {
  const helper = PRODUCT_HELPERS.find((h) => h.id === productId);
  
  if (!helper) return null;

  return (
    <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
      <span className="text-accent">{helper.icon}</span>
      <span>{helper.helper}</span>
    </div>
  );
};

export const ProductHelperList = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {PRODUCT_HELPERS.map((helper) => (
        <div key={helper.id} className="flex items-start gap-3">
          <span className="p-1.5 rounded-md bg-accent/10 text-accent shrink-0">
            {helper.icon}
          </span>
          <div>
            <p className="text-sm font-medium">{helper.name}</p>
            <p className="text-xs text-muted-foreground">{helper.helper}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductHelper;
