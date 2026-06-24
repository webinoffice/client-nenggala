"use client";

import Image from "next/image";
import { useHomepageContent } from "@/lib/cms/homepage";
import { isBlobSrc } from "@/lib/cms/image-src";

export default function Mindset() {
  const { bottomBanner } = useHomepageContent();

  return (
    <section className="relative w-full">
      <div className="relative aspect-[1920/600] w-full">
        <Image
          src={bottomBanner.src}
          alt={bottomBanner.alt}
          fill
          unoptimized={isBlobSrc(bottomBanner.src)}
          className="object-cover"
          sizes="100vw"
        />
      </div>
    </section>
  );
}
