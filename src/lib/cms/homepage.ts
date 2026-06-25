// src/lib/cms/homepage.ts
//
// Homepage content store (singleton). Owns the two editable banners and the
// selected "highlight" event id. The gallery is the shared gallery store
// (src/lib/cms/gallery.ts); events come from src/lib/events.ts.
//
// READ is backed by the backend (Section 3a): topBanner <- "H" Banner,
// bottomBanner <- "F" Banner Bottom, and highlightEventId is set to the shared
// HIGHLIGHT_EVENT_ID when an "Z" Event Highlight row exists (the events store
// injects that row under the same id). Hydration runs once on first subscribe.
// updateHomepageContent stays in-memory until Section 2 (CMS writes).
"use client";

import { useSyncExternalStore } from "react";
import {
  fetchContentPage,
  saveContent,
  CONTENT_TYPE,
  type ContentRow,
} from "@/lib/api/content";
import { fileUrl } from "@/lib/api/file-url";
import { HIGHLIGHT_EVENT_ID } from "@/lib/events";

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
  ensureHomepageLoaded();
  return () => {
    listeners.delete(listener);
  };
}

// ---- hydration (read API) ----
let _loaded = false;
let _loadPromise: Promise<void> | null = null;
// Backend ContentIds for the two banner rows (present only on the authed read);
// needed to edit them. 0 means "no row yet" (insert on first save).
let _topBannerId = 0;
let _bottomBannerId = 0;

function rowToBanner(row: ContentRow | undefined, fallback: Banner): Banner {
  if (!row) return fallback;
  return { src: fileUrl(row.ContentFile), alt: row.ContentTitle ?? "" };
}

async function loadHomepage(): Promise<void> {
  const data = await fetchContentPage("HomePage");
  const top = data.ObjBanner?.[0];
  const bottom = data.ObjBannerBottom?.[0];
  _topBannerId = top?.ContentId ?? 0;
  _bottomBannerId = bottom?.ContentId ?? 0;
  _content = {
    topBanner: rowToBanner(top, _content.topBanner),
    bottomBanner: rowToBanner(bottom, _content.bottomBanner),
    highlightEventId: data.ObjEventHighlight?.[0] ? HIGHLIGHT_EVENT_ID : "",
  };
  notify();
}

/** One-time hydration of homepage content from the backend. */
export function ensureHomepageLoaded(): Promise<void> {
  if (_loaded) return Promise.resolve();
  if (!_loadPromise) {
    _loadPromise = loadHomepage()
      .then(() => {
        _loaded = true;
      })
      .catch((err) => {
        console.error("Failed to load homepage content", err);
        _loadPromise = null;
      });
  }
  return _loadPromise;
}

/** Re-fetch homepage content (used after a write). */
export async function reloadHomepage(): Promise<void> {
  _loaded = false;
  _loadPromise = null;
  await ensureHomepageLoaded();
}

// ---- write API (CMS, super-admin) ----

/**
 * Update one of the two banners (image + alt). A file is required — the backend
 * deletes the stored file on every edit. Banner rows are max-1 / update-only;
 * if none exists yet (empty DB) the first save inserts it.
 */
export async function updateBanner(
  which: "top" | "bottom",
  alt: string,
  file: File,
): Promise<void> {
  const id = which === "top" ? _topBannerId : _bottomBannerId;
  await saveContent(
    {
      ContentId: id,
      ContentTitle: alt,
      ContentDesc: "",
      ContentLink: "",
      ContentTypeId:
        which === "top" ? CONTENT_TYPE.BANNER : CONTENT_TYPE.BANNER_BOTTOM,
      ContentDate: null,
      FgHighlight: "N",
      FgMode: id ? "E" : "I",
    },
    file,
  );
  await reloadHomepage();
}

/**
 * Local-only update (used by the highlight-event selector). The backend models
 * the highlight as its own "Event Highlight" content row, not a reference to an
 * event in the list, so the selection cannot be persisted from a dropdown of
 * existing events. TODO(#highlight): build a dedicated Event Highlight editor.
 */
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
