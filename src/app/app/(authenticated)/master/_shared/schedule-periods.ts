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

// ---- writes ----
// save-schperiod / delete-schperiod (plain JSON). The backend has no status
// column and no inact endpoint, so "disable" is a hard delete (guarded against
// in-use periods server-side). On insert the backend auto-assigns PeriodCount
// (the "Period N" name) per dojang, so the form's periodName is informational.

/** "2026-01" → "2026-01-01" (first of month). */
function startOfMonth(ym: string): string {
  return ym ? `${ym}-01` : "";
}
/** "2026-06" → "2026-06-30" (last of month) — keeps CURDATE-in-period checks right. */
function endOfMonth(ym: string): string {
  if (!ym) return "";
  const [y, m] = ym.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  return `${ym}-${String(last).padStart(2, "0")}`;
}

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
        PeriodStart: startOfMonth(p.periodStart),
        PeriodEnd: endOfMonth(p.periodEnd),
        PeriodTitle: p.periodName,
        FgMode: "I",
      });
    }
    await reloadSchedulePeriods();
  } catch (err) {
    console.error("Failed to add schedule period(s)", err);
  }
}

/** Edit a period. The backend edit path only persists PeriodEnd (the start and
 *  the auto-generated name are immutable); DojangId + the existing start are
 *  resent for the overlap/edit validations. */
export async function updateSchedulePeriod(
  id: number,
  patch: Partial<SchedulePeriod>,
) {
  try {
    const existing = _periods.find((p) => p.id === id);
    if (!existing) return;
    const dojangId = resolveDojangId(existing.dojang);
    if (dojangId == null) {
      console.error(`Unknown dojang "${existing.dojang}" — skipping period edit`);
      return;
    }
    await saveSchPeriod({
      SchPeriodId: id,
      DojangId: dojangId,
      PeriodStart: startOfMonth(existing.periodStart),
      PeriodEnd: endOfMonth(patch.periodEnd ?? existing.periodEnd),
      PeriodTitle: patch.periodName ?? existing.periodName,
      FgMode: "E",
    });
    await reloadSchedulePeriods();
  } catch (err) {
    console.error("Failed to update schedule period", err);
  }
}

/** Hard delete (the backend has no status). Throws the server's "already used"
 *  error when a schedule references the period, so the caller can surface it. */
export async function deleteSchedulePeriod(id: number) {
  await deleteSchPeriod(id);
  await reloadSchedulePeriods();
}
