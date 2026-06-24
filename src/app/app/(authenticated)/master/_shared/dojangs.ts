// src/app/app/(authenticated)/master/_shared/dojangs.ts

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
  return () => {
    listeners.delete(listener);
  };
}
export function getDojangById(id: number): Dojang | null {
  return _dojangs.find((d) => d.id === id) ?? null;
}
export function getNextDojangId(): number {
  return _dojangs.length > 0 ? Math.max(..._dojangs.map((d) => d.id)) + 1 : 1;
}
export function addDojang(dojang: Dojang) {
  _dojangs = [dojang, ..._dojangs];
  notify();
}
export function updateDojang(id: number, patch: Partial<Dojang>) {
  _dojangs = _dojangs.map((d) => (d.id === id ? { ...d, ...patch } : d));
  notify();
}
export function toggleDojangStatus(id: number, by: string) {
  _dojangs = _dojangs.map((d) =>
    d.id === id
      ? {
          ...d,
          status: d.status === "Active" ? "Inactive" : "Active",
          updatedBy: by,
          updateDate: new Date().toISOString(),
        }
      : d,
  );
  notify();
}
