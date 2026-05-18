// src/app/app/(authenticated)/master/_shared/programs.ts
export type ProgramStatus = "Active" | "Inactive";

export type Program = {
  id: string;
  programName: string;
  status: ProgramStatus;
  updatedBy: string;
  updateDate: string;
};

export const INITIAL_PROGRAMS: Program[] = [
  { id: "TKD", programName: "Taekwondo", status: "Active", updatedBy: "Carolina", updateDate: "2025-12-28T19:41:32" },
  { id: "TGD", programName: "Tang Soo Do", status: "Active", updatedBy: "Andre", updateDate: "2025-12-15T10:00:00" },
  { id: "HKD", programName: "Hapkido", status: "Active", updatedBy: "Carolina", updateDate: "2025-11-20T14:00:00" },
  { id: "KRT", programName: "Karate", status: "Active", updatedBy: "Andre", updateDate: "2025-10-15T09:30:00" },
  { id: "DMO", programName: "Demonstration", status: "Inactive", updatedBy: "Carolina", updateDate: "2025-09-01T11:00:00" },
];