// src/lib/marketing/create-list-store.ts
//
// Factory for the read-only marketing stores (Sections 4 & 5). Each is a public
// projection of backend data: it hydrates once from the public content endpoint
// on first subscribe, keeps a synchronous snapshot, and exposes a React hook.
//
// These are intentionally SEPARATE from the app's editable master stores
// (programs/dojang/coaches), which are owned by step 3b — the marketing site
// only ever reads, and reads from the public API.
"use client";

import { useSyncExternalStore } from "react";

export interface MarketingStore<T> {
  /** React hook — subscribe a client component to the list. */
  use: () => T[];
  /** One-time hydration (also triggered automatically on first subscribe). */
  ensureLoaded: () => Promise<void>;
}

export function createListStore<T>(loader: () => Promise<T[]>): MarketingStore<T> {
  let items: T[] = [];
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((l) => l());

  let loaded = false;
  let loadPromise: Promise<void> | null = null;

  const ensureLoaded = (): Promise<void> => {
    if (loaded) return Promise.resolve();
    if (!loadPromise) {
      loadPromise = loader()
        .then((next) => {
          items = next;
          loaded = true;
          notify();
        })
        .catch((err) => {
          console.error("Failed to load marketing data", err);
          loadPromise = null; // allow retry on next subscribe
        });
    }
    return loadPromise;
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    ensureLoaded();
    return () => {
      listeners.delete(listener);
    };
  };

  const getSnapshot = () => items;

  return {
    use: () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot),
    ensureLoaded,
  };
}
