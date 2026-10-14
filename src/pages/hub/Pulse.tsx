import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarClock, Check } from "lucide-react";
import { toast } from "sonner";
import HubLayout from "@/components/hub/HubLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { captureLead } from "@/lib/leads";

const BOOK_CALL = "https://meetings.hubspot.com/andy-hall6/andy-hall-meeting";

type Track = "operator" | "advisor";
type Tier = "community" | "cohort" | "advisory";

const PHASES = [
  {
    letter: "P",
    name: "Pinpoint",
    when: "Days 0 to 7",
    what: "Agree the one commercial number that matters most right now, such as treatment room yield, spend per guest, membership churn or occupancy uplift. Everything that follows is judged against it.",
    engagement: "Leadership workshop or keynote",
  },
  {
    letter: "U",
    name: "Unlock",
    when: "30 days",
    what: "Deliver one AI win in one property or site, with a before and after on the metric you picked. Small, real and measured, not a pilot that never ends.",
    engagement: "Done-with-you sprint",
  },
  {
    letter: "L",
    name: "Lock in",
    when: "90 days",
    what: "Turn the win into a routine: owners, simple playbooks, training and a weekly check on the number, so it survives staff turnover and busy seasons.",
    engagement: "Coaching and playbooks",
  },
  {
    letter: "S",
    name: "Scale",
    when: "Quarterly",
    what: "Roll what worked across the estate in a planned order, with each site reporting against the same metric so you can see where it lands and where it stalls.",
    engagement: "Quarterly roll-out reviews",
  },
  {
    letter: "E",
    name: "Embed",
    when: "1 to 3 years",
    what: "Make it part of how the business runs: systems, data, supplier and partner choices, and senior ownership of AI, including a fractional Chief AI Officer where that helps.",
    engagement: "Ongoing advisory",
  },
];

const TRACKS: { key: Track; title: string; lead: string; points: string[] }[] = [
  {
    key: "operator",
    title: "For operators",
    lead: "Hotels, spas, clubs and clinics who want a measurable result, not another tool.",
    points: [
      "A done-with-you sprint built around your own commercial metric",
      "One property first, then a planned roll-out",
      "Playbooks your team keeps using after we step back",
    ],
  },
  {
    key: "advisor",
    title: "For advisors",
    lead: "Consultants, agencies and suppliers who want to deliver PULSE with their own clients.",
    points: [
      "Learn the method, templates and measurement approach",
      "Deliver it under your own client relationships",
      "A directory of certified PULSE advisors is planned for the future",
    ],
  },
];

const TIERS: { key: Tier; title: string; text: string; note?: string }[] = [
  { key: "community", title: "Community and playbook library", text: "Join peers working through PULSE, with access to the playbooks, templates and worked examples." },
  { key: "cohort", title: "Cohort coaching", text: "Work through the phases with a small group over a set period, with live sessions and accountability on your metric." },
  { key: "advisory", title: "Advisory", text: "Direct work with Andy on your business or your client portfolio.", note: "Limited spots" },
];

const FAQ = [
  { q: "How much does it cost?", a: "Pricing depends on the track, the format and the size of your estate, so we share it on a short call once we understand what you need. There is no checkout on this page." },
  { q: "Is the rest of Wellness Genius still free?", a: "Yes. News, articles, Andy's Briefing, resources and the AI Readiness Score stay free. PULSE is for teams who want hands-on help." },
  { q: "Do we need a big tech budget or a data team?", a: "No. Pinpoint starts with one metric and the systems you already have. If something new is worth buying, you will know why and what it should return." },
  { q: "Will you sell us software?", a: "No. The aim is a measurable commercial result. Tool and supplier choices are made on your terms against your metric." },
  { q: "What happens after I register interest?", a: "Andy will get in touch to understand your business and suggest the right starting point. You can also book a call straight away." },
  { q: "Can advisors become certified now?", a: "The advisor track is open for interest. A certified advisor directory is planned, and people who register interest will hear first." },
];

const InterestForm = () => {
  const [track, setTrack] = useState<Track>("operator");
  const [tier, setTier] = useState<Tier>("community");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }
    setBusy(true);
    try {
      await captureLead(email, `pulse-${track}-${tier}`, name);
      setDone(true);
    } catch {
      toast.error("Something went wrong. Please try again or book a call.");
    } finally {
      setBusy(false);
    }
  };

  const pill = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-accent"}`;

  if (done) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="font-semibold text-accent mb-2">Thanks, you are on the list.</p>
        <p className="text-sm text-muted-foreground mb-4">Andy will be in touch. If you would rather talk now, pick a time below.</p>
        <Button variant="outline" asChild><a href={BOOK_CALL} target="_blank" rel="noopener noreferrer">Book a call</a></Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2">I am</p>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Track">
          <button type="button" role="radio" aria-checked={track === "operator"} className={pill(track === "operator")} onClick={() => setTrack("operator")}>An operator</button>
          <button type="button" role="radio" aria-checked={track === "advisor"} className={pill(track === "advisor")} onClick={() => setTrack("advisor")}>An advisor</button>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2">Interested in</p>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Way to work together">
          {TIERS.map((t) => (
            <button key={t.key} type="button" role="radio" aria-checked={tier === t.key} className={pill(tier === t.key)} onClick={() => setTier(t.key)}>{t.title}</button>
          ))}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="sm:max-w-[200px]" />
        <Input type="email" required placeholder="Work email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button type="submit" variant="accent" disabled={busy}>{busy ? "Sending..." : "Register interest"}</Button>
      </div>
      <p className="text-xs text-muted-foreground">
        By registering you agree to our <a href="/privacy" className="underline">privacy policy</a>. No payment is taken.
      </p>
    </form>
  );
};

const Pulse = () => (
  <HubLayout
    title="PULSE: measurable AI for hospitality and wellness"
    description="A five-phase way for hotels, spas, clubs and clinics to get a measured commercial return from AI, from one metric to the whole estate."
  >
    <div className="container-wide px-4 lg:px-12 max-w-5xl">
      {/* Intro */}
      <section className="mb-10">
        <p className="text-xs font-semibold text-accent mb-1">Work with Andy</p>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3">PULSE: AI that earns its place</h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mb-5">
          Hotels, spas, clubs and clinics are buying AI and new technology faster than they are measuring what it returns.
          Tools get switched on, pilots drift, and nobody can say whether revenue, margin or retention moved.
          PULSE is a simple five-phase method that starts with one commercial number and only scales what moves it.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="accent" asChild><a href="#register">Register interest <ArrowRight size={16} /></a></Button>
          <Button variant="outline" asChild><a href={BOOK_CALL} target="_blank" rel="noopener noreferrer"><CalendarClock size={16} /> Book a call</a></Button>
        </div>
        <p className="text-sm text-muted-foreground mt-5">Led by Andy Hall, BSc, EMBA.</p>
      </section>

      {/* Phases */}
      <section className="mb-12" aria-labelledby="phases">
        <h2 id="phases" className="text-xl sm:text-2xl font-semibold mb-4">The five phases</h2>
        <ol className="relative border-l border-border ml-4 space-y-5">
          {PHASES.map((p) => (
            <li key={p.letter} className="pl-6 relative">
              <span className="absolute -left-4 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold" aria-hidden="true">{p.letter}</span>
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                  <h3 className="!text-lg font-semibold">{p.name}</h3>
                  <span className="text-xs font-medium text-accent">{p.when}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{p.what}</p>
                <p className="text-xs"><span className="text-muted-foreground">Engagement: </span><span className="font-semibold">{p.engagement}</span></p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Tracks */}
      <section className="mb-12" aria-labelledby="tracks">
        <h2 id="tracks" className="text-xl sm:text-2xl font-semibold mb-4">Two tracks</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {TRACKS.map((t) => (
            <div key={t.key} className="bg-card border border-border rounded-xl p-5">
              <h3 className="!text-lg font-semibold mb-1">{t.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{t.lead}</p>
              <ul className="space-y-2">
                {t.points.map((pt) => (
                  <li key={pt} className="flex gap-2 text-sm"><Check size={16} className="text-accent shrink-0 mt-0.5" />{pt}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Ways to work */}
      <section className="mb-12" aria-labelledby="ways">
        <h2 id="ways" className="text-xl sm:text-2xl font-semibold mb-1">Three ways to work together</h2>
        <p className="text-sm text-muted-foreground mb-4">Available on both tracks. Pricing is shared on a call.</p>
        <div className="grid md:grid-cols-3 gap-4">
          {TIERS.map((t) => (
            <div key={t.key} className="bg-card border border-border rounded-xl p-5 flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="!text-base font-semibold">{t.title}</h3>
                {t.note && <span className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent/15 text-accent">{t.note}</span>}
              </div>
              <p className="text-sm text-muted-foreground flex-1">{t.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Register */}
      <section id="register" className="mb-12 scroll-mt-24" aria-labelledby="register-h">
        <h2 id="register-h" className="text-xl sm:text-2xl font-semibold mb-1">Register interest</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Tell us which track and format suit you. Prefer to talk?{" "}
          <a href={BOOK_CALL} target="_blank" rel="noopener noreferrer" className="text-accent underline">Book a call with Andy</a>.
        </p>
        <InterestForm />
      </section>

      {/* FAQ */}
      <section className="mb-12" aria-labelledby="faq">
        <h2 id="faq" className="text-xl sm:text-2xl font-semibold mb-4">Questions</h2>
        <div className="space-y-2">
          {FAQ.map((f) => (
            <details key={f.q} className="group bg-card border border-border rounded-xl p-4">
              <summary className="cursor-pointer list-none font-semibold text-sm flex justify-between gap-3">
                {f.q}<span className="text-accent group-open:rotate-45 transition-transform" aria-hidden="true">+</span>
              </summary>
              <p className="text-sm text-muted-foreground mt-2">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <p className="text-sm text-muted-foreground">
        Not ready yet? Start with the free <Link to="/ai-readiness" className="underline">AI Readiness Score</Link> or the{" "}
        <Link to="/news" className="underline">latest news</Link>.
      </p>
    </div>
  </HubLayout>
);

export default Pulse;
