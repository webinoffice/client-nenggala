// src/app/app/(authenticated)/master/_shared/dojangs.ts
//
// Canonical dojang master. The old hardcoded DOJANG_OPTIONS arrays in admins.ts
// and students.ts were removed in favour of getDojangOptions()/useDojangOptions()
// derived from this store (audit issue #2).
import { useSyncExternalStore } from "react";
import { fetchDojangs, saveDojang, inactDojang } from "@/lib/api/master";
import { fileUrl } from "@/lib/api/file-url";
import { dmyhmsToIso } from "@/lib/api/dates";

export type DojangStatus = "Active" | "Inactive";

export type Dojang = {
  id: number;
  dojangName: string;
  image?: string;
  status: DojangStatus;
  updatedBy: string;
  updateDate: string;
};

export const INITIAL_DOJANGS: Dojang[] = [
  {
    id: 1,
    dojangName: "Kedoya Sport Club",
    image: "/images/location-kedoya.jpg",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-12-28T19:41:32",
  },
  {
    id: 2,
    dojangName: "Bintaro Dojang",
    image: "/images/location-meruya.jpg",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-12-20T10:00:00",
  },
  {
    id: 3,
    dojangName: "Pondok Indah Center",
    image: "/images/location-tajur.jpg",
    status: "Active",
    updatedBy: "Andre",
    updateDate: "2025-12-15T14:22:00",
  },
  {
    id: 4,
    dojangName: "Kelapa Gading Hall",
    status: "Active",
    updatedBy: "Andre",
    updateDate: "2025-11-30T11:30:00",
  },
  {
    id: 5,
    dojangName: "BSD Training Hall",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-11-15T09:00:00",
  },
  {
    id: 6,
    dojangName: "Cibubur Training Center",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-10-20T13:45:00",
  },
  {
    id: 7,
    dojangName: "Tangerang Branch",
    status: "Active",
    updatedBy: "Andre",
    updateDate: "2025-10-05T16:00:00",
  },
  {
    id: 8,
    dojangName: "Bekasi Sport Hall",
    status: "Inactive",
    updatedBy: "Carolina",
    updateDate: "2025-09-10T08:30:00",
  },
];

// ---- mutable store ----
let _dojangs: Dojang[] = [...INITIAL_DOJANGS];
const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((l) => l());
}

export function getDojangs(): Dojang[] {
  return _dojangs;
}
export function subscribeDojangs(listener: () => void) {
  listeners.add(listener);
  ensureDojangsLoaded();
  return () => {
    listeners.delete(listener);
  };
}

// ---- hydration (read API) ----
let _loaded = false;
let _loadPromise: Promise<void> | null = null;

async function loadDojangs(): Promise<void> {
  const rows = (await fetchDojangs()) ?? [];
  _dojangs = rows.map((r) => ({
    id: r.DojangId,
    dojangName: r.DojangName,
    image: r.DojangImage ? fileUrl(r.DojangImage) : undefined,
    status: r.FgStatus === "Y" ? "Active" : "Inactive",
    updatedBy: r.UpdatedBy ?? "",
    updateDate: dmyhmsToIso(r.UpdateDate),
  }));
  notify();
}

/** One-time hydration of the dojang master from the backend. */
export function ensureDojangsLoaded(): Promise<void> {
  if (_loaded) return Promise.resolve();
  if (!_loadPromise) {
    _loadPromise = loadDojangs()
      .then(() => {
        _loaded = true;
      })
      .catch((err) => {
        console.error("Failed to load dojangs", err);
        _loadPromise = null;
      });
  }
  return _loadPromise;
}

/** Re-fetch the dojang master (used after a write). */
export async function reloadDojangs(): Promise<void> {
  _loaded = false;
  _loadPromise = null;
  await ensureDojangsLoaded();
}

export function getDojangById(id: number): Dojang | null {
  return _dojangs.find((d) => d.id === id) ?? null;
}
// ---- writes (save-dojang multipart + inact-dojang toggle) ----

export async function addDojang(dojangName: string, file: File | null) {
  try {
    await saveDojang({ DojangId: 0, DojangName: dojangName, FgMode: "I" }, file);
    await reloadDojangs();
  } catch (err) {
    console.error("Failed to add dojang", err);
  }
}

export async function updateDojang(
  id: number,
  dojangName: string,
  file: File | null,
) {
  try {
    await saveDojang({ DojangId: id, DojangName: dojangName, FgMode: "E" }, file);
    await reloadDojangs();
  } catch (err) {
    console.error("Failed to update dojang", err);
  }
}

export async function toggleDojangStatus(id: number, current: DojangStatus) {
  try {
    await inactDojang(id, current === "Active" ? "N" : "Y");
    await reloadDojangs();
  } catch (err) {
    console.error("Failed to change dojang status", err);
  }
}

// ---- derived dropdown options (cached for stable useSyncExternalStore snapshots) ----
let _dojangsForOptions: Dojang[] | null = null;
let _dojangOptions: string[] = [];
/** Active dojang names (sorted), for selects/filters. */
export function getDojangOptions(): string[] {
  if (_dojangs !== _dojangsForOptions) {
    _dojangsForOptions = _dojangs;
    _dojangOptions = _dojangs
      .filter((d) => d.status === "Active")
      .map((d) => d.dojangName)
      .sort((a, b) => a.localeCompare(b));
  }
  return _dojangOptions;
}

// ---- hooks ----
export function useDojangs(): Dojang[] {
  return useSyncExternalStore(subscribeDojangs, getDojangs, getDojangs);
}
export function useDojangOptions(): string[] {
  return useSyncExternalStore(subscribeDojangs, getDojangOptions, getDojangOptions);
}
