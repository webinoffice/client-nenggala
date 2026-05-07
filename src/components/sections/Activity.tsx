import Image from "next/image";

const ACTIVITIES = [
  { title: "Latihan Bersama", image: "/images/activity-latihan.jpg" },
  { title: "Hanmadang 2019", image: "/images/activity-hanmadang.jpg" },
  { title: "Syukuran Dojang Kedoya", image: "/images/activity-syukuran.jpg" },
  { title: "UKT Maret 2020", image: "/images/activity-ukt-maret.jpg" },
];

export default function Activity() {
  return (
    <section className="bg-paper py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="text-center font-display text-4xl font-bold uppercase tracking-tight md:text-5xl">
          Our Activity
        </h2>

        <div className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4">
          {ACTIVITIES.map((a) => (
            <article
              key={a.title}
              className="w-[85%] shrink-0 snap-center md:w-[calc(33.333%-1rem)]"
            >
              <div className="relative aspect-16/10 overflow-hidden rounded-sm bg-ink">
                <Image
                  src={a.image}
                  alt={a.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 85vw, 33vw"
                />
              </div>
              <p className="mt-4 text-center font-display text-base font-semibold uppercase tracking-widest">
                {a.title}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
