// src/lib/cms/gallery.ts
//
// Shared gallery store. A single set of images reused by every marketing
// carousel (homepage "Our Activity", about "Our Activity", gallery page).
// Editing it in /content updates all of them.
//
// READ is backed by the backend (Section 3a): images come from the "Galery"
// content type (ContentTypeCode "G"), returned as ObjGallery on the page
// bundle. Hydration runs once on first subscribe. The mutators stay in-memory
// until Section 2 (CMS writes).
"use client";

import { useSyncExternalStore } from "react";
import {
  fetchContentPage,
  saveContent,
  deleteContent,
  CONTENT_TYPE,
} from "@/lib/api/content";
import { fileUrl } from "@/lib/api/file-url";

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
}

export const GALLERY_MIN = 3;
export const GALLERY_MAX = 9;

export const INITIAL_GALLERY: GalleryImage[] = [
  { id: "g1", src: "/images/story-1.jpg", alt: "Atlet Nenggala bertanding" },
  { id: "g2", src: "/images/story-2.jpg", alt: "Tim Nenggala juara" },
  { id: "g3", src: "/images/story-3.jpg", alt: "Latihan kelompok" },
  { id: "g4", src: "/images/story-4.jpg", alt: "Demonstrasi tim" },
  { id: "g5", src: "/images/story-5.jpg", alt: "Acara Hanmadang" },
];

// ---- mutable store ----
let _gallery: GalleryImage[] = [...INITIAL_GALLERY];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function getGallery(): GalleryImage[] {
  return _gallery;
}

export function subscribeGallery(listener: () => void) {
  listeners.add(listener);
  ensureGalleryLoaded();
  return () => {
    listeners.delete(listener);
  };
}

// ---- hydration (read API) ----
let _loaded = false;
let _loadPromise: Promise<void> | null = null;

async function loadGallery(): Promise<void> {
  const data = await fetchContentPage("HomePage");
  const rows = data.ObjGallery ?? [];
  _gallery = rows.map((row, i) => ({
    id: row.ContentId != null ? `g-${row.ContentId}` : `g-${i + 1}`,
    src: fileUrl(row.ContentFile),
    alt: row.ContentTitle ?? "",
  }));
  notify();
}

/** One-time hydration of the gallery from the backend. */
export function ensureGalleryLoaded(): Promise<void> {
  if (_loaded) return Promise.resolve();
  if (!_loadPromise) {
    _loadPromise = loadGallery()
      .then(() => {
        _loaded = true;
      })
      .catch((err) => {
        console.error("Failed to load gallery", err);
        _loadPromise = null;
      });
  }
  return _loadPromise;
}

/** Re-fetch the gallery (used after a write). */
export async function reloadGallery(): Promise<void> {
  _loaded = false;
  _loadPromise = null;
  await ensureGalleryLoaded();
}

// ---- write API (CMS, super-admin) ----

/** Recover the backend ContentId from a store id (`g-<ContentId>`). */
function contentIdFromGalleryId(id: string): number {
  const n = parseInt(id.replace(/^g-/, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

/** Add an image (uploaded inline). Returns false (no-op) at GALLERY_MAX. */
export async function addGalleryImage(file: File, alt = ""): Promise<boolean> {
  if (_gallery.length >= GALLERY_MAX) return false;
  await saveContent(
    {
      ContentId: 0,
      ContentTitle: alt,
      ContentDesc: "",
      ContentLink: "",
      ContentTypeId: CONTENT_TYPE.GALLERY,
      ContentDate: null,
      FgHighlight: "N",
      FgMode: "I",
    },
    file,
  );
  await reloadGallery();
  return true;
}

/** Remove an image. Returns false (no-op) when already at GALLERY_MIN. */
export async function removeGalleryImage(id: string): Promise<boolean> {
  if (_gallery.length <= GALLERY_MIN) return false;
  await deleteContent(contentIdFromGalleryId(id));
  await reloadGallery();
  return true;
}

/**
 * Local-only alt-text edit. The backend deletes the stored file on every edit
 * and requires a fresh upload, so alt cannot be patched on its own — this stays
 * client-only. TODO(#alt): allow updating alt without re-uploading server-side.
 */
export function updateGalleryImage(
  id: string,
  patch: Partial<Omit<GalleryImage, "id">>,
) {
  _gallery = _gallery.map((g) => (g.id === id ? { ...g, ...patch } : g));
  notify();
}

/**
 * Local-only reorder. The backend has no ordering column for gallery rows, so
 * this does not persist. TODO(#order): add a sort/order column server-side.
 */
export function moveGalleryImage(id: string, direction: -1 | 1) {
  const idx = _gallery.findIndex((g) => g.id === id);
  if (idx === -1) return;
  const target = idx + direction;
  if (target < 0 || target >= _gallery.length) return;
  const next = [..._gallery];
  [next[idx], next[target]] = [next[target], next[idx]];
  _gallery = next;
  notify();
}

/** React hook — subscribe a client component to the gallery. */
export function useGallery(): GalleryImage[] {
  return useSyncExternalStore(subscribeGallery, getGallery, getGallery);
}
