"use client";

import Image from "next/image";
import { useState } from "react";
import { Search, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Moment {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
}

const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

const VIDEOS: Moment[] = [
  {
    id: "v1",
    title: "Taekwondo Nenggala Online Class",
    description: LOREM,
    thumbnail: "/images/moment-1.jpg",
    url: "#",
  },
  {
    id: "v2",
    title: "Taekwondo Nenggala New Normal",
    description: LOREM,
    thumbnail: "/images/moment-2.jpg",
    url: "#",
  },
  {
    id: "v3",
    title: "Highlight UKT Maret 2020",
    description: LOREM,
    thumbnail: "/images/moment-3.jpg",
    url: "#",
  },
  {
    id: "v4",
    title: "Latihan Bersama Nenggala Tangerang",
    description: LOREM,
    thumbnail: "/images/moment-4.jpg",
    url: "#",
  },
  {
    id: "v5",
    title: "Kejuaraan Nasional 2019",
    description: LOREM,
    thumbnail: "/images/moment-5.jpg",
    url: "#",
  },
  {
    id: "v6",
    title: "Open House Nenggala Kedoya",
    description: LOREM,
    thumbnail: "/images/moment-6.jpg",
    url: "#",
  },
  {
    id: "v7",
    title: "Pelatihan Internasional Master",
    description: LOREM,
    thumbnail: "/images/moment-7.jpg",
    url: "#",
  },
  {
    id: "v8",
    title: "Hanmadang Festival 2019",
    description: LOREM,
    thumbnail: "/images/moment-8.jpg",
    url: "#",
  },
  {
    id: "v9",
    title: "Syukuran Dojang Meruya",
    description: LOREM,
    thumbnail: "/images/moment-9.jpg",
    url: "#",
  },
  {
    id: "v10",
    title: "Latihan Pagi Cabang Bogor",
    description: LOREM,
    thumbnail: "/images/moment-10.jpg",
    url: "#",
  },
  {
    id: "v11",
    title: "Webinar Taekwondo & Karakter",
    description: LOREM,
    thumbnail: "/images/moment-11.jpg",
    url: "#",
  },
  {
    id: "v12",
    title: "Demo Taekwondo Nenggala 2020",
    description: LOREM,
    thumbnail: "/images/moment-12.jpg",
    url: "#",
  },
];

const PER_PAGE = 5;

export default function OurMoment() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = VIDEOS.filter((v) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      v.title.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <section className="bg-paper py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Header: title + search */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight md:text-4xl">
            Our Moment
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
              aria-label="Search moments"
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

        {/* Items list */}
        <div className="mt-10 space-y-8">
          {paginated.length === 0 ? (
            <p className="py-12 text-center text-muted">
              Tidak ada hasil untuk &ldquo;{query}&rdquo;.
            </p>
          ) : (
            paginated.map((video) => (
              <article
                key={video.id}
                className="grid gap-5 md:grid-cols-[280px_1fr] md:gap-7"
              >
                <a
                  href={video.url}
                  className="group relative block aspect-video overflow-hidden rounded-sm bg-ink"
                >
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 280px"
                  />
                  {/* YouTube-style play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-10 w-14 items-center justify-center rounded-md bg-red-600 shadow-md transition-transform group-hover:scale-110">
                      <Play
                        size={20}
                        fill="white"
                        className="ml-0.5 text-white"
                      />
                    </div>
                  </div>
                </a>

                <div>
                  <h3 className="font-display text-lg font-bold uppercase tracking-wide underline underline-offset-4 md:text-xl">
                    {video.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink md:text-base">
                    {video.description}
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
