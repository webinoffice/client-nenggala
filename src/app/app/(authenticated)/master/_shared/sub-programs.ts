// src/app/app/(authenticated)/master/_shared/sub-programs.ts
//
// NOTE (step 3): this is the *master* sub-program shape, distinct from the
// operational `SubProgram` in student/_shared/academic.ts. They must be unified
// against the API (see docs/API_READINESS_AUDIT.md, issue #1).

export type SubProgramStatus = "Active" | "Inactive";

export type SubProgram = {
  programId: string;
  subProgramId: string;
  subProgramName: string;
  image?: string;
  status: SubProgramStatus;
  updatedBy: string;
  updateDate: string;
};

export const INITIAL_SUB_PROGRAMS: SubProgram[] = [
  { programId: "TKD", subProgramId: "TKD-01", subProgramName: "Kyorugi", image: "127828916.JPG", status: "Active", updatedBy: "Carolina", updateDate: "2025-12-26T19:41:32" },
  { programId: "TKD", subProgramId: "TKD-02", subProgramName: "Poomsae", image: "TKD02_pose.JPG", status: "Active", updatedBy: "Carolina", updateDate: "2025-12-25T10:00:00" },
  { programId: "TKD", subProgramId: "TKD-03", subProgramName: "Hosinsool", image: "TKD03_defense.JPG", status: "Active", updatedBy: "Andre", updateDate: "2025-12-20T14:00:00" },
  { programId: "TKD", subProgramId: "TKD-04", subProgramName: "Breaking", image: "TKD04_break.JPG", status: "Active", updatedBy: "Andre", updateDate: "2025-12-18T11:00:00" },
  { programId: "TGD", subProgramId: "TGD-01", subProgramName: "Forms", image: "TGD01_form.JPG", status: "Active", updatedBy: "Carolina", updateDate: "2025-11-10T09:00:00" },
  { programId: "HKD", subProgramId: "HKD-01", subProgramName: "Throws", image: "HKD01_throw.JPG", status: "Active", updatedBy: "Andre", updateDate: "2025-10-20T13:00:00" },
  { programId: "KRT", subProgramId: "KRT-01", subProgramName: "Kata", image: "KRT01_kata.JPG", status: "Active", updatedBy: "Carolina", updateDate: "2025-09-15T08:00:00" },
  { programId: "KRT", subProgramId: "KRT-02", subProgramName: "Kumite", image: "KRT02_kumite.JPG", status: "Inactive", updatedBy: "Carolina", updateDate: "2025-09-15T08:05:00" },
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
  return () => {
    listeners.delete(listener);
  };
}
export function getNextSubProgramId(programId: string): string {
  return `${programId}-${Date.now()}`; // real id comes from backend
}
export function addSubProgram(subProgram: SubProgram) {
  _subPrograms = [subProgram, ..._subPrograms];
  notify();
}
export function updateSubProgram(
  subProgramId: string,
  patch: Partial<SubProgram>,
) {
  _subPrograms = _subPrograms.map((sp) =>
    sp.subProgramId === subProgramId ? { ...sp, ...patch } : sp,
  );
  notify();
}
export function toggleSubProgramStatus(subProgramId: string, by: string) {
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
