import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  const lastUpdated = "21 December 2024";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl lg:text-4xl font-heading mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground mb-8">Last updated: {lastUpdated}</p>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
              <p className="text-lg text-muted-foreground">
                Wellness Genius ("we", "us", "our") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and protect your information when you visit our website, use our tools (including the AI Readiness Index), or engage with our services.
              </p>
              <p className="text-muted-foreground">
                This policy is written in accordance with the UK GDPR, EU GDPR, and applicable data protection laws.
              </p>

              <section>
                <h2 className="text-2xl font-heading mb-4">1. Who We Are</h2>
                <p className="text-muted-foreground mb-4">
                  Wellness Genius provides AI readiness assessments, advisory services, education, and AI agent solutions across wellness, fitness, hospitality, and related sectors.
                </p>
                <p className="text-muted-foreground">
                  If you have any questions about this policy or how we handle your data, you can contact us at:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mt-2">
                  <li>Email: <a href="mailto:andy@wellnessgenius.co.uk" className="text-accent hover:underline">andy@wellnessgenius.co.uk</a></li>
                  <li>Website: <a href="https://www.wellnessgenius.ai" className="text-accent hover:underline">https://www.wellnessgenius.ai</a></li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-heading mb-4">2. What Data We Collect</h2>
                <p className="text-muted-foreground mb-4">We only collect data that is necessary, relevant, and proportionate.</p>
                
                <h3 className="text-xl font-medium mb-2">a) Information you provide directly</h3>
                <p className="text-muted-foreground mb-2">This includes:</p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>Name</li>
                  <li>Email address</li>
                  <li>Company name</li>
                  <li>Job title / role</li>
                  <li>Responses to surveys or assessments (e.g. AI Readiness Index)</li>
                  <li>Information submitted via contact forms or booking forms</li>
                </ul>

                <h3 className="text-xl font-medium mb-2">b) Automatically collected data</h3>
                <p className="text-muted-foreground mb-2">When you visit our website, we may collect:</p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>IP address (anonymised where possible)</li>
                  <li>Browser type and device information</li>
                  <li>Pages visited and time spent on site</li>
                  <li>Referring source (e.g. LinkedIn)</li>
                </ul>
                <p className="text-muted-foreground">
                  We do not collect sensitive personal data unless explicitly agreed and required for a specific service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-heading mb-4">3. How We Use Your Data</h2>
                <p className="text-muted-foreground mb-2">We use your data to:</p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>Provide and operate our website, tools, and services</li>
                  <li>Deliver AI readiness assessments and personalised insights</li>
                  <li>Respond to enquiries and schedule calls</li>
                  <li>Send relevant communications (where consent has been given)</li>
                  <li>Improve our services and user experience</li>
                  <li>Meet legal, regulatory, and contractual obligations</li>
                </ul>
                <p className="text-muted-foreground font-medium">We do not sell your personal data.</p>
              </section>

              <section>
                <h2 className="text-2xl font-heading mb-4">4. Legal Basis for Processing</h2>
                <p className="text-muted-foreground mb-2">Under GDPR, we process your data based on one or more of the following lawful bases:</p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li><strong>Consent</strong> – where you have explicitly agreed (e.g. newsletters, assessments)</li>
                  <li><strong>Legitimate interest</strong> – to run and improve our business responsibly</li>
                  <li><strong>Contractual necessity</strong> – where processing is required to deliver a service</li>
                  <li><strong>Legal obligation</strong> – where required by law</li>
                </ul>
                <p className="text-muted-foreground">You may withdraw consent at any time.</p>
              </section>

              <section>
                <h2 className="text-2xl font-heading mb-4">5. AI Readiness Index & Automated Insights</h2>
                <p className="text-muted-foreground mb-4">
                  Our AI Readiness Index provides rule-based and insight-led outputs based on your responses.
                </p>
                <p className="text-muted-foreground mb-2"><strong>Important:</strong></p>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>Results are informational, not legal, financial, or compliance advice</li>
                  <li>No fully automated decision-making with legal or significant effects is performed</li>
                  <li>Human review is always available on request</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-heading mb-4">5a. AI Coach & Newsletter Services</h2>
                <p className="text-muted-foreground mb-4">
                  When you use our AI Coach feature or subscribe to our newsletter, we collect and process additional data:
                </p>
                <h3 className="text-xl font-medium mb-2">AI Coach</h3>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>Chat messages and prompts you submit</li>
                  <li>Business profile information you provide during onboarding</li>
                  <li>Documents you upload for context (stored securely and only accessible to you)</li>
                  <li>Usage data including credit consumption and session history</li>
                </ul>
                <p className="text-muted-foreground mb-4">
                  AI Coach responses are generated using third-party AI services. Your prompts are sent to these services for processing but are not used to train their models. We retain chat history to improve your experience and for quality assurance.
                </p>
                <h3 className="text-xl font-medium mb-2">Newsletter</h3>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>Email address and name (if provided)</li>
                  <li>Subscription source and date</li>
                  <li>Email engagement metrics (opens, clicks) for service improvement</li>
                  <li>IP address at time of subscription</li>
                </ul>
                <p className="text-muted-foreground">
                  You can unsubscribe from our newsletter at any time using the link in any email or by contacting us directly.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-heading mb-4">6. Data Sharing & Third Parties</h2>
                <p className="text-muted-foreground mb-2">
                  We may share limited data with trusted service providers strictly for operational purposes, including:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>Email delivery services (Resend)</li>
                  <li>AI processing services (Google Gemini, OpenAI via Lovable AI)</li>
                  <li>Payment processing (Stripe)</li>
                  <li>Database and hosting (Supabase, Lovable)</li>
                  <li>Scheduling tools (e.g. Calendly)</li>
                  <li>Analytics providers (privacy-friendly where possible)</li>
                </ul>
                <p className="text-muted-foreground">
                  All third parties are required to meet appropriate data protection standards.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-heading mb-4">7. International Data Transfers</h2>
                <p className="text-muted-foreground mb-2">
                  Where data is transferred outside the UK or EEA, we ensure appropriate safeguards are in place, such as:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>UK/EU adequacy decisions</li>
                  <li>Standard Contractual Clauses (SCCs)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-heading mb-4">8. Data Retention</h2>
                <p className="text-muted-foreground mb-2">We retain personal data only for as long as necessary:</p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>Leads and enquiries: up to 24 months</li>
                  <li>Assessment data: up to 24 months (or earlier on request)</li>
                  <li>Contractual data: as required by law</li>
                </ul>
                <p className="text-muted-foreground">You may request deletion at any time.</p>
              </section>

              <section>
                <h2 className="text-2xl font-heading mb-4">9. Your Rights</h2>
                <p className="text-muted-foreground mb-2">You have the right to:</p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>Access your personal data</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion ("right to be forgotten")</li>
                  <li>Restrict or object to processing</li>
                  <li>Withdraw consent</li>
                  <li>Request data portability</li>
                </ul>
                <p className="text-muted-foreground mb-4">
                  To exercise your rights, contact us at{" "}
                  <a href="mailto:andy@wellnessgenius.co.uk" className="text-accent hover:underline">
                    andy@wellnessgenius.co.uk
                  </a>.
                </p>
                <p className="text-muted-foreground">
                  You also have the right to lodge a complaint with the Information Commissioner's Office (ICO) in the UK.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-heading mb-4">10. Cookies & Analytics</h2>
                <p className="text-muted-foreground mb-2">We use cookies to:</p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>Ensure the website functions correctly</li>
                  <li>Understand how visitors use our site</li>
                  <li>Improve performance and content</li>
                </ul>
                <p className="text-muted-foreground">
                  Non-essential cookies are only used with your consent. You can manage preferences via our cookie banner.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-heading mb-4">11. Security</h2>
                <p className="text-muted-foreground mb-2">
                  We take appropriate technical and organisational measures to protect your data, including:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>Secure hosting and access controls</li>
                  <li>Encrypted data transmission</li>
                  <li>Regular reviews of systems and permissions</li>
                </ul>
                <p className="text-muted-foreground">
                  No system is 100% secure, but we take security seriously and act responsibly.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-heading mb-4">12. Changes to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time. Any changes will be published on this page with an updated revision date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-heading mb-4">13. Contact Us</h2>
                <p className="text-muted-foreground mb-2">
                  If you have questions about this policy or how your data is handled:
                </p>
                <p className="text-muted-foreground">
                  Email:{" "}
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

export default PrivacyPolicy;
