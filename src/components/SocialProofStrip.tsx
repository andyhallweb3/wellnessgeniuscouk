import { Linkedin, Mail, Users } from "lucide-react";
import nuformaLogo from "@/assets/logos/nuforma.png";
import equesoulLogo from "@/assets/logos/equesoul.jpeg";
import leisureExpertsLogo from "@/assets/logos/the-leisure-experts.jpeg";
import fitterStockLogo from "@/assets/logos/fitter-stock.jpeg";
import awakeLogo from "@/assets/logos/awake-meditation.jpeg";

const clients = [
  { name: "Fitter Stock", logo: fitterStockLogo },
  { name: "Nuforma", logo: nuformaLogo },
  { name: "Equesoul", logo: equesoulLogo },
  { name: "The Leisure Experts", logo: leisureExpertsLogo },
  { name: "Awake Meditation", logo: awakeLogo },
];

const metrics = [
  { icon: Linkedin, value: "16,000+", label: "LinkedIn followers" },
  { icon: Mail, value: "2,600+", label: "Weekly subscribers" },
  { icon: Users, value: "500+", label: "Operators served" },
];

const SocialProofStrip = () => {
  return (
    <section className="section-padding bg-card border-y border-border/30">
      <div className="container-wide">
        {/* Metrics */}
        <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16 mb-10">
          {metrics.map((metric) => (
            <div key={metric.label} className="flex items-center gap-3 text-center">
              <div className="p-2 rounded-lg bg-primary/10">
                <metric.icon size={18} className="text-primary" />
              </div>
              <div className="text-left">
                <p className="text-xl font-bold">{metric.value}</p>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Client logos */}
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">
            Trusted by wellness operators across the UK
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
