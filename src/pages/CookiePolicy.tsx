import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { openCookiePreferences } from "@/components/CookieConsent";

const CookiePolicy = () => {
  const lastUpdated = "21 December 2025";

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

                <h3 className="text-xl font-medium mb-2">a) Essential Cookies</h3>
                <p className="text-muted-foreground mb-2">
                  These cookies are required for the website to function properly and cannot be disabled.
                </p>
                <p className="text-muted-foreground mb-2">Examples:</p>
                <ul className="list-disc pl-6 text-muted-foreground mb-6">
                  <li>Authentication and session management</li>
                  <li>Cookie consent preferences</li>
                  <li>Security features</li>
                </ul>

                <h3 className="text-xl font-medium mb-2">b) Analytics Cookies (Optional)</h3>
                <p className="text-muted-foreground mb-2">
                  These cookies help us understand how visitors use our website so we can improve it.
                </p>
                <p className="text-muted-foreground mb-2">Examples:</p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>Page views and interaction patterns</li>
                  <li>Traffic sources and referrers</li>
                  <li>Site performance metrics</li>
                </ul>
                <p className="text-muted-foreground mb-6">
                  We use privacy-friendly analytics tools where possible. These cookies are only used with your consent.
                </p>

                <h3 className="text-xl font-medium mb-2">c) Marketing Cookies (Optional)</h3>
                <p className="text-muted-foreground mb-2">
                  These cookies may be used to track visitors across websites to display relevant content.
                </p>
                <p className="text-muted-foreground mb-6">
                  We currently do not use advertising or behavioural targeting cookies. If this changes, we will update this policy.
                </p>

                <h3 className="text-xl font-medium mb-2">d) Functional Cookies (Optional)</h3>
                <p className="text-muted-foreground mb-2">Used to remember preferences such as:</p>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>Theme preferences (light/dark mode)</li>
                  <li>Language settings</li>
                  <li>Previously entered form data</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-heading mb-4">3. Cookies We Do Not Use</h2>
                <p className="text-muted-foreground mb-2">We do not:</p>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>Use advertising or behavioural targeting cookies</li>
                  <li>Sell or share cookie data with advertisers</li>
                  <li>Use cookies to build profiles for targeted advertising</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-heading mb-4">4. Managing Cookie Preferences</h2>
                <p className="text-muted-foreground mb-4">You can:</p>
                <ul className="list-disc pl-6 text-muted-foreground mb-4">
                  <li>Accept or reject non-essential cookies via our cookie banner</li>
                  <li>Customise which categories of cookies you accept</li>
                  <li>Change or withdraw consent at any time</li>
                  <li>Manage cookies through your browser settings</li>
                </ul>
                <p className="text-muted-foreground mb-4">
                  Disabling cookies may affect site functionality.
                </p>
                <Button 
                  variant="outline" 
                  onClick={openCookiePreferences}
                  className="gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Manage Cookie Preferences
                </Button>
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
