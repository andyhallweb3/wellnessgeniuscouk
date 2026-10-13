import { Link } from "react-router-dom";
import { ExternalLink, Headphones } from "lucide-react";
import HubLayout from "@/components/hub/HubLayout";
import LeadForm from "@/components/hub/LeadForm";
import { LINKEDIN_NEWSLETTER_URL, sortedIssues } from "@/data/briefingIssues";

const formatDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

const Briefing = () => {
  const issues = sortedIssues();
  return (
    <HubLayout title="Andy's Briefing" description="Thought leadership from Andy Hall on wellness, hospitality and AI. Archive of the Wellness, Web3 and AI LinkedIn newsletter.">
      <div className="container-wide px-6 lg:px-12 max-w-4xl">
        <p className="text-sm font-semibold text-accent mb-2">Thought leadership</p>
        <h1 className="text-3xl lg:text-5xl font-bold tracking-tight mb-4">Andy's Briefing</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Every issue of Andy Hall's LinkedIn newsletter, Wellness, Web3 and AI, in one place.
        </p>
        <a href={LINKEDIN_NEWSLETTER_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-accent hover:underline mb-10">
          Subscribe on LinkedIn <ExternalLink size={14} />
        </a>

        <div className="space-y-4 mb-12">
          {issues.map((i) => (
            <Link key={i.slug} to={`/briefing/${i.slug}`} className="block bg-card border border-border rounded-xl p-6 hover:border-accent transition-colors">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-2">
                {formatDate(i.date)}
                {i.audioUrl && <span className="inline-flex items-center gap-1 text-accent"><Headphones size={12} />Audio</span>}
              </p>
              <h2 className="text-lg font-semibold mb-1">{i.title}</h2>
              <p className="text-sm text-muted-foreground">{i.summary}</p>
            </Link>
          ))}
          {issues.length === 0 && <p className="text-muted-foreground">Issues coming soon.</p>}
        </div>

        <LeadForm source="briefing" />
      </div>
    </HubLayout>
  );
};

export default Briefing;
