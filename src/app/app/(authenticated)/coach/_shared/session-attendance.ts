// src/app/app/(authenticated)/coach/_shared/session-attendance.ts

export type SessionAttendance = {
  id: string;
  scheduleId: string;
  date: string; // YYYY-MM-DD
  coachUsername: string;
  attendingStudentUsernames: string[];
  submittedBy: string;
  submitDate: string; // ISO
};

const INITIAL_SESSION_ATTENDANCE: SessionAttendance[] = [
  // Demo: Marvin (C0001) submitted attendance for SCH-0001 on 2026-01-05
  {
    id: "SA-0001",
    scheduleId: "SCH-0001",
    date: "2026-01-05",
    coachUsername: "C0001",
    attendingStudentUsernames: ["U0005", "U0006", "U0007"],
    submittedBy: "Marvin Hadi",
    submitDate: "2026-01-05T11:35:00Z",
  },
  {
    id: "SA-0002",
    scheduleId: "SCH-0001",
    date: "2026-01-12",
    coachUsername: "C0001",
    attendingStudentUsernames: ["U0005", "U0006"],
    submittedBy: "Marvin Hadi",
    submitDate: "2026-01-12T11:34:00Z",
  },
];

let _records: SessionAttendance[] = [...INITIAL_SESSION_ATTENDANCE];
const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((l) => l());
}

export function getSessionAttendance(): SessionAttendance[] {
  return _records;
}
export function subscribeSessionAttendance(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function getSessionAttendanceFor(
  scheduleId: string,
  date: string,
): SessionAttendance | null {
  return (
    _records.find((r) => r.scheduleId === scheduleId && r.date === date) ?? null
  );
}

export function getSubmissionsByCoach(
  coachUsername: string,
): SessionAttendance[] {
  return _records.filter((r) => r.coachUsername === coachUsername);
}

export function getNextSessionAttendanceId(): string {
  const max = _records.reduce((m, r) => {
    const n = parseInt(r.id.replace(/^SA-/, ""), 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `SA-${String(max + 1).padStart(4, "0")}`;
}

export function submitSessionAttendance(rec: SessionAttendance) {
  _records = [..._records, rec];
  notify();
}