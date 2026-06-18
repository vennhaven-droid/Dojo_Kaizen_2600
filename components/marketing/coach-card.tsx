import { MarketingImage } from "@/components/marketing/marketing-image";

type CoachCardProps = {
  name: string;
  bio: string;
  imageSrc: string;
};

export function CoachCard({ name, bio, imageSrc }: CoachCardProps) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-blue/30 bg-gradient-to-br from-kaizen-dark via-kaizen-black/95 to-kaizen-dark shadow-lg shadow-black/40 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/45 hover:shadow-xl hover:shadow-kaizen-red/15">
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-kaizen-red/15 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="pointer-events-none absolute bottom-0 left-0 z-10 h-0.5 w-full bg-gradient-to-r from-kaizen-red via-gold to-blue opacity-60" />

      <div className="relative h-56 shrink-0 bg-kaizen-black sm:h-64">
        <MarketingImage
          src={imageSrc}
          alt={name}
          fill
          className="object-contain p-3 transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="font-display text-[10px] font-bold tracking-[0.3em] text-kaizen-red uppercase">Coach</p>
        <h3 className="mt-1 font-display text-2xl font-bold leading-tight text-gold text-distressed">{name}</h3>
        <p className="mt-3 flex-1 break-words text-sm leading-relaxed text-kaizen-silver">{bio}</p>
      </div>
    </article>
  );
}
