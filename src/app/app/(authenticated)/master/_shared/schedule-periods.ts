// src/app/app/(authenticated)/master/_shared/schedule-periods.ts

export type SchedulePeriodStatus = "Active" | "Inactive";

export type SchedulePeriod = {
  id: number;
  periodName: string;
  dojang: string;
  periodStart: string; // YYYY-MM
  periodEnd: string; // YYYY-MM
  status: SchedulePeriodStatus;
  updatedBy: string;
  updateDate: string;
};

export const INITIAL_PERIODS: SchedulePeriod[] = [
  { id: 1, periodName: "Period 32", dojang: "Kedoya Sport Club", periodStart: "2026-01", periodEnd: "2026-06", status: "Active", updatedBy: "Jordan Kusuma", updateDate: "2026-01-01T14:30:00" },
  { id: 2, periodName: "Period 33", dojang: "Kedoya Sport Club", periodStart: "2026-07", periodEnd: "2026-12", status: "Active", updatedBy: "Jordan Kusuma", updateDate: "2026-01-01T14:30:00" },
  { id: 3, periodName: "Period 31", dojang: "Senayan Dojang", periodStart: "2025-07", periodEnd: "2025-12", status: "Active", updatedBy: "Carolina", updateDate: "2025-06-15T10:00:00" },
  { id: 4, periodName: "Period 30", dojang: "Bintaro Dojang", periodStart: "2025-01", periodEnd: "2025-06", status: "Inactive", updatedBy: "Carolina", updateDate: "2024-12-20T11:00:00" },
];

// ---- mutable store ----
let _periods: SchedulePeriod[] = [...INITIAL_PERIODS];
const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((l) => l());
}

export function getSchedulePeriods(): SchedulePeriod[] {
  return _periods;
}
export function subscribeSchedulePeriods(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function getMaxSchedulePeriodId(): number {
  return _periods.length > 0 ? Math.max(..._periods.map((p) => p.id)) : 0;
}
/** Add one or more periods (the form creates one record per selected dojang). */
export function addSchedulePeriods(created: SchedulePeriod[]) {
  _periods = [...created, ..._periods];
  notify();
}
export function updateSchedulePeriod(id: number, patch: Partial<SchedulePeriod>) {
  _periods = _periods.map((p) => (p.id === id ? { ...p, ...patch } : p));
  notify();
}
export function toggleSchedulePeriodStatus(id: number, by: string) {
  _periods = _periods.map((p) =>
    p.id === id
      ? {
          ...p,
          status: p.status === "Active" ? "Inactive" : "Active",
          updatedBy: by,
          updateDate: new Date().toISOString(),
        }
      : p,
  );
  notify();
}
