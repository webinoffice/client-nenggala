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
  status: CoachStatus;
  updatedBy: string;
  updateDate: string;
};

const INITIAL_COACHES: Coach[] = [
  {
    username: "C0001",
    namaLengkap: "Marvin Hadi",
    panggilan: "Marvin",
    dojang: "Kedoya Sport Club",
    sabuk: "Hitam DAN-2",
    tanggalLahir: "1990-05-14",
    noHandphone2: "0878-1111-1111",
    warganegara: "Indonesia",
    nikKtpPaspor: "3175051405900001",
    alamatLengkap: "Jl. Kemanggisan III No. 5, Jakarta Barat",
    kodePos: "11480",
    tinggiBadan: 175,
    beratBadan: 70,
    ukuranSepatu: 43,
    namaAyah: "Hadi Pranoto",
    namaIbu: "Susi Wahyuni",
    golDarah: "O",
    alergi: "-",
    mulaiLatihan: "2005-01-01",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-12-01T10:00:00Z",
  },
  {
    username: "C0002",
    namaLengkap: "Carolina Santoso",
    panggilan: "Carolina",
    dojang: "Kedoya Sport Club",
    sabuk: "Hitam DAN-2",
    tanggalLahir: "1988-09-22",
    noHandphone2: "0813-2222-2222",
    warganegara: "Indonesia",
    nikKtpPaspor: "3175092209880002",
    alamatLengkap: "Jl. Tomang Raya No. 18, Jakarta Barat",
    kodePos: "11440",
    tinggiBadan: 168,
    beratBadan: 58,
    ukuranSepatu: 39,
    namaAyah: "Santoso Wijaya",
    namaIbu: "Linda Pratiwi",
    golDarah: "A",
    alergi: "-",
    mulaiLatihan: "2003-08-15",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-11-22T14:30:00Z",
  },
  {
    username: "C0003",
    namaLengkap: "Reza Pratama",
    panggilan: "Reza",
    dojang: "Senayan Dojang",
    sabuk: "Hitam DAN-1",
    tanggalLahir: "1992-03-08",
    noHandphone2: "0856-3333-3333",
    warganegara: "Indonesia",
    nikKtpPaspor: "3174030892000003",
    alamatLengkap: "Jl. Senopati No. 22, Jakarta Selatan",
    kodePos: "12190",
    tinggiBadan: 172,
    beratBadan: 65,
    ukuranSepatu: 42,
    namaAyah: "Pratama Hidayat",
    namaIbu: "Ratna Anggraini",
    golDarah: "B",
    alergi: "-",
    mulaiLatihan: "2008-06-20",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-10-15T09:00:00Z",
  },
  {
    username: "C0004",
    namaLengkap: "Adisai Wijaya",
    panggilan: "Adisai",
    dojang: "Bintaro Dojang",
    sabuk: "Hitam DAN-1",
    tanggalLahir: "1991-11-30",
    noHandphone2: "0821-4444-4444",
    warganegara: "Indonesia",
    nikKtpPaspor: "3674113091000004",
    alamatLengkap: "Jl. Bintaro Permai V No. 8, Tangerang Selatan",
    kodePos: "15411",
    tinggiBadan: 170,
    beratBadan: 62,
    ukuranSepatu: 41,
    namaAyah: "Wijaya Hartono",
    namaIbu: "Sari Lestari",
    golDarah: "A",
    alergi: "Kacang",
    mulaiLatihan: "2009-09-10",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-09-28T11:15:00Z",
  },
  {
    username: "C0005",
    namaLengkap: "Kiky Anggraini",
    panggilan: "Kiky",
    dojang: "Kedoya Sport Club",
    sabuk: "Hitam DAN-1",
    tanggalLahir: "1993-07-05",
    noHandphone2: "0878-5555-5555",
    warganegara: "Indonesia",
    nikKtpPaspor: "3175070593000005",
    alamatLengkap: "Jl. Greenville Estate Blok A No. 12, Jakarta Barat",
    kodePos: "11510",
    tinggiBadan: 165,
    beratBadan: 55,
    ukuranSepatu: 38,
    namaAyah: "Anggraini Setiawan",
    namaIbu: "Maya Putri",
    golDarah: "O",
    alergi: "-",
    mulaiLatihan: "2010-04-01",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-08-12T16:20:00Z",
  },
  {
    username: "C0006",
    namaLengkap: "Jordan Sebastian",
    panggilan: "Jordan",
    dojang: "Pakualam Center",
    sabuk: "Hitam DAN-1",
    tanggalLahir: "1989-12-18",
    noHandphone2: "0813-6666-6666",
    warganegara: "Indonesia",
    nikKtpPaspor: "3672121889000006",
    alamatLengkap: "Perum Pakualam Asri Blok D No. 3, Tangerang",
    kodePos: "15510",
    tinggiBadan: 178,
    beratBadan: 75,
    ukuranSepatu: 43,
    namaAyah: "Sebastian Hidayat",
    namaIbu: "Wati Suryani",
    golDarah: "B",
    alergi: "-",
    mulaiLatihan: "2004-02-14",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-12-20T08:45:00Z",
  },
];

let _coaches: Coach[] = [...INITIAL_COACHES];
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
