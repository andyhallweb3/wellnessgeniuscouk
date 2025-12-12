import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CookiePolicy = () => {
  const lastUpdated = "12 December 2024";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl lg:text-4xl font-heading mb-4">Cookie Policy</h1>
            <p className="text-muted-foreground mb-8">Last updated: {lastUpdated}</p>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
              <p className="text-lg text-muted-foreground">
                This Cookie Policy explains how Wellness Genius uses cookies and similar technologies on our website.
              </p>

              <section>
                <h2 className="text-2xl font-heading mb-4">1. What Are Cookies?</h2>
                <p className="text-muted-foreground">
                  Cookies are small text files placed on your device to help websites function, improve user experience, and provide insights into usage.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-heading mb-4">2. Types of Cookies We Use</h2>

                <h3 className="text-xl font-medium mb-2">a) Strictly Necessary Cookies</h3>
                <p className="text-muted-foreground mb-2">
                  These cookies are required for the website to function properly and cannot be disabled.
                </p>
                <p className="text-muted-foreground mb-2">Examples:</p>
                <ul className="list-disc pl-6 text-muted-foreground mb-6">
                  <li>Page navigation</li>
                  <li>Form submissions</li>
                  <li>Security and consent management</li>
                </ul>

                <h3 className="text-xl font-medium mb-2">b) Analytics Cookies (Optional)</h3>
                <p className="text-muted-foreground mb-2">
                  These cookies help us understand how visitors use our website so we can improve it.
                </p>
                <p className="text-muted-foreground mb-2">Examples:</p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>Page views and interaction patterns</li>
                  <li>Traffic sources</li>
                </ul>
                <p className="text-muted-foreground mb-6">
                  We use privacy-friendly analytics tools where possible. These cookies are only used with your consent.
                </p>

                <h3 className="text-xl font-medium mb-2">c) Functional Cookies (Optional)</h3>
                <p className="text-muted-foreground mb-2">Used to remember preferences such as:</p>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>Language</li>
                  <li>Form inputs</li>
                  <li>Session settings</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-heading mb-4">3. Cookies We Do Not Use</h2>
                <p className="text-muted-foreground mb-2">We do not:</p>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>Use advertising or behavioural targeting cookies</li>
                  <li>Sell or share cookie data with advertisers</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-heading mb-4">4. Managing Cookie Preferences</h2>
                <p className="text-muted-foreground mb-2">You can:</p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>Accept or reject non-essential cookies via our cookie banner</li>
                  <li>Change or withdraw consent at any time</li>
                  <li>Manage cookies through your browser settings</li>
                </ul>
                <p className="text-muted-foreground">
                  Disabling cookies may affect site functionality.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-heading mb-4">5. Third-Party Cookies</h2>
                <p className="text-muted-foreground">
                  Some third-party services we use (e.g. scheduling or analytics tools) may set their own cookies. These are governed by the third party's privacy and cookie policies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-heading mb-4">6. Updates to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Cookie Policy occasionally. Any changes will be published on this page with an updated revision date.
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

export default CookiePolicy;
