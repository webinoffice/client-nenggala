"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEvents, formatEventDate, HIGHLIGHT_EVENT_ID } from "@/lib/events";

const PER_PAGE = 10;

export default function EventList() {
  const allEvents = useEvents();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  // Only Active events are public. Exclude the synthetic highlight row (it is
  // featured separately in EventBanner, so it must not duplicate in the list).
  const events = useMemo(
    () =>
      allEvents.filter(
        (e) => e.status === "Active" && e.id !== HIGHLIGHT_EVENT_ID,
      ),
    [allEvents],
  );

  const filtered = events.filter((e) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <section className="bg-paper py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight md:text-4xl">
            Events
          </h2>

          <div className="flex items-stretch overflow-hidden rounded-sm border-2 border-accent bg-paper md:w-80">
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search"
              aria-label="Search events"
              className="flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-muted"
            />
            <button
              type="button"
              className="flex items-center justify-center bg-accent px-3 text-accent-foreground"
              aria-label="Search"
            >
              <Search size={16} />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="mt-10 space-y-6">
          {paginated.length === 0 ? (
            <p className="py-12 text-center text-muted">
              Tidak ada event untuk &ldquo;{query}&rdquo;.
            </p>
          ) : (
            paginated.map((event) => (
              <article
                key={event.id}
                className="grid gap-5 border-b border-ink/10 pb-6 last:border-b-0 md:grid-cols-[220px_1fr] md:gap-7"
              >
                <a
                  href={`https://${event.registerUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block aspect-[4/3] overflow-hidden rounded-sm bg-ink"
                >
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 220px"
                  />
                </a>

                <div>
                  <h3 className="font-display text-lg font-bold uppercase tracking-wide md:text-xl">
                    <a
                      href={`https://${event.registerUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-4 transition-colors hover:text-brand"
                    >
                      {event.title}
                    </a>
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-ink/70">
                    {formatEventDate(event.date)}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-ink md:text-base">
                    {event.description}
                  </p>
                  <p className="mt-3 text-sm">
                    <span className="text-ink/70">Daftar disini: </span>
                    <a
                      href={`https://${event.registerUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand underline underline-offset-4 hover:text-brand-hover"
                    >
                      {event.registerUrl}
                    </a>
                  </p>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-sm border border-ink/20 p-2 transition-colors hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={cn(
                  "h-9 min-w-9 rounded-sm border px-3 text-sm font-semibold transition-colors",
                  p === page
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-ink/20 text-ink hover:bg-ink/5",
                )}
                aria-current={p === page ? "page" : undefined}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-sm border border-ink/20 p-2 transition-colors hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
