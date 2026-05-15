import Image from "next/image";

interface SubProgram {
  name: string;
  description: string;
  image: string;
}

interface ProgramDetailProps {
  title: string;
  description: string;
  subPrograms: SubProgram[];
}

export default function ProgramDetail({
  title,
  description,
  subPrograms,
}: ProgramDetailProps) {
  return (
    <section className="bg-paper py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="font-display text-4xl font-bold uppercase tracking-tight md:text-5xl">
          {title}
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink md:text-base">
          {description}
        </p>

        <div className="mt-10 space-y-8 md:space-y-10">
          {subPrograms.map((sub) => (
            <article
              key={sub.name}
              className="grid gap-5 md:grid-cols-[220px_1fr] md:gap-7"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-ink">
                <Image
                  src={sub.image}
                  alt={sub.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 220px"
                />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold uppercase tracking-wider md:text-3xl">
                  {sub.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink md:text-base">
                  {sub.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
