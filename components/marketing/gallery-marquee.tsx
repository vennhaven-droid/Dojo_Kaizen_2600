"use client";

import { useState } from "react";
import { MarketingImage } from "@/components/marketing/marketing-image";
import { ImageLightbox } from "@/components/marketing/image-lightbox";

type GalleryMarqueeProps = {
  images: readonly string[];
};

export function GalleryMarquee({ images }: GalleryMarqueeProps) {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const track = [...images, ...images];
  const paused = lightbox !== null;

  return (
    <>
      <div className={`gallery-fade-edges relative mt-8 overflow-hidden sm:mt-12 ${paused ? "gallery-marquee-paused" : ""}`}>
        <div className="gallery-marquee group max-w-full">
          <div className="gallery-marquee-track flex w-max max-w-none gap-4 py-2 sm:gap-5">
            {track.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() =>
                  setLightbox({
                    src,
                    alt: `Dojo Kaizen training ${(i % images.length) + 1}`,
                  })
                }
                className="relative h-[300px] w-[200px] shrink-0 cursor-pointer overflow-hidden rounded-xl ring-1 ring-kaizen-red/25 transition-transform duration-300 hover:scale-[1.02] hover:ring-gold/40 sm:h-[420px] sm:w-[280px]"
              >
                <MarketingImage
                  src={src}
                  alt={`Dojo Kaizen training ${(i % images.length) + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
      {lightbox && (
        <ImageLightbox
          src={lightbox.src}
          alt={lightbox.alt}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}
