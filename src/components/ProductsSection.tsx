import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Zap, Users, Target } from "lucide-react";
import { Link } from "react-router-dom";

const products = [
  {
    id: "engagement-playbook",
    title: "Wellness Engagement Playbook",
    description: "Evidence-led operating system for member retention, habit loops, and engagement scoring.",
    price: "£49",
    icon: Target,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "gamification-playbook",
    title: "Gamification & Rewards Playbook",
    description: "Complete framework for points, streaks, challenges, and hyper-personalisation.",
    price: "£49",
    icon: Zap,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
  {
    id: "ai-activation",
    title: "90-Day AI Activation Playbook",
    description: "Weekly sprint templates, board-ready reporting, and execution artefacts.",
    price: "£79",
    icon: FileText,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
  },
  {
    id: "ai-readiness-report",
    title: "AI Readiness Report",
    description: "Full diagnostic with revenue upside, blockers, and prioritised 90-day action plan.",
    price: "£149",
    icon: Users,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
  },
];

const ProductsSection = () => {
  return (
    <section className="section-padding bg-card">
      <div className="container-wide">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-2">
              Operator Playbooks
            </p>
            <h2 className="text-3xl lg:text-4xl tracking-tight">
              Ready-to-use frameworks
            </h2>
            <p className="text-muted-foreground mt-2">
              Downloaded by 500+ wellness operators. Instant access.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/products">
              View All Products
              <ArrowRight size={16} />
            </Link>
          </Button>
        </div>

        {/* Product Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <Link
              key={product.id}
              to="/products"
              className="group p-6 rounded-xl bg-background border border-border hover:border-accent/50 transition-all hover:shadow-lg"
            >
              <div className={`p-3 rounded-xl ${product.bgColor} w-fit mb-4`}>
                <product.icon size={24} className={product.color} />
              </div>
              
              <h3 className="font-semibold mb-2 group-hover:text-accent transition-colors">
                {product.title}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {product.description}
              </p>
              
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold">{product.price}</span>
                <span className="text-xs text-muted-foreground">one-time</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Bundles CTA */}
        <div className="mt-8 p-6 rounded-xl bg-accent/5 border border-accent/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold">Save up to 40% with bundles</p>
            <p className="text-sm text-muted-foreground">Get multiple playbooks at a discount</p>
          </div>
          <Button variant="accent" asChild>
            <Link to="/bundles">
              View Bundles
              <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
