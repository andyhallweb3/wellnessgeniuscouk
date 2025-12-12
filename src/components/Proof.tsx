import { Quote, ExternalLink } from "lucide-react";
import fitterStockLogo from "@/assets/logos/fitter-stock.jpeg";
import leisureExpertsLogo from "@/assets/logos/the-leisure-experts.jpeg";
import nuformaLogo from "@/assets/logos/nuforma.png";
import equesoulLogo from "@/assets/logos/equesoul.jpeg";
import awakeMeditationLogo from "@/assets/logos/awake-meditation.jpeg";

const clients = [
  {
    name: "Fitter Stock",
    description: "B2B wellness media & exercise content provider supporting employee and member programmes.",
    url: "https://fitterstock.com",
    logo: fitterStockLogo,
  },
  {
    name: "The Leisure Experts",
    description: "Consultancy for leisure, sport and wellbeing operators, from strategy to execution.",
    url: "https://theleisureexperts.com",
    logo: leisureExpertsLogo,
  },
  {
    name: "Nuforma",
    description: "Pilates innovation geared towards superior movement results — studio and franchise model.",
    url: "https://nuformapilates.co.uk",
    logo: nuformaLogo,
  },
  {
    name: "EqueSoul",
    description: "International equestrian fitness and performance programming.",
    url: "https://equesoul.com",
    logo: equesoulLogo,
  },
  {
    name: "Awake Meditation",
    description: "Multimodal corporate and lifestyle wellbeing practice.",
    url: "https://awakemeditation.co.uk",
    logo: awakeMeditationLogo,
  },
];

const testimonials = [
  {
    quote: "A professional team with a refreshing approach. Wellness Genius quickly identified where we were losing time and value across content, data, and operations. The work was practical, commercial, and execution-led — not theoretical.",
    author: "David Langridge",
    role: "Founder",
    company: "Fitter Stock",
  },
  {
    quote: "We were amazed at the quality and speed of the build. Wellness Genius brings a rare mix of strategic thinking and hands-on delivery. They don't just advise — they build, test, and challenge assumptions.",
    author: "Beth Laker",
    role: "Co-Founder",
    company: "The Leisure Experts",
  },
  {
    quote: "Wellness Genius helped us simplify our digital approach while staying true to the experience we wanted to create. Calm, structured, and focused on what actually matters.",
    author: "Antonia Tindley",
    role: "Founder",
    company: "Awake Meditation",
  },
  {
    quote: "Trusted and knowledgeable — bespoke and easy to work with. Working with Wellness Genius brought clarity to both our product positioning and our next phase of growth.",
    author: "Nicole Nason",
    role: "Director",
    company: "Nuforma",
  },
  {
    quote: "Trusted and knowledgeable, with a bespoke approach that made everything easy. Wellness Genius brought structure and strategic thinking to a space that's often intuitive and fragmented.",
    author: "Nicole Nason",
    role: "Director",
    company: "Equesoul",
  },
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-16">
          {clients.map((client, index) => (
            <a
              key={index}
              href={client.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-card rounded-xl p-6 border border-border/50 hover:border-accent/30 hover:shadow-elegant transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 flex items-center">
                  <img 
                    src={client.logo} 
                    alt={`${client.name} logo`}
                    className="h-10 w-auto object-contain max-w-[120px]"
                  />
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
