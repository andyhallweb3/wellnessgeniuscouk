import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import HubLayout from "@/components/hub/HubLayout";
import LeadForm from "@/components/hub/LeadForm";
import EmailGateModal from "@/components/EmailGateModal";

// These four PDFs are generated in the browser by EmailGateModal, so they work without any backend function.
const DOWNLOADS = [
  { id: "structured-ai-ebook", name: "How to Structure AI in Your Wellness Business", description: "30 page guide covering data, process, risk and people." },
  { id: "reality-checklist", name: "90-Day AI Reality Checklist", description: "One page checklist to plan your first 90 days with AI." },
  { id: "myths-deck", name: "The Wellness AI Myths Deck", description: "10 slides that cut through AI hype. Good for exec teams." },
  { id: "quick-check-lite", name: "AI Readiness Quick Check", description: "Ten questions to sense check your AI readiness." },
];

const LINKS = [
  { label: "News and Operator Intel", href: "/news", description: "The week's news, filtered for operators." },
  { label: "Articles", href: "/insights", description: "Practical articles and guides." },
  { label: "Andy's Briefing", href: "/briefing", description: "Archive of Andy Hall's LinkedIn newsletter." },
  { label: "AI Readiness Score", href: "/ai-readiness", description: "Free assessment with your score by pillar." },
  { label: "Privacy Readiness Check", href: "/privacy-readiness", description: "Check your data and AI privacy basics." },
  { label: "Privacy Playbook", href: "/privacy-playbook", description: "Guidance on data, consent and AI." },
];

const Resources = () => {
  const [gate, setGate] = useState<{ id: string; name: string } | null>(null);
  return (
    <HubLayout title="Free resources" description="Free playbooks, checklists and tools for wellness, hospitality and fitness leaders.">
      <div className="container-wide px-6 lg:px-12 max-w-5xl">
        <h1 className="text-3xl lg:text-5xl font-bold tracking-tight mb-4">Free resources</h1>
        <p className="text-lg text-muted-foreground mb-10">Everything here is free. Downloads just need your email.</p>

        <h2 className="text-xl font-semibold mb-4">Downloads</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {DOWNLOADS.map((d) => (
            <div key={d.id} className="bg-card border border-border rounded-xl p-5 flex flex-col">
              <h3 className="font-semibold mb-1">{d.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 flex-1">{d.description}</p>
              <Button variant="outline" size="sm" onClick={() => setGate({ id: d.id, name: d.name })} className="self-start gap-2">
                <Download size={14} /> Free download
              </Button>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-semibold mb-4">Read and use</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {LINKS.map((l) => (
            <Link key={l.href} to={l.href} className="bg-card border border-border rounded-xl p-5 hover:border-accent transition-colors">
              <h3 className="font-semibold mb-1 flex items-center gap-2">{l.label}<ArrowRight size={14} /></h3>
              <p className="text-sm text-muted-foreground">{l.description}</p>
            </Link>
          ))}
        </div>

        <LeadForm source="resources" />
      </div>
      {gate && (
        <EmailGateModal isOpen onClose={() => setGate(null)} productId={gate.id} productName={gate.name} downloadUrl="" />
      )}
    </HubLayout>
  );
};

export default Resources;
