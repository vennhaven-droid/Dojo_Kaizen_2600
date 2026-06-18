"use client";

import { MarketingImage } from "@/components/marketing/marketing-image";

type GalleryMarqueeProps = {
  images: readonly string[];
};

export function GalleryMarquee({ images }: GalleryMarqueeProps) {
  const track = [...images, ...images];

  return (
    <div className="gallery-fade-edges relative mt-12 overflow-hidden">
      <div className="gallery-marquee group">
        <div className="gallery-marquee-track flex w-max gap-5 py-2">
          {track.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="relative h-[420px] w-[280px] shrink-0 overflow-hidden rounded-xl ring-1 ring-kaizen-red/25 transition-transform duration-300 hover:scale-[1.02] hover:ring-gold/40"
            >
              <MarketingImage
                src={src}
                alt={`Dojo Kaizen training ${(i % images.length) + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
