import Link from "next/link";
import { MARKETING_IMAGES } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { MarketingImage } from "@/components/marketing/marketing-image";

type ProgramCardProps = {
  name: string;
  tagline: string;
};

export function ProgramCard({ name, tagline }: ProgramCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-blue/30 bg-kaizen-dark transition-all hover:border-gold/40">
      <div className="relative h-36 shrink-0 overflow-hidden">
        <MarketingImage
          src={MARKETING_IMAGES.programs}
          alt={name}
          fill
          className="opacity-60 transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-kaizen-dark to-transparent" />
        <h2 className="absolute bottom-3 left-3 right-3 font-display text-base font-bold text-gold">{name}</h2>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="min-h-[4.5rem] flex-1 text-sm leading-relaxed text-kaizen-muted line-clamp-3">{tagline}</p>
        <Button asChild variant="gold" size="sm" className="mt-4 w-full shrink-0">
          <Link href="/enroll">Enroll Now</Link>
        </Button>
      </div>
    </article>
  );
}
