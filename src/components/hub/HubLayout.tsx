import { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const HubLayout = ({ title, description, children }: { title: string; description: string; children: ReactNode }) => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>{title} | Wellness Genius</title>
      <meta name="description" content={description} />
    </Helmet>
    <Header />
    <main className="pt-24 pb-16">{children}</main>
    <Footer />
  </div>
);

export default HubLayout;
