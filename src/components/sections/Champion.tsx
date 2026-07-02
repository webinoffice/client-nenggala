"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import MarketingImage from "./MarketingImage";
import Button from "@/components/ui/Button";
import { usePrograms } from "@/lib/marketing/programs";

const GAP = 24; // px — matches Tailwind gap-6 (1.5rem)
const DRAG_THRESHOLD = 60; // px the user must drag before the slide commits

function getPerView(width: number) {
  if (width < 768) return 1; // mobile
  if (width < 1024) return 2; // tablet
  return 3; // desktop
}

export default function Champion() {
  const programs = usePrograms();

  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [perView, setPerView] = useState(3);
  const [index, setIndex] = useState(0);

  // drag state
  const dragState = useRef({ active: false, startX: 0 });
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const maxIndex = Math.max(0, programs.length - perView);
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

  // Keep the active index valid when perView (or the list) changes.
  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, programs.length - perView)));
  }, [perView, programs.length]);

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
    <section className="bg-paper py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-bold uppercase tracking-tight md:text-5xl">
            Here to Create a Champion
          </h2>
          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-muted">
            Discipline Defines You
          </p>
          <div className="mt-8">
            <Button href="/program">Explore Our Programs</Button>
          </div>
        </div>

        {/* Carousel */}
        <div className="mt-16">
          <div
            ref={viewportRef}
            className="overflow-hidden"
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
              {programs.map((p) => (
                <div
                  key={p.id}
                  className="group shrink-0"
                  style={{
                    width:
                      cardWidth > 0 ? `${cardWidth}px` : `${100 / perView}%`,
                  }}
                >
                  <div className="relative aspect-4/5 overflow-hidden rounded-sm bg-ink">
                    <MarketingImage
                      src={p.image}
                      alt={p.name}
                      draggable={false}
                      className="select-none object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <p className="mt-4 text-center font-display text-lg font-semibold uppercase tracking-widest">
                    {p.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Controls: prev arrow — dots — next arrow */}
          <div className="mt-10 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={goPrev}
              disabled={atStart}
              aria-label="Previous programs"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
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
              aria-label="Next programs"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
