// src/app/app/(authenticated)/admin/_shared/admins.ts

export type AdminStatus = "Active" | "Inactive";
export type BloodType = "A" | "B" | "AB" | "O" | "-";

export type Admin = {
  username: string;          // NA + 4-digit, auto-generated
  namaLengkap: string;
  panggilan: string;
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

// Mock reference data — these would come from master/dojang and
// master/grading-belt via API. Inlined here for the static demo.
export const DOJANG_OPTIONS = [
  "Kedoya Sport Club",
  "Senayan Dojang",
  "Bintaro Dojang",
  "Pakualam Center",
  "Pondok Indah Dojang",
];

export const SABUK_OPTIONS = [
  "-",
  "Putih",
  "Kuning",
  "Hijau",
  "Biru",
  "Merah",
  "Hitam DAN-1",
  "Hitam DAN-2",
  "Hitam DAN-3",
];

export const WARGA_NEGARA_OPTIONS = [
  "Indonesia",
  "Malaysia",
  "Singapore",
  "Other",
];

export const GOL_DARAH_OPTIONS: BloodType[] = ["-", "A", "B", "AB", "O"];

const INITIAL_ADMINS: Admin[] = [
  {
    username: "NA0001",
    namaLengkap: "Fathir Ramadhan",
    panggilan: "Fathir",
    dojang: "Kedoya Sport Club",
    sabuk: "-",
    tanggalLahir: "2017-03-14",
    noHandphone2: "0878-5234-2342",
    warganegara: "Indonesia",
    nikKtpPaspor: "3179080705470005",
    alamatLengkap: "Sutera Orlanda II No.10, Pakualam Tangerang",
    kodePos: "15510",
    tinggiBadan: 150,
    beratBadan: 57,
    ukuranSepatu: 38,
    namaAyah: "Christoper",
    namaIbu: "Jessica",
    golDarah: "A",
    alergi: "Kacang",
    mulaiLatihan: "2014-03-14",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-12-28T19:41:32Z",
  },
  {
    username: "NA0002",
    namaLengkap: "Rangga Putra Wijaya",
    panggilan: "Rangga",
    dojang: "Senayan Dojang",
    sabuk: "Kuning",
    tanggalLahir: "2015-07-22",
    noHandphone2: "0812-3344-5566",
    warganegara: "Indonesia",
    nikKtpPaspor: "3174012207150003",
    alamatLengkap: "Jl. Mawar No. 12, Kebayoran Baru, Jakarta Selatan",
    kodePos: "12110",
    tinggiBadan: 145,
    beratBadan: 42,
    ukuranSepatu: 36,
    namaAyah: "Budi Wijaya",
    namaIbu: "Sari Lestari",
    golDarah: "O",
    alergi: "-",
    mulaiLatihan: "2018-01-10",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-11-14T10:22:08Z",
  },
  {
    username: "NA0003",
    namaLengkap: "Adelia Sari Pertiwi",
    panggilan: "Adel",
    dojang: "Bintaro Dojang",
    sabuk: "Hijau",
    tanggalLahir: "2013-11-05",
    noHandphone2: "0857-9988-7766",
    warganegara: "Indonesia",
    nikKtpPaspor: "3674051113080002",
    alamatLengkap: "Jl. Bintaro Utama III A No. 7, Tangerang Selatan",
    kodePos: "15413",
    tinggiBadan: 158,
    beratBadan: 49,
    ukuranSepatu: 39,
    namaAyah: "Hendro Pertiwi",
    namaIbu: "Linda Anggraini",
    golDarah: "B",
    alergi: "Seafood",
    mulaiLatihan: "2016-08-20",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-12-01T14:08:55Z",
  },
  {
    username: "NA0004",
    namaLengkap: "Bagus Pratama Nugroho",
    panggilan: "Bagus",
    dojang: "Pakualam Center",
    sabuk: "Biru",
    tanggalLahir: "2012-04-18",
    noHandphone2: "0813-2211-3344",
    warganegara: "Indonesia",
    nikKtpPaspor: "3672181204120001",
    alamatLengkap: "Perum Pakualam Asri Blok C No. 5, Tangerang",
    kodePos: "15510",
    tinggiBadan: 162,
    beratBadan: 54,
    ukuranSepatu: 40,
    namaAyah: "Sutrisno Nugroho",
    namaIbu: "Tuti Handayani",
    golDarah: "A",
    alergi: "-",
    mulaiLatihan: "2017-02-11",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-10-29T09:15:20Z",
  },
  {
    username: "NA0005",
    namaLengkap: "Citra Maharani Dewi",
    panggilan: "Citra",
    dojang: "Kedoya Sport Club",
    sabuk: "Merah",
    tanggalLahir: "2011-09-30",
    noHandphone2: "0821-7766-5544",
    warganegara: "Indonesia",
    nikKtpPaspor: "3175093009110004",
    alamatLengkap: "Jl. Kemanggisan Raya No. 22, Jakarta Barat",
    kodePos: "11480",
    tinggiBadan: 165,
    beratBadan: 56,
    ukuranSepatu: 39,
    namaAyah: "Eko Dewi Saputra",
    namaIbu: "Maria Anjani",
    golDarah: "AB",
    alergi: "Debu",
    mulaiLatihan: "2015-05-04",
    status: "Inactive",
    updatedBy: "Carolina",
    updateDate: "2025-09-18T16:40:12Z",
  },
  {
    username: "NA0006",
    namaLengkap: "Dimas Kurniawan Adi",
    panggilan: "Dimas",
    dojang: "Pondok Indah Dojang",
    sabuk: "Hitam DAN-1",
    tanggalLahir: "2008-02-14",
    noHandphone2: "0856-4433-2211",
    warganegara: "Indonesia",
    nikKtpPaspor: "3174021402080007",
    alamatLengkap: "Jl. Metro Pondok Indah No. 18, Jakarta Selatan",
    kodePos: "12310",
    tinggiBadan: 172,
    beratBadan: 65,
    ukuranSepatu: 42,
    namaAyah: "Adi Kurniawan",
    namaIbu: "Retno Wulandari",
    golDarah: "O",
    alergi: "-",
    mulaiLatihan: "2013-07-15",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-12-15T11:30:00Z",
  },
  {
    username: "NA0007",
    namaLengkap: "Eka Wijaya Saputra",
    panggilan: "Eka",
    dojang: "Senayan Dojang",
    sabuk: "Putih",
    tanggalLahir: "2018-06-08",
    noHandphone2: "0878-1122-3344",
    warganegara: "Indonesia",
    nikKtpPaspor: "3174060806180005",
    alamatLengkap: "Jl. Senayan Trade Center No. 4, Jakarta Pusat",
    kodePos: "10270",
    tinggiBadan: 132,
    beratBadan: 32,
    ukuranSepatu: 33,
    namaAyah: "Wijaya Sentosa",
    namaIbu: "Anita Saputra",
    golDarah: "A",
    alergi: "Telur",
    mulaiLatihan: "2024-01-12",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-11-02T08:55:33Z",
  },
  {
    username: "NA0008",
    namaLengkap: "Fina Lestari Putri",
    panggilan: "Fina",
    dojang: "Bintaro Dojang",
    sabuk: "Kuning",
    tanggalLahir: "2016-12-25",
    noHandphone2: "0813-7788-9900",
    warganegara: "Indonesia",
    nikKtpPaspor: "3674122512160006",
    alamatLengkap: "Jl. Bintaro Permai V No. 11, Tangerang Selatan",
    kodePos: "15411",
    tinggiBadan: 140,
    beratBadan: 38,
    ukuranSepatu: 35,
    namaAyah: "Lestari Hadi",
    namaIbu: "Rini Astuti",
    golDarah: "B",
    alergi: "-",
    mulaiLatihan: "2020-09-01",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-08-19T13:25:47Z",
  },
  {
    username: "NA0009",
    namaLengkap: "Galang Nugraha Setiawan",
    panggilan: "Galang",
    dojang: "Kedoya Sport Club",
    sabuk: "Hijau",
    tanggalLahir: "2014-05-19",
    noHandphone2: "0821-3322-1100",
    warganegara: "Indonesia",
    nikKtpPaspor: "3175051905140002",
    alamatLengkap: "Apartemen Puri Kemayoran Tower B No. 1505, Jakarta Pusat",
    kodePos: "10630",
    tinggiBadan: 152,
    beratBadan: 47,
    ukuranSepatu: 37,
    namaAyah: "Setiawan Nugraha",
    namaIbu: "Devi Marlina",
    golDarah: "A",
    alergi: "Susu",
    mulaiLatihan: "2018-11-23",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-12-22T17:11:09Z",
  },
  {
    username: "NA0010",
    namaLengkap: "Hana Pertiwi Larasati",
    panggilan: "Hana",
    dojang: "Pondok Indah Dojang",
    sabuk: "Biru",
    tanggalLahir: "2010-08-03",
    noHandphone2: "0857-5566-7788",
    warganegara: "Indonesia",
    nikKtpPaspor: "3174030308100008",
    alamatLengkap: "Jl. Pondok Indah Boulevard No. 30, Jakarta Selatan",
    kodePos: "12310",
    tinggiBadan: 160,
    beratBadan: 52,
    ukuranSepatu: 38,
    namaAyah: "Larasati Bambang",
    namaIbu: "Sri Murniati",
    golDarah: "O",
    alergi: "-",
    mulaiLatihan: "2014-10-10",
    status: "Inactive",
    updatedBy: "Carolina",
    updateDate: "2025-07-30T12:42:18Z",
  },
  {
    username: "NA0011",
    namaLengkap: "Indra Saputra Hidayat",
    panggilan: "Indra",
    dojang: "Pakualam Center",
    sabuk: "Merah",
    tanggalLahir: "2009-01-27",
    noHandphone2: "0813-9988-1122",
    warganegara: "Indonesia",
    nikKtpPaspor: "3672270109090004",
    alamatLengkap: "Perum Pakualam Hijau Blok F No. 12, Tangerang",
    kodePos: "15510",
    tinggiBadan: 170,
    beratBadan: 62,
    ukuranSepatu: 41,
    namaAyah: "Hidayat Pranoto",
    namaIbu: "Yuli Astari",
    golDarah: "AB",
    alergi: "Kacang",
    mulaiLatihan: "2014-03-14",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-12-10T15:20:55Z",
  },
  {
    username: "NA0012",
    namaLengkap: "Jihan Rahmadani Putri",
    panggilan: "Jihan",
    dojang: "Senayan Dojang",
    sabuk: "Hitam DAN-1",
    tanggalLahir: "2007-10-12",
    noHandphone2: "0878-6655-4433",
    warganegara: "Indonesia",
    nikKtpPaspor: "3174121210070003",
    alamatLengkap: "Jl. Patal Senayan No. 8, Jakarta Pusat",
    kodePos: "10270",
    tinggiBadan: 168,
    beratBadan: 58,
    ukuranSepatu: 39,
    namaAyah: "Rahmadani Hadi",
    namaIbu: "Nuraini Sari",
    golDarah: "B",
    alergi: "-",
    mulaiLatihan: "2012-08-08",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-11-25T18:05:14Z",
  },
];

// ---- mutable store ----
// Cross-page state for the static demo. When the API arrives,
// replace the bodies of these functions with fetch/mutation calls;
// the component-facing interface stays the same.

let _admins: Admin[] = [...INITIAL_ADMINS];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function getAdmins(): Admin[] {
  return _admins;
}

export function subscribeAdmins(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getAdminByUsername(username: string): Admin | null {
  return _admins.find((a) => a.username === username) ?? null;
}

export function getNextUsername(): string {
  const max = _admins.reduce((m, a) => {
    const num = parseInt(a.username.replace(/^NA/, ""), 10);
    return Number.isFinite(num) && num > m ? num : m;
  }, 0);
  return `NA${String(max + 1).padStart(4, "0")}`;
}

export function addAdmin(admin: Admin) {
  _admins = [admin, ..._admins];
  notify();
}

export function updateAdmin(username: string, patch: Partial<Admin>) {
  _admins = _admins.map((a) =>
    a.username === username ? { ...a, ...patch } : a,
  );
  notify();
}

export function toggleAdminStatus(username: string, by: string) {
  _admins = _admins.map((a) =>
    a.username === username
      ? {
          ...a,
          status: a.status === "Active" ? "Inactive" : "Active",
          updatedBy: by,
          updateDate: new Date().toISOString(),
        }
      : a,
  );
  notify();
}