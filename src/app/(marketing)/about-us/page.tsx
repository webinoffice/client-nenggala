import Hero from "@/components/sections/Hero";
import OurProfile from "@/components/sections/OurProfile";
import Founder from "@/components/sections/Founder";
import CoachSections from "@/components/sections/CoachSections";
import ImageCarousel from "@/components/sections/ImageCarousel";
import Facility from "@/components/sections/Facility";

export default function AboutUsPage() {
  return (
    <>
      <Hero />
      <OurProfile />
      <Founder />
      <CoachSections />
      <ImageCarousel title="Our Activity" />
      <Facility />
    </>
  );
}
