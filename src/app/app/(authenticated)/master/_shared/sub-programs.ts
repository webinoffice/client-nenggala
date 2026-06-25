// src/app/app/(authenticated)/master/_shared/sub-programs.ts
//
// Master sub-program (ProgramDt) store. IDs are the backend's numeric
// ProgramDtId; programId is the parent ProgramMsId. The operational
// SubProgram view in student/_shared/academic.ts derives from this store.
import { fetchSubPrograms } from "@/lib/api/master";
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
export function getNextSubProgramId(): number {
  return Date.now(); // temporary client id; the real ProgramDtId comes from the backend
}
export function addSubProgram(subProgram: SubProgram) {
  _subPrograms = [subProgram, ..._subPrograms];
  notify();
}
export function updateSubProgram(
  subProgramId: number,
  patch: Partial<SubProgram>,
) {
  _subPrograms = _subPrograms.map((sp) =>
    sp.subProgramId === subProgramId ? { ...sp, ...patch } : sp,
  );
  notify();
}
export function toggleSubProgramStatus(subProgramId: number, by: string) {
  _subPrograms = _subPrograms.map((sp) =>
    sp.subProgramId === subProgramId
      ? {
          ...sp,
          status: sp.status === "Active" ? "Inactive" : "Active",
          updatedBy: by,
          updateDate: new Date().toISOString(),
        }
      : sp,
  );
  notify();
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
