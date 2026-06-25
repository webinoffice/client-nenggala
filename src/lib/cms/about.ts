// src/lib/cms/about.ts
//
// About page content (singleton). Owns the "Our Profile" text + video and the
// facility list consumed by the marketing OurProfile and Facility sections.
//
// NOTE (Section 3a decision): the backend has NO storage for the profile text,
// video, or facilities — its AboutUs page only exposes coaches. So this content
// is intentionally STATIC and read-only: there are no mutators and no CMS editor
// for it (the About CMS now manages only the shared gallery). The only backend-
// backed About data is coaches, read via src/lib/marketing/coaches.ts.
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

export const ABOUT_CONTENT: AboutContent = {
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

export function getAboutContent(): AboutContent {
  return ABOUT_CONTENT;
}

// Static data — no updates, so subscribe is a no-op that never notifies.
export function subscribeAbout(): () => void {
  return () => {};
}

/** React hook — returns the static about content. */
export function useAboutContent(): AboutContent {
  return useSyncExternalStore(
    subscribeAbout,
    getAboutContent,
    getAboutContent,
  );
}
