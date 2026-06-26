// src/app/app/(authenticated)/coach/_shared/schedules.ts
//
// Operational schedule store — fetch-backed (Step 3c Part 2). The backend
// schedule model is structurally different from the old flat mock: a class is a
// ScheduleHd row, its students come from get-schedule-mbr and its extra coaches
// from get-schedule-coach (both per ScheduleHdId), and there is NO global list —
// get-schedule-hd requires a SchPeriodId.
//
// To preserve the global `getSchedules()` contract that the (still-mock)
// dashboards / me-views / recommendation+attendance stores rely on, this store
// fans get-schedule-hd out over EVERY period from the schedule-period master and
// concatenates the result, then resolves members + additional coaches per Hd.
// The management list filters this global array by the selected period
// client-side (exactly like the old mock did).
//
// READS only for now; the mutators stay in-memory until the writes pass swaps
// them for save-schedule-hd / delete-schedule-hd.
//
// Interim modelling notes (revisited in later passes):
//  - status: the backend ScheduleHd has no status column, so every schedule is
//    treated as Active. The management list's old enable/disable toggle becomes a
//    hard delete (delete-schedule-hd, guarded by an "already used" check) — wired
//    in the writes pass; the `status` field is kept (always "Active") only so the
//    deferred consumers keep compiling. TODO(status): remove once they migrate.
//  - secondary vs assistant coaches: the backend ScheduleCoach is a single flat
//    list, so `additionalCoaches` holds them all; `secondaryCoachUsernames`
//    mirrors that list and `assistantUsernames` is empty. The real secondary /
//    assistant split is deferred (TODO(coach-roles), pending the confirmed flow).
import { dmyhmsToIso } from "@/lib/api/dates";
import {
  fetchScheduleHd,
  fetchScheduleMbr,
  fetchScheduleCoach,
  saveScheduleHd as apiSaveScheduleHd,
  deleteScheduleHd as apiDeleteScheduleHd,
  type ScheduleHdRow,
  type ScheduleMemberDelta,
  type ScheduleCoachDelta,
} from "@/lib/api/schedules";
import {
  getSchedulePeriods,
  ensureSchedulePeriodsLoaded,
} from "../../master/_shared/schedule-periods";
import {
  getSubPrograms,
  ensureSubProgramsLoaded,
} from "../../master/_shared/sub-programs";

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export type ScheduleStatus = "Active" | "Inactive";

export type ScheduleMember = {
  scheduleMbrId: number;
  studentId: number; // UserData.UserDataId
  username: string; // UserNoId
  name: string;
  dojang: string;
  belt: string;
};

export type ScheduleCoachMember = {
  scheduleCoachId: number;
  coachId: number; // UserData.UserDataId
  username: string; // UserNoId
  name: string;
  belt: string;
};

export type Schedule = {
  id: number; // ScheduleHdId
  schPeriodId: number; // SchPeriodId (drives loading / period filter)
  periodTitle: string;
  dojang: string;
  dojangId: number;
  programId: number; // ProgramMsId (resolved from ProgramDtId via the master)
  subProgramId: number; // ProgramDtId
  primaryCoachId: number; // ScheduleHd.CoachId (UserDataId)
  primaryCoachUsername: string; // UserNoId
  primaryCoachName: string;
  dayScheduleNum: number; // 0 = Monday … 6 = Sunday
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  dateStart: string; // "YYYY-MM-DD"
  dateEnd: string;
  members: ScheduleMember[];
  additionalCoaches: ScheduleCoachMember[];
  // ── derived back-compat fields (see header) ──
  studentUsernames: string[];
  secondaryCoachUsernames: string[];
  assistantUsernames: string[];
  status: ScheduleStatus;
  updatedBy: string;
  updateDate: string;
};

// ---- mutable store ----
let _schedules: Schedule[] = [];
const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((l) => l());
}

export function getSchedules(): Schedule[] {
  return _schedules;
}
export function subscribeSchedules(l: () => void) {
  listeners.add(l);
  ensureSchedulesLoaded();
  return () => {
    listeners.delete(l);
  };
}
export function getScheduleById(id: number): Schedule | null {
  return _schedules.find((s) => s.id === id) ?? null;
}

// ---- hydration (read API) ----
let _loaded = false;
let _loadPromise: Promise<void> | null = null;

const DAY_FALLBACK: DayOfWeek = "Monday";
function toDayOfWeek(str: string | null, num: number): DayOfWeek {
  if (str && (DAYS_OF_WEEK as readonly string[]).includes(str)) {
    return str as DayOfWeek;
  }
  return DAYS_OF_WEEK[num] ?? DAY_FALLBACK;
}

async function buildSchedule(
  hd: ScheduleHdRow,
  programMsByDt: Map<number, number>,
): Promise<Schedule> {
  const [mbrRows, coachRows] = await Promise.all([
    fetchScheduleMbr(hd.ScheduleHdId).catch(() => []),
    fetchScheduleCoach(hd.ScheduleHdId).catch(() => []),
  ]);

  const members: ScheduleMember[] = (mbrRows ?? []).map((m) => ({
    scheduleMbrId: m.ScheduleMbrId,
    studentId: m.StudentId,
    username: m.StudentNoId ?? "",
    name: m.StudentName ?? "",
    dojang: m.DojangName ?? "",
    belt: m.BeltName ?? "-",
  }));

  // ScheduleCoach can also list the PIC; drop it so the primary coach isn't
  // shown/counted twice.
  const additionalCoaches: ScheduleCoachMember[] = (coachRows ?? [])
    .filter((c) => c.CoachId !== hd.CoachId)
    .map((c) => ({
      scheduleCoachId: c.ScheduleCoachId,
      coachId: c.CoachId,
      username: c.CoachNoId ?? "",
      name: c.CoachName ?? "",
      belt: c.BeltName ?? "-",
    }));

  return {
    id: hd.ScheduleHdId,
    schPeriodId: hd.SchPeriodId,
    periodTitle: hd.PeriodTitle ?? "",
    dojang: hd.DojangName ?? "",
    dojangId: hd.DojangId ?? 0,
    programId: programMsByDt.get(hd.ProgramDtId) ?? 0,
    subProgramId: hd.ProgramDtId,
    primaryCoachId: hd.CoachId,
    primaryCoachUsername: hd.UserNoId ?? "",
    primaryCoachName: hd.UserName ?? "",
    dayScheduleNum: hd.DaySchedule,
    dayOfWeek: toDayOfWeek(hd.DayScheduleStr, hd.DaySchedule),
    startTime: hd.TimeStart ?? "",
    endTime: hd.TimeEnd ?? "",
    dateStart: hd.DateStart ?? "",
    dateEnd: hd.DateEnd ?? "",
    members,
    additionalCoaches,
    studentUsernames: members.map((m) => m.username),
    secondaryCoachUsernames: additionalCoaches.map((c) => c.username),
    assistantUsernames: [],
    status: "Active",
    updatedBy: hd.UpdatedBy ?? "",
    updateDate: dmyhmsToIso(hd.UpdateDate),
  };
}

async function loadSchedules(): Promise<void> {
  // Periods drive the fan-out; sub-programs resolve ProgramDtId → ProgramMsId.
  await Promise.all([ensureSchedulePeriodsLoaded(), ensureSubProgramsLoaded()]);

  const programMsByDt = new Map<number, number>(
    getSubPrograms().map((sp) => [sp.subProgramId, sp.programId]),
  );

  // One get-schedule-hd per period; failing periods are skipped.
  const periodIds = getSchedulePeriods().map((p) => p.id);
  const hdResults = await Promise.all(
    periodIds.map((id) => fetchScheduleHd(id).catch(() => [])),
  );

  // Dedupe by ScheduleHdId in case a Hd surfaces under more than one period read.
  const hdById = new Map<number, ScheduleHdRow>();
  hdResults.flat().forEach((hd) => hdById.set(hd.ScheduleHdId, hd));

  const built = await Promise.all(
    Array.from(hdById.values()).map((hd) => buildSchedule(hd, programMsByDt)),
  );

  _schedules = built;
  notify();
}

/** One-time hydration of the schedule list from the backend. */
export function ensureSchedulesLoaded(): Promise<void> {
  if (_loaded) return Promise.resolve();
  if (!_loadPromise) {
    _loadPromise = loadSchedules()
      .then(() => {
        _loaded = true;
      })
      .catch((err) => {
        console.error("Failed to load schedules", err);
        _loadPromise = null;
      });
  }
  return _loadPromise;
}

/** Re-fetch the schedule list (used after a write). */
export async function reloadSchedules(): Promise<void> {
  _loaded = false;
  _loadPromise = null;
  await ensureSchedulesLoaded();
}

// ---- writes ----

export type ScheduleWriteInput = {
  /** null = insert; a ScheduleHdId = edit. */
  id: number | null;
  schPeriodId: number;
  dateStart: string;
  dateEnd: string;
  startTime: string;
  endTime: string;
  dayScheduleNum: number;
  subProgramId: number; // ProgramDtId
  primaryCoachId: number; // PIC (UserDataId)
  memberIds: number[]; // StudentId (UserDataId)
  coachIds: number[]; // additional CoachId (UserDataId), PIC excluded
};

/** Create or update a schedule. On edit the member/coach rosters are diffed
 *  against the loaded original to produce the backend's I/D deltas; note the
 *  backend edit path only persists time/end-date + roster changes. Re-fetches
 *  on success so the store reflects the server's canonical ids. */
export async function saveSchedule(input: ScheduleWriteInput): Promise<void> {
  const isEdit = input.id != null;
  const base = {
    ScheduleHdId: input.id ?? 0,
    SchPeriodId: input.schPeriodId,
    DateStart: input.dateStart,
    DateEnd: input.dateEnd,
    TimeStart: input.startTime,
    TimeEnd: input.endTime,
    DaySchedule: input.dayScheduleNum,
    ProgramDtId: input.subProgramId,
    CoachId: input.primaryCoachId,
  };

  if (isEdit) {
    const original = getScheduleById(input.id as number);
    const origMembers = new Set((original?.members ?? []).map((m) => m.studentId));
    const origCoaches = new Set(
      (original?.additionalCoaches ?? []).map((c) => c.coachId),
    );
    const newMembers = new Set(input.memberIds);
    const newCoaches = new Set(input.coachIds);

    const DataMemberEdit: ScheduleMemberDelta[] = [
      ...input.memberIds
        .filter((id) => !origMembers.has(id))
        .map((StudentId) => ({ StudentId, FgMode: "I" as const })),
      ...[...origMembers]
        .filter((id) => !newMembers.has(id))
        .map((StudentId) => ({ StudentId, FgMode: "D" as const })),
    ];
    const DataCoachEdit: ScheduleCoachDelta[] = [
      ...input.coachIds
        .filter((id) => !origCoaches.has(id))
        .map((CoachId) => ({ CoachId, FgMode: "I" as const })),
      ...[...origCoaches]
        .filter((id) => !newCoaches.has(id))
        .map((CoachId) => ({ CoachId, FgMode: "D" as const })),
    ];

    await apiSaveScheduleHd({
      ...base,
      FgMode: "E",
      DataMember: [],
      DataCoach: [],
      DataMemberEdit,
      DataCoachEdit,
    });
  } else {
    await apiSaveScheduleHd({
      ...base,
      FgMode: "I",
      DataMember: input.memberIds.map((StudentId) => ({ StudentId })),
      DataCoach: input.coachIds.map((CoachId) => ({ CoachId })),
      DataMemberEdit: [],
      DataCoachEdit: [],
    });
  }

  await reloadSchedules();
}

/** Hard delete (the backend has no status). Throws the server's "already used"
 *  error when the schedule already has attendance. */
export async function deleteSchedule(id: number): Promise<void> {
  await apiDeleteScheduleHd(id);
  await reloadSchedules();
}
