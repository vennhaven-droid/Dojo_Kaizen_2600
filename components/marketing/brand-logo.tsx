"use client";

import { MarketingImage } from "@/components/marketing/marketing-image";
import { cn } from "@/lib/utils";
import { LOGO_SRC } from "@/lib/brand";

type BrandLogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
  src?: string;
};

export function BrandLogo({ size = 48, className, priority, src = LOGO_SRC }: BrandLogoProps) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full ring-2 ring-gold/40 bg-kaizen-dark",
        className
      )}
      style={{ width: size, height: size }}
    >
      <MarketingImage
        src={src}
        alt="Dojo Kaizen Martial Arts 2600"
        width={size}
        height={size}
        priority={priority}
        className="h-full w-full object-contain p-1"
      />
    </div>
  );
}
