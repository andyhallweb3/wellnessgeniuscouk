import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";
import HubLayout from "@/components/hub/HubLayout";
import LeadForm from "@/components/hub/LeadForm";
import SectorNews from "@/components/hub/SectorNews";
import { getSector, SECTORS } from "@/data/sectors";
import { sortedIssues } from "@/data/briefingIssues";

const SectorPage = () => {
  const { slug } = useParams();
  const sector = getSector(slug);
  if (!sector) return <Navigate to="/sectors" replace />;
  const issues = sortedIssues().filter((i) => !i.sectors || i.sectors.includes(sector.slug)).slice(0, 3);

  return (
    <HubLayout title={sector.headline} description={sector.intro}>
      <div className="container-wide px-4 lg:px-12 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-accent">{sector.name}</p>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">{sector.headline}</h1>
          </div>
          <a href="#briefing" className="shrink-0 self-start sm:self-auto text-xs sm:text-sm font-semibold text-accent hover:underline">Get the free briefing</a>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 mb-4">
          {sector.resources.map((r) => (
            <Link key={r.href} to={r.href} className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs sm:text-sm bg-secondary text-muted-foreground hover:text-foreground transition-colors">
              {r.label}<ArrowRight size={12} />
            </Link>
          ))}
        </div>

        <SectorNews sector={sector.slug} name={sector.name} limit={12} signupAfter={6} signupSource={`sector-${sector.slug}-inline`} />

        <p className="text-muted-foreground mb-8 max-w-2xl">{sector.intro}</p>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-xl font-semibold mb-4">What we hear from {sector.name.toLowerCase()}</h2>
            <ul className="space-y-3">
              {sector.challenges.map((c) => (
                <li key={c} className="flex gap-3 text-sm"><CheckCircle size={16} className="text-accent mt-0.5 shrink-0" />{c}</li>
              ))}
            </ul>
          </div>
          <div id="briefing" className="scroll-mt-24">
            <LeadForm source={`sector-${sector.slug}`} title={`Get the free ${sector.name} briefing`} />
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">Start here</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {sector.resources.map((r) => (
            <Link key={r.href} to={r.href} className="bg-card border border-border rounded-xl p-5 hover:border-accent transition-colors">
              <h3 className="font-semibold mb-1 flex items-center gap-2">{r.label}<ArrowRight size={14} /></h3>
              <p className="text-sm text-muted-foreground">{r.description}</p>
            </Link>
          ))}
        </div>

        {issues.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-4">From Andy's Briefing</h2>
            <ul className="space-y-2 mb-12">
              {issues.map((i) => (
                <li key={i.slug}><Link to={`/briefing/${i.slug}`} className="text-accent hover:underline">{i.title}</Link></li>
              ))}
            </ul>
          </>
        )}

        <p className="text-sm text-muted-foreground">
          Other sectors:{" "}
          {SECTORS.filter((s) => s.slug !== sector.slug).map((s, idx) => (
            <span key={s.slug}>{idx > 0 && ", "}<Link to={`/sectors/${s.slug}`} className="underline">{s.name}</Link></span>
          ))}
        </p>
      </div>
    </HubLayout>
  );
};

export default SectorPage;
