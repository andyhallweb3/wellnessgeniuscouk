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

const PILLARS = [
  { icon: Newspaper, label: "News and Operator Intel", href: "/news", text: "What changed this week and why it matters." },
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
    <main>
      <section className="pt-32 pb-16 container-wide px-6 lg:px-12">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-accent mb-3">Free knowledge hub</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] mb-6">
            Wellness and AI intelligence for hospitality, fitness and clinics.
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground mb-8">
            News, articles, playbooks and a free AI Readiness Score for hotels and spas, fitness operators, wellness clinics and country clubs. Curated by Andy Hall.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="accent" size="xl" asChild><a href="#briefing">Get the free briefing <ArrowRight size={18} /></a></Button>
            <Button variant="outline" size="xl" asChild><Link to="/ai-readiness">Check your AI Readiness Score</Link></Button>
          </div>
        </div>
      </section>

      <section className="pb-16 container-wide px-6 lg:px-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PILLARS.map(({ icon: Icon, label, href, text }) => (
            <Link key={href} to={href} className="bg-card border border-border rounded-xl p-5 hover:border-accent transition-colors">
              <Icon size={20} className="text-accent mb-3" />
              <h2 className="font-semibold mb-1">{label}</h2>
              <p className="text-sm text-muted-foreground">{text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="pb-16 container-wide px-6 lg:px-12">
        <h2 className="text-2xl font-semibold mb-4">Find resources for your sector</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SECTORS.map((s) => (
            <Link key={s.slug} to={`/sectors/${s.slug}`} className="bg-secondary/40 rounded-xl p-5 hover:bg-secondary/70 transition-colors">
              <h3 className="font-semibold mb-1 flex items-center gap-2">{s.name}<ArrowRight size={14} /></h3>
              <p className="text-sm text-muted-foreground">{s.challenges[0]}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="briefing" className="pb-20 container-wide px-6 lg:px-12 max-w-3xl scroll-mt-24">
        <LeadForm source="homepage" />
      </section>

      <FounderSection />
      <Contact />
    </main>
    <Footer />
  </div>
);

export default HubHome;
