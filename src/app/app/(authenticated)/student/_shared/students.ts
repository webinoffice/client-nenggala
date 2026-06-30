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

const INITIAL_STUDENTS: Student[] = [
  {
    username: "U0001",
    namaLengkap: "Putri Lestari",
    panggilan: "Putri",
    dojang: "Kedoya Sport Club",
    sabuk: "Putih",
    tanggalLahir: "2018-04-12",
    noHandphone2: "0878-1234-5678",
    warganegara: "Indonesia",
    nikKtpPaspor: "3175041204180001",
    alamatLengkap: "Jl. Anggrek No. 3, Kebon Jeruk, Jakarta Barat",
    kodePos: "11530",
    tinggiBadan: 130,
    beratBadan: 30,
    ukuranSepatu: 33,
    namaAyah: "Andri Lestari",
    namaIbu: "Maya Sari",
    golDarah: "O",
    alergi: "-",
    mulaiLatihan: "2024-02-01",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-10-12T09:15:30Z",
  },
  {
    username: "U0002",
    namaLengkap: "Aditya Saputra",
    panggilan: "Adit",
    dojang: "Kedoya Sport Club",
    sabuk: "Kuning",
    tanggalLahir: "2016-09-08",
    noHandphone2: "0813-2233-4455",
    warganegara: "Indonesia",
    nikKtpPaspor: "3175090816080002",
    alamatLengkap: "Jl. Mangga Besar VIII No. 5, Jakarta Pusat",
    kodePos: "10730",
    tinggiBadan: 140,
    beratBadan: 38,
    ukuranSepatu: 35,
    namaAyah: "Saputra Hadi",
    namaIbu: "Lina Permata",
    golDarah: "A",
    alergi: "Susu",
    mulaiLatihan: "2022-06-15",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-11-05T14:22:18Z",
  },
  {
    username: "U0003",
    namaLengkap: "Rian Pratama",
    panggilan: "Rian",
    dojang: "Kedoya Sport Club",
    sabuk: "Hijau",
    tanggalLahir: "2014-11-22",
    noHandphone2: "0821-7788-9900",
    warganegara: "Indonesia",
    nikKtpPaspor: "3175112214110003",
    alamatLengkap: "Jl. Daan Mogot No. 22, Jakarta Barat",
    kodePos: "11460",
    tinggiBadan: 152,
    beratBadan: 46,
    ukuranSepatu: 38,
    namaAyah: "Pratama Wijaya",
    namaIbu: "Ratna Dewi",
    golDarah: "B",
    alergi: "-",
    mulaiLatihan: "2019-09-10",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-09-20T11:30:00Z",
  },
  {
    username: "U0004",
    namaLengkap: "Sari Kusuma",
    panggilan: "Sari",
    dojang: "Kedoya Sport Club",
    sabuk: "Hijau Strip Biru",
    tanggalLahir: "2013-03-05",
    noHandphone2: "0856-1122-3344",
    warganegara: "Indonesia",
    nikKtpPaspor: "3175030513030004",
    alamatLengkap: "Jl. Tomang Raya No. 14, Jakarta Barat",
    kodePos: "11440",
    tinggiBadan: 158,
    beratBadan: 50,
    ukuranSepatu: 39,
    namaAyah: "Kusuma Atmojo",
    namaIbu: "Wati Anggraini",
    golDarah: "O",
    alergi: "Seafood",
    mulaiLatihan: "2018-04-08",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-12-01T08:45:22Z",
  },
  {
    username: "U0005",
    namaLengkap: "Bayu Setiawan",
    panggilan: "Bayu",
    dojang: "Kedoya Sport Club",
    sabuk: "Biru",
    tanggalLahir: "2012-07-19",
    noHandphone2: "0878-9988-7766",
    warganegara: "Indonesia",
    nikKtpPaspor: "3175071912070005",
    alamatLengkap: "Jl. Slipi No. 8, Jakarta Barat",
    kodePos: "11410",
    tinggiBadan: 165,
    beratBadan: 55,
    ukuranSepatu: 40,
    namaAyah: "Setiawan Budi",
    namaIbu: "Yuli Astuti",
    golDarah: "A",
    alergi: "-",
    mulaiLatihan: "2016-08-22",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-11-18T16:00:00Z",
  },
  {
    username: "U0006",
    namaLengkap: "Devaloka Gangga Avara",
    panggilan: "Devaloka",
    dojang: "Kedoya Sport Club",
    sabuk: "Merah Strip Hitam",
    tanggalLahir: "2010-05-10",
    noHandphone2: "0878-1111-2222",
    warganegara: "Indonesia",
    nikKtpPaspor: "3175051005100006",
    alamatLengkap: "Jl. Devaloka No. 6, Kebon Jeruk, Jakarta Barat",
    kodePos: "11530",
    tinggiBadan: 168,
    beratBadan: 56,
    ukuranSepatu: 40,
    namaAyah: "Gangga Saputra",
    namaIbu: "Avara Lestari",
    golDarah: "O",
    alergi: "-",
    mulaiLatihan: "2014-03-14",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-12-28T19:41:32Z",
  },
  {
    username: "U0007",
    namaLengkap: "Maya Sari Anggraini",
    panggilan: "Maya",
    dojang: "Kedoya Sport Club",
    sabuk: "Merah",
    tanggalLahir: "2011-01-30",
    noHandphone2: "0813-5566-7788",
    warganegara: "Indonesia",
    nikKtpPaspor: "3175013011010007",
    alamatLengkap: "Jl. Greenville No. 11, Jakarta Barat",
    kodePos: "11510",
    tinggiBadan: 162,
    beratBadan: 52,
    ukuranSepatu: 39,
    namaAyah: "Sari Hidayat",
    namaIbu: "Anggraini Putri",
    golDarah: "B",
    alergi: "Telur",
    mulaiLatihan: "2015-02-18",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-10-30T13:20:45Z",
  },
  {
    username: "U0008",
    namaLengkap: "Doni Hartanto",
    panggilan: "Doni",
    dojang: "Senayan Dojang",
    sabuk: "Putih",
    tanggalLahir: "2017-12-03",
    noHandphone2: "0821-4433-2211",
    warganegara: "Indonesia",
    nikKtpPaspor: "3174120317120008",
    alamatLengkap: "Jl. Senayan Trade Center No. 4, Jakarta Pusat",
    kodePos: "10270",
    tinggiBadan: 132,
    beratBadan: 30,
    ukuranSepatu: 33,
    namaAyah: "Hartanto Wijaya",
    namaIbu: "Indah Sari",
    golDarah: "A",
    alergi: "Kacang",
    mulaiLatihan: "2024-08-01",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-12-10T10:00:00Z",
  },
];

// store
let _students: Student[] = [...INITIAL_STUDENTS];
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
  notify();
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
export function getNextStudentUsername(): string {
  const max = _students.reduce((m, s) => {
    const num = parseInt(s.username.replace(/^U/, ""), 10);
    return Number.isFinite(num) && num > m ? num : m;
  }, 0);
  return `U${String(max + 1).padStart(4, "0")}`;
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