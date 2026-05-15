import Hero from "@/components/sections/Hero";
import ProgramDetail from "@/components/sections/ProgramDetail";
import ImageCarousel from "@/components/sections/ImageCarousel";
import OtherProgram from "@/components/sections/OtherProgram";
import EventBanner from "@/components/sections/EventBanner";

const TAEKWONDO_INTRO =
  "Taekwondo adalah seni beladiri tradisional Korea yang menekankan disiplin, kontrol diri, dan kekuatan mental. Di Nenggala Academy, kami mengajarkan Taekwondo modern yang menggabungkan teknik tradisional dengan pendekatan pelatihan kontemporer untuk semua usia, dari pemula hingga atlet kompetitif. Program kami dirancang untuk membangun karakter sekaligus kemampuan teknis yang siap bersaing di kancah nasional dan internasional.";

const SUB_PROGRAMS = [
  {
    name: "Pomsae",
    description:
      "Pomsae adalah rangkaian gerakan teknik Taekwondo yang dilakukan dalam pola tertentu. Latihan Pomsae mengasah ketepatan, ritme, dan ekspresi seni beladiri. Cocok untuk semua tingkatan, dari sabuk putih hingga sabuk hitam, dengan fokus pada teknik dan estetika gerakan.",
    image: "/images/program-taekwondo.jpg",
  },
  {
    name: "Kyurugi",
    description:
      "Kyurugi atau pertarungan adalah aspek kompetitif dari Taekwondo. Atlet berlatih kecepatan, refleks, dan strategi bertanding untuk menghadapi lawan dalam pertandingan resmi. Program ini cocok untuk siswa yang ingin masuk ke jalur kompetisi nasional dan internasional.",
    image: "/images/program-taekwondo.jpg",
  },
  {
    name: "Tricking",
    description:
      "Tricking menggabungkan gerakan Taekwondo dengan gerakan akrobatik dan gaya jalanan modern. Cocok untuk atlet yang ingin mengekspresikan kreativitas dalam bentuk gerakan dinamis, sekaligus melatih kelincahan dan kekuatan inti tubuh.",
    image: "/images/program-taekwondo.jpg",
  },
];

const OTHER_PROGRAMS = [
  { name: "Freestyle", image: "/images/program-nunchaku.jpg" },
  { name: "Teens", image: "/images/program-gymnastic.jpg" },
  { name: "Kumite", image: "/images/program-nunchaku.jpg" },
];

export default function TaekwondoPage() {
  return (
    <>
      <Hero />
      <ProgramDetail
        title="Taekwondo"
        description={TAEKWONDO_INTRO}
        subPrograms={SUB_PROGRAMS}
      />
      <ImageCarousel title="Activity Gallery" />
      <OtherProgram programs={OTHER_PROGRAMS} />
      <EventBanner />
    </>
  );
}
