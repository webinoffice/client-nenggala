"use client";

import Image from "next/image";
import { useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventItem {
  id: string;
  title: string;
  date: string; // ISO 8601
  description: string;
  image: string;
  registerUrl: string;
}

const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

const IMG = "/images/event-ukt-promo.jpg";

const EVENTS: EventItem[] = [
  {
    id: "e1",
    title: "Ujian Kenaikan Tingkat 2019",
    date: "2019-11-24",
    description: LOREM,
    image: IMG,
    registerUrl: "bit.ly/nenggala-ukt-nov-2019",
  },
  {
    id: "e2",
    title: "Hanmadang Cup 2019",
    date: "2019-10-15",
    description: LOREM,
    image: IMG,
    registerUrl: "bit.ly/nenggala-hanmadang-2019",
  },
  {
    id: "e3",
    title: "Open Tournament Jakarta 2019",
    date: "2019-09-20",
    description: LOREM,
    image: IMG,
    registerUrl: "bit.ly/nenggala-open-jkt-2019",
  },
  {
    id: "e4",
    title: "Pelatihan Master Internasional",
    date: "2019-08-12",
    description: LOREM,
    image: IMG,
    registerUrl: "bit.ly/nenggala-master-2019",
  },
  {
    id: "e5",
    title: "Kejuaraan Nasional U-15",
    date: "2019-07-30",
    description: LOREM,
    image: IMG,
    registerUrl: "bit.ly/nenggala-u15-2019",
  },
  {
    id: "e6",
    title: "Latihan Bersama Nasional 2019",
    date: "2019-07-05",
    description: LOREM,
    image: IMG,
    registerUrl: "bit.ly/nenggala-latihan-nas-2019",
  },
  {
    id: "e7",
    title: "Seminar Taekwondo Kukkiwon",
    date: "2019-06-22",
    description: LOREM,
    image: IMG,
    registerUrl: "bit.ly/nenggala-seminar-kukkiwon",
  },
  {
    id: "e8",
    title: "Open House Nenggala 2019",
    date: "2019-06-10",
    description: LOREM,
    image: IMG,
    registerUrl: "bit.ly/nenggala-openhouse-2019",
  },
  {
    id: "e9",
    title: "Demo Taekwondo HUT RI",
    date: "2019-08-17",
    description: LOREM,
    image: IMG,
    registerUrl: "bit.ly/nenggala-demo-hut-ri",
  },
  {
    id: "e10",
    title: "Ujian Kenaikan Tingkat Maret",
    date: "2019-03-24",
    description: LOREM,
    image: IMG,
    registerUrl: "bit.ly/nenggala-ukt-mar-2019",
  },
  {
    id: "e11",
    title: "Ujian Kenaikan Tingkat Juli",
    date: "2019-07-21",
    description: LOREM,
    image: IMG,
    registerUrl: "bit.ly/nenggala-ukt-jul-2019",
  },
  {
    id: "e12",
    title: "Webinar Karakter & Taekwondo",
    date: "2019-05-18",
    description: LOREM,
    image: IMG,
    registerUrl: "bit.ly/nenggala-webinar-karakter",
  },
  {
    id: "e13",
    title: "Latihan Pagi Cabang Bogor",
    date: "2019-05-05",
    description: LOREM,
    image: IMG,
    registerUrl: "bit.ly/nenggala-latihan-bogor",
  },
  {
    id: "e14",
    title: "Pertandingan Persahabatan",
    date: "2019-04-28",
    description: LOREM,
    image: IMG,
    registerUrl: "bit.ly/nenggala-persahabatan-2019",
  },
  {
    id: "e15",
    title: "Pelatihan Wasit Internasional",
    date: "2019-04-14",
    description: LOREM,
    image: IMG,
    registerUrl: "bit.ly/nenggala-wasit-2019",
  },
  {
    id: "e16",
    title: "Hanmadang Festival Jakarta",
    date: "2019-03-30",
    description: LOREM,
    image: IMG,
    registerUrl: "bit.ly/nenggala-hanmadang-jkt",
  },
  {
    id: "e17",
    title: "Workshop Pelatih Taekwondo",
    date: "2019-02-25",
    description: LOREM,
    image: IMG,
    registerUrl: "bit.ly/nenggala-workshop-pelatih",
  },
  {
    id: "e18",
    title: "Ujian Kenaikan Tingkat Mei",
    date: "2019-05-26",
    description: LOREM,
    image: IMG,
    registerUrl: "bit.ly/nenggala-ukt-mei-2019",
  },
  {
    id: "e19",
    title: "Kompetisi Antar Sekolah 2019",
    date: "2019-02-09",
    description: LOREM,
    image: IMG,
    registerUrl: "bit.ly/nenggala-antar-sekolah",
  },
  {
    id: "e20",
    title: "Latihan Gabungan Kedoya-Meruya",
    date: "2019-01-20",
    description: LOREM,
    image: IMG,
    registerUrl: "bit.ly/nenggala-gabungan-kdy-mry",
  },
  {
    id: "e21",
    title: "Latihan Gabungan Bogor-Tangerang",
    date: "2019-01-13",
    description: LOREM,
    image: IMG,
    registerUrl: "bit.ly/nenggala-gabungan-bgr-tgr",
  },
  {
    id: "e22",
    title: "Selebrasi 21 Tahun Nenggala",
    date: "2019-02-08",
    description: LOREM,
    image: IMG,
    registerUrl: "bit.ly/nenggala-21-tahun",
  },
  {
    id: "e23",
    title: "Pelatihan Pelatih Cabang",
    date: "2018-12-22",
    description: LOREM,
    image: IMG,
    registerUrl: "bit.ly/nenggala-pelatih-cabang",
  },
  {
    id: "e24",
    title: "Ujian Pemegang Sabuk Hitam",
    date: "2018-12-08",
    description: LOREM,
    image: IMG,
    registerUrl: "bit.ly/nenggala-sabuk-hitam",
  },
  {
    id: "e25",
    title: "Latihan Khusus Atlet Pra-Pelatnas",
    date: "2018-11-17",
    description: LOREM,
    image: IMG,
    registerUrl: "bit.ly/nenggala-atlet-pra-pelatnas",
  },
];

const PER_PAGE = 10;

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export default function EventList() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = EVENTS.filter((e) => {
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
                    {formatDate(event.date)}
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
