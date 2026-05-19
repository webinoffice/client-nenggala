// src/lib/certifications.ts

export interface Certification {
  id: string;
  studentUsername: string;
  title: string;
  date: string; // ISO 8601
  description: string;
  thumbnail: string; // small image for the list
  fullImage: string; // full-size image for the lightbox
}

// Mock — in production these would come from the API filtered by current user.
export const CERTIFICATIONS: Certification[] = [
  {
    id: "cert-1",
    studentUsername: "U0006",
    title: "1st Asia Nunchaku Showdown Asia Freestyle Division",
    date: "2021-03-20",
    description:
      "Memenangkan Lomba Nunchaku Asia Freestyle, bermain dengan poin pukulan gabus bakar menang.",
    thumbnail: "/images/event-ukt-promo.jpg",
    fullImage: "/images/event-ukt-promo.jpg",
  },
  {
    id: "cert-2",
    studentUsername: "U0006",
    title: "Kejuaraan Nasional Taekwondo 2020",
    date: "2020-08-15",
    description:
      "Juara 2 kategori Kyorugi U-15. Mewakili Nenggala Academy di kejuaraan nasional terbuka.",
    thumbnail: "/images/event-ukt-promo.jpg",
    fullImage: "/images/event-ukt-promo.jpg",
  },
  {
    id: "cert-3",
    studentUsername: "U0006",
    title: "Ujian Kenaikan Tingkat Sabuk Merah Strip Hitam",
    date: "2019-11-24",
    description:
      "Berhasil naik tingkat ke sabuk Merah Strip Hitam dengan nilai sempurna dalam ujian Pomsae dan Kyorugi.",
    thumbnail: "/images/event-ukt-promo.jpg",
    fullImage: "/images/event-ukt-promo.jpg",
  },
];

export function formatCertDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}