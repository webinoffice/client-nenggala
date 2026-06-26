// src/app/app/(authenticated)/master/_shared/programs.ts
import {
  fetchPrograms,
  saveProgramMs,
  inactProgramMs,
} from "@/lib/api/master";
import { fileUrl } from "@/lib/api/file-url";
import { dmyhmsToIso } from "@/lib/api/dates";

export type ProgramStatus = "Active" | "Inactive";

export type Program = {
  id: number; // ProgramMsId
  programName: string;
  image?: string; // resolved ProgramMsImage URL
  isMain?: boolean; // the main program (Taekwondo) — cannot be disabled
  status: ProgramStatus;
  updatedBy: string;
  updateDate: string;
};

// Seed shown until hydration completes. IDs are the backend's ProgramMsId.
export const INITIAL_PROGRAMS: Program[] = [
  { id: 1, programName: "Taekwondo", isMain: true, status: "Active", updatedBy: "Carolina", updateDate: "2025-12-28T19:41:32" },
];

/** The backend has no "main program" flag — Taekwondo is treated as the main. */
function isMainProgram(name: string): boolean {
  return name.trim().toLowerCase() === "taekwondo";
}

// ---- mutable store ----
let _programs: Program[] = [...INITIAL_PROGRAMS];
const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((l) => l());
}

export function getPrograms(): Program[] {
  return _programs;
}
export function subscribePrograms(listener: () => void) {
  listeners.add(listener);
  ensureProgramsLoaded();
  return () => {
    listeners.delete(listener);
  };
}
export function getProgramById(id: number): Program | null {
  return _programs.find((p) => p.id === id) ?? null;
}

// ---- writes (save-programms multipart + inact-programms toggle) ----
// Mutators call the backend then reload<X>() so server-assigned ids/images land;
// the backend stamps UpdatedBy from the token. Add/edit swallow errors (the form
// closes optimistically); the status toggle is non-destructive.

export async function addProgram(programName: string, file: File | null) {
  try {
    await saveProgramMs(
      { ProgramMsId: 0, ProgramName: programName, FgMode: "I" },
      file,
    );
    await reloadPrograms();
  } catch (err) {
    console.error("Failed to add program", err);
  }
}

export async function updateProgram(
  id: number,
  programName: string,
  file: File | null,
) {
  try {
    await saveProgramMs(
      { ProgramMsId: id, ProgramName: programName, FgMode: "E" },
      file,
    );
    await reloadPrograms();
  } catch (err) {
    console.error("Failed to update program", err);
  }
}

export async function toggleProgramStatus(id: number, current: ProgramStatus) {
  try {
    await inactProgramMs(id, current === "Active" ? "N" : "Y");
    await reloadPrograms();
  } catch (err) {
    console.error("Failed to change program status", err);
  }
}

// ---- hydration (read API) ----
let _loaded = false;
let _loadPromise: Promise<void> | null = null;

async function loadPrograms(): Promise<void> {
  const rows = (await fetchPrograms()) ?? [];
  _programs = rows.map((r) => ({
    id: r.ProgramMsId,
    programName: r.ProgramName,
    image: r.ProgramMsImage ? fileUrl(r.ProgramMsImage) : undefined,
    isMain: isMainProgram(r.ProgramName),
    status: r.FgStatus === "Y" ? "Active" : "Inactive",
    updatedBy: r.UpdatedBy ?? "",
    updateDate: dmyhmsToIso(r.UpdateDate),
  }));
  notify();
}

/** One-time hydration of the program master from the backend. */
export function ensureProgramsLoaded(): Promise<void> {
  if (_loaded) return Promise.resolve();
  if (!_loadPromise) {
    _loadPromise = loadPrograms()
      .then(() => {
        _loaded = true;
      })
      .catch((err) => {
        console.error("Failed to load programs", err);
        _loadPromise = null;
      });
  }
  return _loadPromise;
}

/** Re-fetch the program master (used after a write). */
export async function reloadPrograms(): Promise<void> {
  _loaded = false;
  _loadPromise = null;
  await ensureProgramsLoaded();
}
