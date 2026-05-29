"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Facility {
  id: string;
  name: string;
  detail: string;
  image: string;
}

// --- Placeholder data — rename to your real facilities ---
const FACILITIES: Facility[] = [
  {
    id: "f01",
    name: "Main Dojang",
    detail: "Indoor sparring hall · 320 m²",
    image: "/images/facilities/facility-01.jpg",
  },
  {
    id: "f02",
    name: "Strength Lab",
    detail: "Conditioning & weights",
    image: "/images/facilities/facility-02.jpg",
  },
  {
    id: "f03",
    name: "Junior Studio",
    detail: "Ages 5–10 training area",
    image: "/images/facilities/facility-03.jpg",
  },
  {
    id: "f04",
    name: "Outdoor Mat",
    detail: "Open-air training ground",
    image: "/images/facilities/facility-04.jpg",
  },
  {
    id: "f05",
    name: "Mirror Room",
    detail: "Forms & technique studio",
    image: "/images/facilities/facility-05.jpg",
  },
  {
    id: "f06",
    name: "Recovery Lounge",
    detail: "Stretching & mobility",
    image: "/images/facilities/facility-06.jpg",
  },
  {
    id: "f07",
    name: "Equipment Storage",
    detail: "Mats, paddles, hogu",
    image: "/images/facilities/facility-07.jpg",
  },
  {
    id: "f08",
    name: "Spectator Gallery",
    detail: "Tournament seating",
    image: "/images/facilities/facility-08.jpg",
  },
  {
    id: "f09",
    name: "Reception & Café",
    detail: "Lobby and refreshments",
    image: "/images/facilities/facility-09.jpg",
  },
];

const GAP = 24; // px — matches Tailwind gap-6
const DRAG_THRESHOLD = 60;

function getPerView(width: number): number {
  if (width < 768) return 1; // mobile
  return 2; // tablet + desktop — fewer, bigger cards than the other carousels
}

interface FacilityProps {
  title?: string;
  subtitle?: string;
}

export default function Facility({
  title = "Our Facilities",
  subtitle,
}: FacilityProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [perView, setPerView] = useState(2);
  const [index, setIndex] = useState(0);

  const dragState = useRef<{ active: boolean; startX: number }>({
    active: false,
    startX: 0,
  });
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const maxIndex = Math.max(0, FACILITIES.length - perView);
  const cardWidth =
    viewportWidth > 0 ? (viewportWidth - GAP * (perView - 1)) / perView : 0;

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

  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, FACILITIES.length - perView)));
  }, [perView]);

  const goPrev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const goNext = useCallback(
    () => setIndex((i) => Math.min(maxIndex, i + 1)),
    [maxIndex],
  );

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
  const progress = maxIndex === 0 ? 100 : (index / maxIndex) * 100;
  const currentLabel = String(index + 1).padStart(2, "0");
  const totalLabel = String(FACILITIES.length).padStart(2, "0");

  return (
    <section className="bg-paper py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {subtitle && (
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-muted">
              {subtitle}
            </p>
          )}
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight md:text-4xl">
            {title}
          </h2>
        </div>

        {/* Carousel */}
        <div className="mt-12 md:mt-16">
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
              {FACILITIES.map((f) => (
                <article
                  key={f.id}
                  className="group shrink-0 select-none"
                  style={{
                    width:
                      cardWidth > 0 ? `${cardWidth}px` : `${100 / perView}%`,
                  }}
                >
                  <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-ink">
                    <Image
                      src={f.image}
                      alt={f.name}
                      fill
                      draggable={false}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    {/* Caption overlay — dark gradient + facility info */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 text-paper md:p-7">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-paper/70">
                        {f.detail}
                      </p>
                      <h3 className="mt-2 font-display text-xl font-bold uppercase tracking-wide md:text-2xl">
                        {f.name}
                      </h3>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Controls: prev — counter + progress bar — next */}
          <div className="mt-8 flex items-center gap-4 md:mt-10 md:gap-6">
            <button
              type="button"
              onClick={goPrev}
              disabled={atStart}
              aria-label="Previous facility"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/20 text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>

            <div className="flex flex-1 items-center gap-4">
              <span
                aria-live="polite"
                className="shrink-0 text-xs font-semibold uppercase tracking-[0.25em] tabular-nums text-ink"
              >
                {currentLabel} <span className="text-ink/40">/</span>{" "}
                {totalLabel}
              </span>
              <div
                className="relative h-px flex-1 bg-ink/15"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress)}
              >
                <div
                  className="absolute inset-y-0 left-0 bg-ink transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={goNext}
              disabled={atEnd}
              aria-label="Next facility"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/20 text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
