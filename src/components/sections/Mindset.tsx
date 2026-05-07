import Image from "next/image";

export default function Mindset() {
  return (
    <section className="relative overflow-hidden bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-20 md:grid-cols-2 md:py-28 md:px-8">
        <div>
          <h2 className="font-display text-4xl font-bold uppercase leading-[1.05] tracking-tight md:text-6xl">
            White Belt
            <br />
            Mindset,
            <br />
            <span className="text-brand">Black Belt</span>
            <br />
            Focus.
          </h2>
        </div>

        <div className="relative h-90 md:h-120">
          <div className="absolute inset-0 overflow-hidden rounded-sm">
            <Image
              src="/images/mindset-master.jpg"
              alt="Atlet sabuk hitam Nenggala Academy"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
