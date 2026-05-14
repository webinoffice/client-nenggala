import Hero from "@/components/sections/Hero";
import OurProfile from "@/components/sections/OurProfile";
import Founder from "@/components/sections/Founder";
import CoachList from "@/components/sections/CoachList";

const HEAD_COACH = {
  id: "hc-1",
  name: "Carolina",
  rank: "Dan 6",
  image: "/images/coach-1.jpg",
};

const COACHES = [
  {
    id: "c-1",
    name: "Marvin Hadi",
    rank: "Dan 5",
    image: "/images/coach-3.jpg",
  },
  {
    id: "c-2",
    name: "Andi Pratama",
    rank: "Dan 5",
    image: "/images/coach-4.jpg",
  },
  {
    id: "c-3",
    name: "Budi Santoso",
    rank: "Dan 5",
    image: "/images/coach-5.jpg",
  },
  {
    id: "c-4",
    name: "Citra Wijaya",
    rank: "Dan 4",
    image: "/images/coach-6.jpg",
  },
  {
    id: "c-5",
    name: "David Kurniawan",
    rank: "Dan 4",
    image: "/images/coach-7.jpg",
  },
  { id: "c-6", name: "Eka Putri", rank: "Dan 4", image: "/images/coach-3.jpg" },
];

const HEAD_ASSISTANT = {
  id: "ha-1",
  name: "Marvin Hadi",
  rank: "Dan 5",
  image: "/images/coach-2.jpg",
};

const ASSISTANT_COACHES = [
  {
    id: "ac-1",
    name: "Galih Mahendra",
    rank: "Dan 3",
    image: "/images/coach-4.jpg",
  },
  {
    id: "ac-2",
    name: "Hana Saputri",
    rank: "Dan 3",
    image: "/images/coach-5.jpg",
  },
  {
    id: "ac-3",
    name: "Indra Wijaya",
    rank: "Dan 2",
    image: "/images/coach-6.jpg",
  },
  {
    id: "ac-4",
    name: "Joko Setyo",
    rank: "Dan 2",
    image: "/images/coach-7.jpg",
  },
  {
    id: "ac-5",
    name: "Kirana Dewi",
    rank: "Dan 2",
    image: "/images/coach-3.jpg",
  },
  {
    id: "ac-6",
    name: "Lukman Hakim",
    rank: "Dan 1",
    image: "/images/coach-4.jpg",
  },
];

export default function AboutUsPage() {
  return (
    <>
      <Hero />
      <OurProfile />
      <Founder />
      <CoachList title="The Coach" featured={HEAD_COACH} others={COACHES} />
      <CoachList
        title="The Assistant Coaches"
        featured={HEAD_ASSISTANT}
        others={ASSISTANT_COACHES}
      />
    </>
  );
}
