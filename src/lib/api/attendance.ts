// src/lib/api/attendance.ts
//
// Typed fetchers for the authenticated attendance endpoints (backend-nenggala
// /attendance/*). There is no "submission" entity — everything is the
// Attendance(ScheduleDtId, UserDataId, FgCoach) table:
//
//   save-attendance     inserts one row per present person (FgAtd='Y') for a
//                       given ScheduleDtId (students FgCoach='N', coaches 'Y').
//   get-*-to-atd        who is still UN-recorded for a ScheduleDtId (the submit
//                       roster).
//   get-student-atd     per student×program summary (TotalSch / TotalAtd).
//   get-coach-atd       per coach×program monthly summary (TotalAtd).
//   get-coach-atd-detail the session dates behind a coach's monthly count.
//
// Reads/writes attach the bearer token. MsgData is the row array.
import { apiPost } from "./client";

const NO_SEARCH = { FieldName: "", FieldValue: "" };

// ---- submit roster (pending) ----

export interface StudentToAtdRow {
  FgLastDay: string | null;
  UserDataId: number;
  UserNoId: string | null;
  UserName: string | null;
  ScheduleMbrId: number;
  PeriodTitle: string | null;
}

export function fetchStudentToAtd(
  scheduleDtId: number,
): Promise<StudentToAtdRow[]> {
  return apiPost<StudentToAtdRow[]>(
    "/attendance/get-student-to-atd",
    { objParam: { ObjSearch: NO_SEARCH, ScheduleDtId: scheduleDtId } },
    { auth: true },
  );
}

export interface CoachToAtdRow {
  FgLastDay: string | null;
  UserDataId: number;
  UserNoId: string | null;
  UserName: string | null;
  PeriodTitle: string | null;
}

export function fetchCoachToAtd(scheduleDtId: number): Promise<CoachToAtdRow[]> {
  return apiPost<CoachToAtdRow[]>(
    "/attendance/get-coach-to-atd",
    { objParam: { ObjSearch: NO_SEARCH, ScheduleDtId: scheduleDtId } },
    { auth: true },
  );
}

// ---- summaries ----

export interface StudentAtdRow {
  UserDataId: number;
  UserNoId: string | null;
  UserName: string | null;
  ProgramName: string | null;
  ScheduleHdId: number;
  DojangId: number | null;
  DojangName: string | null;
  PeriodTitle: string | null;
  BeltMasterId: number | null;
  BeltName: string | null;
  TotalSch: number;
  TotalAtd: number;
}

export interface StudentAtdParams {
  schPeriodId: number;
  studentId?: number;
  userNoId?: string;
  userName?: string;
  dojangName?: string;
}

export function fetchStudentAtd(p: StudentAtdParams): Promise<StudentAtdRow[]> {
  return apiPost<StudentAtdRow[]>(
    "/attendance/get-student-atd",
    {
      objParam: {
        ObjSearch: NO_SEARCH,
        SchPeriodId: p.schPeriodId,
        StudentId: p.studentId ?? 0,
        UserNoId: p.userNoId ?? "",
        UserName: p.userName ?? "",
        DojangName: p.dojangName ?? "",
      },
    },
    { auth: true },
  );
}

export interface CoachAtdRow {
  UserDataId: number;
  UserNoId: string | null;
  UserName: string | null;
  ProgramMsId: number;
  ProgramName: string | null;
  PeriodTitle: string | null;
  TotalAtd: number;
}

export interface CoachAtdParams {
  /** "YYYY-MM" */
  monthPeriod: string;
  coachId?: number;
  userNoId?: string;
  userName?: string;
}

export function fetchCoachAtd(p: CoachAtdParams): Promise<CoachAtdRow[]> {
  return apiPost<CoachAtdRow[]>(
    "/attendance/get-coach-atd",
    {
      objParam: {
        ObjSearch: NO_SEARCH,
        MonthPeriod: p.monthPeriod,
        CoachId: p.coachId ?? 0,
        UserNoId: p.userNoId ?? "",
        UserName: p.userName ?? "",
      },
    },
    { auth: true },
  );
}

export interface CoachAtdDetailRow {
  /** "Weekday, dd Month yyyy" */
  ScheduleDate: string | null;
  DojangName: string | null;
  ProgramDtName: string | null;
}

export function fetchCoachAtdDetail(p: {
  monthPeriod: string;
  programMsId: number;
}): Promise<CoachAtdDetailRow[]> {
  return apiPost<CoachAtdDetailRow[]>(
    "/attendance/get-coach-atd-detail",
    {
      objParam: {
        ObjSearch: NO_SEARCH,
        MonthPeriod: p.monthPeriod,
        ProgramMsId: p.programMsId,
      },
    },
    { auth: true },
  );
}

// ---- write ----

export interface AttendanceSaveParam {
  ScheduleDtId: number;
  DataAtdStudent: { StudentId: number; ScheduleMbrId: number; FgAtd: "Y" | "N" }[];
  DataAtdCoach: { CoachId: number; FgAtd: "Y" | "N" }[];
}

/** save-attendance — records the present people for one occurrence. Append-only:
 *  the backend inserts a row only for FgAtd='Y', and the get-*-to-atd reads
 *  exclude already-recorded people. */
export function saveAttendance(objParam: AttendanceSaveParam): Promise<void> {
  return apiPost<void>(
    "/attendance/save-attendance",
    { objParam },
    { auth: true },
  );
}
