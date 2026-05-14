import Image from "next/image";

export default function Mindset() {
  return (
    <section className="relative w-full">
      <div className="relative aspect-[1920/600] w-full">
        <Image
          src="/images/mindset-banner.jpg"
          alt="White Belt Mindset, Black Belt Focus"
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>
    </section>
  );
}
