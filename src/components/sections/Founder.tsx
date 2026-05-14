import Image from "next/image";

export default function Founder() {
  return (
    <section className="bg-paper py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight md:text-3xl">
          Founder of Nenggala
        </h2>

        <div className="mt-8 grid gap-8 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-3">
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-ink">
              <Image
                src="/images/coach-1.jpg"
                alt="Sabeumnim Carolina"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 25vw"
              />
            </div>
          </div>

          <div className="md:col-span-9">
            <h3 className="font-display text-xl font-bold uppercase tracking-wider">
              Sabeumnim Carolina, SE.
            </h3>
            <p className="mt-1 text-sm font-semibold uppercase tracking-widest text-brand">
              Dan VI Kukkiwon (Master of Taekwondo)
            </p>

            <div className="mt-5 space-y-4 text-sm leading-relaxed text-ink md:text-base">
              <p>
                Master Carolina merupakan pendiri & Pembina di Taekwondo
                Nenggala, saat ini beliau juga memberikan pelatihan dan program
                langsung khusus untuk pelatih-pelatih Nenggala.
              </p>
              <p>
                Beliau pemegang DAN 6 KUKKIWON, Master of Taekwondo, Penguji
                Internasional serta International Referee Kyorugi dan Poomsae.
                Sertifikasi Taekwondo Master diperoleh pada bulan September 2018
                dan mendapat program beasiswa dari pemerintah Korea dan
                Kukkiwon. Selain itu beliau merupakan perwakilan dari Indonesia
                yang mendapat penghargaan sebagai peserta terbaik dari 55
                Taekwondo Master yang mewakili 34 negara terpilih pada saat
                mengikuti program Master di Muju Korea.
              </p>
              <p>
                Sebagai seorang praktisi beladiri, beliau telah berkecimpung di
                dunia Taekwondo lebih dari 33 tahun, berbagai level kejuaraan
                Kyorugi dan Poomsae telah beliau ikuti dan menangkan baik yang
                nasional maupun internasional. Beliau aktif mengikuti program
                pelatihan dan seminar Taekwondo yang diselenggarakan oleh
                KUKKIWON (World Taekwondo Headquarters).
              </p>
              <p>
                Karir kepelatihannya dimulai dengan mendirikan Taekwondo
                Nenggala pada tanggal 8 Februari 1998, dimulai dari latihan
                kelas private, sekolah-sekolah baik sebagai Ekskul maupun
                enrichment, pelatihan Taekwondo Nenggala ada di Jakarta,
                Tangerang dan Bogor untuk saat ini.
              </p>
              <p>
                Hingga kini Taekwondo Nenggala mempunyai ratusan Taekwondoin,
                Black belt dan double dan, yang telah mengikuti program
                pelatihan dalam bentuk pelatihan fisik, pengataan mental,
                pembentukan teknik dan karakter, dimana program-program tersebut
                bertujuan untuk menjadikan seorang Taekwondoin yang handal dan
                sebagai bagian masyarakat yang mempunyai mental dan visi yang
                kuat untuk bekal menghadapi era modern.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
