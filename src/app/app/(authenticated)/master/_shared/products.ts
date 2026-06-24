// src/app/app/(authenticated)/master/_shared/products.ts
import type { ProductType } from "./product-types";

export type Product = {
  id: string; // internal, not displayed
  type: ProductType;
  productName: string;
  link: string;
  image: string;
  updatedBy: string;
  updateDate: string;
};

export const INITIAL_PRODUCTS: Product[] = [
  { id: "TS-01", type: "Taekwondo", productName: "Uniform", link: "www.tokopedia.com/13...", image: "/images/product-placeholder.jpg", updatedBy: "Carolina", updateDate: "2025-12-28T19:41:32" },
  { id: "BL-01", type: "Accessories", productName: "White Belt", link: "www.tokopedia.com/belts/white", image: "/images/product-placeholder.jpg", updatedBy: "Carolina", updateDate: "2025-12-15T09:12:00" },
  { id: "BL-02", type: "Accessories", productName: "Yellow Belt", link: "www.tokopedia.com/belts/yellow", image: "/images/product-placeholder.jpg", updatedBy: "Andre", updateDate: "2025-11-30T14:22:11" },
  { id: "BL-03", type: "Accessories", productName: "Green Belt", link: "www.tokopedia.com/belts/green", image: "/images/product-placeholder.jpg", updatedBy: "Andre", updateDate: "2025-11-30T14:23:00" },
  { id: "GR-01", type: "Gymnastic", productName: "Hand Pads", link: "www.tokopedia.com/grip/pads", image: "/images/product-placeholder.jpg", updatedBy: "Carolina", updateDate: "2025-10-01T11:00:00" },
  { id: "GR-02", type: "Accessories", productName: "Shin Guards", link: "www.tokopedia.com/grip/shin", image: "/images/product-placeholder.jpg", updatedBy: "Carolina", updateDate: "2025-10-01T11:05:00" },
];

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
  return () => {
    listeners.delete(listener);
  };
}
export function getNextProductId(): string {
  return `PRD-${Date.now()}`; // real id comes from backend
}
export function addProduct(product: Product) {
  _products = [product, ..._products];
  notify();
}
export function updateProduct(id: string, patch: Partial<Product>) {
  _products = _products.map((p) => (p.id === id ? { ...p, ...patch } : p));
  notify();
}
export function removeProduct(id: string) {
  _products = _products.filter((p) => p.id !== id);
  notify();
}
