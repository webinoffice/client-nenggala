// src/lib/marketing/products.ts
//
// Public read of products + product categories for the marketing product page
// (ProductExplorer). Same source of truth as the master product screen (the
// Product / ProductType tables), but via the token-free /public/* endpoints —
// the backend DAL returns a trimmed public projection when isPublic:"Y".
//
// Two separate stores: one for the product grid, one for the category tabs.
"use client";

import { apiPost } from "@/lib/api/client";
import { fileUrl } from "@/lib/api/file-url";
import { createListStore } from "./create-list-store";

const NO_SEARCH = { FieldName: "", FieldValue: "" };
const PLACEHOLDER = "/images/product-placeholder.jpg";

/** Public projection from /public/get-product (isPublic:"Y"). ProductTypeId is
 *  aliased to TypeIndex, mirroring the MsIndex convention of the other public
 *  marketing feeds. */
interface PublicProductRow {
  TypeIndex: number;
  ProductTypeName: string;
  ProductName: string;
  ProductLink: string | null;
  ProductImage: string | null;
}

interface PublicProductTypeRow {
  TypeIndex: number;
  ProductTypeName: string;
}

export interface MarketingProduct {
  id: string;
  typeId: number; // ProductTypeId — matches MarketingProductType.id
  category: string; // ProductTypeName
  name: string;
  link: string;
  image: string;
}

export interface MarketingProductType {
  id: number; // ProductTypeId
  name: string; // ProductTypeName
}

const productsStore = createListStore<MarketingProduct>(async () => {
  const rows = await apiPost<PublicProductRow[]>("/public/get-product", {
    objParam: {
      ObjSearch: NO_SEARCH,
      ProductTypeId: "",
      ProductId: "",
      isPublic: "Y",
    },
  });
  return (rows ?? []).map((r, i) => ({
    id: `${r.TypeIndex}-${i}`,
    typeId: r.TypeIndex,
    category: r.ProductTypeName,
    name: r.ProductName,
    link: r.ProductLink ?? "",
    image: r.ProductImage ? fileUrl(r.ProductImage) : PLACEHOLDER,
  }));
});

const productTypesStore = createListStore<MarketingProductType>(async () => {
  const rows = await apiPost<PublicProductTypeRow[]>(
    "/public/get-product-type",
    { objParam: { ObjSearch: NO_SEARCH, FgStatus: "Y", isPublic: "Y" } },
  );
  return (rows ?? []).map((r) => ({ id: r.TypeIndex, name: r.ProductTypeName }));
});

export const useMarketingProducts = productsStore.use;
export const useMarketingProductTypes = productTypesStore.use;
