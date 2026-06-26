// src/app/app/(authenticated)/master/_shared/products.ts
import type { ProductType } from "./product-types";
import { fetchProducts, saveProduct, deleteProduct } from "@/lib/api/master";
import { fileUrl } from "@/lib/api/file-url";
import { dmyhmsToIso } from "@/lib/api/dates";

export type Product = {
  id: number; // ProductId
  typeId: number; // ProductTypeId
  type: ProductType; // ProductTypeName
  productName: string;
  link: string;
  image: string;
  updatedBy: string;
  updateDate: string;
};

export const INITIAL_PRODUCTS: Product[] = [
  { id: 1, typeId: 1, type: "Taekwondo", productName: "Uniform", link: "www.tokopedia.com/13...", image: "/images/product-placeholder.jpg", updatedBy: "Carolina", updateDate: "2025-12-28T19:41:32" },
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
// ---- writes (save-product multipart + delete-product HARD delete) ----

export type ProductWriteInput = {
  typeId: number;
  productName: string;
  link: string;
};

export async function addProduct(
  input: ProductWriteInput,
  file: File | null,
) {
  try {
    await saveProduct(
      {
        ProductId: 0,
        ProductTypeId: input.typeId,
        ProductName: input.productName,
        ProductLink: input.link,
        FgMode: "I",
      },
      file,
    );
    await reloadProducts();
  } catch (err) {
    console.error("Failed to add product", err);
  }
}

export async function updateProduct(
  id: number,
  input: ProductWriteInput,
  file: File | null,
) {
  try {
    await saveProduct(
      {
        ProductId: id,
        ProductTypeId: input.typeId,
        ProductName: input.productName,
        ProductLink: input.link,
        FgMode: "E",
      },
      file,
    );
    await reloadProducts();
  } catch (err) {
    console.error("Failed to update product", err);
  }
}

/** Hard delete. Throws so the consumer can surface the error in a Modal. */
export async function removeProduct(id: number) {
  await deleteProduct(id);
  await reloadProducts();
}

// ---- hydration (read API) ----
let _loaded = false;
let _loadPromise: Promise<void> | null = null;

async function loadProducts(): Promise<void> {
  const rows = (await fetchProducts()) ?? [];
  _products = rows.map((r) => ({
    id: r.ProductId,
    typeId: r.ProductTypeId,
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
