// src/app/app/(authenticated)/admin/_shared/admins.ts
//
// Reference dropdowns previously duplicated here were removed (audit issue #2):
// belts/dojang derive from the master stores, the rest from @/lib/reference.
import type { BloodType } from "@/lib/reference";
import { fetchUserData, mapUserRow, inactUserData } from "@/lib/api/users";
import { createUser, editUser } from "../../_shared/user-write";
// Re-exported so Admin.golDarah consumers can keep importing it from here.
export type { BloodType };

export type AdminStatus = "Active" | "Inactive";

export type Admin = {
  username: string;          // No.Reg (UserNoId) — login name / display key
  userId?: number;           // User-table PK (populated on hydration; for the status-toggle write)
  userDataId?: number;       // UserData PK (populated on hydration; for operational joins)
  namaLengkap: string;
  panggilan: string;
  email?: string;            // populated on hydration / collected on the form
  gender?: string;
  photo?: string;            // UserPhoto path (display on edit); "" when none
  noHandphone1?: string;
  dojang: string;
  sabuk: string;             // "-" if unranked
  tanggalLahir: string;      // YYYY-MM-DD
  noHandphone2: string;
  warganegara: string;
  nikKtpPaspor: string;
  alamatLengkap: string;
  kodePos: string;
  tinggiBadan: number;       // cm
  beratBadan: number;        // kg
  ukuranSepatu: number;      // EU size
  namaAyah: string;
  namaIbu: string;
  golDarah: BloodType;
  alergi: string;            // "-" if none
  mulaiLatihan: string;      // YYYY-MM-DD
  status: AdminStatus;
  updatedBy: string;
  updateDate: string;        // ISO
};


// ---- mutable store ----
// Starts empty; hydrated from the backend on first subscribe
// (ensureAdminsLoaded). No mock seed, so the list shows a loading/empty state
// rather than fabricated admins when the backend is slow or unreachable.
let _admins: Admin[] = [];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function getAdmins(): Admin[] {
  return _admins;
}

export function subscribeAdmins(listener: () => void) {
  listeners.add(listener);
  ensureAdminsLoaded();
  return () => {
    listeners.delete(listener);
  };
}

// ---- hydration (read API) ----
// get-user-data, UserTypeCode "A" (admin), full list (active + inactive). Only a
// super-admin (X) may request this type — the backend enforces it.
let _loaded = false;
let _loadPromise: Promise<void> | null = null;

async function loadAdmins(): Promise<void> {
  const rows = (await fetchUserData("A")) ?? [];
  _admins = rows.map((r) => ({
    ...mapUserRow(r),
    status: r.FgStatus === "Y" ? "Active" : "Inactive",
  }));
  _loaded = true; // set before notify so subscribers see the loaded state
  notify();
}

/** Whether the admin list has hydrated at least once (lets the edit screen tell
 *  "still loading" apart from "genuinely not found"). */
export function hasLoadedAdmins(): boolean {
  return _loaded;
}

/** One-time hydration of the admin list from the backend. */
export function ensureAdminsLoaded(): Promise<void> {
  if (_loaded) return Promise.resolve();
  if (!_loadPromise) {
    _loadPromise = loadAdmins()
      .then(() => {
        _loaded = true;
      })
      .catch((err) => {
        console.error("Failed to load admins", err);
        _loadPromise = null;
      });
  }
  return _loadPromise;
}

/** Re-fetch the admin list (used after a write). */
export async function reloadAdmins(): Promise<void> {
  _loaded = false;
  _loadPromise = null;
  await ensureAdminsLoaded();
}

export function getAdminByUsername(username: string): Admin | null {
  return _admins.find((a) => a.username === username) ?? null;
}

/** Create an admin (save-user-data, UserTypeCode "A"), then reload. */
export async function addAdmin(
  admin: Admin,
  password: string,
  photo: File | null,
) {
  await createUser(admin, "A", password, photo);
  await reloadAdmins();
}

/** Edit an admin's profile (save-user-data edit), then reload. */
export async function updateAdmin(
  username: string,
  admin: Admin,
  photo: File | null,
) {
  await editUser({ ...admin, username }, "A", photo);
  await reloadAdmins();
}

/** Enable/disable via inact-user-data (User.FgStatus), then reload. Throws so
 *  the consumer can surface the error. */
export async function toggleAdminStatus(username: string) {
  const a = getAdminByUsername(username);
  if (!a?.userId) throw new Error("User id not loaded for " + username);
  await inactUserData(a.userId, a.status === "Active" ? "N" : "Y");
  await reloadAdmins();
}