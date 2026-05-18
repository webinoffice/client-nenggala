// src/app/app/(authenticated)/student/_shared/attendance.ts

export type AttendanceRecord = {
  studentUsername: string;
  periodId: string;
  count: number;
};

// Minimum attendance required to submit a score without admin override.
export const MIN_ATTENDANCE = 16;

export const ATTENDANCE: AttendanceRecord[] = [
  // Period 32
  { studentUsername: "U0001", periodId: "32", count: 14 },
  { studentUsername: "U0002", periodId: "32", count: 15 },
  { studentUsername: "U0003", periodId: "32", count: 16 },
  { studentUsername: "U0004", periodId: "32", count: 17 },
  { studentUsername: "U0005", periodId: "32", count: 16 },
  { studentUsername: "U0006", periodId: "32", count: 4 },  // low — demo override flow
  { studentUsername: "U0007", periodId: "32", count: 18 },
  { studentUsername: "U0008", periodId: "32", count: 16 },
  // Historical
  { studentUsername: "U0006", periodId: "30", count: 16 },
  { studentUsername: "U0007", periodId: "30", count: 16 },
  { studentUsername: "U0006", periodId: "29", count: 16 },
];

export function getAttendance(
  studentUsername: string,
  periodId: string,
): number {
  const rec = ATTENDANCE.find(
    (a) => a.studentUsername === studentUsername && a.periodId === periodId,
  );
  return rec?.count ?? 0;
}