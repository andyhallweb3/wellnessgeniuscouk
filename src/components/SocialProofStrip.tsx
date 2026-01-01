import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Saved me 4 hours on a pricing decision I'd been putting off for weeks.",
    name: "Sarah Chen",
    role: "Studio Owner",
    company: "Breathe Wellness",
  },
  {
    quote: "Finally, AI that understands wellness isn't just another industry.",
    name: "Marcus Williams",
    role: "Head of Operations",
    company: "FitLife Group",
  },
  {
    quote: "The retention analysis spotted something my team missed for 6 months.",
    name: "Emma Rodriguez",
    role: "CEO",
    company: "Urban Retreat Spas",
  },
];

const SocialProofStrip = () => {
  return (
    <section className="section-padding bg-card border-y border-border/30">
      <div className="container-wide">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={18} className="fill-accent text-accent" />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Rated 4.9/5 by wellness operators
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-background border border-border rounded-xl p-6">
              <Quote size={20} className="text-accent/30 mb-3" />
              <p className="text-sm mb-4 leading-relaxed">"{t.quote}"</p>
              <div>
                <p className="font-medium text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}, {t.company}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofStrip;