import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export default function EventBanner() {
  return (
    <section className="bg-paper py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-6 md:grid-cols-5">
          <article className="md:col-span-3 rounded-sm bg-accent p-8 text-accent-foreground md:p-10">
            <p className="text-xs font-bold uppercase tracking-widest">
              Event Terbaru
            </p>
            <h3 className="mt-3 font-display text-3xl font-bold uppercase leading-tight md:text-4xl">
              Ujian Kenaikan Tingkat 2019
            </h3>
            <p className="mt-2 text-sm font-semibold">24 November 2019</p>
            <p className="mt-4 max-w-md text-sm leading-relaxed">
              Saatnya menunjukkan latihan, teknik, dan semangat juangmu di Ujian
              Kenaikan Tingkat 2019. Jadilah bagian dari generasi Taekwondo yang
              lebih kuat dan lebih percaya diri.
            </p>
            <a
              href="#"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest underline-offset-4 hover:underline"
            >
              Lihat Detail Event
              <ArrowUpRight size={16} />
            </a>
          </article>

          <article className="md:col-span-2 relative aspect-4/3 md:aspect-auto overflow-hidden rounded-sm bg-ink">
            <Image
              src="/images/event-ukt-promo.jpg"
              alt="UKT 21 Promo"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </article>
        </div>
      </div>
    </section>
  );
}
