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
}

/** 16:9 news image with a branded per-sector fallback for missing or broken images. */
const NewsImage = ({ src, alt, sectors, className = "", imgClassName = "" }: Props) => {
  const [failed, setFailed] = useState(false);
  const url = proxiedImageUrl(src);
  const style = (sectors && sectors.map((s) => SECTOR_STYLE[s]).find(Boolean)) || DEFAULT_STYLE;

  return (
    <div className={`relative aspect-video w-full overflow-hidden bg-secondary ${className}`}>
      {url && !failed ? (
        <img
          src={url}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`}
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex flex-col justify-end p-4"
          style={{ background: `linear-gradient(135deg, ${style.from}, ${style.to})` }}
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/70">Wellness Genius</span>
          <span className="text-lg font-semibold text-white leading-tight">{style.label}</span>
        </div>
      )}
    </div>
  );
};

export default NewsImage;
