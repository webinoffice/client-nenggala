// src/app/app/(authenticated)/master/_shared/schedule-periods.ts
import {
  fetchSchedulePeriods,
  saveSchPeriod,
  deleteSchPeriod,
} from "@/lib/api/master";
import { dmyhmsToIso } from "@/lib/api/dates";
import {
  ensureDojangsLoaded,
  getDojangById,
  getDojangs,
} from "./dojangs";

export type SchedulePeriodStatus = "Active" | "Inactive";

export type SchedulePeriod = {
  id: number;
  periodName: string;
  dojang: string;
  periodStart: string; // YYYY-MM-DD
  periodEnd: string; // YYYY-MM-DD
  status: SchedulePeriodStatus;
  updatedBy: string;
  updateDate: string;
};

export const INITIAL_PERIODS: SchedulePeriod[] = [
  { id: 1, periodName: "Period 32", dojang: "Kedoya Sport Club", periodStart: "2026-01-01", periodEnd: "2026-06-30", status: "Active", updatedBy: "Jordan Kusuma", updateDate: "2026-01-01T14:30:00" },
  { id: 2, periodName: "Period 33", dojang: "Kedoya Sport Club", periodStart: "2026-07-01", periodEnd: "2026-12-31", status: "Active", updatedBy: "Jordan Kusuma", updateDate: "2026-01-01T14:30:00" },
  { id: 3, periodName: "Period 31", dojang: "Senayan Dojang", periodStart: "2025-07-01", periodEnd: "2025-12-31", status: "Active", updatedBy: "Carolina", updateDate: "2025-06-15T10:00:00" },
  { id: 4, periodName: "Period 30", dojang: "Bintaro Dojang", periodStart: "2025-01-01", periodEnd: "2025-06-30", status: "Inactive", updatedBy: "Carolina", updateDate: "2024-12-20T11:00:00" },
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
// resolved via the dojang store, dates are normalised to "YYYY-MM-DD" (the
// SchPeriod.PeriodStart/PeriodEnd columns are full DATEs), and every period is
// treated as Active (the status toggle stays client-only).
let _loaded = false;
let _loadPromise: Promise<void> | null = null;

/** "05 January 2026" → "2026-01-05" (local date components). */
function toIsoDate(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
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
    periodStart: toIsoDate(r.PeriodStart),
    periodEnd: toIsoDate(r.PeriodEnd),
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

// ---- writes ----
// save-schperiod / delete-schperiod (plain JSON). The backend has no status
// column and no inact endpoint, so "disable" is a hard delete (guarded against
// in-use periods server-side). On insert the backend auto-assigns PeriodCount
// (the "Period N" name) per dojang, so the form's periodName is informational.
// Dates are day-level ("YYYY-MM-DD") and passed straight through to the DATE
// columns — both start and end are editable.

function resolveDojangId(name: string): number | null {
  return getDojangs().find((d) => d.dojangName === name)?.id ?? null;
}

/** Insert one period per created row (the form fans out over the selected
 *  dojangs). Resolves dojang name → id, converts "YYYY-MM" to dates, then
 *  re-fetches so the server-assigned ids/period names land. */
export async function addSchedulePeriods(created: SchedulePeriod[]) {
  try {
    await ensureDojangsLoaded();
    for (const p of created) {
      const dojangId = resolveDojangId(p.dojang);
      if (dojangId == null) {
        console.error(`Unknown dojang "${p.dojang}" — skipping period insert`);
        continue;
      }
      await saveSchPeriod({
        SchPeriodId: 0,
        DojangId: dojangId,
        PeriodStart: p.periodStart,
        PeriodEnd: p.periodEnd,
        PeriodTitle: p.periodName,
        FgMode: "I",
      });
    }
    await reloadSchedulePeriods();
  } catch (err) {
    console.error("Failed to add schedule period(s)", err);
  }
}

/** Edit a period. The backend edit path persists PeriodStart + PeriodEnd (the
 *  auto-generated "Period N" name is immutable); DojangId + dates are resent for
 *  the overlap/edit validations. Throws the server's error (e.g. "end is before
 *  an existing schedule") so the caller can surface it. */
export async function updateSchedulePeriod(
  id: number,
  patch: Partial<SchedulePeriod>,
) {
  const existing = _periods.find((p) => p.id === id);
  if (!existing) return;
  const dojangId = resolveDojangId(existing.dojang);
  if (dojangId == null) {
    throw new Error(`Unknown dojang "${existing.dojang}"`);
  }
  await saveSchPeriod({
    SchPeriodId: id,
    DojangId: dojangId,
    PeriodStart: patch.periodStart ?? existing.periodStart,
    PeriodEnd: patch.periodEnd ?? existing.periodEnd,
    PeriodTitle: existing.periodName,
    FgMode: "E",
  });
  await reloadSchedulePeriods();
}

/** Hard delete (the backend has no status). Throws the server's "already used"
 *  error when a schedule references the period, so the caller can surface it. */
export async function deleteSchedulePeriod(id: number) {
  await deleteSchPeriod(id);
  await reloadSchedulePeriods();
}
