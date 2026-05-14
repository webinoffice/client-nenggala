export default function OurProfile() {
  return (
    <section className="bg-paper py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          {/* Yellow text card */}
          <article className="rounded-sm bg-accent p-8 text-accent-foreground md:p-10">
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight md:text-4xl">
              Our Profile
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-relaxed md:text-base">
              <p>
                Nenggala Taekwondo Academy adalah sekolah beladiri berpengalaman
                yang telah berdiri sejak 1998. Dengan jajaran pelatih
                bersertifikat internasional, kami berkomitmen untuk mengasah
                kemampuan beladiri dan membangun karakter para siswa di Jakarta,
                Tangerang, dan Bogor.
              </p>
              <p>
                Setiap program kami dirancang untuk mengembangkan disiplin,
                ketahanan mental, dan kemampuan teknis — dari pemula hingga
                atlet yang siap bertanding di tingkat nasional dan
                internasional.
              </p>
            </div>
          </article>

          {/* Looping video */}
          <div className="relative aspect-video overflow-hidden rounded-sm bg-ink">
            <video
              autoPlay
              loop
              muted
              playsInline
              poster="/images/profile-video-poster.jpg"
              className="absolute inset-0 h-full w-full object-cover"
            >
              <source src="/videos/profile-loop.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}
