// src/app/app/(authenticated)/master/_shared/belts.ts
//
// Master belt list. Currently view-only in the UI, so only get/subscribe are
// exposed; add mutators in step 3 if belt CRUD is introduced.
//
// This is the canonical belt master: belt names, ranks (beltLevel) and the
// passing-threshold business logic all live here now (audit issue #2). The old
// SABUK_OPTIONS/SABUK_RANK in students.ts and the thresholds in scores.ts were
// removed in favour of these derived helpers.
import { useSyncExternalStore } from "react";
import { fetchBeltMaster } from "@/lib/api/master";
import { dmyhmsToIso } from "@/lib/api/dates";

export type BeltStatus = "Active" | "Inactive";

export type Belt = {
  id: number;
  beltName: string;
  beltLevel: number;
  /** Server-authoritative passing threshold (BeltMaster.BeltPassScore). Used by
   *  the score view/list to derive Lulus/Tidak Lulus from the raw total. Absent
   *  in the seed mock; populated on hydration. */
  beltPassScore?: number | null;
  status: BeltStatus;
  updatedBy: string;
  updateDate: string;
};

export const INITIAL_BELTS: Belt[] = [
  { id: 1, beltName: "Putih", beltLevel: 0, status: "Active", updatedBy: "Carolina", updateDate: "2025-12-28T19:41:32" },
  { id: 2, beltName: "Kuning", beltLevel: 1, status: "Active", updatedBy: "Carolina", updateDate: "2025-12-28T19:42:00" },
  { id: 3, beltName: "Kuning Strip", beltLevel: 2, status: "Active", updatedBy: "Carolina", updateDate: "2025-12-28T19:43:00" },
  { id: 4, beltName: "Hijau", beltLevel: 3, status: "Active", updatedBy: "Andre", updateDate: "2025-12-20T10:00:00" },
  { id: 5, beltName: "Hijau Strip", beltLevel: 4, status: "Active", updatedBy: "Andre", updateDate: "2025-12-20T10:05:00" },
  { id: 6, beltName: "Biru", beltLevel: 5, status: "Active", updatedBy: "Carolina", updateDate: "2025-11-15T14:30:00" },
  { id: 7, beltName: "Biru Strip", beltLevel: 6, status: "Active", updatedBy: "Carolina", updateDate: "2025-11-15T14:32:00" },
  { id: 8, beltName: "Merah", beltLevel: 7, status: "Active", updatedBy: "Carolina", updateDate: "2025-10-10T09:15:00" },
  { id: 9, beltName: "Merah Strip", beltLevel: 8, status: "Active", updatedBy: "Andre", updateDate: "2025-10-10T09:18:00" },
  { id: 10, beltName: "Hitam Dan 1", beltLevel: 9, status: "Active", updatedBy: "Carolina", updateDate: "2025-09-05T11:00:00" },
  { id: 11, beltName: "Hitam Dan 2", beltLevel: 10, status: "Inactive", updatedBy: "Carolina", updateDate: "2025-09-05T11:02:00" },
];

// ---- mutable store ----
let _belts: Belt[] = [...INITIAL_BELTS];
const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((l) => l());
}

export function getBelts(): Belt[] {
  return _belts;
}
export function subscribeBelts(listener: () => void) {
  listeners.add(listener);
  ensureBeltsLoaded();
  return () => {
    listeners.delete(listener);
  };
}
export function setBelts(next: Belt[]) {
  _belts = next;
  notify();
}

// ---- hydration (read API) ----
// Reads the full belt master (active + inactive). BeltPassScore is available on
// the row (server-authoritative threshold, audit #6) but not yet stored — the
// threshold helpers below still derive from beltLevel until #6 is settled.
let _loaded = false;
let _loadPromise: Promise<void> | null = null;

async function loadBelts(): Promise<void> {
  const rows = (await fetchBeltMaster()) ?? [];
  _belts = rows.map((r) => ({
    id: r.BeltMasterId,
    beltName: r.BeltName,
    beltLevel: r.BeltLevel,
    beltPassScore: r.BeltPassScore,
    status: r.FgStatus === "Y" ? "Active" : "Inactive",
    updatedBy: r.UpdatedBy ?? "",
    updateDate: dmyhmsToIso(r.UpdateDate),
  }));
  notify();
}

/** One-time hydration of the belt master from the backend. */
export function ensureBeltsLoaded(): Promise<void> {
  if (_loaded) return Promise.resolve();
  if (!_loadPromise) {
    _loadPromise = loadBelts()
      .then(() => {
        _loaded = true;
      })
      .catch((err) => {
        console.error("Failed to load belts", err);
        _loadPromise = null;
      });
  }
  return _loadPromise;
}

/** Re-fetch the belt master (used after a write). */
export async function reloadBelts(): Promise<void> {
  _loaded = false;
  _loadPromise = null;
  await ensureBeltsLoaded();
}

// ---- belt business logic (moved from students.ts SABUK_RANK + scores.ts) ----

/** Belt rank used to gate score categories + thresholds (the belt's beltLevel). */
export function getSabukRank(beltName: string): number {
  const belt = _belts.find((b) => b.beltName === beltName);
  return belt ? belt.beltLevel : 0;
}

/** Resolve a belt name to its backend BeltMasterId (null when unknown). */
export function getBeltIdByName(beltName: string): number | null {
  return _belts.find((b) => b.beltName === beltName)?.id ?? null;
}

/** Server-authoritative passing threshold for a belt (by BeltMasterId).
 *  null when unknown or not loaded — callers should ensureBeltsLoaded() first. */
export function getBeltPassScore(
  beltMasterId: number | null | undefined,
): number | null {
  if (!beltMasterId) return null;
  return _belts.find((b) => b.id === beltMasterId)?.beltPassScore ?? null;
}

// Belt-based passing thresholds:
//   rank 0–6 (Putih → ...):  75
//   rank 7+  (Merah → ...):  85
export const PASS_THRESHOLD_LOW_BELT = 75;
export const PASS_THRESHOLD_HIGH_BELT = 85;
export const HIGH_BELT_MIN_RANK = 7;

export function getPassingThreshold(beltName: string): number {
  return getSabukRank(beltName) >= HIGH_BELT_MIN_RANK
    ? PASS_THRESHOLD_HIGH_BELT
    : PASS_THRESHOLD_LOW_BELT;
}

// ---- derived dropdown options (cached so useSyncExternalStore snapshots stay stable) ----
let _beltsForNames: Belt[] | null = null;
let _beltNames: string[] = [];
/** Active belt names ordered by level (no "-"). */
export function getBeltNames(): string[] {
  if (_belts !== _beltsForNames) {
    _beltsForNames = _belts;
    _beltNames = _belts
      .filter((b) => b.status === "Active")
      .slice()
      .sort((a, b) => a.beltLevel - b.beltLevel)
      .map((b) => b.beltName);
  }
  return _beltNames;
}

let _beltsForSabuk: Belt[] | null = null;
let _sabukOptions: string[] = [];
/** Belt select options: "-" (unranked) followed by active belt names by level. */
export function getSabukOptions(): string[] {
  if (_belts !== _beltsForSabuk) {
    _beltsForSabuk = _belts;
    _sabukOptions = ["-", ...getBeltNames()];
  }
  return _sabukOptions;
}

// ---- hooks ----
export function useBelts(): Belt[] {
  return useSyncExternalStore(subscribeBelts, getBelts, getBelts);
}
export function useSabukOptions(): string[] {
  return useSyncExternalStore(subscribeBelts, getSabukOptions, getSabukOptions);
}
