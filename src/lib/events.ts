// src/lib/events.ts
export interface EventItem {
  id: string;
  title: string;
  date: string; // ISO 8601
  description: string;
  image: string;
  registerUrl: string;
}

const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

const IMG = "/images/event-ukt-promo.jpg";

export const EVENTS: EventItem[] = [
  {
    id: "e1",
    title: "Ujian Kenaikan Tingkat 2019",
    date: "2019-11-24",
    description: LOREM,
    image: IMG,
    registerUrl: "bit.ly/nenggala-ukt-nov-2019",
  },
  {
    id: "e2",
    title: "Hanmadang Cup 2019",
    date: "2019-10-15",
    description: LOREM,
    image: IMG,
    registerUrl: "bit.ly/nenggala-hanmadang-2019",
  },
  {
    id: "e3",
    title: "Open Tournament Jakarta 2019",
    date: "2019-09-20",
    description: LOREM,
    image: IMG,
    registerUrl: "bit.ly/nenggala-open-jkt-2019",
  },
  {
    id: "e4",
    title: "Pelatihan Master Internasional",
    date: "2019-08-12",
    description: LOREM,
    image: IMG,
    registerUrl: "bit.ly/nenggala-master-2019",
  },
];

export function formatEventDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}