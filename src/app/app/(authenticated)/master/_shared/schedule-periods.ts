// src/app/app/(authenticated)/master/_shared/schedule-periods.ts
import { fetchSchedulePeriods } from "@/lib/api/master";
import { dmyhmsToIso } from "@/lib/api/dates";
import {
  ensureDojangsLoaded,
  getDojangById,
} from "./dojangs";

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
  ensureSchedulePeriodsLoaded();
  return () => {
    listeners.delete(listener);
  };
}

// ---- hydration (read API) ----
// get-schperiod (IsEntry "N"). The backend returns DojangId (not a name) and
// dates as "dd MMMM yyyy", and has no status column — so the dojang name is
// resolved via the dojang store, dates are normalised to "YYYY-MM", and every
// period is treated as Active (the status toggle stays client-only).
let _loaded = false;
let _loadPromise: Promise<void> | null = null;

/** "05 January 2026" → "2026-01". */
function toYearMonth(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

async function loadSchedulePeriods(): Promise<void> {
  // Need dojang names to resolve DojangId.
  await ensureDojangsLoaded();
  const rows = (await fetchSchedulePeriods()) ?? [];
  _periods = rows.map((r) => ({
    id: r.SchPeriodId,
    periodName: r.PeriodTitle,
    dojang:
      (r.DojangId != null ? getDojangById(r.DojangId)?.dojangName : "") ?? "",
    periodStart: toYearMonth(r.PeriodStart),
    periodEnd: toYearMonth(r.PeriodEnd),
    status: "Active",
    updatedBy: r.UpdatedBy ?? "",
    updateDate: dmyhmsToIso(r.UpdateDate),
  }));
  notify();
}

/** One-time hydration of the schedule-period master from the backend. */
export function ensureSchedulePeriodsLoaded(): Promise<void> {
  if (_loaded) return Promise.resolve();
  if (!_loadPromise) {
    _loadPromise = loadSchedulePeriods()
      .then(() => {
        _loaded = true;
      })
      .catch((err) => {
        console.error("Failed to load schedule periods", err);
        _loadPromise = null;
      });
  }
  return _loadPromise;
}

/** Re-fetch the schedule-period master (used after a write). */
export async function reloadSchedulePeriods(): Promise<void> {
  _loaded = false;
  _loadPromise = null;
  await ensureSchedulePeriodsLoaded();
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
