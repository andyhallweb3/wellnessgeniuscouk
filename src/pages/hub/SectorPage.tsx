import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";
import HubLayout from "@/components/hub/HubLayout";
import LeadForm from "@/components/hub/LeadForm";
import { getSector, SECTORS } from "@/data/sectors";
import { sortedIssues } from "@/data/briefingIssues";

const SectorPage = () => {
  const { slug } = useParams();
  const sector = getSector(slug);
  if (!sector) return <Navigate to="/sectors" replace />;
  const issues = sortedIssues().filter((i) => !i.sectors || i.sectors.includes(sector.slug)).slice(0, 3);

  return (
    <HubLayout title={sector.headline} description={sector.intro}>
      <div className="container-wide px-6 lg:px-12 max-w-5xl">
        <p className="text-sm font-semibold text-accent mb-2">{sector.name}</p>
        <h1 className="text-3xl lg:text-5xl font-bold tracking-tight mb-4">{sector.headline}</h1>
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl">{sector.intro}</p>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-xl font-semibold mb-4">What we hear from {sector.name.toLowerCase()}</h2>
            <ul className="space-y-3">
              {sector.challenges.map((c) => (
                <li key={c} className="flex gap-3 text-sm"><CheckCircle size={16} className="text-accent mt-0.5 shrink-0" />{c}</li>
              ))}
            </ul>
          </div>
          <LeadForm source={`sector-${sector.slug}`} title={`Get the free ${sector.name} briefing`} />
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
