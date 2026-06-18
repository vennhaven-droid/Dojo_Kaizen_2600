"use client";

import { Facebook, Instagram } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

type SocialLinksProps = {
  className?: string;
  iconSize?: number;
};

export function SocialLinks({ className, iconSize = 22 }: SocialLinksProps) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <a
        href={BRAND.facebook}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Dojo Kaizen on Facebook"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-blue/40 bg-blue/10 text-blue transition-all hover:scale-110 hover:border-blue hover:bg-blue/20 hover:shadow-lg hover:shadow-blue/20"
      >
        <Facebook size={iconSize} />
      </a>
      <a
        href={BRAND.instagram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Dojo Kaizen on Instagram"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold transition-all hover:scale-110 hover:border-gold hover:bg-gold/20 hover:shadow-lg hover:shadow-gold/20"
      >
        <Instagram size={iconSize} />
      </a>
    </div>
  );
}
