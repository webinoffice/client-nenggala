// src/lib/marketing/programs.ts
//
// Public read of programs + sub-programs for the marketing site (Champion,
// OurProgram). Both come back on the "Program" content page; the two stores
// share that single fetch (de-duped in fetchContentPage).
"use client";

import { fetchContentPage } from "@/lib/api/content";
import { fileUrl } from "@/lib/api/file-url";
import { createListStore } from "./create-list-store";

export interface MarketingProgram {
  id: string;
  name: string;
  image: string;
}

export interface MarketingSubProgram {
  id: string;
  programId: string; // parent program id (matches MarketingProgram.id)
  name: string;
  image: string;
}

const programsStore = createListStore<MarketingProgram>(async () => {
  const data = await fetchContentPage("Program");
  return (data.ObjProgram ?? []).map((p) => ({
    id: String(p.MsIndex),
    name: p.ProgramName,
    image: fileUrl(p.ProgramMsImage),
  }));
});

const subProgramsStore = createListStore<MarketingSubProgram>(async () => {
  const data = await fetchContentPage("Program");
  return (data.ObjSubProgram ?? []).map((s, i) => ({
    id: `${s.MsIndex}-${i}`,
    programId: String(s.MsIndex),
    name: s.ProgramDtName,
    image: fileUrl(s.ProgramDtImage),
  }));
});

export const usePrograms = programsStore.use;
export const useSubPrograms = subProgramsStore.use;
