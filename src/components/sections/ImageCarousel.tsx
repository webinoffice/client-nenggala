"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Single source of truth — same endpoint will serve both /gallery and /program/taekwondo
const GALLERY_IMAGES = [
  { id: "g1", src: "/images/story-1.jpg", alt: "Atlet Nenggala bertanding" },
  { id: "g2", src: "/images/story-2.jpg", alt: "Tim Nenggala juara" },
  { id: "g3", src: "/images/story-3.jpg", alt: "Latihan kelompok" },
  { id: "g4", src: "/images/story-4.jpg", alt: "Demonstrasi tim" },
  { id: "g5", src: "/images/story-5.jpg", alt: "Acara Hanmadang" },
];

const GAP = 24; // px — matches Tailwind gap-6 (1.5rem)
const DRAG_THRESHOLD = 60; // px the user must drag before the slide commits

function getPerView(width: number): number {
  if (width < 768) return 1; // mobile
  if (width < 1024) return 2; // tablet
  return 3; // desktop
}

interface ImageCarouselProps {
  title: string;
}

export default function ImageCarousel({ title }: ImageCarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [perView, setPerView] = useState(3);
  const [index, setIndex] = useState(0);

  // drag state
  const dragState = useRef<{ active: boolean; startX: number }>({
    active: false,
    startX: 0,
  });
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const maxIndex = Math.max(0, GALLERY_IMAGES.length - perView);
  const cardWidth =
    viewportWidth > 0 ? (viewportWidth - GAP * (perView - 1)) / perView : 0;

  // Measure viewport + decide how many cards fit, re-run on resize.
  useEffect(() => {
    const update = () => {
      const el = viewportRef.current;
      if (!el) return;
      setViewportWidth(el.offsetWidth);
      setPerView(getPerView(window.innerWidth));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Keep the active index valid when perView changes.
  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, GALLERY_IMAGES.length - perView)));
  }, [perView]);

  const goPrev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const goNext = useCallback(
    () => setIndex((i) => Math.min(maxIndex, i + 1)),
    [maxIndex],
  );

  // --- Pointer / touch drag handlers ---
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragState.current = { active: true, startX: e.clientX };
    setIsDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active) return;
    setDragOffset(e.clientX - dragState.current.startX);
  };

  const endDrag = () => {
    if (!dragState.current.active) return;
    const offset = dragOffset;
    dragState.current.active = false;
    setIsDragging(false);
    setDragOffset(0);
    if (offset <= -DRAG_THRESHOLD) goNext();
    else if (offset >= DRAG_THRESHOLD) goPrev();
  };

  const atStart = index === 0;
  const atEnd = index >= maxIndex;

  const translateX = -(index * (cardWidth + GAP)) + dragOffset;

  return (
    <section className="bg-neutral-200 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="text-center font-display text-3xl font-bold uppercase tracking-tight md:text-4xl">
          {title}
        </h2>

        {/* Carousel */}
        <div className="mt-10">
          <div
            ref={viewportRef}
            // -my-2 / py-2 lets the cards' shadows breathe vertically
            // while the horizontal overflow stays clipped.
            className="-my-2 overflow-hidden py-2"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            onPointerCancel={endDrag}
            style={{
              touchAction: "pan-y",
              cursor: isDragging ? "grabbing" : "grab",
            }}
          >
            <div
              className="flex"
              style={{
                gap: `${GAP}px`,
                transform: `translateX(${translateX}px)`,
                transition: isDragging
                  ? "none"
                  : "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              {GALLERY_IMAGES.map((img) => (
                <article
                  key={img.id}
                  className="shrink-0"
                  style={{
                    width:
                      cardWidth > 0 ? `${cardWidth}px` : `${100 / perView}%`,
                  }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-ink shadow-sm">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      draggable={false}
                      className="select-none object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Controls: prev arrow — dots — next arrow */}
          <div className="mt-10 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={goPrev}
              disabled={atStart}
              aria-label="Previous"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === index
                      ? "w-8 bg-ink"
                      : "w-1.5 bg-ink/25 hover:bg-ink/50"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={goNext}
              disabled={atEnd}
              aria-label="Next"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
