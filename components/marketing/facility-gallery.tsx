"use client";

import { useState } from "react";
import { MarketingImage } from "@/components/marketing/marketing-image";
import { cn } from "@/lib/utils";

type GalleryItem = {
  id: string;
  title?: string | null;
  image_url: string;
};

export function FacilityGallery({ items }: { items: GalleryItem[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveIndex(i)}
            className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-xl border border-blue/20 bg-kaizen-dark focus:outline-none focus:ring-2 focus:ring-gold/50"
          >
            <div className={cn("relative w-full", i % 3 === 0 ? "aspect-[4/5]" : i % 3 === 1 ? "aspect-square" : "aspect-[3/4]")}>
              <MarketingImage
                src={item.image_url}
                alt={item.title ?? `Facility photo ${i + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-kaizen-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </button>
        ))}
      </div>

      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-kaizen-black/90 p-4 backdrop-blur-sm"
          onClick={() => setActiveIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setActiveIndex(null)}
            className="absolute right-4 top-4 z-10 rounded-md p-2 text-kaizen-muted hover:bg-white/10 hover:text-gold"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex((activeIndex - 1 + items.length) % items.length);
            }}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full p-3 text-gold hover:bg-white/10 sm:left-4"
          >
            ‹
          </button>
          <div className="relative max-h-[85vh] max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={items[activeIndex].image_url}
              alt={items[activeIndex].title ?? "Facility"}
              className="mx-auto max-h-[85vh] w-auto max-w-full rounded-lg object-contain"
            />
            <p className="mt-3 text-center text-sm text-kaizen-muted">
              {activeIndex + 1} / {items.length}
            </p>
          </div>
          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex((activeIndex + 1) % items.length);
            }}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full p-3 text-gold hover:bg-white/10 sm:right-4"
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}
