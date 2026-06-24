// src/lib/certifications.ts

export type CertRecipientType = "student" | "coach";

export interface Certification {
  id: string;
  recipientType: CertRecipientType;
  recipientUsername: string; // student or coach No. Reg
  title: string;
  date: string; // ISO 8601
  description: string;
  thumbnail: string; // small image for the list
  fullImage: string; // full-size image for the lightbox
}

// Mock — in production these come from the API filtered by recipient.
const INITIAL_CERTIFICATIONS: Certification[] = [
  {
    id: "cert-1",
    recipientType: "student",
    recipientUsername: "U0006",
    title: "1st Asia Nunchaku Showdown Asia Freestyle Division",
    date: "2021-03-20",
    description:
      "Memenangkan Lomba Nunchaku Asia Freestyle, bermain dengan poin pukulan gabus bakar menang.",
    thumbnail: "/images/event-ukt-promo.jpg",
    fullImage: "/images/event-ukt-promo.jpg",
  },
  {
    id: "cert-2",
    recipientType: "student",
    recipientUsername: "U0006",
    title: "Kejuaraan Nasional Taekwondo 2020",
    date: "2020-08-15",
    description:
      "Juara 2 kategori Kyorugi U-15. Mewakili Nenggala Academy di kejuaraan nasional terbuka.",
    thumbnail: "/images/event-ukt-promo.jpg",
    fullImage: "/images/event-ukt-promo.jpg",
  },
  {
    id: "cert-3",
    recipientType: "student",
    recipientUsername: "U0006",
    title: "Ujian Kenaikan Tingkat Sabuk Merah Strip Hitam",
    date: "2019-11-24",
    description:
      "Berhasil naik tingkat ke sabuk Merah Strip Hitam dengan nilai sempurna dalam ujian Pomsae dan Kyorugi.",
    thumbnail: "/images/event-ukt-promo.jpg",
    fullImage: "/images/event-ukt-promo.jpg",
  },
  {
    id: "cert-4",
    recipientType: "coach",
    recipientUsername: "C0001",
    title: "Sertifikasi Pelatih Nasional Taekwondo Level 2",
    date: "2022-05-10",
    description:
      "Lulus sertifikasi pelatih nasional dengan spesialisasi Kyorugi dan pembinaan atlet usia muda.",
    thumbnail: "/images/event-ukt-promo.jpg",
    fullImage: "/images/event-ukt-promo.jpg",
  },
];

let _certifications: Certification[] = [...INITIAL_CERTIFICATIONS];
const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((l) => l());
}

export function getCertifications(): Certification[] {
  return _certifications;
}
export function subscribeCertifications(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function getCertificationsFor(
  recipientType: CertRecipientType,
  recipientUsername: string,
): Certification[] {
  return _certifications.filter(
    (c) =>
      c.recipientType === recipientType &&
      c.recipientUsername === recipientUsername,
  );
}
export function getNextCertId(): string {
  return `cert-${Date.now()}`;
}
export function addCertification(cert: Certification) {
  _certifications = [cert, ..._certifications];
  notify();
}

export function formatCertDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}
