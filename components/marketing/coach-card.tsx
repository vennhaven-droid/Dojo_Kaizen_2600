import { MarketingImage } from "@/components/marketing/marketing-image";

type CoachCardProps = {
  name: string;
  role: string;
  bio: string;
  imageSrc: string;
};

export function CoachCard({ name, role, bio, imageSrc }: CoachCardProps) {
  return (
    <article className="group relative flex h-full min-h-[168px] items-stretch overflow-hidden rounded-xl border border-blue/30 bg-gradient-to-br from-kaizen-dark via-kaizen-black/95 to-kaizen-dark shadow-lg shadow-black/40 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/45 hover:shadow-xl hover:shadow-kaizen-red/15">
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-kaizen-red/15 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-kaizen-red via-gold to-blue opacity-60" />

      <div className="relative w-[112px] shrink-0 self-stretch overflow-hidden sm:w-[132px]">
        <MarketingImage
          src={imageSrc}
          alt={name}
          fill
          className="object-cover opacity-75 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-kaizen-black/30 to-kaizen-dark" />
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-gold/50 via-kaizen-red/40 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div>
          <p className="font-display text-[10px] font-bold tracking-[0.3em] text-kaizen-red uppercase">
            {role}
          </p>
          <h3 className="mt-1 font-display text-xl font-bold leading-tight text-gold text-distressed sm:text-2xl">
            {name}
          </h3>
        </div>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-kaizen-silver">{bio}</p>
      </div>
    </article>
  );
}
