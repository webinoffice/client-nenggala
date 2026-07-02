// src/app/app/(authenticated)/me/ebook/EbookClient.tsx
"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Download } from "lucide-react";
import { getEbooks, subscribeEbooks } from "../../master/_shared/ebooks";

function fmtDate(iso: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())} / ${pad(d.getMonth() + 1)} / ${d.getFullYear()}`;
}

export default function EbookClient() {
  const allEbooks = useSyncExternalStore(subscribeEbooks, getEbooks, getEbooks);

  // Sorted by sabuk then title (the backend ebook table has no status column).
  const ebooks = useMemo(
    () =>
      allEbooks.slice().sort((a, b) => {
        if (a.sabuk !== b.sabuk) return a.sabuk.localeCompare(b.sabuk);
        return a.title.localeCompare(b.title);
      }),
    [allEbooks],
  );

  const handleDownload = (pdfFile: string) => {
    // pdfFile is already an absolute URL (store maps EBookFile through fileUrl).
    if (!pdfFile) return;
    window.open(pdfFile, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <h1 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight text-ink mb-6">
        E-Book Taekwondo Guides
      </h1>

      <div className="bg-paper rounded-sm border border-ink/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-ink/15 bg-paper-soft font-display text-[11px] font-bold uppercase tracking-widest text-ink/70">
                <th className="text-left px-4 py-3.5 w-16">No</th>
                <th className="text-left px-4 py-3.5">Sabuk</th>
                <th className="text-left px-4 py-3.5">Title</th>
                <th className="text-left px-4 py-3.5">Update Date</th>
                <th className="text-right px-4 py-3.5">Download</th>
              </tr>
            </thead>
            <tbody>
              {ebooks.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center px-4 py-16 text-muted uppercase tracking-widest text-xs font-bold"
                  >
                    No e-books available
                  </td>
                </tr>
              ) : (
                ebooks.map((e, i) => (
                  <tr
                    key={e.id}
                    className="border-b border-ink/5 hover:bg-paper-soft/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-ink font-medium">{i + 1}</td>
                    <td className="px-4 py-3 text-ink">{e.sabuk}</td>
                    <td className="px-4 py-3 text-ink">{e.title}</td>
                    <td className="px-4 py-3 text-ink/70 text-xs">
                      {fmtDate(e.updateDate)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDownload(e.pdfFile)}
                        disabled={!e.pdfFile}
                        className="inline-flex items-center gap-1.5 bg-brand text-brand-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm hover:bg-brand-hover transition disabled:opacity-40 disabled:cursor-not-allowed"
                        title={e.pdfFile ? undefined : "No file uploaded"}
                      >
                        <Download size={12} />
                        Download
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
