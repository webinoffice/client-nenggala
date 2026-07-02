// src/lib/marketing/dojang.ts
//
// Public read of dojang (training locations) for the marketing Locations
// carousel. Returned as ObjDojang on the HomePage content bundle.
//
// NOTE: the backend dojang has no "city" field, so the location subtitle is
// dropped (audit-style "drop the field" — no fake data).
"use client";

import { fetchContentPage } from "@/lib/api/content";
import { fileUrl } from "@/lib/api/file-url";
import { createListStore } from "./create-list-store";

export interface MarketingDojang {
  id: string;
  name: string;
  image: string;
}

const dojangStore = createListStore<MarketingDojang>(async () => {
  const data = await fetchContentPage("HomePage", { forcePublic: true });
  return (data.ObjDojang ?? []).map((d, i) => ({
    id: `${i}-${d.DojangName}`,
    name: d.DojangName,
    image: fileUrl(d.DojangImage),
  }));
});

export const useDojang = dojangStore.use;
