import { Linkedin, Twitter } from "lucide-react";
import andyHeadshot from "@/assets/andy-headshot.jpeg";

const FounderSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-wide">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3 text-center">
            Who's Behind This
          </p>
          <h2 className="text-3xl lg:text-4xl mb-12 tracking-tight text-center">
            Built by an operator, for operators
          </h2>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Photo */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <img
                src={andyHeadshot}
                alt="Andy Hall"
                className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover border-2 border-accent/20"
              />
            </div>

            {/* Bio */}
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-1">Andy Hall, BSc, EMBA</h3>
              <p className="text-accent text-sm mb-4">Founder &amp; CEO, Wellness Genius</p>
              
              <p className="text-muted-foreground mb-4 leading-relaxed">
                20+ years building wellness, health-tech, and digital platforms across the UK, Europe, and Asia.
                Sold wellness technology into 42 global
                fitness brands. Now helping operators cut through AI hype and implement what actually works.
              </p>

              <div className="flex flex-wrap gap-4 items-center mb-6">
                <a
                  href="https://www.linkedin.com/in/andyweb3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Linkedin size={16} />
                  LinkedIn
                </a>
                <a
                  href="https://twitter.com/andy_web_3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Twitter size={16} />
                  Twitter
                </a>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FounderSection;
