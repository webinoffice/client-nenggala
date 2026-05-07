import Image from "next/image";
import Button from "@/components/ui/Button";

const PROGRAMS = [
  { name: "Taekwondo", image: "/images/program-taekwondo.jpg" },
  { name: "Nunchaku-Do", image: "/images/program-nunchaku.jpg" },
  { name: "Gymnastic", image: "/images/program-gymnastic.jpg" },
];

export default function Champion() {
  return (
    <section className="bg-paper py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-bold uppercase tracking-tight md:text-5xl">
            Here to Create a Champion
          </h2>
          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-muted">
            Discipline Defines You
          </p>
          <div className="mt-8">
            <Button href="/program">Explore Our Programs</Button>
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {PROGRAMS.map((p) => (
            <div key={p.name} className="group">
              <div className="relative aspect-4/5 overflow-hidden rounded-sm bg-ink">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <p className="mt-4 text-center font-display text-lg font-semibold uppercase tracking-widest">
                {p.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
