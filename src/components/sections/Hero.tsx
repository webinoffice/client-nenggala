import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink text-paper">
      <div className="pointer-events-none absolute -left-32 top-1/2 h-125 w-125 -translate-y-1/2 rounded-full bg-brand/20 blur-[120px]" />

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-2 md:gap-8 md:py-24 md:px-8">
        <div className="relative z-10 flex flex-col justify-center">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.3em] text-brand">
            Nenggala Taekwondo
            <span className="ml-2 text-paper/60">Sejak 1999</span>
          </p>

          <h1 className="mt-6 font-display text-5xl font-bold uppercase leading-[1.05] md:text-7xl">
            Berlatih,
            <br />
            Berkarya,
            <br />
            <span className="text-brand">Berprestasi!</span>
          </h1>

          <p className="mt-6 max-w-md text-sm leading-relaxed text-paper/70 md:text-base">
            Sebagai sekolah beladiri berpengalaman dengan jajaran pelatih
            bersertifikat internasional, kami hadir di Jakarta dan Tangerang
            untuk mengasah kemampuan beladiri kalian.
          </p>
        </div>

        <div className="relative h-100 md:h-130">
          <div className="absolute right-0 top-0 h-3/4 w-3/4 overflow-hidden rounded-sm">
            <Image
              src="/images/hero-main.jpg"
              alt="Atlet Nenggala Academy beraksi"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 75vw, 40vw"
            />
          </div>
          <div className="absolute bottom-0 left-0 h-1/2 w-1/2 overflow-hidden rounded-sm border-4 border-ink">
            <Image
              src="/images/hero-secondary.jpg"
              alt="Atlet Nenggala Academy beraksi"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
