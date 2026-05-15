import Hero from "@/components/sections/Hero";
import EventBanner from "@/components/sections/EventBanner";
import EventList from "@/components/sections/EventList";

export default function EventPage() {
  return (
    <>
      <Hero />
      <EventBanner sectionTitle="What's New" />
      <EventList />
    </>
  );
}
