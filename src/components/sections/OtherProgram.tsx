import Image from "next/image";

interface OtherProgramItem {
  name: string;
  image: string;
}

interface OtherProgramProps {
  programs: OtherProgramItem[];
}

export default function OtherProgram({ programs }: OtherProgramProps) {
  return (
    <section className="bg-paper py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight md:text-3xl">
          Other Program
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
          {programs.map((p) => (
            <article
              key={p.name}
              className="overflow-hidden rounded-md border border-ink/10 bg-paper"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-ink">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="border-t border-ink/10 px-3 py-3 text-center">
                <p className="text-sm font-bold uppercase tracking-widest">
                  {p.name}
                </p>
                {/* Non-clickable per design — wire up later */}
                <button
                  type="button"
                  className="mt-3 w-full rounded-sm bg-brand px-3 py-2 text-xs font-bold uppercase tracking-widest text-brand-foreground transition-colors hover:bg-brand-hover"
                >
                  View Details
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
