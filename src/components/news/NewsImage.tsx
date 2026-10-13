import { useState } from "react";

const SECTOR_STYLE: Record<string, { label: string; from: string; to: string }> = {
  "hotels-spas": { label: "Hotels & Spas", from: "#0f3d3e", to: "#1f7a6f" },
  fitness: { label: "Fitness", from: "#1e2a5a", to: "#3b5bdb" },
  clinics: { label: "Clinics", from: "#3d1f4a", to: "#8e44ad" },
  "country-clubs": { label: "Country Clubs", from: "#1f3d1f", to: "#4c8c3a" },
};
const DEFAULT_STYLE = { label: "Wellness Genius", from: "#141821", to: "#2b3445" };

export function proxiedImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  return `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/image-proxy?url=${encodeURIComponent(imageUrl)}`;
}

interface Props {
  src: string | null | undefined;
  alt: string;
  sectors?: string[] | null;
  className?: string;
  imgClassName?: string;
  /** "banner" = 16:9 block; "thumb" = fills a fixed-size box set by className */
  variant?: "banner" | "thumb";
}

/**
 * News image: loads via image-proxy, falls back to the direct URL (no referrer),
 * then to a subtle per-sector placeholder.
 */
const NewsImage = ({ src, alt, sectors, className = "", imgClassName = "", variant = "banner" }: Props) => {
  const [stage, setStage] = useState(0);
  const candidates = [proxiedImageUrl(src), src || null].filter(Boolean) as string[];
  const url = candidates[stage];
  const style = (sectors && sectors.map((s) => SECTOR_STYLE[s]).find(Boolean)) || DEFAULT_STYLE;
  const box = variant === "banner" ? "aspect-video w-full" : "";

  return (
    <div className={`relative overflow-hidden bg-secondary ${box} ${className}`}>
      {url ? (
        <img
          key={url}
          src={url}
          alt={alt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setStage((n) => n + 1)}
          className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`}
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-end p-2 opacity-60"
          style={{ background: `linear-gradient(135deg, ${style.from}, ${style.to})` }}
        >
          {variant === "banner" && (
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/80">{style.label}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default NewsImage;
