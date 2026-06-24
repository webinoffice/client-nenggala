// src/lib/cms/about.ts
//
// About page content store (singleton). Owns the "Our Profile" text + video and
// the facility list. The gallery is the shared gallery store
// (src/lib/cms/gallery.ts).
//
// Same in-memory pattern as the other stores. When the API arrives, replace the
// bodies with fetch/mutation calls — the interface stays the same.
"use client";

import { useSyncExternalStore } from "react";

export interface Facility {
  id: string;
  name: string;
  detail: string;
  image: string;
}

export interface AboutContent {
  heading: string;
  paragraphs: string[];
  videoSrc: string;
  videoPoster: string;
  facilities: Facility[];
}

export const INITIAL_ABOUT: AboutContent = {
  heading: "Our Profile",
  paragraphs: [
    "Nenggala Taekwondo Academy adalah sekolah beladiri berpengalaman yang telah berdiri sejak 1998. Dengan jajaran pelatih bersertifikat internasional, kami berkomitmen untuk mengasah kemampuan beladiri dan membangun karakter para siswa di Jakarta, Tangerang, dan Bogor.",
    "Setiap program kami dirancang untuk mengembangkan disiplin, ketahanan mental, dan kemampuan teknis — dari pemula hingga atlet yang siap bertanding di tingkat nasional dan internasional.",
  ],
  videoSrc: "/videos/profile-loop.mp4",
  videoPoster: "/images/profile-video-poster.jpg",
  facilities: [
    { id: "f01", name: "Main Dojang", detail: "Indoor sparring hall · 320 m²", image: "/images/facilities/facility-01.jpg" },
    { id: "f02", name: "Strength Lab", detail: "Conditioning & weights", image: "/images/facilities/facility-02.jpg" },
    { id: "f03", name: "Junior Studio", detail: "Ages 5–10 training area", image: "/images/facilities/facility-03.jpg" },
    { id: "f04", name: "Outdoor Mat", detail: "Open-air training ground", image: "/images/facilities/facility-04.jpg" },
    { id: "f05", name: "Mirror Room", detail: "Forms & technique studio", image: "/images/facilities/facility-05.jpg" },
    { id: "f06", name: "Recovery Lounge", detail: "Stretching & mobility", image: "/images/facilities/facility-06.jpg" },
    { id: "f07", name: "Equipment Storage", detail: "Mats, paddles, hogu", image: "/images/facilities/facility-07.jpg" },
    { id: "f08", name: "Spectator Gallery", detail: "Tournament seating", image: "/images/facilities/facility-08.jpg" },
    { id: "f09", name: "Reception & Café", detail: "Lobby and refreshments", image: "/images/facilities/facility-09.jpg" },
  ],
};

// ---- mutable store ----
let _content: AboutContent = {
  ...INITIAL_ABOUT,
  paragraphs: [...INITIAL_ABOUT.paragraphs],
  facilities: INITIAL_ABOUT.facilities.map((f) => ({ ...f })),
};
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function getAboutContent(): AboutContent {
  return _content;
}

export function subscribeAbout(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Update the text/video fields (not the facility list). */
export function updateAboutContent(
  patch: Partial<Omit<AboutContent, "facilities">>,
) {
  _content = { ..._content, ...patch };
  notify();
}

let _facilityCounter = INITIAL_ABOUT.facilities.length;
function nextFacilityId(): string {
  _facilityCounter += 1;
  return `f${String(_facilityCounter).padStart(2, "0")}-${Date.now()}`;
}

export function addFacility(facility: Omit<Facility, "id">) {
  _content = {
    ..._content,
    facilities: [..._content.facilities, { id: nextFacilityId(), ...facility }],
  };
  notify();
}

export function updateFacility(id: string, patch: Partial<Omit<Facility, "id">>) {
  _content = {
    ..._content,
    facilities: _content.facilities.map((f) =>
      f.id === id ? { ...f, ...patch } : f,
    ),
  };
  notify();
}

export function removeFacility(id: string) {
  _content = {
    ..._content,
    facilities: _content.facilities.filter((f) => f.id !== id),
  };
  notify();
}

/** React hook — subscribe a client component to about content. */
export function useAboutContent(): AboutContent {
  return useSyncExternalStore(
    subscribeAbout,
    getAboutContent,
    getAboutContent,
  );
}
