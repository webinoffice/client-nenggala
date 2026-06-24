// src/lib/cms/gallery.ts
//
// Shared gallery store. A single set of images reused by every marketing
// carousel (homepage "Our Activity", about "Our Activity", gallery page).
// Editing it in /content updates all of them.
//
// Same in-memory pattern as the other stores. When the API arrives, replace
// the bodies of these functions with fetch/mutation calls.
"use client";

import { useSyncExternalStore } from "react";

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
  return () => {
    listeners.delete(listener);
  };
}

let _idCounter = INITIAL_GALLERY.length;
function nextId(): string {
  _idCounter += 1;
  return `g${_idCounter}-${Date.now()}`;
}

/** Add an image. Returns false (no-op) when already at GALLERY_MAX. */
export function addGalleryImage(image: Omit<GalleryImage, "id">): boolean {
  if (_gallery.length >= GALLERY_MAX) return false;
  _gallery = [..._gallery, { id: nextId(), ...image }];
  notify();
  return true;
}

export function updateGalleryImage(id: string, patch: Partial<Omit<GalleryImage, "id">>) {
  _gallery = _gallery.map((g) => (g.id === id ? { ...g, ...patch } : g));
  notify();
}

/** Remove an image. Returns false (no-op) when already at GALLERY_MIN. */
export function removeGalleryImage(id: string): boolean {
  if (_gallery.length <= GALLERY_MIN) return false;
  _gallery = _gallery.filter((g) => g.id !== id);
  notify();
  return true;
}

/** Move an image one slot left (-1) or right (+1). */
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
