import { Quote } from "lucide-react";

// Real client logos
import nuformaLogo from "@/assets/logos/nuforma.png";
import equesoulLogo from "@/assets/logos/equesoul.jpeg";
import leisureExpertsLogo from "@/assets/logos/the-leisure-experts.jpeg";

const clients = [
  {
    name: "Nuforma",
    logo: nuformaLogo,
  },
  {
    name: "Equesoul",
    logo: equesoulLogo,
  },
  {
    name: "The Leisure Experts",
    logo: leisureExpertsLogo,
  },
];

const SocialProofStrip = () => {
  return (
    <section className="section-padding bg-card border-y border-border/30">
      <div className="container-wide">
        <div className="text-center mb-10">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">
            Trusted by wellness operators
          </p>
          <div className="flex items-center justify-center gap-10 flex-wrap">
            {clients.map((client) => (
              <img 
                key={client.name}
                src={client.logo} 
                alt={client.name} 
                className="h-10 w-auto opacity-70 hover:opacity-100 transition-opacity rounded"
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default SocialProofStrip;