"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

type MarketingImageProps = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
};

export function MarketingImage({
  src,
  alt,
  className,
  fill,
  width,
  height,
  priority,
}: MarketingImageProps) {
  const isRemote = src.startsWith("http");

  if (isRemote) {
    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={cn("object-cover", className)}
        priority={priority}
        unoptimized
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={cn("object-cover", className)}
      priority={priority}
    />
  );
}
