"use client";

import Image from "next/image";

/**
 * Partner — a section that displays partner logos across 3 rows.
 * Each row is an infinite marquee that drifts sideways on its own;
 * adjacent rows move in opposite directions at slightly different speeds.
 *
 * The animation is pure CSS (see PARTNER_MARQUEE_STYLES below), so the
 * component is self-contained — no tailwind.config changes required.
 */

interface Partner {
  id: string;
  name: string;
  logo: string; // path under /public, e.g. /images/partners/xyz.svg
}

// --- Placeholder data — replace with your real partners + logo files ---
const PARTNERS: Partner[] = [
  { id: "p01", name: "Partner 01", logo: "/images/partners/partner-01.jpg" },
  { id: "p02", name: "Partner 02", logo: "/images/partners/partner-02.jpg" },
  { id: "p03", name: "Partner 03", logo: "/images/partners/partner-03.jpg" },
  { id: "p04", name: "Partner 04", logo: "/images/partners/partner-04.jpg" },
  { id: "p05", name: "Partner 05", logo: "/images/partners/partner-05.jpg" },
  { id: "p06", name: "Partner 06", logo: "/images/partners/partner-06.jpg" },
  { id: "p07", name: "Partner 07", logo: "/images/partners/partner-07.jpg" },
  { id: "p08", name: "Partner 08", logo: "/images/partners/partner-08.jpg" },
  { id: "p09", name: "Partner 09", logo: "/images/partners/partner-09.jpg" },
  { id: "p10", name: "Partner 10", logo: "/images/partners/partner-10.jpg" },
  { id: "p11", name: "Partner 11", logo: "/images/partners/partner-11.jpg" },
  { id: "p12", name: "Partner 12", logo: "/images/partners/partner-12.jpg" },
  { id: "p13", name: "Partner 13", logo: "/images/partners/partner-13.jpg" },
  { id: "p14", name: "Partner 14", logo: "/images/partners/partner-14.jpg" },
  { id: "p15", name: "Partner 15", logo: "/images/partners/partner-15.jpg" },
];

// Per-row marquee duration in seconds. Higher = slower. The three values
// differ slightly so the rows never look perfectly synced.
const ROW_DURATIONS = [38, 48, 43];

const PARTNER_MARQUEE_STYLES = `
  @keyframes partner-scroll {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  .partner-track {
    display: flex;
    width: max-content;
    animation-name: partner-scroll;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }
  .partner-row:hover .partner-track {
    animation-play-state: paused;
  }
  .partner-mask {
    -webkit-mask-image: linear-gradient(to right, transparent, #000 8%, #000 92%, transparent);
    mask-image: linear-gradient(to right, transparent, #000 8%, #000 92%, transparent);
  }
  @media (prefers-reduced-motion: reduce) {
    .partner-track { animation: none; }
  }
`;

/** Distribute items across `rowCount` rows as evenly as possible (round-robin). */
function splitIntoRows<T>(items: T[], rowCount: number): T[][] {
  const rows: T[][] = Array.from({ length: rowCount }, () => []);
  items.forEach((item, i) => rows[i % rowCount].push(item));
  return rows;
}

interface MarqueeRowProps {
  logos: Partner[];
  reverse: boolean;
  duration: number;
}

function MarqueeRow({ logos, reverse, duration }: MarqueeRowProps) {
  if (logos.length === 0) return null;

  // The keyframe slides the track by exactly -50%, so the track must be two
  // identical halves for a seamless loop. We repeat the row's logos 4 times
  // (an even count) — this also keeps the strip wide enough that no empty gap
  // appears on wide screens. If a row has very few logos and you still see a
  // gap, bump this to 6.
  const REPEAT = 4;
  const reel = Array.from({ length: REPEAT }, () => logos).flat();

  return (
    <div className="partner-row overflow-hidden">
      <div
        className="partner-track gap-10 md:gap-16"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {reel.map((p, i) => (
          <div
            key={`${p.id}-${i}`}
            // Only the first set is "real" content for screen readers;
            // the repeated copies are decorative.
            aria-hidden={i >= logos.length || undefined}
            className="relative h-10 w-32 shrink-0 md:h-12 md:w-40"
          >
            <Image
              src={p.logo}
              alt={p.name}
              fill
              sizes="160px"
              draggable={false}
              className="object-contain opacity-60 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

interface PartnerProps {
  /** Section heading. */
  title?: string;
  /** Optional small uppercase line shown above the heading. */
  subtitle?: string;
}

export default function Partner({
  title = "Our Partners",
  subtitle,
}: PartnerProps) {
  const rows = splitIntoRows(PARTNERS, 3);

  return (
    <section className="overflow-hidden bg-paper py-16 md:py-24">
      {/* Marquee keyframes — self-contained, no global CSS needed. */}
      <style>{PARTNER_MARQUEE_STYLES}</style>

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

        {/* Rows are constrained to the same max-w-7xl container as the site's
            other sections, so the layout matches at any screen size (incl. 4K).
            Edges still fade out via partner-mask. */}
        <div className="partner-mask mt-12 flex flex-col gap-6 md:mt-16 md:gap-8">
          {rows.map((row, i) => (
            <MarqueeRow
              key={i}
              logos={row}
              reverse={i % 2 === 1}
              duration={ROW_DURATIONS[i] ?? 42}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
