// src/lib/marketing/moments.ts
//
// Public read of "Our Moment" videos (content type O), returned as ObjOurMoment
// on the Galery content bundle. ContentLink is the video URL, ContentFile the
// thumbnail.
//
// NOTE: there is no CMS editor for type O yet — the management path is a future
// addition (audit issue: OurMoment has no admin UI). This store covers READ only.
"use client";

import { fetchContentPage } from "@/lib/api/content";
import { fileUrl } from "@/lib/api/file-url";
import { createListStore } from "./create-list-store";

export interface MarketingMoment {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
}

const momentsStore = createListStore<MarketingMoment>(async () => {
  const data = await fetchContentPage("Galery", { forcePublic: true });
  return (data.ObjOurMoment ?? []).map((m, i) => ({
    id: `moment-${i}`,
    title: m.ContentTitle ?? "",
    description: m.ContentDesc ?? "",
    thumbnail: fileUrl(m.ContentFile),
    url: m.ContentLink || "#",
  }));
});

export const useMoments = momentsStore.use;
