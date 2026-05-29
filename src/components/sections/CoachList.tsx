"use client";

import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Coach {
  id: string;
  name: string;
  rank: string;
  image: string;
}

interface CoachListProps {
  title: string;
  featured: Coach;
  others: Coach[];
}

/** Slot width per breakpoint. Each slot is slightly wider than the elevated
 *  card so neighbors don't crowd it. The snap distance == slotWidth. */
function getSlotWidth(width: number): number {
  if (width < 640) return 144; // mobile  — fits ~3 slots in a typical viewport
  if (width < 768) return 160; // sm
  if (width < 1024) return 192; // md
  return 216; // lg+
}

// How many slots a single drag gesture can move at most (safety cap so a
// fling can't push activeIndex past the rendered tripled buffer).
const MAX_DRAG_SLOTS = 4;

export default function CoachList({ title, featured, others }: CoachListProps) {
  // Combine featured + others into one ordered array, with featured in the
  // middle of the lineup (preserves the visual arrangement from your original).
  const { coaches, featuredOffset } = useMemo(() => {
    const half = Math.floor(others.length / 2);
    return {
      coaches: [...others.slice(0, half), featured, ...others.slice(half)],
      featuredOffset: half,
    };
  }, [featured, others]);

  const n = coaches.length;

  // Infinite-loop trick: render the list 3 times. We navigate within the
  // middle copy and silently teleport back whenever we cross a boundary, so
  // the user can keep clicking next/prev forever without ever seeing a seam.
  const tripled = useMemo(
    () => [...coaches, ...coaches, ...coaches],
    [coaches],
  );

  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [slotWidth, setSlotWidth] = useState(216);

  // activeIndex points into `tripled`. Start at the featured coach in the middle copy.
  const [activeIndex, setActiveIndex] = useState(n + featuredOffset);
  const [transitionEnabled, setTransitionEnabled] = useState(false);

  // Drag state. hasMoved discriminates a tap from a drag so tap-to-focus
  // doesn't fire after a swipe.
  const dragState = useRef({ active: false, startX: 0, hasMoved: false });
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Measure on mount + resize.
  useEffect(() => {
    const update = () => {
      const el = viewportRef.current;
      if (!el) return;
      setViewportWidth(el.offsetWidth);
      setSlotWidth(getSlotWidth(window.innerWidth));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Re-enable transition on the frame after any teleport (or after first mount),
  // so the next user-driven navigation animates instead of snapping.
  useEffect(() => {
    if (!transitionEnabled) {
      const id = requestAnimationFrame(() => setTransitionEnabled(true));
      return () => cancelAnimationFrame(id);
    }
  }, [transitionEnabled]);

  // After the slide finishes, if we drifted outside the middle copy, teleport
  // back to the equivalent slot in the middle copy with transitions disabled.
  const handleTransitionEnd = useCallback(() => {
    if (activeIndex >= 2 * n || activeIndex < n) {
      const modulated = ((activeIndex % n) + n) % n;
      setTransitionEnabled(false);
      setActiveIndex(n + modulated);
    }
  }, [activeIndex, n]);

  const goPrev = useCallback(() => setActiveIndex((i) => i - 1), []);
  const goNext = useCallback(() => setActiveIndex((i) => i + 1), []);

  // Pointer / touch drag.
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragState.current = { active: true, startX: e.clientX, hasMoved: false };
    setIsDragging(true);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active) return;
    const raw = e.clientX - dragState.current.startX;
    if (Math.abs(raw) > 5) dragState.current.hasMoved = true;
    // Cap the offset so a fling can't drag past the rendered buffer.
    const cap = slotWidth * MAX_DRAG_SLOTS;
    setDragOffset(Math.max(-cap, Math.min(cap, raw)));
  };
  const endDrag = () => {
    if (!dragState.current.active) return;
    const offset = dragOffset;
    dragState.current.active = false;
    setIsDragging(false);
    setDragOffset(0);
    // Snap to whichever slot is currently closest to the viewport center,
    // regardless of distance. A 0.5-slot drag moves one card; a 1.5-slot
    // drag moves two; releasing mid-slot springs back to where you started.
    const slotsMoved = Math.round(-offset / slotWidth);
    if (slotsMoved !== 0) {
      setActiveIndex((i) => i + slotsMoved);
    }
  };

  // Keyboard nav when the carousel has focus.
  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goNext();
    }
  };

  // Center the active slot in the viewport.
  const translateX =
    viewportWidth > 0
      ? viewportWidth / 2 -
        (activeIndex * slotWidth + slotWidth / 2) +
        dragOffset
      : 0;

  // The slot currently closest to the viewport center, accounting for any
  // in-flight drag. Used for elevation so the highlighted card follows the
  // finger live instead of only updating on release.
  const liveActiveIndex =
    slotWidth > 0
      ? Math.round(activeIndex - dragOffset / slotWidth)
      : activeIndex;

  const isReady = viewportWidth > 0;
  const useTransition = isReady && transitionEnabled && !isDragging;

  return (
    <section className="bg-neutral-200 py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="text-center font-display text-2xl font-bold uppercase tracking-tight md:text-3xl">
          {title}
        </h2>

        <div
          ref={viewportRef}
          className="mt-8 overflow-hidden focus:outline-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={onKeyDown}
          tabIndex={0}
          role="region"
          aria-label="Coaches"
          aria-roledescription="carousel"
          style={{
            touchAction: "pan-y",
            cursor: isDragging ? "grabbing" : "grab",
            opacity: isReady ? 1 : 0,
            transition: "opacity 250ms ease",
            // Soft fade at left/right edges so cards don't get hard-cut.
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, #000 7%, #000 93%, transparent 100%)",
            maskImage:
              "linear-gradient(to right, transparent 0%, #000 7%, #000 93%, transparent 100%)",
          }}
        >
          <div
            className="flex items-end pb-3 min-h-[240px] sm:min-h-[260px] md:min-h-[310px] lg:min-h-[330px]"
            style={{
              transform: `translateX(${translateX}px)`,
              transition: useTransition
                ? "transform 450ms cubic-bezier(0.22, 1, 0.36, 1)"
                : "none",
              willChange: "transform",
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {tripled.map((coach, i) => {
              const isActive = i === liveActiveIndex;
              return (
                <div
                  key={`${coach.id}-${i}`}
                  className="flex shrink-0 justify-center"
                  style={{ width: `${slotWidth}px` }}
                  onClick={() => {
                    // Tap a side card to bring it to center. Suppress if a
                    // drag was in progress (dragState.hasMoved).
                    if (dragState.current.hasMoved) return;
                    if (i !== liveActiveIndex) setActiveIndex(i);
                  }}
                >
                  <article
                    className={cn(
                      "group/card relative cursor-pointer select-none text-center transition-opacity duration-300",
                      isActive ? "opacity-100" : "opacity-85",
                    )}
                  >
                    <div
                      className={cn(
                        "relative mx-auto overflow-hidden rounded-sm bg-ink shadow-md transition-[width] duration-300 ease-out",
                        "aspect-[3/4]",
                        isActive
                          ? "w-32 sm:w-36 md:w-44 lg:w-48"
                          : "w-24 sm:w-28 md:w-32 lg:w-36",
                      )}
                    >
                      {isActive && (
                        <>
                          <div className="absolute inset-x-0 top-0 z-20 h-1 bg-brand" />
                          <div className="featured-shine pointer-events-none absolute inset-0 z-10" />
                        </>
                      )}
                      <Image
                        src={coach.image}
                        alt={coach.name}
                        fill
                        draggable={false}
                        className="object-cover transition-transform duration-500 group-hover/card:scale-110"
                        sizes="(max-width: 768px) 35vw, 200px"
                      />
                    </div>
                    <p
                      className={cn(
                        "mt-2 font-display font-bold uppercase tracking-widest text-ink transition-all duration-300",
                        isActive
                          ? "text-sm md:text-base"
                          : "text-xs md:text-sm",
                      )}
                    >
                      {coach.name}
                    </p>
                    <p
                      className={cn(
                        "font-semibold uppercase tracking-widest text-brand transition-all duration-300",
                        isActive
                          ? "text-xs md:text-sm"
                          : "text-[10px] md:text-xs",
                      )}
                    >
                      {coach.rank}
                    </p>
                  </article>
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex items-center justify-center gap-3 md:mt-8">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous coach"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/20 text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-paper"
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next coach"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/20 text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-paper"
          >
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </section>
  );
}
