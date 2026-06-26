// src/app/app/(authenticated)/student/_shared/attendance.ts
//
// Student attendance — fetch-backed (Step 3c #3). A per-period cache over
// get-student-atd (api/attendance.fetchStudentAtd): for a SchPeriodId it returns
// one row per student×program with TotalSch (scheduled) + TotalAtd (attended).
// We aggregate per student (UserNoId) so getAttendance() stays the simple
// (username, period) → count helper the reports already call during render.
//
// Loading is parametrized by period (ensureStudentAtdLoaded), mirroring the
// ensure*Loaded master pattern but keyed per SchPeriodId. Consumers subscribe via
// subscribeAttendance + getAttendanceVersion and trigger the load on period
// change; getAttendance reads the cache (0 until hydrated).
import { fetchStudentAtd } from "@/lib/api/attendance";

// Minimum attendance required to submit a score without admin override (fixed).
export const MIN_ATTENDANCE = 16;

type AtdEntry = { totalAtd: number; totalSch: number };

const _cache = new Map<number, Map<string, AtdEntry>>(); // SchPeriodId → UserNoId → counts
const _loaded = new Set<number>();
const _loading = new Map<number, Promise<void>>();

let _version = 0;
const listeners = new Set<() => void>();
function notify() {
  _version += 1;
  listeners.forEach((l) => l());
}

export function subscribeAttendance(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
/** Stable snapshot for useSyncExternalStore; changes only when a period loads. */
export function getAttendanceVersion(): number {
  return _version;
}

/** Hydrate the per-student attendance for one period (idempotent, deduped). */
export function ensureStudentAtdLoaded(periodId: number): Promise<void> {
  if (!periodId || _loaded.has(periodId)) return Promise.resolve();
  let p = _loading.get(periodId);
  if (!p) {
    p = fetchStudentAtd({ schPeriodId: periodId })
      .then((rows) => {
        const map = new Map<string, AtdEntry>();
        (rows ?? []).forEach((r) => {
          if (!r.UserNoId) return;
          const cur = map.get(r.UserNoId) ?? { totalAtd: 0, totalSch: 0 };
          cur.totalAtd += r.TotalAtd ?? 0;
          cur.totalSch += r.TotalSch ?? 0;
          map.set(r.UserNoId, cur);
        });
        _cache.set(periodId, map);
        _loaded.add(periodId);
        notify();
      })
      .catch((err) => {
        console.error("Failed to load student attendance", err);
      })
      .finally(() => {
        _loading.delete(periodId);
      });
    _loading.set(periodId, p);
  }
  return p;
}

/** Re-fetch a period's attendance (used after a write, e.g. submit-attendance). */
export function reloadStudentAtd(periodId: number): Promise<void> {
  _loaded.delete(periodId);
  _loading.delete(periodId);
  return ensureStudentAtdLoaded(periodId);
}

/** Total sessions a student attended in a period (0 until the period loads). */
export function getAttendance(
  username: string,
  periodId: string | number,
): number {
  return _cache.get(Number(periodId))?.get(username)?.totalAtd ?? 0;
}

/** Total scheduled sessions for a student in a period (0 until loaded). */
export function getScheduledSessions(
  username: string,
  periodId: string | number,
): number {
  return _cache.get(Number(periodId))?.get(username)?.totalSch ?? 0;
}
