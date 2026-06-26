// src/lib/api/recommendations.ts
//
// Typed fetchers for the StudentRecommendation endpoints (backend-nenggala
// /attendance/get-student-to-recom, /get-student-recom, /save-student-recom).
//
// A recommendation is keyed on (SchPeriodId, UserDataId, ProgramMsId) where the
// program is the student's MAIN program (ProgramMs.FgMain = 'Y') — it is NOT
// per-schedule and NOT per sub-program/category. The write is INSERT-only: the
// backend has no delete-student-recom, so a recommendation cannot be undone.
//
//   get-student-to-recom  candidates in a period NOT yet recommended (the roster
//                         to mark). Returns ProgramMsId (added to its SELECT so
//                         save has the exact main-program key).
//   get-student-recom     already-recommended students, with TotalAtd/TotalScore.
//   save-student-recom    inserts one StudentRecommendation row per student.
//
// All calls attach the bearer token. MsgData is the row array.
import { apiPost } from "./client";

const NO_SEARCH = { FieldName: "", FieldValue: "" };

// ---- candidates (not yet recommended) ----

export interface StudentToRecomRow {
  StudentId: number;
  StudentNoId: string | null;
  StudentName: string | null;
  ProgramMsId: number;
  ProgramName: string | null;
  DojangId: number | null;
  DojangName: string | null;
  BeltMasterId: number | null;
  BeltName: string | null;
  SchPeriodId: number;
  PeriodTitle: string | null;
}

export function fetchStudentToRecom(
  schPeriodId: number,
): Promise<StudentToRecomRow[]> {
  return apiPost<StudentToRecomRow[]>(
    "/attendance/get-student-to-recom",
    { objParam: { ObjSearch: NO_SEARCH, SchPeriodId: schPeriodId } },
    { auth: true },
  );
}

// ---- recommended list ----

export interface StudentRecomRow {
  UserDataId: number;
  UserNoId: string | null;
  UserName: string | null;
  ProgramMsId: number;
  ProgramName: string | null;
  PeriodTitle: string | null;
  BeltMasterId: number | null;
  BeltName: string | null;
  BeltLevel: number | null;
  DojangId: number | null;
  DojangName: string | null;
  TotalAtd: number;
  TotalScore: number | null;
  RecomendationBy: string | null;
}

export interface StudentRecomParams {
  schPeriodId: number;
  userNoId?: string;
  userName?: string;
  beltName?: string;
}

export function fetchStudentRecom(
  p: StudentRecomParams,
): Promise<StudentRecomRow[]> {
  return apiPost<StudentRecomRow[]>(
    "/attendance/get-student-recom",
    {
      objParam: {
        ObjSearch: NO_SEARCH,
        SchPeriodId: p.schPeriodId,
        UserNoId: p.userNoId ?? "",
        UserName: p.userName ?? "",
        BeltName: p.beltName ?? "",
      },
    },
    { auth: true },
  );
}

// ---- write (insert-only) ----

export interface StudentRecomSaveParam {
  SchPeriodId: number;
  DataRecomStudent: { StudentId: number; ProgramMsId: number }[];
}

/** save-student-recom — marks the given students as recommended for the period.
 *  Insert-only: there is no un-recommend endpoint. */
export function saveStudentRecom(
  objParam: StudentRecomSaveParam,
): Promise<void> {
  return apiPost<void>(
    "/attendance/save-student-recom",
    { objParam },
    { auth: true },
  );
}
