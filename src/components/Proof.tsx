import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Andy's AI agents transformed our member engagement. We saw a 40% increase in retention within three months.",
    author: "Sarah Mitchell",
    role: "Head of Operations",
    company: "Premium Wellness Group",
  },
  {
    quote: "The automation setup paid for itself in the first month. Our team now focuses on high-value work instead of manual tasks.",
    author: "James Chen",
    role: "Founder & CEO",
    company: "FitTech Studios",
  },
  {
    quote: "Professional, strategic, and incredibly effective. Andy understood our industry nuances from day one.",
    author: "Emma Roberts",
    role: "Marketing Director",
    company: "Hospitality Brands Co",
  },
];

const metrics = [
  { value: "£2M+", label: "Revenue generated" },
  { value: "500+", label: "Automations deployed" },
  { value: "40%", label: "Avg efficiency gain" },
  { value: "15+", label: "Enterprise clients" },
];

const Proof = () => {
  return (
    <section id="proof" className="section-padding">
      <div className="container-wide">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <p className="text-sm font-medium text-accent uppercase tracking-wider mb-3">
            Results
          </p>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-heading mb-4">
            Trusted by leading wellness brands
          </h2>
          <p className="text-muted-foreground text-lg">
            Real outcomes from real partnerships. Here's what clients say about working together.
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-xl bg-secondary/50 border border-border/50"
            >
              <div className="text-3xl lg:text-4xl font-heading font-medium text-foreground mb-2">
                {metric.value}
              </div>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-8 shadow-elegant border border-border/50 hover:shadow-elevated transition-all duration-300"
            >
              <Quote className="w-8 h-8 text-accent/30 mb-4" />
              <blockquote className="text-foreground mb-6 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-medium">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Proof;
