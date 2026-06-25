"use client";

import Image from "next/image";
import { useHomepageContent } from "@/lib/cms/homepage";

interface HeroProps {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  preload?: boolean;
}

/**
 * Top banner. Defaults to the CMS-managed homepage top banner; pass `src`/`alt`
 * to override on a specific page.
 */
export default function Hero({
  src,
  alt,
  width = 1920,
  height = 900,
  preload = true,
}: HeroProps) {
  const { topBanner } = useHomepageContent();
  const resolvedSrc = src ?? topBanner.src;
  const resolvedAlt = alt ?? topBanner.alt;

  return (
    <section className="relative w-full">
      <div
        className="relative w-full"
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <Image
          src={resolvedSrc}
          alt={resolvedAlt}
          fill
          preload={preload}
          className="object-cover"
          sizes="100vw"
        />
      </div>
    </section>
  );
}
