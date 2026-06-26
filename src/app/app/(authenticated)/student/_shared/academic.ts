// src/app/app/(authenticated)/student/_shared/academic.ts
//
// Operational academic data — now fully fetch-backed (Step 3c Tier B).
//  - Programs/sub-programs derive from the canonical master stores (audit #1).
//  - PERIODS derive from the schedule-period master (get-schperiod, via
//    schedule-periods.ts). A Period.id is the numeric SchPeriodId.
//  - ENROLLMENTS derive from the operational SCHEDULES store: a student is
//    "enrolled" in (period, dojang, sub-program) when a ScheduleHd in that
//    period/dojang/sub-program lists them as a member (ScheduleMbr). No separate
//    enrollment endpoint exists — the schedule roster IS the enrollment.
//
// Everything stays exposed via synchronous getById/forSelection helpers (so the
// existing inline-during-render call sites keep working) plus use*() hooks that
// subscribe to the underlying stores. The helpers accept the drill-down's string
// form values and coerce to the numeric backend ids internally.
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
import {
  getSchedulePeriods,
  subscribeSchedulePeriods,
} from "../../master/_shared/schedule-periods";
import {
  getSchedules,
  subscribeSchedules,
} from "../../coach/_shared/schedules";

export type Period = {
  id: number; // SchPeriodId
  name: string; // "Period 1"
  dojang: string; // owning dojang name
  startMonth: string; // "2026-01"
  endMonth: string; // "2026-05"
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
  studentUsername: string; // UserNoId
  periodId: number; // SchPeriodId
  dojang: string; // DojangName
  programId: number; // ProgramMsId
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

// ---- periods (derived from the schedule-period master) ----
let _periodSrc: ReturnType<typeof getSchedulePeriods> | null = null;
let _periods: Period[] = [];
function getPeriodsSnapshot(): Period[] {
  const src = getSchedulePeriods();
  if (src !== _periodSrc) {
    _periodSrc = src;
    _periods = src.map((p) => ({
      id: p.id,
      name: p.periodName,
      dojang: p.dojang,
      startMonth: p.periodStart,
      endMonth: p.periodEnd,
    }));
  }
  return _periods;
}

export function getPeriods(): Period[] {
  return getPeriodsSnapshot();
}
export function getPeriodById(id: string | number): Period | null {
  const numId = Number(id);
  return getPeriodsSnapshot().find((p) => p.id === numId) ?? null;
}

// ---- enrollments (derived from the operational schedules store) ----
let _enrSrc: ReturnType<typeof getSchedules> | null = null;
let _enrollments: Enrollment[] = [];
function getEnrollmentsSnapshot(): Enrollment[] {
  const src = getSchedules();
  if (src !== _enrSrc) {
    _enrSrc = src;
    const out: Enrollment[] = [];
    src.forEach((s) =>
      s.members.forEach((m) =>
        out.push({
          studentUsername: m.username,
          periodId: s.schPeriodId,
          dojang: s.dojang,
          programId: s.programId,
          subProgramId: s.subProgramId,
        }),
      ),
    );
    _enrollments = out;
  }
  return _enrollments;
}
export function getEnrollments(): Enrollment[] {
  return getEnrollmentsSnapshot();
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
  const label = p.dojang ? `${p.name} · ${p.dojang}` : p.name;
  const [sy, sm] = p.startMonth.split("-").map(Number);
  const [ey, em] = p.endMonth.split("-").map(Number);
  if (!sy || !sm || !ey || !em) return label;
  const startName = MONTHS_ID[sm - 1];
  const endName = MONTHS_ID[em - 1];
  const range =
    sy === ey
      ? `${startName} - ${endName} ${ey}`
      : `${startName} ${sy} - ${endName} ${ey}`;
  return `${label} (${range})`;
}

/** Inclusive list of "YYYY-MM" months from startMonth to endMonth. */
export function monthRange(startMonth: string, endMonth: string): string[] {
  const [sy, sm] = startMonth.split("-").map(Number);
  const [ey, em] = endMonth.split("-").map(Number);
  const out: string[] = [];
  if (!sy || !sm || !ey || !em) return out;
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

// ---- selection helpers ----
// Pure derivations over the enrollment list (from useEnrollments()). They accept
// the drill-down's string form values and coerce to numeric backend ids. Taking
// `enrollments` explicitly keeps them pure and makes them a real memo dependency
// at the call sites (the data reactively hydrates with the schedules store).
export function getDojangsForPeriod(
  enrollments: Enrollment[],
  periodId: string,
): string[] {
  const pid = Number(periodId);
  const set = new Set<string>();
  enrollments.forEach((e) => {
    if (e.periodId === pid && e.dojang) set.add(e.dojang);
  });
  return Array.from(set).sort();
}

export function getProgramsForSelection(
  enrollments: Enrollment[],
  periodId: string,
  dojang: string,
): Program[] {
  const pid = Number(periodId);
  const programIds = new Set<number>();
  enrollments.forEach((e) => {
    if (e.periodId === pid && e.dojang === dojang) programIds.add(e.programId);
  });
  return getProgramsSnapshot().filter((p) => programIds.has(p.id));
}

export function getSubProgramsForSelection(
  enrollments: Enrollment[],
  periodId: string,
  dojang: string,
  programId: string,
): SubProgram[] {
  const pid = Number(periodId);
  const prog = Number(programId);
  const subProgramIds = new Set<number>();
  enrollments.forEach((e) => {
    if (e.periodId === pid && e.dojang === dojang && e.programId === prog) {
      subProgramIds.add(e.subProgramId);
    }
  });
  return getSubProgramsSnapshot().filter((sp) => subProgramIds.has(sp.id));
}

export function getEnrolledUsernames(
  enrollments: Enrollment[],
  periodId: string,
  dojang: string,
  subProgramId: number,
): string[] {
  const pid = Number(periodId);
  const set = new Set<string>();
  enrollments.forEach((e) => {
    if (
      e.periodId === pid &&
      e.dojang === dojang &&
      e.subProgramId === subProgramId
    ) {
      set.add(e.studentUsername);
    }
  });
  return Array.from(set);
}

/** All students enrolled in a period + dojang, regardless of sub-program (deduped). */
export function getEnrolledUsernamesByDojang(
  enrollments: Enrollment[],
  periodId: string,
  dojang: string,
): string[] {
  const pid = Number(periodId);
  const set = new Set<string>();
  enrollments.forEach((e) => {
    if (e.periodId === pid && e.dojang === dojang) set.add(e.studentUsername);
  });
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
  return useSyncExternalStore(
    subscribeSchedulePeriods,
    getPeriodsSnapshot,
    getPeriodsSnapshot,
  );
}
/**
 * Subscribe to the operational enrollment source (the schedules store). Returns
 * the derived Enrollment[] so callers can use it as a memo dependency — this is
 * what makes the drill-down's dojang/program/sub-program options and the
 * enrolled rosters recompute once the schedules fan-out hydrates. Heavy (it
 * triggers the schedule fetch), so only the drill-down screens use it — NOT
 * useAcademic.
 */
export function useEnrollments(): Enrollment[] {
  return useSyncExternalStore(
    subscribeSchedules,
    getEnrollmentsSnapshot,
    getEnrollmentsSnapshot,
  );
}

/**
 * Subscribe to all (lightweight) academic master data at once: programs,
 * sub-programs and periods. Deliberately does NOT subscribe to the heavy
 * schedules/enrollment source — screens that need enrollments call
 * useEnrollments() explicitly.
 */
export function useAcademic() {
  const programs = usePrograms();
  const subPrograms = useSubPrograms();
  const periods = usePeriods();
  return { programs, subPrograms, periods };
}
