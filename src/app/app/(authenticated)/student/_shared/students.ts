// src/app/app/(authenticated)/student/_shared/students.ts
//
// Reference dropdowns that used to live here (DOJANG_OPTIONS / SABUK_OPTIONS /
// SABUK_RANK / WARGA_NEGARA_OPTIONS / GOL_DARAH_OPTIONS) were removed (audit
// issue #2): belts/dojang derive from the master stores, the rest from
// @/lib/reference.
import type { BloodType } from "@/lib/reference";
import {
  fetchUserData,
  mapUserRow,
  inactUserData,
  updateInstAssistant,
} from "@/lib/api/users";
import { createUser, editUser } from "../../_shared/user-write";
// Re-exported so Student.golDarah consumers can keep importing it from here.
export type { BloodType };

export type StudentStatus = "Active" | "Inactive";

export type Student = {
  username: string;          // No.Reg (UserNoId) — login name / display key
  userId?: number;           // User-table PK (populated on hydration; for the status-toggle write)
  userDataId?: number;       // UserData PK — the StudentId used by schedule/attendance/score joins
  namaLengkap: string;
  panggilan: string;
  email?: string;            // populated on hydration / collected on the form
  gender?: string;
  photo?: string;            // UserPhoto path (display on edit); "" when none
  noHandphone1?: string;
  dojang: string;
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
  fgAssist?: boolean;        // flagged as an assistant instructor (UserData.FgAssist)
  status: StudentStatus;
  updatedBy: string;
  updateDate: string;
};

// store — starts empty; hydrated from the backend on first subscribe
// (ensureStudentsLoaded). No mock seed, so the list shows a loading/empty state
// rather than fabricated students when the backend is slow or unreachable.
let _students: Student[] = [];
const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((l) => l());
}

export function getStudents(): Student[] {
  return _students;
}
export function subscribeStudents(listener: () => void) {
  listeners.add(listener);
  ensureStudentsLoaded();
  return () => {
    listeners.delete(listener);
  };
}

// ---- hydration (read API) ----
// get-user-data, UserTypeCode "S", full list (active + inactive). `username` is
// the No.Reg (UserNoId); operational joins on the numeric UserDataId are wired
// later (the list does not yet return it).
let _loaded = false;
let _loadPromise: Promise<void> | null = null;

async function loadStudents(): Promise<void> {
  const rows = (await fetchUserData("S")) ?? [];
  _students = rows.map((r) => ({
    ...mapUserRow(r),
    status: r.FgStatus === "Y" ? "Active" : "Inactive",
  }));
  _loaded = true; // set before notify so subscribers see the loaded state
  notify();
}

/** Whether the student list has hydrated at least once (lets edit screens tell
 *  "still loading" apart from "genuinely not found"). */
export function hasLoadedStudents(): boolean {
  return _loaded;
}

/** One-time hydration of the student list from the backend. */
export function ensureStudentsLoaded(): Promise<void> {
  if (_loaded) return Promise.resolve();
  if (!_loadPromise) {
    _loadPromise = loadStudents()
      .then(() => {
        _loaded = true;
      })
      .catch((err) => {
        console.error("Failed to load students", err);
        _loadPromise = null;
      });
  }
  return _loadPromise;
}

/** Re-fetch the student list (used after a write). */
export async function reloadStudents(): Promise<void> {
  _loaded = false;
  _loadPromise = null;
  await ensureStudentsLoaded();
}
export function getStudentByUsername(username: string): Student | null {
  return _students.find((s) => s.username === username) ?? null;
}
/** Create a student (save-user-data, UserTypeCode "S"), then reload. */
export async function addStudent(
  s: Student,
  password: string,
  photo: File | null,
) {
  await createUser(s, "S", password, photo);
  await reloadStudents();
}
/** Edit a student's profile (save-user-data edit), then reload. */
export async function updateStudent(
  username: string,
  s: Student,
  photo: File | null,
) {
  await editUser({ ...s, username }, "S", photo);
  await reloadStudents();
}
/** Enable/disable via inact-user-data (User.FgStatus), then reload. Throws so
 *  the consumer can surface the error. */
export async function toggleStudentStatus(username: string) {
  const s = getStudentByUsername(username);
  if (!s?.userId) throw new Error("User id not loaded for " + username);
  await inactUserData(s.userId, s.status === "Active" ? "N" : "Y");
  await reloadStudents();
}

/** Flag/unflag a student as an assistant instructor (update-inst-assistant →
 *  UserData.FgAssist), then reload. Keyed on the numeric UserDataId. Throws so
 *  the consumer can surface the error. */
export async function toggleStudentAssistant(username: string) {
  const s = getStudentByUsername(username);
  if (!s?.userDataId) throw new Error("User id not loaded for " + username);
  await updateInstAssistant(s.userDataId, s.fgAssist ? "N" : "Y");
  await reloadStudents();
}