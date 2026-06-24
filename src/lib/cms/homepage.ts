// src/lib/cms/homepage.ts
//
// Homepage content store (singleton). Owns the two editable banners and the
// selected "highlight" event id. The gallery is the shared gallery store
// (src/lib/cms/gallery.ts); events come from src/lib/events.ts.
//
// Same in-memory pattern as the other stores, but the snapshot is a single
// object (not a list). When the API arrives, replace the bodies with
// fetch/mutation calls — the interface stays the same.
"use client";

import { useSyncExternalStore } from "react";

export interface Banner {
  src: string;
  alt: string;
}

export interface HomepageContent {
  topBanner: Banner;
  bottomBanner: Banner;
  /** Event highlighted in the EventBanner. Resolved against the events store. */
  highlightEventId: string;
}

export const INITIAL_HOMEPAGE: HomepageContent = {
  topBanner: { src: "/images/hero-banner.jpg", alt: "Nenggala Academy" },
  bottomBanner: {
    src: "/images/mindset-banner.jpg",
    alt: "White Belt Mindset, Black Belt Focus",
  },
  highlightEventId: "e1",
};

// ---- mutable store ----
let _content: HomepageContent = { ...INITIAL_HOMEPAGE };
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function getHomepageContent(): HomepageContent {
  return _content;
}

export function subscribeHomepage(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function updateHomepageContent(patch: Partial<HomepageContent>) {
  _content = { ..._content, ...patch };
  notify();
}

/** React hook — subscribe a client component to homepage content. */
export function useHomepageContent(): HomepageContent {
  return useSyncExternalStore(
    subscribeHomepage,
    getHomepageContent,
    getHomepageContent,
  );
}
