import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import HubLayout from "@/components/hub/HubLayout";
import { SECTORS } from "@/data/sectors";

const SectorsIndex = () => (
  <HubLayout title="By sector" description="Free AI and wellness intelligence for hotels and spas, fitness operators, clinics and country clubs.">
    <div className="container-wide px-6 lg:px-12 max-w-5xl">
      <h1 className="text-3xl lg:text-5xl font-bold tracking-tight mb-4">Choose your sector</h1>
      <p className="text-lg text-muted-foreground mb-10">Curated free resources for your type of business.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {SECTORS.map((s) => (
          <Link key={s.slug} to={`/sectors/${s.slug}`} className="bg-card border border-border rounded-xl p-6 hover:border-accent transition-colors">
            <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">{s.name}<ArrowRight size={14} /></h2>
            <p className="text-sm text-muted-foreground">{s.intro}</p>
          </Link>
        ))}
      </div>
    </div>
  </HubLayout>
);

export default SectorsIndex;
