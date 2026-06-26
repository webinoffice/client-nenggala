// src/app/app/(authenticated)/master/_shared/ebooks.ts
import { fetchEbooks, saveEBook, deleteEBook } from "@/lib/api/master";
import { fileUrl } from "@/lib/api/file-url";
import { dmyhmsToIso } from "@/lib/api/dates";

export type EbookStatus = "Active" | "Inactive";

export type Ebook = {
  id: number;
  sabuk: string;
  volume?: string; // legacy field — no longer shown/edited
  title: string;
  pdfFile: string; // filename, e.g. "putih-cara-menendang.pdf"
  status: EbookStatus;
  updatedBy: string;
  updateDate: string;
};

export const INITIAL_EBOOKS: Ebook[] = [
  {
    id: 1,
    sabuk: "Putih",
    volume: "1.1",
    title: "Cara Menendang",
    pdfFile: "putih-cara-menendang.pdf",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2026-02-19T10:00:00",
  },
  {
    id: 2,
    sabuk: "Putih",
    volume: "1.2",
    title: "Sikap Dasar & Salam",
    pdfFile: "putih-sikap-dasar.pdf",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2026-02-19T10:05:00",
  },
  {
    id: 3,
    sabuk: "Kuning",
    volume: "2.1",
    title: "Pomsae Taegeuk Il Jang",
    pdfFile: "kuning-taegeuk-1.pdf",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2026-01-15T09:00:00",
  },
  {
    id: 4,
    sabuk: "Hijau",
    volume: "3.1",
    title: "Pomsae Taegeuk Sam Jang",
    pdfFile: "hijau-taegeuk-3.pdf",
    status: "Active",
    updatedBy: "Andre",
    updateDate: "2025-12-20T14:00:00",
  },
  {
    id: 5,
    sabuk: "Biru",
    volume: "4.1",
    title: "Teknik Tendangan Lanjutan",
    pdfFile: "biru-tendangan-lanjutan.pdf",
    status: "Active",
    updatedBy: "Andre",
    updateDate: "2025-11-10T11:30:00",
  },
  {
    id: 6,
    sabuk: "Merah",
    volume: "5.1",
    title: "Kyorugi Strategi Bertanding",
    pdfFile: "merah-kyorugi-strategi.pdf",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-10-05T16:00:00",
  },
  {
    id: 7,
    sabuk: "Hitam DAN-1",
    volume: "6.1",
    title: "14 Basic Movements Hyungs",
    pdfFile: "hitam-14-basic.pdf",
    status: "Active",
    updatedBy: "Carolina",
    updateDate: "2025-09-01T08:00:00",
  },
  {
    id: 8,
    sabuk: "Kuning",
    volume: "2.2",
    title: "Sikap Kuda-Kuda",
    pdfFile: "kuning-kuda-kuda.pdf",
    status: "Inactive",
    updatedBy: "Andre",
    updateDate: "2025-08-15T13:00:00",
  },
];

// ---- mutable store ----
let _ebooks: Ebook[] = [...INITIAL_EBOOKS];
const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((l) => l());
}

export function getEbooks(): Ebook[] {
  return _ebooks;
}
export function subscribeEbooks(listener: () => void) {
  listeners.add(listener);
  ensureEbooksLoaded();
  return () => {
    listeners.delete(listener);
  };
}

// ---- hydration (read API) ----
// The backend ebook table has no status column (get-ebook returns no FgStatus,
// and there is no inact endpoint), so every fetched ebook is treated as Active;
// the status toggle stays client-only until a server status column exists.
let _loaded = false;
let _loadPromise: Promise<void> | null = null;

async function loadEbooks(): Promise<void> {
  const rows = (await fetchEbooks()) ?? [];
  _ebooks = rows.map((r) => ({
    id: r.EBookMsId,
    sabuk: r.BeltName ?? "",
    volume: r.Vol ?? undefined,
    title: r.Title ?? "",
    pdfFile: r.EBookFile ? fileUrl(r.EBookFile) : "",
    status: "Active",
    updatedBy: r.UpdatedBy ?? "",
    updateDate: dmyhmsToIso(r.UpdateDate),
  }));
  notify();
}

/** One-time hydration of the ebook master from the backend. */
export function ensureEbooksLoaded(): Promise<void> {
  if (_loaded) return Promise.resolve();
  if (!_loadPromise) {
    _loadPromise = loadEbooks()
      .then(() => {
        _loaded = true;
      })
      .catch((err) => {
        console.error("Failed to load ebooks", err);
        _loadPromise = null;
      });
  }
  return _loadPromise;
}

/** Re-fetch the ebook master (used after a write). */
export async function reloadEbooks(): Promise<void> {
  _loaded = false;
  _loadPromise = null;
  await ensureEbooksLoaded();
}

// ---- writes (save-ebook multipart insert + delete-ebook HARD delete) ----
// The backend saveEBookMs is insert-only (no edit path), so this is insert +
// delete only — there is no update/toggle.

export async function addEbook(
  beltMasterId: number,
  title: string,
  vol: string | null,
  file: File | null,
) {
  try {
    await saveEBook(
      {
        EBookMsId: 0,
        BeltMasterId: beltMasterId,
        Vol: vol,
        Title: title,
        FgMode: "I",
      },
      file,
    );
    await reloadEbooks();
  } catch (err) {
    console.error("Failed to add ebook", err);
  }
}

/** Hard delete. Throws so the consumer can surface the error in a Modal. */
export async function removeEbook(id: number) {
  await deleteEBook(id);
  await reloadEbooks();
}