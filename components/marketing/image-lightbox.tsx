"use client";

import { useEffect } from "react";
import { MarketingImage } from "@/components/marketing/marketing-image";

type ImageLightboxProps = {
  src: string;
  alt: string;
  onClose: () => void;
};

export function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-kaizen-black/90 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full border border-gold/40 bg-kaizen-dark/80 px-3 py-1.5 text-sm font-semibold text-gold transition-colors hover:bg-gold/10"
        aria-label="Close"
      >
        ✕
      </button>
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl ring-2 ring-kaizen-red/40"
        onClick={(e) => e.stopPropagation()}
      >
        <MarketingImage
          src={src}
          alt={alt}
          width={900}
          height={1200}
          className="h-auto max-h-[90vh] w-full object-contain"
        />
      </div>
    </div>
  );
}
