"use client";

import Image from "next/image";
import { useMemo } from "react";
import { ArrowUpRight } from "lucide-react";
import { useEvents, formatEventDate } from "@/lib/events";
import { useHomepageContent } from "@/lib/cms/homepage";

interface EventBannerProps {
  sectionTitle?: string;
}

export default function EventBanner({ sectionTitle }: EventBannerProps = {}) {
  const events = useEvents();
  const { highlightEventId } = useHomepageContent();

  // Use the selected highlight when it's still active, otherwise fall back to
  // the most recent active event so the banner is never empty.
  const highlight = useMemo(() => {
    const active = events.filter((e) => e.status === "Active");
    const selected = active.find((e) => e.id === highlightEventId);
    return selected ?? active[0] ?? null;
  }, [events, highlightEventId]);

  if (!highlight) return null;

  return (
    <section className="bg-paper py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {sectionTitle && (
          <h2 className="mb-10 text-center font-display text-3xl font-bold uppercase tracking-tight md:text-4xl">
            {sectionTitle}
          </h2>
        )}

        <div className="grid gap-6 md:grid-cols-5">
          <article className="md:col-span-3 rounded-sm bg-accent p-8 text-accent-foreground md:p-10">
            <p className="text-xs font-bold uppercase tracking-widest">
              Event Terbaru
            </p>
            <h3 className="mt-3 font-display text-3xl font-bold uppercase leading-tight md:text-4xl">
              {highlight.title}
            </h3>
            <p className="mt-2 text-sm font-semibold">
              {formatEventDate(highlight.date)}
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed">
              {highlight.description}
            </p>
            <a
              href={`https://${highlight.registerUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest underline-offset-4 hover:underline"
            >
              Lihat Detail Event
              <ArrowUpRight size={16} />
            </a>
          </article>

          <article className="md:col-span-2 relative aspect-[4/3] md:aspect-auto overflow-hidden rounded-sm bg-ink">
            <Image
              src={highlight.image}
              alt={highlight.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </article>
        </div>
      </div>
    </section>
  );
}
