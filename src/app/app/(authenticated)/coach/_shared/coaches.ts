// src/app/app/(authenticated)/coach/_shared/coaches.ts

import type { BloodType } from "@/lib/reference";
import { fetchUserData, mapUserRow, inactUserData } from "@/lib/api/users";
import { createUser, editUser } from "../../_shared/user-write";
// Re-exported so Coach.golDarah consumers can keep importing it from here.
export type { BloodType };

export type CoachStatus = "Active" | "Inactive";

export type Coach = {
  username: string; // No.Reg (UserNoId) — login name / display key
  userId?: number;  // User-table PK (populated on hydration; for the status-toggle write)
  userDataId?: number; // UserData PK — the CoachId used by schedule/attendance joins
  namaLengkap: string;
  panggilan: string;
  email?: string;            // populated on hydration / collected on the form
  gender?: string;
  photo?: string;            // UserPhoto path (display on edit); "" when none
  noHandphone1?: string;
  // Coaches are not dojang-scoped — no dojang is stored for them (sent null to
  // the backend). Deliberately omitted from the coach model.
  sabuk: string;
  tanggalLahir: string;
  noHandphone2: string;
  warganegara: string;
  nikKtpPaspor: string;
  alamatLengkap: string;
  kodePos: string;
  tinggiBadan: number;
  beratBadan: number;
  ukuranSepatu: number;
  namaAyah: string;
  namaIbu: string;
  golDarah: BloodType;
  alergi: string;
  mulaiLatihan: string;
  status: CoachStatus;
  updatedBy: string;
  updateDate: string;
};


// Starts empty; hydrated from the backend on first subscribe
// (ensureCoachesLoaded). No mock seed, so the list shows a loading/empty state
// rather than fabricated coaches when the backend is slow or unreachable.
let _coaches: Coach[] = [];
const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((l) => l());
}

export function getCoaches() {
  return _coaches;
}
export function subscribeCoaches(l: () => void) {
  listeners.add(l);
  ensureCoachesLoaded();
  return () => {
    listeners.delete(l);
  };
}

// ---- hydration (read API) ----
// get-user-data, UserTypeCode "I" (instructor), full list (active + inactive).
let _loaded = false;
let _loadPromise: Promise<void> | null = null;

async function loadCoaches(): Promise<void> {
  const rows = (await fetchUserData("I")) ?? [];
  _coaches = rows.map((r) => ({
    ...mapUserRow(r),
    status: r.FgStatus === "Y" ? "Active" : "Inactive",
  }));
  _loaded = true; // set before notify so subscribers see the loaded state
  notify();
}

/** Whether the coach list has hydrated at least once (lets the edit screen tell
 *  "still loading" apart from "genuinely not found"). */
export function hasLoadedCoaches(): boolean {
  return _loaded;
}

/** One-time hydration of the coach list from the backend. */
export function ensureCoachesLoaded(): Promise<void> {
  if (_loaded) return Promise.resolve();
  if (!_loadPromise) {
    _loadPromise = loadCoaches()
      .then(() => {
        _loaded = true;
      })
      .catch((err) => {
        console.error("Failed to load coaches", err);
        _loadPromise = null;
      });
  }
  return _loadPromise;
}

/** Re-fetch the coach list (used after a write). */
export async function reloadCoaches(): Promise<void> {
  _loaded = false;
  _loadPromise = null;
  await ensureCoachesLoaded();
}
export function getCoachByUsername(username: string) {
  return _coaches.find((c) => c.username === username) ?? null;
}
/** Create a coach (save-user-data, UserTypeCode "I"), then reload. */
export async function addCoach(
  c: Coach,
  password: string,
  photo: File | null,
) {
  await createUser(c, "I", password, photo);
  await reloadCoaches();
}
/** Edit a coach's profile (save-user-data edit), then reload. */
export async function updateCoach(
  username: string,
  c: Coach,
  photo: File | null,
) {
  await editUser({ ...c, username }, "I", photo);
  await reloadCoaches();
}
/** Enable/disable via inact-user-data (User.FgStatus), then reload. Throws so
 *  the consumer can surface the error. */
export async function toggleCoachStatus(username: string) {
  const c = getCoachByUsername(username);
  if (!c?.userId) throw new Error("User id not loaded for " + username);
  await inactUserData(c.userId, c.status === "Active" ? "N" : "Y");
  await reloadCoaches();
}
