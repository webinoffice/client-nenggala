// src/app/app/(authenticated)/master/_shared/products.ts
import type { ProductType } from "./product-types";
import { fetchProducts } from "@/lib/api/master";
import { fileUrl } from "@/lib/api/file-url";
import { dmyhmsToIso } from "@/lib/api/dates";

export type Product = {
  id: number; // ProductId
  type: ProductType; // ProductTypeName (cast; the master list is fixed-set in the UI)
  productName: string;
  link: string;
  image: string;
  updatedBy: string;
  updateDate: string;
};

export const INITIAL_PRODUCTS: Product[] = [
  { id: 1, type: "Taekwondo", productName: "Uniform", link: "www.tokopedia.com/13...", image: "/images/product-placeholder.jpg", updatedBy: "Carolina", updateDate: "2025-12-28T19:41:32" },
];

const PLACEHOLDER_IMAGE = "/images/product-placeholder.jpg";

// ---- mutable store ----
let _products: Product[] = [...INITIAL_PRODUCTS];
const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((l) => l());
}

export function getProducts(): Product[] {
  return _products;
}
export function subscribeProducts(listener: () => void) {
  listeners.add(listener);
  ensureProductsLoaded();
  return () => {
    listeners.delete(listener);
  };
}
export function getNextProductId(): number {
  return Date.now(); // temporary client id; the real ProductId comes from the backend
}
export function addProduct(product: Product) {
  _products = [product, ..._products];
  notify();
}
export function updateProduct(id: number, patch: Partial<Product>) {
  _products = _products.map((p) => (p.id === id ? { ...p, ...patch } : p));
  notify();
}
export function removeProduct(id: number) {
  _products = _products.filter((p) => p.id !== id);
  notify();
}

// ---- hydration (read API) ----
let _loaded = false;
let _loadPromise: Promise<void> | null = null;

async function loadProducts(): Promise<void> {
  const rows = (await fetchProducts()) ?? [];
  _products = rows.map((r) => ({
    id: r.ProductId,
    type: r.ProductTypeName as ProductType,
    productName: r.ProductName,
    link: r.ProductLink ?? "",
    image: r.ProductImage ? fileUrl(r.ProductImage) : PLACEHOLDER_IMAGE,
    updatedBy: r.UpdatedBy ?? "",
    updateDate: dmyhmsToIso(r.UpdateDate),
  }));
  notify();
}

/** One-time hydration of the product master from the backend. */
export function ensureProductsLoaded(): Promise<void> {
  if (_loaded) return Promise.resolve();
  if (!_loadPromise) {
    _loadPromise = loadProducts()
      .then(() => {
        _loaded = true;
      })
      .catch((err) => {
        console.error("Failed to load products", err);
        _loadPromise = null;
      });
  }
  return _loadPromise;
}

/** Re-fetch the product master (used after a write). */
export async function reloadProducts(): Promise<void> {
  _loaded = false;
  _loadPromise = null;
  await ensureProductsLoaded();
}
