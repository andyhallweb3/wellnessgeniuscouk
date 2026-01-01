import { Award, Users, Mic, BookOpen } from "lucide-react";
import gwiLogo from "@/assets/logos/gwi-logo.svg";

const credentials = [
  {
    icon: Award,
    label: "GWI Research Council",
    detail: "Contributing member",
  },
  {
    icon: Users,
    label: "500+ wellness operators",
    detail: "Using our AI tools",
  },
  {
    icon: Mic,
    label: "Industry speaker",
    detail: "FIBO, ukactive, IHRSA",
  },
  {
    icon: BookOpen,
    label: "Published author",
    detail: "Beyond Reps: AI in Fitness",
  },
];

const CredibilityStack = () => {
  return (
    <section className="py-12 bg-card border-y border-border/50">
      <div className="container-wide">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left - Statement */}
          <div className="flex items-center gap-6">
            <div className="hidden sm:block">
              <img src={gwiLogo} alt="Global Wellness Institute" className="h-10 w-auto opacity-70" />
            </div>
            <div className="text-center lg:text-left">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Why Trust Us
              </p>
              <p className="text-lg font-semibold">
                We see what's coming before most people do
              </p>
            </div>
          </div>

          {/* Right - Credentials */}
          <div className="flex flex-wrap justify-center lg:justify-end gap-x-8 gap-y-4">
            {credentials.map((cred, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <cred.icon size={18} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium">{cred.label}</p>
                  <p className="text-xs text-muted-foreground">{cred.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CredibilityStack;
