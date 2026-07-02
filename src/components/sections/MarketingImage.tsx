"use client";

// Marketing image with a graceful empty-state. Backend-derived images
// (programs, dojang, coaches, …) are often null when nothing has been uploaded
// yet — fileUrl() then returns "". next/image renders an empty src as a blank
// broken box, which reads as "the section is empty". This wrapper renders a
// neutral branded placeholder in that case instead, and otherwise defers to
// next/image (optimization is disabled globally, so uploads render directly).

import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketingImageProps {
  src: string;
  alt: string;
  className?: string;
  draggable?: boolean;
  sizes?: string;
}

export default function MarketingImage({
  src,
  alt,
  className,
  draggable,
  sizes,
}: MarketingImageProps) {
  if (!src) {
    return (
      <div
        className={cn(
          "flex h-full w-full flex-col items-center justify-center gap-2 bg-paper-soft text-muted",
          className,
        )}
        role="img"
        aria-label={alt}
      >
        <ImageOff size={28} aria-hidden="true" />
        <span className="px-2 text-center text-[10px] font-bold uppercase tracking-widest">
          No image
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      draggable={draggable}
      className={className}
      sizes={sizes}
    />
  );
}
