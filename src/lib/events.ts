// src/lib/events.ts
//
// Canonical events store. Feeds the marketing event list (/event), the
// homepage/gallery/event "highlight" banner, and the CMS Events editor.
//
// Same in-memory pattern as the other stores (INITIAL_* + listeners + notify +
// get/subscribe/mutators). When the API arrives, replace the bodies of these
// functions with fetch/mutation calls — the component-facing interface stays
// the same.
"use client";

import { useSyncExternalStore } from "react";

export type EventStatus = "Active" | "Inactive";

export interface EventItem {
  id: string;
  title: string;
  date: string; // ISO 8601 (YYYY-MM-DD)
  description: string;
  image: string;
  registerUrl: string;
  status: EventStatus;
  updatedBy: string;
  updateDate: string; // ISO
}

const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

const IMG = "/images/event-ukt-promo.jpg";

const seed = (
  id: string,
  title: string,
  date: string,
  registerUrl: string,
  status: EventStatus = "Active",
): EventItem => ({
  id,
  title,
  date,
  description: LOREM,
  image: IMG,
  registerUrl,
  status,
  updatedBy: "Carolina",
  updateDate: "2025-12-28T19:41:32Z",
});

export const INITIAL_EVENTS: EventItem[] = [
  seed("e1", "Ujian Kenaikan Tingkat 2019", "2019-11-24", "bit.ly/nenggala-ukt-nov-2019"),
  seed("e2", "Hanmadang Cup 2019", "2019-10-15", "bit.ly/nenggala-hanmadang-2019"),
  seed("e3", "Open Tournament Jakarta 2019", "2019-09-20", "bit.ly/nenggala-open-jkt-2019"),
  seed("e4", "Pelatihan Master Internasional", "2019-08-12", "bit.ly/nenggala-master-2019"),
  seed("e5", "Kejuaraan Nasional U-15", "2019-07-30", "bit.ly/nenggala-u15-2019"),
  seed("e6", "Latihan Bersama Nasional 2019", "2019-07-05", "bit.ly/nenggala-latihan-nas-2019"),
  seed("e7", "Seminar Taekwondo Kukkiwon", "2019-06-22", "bit.ly/nenggala-seminar-kukkiwon"),
  seed("e8", "Open House Nenggala 2019", "2019-06-10", "bit.ly/nenggala-openhouse-2019"),
  seed("e9", "Demo Taekwondo HUT RI", "2019-08-17", "bit.ly/nenggala-demo-hut-ri"),
  seed("e10", "Ujian Kenaikan Tingkat Maret", "2019-03-24", "bit.ly/nenggala-ukt-mar-2019"),
  seed("e11", "Ujian Kenaikan Tingkat Juli", "2019-07-21", "bit.ly/nenggala-ukt-jul-2019"),
  seed("e12", "Webinar Karakter & Taekwondo", "2019-05-18", "bit.ly/nenggala-webinar-karakter"),
  seed("e13", "Latihan Pagi Cabang Bogor", "2019-05-05", "bit.ly/nenggala-latihan-bogor"),
  seed("e14", "Pertandingan Persahabatan", "2019-04-28", "bit.ly/nenggala-persahabatan-2019"),
  seed("e15", "Pelatihan Wasit Internasional", "2019-04-14", "bit.ly/nenggala-wasit-2019"),
  seed("e16", "Hanmadang Festival Jakarta", "2019-03-30", "bit.ly/nenggala-hanmadang-jkt"),
  seed("e17", "Workshop Pelatih Taekwondo", "2019-02-25", "bit.ly/nenggala-workshop-pelatih"),
  seed("e18", "Ujian Kenaikan Tingkat Mei", "2019-05-26", "bit.ly/nenggala-ukt-mei-2019"),
  seed("e19", "Kompetisi Antar Sekolah 2019", "2019-02-09", "bit.ly/nenggala-antar-sekolah"),
  seed("e20", "Latihan Gabungan Kedoya-Meruya", "2019-01-20", "bit.ly/nenggala-gabungan-kdy-mry"),
  seed("e21", "Latihan Gabungan Bogor-Tangerang", "2019-01-13", "bit.ly/nenggala-gabungan-bgr-tgr"),
  seed("e22", "Selebrasi 21 Tahun Nenggala", "2019-02-08", "bit.ly/nenggala-21-tahun"),
  seed("e23", "Pelatihan Pelatih Cabang", "2018-12-22", "bit.ly/nenggala-pelatih-cabang"),
  seed("e24", "Ujian Pemegang Sabuk Hitam", "2018-12-08", "bit.ly/nenggala-sabuk-hitam"),
  seed("e25", "Latihan Khusus Atlet Pra-Pelatnas", "2018-11-17", "bit.ly/nenggala-atlet-pra-pelatnas"),
];

// ---- mutable store ----
let _events: EventItem[] = [...INITIAL_EVENTS];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function getEvents(): EventItem[] {
  return _events;
}

export function subscribeEvents(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getEventById(id: string): EventItem | null {
  return _events.find((e) => e.id === id) ?? null;
}

export function getNextEventId(): string {
  const max = _events.reduce((m, e) => {
    const num = parseInt(e.id.replace(/^e/, ""), 10);
    return Number.isFinite(num) && num > m ? num : m;
  }, 0);
  return `e${max + 1}`;
}

export function addEvent(event: EventItem) {
  _events = [event, ..._events];
  notify();
}

export function updateEvent(id: string, patch: Partial<EventItem>) {
  _events = _events.map((e) => (e.id === id ? { ...e, ...patch } : e));
  notify();
}

export function removeEvent(id: string) {
  _events = _events.filter((e) => e.id !== id);
  notify();
}

export function toggleEventStatus(id: string, by: string) {
  _events = _events.map((e) =>
    e.id === id
      ? {
          ...e,
          status: e.status === "Active" ? "Inactive" : "Active",
          updatedBy: by,
          updateDate: new Date().toISOString(),
        }
      : e,
  );
  notify();
}

/** React hook — subscribe a client component to the events list. */
export function useEvents(): EventItem[] {
  return useSyncExternalStore(subscribeEvents, getEvents, getEvents);
}

export function formatEventDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}
