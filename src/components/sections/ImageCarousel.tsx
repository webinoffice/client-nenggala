"use client";

import Image from "next/image";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Single source of truth — same endpoint will serve both /gallery and /program/taekwondo
const GALLERY_IMAGES = [
  { id: "g1", src: "/images/story-1.jpg", alt: "Atlet Nenggala bertanding" },
  { id: "g2", src: "/images/story-2.jpg", alt: "Tim Nenggala juara" },
  { id: "g3", src: "/images/story-3.jpg", alt: "Latihan kelompok" },
  { id: "g4", src: "/images/story-4.jpg", alt: "Demonstrasi tim" },
  { id: "g5", src: "/images/story-5.jpg", alt: "Acara Hanmadang" },
];

interface ImageCarouselProps {
  title: string;
}

export default function ImageCarousel({ title }: ImageCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollByAmount = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7;
    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-neutral-200 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="text-center font-display text-3xl font-bold uppercase tracking-tight md:text-4xl">
          {title}
        </h2>

        <div className="relative mt-10">
          <div
            ref={scrollRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4"
          >
            {GALLERY_IMAGES.map((img) => (
              <article
                key={img.id}
                className="w-[75%] flex-shrink-0 snap-center sm:w-[45%] md:w-[calc(25%-0.75rem)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-ink shadow-sm">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 75vw, 25vw"
                  />
                </div>
              </article>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollByAmount("left")}
            className="absolute left-0 top-1/2 hidden -translate-y-1/2 -translate-x-3 items-center justify-center rounded-full bg-paper p-2 shadow-md transition-colors hover:bg-paper-soft md:flex"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount("right")}
            className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-3 items-center justify-center rounded-full bg-paper p-2 shadow-md transition-colors hover:bg-paper-soft md:flex"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
