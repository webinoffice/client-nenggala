// src/lib/api/assessment.ts
//
// Typed fetchers for the assessment / exam endpoints (backend-nenggala
// /assessment/*). These drive Step 3d: exam registration ("Ikut Ujian") and the
// score (assessment) entry / view / list.
//
// Two registration flows feed the same StudentExam table:
//   save-exam-by-student  student self-service, MULTIPART (uploads bukti bayar)
//   save-bulk-exam        admin cash flow, no file (one or many students)
//
// Scoring is keyed on (StudentId, ProgramMsId, SchPeriodId) where ProgramMsId is
// the student's MAIN program (ProgramMs.FgMain = 'Y'). Assessment items are
// template rows (AssessTempDt) gated server-side by ScoreLevel <= BeltLevel.
// Pass/belt-up is server-authoritative (BeltMaster.BeltPassScore); the read
// endpoints return TotalScore but no explicit pass flag — derive it client-side.
//
// All calls attach the bearer token. List/result MsgData are row arrays.
//
// NOTE: save-student-assess-bulk (xlsx import) is intentionally NOT here — it
// signals validation errors with MsgCode 1 + MsgData (which the shared unwrap
// would throw away), so it needs a raw-envelope handler built in Section 5.
import { apiPost, apiPostForm, ApiError } from "./client";
import { API_BASE_URL } from "./config";
import { getAccessToken } from "./token";

const NO_SEARCH = { FieldName: "", FieldValue: "" };

// ---- candidates eligible to register for exam (not yet registered) ----

export interface StudentToExamRow {
  StudentId: number;
  StudentNoId: string | null;
  StudentName: string | null;
  TimeStart: string | null;
  TimeEnd: string | null;
  ProgramMsId: number;
  ProgramName: string | null;
  DojangId: number | null;
  DojangName: string | null;
  BeltMasterId: number | null;
  BeltName: string | null;
  SchPeriodId: number;
  PeriodTitle: string | null;
}

/** get-student-to-exam — students in a period eligible to register (schedule
 *  members of a main program, not yet in StudentExam). */
export function fetchStudentToExam(
  schPeriodId: number,
): Promise<StudentToExamRow[]> {
  return apiPost<StudentToExamRow[]>(
    "/assessment/get-student-to-exam",
    { objParam: { SchPeriodId: schPeriodId } },
    { auth: true },
  );
}

// ---- exam registration ----

export interface BulkExamSaveParam {
  SchPeriodId: number;
  ProgramMsId: number;
  DataExam: { StudentId: number }[];
}

/** save-bulk-exam — admin cash flow: register one or more students (no file). */
export function saveBulkExam(objParam: BulkExamSaveParam): Promise<void> {
  return apiPost<void>(
    "/assessment/save-bulk-exam",
    { objParam },
    { auth: true },
  );
}

export interface ExamByStudentSaveParam {
  SchPeriodId: number;
  StudentId: number;
  ProgramMsId: number;
}

/** save-exam-by-student — student self-service: register + upload bukti bayar.
 *  MULTIPART: objParam rides as a JSON string, the proof as "ExamPaymentFile".
 *  The backend rejects a duplicate (already-registered) registration. */
export function saveExamByStudent(
  objParam: ExamByStudentSaveParam,
  file: File,
): Promise<void> {
  const form = new FormData();
  form.append("objParam", JSON.stringify(objParam));
  form.append("ExamPaymentFile", file);
  return apiPostForm<void>("/assessment/save-exam-by-student", form, {
    auth: true,
  });
}

// ---- the exam / score table (registered students for a period) ----

export interface StudentAssessListRow {
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
  /** "Y" when attendance is below the minimum (16). */
  FgLackAtd: string | null;
  LackAtdDesc: string | null;
  /** SUM of AssessScore for this student/program/period (0 when not assessed). */
  TotalScore: number;
  /** Relative path to the uploaded payment proof (null for cash registrations). */
  ExamPaymentFile: string | null;
}

export interface StudentAssessListParams {
  schPeriodId: number;
  userNoId?: string;
  userName?: string;
  beltName?: string;
}

/** get-student-assess-list — every student registered for exam in the period,
 *  with attendance, total score and payment proof. */
export function fetchStudentAssessList(
  p: StudentAssessListParams,
): Promise<StudentAssessListRow[]> {
  return apiPost<StudentAssessListRow[]>(
    "/assessment/get-student-assess-list",
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

// ---- assessment template items (the score-entry fields, by belt level) ----

export interface AssessEntryRow {
  AssessTempDtId: number;
  AssessTitle: string | null;
  MinScore: number | null;
  MaxScore: number | null;
  ScoreLevel: number | null;
}

/** get-assess-entry — template items applicable to a belt level
 *  (ScoreLevel <= BeltLevel). These are the fields to score. */
export function fetchAssessEntry(beltLevel: number): Promise<AssessEntryRow[]> {
  return apiPost<AssessEntryRow[]>(
    "/assessment/get-assess-entry",
    { objParam: { BeltLevel: beltLevel } },
    { auth: true },
  );
}

// ---- a student's saved assessment scores (the score view) ----

export interface AssessResultRow {
  StudentAssessId: number;
  StudentId: number;
  ProgramMsId: number;
  SchPeriodId: number;
  AssessTempDtId: number;
  AssessScore: number;
  AssessTitle: string | null;
  MinScore: number | null;
  MaxScore: number | null;
  ScoreLevel: number | null;
}

export interface AssessResultParams {
  studentId: number;
  programMsId: number;
  schPeriodId: number;
}

/** get-assess-result — the per-item scores saved for one student/program/period. */
export function fetchAssessResult(
  p: AssessResultParams,
): Promise<AssessResultRow[]> {
  return apiPost<AssessResultRow[]>(
    "/assessment/get-assess-result",
    {
      objParam: {
        StudentId: p.studentId,
        ProgramMsId: p.programMsId,
        SchPeriodId: p.schPeriodId,
      },
    },
    { auth: true },
  );
}

// ---- save one student's scores (insert-only; auto belt-up server-side) ----

export interface StudentAssessSingleSaveParam {
  StudentId: number;
  ProgramMsId: number;
  SchPeriodId: number;
  BeltMasterId: number;
  /** Required only when attendance is below the minimum (records StudentLack). */
  LackAtdDesc?: string | null;
  DataAssess: { AssessTempDtId: number; AssessScore: number }[];
}

/** save-student-assess-single — inserts one StudentAssess row per item, then the
 *  backend auto-promotes the belt when the total reaches BeltPassScore. There is
 *  no dedupe/upsert — the caller must prevent re-submitting an assessed student. */
export function saveStudentAssessSingle(
  objParam: StudentAssessSingleSaveParam,
): Promise<void> {
  return apiPost<void>(
    "/assessment/save-student-assess-single",
    { objParam },
    { auth: true },
  );
}

// ---- xlsx import candidate list (students not yet assessed, one row per item) ----

export interface StudentImportAssessRow {
  UserDataId: number;
  UserNoId: string | null;
  UserName: string | null;
  ProgramMsId: number;
  ProgramName: string | null;
  PeriodTitle: string | null;
  PeriodTitleStr: string | null;
  BeltMasterId: number | null;
  BeltName: string | null;
  BeltLevel: number | null;
  DojangId: number | null;
  DojangName: string | null;
  TotalAtd: number;
  FgLackAtd: string | null;
  LackAtdDesc: string | null;
  AssessTempDtId: number;
  AssessTitle: string | null;
  MinScore: number | null;
  MaxScore: number | null;
  ScoreLevel: number | null;
}

/** get-student-import-assess-list — students in the period NOT yet assessed,
 *  expanded one row per applicable template item (drives the xlsx template). */
export function fetchStudentImportAssessList(
  p: StudentAssessListParams,
): Promise<StudentImportAssessRow[]> {
  return apiPost<StudentImportAssessRow[]>(
    "/assessment/get-student-import-assess-list",
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

// ---- xlsx import (save-student-assess-bulk) ----
//
// Special case: this endpoint signals partial-validation failures with MsgCode 1
// + MsgData (an array of error rows), and "nothing eligible to import" with
// MsgCode 1 + MsgData null. The shared apiPost/unwrap throws on MsgCode !== 0 and
// discards MsgData, so we read the envelope directly here. Only MsgCode 99 is a
// true error (thrown). Note the route has NO multer — rows are POSTed as JSON
// (parse the xlsx client-side).

export interface BulkImportRow {
  UserNoId: string;
  UserName: string;
  ProgramName: string;
  /** Must equal SchPeriod.PeriodCount (what the backend validation matches on). */
  PeriodTitle: string | number;
  BeltName: string;
  DojangName: string;
  LackAtdDesc?: string | null;
  DataAssess: { AssessTitle: string; AssessScore: number }[];
}

export interface BulkImportError {
  StudentNoId: string | null;
  StudentName: string | null;
  ProgramName: string | null;
  DojangName: string | null;
  ErrDesc: string | null;
}

export interface BulkImportResult {
  /** All rows imported (MsgCode 0). */
  ok: boolean;
  /** No eligible (unassessed) students for the period (MsgCode 1, MsgData null). */
  nothingToImport: boolean;
  message: string;
  /** Rows that failed validation (partial import). */
  errors: BulkImportError[];
}

interface BulkEnvelope {
  objRes?: {
    MsgCode: number;
    MsgDesc?: string;
    MsgData?: BulkImportError[] | null;
  };
}

export async function saveStudentAssessBulk(objParam: {
  SchPeriodId: number;
  ListDataImport: BulkImportRow[];
}): Promise<BulkImportResult> {
  const token = getAccessToken();
  const res = await fetch(
    `${API_BASE_URL}/assessment/save-student-assess-bulk`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ objParam }),
      credentials: "include",
    },
  );

  let json: BulkEnvelope;
  try {
    json = (await res.json()) as BulkEnvelope;
  } catch {
    throw new ApiError(`Unexpected response (HTTP ${res.status})`, res.status);
  }
  const objRes = json?.objRes;
  if (!objRes) {
    throw new ApiError(`Malformed response (HTTP ${res.status})`, res.status);
  }
  if (objRes.MsgCode === 99) {
    throw new ApiError(objRes.MsgDesc || "Import failed", 99);
  }

  const data = objRes.MsgData;
  return {
    ok: objRes.MsgCode === 0,
    nothingToImport: objRes.MsgCode === 1 && data == null,
    message: objRes.MsgDesc || "",
    errors: Array.isArray(data) ? data : [],
  };
}
