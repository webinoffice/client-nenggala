// src/lib/api/schedules.ts
//
// Typed fetchers for the authenticated schedule endpoints (backend-nenggala
// /schedule/*). The schedule model is split across four tables and there is NO
// global list — get-schedule-hd REQUIRES a SchPeriodId, and the members /
// additional coaches for each ScheduleHd come from SEPARATE per-ScheduleHdId
// reads:
//
//   get-schedule-hd    (per SchPeriodId)   → one row per class: PIC coach,
//                                             ProgramDt, day, dates/times, dojang
//   get-schedule-mbr   (per ScheduleHdId)  → enrolled students (+ belt/dojang)
//   get-schedule-coach (per ScheduleHdId)  → additional coaches (+ belt)
//
// Every endpoint replies with MsgData = the row array. Reads attach the bearer
// token (auth:true). These are READS only; the save/delete writes land in the
// writes pass.
import { apiPost } from "./client";

/** ObjSearch default — the backend skips filtering when FieldName/Value are blank. */
const NO_SEARCH = { FieldName: "", FieldValue: "" };

export interface ScheduleHdRow {
  ScheduleHdId: number;
  /** "YYYY-MM-DD" */
  DateStart: string | null;
  DateEnd: string | null;
  /** "HH:mm" */
  TimeStart: string | null;
  TimeEnd: string | null;
  /** 0 = Monday … 6 = Sunday */
  DaySchedule: number;
  /** "Monday" … "Sunday" */
  DayScheduleStr: string | null;
  ProgramDtId: number;
  ProgramDtName: string | null;
  ProgramName: string | null;
  DojangId: number | null;
  DojangName: string | null;
  /** PIC coach — UserData.UserDataId */
  CoachId: number;
  /** PIC coach — UserData.UserNoId (login/display key) */
  UserNoId: string | null;
  /** PIC coach — UserData.UserName (full name) */
  UserName: string | null;
  SchPeriodId: number;
  PeriodTitle: string | null;
  /** "dd/mm/yyyy HH:mm:ss" */
  UpdateDate: string | null;
  UpdatedBy: string | null;
}

/** get-schedule-hd — all classes for ONE period (the backend also scopes to the
 *  caller's DojangId; a super-admin gets every dojang). ProgramName / DojangName
 *  optionally filter server-side. */
export function fetchScheduleHd(
  schPeriodId: number,
  filters: { programName?: string; dojangName?: string } = {},
): Promise<ScheduleHdRow[]> {
  return apiPost<ScheduleHdRow[]>(
    "/schedule/get-schedule-hd",
    {
      objParam: {
        ObjSearch: NO_SEARCH,
        ProgramName: filters.programName ?? "",
        DojangName: filters.dojangName ?? "",
        SchPeriodId: schPeriodId,
      },
    },
    { auth: true },
  );
}

export interface ScheduleMbrRow {
  ScheduleMbrId: number;
  /** UserData.UserDataId */
  StudentId: number;
  /** UserData.UserNoId */
  StudentNoId: string | null;
  StudentName: string | null;
  ScheduleHdId: number;
  DojangName: string | null;
  BeltMasterId: number | null;
  BeltName: string | null;
  UpdateDate: string | null;
  UpdatedBy: string | null;
}

/** get-schedule-mbr — enrolled students for one ScheduleHd. */
export function fetchScheduleMbr(scheduleHdId: number): Promise<ScheduleMbrRow[]> {
  return apiPost<ScheduleMbrRow[]>(
    "/schedule/get-schedule-mbr",
    { objParam: { ObjSearch: NO_SEARCH, ScheduleHdId: scheduleHdId } },
    { auth: true },
  );
}

export interface ScheduleCoachRow {
  ScheduleCoachId: number;
  /** UserData.UserDataId */
  CoachId: number;
  /** UserData.UserNoId */
  CoachNoId: string | null;
  CoachName: string | null;
  ScheduleHdId: number;
  BeltMasterId: number | null;
  BeltName: string | null;
  UpdateDate: string | null;
  UpdatedBy: string | null;
}

/** get-schedule-coach — additional (non-PIC) coaches for one ScheduleHd. */
export function fetchScheduleCoach(
  scheduleHdId: number,
): Promise<ScheduleCoachRow[]> {
  return apiPost<ScheduleCoachRow[]>(
    "/schedule/get-schedule-coach",
    { objParam: { ObjSearch: NO_SEARCH, ScheduleHdId: scheduleHdId } },
    { auth: true },
  );
}

export interface ScheduleDtRow {
  ScheduleDtId: number;
  /** "YYYY-MM-DD" */
  ScheduleDate: string;
  /** "Y" on the final occurrence of the schedule. */
  FgLastDay: string | null;
  ScheduleHdId: number;
  UpdateDate: string | null;
  UpdatedBy: string | null;
}

/** get-schedule-dt — the per-occurrence rows for one ScheduleHd (each carries the
 *  ScheduleDtId that attendance is recorded against). */
export function fetchScheduleDt(scheduleHdId: number): Promise<ScheduleDtRow[]> {
  return apiPost<ScheduleDtRow[]>(
    "/schedule/get-schedule-dt",
    { objParam: { ObjSearch: NO_SEARCH, ScheduleHdId: scheduleHdId } },
    { auth: true },
  );
}

export interface InstructorSchTransRow {
  /** UserData.UserDataId */
  CoachId: number;
  /** UserData.UserNoId */
  CoachNoId: string | null;
  CoachName: string | null;
  BeltMasterId: number | null;
  BeltName: string | null;
  /** "Y" when this row is an assistant (a type-S student flagged FgAssist). */
  FgAssist: string | null;
}

/** get-instructor-schtrans — the selectable pool for a schedule's additional
 *  coaches: type-I coaches UNION type-S students flagged FgAssist='Y'. */
export function fetchInstructorSchTrans(): Promise<InstructorSchTransRow[]> {
  return apiPost<InstructorSchTransRow[]>(
    "/schedule/get-instructor-schtrans",
    { objParam: { ObjSearch: NO_SEARCH } },
    { auth: true },
  );
}

// ---- writes ----

export interface ScheduleMemberDelta {
  StudentId: number;
  FgMode: "I" | "D";
}
export interface ScheduleCoachDelta {
  CoachId: number;
  FgMode: "I" | "D";
}
export interface ScheduleHdSaveParam {
  ScheduleHdId: number; // 0 on insert
  SchPeriodId: number;
  DateStart: string;
  DateEnd: string;
  TimeStart: string;
  TimeEnd: string;
  DaySchedule: number;
  ProgramDtId: number;
  CoachId: number; // PIC (UserDataId)
  FgMode: "I" | "E";
  /** Full lists on insert. */
  DataMember: { StudentId: number }[];
  DataCoach: { CoachId: number }[];
  /** I/D deltas on edit. */
  DataMemberEdit: ScheduleMemberDelta[];
  DataCoachEdit: ScheduleCoachDelta[];
}

/** save-schedule-hd — insert (FgMode "I", full Data*) or edit (FgMode "E",
 *  Data*Edit deltas). Plain JSON (not multipart). */
export function saveScheduleHd(objParam: ScheduleHdSaveParam): Promise<void> {
  return apiPost<void>(
    "/schedule/save-schedule-hd",
    { objParam },
    { auth: true },
  );
}

/** delete-schedule-hd — hard delete; the backend rejects with an "already used"
 *  error when the schedule already has attendance. */
export function deleteScheduleHd(scheduleHdId: number): Promise<void> {
  return apiPost<void>(
    "/schedule/delete-schedule-hd",
    { objParam: { ScheduleHdId: scheduleHdId } },
    { auth: true },
  );
}
