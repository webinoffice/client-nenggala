import Hero from "@/components/sections/Hero";
import Champion from "@/components/sections/Champion";
import Locations from "@/components/sections/Locations";
import Activity from "@/components/sections/Activity";
import Mindset from "@/components/sections/Mindset";
import EventBanner from "@/components/sections/EventBanner";
import ImageCarousel from "@/components/sections/ImageCarousel";
import Partner from "@/components/sections/Partner";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Champion />
      <Locations />
      <ImageCarousel title="Our Activity" />
      <Partner />
      <Mindset />
      <EventBanner />
    </>
  );
}
