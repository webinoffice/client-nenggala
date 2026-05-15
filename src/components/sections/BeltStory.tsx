"use client";

import Image from "next/image";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BeltStoryItem {
  id: string;
  image: string;
  alt: string;
}

const STORIES: BeltStoryItem[] = [
  { id: "s1", image: "/images/story-1.jpg", alt: "Atlet Nenggala bertanding" },
  { id: "s2", image: "/images/story-2.jpg", alt: "Tim Nenggala juara" },
  { id: "s3", image: "/images/story-3.jpg", alt: "Latihan kelompok" },
  { id: "s4", image: "/images/story-4.jpg", alt: "Demonstrasi tim" },
  { id: "s5", image: "/images/story-5.jpg", alt: "Acara Hanmadang" },
];

export default function BeltStory() {
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
          Every Belt Has a Story
        </h2>

        <div className="relative mt-10">
          <div
            ref={scrollRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4"
          >
            {STORIES.map((s) => (
              <article
                key={s.id}
                className="w-[75%] flex-shrink-0 snap-center sm:w-[45%] md:w-[calc(25%-0.75rem)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-ink shadow-sm">
                  <Image
                    src={s.image}
                    alt={s.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 75vw, 25vw"
                  />
                </div>
              </article>
            ))}
          </div>

          {/* Desktop nav arrows */}
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
