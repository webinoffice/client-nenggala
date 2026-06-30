// src/app/app/(authenticated)/joint-training/_shared/joint-training.ts
//
// Store for Latihan Gabungan (joint training). Hydrates two things from the
// backend: the full event list (for the super-admin management page) and the
// single featured event (the dashboard highlight — the backend resolves the
// fallback when none is flagged). Writes live on the management page; it calls
// the api wrappers directly and then reloadJointTrainings() to refresh.
import {
  fetchScheduleMergeHds,
  fetchScheduleMergeFeatured,
  type ScheduleMergeHdRow,
} from "@/lib/api/schedule-merge";

let _events: ScheduleMergeHdRow[] = [];
let _featured: ScheduleMergeHdRow | null = null;
const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((l) => l());
}

export function getJointTrainings(): ScheduleMergeHdRow[] {
  return _events;
}
export function getFeaturedJointTraining(): ScheduleMergeHdRow | null {
  return _featured;
}
export function subscribeJointTrainings(listener: () => void) {
  listeners.add(listener);
  ensureJointTrainingsLoaded();
  return () => {
    listeners.delete(listener);
  };
}

// ---- hydration ----
let _loaded = false;
let _loadPromise: Promise<void> | null = null;

async function loadJointTrainings(): Promise<void> {
  const [events, featured] = await Promise.all([
    fetchScheduleMergeHds(),
    fetchScheduleMergeFeatured(),
  ]);
  // Newest first (the list shows recent events at the top; dashboards take #1).
  _events = (events ?? [])
    .slice()
    .sort((a, b) =>
      (b.ScheduleDateIso ?? "").localeCompare(a.ScheduleDateIso ?? ""),
    );
  // The display endpoint returns {} when there are no events at all.
  _featured = featured && featured.ScheduleMergeHdId ? featured : null;
  notify();
}

/** One-time hydration of the joint-training list + featured highlight. */
export function ensureJointTrainingsLoaded(): Promise<void> {
  if (_loaded) return Promise.resolve();
  if (!_loadPromise) {
    _loadPromise = loadJointTrainings()
      .then(() => {
        _loaded = true;
      })
      .catch((err) => {
        console.error("Failed to load joint trainings", err);
        _loadPromise = null;
      });
  }
  return _loadPromise;
}

/** Re-fetch after a write (save/delete/attendance change). */
export async function reloadJointTrainings(): Promise<void> {
  _loaded = false;
  _loadPromise = null;
  await ensureJointTrainingsLoaded();
}
