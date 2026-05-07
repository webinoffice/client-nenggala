import Hero from "@/components/sections/Hero";
import Champion from "@/components/sections/Champion";
import Locations from "@/components/sections/Locations";
import Activity from "@/components/sections/Activity";
import Mindset from "@/components/sections/Mindset";
import EventBanner from "@/components/sections/EventBanner";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Champion />
      <Locations />
      <Activity />
      <Mindset />
      <EventBanner />
    </>
  );
}
