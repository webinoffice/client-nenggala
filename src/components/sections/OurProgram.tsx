import Image from "next/image";
import Link from "next/link";

interface ProgramCard {
  name: string;
  image: string;
}

interface ProgramCategory {
  title: string;
  href: string;
  cards: ProgramCard[];
}

const CATEGORIES: ProgramCategory[] = [
  {
    title: "Taekwondo",
    href: "/program/taekwondo",
    cards: [
      { name: "Pomsae", image: "/images/program-taekwondo.jpg" },
      { name: "Kyurugi", image: "/images/program-taekwondo.jpg" },
      { name: "Tricking", image: "/images/program-taekwondo.jpg" },
    ],
  },
  {
    title: "Nunchaku",
    href: "/program/nunchaku",
    cards: [
      { name: "Nunchaku Do", image: "/images/program-nunchaku.jpg" },
      { name: "Kumite", image: "/images/program-nunchaku.jpg" },
      { name: "Freestyle", image: "/images/program-nunchaku.jpg" },
    ],
  },
  {
    title: "Gymnastic",
    href: "/program/gymnastic",
    cards: [
      { name: "Kids", image: "/images/program-gymnastic.jpg" },
      { name: "Teens", image: "/images/program-gymnastic.jpg" },
      { name: "Adult", image: "/images/program-gymnastic.jpg" },
    ],
  },
];

export default function OurProgram() {
  return (
    <section className="bg-paper py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="text-center font-display text-4xl font-bold uppercase tracking-tight md:text-5xl">
          Our Program
        </h2>

        <div className="mt-12 space-y-12 md:space-y-14">
          {CATEGORIES.map((category) => (
            <div key={category.title}>
              <h3 className="font-display text-2xl font-bold uppercase tracking-wider">
                {category.title}
              </h3>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
                {category.cards.map((card) => (
                  <Link
                    key={card.name}
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
