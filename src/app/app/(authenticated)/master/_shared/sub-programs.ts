// src/app/app/(authenticated)/master/_shared/sub-programs.ts
//
// Master sub-program (ProgramDt) store. IDs are the backend's numeric
// ProgramDtId; programId is the parent ProgramMsId. The operational
// SubProgram view in student/_shared/academic.ts derives from this store.
import {
  fetchSubPrograms,
  saveProgramDt,
  inactProgramDt,
} from "@/lib/api/master";
import { fileUrl } from "@/lib/api/file-url";
import { dmyhmsToIso } from "@/lib/api/dates";

export type SubProgramStatus = "Active" | "Inactive";

export type SubProgram = {
  programId: number; // parent ProgramMsId
  subProgramId: number; // ProgramDtId
  subProgramName: string;
  image?: string;
  status: SubProgramStatus;
  updatedBy: string;
  updateDate: string;
};

// Seed shown until hydration completes.
export const INITIAL_SUB_PROGRAMS: SubProgram[] = [
  { programId: 1, subProgramId: 1, subProgramName: "Kyorugi", status: "Active", updatedBy: "Carolina", updateDate: "2025-12-26T19:41:32" },
  { programId: 1, subProgramId: 2, subProgramName: "Poomsae", status: "Active", updatedBy: "Carolina", updateDate: "2025-12-25T10:00:00" },
];

// ---- mutable store ----
let _subPrograms: SubProgram[] = [...INITIAL_SUB_PROGRAMS];
const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((l) => l());
}

export function getSubPrograms(): SubProgram[] {
  return _subPrograms;
}
export function subscribeSubPrograms(listener: () => void) {
  listeners.add(listener);
  ensureSubProgramsLoaded();
  return () => {
    listeners.delete(listener);
  };
}
// ---- writes (save-programdt multipart + inact-programdt toggle) ----

export async function addSubProgram(
  programId: number,
  subProgramName: string,
  file: File | null,
) {
  try {
    await saveProgramDt(
      {
        ProgramDtId: 0,
        ProgramMsId: programId,
        ProgramDtName: subProgramName,
        FgMode: "I",
      },
      file,
    );
    await reloadSubPrograms();
  } catch (err) {
    console.error("Failed to add sub-program", err);
  }
}

export async function updateSubProgram(
  subProgramId: number,
  programId: number,
  subProgramName: string,
  file: File | null,
) {
  try {
    await saveProgramDt(
      {
        ProgramDtId: subProgramId,
        ProgramMsId: programId,
        ProgramDtName: subProgramName,
        FgMode: "E",
      },
      file,
    );
    await reloadSubPrograms();
  } catch (err) {
    console.error("Failed to update sub-program", err);
  }
}

export async function toggleSubProgramStatus(
  subProgramId: number,
  current: SubProgramStatus,
) {
  try {
    await inactProgramDt(subProgramId, current === "Active" ? "N" : "Y");
    await reloadSubPrograms();
  } catch (err) {
    console.error("Failed to change sub-program status", err);
  }
}

// ---- hydration (read API) ----
let _loaded = false;
let _loadPromise: Promise<void> | null = null;

async function loadSubPrograms(): Promise<void> {
  const rows = (await fetchSubPrograms()) ?? [];
  _subPrograms = rows.map((r) => ({
    programId: r.ProgramMsId,
    subProgramId: r.ProgramDtId,
    subProgramName: r.ProgramDtName,
    image: r.ProgramDtImage ? fileUrl(r.ProgramDtImage) : undefined,
    status: r.FgStatus === "Y" ? "Active" : "Inactive",
    updatedBy: r.UpdatedBy ?? "",
    updateDate: dmyhmsToIso(r.UpdateDate),
  }));
  notify();
}

/** One-time hydration of the sub-program master from the backend. */
export function ensureSubProgramsLoaded(): Promise<void> {
  if (_loaded) return Promise.resolve();
  if (!_loadPromise) {
    _loadPromise = loadSubPrograms()
      .then(() => {
        _loaded = true;
      })
      .catch((err) => {
        console.error("Failed to load sub-programs", err);
        _loadPromise = null;
      });
  }
  return _loadPromise;
}

/** Re-fetch the sub-program master (used after a write). */
export async function reloadSubPrograms(): Promise<void> {
  _loaded = false;
  _loadPromise = null;
  await ensureSubProgramsLoaded();
}
