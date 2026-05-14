import Image from "next/image";

interface HeroProps {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export default function Hero({
  src = "/images/hero-banner.jpg",
  alt = "Nenggala Academy",
  width = 1920,
  height = 900,
  priority = true,
}: HeroProps) {
  return (
    <section className="relative w-full">
      <div
        className="relative w-full"
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          className="object-cover"
          sizes="100vw"
        />
      </div>
    </section>
  );
}
