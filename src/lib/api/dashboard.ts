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
