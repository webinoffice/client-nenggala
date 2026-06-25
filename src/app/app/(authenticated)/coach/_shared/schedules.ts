// src/app/app/(authenticated)/coach/_shared/schedules.ts

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

export type Schedule = {
  id: string;
  dojang: string;
  programId: number; // ProgramMsId
  subProgramId: number; // ProgramDtId (was: type)
  primaryCoachUsername: string;
  secondaryCoachUsernames: string[];
  assistantUsernames: string[];
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  periodId: string;
  startSchedule: string;
  endSchedule: string;
  studentUsernames: string[];
  status: ScheduleStatus;
  updatedBy: string;
  updateDate: string;
};

const INITIAL_SCHEDULES: Schedule[] = [
  {
    id: "SCH-0001",
    dojang: "Kedoya Sport Club",
    programId: 1,
    subProgramId: 1,
    primaryCoachUsername: "C0001",
    secondaryCoachUsernames: ["C0002"],
    assistantUsernames: ["U0006"],
    dayOfWeek: "Monday",
    startTime: "09:30",
    endTime: "11:30",
    periodId: "32",
    startSchedule: "2026-01",
    endSchedule: "2026-06",
    studentUsernames: ["U0005", "U0006", "U0007"],
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-12-20T10:00:00Z",
  },
  {
    id: "SCH-0002",
    dojang: "Kedoya Sport Club",
    programId: 1,
    subProgramId: 2,
    primaryCoachUsername: "C0002",
    secondaryCoachUsernames: [],
    assistantUsernames: [],
    dayOfWeek: "Tuesday",
    startTime: "10:00",
    endTime: "12:00",
    periodId: "32",
    startSchedule: "2026-01",
    endSchedule: "2026-06",
    studentUsernames: ["U0001", "U0002", "U0003", "U0004"],
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-12-20T10:05:00Z",
  },
  {
    id: "SCH-0003",
    dojang: "Kedoya Sport Club",
    programId: 1,
    subProgramId: 2,
    primaryCoachUsername: "C0003",
    secondaryCoachUsernames: [],
    assistantUsernames: [],
    dayOfWeek: "Wednesday",
    startTime: "19:30",
    endTime: "20:30",
    periodId: "32",
    startSchedule: "2026-01",
    endSchedule: "2026-06",
    studentUsernames: ["U0003", "U0004"],
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-12-20T10:10:00Z",
  },
  {
    id: "SCH-0004",
    dojang: "Kedoya Sport Club",
    programId: 1,
    subProgramId: 3,
    primaryCoachUsername: "C0004",
    secondaryCoachUsernames: ["C0001"],
    assistantUsernames: [],
    dayOfWeek: "Thursday",
    startTime: "18:30",
    endTime: "19:30",
    periodId: "32",
    startSchedule: "2026-01",
    endSchedule: "2026-06",
    studentUsernames: ["U0005", "U0006", "U0007"],
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-12-20T10:15:00Z",
  },
  {
    id: "SCH-0005",
    dojang: "Kedoya Sport Club",
    programId: 1,
    subProgramId: 1,
    primaryCoachUsername: "C0001",
    secondaryCoachUsernames: [],
    assistantUsernames: [],
    dayOfWeek: "Friday",
    startTime: "17:30",
    endTime: "18:30",
    periodId: "32",
    startSchedule: "2026-01",
    endSchedule: "2026-06",
    studentUsernames: ["U0006", "U0007"],
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-12-20T10:20:00Z",
  },
  {
    id: "SCH-0006",
    dojang: "Kedoya Sport Club",
    programId: 2,
    subProgramId: 4,
    primaryCoachUsername: "C0005",
    secondaryCoachUsernames: [],
    assistantUsernames: [],
    dayOfWeek: "Saturday",
    startTime: "19:00",
    endTime: "20:00",
    periodId: "32",
    startSchedule: "2026-01",
    endSchedule: "2026-06",
    studentUsernames: ["U0006"],
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-12-20T10:25:00Z",
  },
  {
    id: "SCH-0007",
    dojang: "Kedoya Sport Club",
    programId: 3,
    subProgramId: 5,
    primaryCoachUsername: "C0003",
    secondaryCoachUsernames: [],
    assistantUsernames: [],
    dayOfWeek: "Sunday",
    startTime: "09:30",
    endTime: "10:30",
    periodId: "32",
    startSchedule: "2026-01",
    endSchedule: "2026-06",
    studentUsernames: ["U0006", "U0007"],
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-12-20T10:30:00Z",
  },
];

let _schedules: Schedule[] = [...INITIAL_SCHEDULES];
const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((l) => l());
}

export function getSchedules() {
  return _schedules;
}
export function subscribeSchedules(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
export function getScheduleById(id: string) {
  return _schedules.find((s) => s.id === id) ?? null;
}
export function getNextScheduleId(): string {
  const max = _schedules.reduce((m, s) => {
    const n = parseInt(s.id.replace(/^SCH-/, ""), 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `SCH-${String(max + 1).padStart(4, "0")}`;
}
export function addSchedule(s: Schedule) {
  _schedules = [s, ..._schedules];
  notify();
}
export function updateSchedule(id: string, patch: Partial<Schedule>) {
  _schedules = _schedules.map((s) => (s.id === id ? { ...s, ...patch } : s));
  notify();
}
export function toggleScheduleStatus(id: string, by: string) {
  _schedules = _schedules.map((s) =>
    s.id === id
      ? {
          ...s,
          status: s.status === "Active" ? "Inactive" : "Active",
          updatedBy: by,
          updateDate: new Date().toISOString(),
        }
      : s,
  );
  notify();
}
