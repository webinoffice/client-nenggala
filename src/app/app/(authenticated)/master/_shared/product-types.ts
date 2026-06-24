// src/app/app/(authenticated)/master/_shared/product-types.ts
// Fixed product types — in production these come from the DB and are not editable.
export const PRODUCT_TYPES = [
  "Taekwondo",
  "Nunchaku",
  "Gymnastic",
  "Accessories",
] as const;

export type ProductType = (typeof PRODUCT_TYPES)[number];
