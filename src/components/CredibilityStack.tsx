import { Award, Users, Mic, BookOpen, Shield, Lock } from "lucide-react";

const credentials = [
  {
    icon: Award,
    label: "GWI Research Council",
    detail: "Contributing member",
  },
  {
    icon: Users,
    label: "500+ operators",
    detail: "Using our AI tools",
  },
  {
    icon: Mic,
    label: "Industry speaker",
    detail: "FIBO, ukactive, IHRSA",
  },
  {
    icon: Lock,
    label: "Data secure",
    detail: "SOC 2 compliant",
  },
];

const CredibilityStack = () => {
  return (
    <section className="py-8 bg-card/50 border-y border-border/30">
      <div className="container-wide">
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {credentials.map((cred, i) => (
            <div key={i} className="flex items-center gap-2">
              <cred.icon size={16} className="text-accent" />
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium">{cred.label}</span>
                <span className="text-xs text-muted-foreground">— {cred.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CredibilityStack;