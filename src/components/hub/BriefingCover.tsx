import { Mic } from "lucide-react";

const BriefingCover = ({ image, title, className = "" }: { image?: string; title: string; className?: string }) =>
  image ? (
    <img src={image} alt="" loading="lazy" className={`w-full object-cover bg-secondary ${className}`} />
  ) : (
    <div className={`w-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 ${className}`} aria-hidden="true">
      <Mic className="text-accent" size={28} />
      <span className="sr-only">{title}</span>
    </div>
  );

export default BriefingCover;
