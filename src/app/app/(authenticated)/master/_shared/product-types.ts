// src/app/app/(authenticated)/master/_shared/product-types.ts
//
// Product types are now fetched from the backend (get-product-type) so the
// product Type dropdown carries real ProductTypeIds for save-product. There is
// no product-type *management* screen yet — creating/disabling product types
// (save/inact-product-type) is intentionally left unwired (flagged), like belt
// master. This store is read-only.
import { useSyncExternalStore } from "react";
import { fetchProductTypes } from "@/lib/api/master";

/** A product type name (dynamic, sourced from the backend). */
export type ProductType = string;

export type ProductTypeOption = {
  id: number; // ProductTypeId
  name: string; // ProductTypeName
};

// ---- store ----
let _types: ProductTypeOption[] = [];
const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((l) => l());
}

export function getProductTypes(): ProductTypeOption[] {
  return _types;
}
export function subscribeProductTypes(listener: () => void) {
  listeners.add(listener);
  ensureProductTypesLoaded();
  return () => {
    listeners.delete(listener);
  };
}

/** Resolve a type name to its backend id (null when not loaded / unknown). */
export function getProductTypeId(name: string): number | null {
  return _types.find((t) => t.name === name)?.id ?? null;
}

// ---- hydration (read API) ----
let _loaded = false;
let _loadPromise: Promise<void> | null = null;

async function loadProductTypes(): Promise<void> {
  const rows = (await fetchProductTypes()) ?? [];
  _types = rows.map((r) => ({ id: r.ProductTypeId, name: r.ProductTypeName }));
  notify();
}

export function ensureProductTypesLoaded(): Promise<void> {
  if (_loaded) return Promise.resolve();
  if (!_loadPromise) {
    _loadPromise = loadProductTypes()
      .then(() => {
        _loaded = true;
      })
      .catch((err) => {
        console.error("Failed to load product types", err);
        _loadPromise = null;
      });
  }
  return _loadPromise;
}

// ---- hook ----
export function useProductTypes(): ProductTypeOption[] {
  return useSyncExternalStore(
    subscribeProductTypes,
    getProductTypes,
    getProductTypes,
  );
}
