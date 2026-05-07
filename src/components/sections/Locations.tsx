import Image from "next/image";

const LOCATIONS = [
  {
    name: "Tajur Trade Mall",
    city: "Bogor",
    image: "/images/location-tajur.jpg",
  },
  {
    name: "Kedoya Sport Club",
    city: "Jakarta Barat",
    image: "/images/location-kedoya.jpg",
  },
  {
    name: "Meruya Sport Club",
    city: "Jakarta Barat",
    image: "/images/location-meruya.jpg",
  },
];

export default function Locations() {
  return (
    <section className="bg-paper-soft py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="text-center font-display text-3xl font-bold uppercase tracking-tight md:text-4xl">
          Wherever You Are… <span className="text-brand">We&apos;re There</span>
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {LOCATIONS.map((loc) => (
            <article
              key={loc.name}
              className="overflow-hidden rounded-sm bg-paper shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-4/3 overflow-hidden">
                <Image
                  src={loc.image}
                  alt={loc.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-bold uppercase tracking-wider">
                  {loc.name}
                </h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-brand">
                  {loc.city}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
