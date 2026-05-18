// src/app/app/(authenticated)/student/_shared/academic.ts

export type Period = {
  id: string;           // "32"
  startMonth: string;   // "2026-01"
  endMonth: string;     // "2026-06"
};

export type Program = {
  id: string;           // "TKD"
  name: string;         // "Taekwondo"
};

export type SubProgram = {
  id: string;           // "TKD-01"
  name: string;         // "Kelas Pemula"
  programId: string;
};

export type Enrollment = {
  studentUsername: string;
  periodId: string;
  dojang: string;
  subProgramId: string;
};

export const PERIODS: Period[] = [
  { id: "32", startMonth: "2026-01", endMonth: "2026-06" },
  { id: "31", startMonth: "2025-07", endMonth: "2025-12" },
  { id: "30", startMonth: "2025-01", endMonth: "2025-06" },
  { id: "29", startMonth: "2024-07", endMonth: "2024-12" },
];

export const PROGRAMS: Program[] = [{ id: "TKD", name: "Taekwondo" }];

export const SUB_PROGRAMS: SubProgram[] = [
  { id: "TKD-01", name: "Kelas Pemula", programId: "TKD" },
  { id: "TKD-02", name: "Kelas Lanjutan", programId: "TKD" },
  { id: "TKD-03", name: "Kelas Atlet", programId: "TKD" },
];

export const ENROLLMENTS: Enrollment[] = [
  // Period 32 — Kedoya Sport Club
  { studentUsername: "U0001", periodId: "32", dojang: "Kedoya Sport Club", subProgramId: "TKD-01" },
  { studentUsername: "U0002", periodId: "32", dojang: "Kedoya Sport Club", subProgramId: "TKD-01" },
  { studentUsername: "U0003", periodId: "32", dojang: "Kedoya Sport Club", subProgramId: "TKD-02" },
  { studentUsername: "U0004", periodId: "32", dojang: "Kedoya Sport Club", subProgramId: "TKD-02" },
  { studentUsername: "U0005", periodId: "32", dojang: "Kedoya Sport Club", subProgramId: "TKD-03" },
  { studentUsername: "U0006", periodId: "32", dojang: "Kedoya Sport Club", subProgramId: "TKD-03" },
  { studentUsername: "U0007", periodId: "32", dojang: "Kedoya Sport Club", subProgramId: "TKD-03" },
  // Period 32 — Senayan
  { studentUsername: "U0008", periodId: "32", dojang: "Senayan Dojang", subProgramId: "TKD-01" },
  // Period 30 — Kedoya (historical for U0006)
  { studentUsername: "U0006", periodId: "30", dojang: "Kedoya Sport Club", subProgramId: "TKD-03" },
  { studentUsername: "U0007", periodId: "30", dojang: "Kedoya Sport Club", subProgramId: "TKD-03" },
  // Period 29 — Kedoya (historical for U0006)
  { studentUsername: "U0006", periodId: "29", dojang: "Kedoya Sport Club", subProgramId: "TKD-02" },
];

const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function formatPeriod(p: Period): string {
  const [sy, sm] = p.startMonth.split("-").map(Number);
  const [ey, em] = p.endMonth.split("-").map(Number);
  const startName = MONTHS_ID[sm - 1];
  const endName = MONTHS_ID[em - 1];
  if (sy === ey) return `${p.id} (${startName} - ${endName} ${ey})`;
  return `${p.id} (${startName} ${sy} - ${endName} ${ey})`;
}

export function getPeriodById(id: string): Period | null {
  return PERIODS.find((p) => p.id === id) ?? null;
}
export function getSubProgramById(id: string): SubProgram | null {
  return SUB_PROGRAMS.find((sp) => sp.id === id) ?? null;
}
export function getProgramById(id: string): Program | null {
  return PROGRAMS.find((p) => p.id === id) ?? null;
}

export function getDojangsForPeriod(periodId: string): string[] {
  const set = new Set<string>();
  ENROLLMENTS.filter((e) => e.periodId === periodId).forEach((e) =>
    set.add(e.dojang),
  );
  return Array.from(set).sort();
}

export function getProgramsForSelection(
  periodId: string,
  dojang: string,
): Program[] {
  const subProgramIds = new Set(
    ENROLLMENTS.filter(
      (e) => e.periodId === periodId && e.dojang === dojang,
    ).map((e) => e.subProgramId),
  );
  const programIds = new Set(
    SUB_PROGRAMS.filter((sp) => subProgramIds.has(sp.id)).map(
      (sp) => sp.programId,
    ),
  );
  return PROGRAMS.filter((p) => programIds.has(p.id));
}

export function getSubProgramsForSelection(
  periodId: string,
  dojang: string,
  programId: string,
): SubProgram[] {
  const subProgramIds = new Set(
    ENROLLMENTS.filter(
      (e) => e.periodId === periodId && e.dojang === dojang,
    ).map((e) => e.subProgramId),
  );
  return SUB_PROGRAMS.filter(
    (sp) => sp.programId === programId && subProgramIds.has(sp.id),
  );
}

export function getEnrolledUsernames(
  periodId: string,
  dojang: string,
  subProgramId: string,
): string[] {
  return ENROLLMENTS.filter(
    (e) =>
      e.periodId === periodId &&
      e.dojang === dojang &&
      e.subProgramId === subProgramId,
  ).map((e) => e.studentUsername);
}