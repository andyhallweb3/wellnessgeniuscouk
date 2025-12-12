import { Quote, ExternalLink } from "lucide-react";

const clients = [
  {
    name: "Fitter Stock",
    description: "B2B wellness media & exercise content provider supporting employee and member programmes.",
    url: "https://fitterstock.com",
  },
  {
    name: "LIVE4WELL",
    description: "Combines AI tech with health tracking and incentivised wellbeing experiences.",
    url: "https://live4well.com",
  },
  {
    name: "The Leisure Experts",
    description: "Consultancy for leisure, sport and wellbeing operators, from strategy to execution.",
    url: "https://theleisureexperts.com",
  },
  {
    name: "Nuforma",
    description: "Pilates innovation geared towards superior movement results — studio and franchise model.",
    url: "https://nuformapilates.co.uk",
  },
  {
    name: "Predict Mobile",
    description: "Machine-assisted procurement analytics and mobile services optimisation.",
    url: "https://predictmobile.com",
  },
  {
    name: "reFIT",
    description: "Converts real estate into automated wellness hubs for office/residential.",
    url: "https://refit.io",
  },
  {
    name: "EqueSoul",
    description: "International equestrian fitness and performance programming.",
    url: "https://equesoul.com",
  },
  {
    name: "Awake Meditation",
    description: "Multimodal corporate and lifestyle wellbeing practice.",
    url: "https://awakemeditation.co.uk",
  },
];

const testimonials = [
  {
    quote: "Wellness Genius quickly identified where we were losing time and value across content, data, and operations. The approach was practical, commercial, and execution-led — not theoretical. We came away with real clarity and momentum.",
    author: "Founder",
    role: "Digital fitness content & platform strategy",
    company: "Fitter Stock",
  },
  {
    quote: "Wellness Genius brings a rare mix of strategic thinking and hands-on delivery. They don't just advise — they build, test, and challenge assumptions. That's what made the work genuinely valuable.",
    author: "Partner",
    role: "Wellness, hospitality & commercial strategy",
    company: "The Leisure Experts",
  },
  {
    quote: "Wellness Genius helped us simplify our digital approach while staying true to the experience we wanted to create. Calm, structured, and focused on what actually matters.",
    author: "Founder",
    role: "Digital wellness & experience design",
    company: "Awake Meditation",
  },
  {
    quote: "Working with Wellness Genius brought clarity to both our product positioning and our next phase of growth. They ask the right questions and don't let you hide behind vague answers.",
    author: "Director",
    role: "Wellness, recovery & performance",
    company: "Nuforma",
  },
  {
    quote: "Wellness Genius brought structure and strategic thinking to a space that's often intuitive and fragmented. The result was clearer direction and better decision-making.",
    author: "Founder",
    role: "Equine & holistic wellbeing",
    company: "Equesoul",
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
            Featured Clients & Partners
          </p>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-heading mb-4">
            Trusted by organisations innovating in wellness
          </h2>
          <p className="text-muted-foreground text-lg">
            Strategy meets measurable wellbeing outcomes. Working with leaders in fitness, behavioural health and digital transformation.
          </p>
        </div>

        {/* Client Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-16">
          {clients.map((client, index) => (
            <a
              key={index}
              href={client.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-card rounded-xl p-6 border border-border/50 hover:border-accent/30 hover:shadow-elegant transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent font-heading font-medium text-lg">
                  {client.name.charAt(0)}
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="font-medium text-foreground mb-2 group-hover:text-accent transition-colors">
                {client.name}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {client.description}
              </p>
            </a>
          ))}
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
        <div className="max-w-2xl mb-8">
          <p className="text-sm font-medium text-accent uppercase tracking-wider mb-3">
            Testimonials
          </p>
          <h3 className="text-2xl lg:text-3xl font-heading mb-2">
            Insight-led. Outcome-focused. No hype.
          </h3>
        </div>
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
