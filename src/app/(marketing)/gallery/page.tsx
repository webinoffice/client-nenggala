import Hero from "@/components/sections/Hero";
import OurMoment from "@/components/sections/OurMoment";
import ImageCarousel from "@/components/sections/ImageCarousel";
import EventBanner from "@/components/sections/EventBanner";

export default function GalleryPage() {
  return (
    <>
      <Hero />
      <OurMoment />
      <ImageCarousel title="Every Belt Has a Story" />
      <EventBanner />
    </>
  );
}
