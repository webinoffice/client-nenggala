"use client";

import { useAboutContent } from "@/lib/cms/about";

export default function OurProfile() {
  const { heading, paragraphs, videoSrc, videoPoster } = useAboutContent();

  return (
    <section className="bg-paper py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          {/* Yellow text card */}
          <article className="rounded-sm bg-accent p-8 text-accent-foreground md:p-10">
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight md:text-4xl">
              {heading}
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-relaxed md:text-base">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </article>

          {/* Looping video */}
          <div className="relative aspect-video overflow-hidden rounded-sm bg-ink">
            <video
              key={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              poster={videoPoster}
              className="absolute inset-0 h-full w-full object-cover"
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}
