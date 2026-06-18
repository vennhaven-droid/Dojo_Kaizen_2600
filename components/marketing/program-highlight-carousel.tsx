"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MarketingImage } from "@/components/marketing/marketing-image";

type ProgramHighlightCarouselProps = {
  images: readonly string[];
  intervalMs?: number;
};

export function ProgramHighlightCarousel({
  images,
  intervalMs = 2000,
}: ProgramHighlightCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [images.length, intervalMs]);

  if (images.length === 0) return null;

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl ring-2 ring-blue/30 shadow-xl shadow-kaizen-red/10">
      <AnimatePresence mode="wait">
        <motion.div
          key={images[index]}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <MarketingImage
            src={images[index]}
            alt={`Dojo Kaizen program highlight ${index + 1}`}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-kaizen-black/50 via-transparent to-kaizen-black/10" />
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {images.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? "w-5 bg-gold" : "w-1.5 bg-kaizen-gray/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
