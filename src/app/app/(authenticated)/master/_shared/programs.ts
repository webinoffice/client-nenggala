// src/app/app/(authenticated)/master/_shared/programs.ts
export type ProgramStatus = "Active" | "Inactive";

export type Program = {
  id: string;
  programName: string;
  isMain?: boolean; // the main program (Taekwondo) — cannot be disabled
  status: ProgramStatus;
  updatedBy: string;
  updateDate: string;
};

export const INITIAL_PROGRAMS: Program[] = [
  { id: "TKD", programName: "Taekwondo", isMain: true, status: "Active", updatedBy: "Carolina", updateDate: "2025-12-28T19:41:32" },
  { id: "TGD", programName: "Tang Soo Do", status: "Active", updatedBy: "Andre", updateDate: "2025-12-15T10:00:00" },
  { id: "HKD", programName: "Hapkido", status: "Active", updatedBy: "Carolina", updateDate: "2025-11-20T14:00:00" },
  { id: "KRT", programName: "Karate", status: "Active", updatedBy: "Andre", updateDate: "2025-10-15T09:30:00" },
  { id: "DMO", programName: "Demonstration", status: "Inactive", updatedBy: "Carolina", updateDate: "2025-09-01T11:00:00" },
];

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
  return () => {
    listeners.delete(listener);
  };
}
export function getProgramById(id: string): Program | null {
  return _programs.find((p) => p.id === id) ?? null;
}
export function getNextProgramId(): string {
  return `PRG-${Date.now()}`; // real id comes from backend
}
export function addProgram(program: Program) {
  _programs = [program, ..._programs];
  notify();
}
export function updateProgram(id: string, patch: Partial<Program>) {
  _programs = _programs.map((p) => (p.id === id ? { ...p, ...patch } : p));
  notify();
}
export function toggleProgramStatus(id: string, by: string) {
  _programs = _programs.map((p) =>
    p.id === id
      ? {
          ...p,
          status: p.status === "Active" ? "Inactive" : "Active",
          updatedBy: by,
          updateDate: new Date().toISOString(),
        }
      : p,
  );
  notify();
}