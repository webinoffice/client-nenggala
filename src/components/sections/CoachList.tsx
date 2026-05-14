import Image from "next/image";
import { cn } from "@/lib/utils";

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

export default function CoachList({ title, featured, others }: CoachListProps) {
  // Place featured in the middle of the lineup
  const half = Math.floor(others.length / 2);
  const lineup: Array<Coach & { isFeatured: boolean }> = [
    ...others.slice(0, half).map((c) => ({ ...c, isFeatured: false })),
    { ...featured, isFeatured: true },
    ...others.slice(half).map((c) => ({ ...c, isFeatured: false })),
  ];

  return (
    <section className="bg-neutral-200 py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="text-center font-display text-2xl font-bold uppercase tracking-tight md:text-3xl">
          {title}
        </h2>

        <div className="coach-lineup no-scrollbar mt-8 flex items-end justify-start gap-3 overflow-x-auto pb-3 md:justify-center md:gap-4">
          {lineup.map((coach, i) => (
            <article
              key={`${coach.id}-${i}`}
              className="coach-card group/card relative flex-shrink-0 text-center"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div
                className={cn(
                  "relative overflow-hidden rounded-sm bg-ink shadow-md",
                  "aspect-[3/4]",
                  coach.isFeatured
                    ? "w-32 sm:w-36 md:w-44 lg:w-48"
                    : "w-24 sm:w-28 md:w-32 lg:w-36",
                )}
              >
                {coach.isFeatured && (
                  <>
                    <div className="absolute inset-x-0 top-0 z-20 h-1 bg-brand" />
                    <div className="featured-shine pointer-events-none absolute inset-0 z-10" />
                  </>
                )}
                <Image
                  src={coach.image}
                  alt={coach.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover/card:scale-110"
                  sizes="(max-width: 768px) 35vw, 200px"
                />
              </div>
              <p
                className={cn(
                  "mt-2 font-display font-bold uppercase tracking-widest text-ink",
                  coach.isFeatured
                    ? "text-sm md:text-base"
                    : "text-xs md:text-sm",
                )}
              >
                {coach.name}
              </p>
              <p
                className={cn(
                  "font-semibold uppercase tracking-widest text-brand",
                  coach.isFeatured
                    ? "text-xs md:text-sm"
                    : "text-[10px] md:text-xs",
                )}
              >
                {coach.rank}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
