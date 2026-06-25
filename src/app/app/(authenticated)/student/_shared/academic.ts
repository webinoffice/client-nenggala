// src/app/app/(authenticated)/student/_shared/academic.ts
//
// Operational academic data. Programs/sub-programs are NO LONGER defined here —
// they derive from the canonical master stores (audit issue #1), so master CRUD
// is the single source of truth. Periods/enrollments remain mock for now (wired
// in step 3c). Everything is exposed reactively via use*() hooks; the getter
// helpers stay synchronous (canonical pattern) so existing call sites keep
// working and simply re-render when the underlying stores change/hydrate.
"use client";

import { useSyncExternalStore } from "react";
import {
  getPrograms as getMasterPrograms,
  subscribePrograms as subscribeMasterPrograms,
} from "../../master/_shared/programs";
import {
  getSubPrograms as getMasterSubPrograms,
  subscribeSubPrograms as subscribeMasterSubPrograms,
} from "../../master/_shared/sub-programs";

export type Period = {
  id: string; // "32"
  startMonth: string; // "2026-01"
  endMonth: string; // "2026-06"
};

// Lightweight operational views over the master program/sub-program records.
export type Program = {
  id: number; // ProgramMsId
  name: string; // "Taekwondo"
};

export type SubProgram = {
  id: number; // ProgramDtId
  name: string; // "Kyorugi"
  programId: number; // parent ProgramMsId
};

export type Enrollment = {
  studentUsername: string;
  periodId: string;
  dojang: string;
  subProgramId: number; // ProgramDtId
};

// ---- canonical programs/sub-programs (derived from the master stores) ----
// Snapshots are cached against the source array so useSyncExternalStore gets a
// referentially-stable value until the master store actually changes.
let _progSrc: ReturnType<typeof getMasterPrograms> | null = null;
let _programs: Program[] = [];
function getProgramsSnapshot(): Program[] {
  const src = getMasterPrograms();
  if (src !== _progSrc) {
    _progSrc = src;
    _programs = src
      .filter((p) => p.status === "Active")
      .map((p) => ({ id: p.id, name: p.programName }));
  }
  return _programs;
}

let _subSrc: ReturnType<typeof getMasterSubPrograms> | null = null;
let _subPrograms: SubProgram[] = [];
function getSubProgramsSnapshot(): SubProgram[] {
  const src = getMasterSubPrograms();
  if (src !== _subSrc) {
    _subSrc = src;
    _subPrograms = src
      .filter((sp) => sp.status === "Active")
      .map((sp) => ({
        id: sp.subProgramId,
        name: sp.subProgramName,
        programId: sp.programId,
      }));
  }
  return _subPrograms;
}

// Lookups search ALL master records (incl. inactive) so historical references
// still resolve a name.
export function getProgramById(id: number): Program | null {
  const p = getMasterPrograms().find((x) => x.id === id);
  return p ? { id: p.id, name: p.programName } : null;
}
export function getSubProgramById(id: number): SubProgram | null {
  const sp = getMasterSubPrograms().find((x) => x.subProgramId === id);
  return sp
    ? { id: sp.subProgramId, name: sp.subProgramName, programId: sp.programId }
    : null;
}

// ---- periods + enrollments (mock; reactive-ready, wired to fetch in 3c) ----
export const PERIODS: Period[] = [
  { id: "32", startMonth: "2026-01", endMonth: "2026-06" },
  { id: "31", startMonth: "2025-07", endMonth: "2025-12" },
  { id: "30", startMonth: "2025-01", endMonth: "2025-06" },
  { id: "29", startMonth: "2024-07", endMonth: "2024-12" },
];

// subProgramId values are numeric (ProgramDtId). These remain mock until the
// enrollment endpoints are wired (Tier B); the numbers are placeholders and
// won't resolve against the live sub-program master.
export const ENROLLMENTS: Enrollment[] = [
  // Period 32 — Kedoya Sport Club
  { studentUsername: "U0001", periodId: "32", dojang: "Kedoya Sport Club", subProgramId: 1 },
  { studentUsername: "U0002", periodId: "32", dojang: "Kedoya Sport Club", subProgramId: 1 },
  { studentUsername: "U0003", periodId: "32", dojang: "Kedoya Sport Club", subProgramId: 2 },
  { studentUsername: "U0004", periodId: "32", dojang: "Kedoya Sport Club", subProgramId: 2 },
  { studentUsername: "U0005", periodId: "32", dojang: "Kedoya Sport Club", subProgramId: 3 },
  { studentUsername: "U0006", periodId: "32", dojang: "Kedoya Sport Club", subProgramId: 3 },
  { studentUsername: "U0007", periodId: "32", dojang: "Kedoya Sport Club", subProgramId: 3 },
  // Period 32 — Senayan
  { studentUsername: "U0008", periodId: "32", dojang: "Senayan Dojang", subProgramId: 1 },
  // Period 30 — Kedoya (historical for U0006)
  { studentUsername: "U0006", periodId: "30", dojang: "Kedoya Sport Club", subProgramId: 3 },
  { studentUsername: "U0007", periodId: "30", dojang: "Kedoya Sport Club", subProgramId: 3 },
  // Period 29 — Kedoya (historical for U0006)
  { studentUsername: "U0006", periodId: "29", dojang: "Kedoya Sport Club", subProgramId: 2 },
];

// Mock periods/enrollments never mutate in 3b, but expose a no-op subscription so
// consumers are reactive once these become fetch-backed stores (3c).
const academicMockListeners = new Set<() => void>();
function subscribeAcademicMock(cb: () => void) {
  academicMockListeners.add(cb);
  return () => {
    academicMockListeners.delete(cb);
  };
}
export function getPeriods(): Period[] {
  return PERIODS;
}
export function getEnrollments(): Enrollment[] {
  return ENROLLMENTS;
}

const MONTHS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
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

/** Inclusive list of "YYYY-MM" months from startMonth to endMonth. */
export function monthRange(startMonth: string, endMonth: string): string[] {
  const [sy, sm] = startMonth.split("-").map(Number);
  const [ey, em] = endMonth.split("-").map(Number);
  const out: string[] = [];
  let y = sy;
  let m = sm;
  while (y < ey || (y === ey && m <= em)) {
    out.push(`${y}-${String(m).padStart(2, "0")}`);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
}

/** "2026-01" → "Januari 2026" */
export function formatMonth(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return `${MONTHS_ID[m - 1]} ${y}`;
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
  // Resolve the parent program of each enrolled sub-program via the master store.
  const programIds = new Set(
    getMasterSubPrograms()
      .filter((sp) => subProgramIds.has(sp.subProgramId))
      .map((sp) => sp.programId),
  );
  return getProgramsSnapshot().filter((p) => programIds.has(p.id));
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
  return getSubProgramsSnapshot().filter(
    (sp) => String(sp.programId) === programId && subProgramIds.has(sp.id),
  );
}

export function getEnrolledUsernames(
  periodId: string,
  dojang: string,
  subProgramId: number,
): string[] {
  return ENROLLMENTS.filter(
    (e) =>
      e.periodId === periodId &&
      e.dojang === dojang &&
      e.subProgramId === subProgramId,
  ).map((e) => e.studentUsername);
}

/** All students enrolled in a period + dojang, regardless of sub-program (deduped). */
export function getEnrolledUsernamesByDojang(
  periodId: string,
  dojang: string,
): string[] {
  const set = new Set<string>();
  ENROLLMENTS.filter(
    (e) => e.periodId === periodId && e.dojang === dojang,
  ).forEach((e) => set.add(e.studentUsername));
  return Array.from(set);
}

// ---- hooks (reactive reads; subscribe so consumers re-render on change/hydrate) ----
export function usePrograms(): Program[] {
  return useSyncExternalStore(
    subscribeMasterPrograms,
    getProgramsSnapshot,
    getProgramsSnapshot,
  );
}
export function useSubPrograms(): SubProgram[] {
  return useSyncExternalStore(
    subscribeMasterSubPrograms,
    getSubProgramsSnapshot,
    getSubProgramsSnapshot,
  );
}
export function usePeriods(): Period[] {
  return useSyncExternalStore(subscribeAcademicMock, getPeriods, getPeriods);
}
export function useEnrollments(): Enrollment[] {
  return useSyncExternalStore(
    subscribeAcademicMock,
    getEnrollments,
    getEnrollments,
  );
}

/**
 * Subscribe to all academic data at once. Returns the live arrays and, by
 * subscribing, guarantees the calling component re-renders when programs/
 * sub-programs change (master CRUD now, fetch hydration in 3c) — so the
 * synchronous getById/forSelection helpers stay safe to call during render.
 */
export function useAcademic() {
  const programs = usePrograms();
  const subPrograms = useSubPrograms();
  const periods = usePeriods();
  const enrollments = useEnrollments();
  return { programs, subPrograms, periods, enrollments };
}
