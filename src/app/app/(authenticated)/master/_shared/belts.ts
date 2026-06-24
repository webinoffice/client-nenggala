// src/app/app/(authenticated)/master/_shared/belts.ts
//
// Master belt list. Currently view-only in the UI, so only get/subscribe are
// exposed; add mutators in step 3 if belt CRUD is introduced.
//
// NOTE (step 3): belt names here differ from SABUK_OPTIONS/SABUK_RANK in
// student/_shared/students.ts — unify against the API (audit issue #2).

export type BeltStatus = "Active" | "Inactive";

export type Belt = {
  id: number;
  beltName: string;
  beltLevel: number;
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
  return () => {
    listeners.delete(listener);
  };
}
export function setBelts(next: Belt[]) {
  _belts = next;
  notify();
}
