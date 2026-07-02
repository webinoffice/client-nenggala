// src/lib/marketing/coaches.ts
//
// Public read of coaches for the about page (CoachList). Returned as ObjCoach on
// the AboutUs content bundle: instructors plus students flagged as assistants
// (FgAssist = "Y"). Rank maps to the coach's belt name.
"use client";

import { fetchContentPage } from "@/lib/api/content";
import { fileUrl } from "@/lib/api/file-url";
import { createListStore } from "./create-list-store";

export interface MarketingCoach {
  id: string;
  name: string;
  rank: string;
  image: string;
  isAssistant: boolean;
}

const coachesStore = createListStore<MarketingCoach>(async () => {
  const data = await fetchContentPage("AboutUs", { forcePublic: true });
  return (data.ObjCoach ?? []).map((c, i) => ({
    id: `coach-${i}`,
    name: c.UserName,
    rank: c.BeltName ?? "",
    image: fileUrl(c.UserPhoto),
    isAssistant: c.FgAssist === "Y",
  }));
});

export const useCoaches = coachesStore.use;
