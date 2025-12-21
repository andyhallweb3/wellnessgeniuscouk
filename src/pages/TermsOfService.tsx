import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  const lastUpdated = "21 December 2025";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl lg:text-4xl font-heading mb-4">Terms of Service</h1>
            <p className="text-muted-foreground mb-8">Last updated: {lastUpdated}</p>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
              <p className="text-lg text-muted-foreground">
                These Terms of Service ("Terms") govern your access to and use of the Wellness Genius website, tools, and services. By accessing or using our website or services, you agree to these Terms.
              </p>
              <p className="text-muted-foreground font-medium">
                If you do not agree, please do not use our website or services.
              </p>

              <section>
                <h2 className="text-2xl font-heading mb-4">1. About Wellness Genius</h2>
                <p className="text-muted-foreground mb-4">
                  Wellness Genius provides AI readiness assessments, advisory services, education, and AI agent solutions across wellness, fitness, hospitality, and related sectors.
                </p>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>Website: <a href="https://www.wellnessgenius.co.uk" className="text-accent hover:underline">https://www.wellnessgenius.co.uk</a></li>
                  <li>Contact: <a href="mailto:andy@wellnessgenius.co.uk" className="text-accent hover:underline">andy@wellnessgenius.co.uk</a></li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-heading mb-4">2. Who These Services Are For</h2>
                <p className="text-muted-foreground mb-2">Our services are intended for:</p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>Businesses, organisations, and professionals</li>
                  <li>Individuals acting in a professional or commercial capacity</li>
                </ul>
                <p className="text-muted-foreground">
                  They are not intended for children or for personal consumer health, legal, or financial advice.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-heading mb-4">3. Use of the Website</h2>
                <p className="text-muted-foreground mb-2">You agree to:</p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>Use the website for lawful purposes only</li>
                  <li>Provide accurate and truthful information</li>
                  <li>Not misuse, disrupt, or attempt to gain unauthorised access to the site or systems</li>
                </ul>
                <p className="text-muted-foreground">
                  We reserve the right to restrict or suspend access if misuse is identified.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-heading mb-4">4. Services & Outputs</h2>
                
                <h3 className="text-xl font-medium mb-2">a) Informational nature</h3>
                <p className="text-muted-foreground mb-2">
                  All content, assessments, insights, and outputs (including the AI Readiness Index) are provided for informational and strategic guidance purposes only.
                </p>
                <p className="text-muted-foreground mb-2">They do not constitute:</p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>Legal advice</li>
                  <li>Financial advice</li>
                  <li>Medical or health advice</li>
                  <li>Regulatory or compliance advice</li>
                </ul>
                <p className="text-muted-foreground mb-4">
                  You remain responsible for decisions made based on our outputs.
                </p>

                <h3 className="text-xl font-medium mb-2">b) No guaranteed outcomes</h3>
                <p className="text-muted-foreground">
                  While we aim to deliver high-quality, practical outcomes, we do not guarantee specific results, performance improvements, or financial returns.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-heading mb-4">5. AI Tools & Automation</h2>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>AI-generated insights are based on information provided and defined logic models</li>
                  <li>Outputs may contain limitations or assumptions</li>
                  <li>No fully automated decision-making with legal or similarly significant effects is performed</li>
                </ul>
                <p className="text-muted-foreground">Human review is always available on request.</p>
              </section>

              <section>
                <h2 className="text-2xl font-heading mb-4">6. Intellectual Property</h2>
                <p className="text-muted-foreground mb-4">
                  All content, materials, frameworks, tools, and branding on this site are the intellectual property of Wellness Genius, unless otherwise stated.
                </p>
                <p className="text-muted-foreground mb-2">You may not:</p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>Copy, reproduce, or distribute content without permission</li>
                  <li>Use our materials for competing commercial purposes</li>
                </ul>
                <p className="text-muted-foreground">
                  Clients retain ownership of their own data and internal materials.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-heading mb-4">7. Payment & Commercial Terms</h2>
                <p className="text-muted-foreground mb-2">Where services are paid:</p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>Fees, scope, and timelines will be agreed in writing</li>
                  <li>Invoices must be paid in accordance with agreed terms</li>
                  <li>Late payment may result in suspension of services</li>
                </ul>
                <p className="text-muted-foreground">
                  Specific commercial terms will override these general Terms where agreed.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-heading mb-4">8. Limitation of Liability</h2>
                <p className="text-muted-foreground mb-2">To the fullest extent permitted by law:</p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>Wellness Genius is not liable for indirect, incidental, or consequential losses</li>
                  <li>Our total liability is limited to the fees paid for the relevant service</li>
                </ul>
                <p className="text-muted-foreground">
                  Nothing in these Terms limits liability where it cannot legally be excluded.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-heading mb-4">9. Third-Party Services</h2>
                <p className="text-muted-foreground">
                  We may link to or integrate with third-party tools (e.g. scheduling, analytics, CRM platforms). We are not responsible for the content, availability, or practices of third-party services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-heading mb-4">10. Termination</h2>
                <p className="text-muted-foreground mb-2">We may suspend or terminate access to services if:</p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>These Terms are breached</li>
                  <li>Misuse or unlawful activity is identified</li>
                </ul>
                <p className="text-muted-foreground">You may stop using the services at any time.</p>
              </section>

              <section>
                <h2 className="text-2xl font-heading mb-4">11. Governing Law</h2>
                <p className="text-muted-foreground">
                  These Terms are governed by the laws of England and Wales. Any disputes will be subject to the exclusive jurisdiction of the English courts.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-heading mb-4">12. Contact</h2>
                <p className="text-muted-foreground">
                  For questions regarding these Terms:{" "}
                  <a href="mailto:andy@wellnessgenius.co.uk" className="text-accent hover:underline">
                    andy@wellnessgenius.co.uk
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
