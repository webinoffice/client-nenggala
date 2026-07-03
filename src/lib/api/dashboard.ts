// src/lib/api/dashboard.ts
//
// Dashboard reads. The super-admin dashboard has a dedicated backend endpoint
// that computes its metrics server-side (student/coach totals, new-member
// timeline, active-schedule count, belt distribution) — the client must use it
// rather than re-deriving from the operational stores, so the numbers match the
// backend's definitions (e.g. "active schedule" counting).
import { apiPost } from "./client";

interface CountRow {
  Total: number;
}
interface NewMemberRow {
  Month: string; // "Jan", "Feb", …
  Total: number;
}
interface BeltDistRow {
  BeltName: string;
  Total: number;
}

export interface AdminDashboardData {
  ObjStudentTotal?: CountRow[];
  ObjCoachTotal?: CountRow[];
  ObjNewMember?: NewMemberRow[];
  ObjActiveSchedule?: CountRow[];
  ObjBeltDistribution?: BeltDistRow[];
}

/** POST /dashboard/get-dashboard-data — super-admin only (UserTypeCode "X"). */
export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  return apiPost<AdminDashboardData>(
    "/dashboard/get-dashboard-data",
    {},
    { auth: true },
  );
}

/**
 * The logged-in student's own profile summary. Student-only (UserTypeCode "S");
 * the backend self-scopes to the caller's UserDataId from the token, so no
 * params are sent. This is the ONLY student-accessible read of their profile —
 * get-user-data is admin/super-admin only and 403s for a student.
 */
export interface StudentDashboardData {
  UserDataId: number;
  UserNoId: string;
  UserName: string;
  BeltMasterId: number | null;
  BeltName: string | null;
  DojangId: number | null;
  DojangName: string | null;
  ProgramMsId: number | null;
  SchPeriodId: number | null;
  PeriodTitle: string | null;
  /** SUM of the current period's exam scores (0 when not yet assessed). */
  LastScore: number;
  /** Maximum achievable total for the student's belt level (SUM of applicable
   *  items' MaxScore). Normalise LastScore against this before comparing to the
   *  belt's pass score. 0 when unknown. */
  MaxScore: number;
}

/** POST /dashboard/get-dashboard-student — student-only. Null when the student
 *  has no dojang/belt row yet (the backend returns no row). */
export async function fetchStudentDashboard(): Promise<StudentDashboardData | null> {
  return apiPost<StudentDashboardData | null>(
    "/dashboard/get-dashboard-student",
    {},
    { auth: true },
  );
}

/**
 * The logged-in coach's own profile summary. Coach-only (UserTypeCode "I"); the
 * backend self-scopes to the caller's UserDataId from the token, so no params are
 * sent. This is the ONLY coach-accessible read of their profile — get-user-data
 * is admin/super-admin only and 403s for a coach. Coaches carry no dojang.
 * Dates come "dd/mm/yyyy" like get-user-data.
 */
export interface CoachDashboardData {
  UserDataId: number;
  UserNoId: string;
  UserName: string | null;
  UserNickname: string | null;
  UserPhoneNumber1: string | null;
  UserPhoneNumber2: string | null;
  UserEmailAddress: string | null;
  UserGender: string | null;
  UserPhoto: string | null;
  BeltMasterId: number | null;
  BeltName: string | null;
  /** "dd/mm/yyyy" */
  UserJoinDate: string | null;
}

/** POST /dashboard/get-dashboard-coach — coach-only. Empty object when the
 *  caller has no coach profile row (the backend returns {}). */
export async function fetchCoachDashboard(): Promise<CoachDashboardData | null> {
  const data = await apiPost<CoachDashboardData | Record<string, never>>(
    "/dashboard/get-dashboard-coach",
    {},
    { auth: true },
  );
  return data && "UserDataId" in data ? (data as CoachDashboardData) : null;
}
