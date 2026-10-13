import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Quote } from "lucide-react";
import HubLayout from "@/components/hub/HubLayout";
import LeadForm from "@/components/hub/LeadForm";
import BriefingCover from "@/components/hub/BriefingCover";
import { getIssue } from "@/data/briefingIssues";

const BriefingIssue = () => {
  const { slug } = useParams();
  const issue = getIssue(slug);
  if (!issue) return <Navigate to="/briefing" replace />;

  return (
    <HubLayout title={issue.title} description={issue.summary}>
      <article className="container-wide px-6 lg:px-12 max-w-3xl">
        <Link to="/briefing" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft size={14} /> All issues
        </Link>
        <p className="text-sm text-muted-foreground mb-2">
          {new Date(issue.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </p>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">{issue.title}</h1>
        <BriefingCover image={issue.image} title={issue.title} className="rounded-xl mb-6 aspect-[1200/630]" />
        <p className="text-lg text-muted-foreground mb-6">{issue.summary}</p>

        {issue.audioUrl && (
          <div className="bg-card border border-border rounded-xl p-4 mb-8">
            <p className="text-sm font-medium mb-2">{issue.audioTitle || "Listen to the audio snippet"}</p>
            <audio controls preload="none" src={issue.audioUrl} className="w-full" />
          </div>
        )}

        {issue.keyTakeaways && issue.keyTakeaways.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Key takeaways</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              {issue.keyTakeaways.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </section>
        )}

        {issue.quotes && issue.quotes.length > 0 && (
          <section className="mb-8 space-y-3">
            <h2 className="text-xl font-semibold mb-3">Quotes</h2>
            {issue.quotes.map((q) => (
              <blockquote key={q} className="border-l-4 border-accent pl-4 italic text-sm flex gap-2">
                <Quote size={14} className="text-accent shrink-0 mt-1" />{q}
              </blockquote>
            ))}
          </section>
        )}

        <a href={issue.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-medium text-accent hover:underline mb-12">
          Read the full issue on LinkedIn <ExternalLink size={14} />
        </a>

        <LeadForm source={`briefing-${issue.slug}`} />
      </article>
    </HubLayout>
  );
};

export default BriefingIssue;
