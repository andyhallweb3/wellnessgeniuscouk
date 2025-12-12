const steps = [
  {
    number: "01",
    title: "Discovery Call",
    description:
      "We'll discuss your current challenges, goals, and identify the highest-impact opportunities for AI automation in your business.",
    duration: "30 minutes",
  },
  {
    number: "02",
    title: "Strategy & Proposal",
    description:
      "You'll receive a detailed roadmap with specific automations, expected outcomes, timeline, and investment—within 48 hours.",
    duration: "48 hours",
  },
  {
    number: "03",
    title: "Build & Integrate",
    description:
      "I'll build your custom AI agents and integrate them with your existing tools, with regular check-ins throughout.",
    duration: "2-6 weeks",
  },
  {
    number: "04",
    title: "Launch & Optimise",
    description:
      "We'll deploy, monitor performance together, and continuously optimise to ensure you're getting maximum value.",
    duration: "Ongoing",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="section-padding bg-primary text-primary-foreground">
      <div className="container-wide">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <p className="text-sm font-medium text-accent uppercase tracking-wider mb-3">
            Process
          </p>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-heading mb-4">
            How we work together
          </h2>
          <p className="text-primary-foreground/70 text-lg">
            A proven process designed to deliver results quickly and efficiently. No fluff, just outcomes.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">

              <div className="relative">
                <div className="text-5xl lg:text-6xl font-heading text-accent/30 mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-heading font-medium mb-3">
                  {step.title}
                </h3>
                <p className="text-primary-foreground/70 text-sm mb-4 leading-relaxed">
                  {step.description}
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-foreground/10 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {step.duration}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
