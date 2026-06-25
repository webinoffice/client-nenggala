"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { usePrograms, useSubPrograms } from "@/lib/marketing/programs";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function OurProgram() {
  const programs = usePrograms();
  const subPrograms = useSubPrograms();

  // Group sub-programs under their parent program; only show programs that have
  // at least one sub-program card.
  const categories = useMemo(
    () =>
      programs
        .map((program) => ({
          ...program,
          href: `/program/${slugify(program.name)}`,
          cards: subPrograms.filter((s) => s.programId === program.id),
        }))
        .filter((category) => category.cards.length > 0),
    [programs, subPrograms],
  );

  return (
    <section className="bg-paper py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="text-center font-display text-4xl font-bold uppercase tracking-tight md:text-5xl">
          Our Program
        </h2>

        <div className="mt-12 space-y-12 md:space-y-14">
          {categories.map((category) => (
            <div key={category.id}>
              <h3 className="font-display text-2xl font-bold uppercase tracking-wider">
                {category.name}
              </h3>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
                {category.cards.map((card) => (
                  <Link
                    key={card.id}
                    href={category.href}
                    className="group overflow-hidden rounded-md border border-ink/10 bg-paper transition-shadow hover:shadow-md"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-ink">
                      <Image
                        src={card.image}
                        alt={card.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <div className="border-t border-ink/10 px-3 py-3 text-center">
                      <p className="text-sm font-bold uppercase tracking-widest">
                        {card.name}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
