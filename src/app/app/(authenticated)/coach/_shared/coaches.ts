// src/app/app/(authenticated)/coach/_shared/coaches.ts

export type CoachStatus = "Active" | "Inactive";
export type BloodType = "A" | "B" | "AB" | "O" | "-";

export type Coach = {
  username: string; // C + 4-digit
  namaLengkap: string;
  panggilan: string;
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
  return () => {
    listeners.delete(l);
  };
}
export function getCoachByUsername(username: string) {
  return _coaches.find((c) => c.username === username) ?? null;
}
export function getNextCoachUsername(): string {
  const max = _coaches.reduce((m, c) => {
    const n = parseInt(c.username.replace(/^C/, ""), 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `C${String(max + 1).padStart(4, "0")}`;
}
export function addCoach(c: Coach) {
  _coaches = [c, ..._coaches];
  notify();
}
export function updateCoach(username: string, patch: Partial<Coach>) {
  _coaches = _coaches.map((c) =>
    c.username === username ? { ...c, ...patch } : c,
  );
  notify();
}
export function toggleCoachStatus(username: string, by: string) {
  _coaches = _coaches.map((c) =>
    c.username === username
      ? {
          ...c,
          status: c.status === "Active" ? "Inactive" : "Active",
          updatedBy: by,
          updateDate: new Date().toISOString(),
        }
      : c,
  );
  notify();
}
