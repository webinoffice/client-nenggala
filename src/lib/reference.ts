// src/lib/reference.ts
//
// Shared static reference data with no master/API backing. Previously these were
// duplicated verbatim in admins.ts, students.ts and coaches.ts (audit issue #2);
// they live here once so every form reads the same list. Belt and dojang options
// are NOT here — those derive from the master stores (belts.ts / dojangs.ts).

export type BloodType = "A" | "B" | "AB" | "O" | "-";

export const WARGA_NEGARA_OPTIONS = [
  "Indonesia",
  "Malaysia",
  "Singapore",
  "Other",
];

export const GOL_DARAH_OPTIONS: BloodType[] = ["-", "A", "B", "AB", "O"];
