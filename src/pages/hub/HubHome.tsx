import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Newspaper, BookOpen, Gauge, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FounderSection from "@/components/FounderSection";
import Contact from "@/components/Contact";
import LeadForm from "@/components/hub/LeadForm";
import { SECTORS } from "@/data/sectors";
import SectorNews from "@/components/hub/SectorNews";

const PILLARS = [
  { icon: Newspaper, label: "All news", href: "/news", text: "What changed this week and why it matters." },
  { icon: BookOpen, label: "Articles and resources", href: "/resources", text: "Free playbooks, guides and checklists." },
  { icon: Gauge, label: "AI Readiness Score", href: "/ai-readiness", text: "Free assessment. Know where you stand." },
  { icon: Mic, label: "Andy's Briefing", href: "/briefing", text: "Thought leadership from Andy Hall." },
];

const HubHome = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>Wellness Genius | Free AI and wellness intelligence for hospitality, fitness and clinics</title>
      <meta name="description" content="Free news, articles, playbooks and an AI Readiness Score for hotels and spas, fitness operators, wellness clinics and country clubs." />
    </Helmet>
    <Header />
    <main className="pt-20 lg:pt-24">
      <section className="container-wide px-4 lg:px-12 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            Free wellness and AI news for hotels, spas, gyms, clinics and clubs.
          </h1>
          <Button variant="accent" size="sm" asChild className="self-start sm:self-auto shrink-0">
            <a href="#briefing">Get the free briefing <ArrowRight size={14} /></a>
          </Button>
        </div>
      </section>

      <nav aria-label="Explore" className="container-wide px-4 lg:px-12 pb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
          {SECTORS.map((s) => (
            <Link key={s.slug} to={`/sectors/${s.slug}`} className="shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-card border border-border hover:border-accent transition-colors">
              {s.name}
            </Link>
          ))}
          <span className="shrink-0 w-px h-6 bg-border mx-1 self-center" aria-hidden="true" />
          {PILLARS.map(({ icon: Icon, label, href }) => (
            <Link key={href} to={href} className="shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm bg-secondary text-muted-foreground hover:text-foreground transition-colors">
              <Icon size={14} className="text-accent" />{label}
            </Link>
          ))}
        </div>
      </nav>

      <section className="container-wide px-4 lg:px-12">
        <SectorNews name="" heading="Latest news" limit={12} signupAfter={6} signupSource="homepage-inline" />
      </section>

      <section id="briefing" className="pb-16 container-wide px-4 lg:px-12 max-w-3xl scroll-mt-24">
        <LeadForm source="homepage" />
      </section>

      <FounderSection />
      <Contact />
    </main>
    <Footer />
  </div>
);

export default HubHome;
