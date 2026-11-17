import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const EMBED_ORIGIN = "https://wellness-genius-cv-score.lovable.app";
const HEIGHT_TYPES = new Set(["wg-cv-score:height", "cv-score-height"]);

function heightFromMessage(data: unknown): number | null {
  if (typeof data === "number" && Number.isFinite(data) && data > 0) return Math.ceil(data);
  if (!data || typeof data !== "object") return null;
  const record = data as { type?: unknown; height?: unknown };
  if (typeof record.height !== "number" || !Number.isFinite(record.height) || record.height <= 0) return null;
  if (record.type != null && (typeof record.type !== "string" || !HEIGHT_TYPES.has(record.type))) return null;
  return Math.ceil(record.height);
}

const CvScore = () => {
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== EMBED_ORIGIN) return;
      const next = heightFromMessage(event.data);
      if (next) setHeight(next);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Score your CV | Wellness Genius</title>
        <meta
          name="description"
          content="Score your CV for hospitality, fitness and wellness roles. Upload a CV and get a score out of 10, with the fixes to make first."
        />
        <link rel="canonical" href="https://wellnessgenius.co.uk/cv-score" />
      </Helmet>
      <Header />
      <main className="pt-24 pb-16">
        <section className="container-narrow px-6 pb-8">
          <h1 className="text-4xl md:text-5xl mb-4">Score your CV for hospitality, fitness and wellness roles</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            For people working in hotels, spas, gyms, clinics and clubs. Upload a CV and get a score out of 10, with the fixes to make first.
          </p>
        </section>
        <iframe
          src={EMBED_ORIGIN}
          title="CV Score for hospitality, fitness and wellness roles"
          allow="clipboard-write"
          loading="eager"
          className={`block w-full border-0 bg-background ${height ? "" : "min-h-[1200px] md:min-h-[900px]"}`}
          style={height ? { height: `${height}px`, minHeight: `${height}px` } : undefined}
        />
        <p className="container-narrow px-6 pt-4 text-sm">
          <a
            href={EMBED_ORIGIN}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Open in a new tab
          </a>
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default CvScore;
