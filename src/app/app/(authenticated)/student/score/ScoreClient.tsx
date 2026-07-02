// src/app/app/(authenticated)/student/score/ScoreClient.tsx
//
// Admin "Score Management" = the exam/score table (Step 3d). Rows come from
// get-student-assess-list — i.e. only students REGISTERED for the period's exam
// (via the student self-service or admin cash flow). The period is required; the
// dojang acts as a client-side filter. The Excel toolbar has two actions:
//   • Export — one sheet that IS the fillable template and also carries every
//     saved score (get-student-assess-list for the rows, get-assess-entry for the
//     columns, get-assess-result to pre-fill). N/A marks items above a belt level.
//   • Import — parses a filled sheet and saves via save-student-assess-bulk.
//     Fill-only: rows for already-assessed students are skipped client-side (the
//     backend only accepts not-yet-assessed students), so pre-filled scores are
//     effectively read-only and correcting a score is done via the on-screen form.
"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Download, Eye, FileText, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/app/PageHeader";
import { fileUrl } from "@/lib/api/file-url";
import { ApiError } from "@/lib/api/client";
import {
  fetchAssessEntry,
  fetchAssessResult,
  fetchStudentImportAssessList,
  saveStudentAssessBulk,
  type BulkImportResult,
} from "@/lib/api/assessment";
import StudentDrillDown, {
  EMPTY_SELECTION,
  type DrillDownSelection,
} from "../_shared/StudentDrillDown";
import { MIN_ATTENDANCE } from "../_shared/attendance";
import {
  ensureAssessListLoaded,
  getAssessList,
  getScoresVersion,
  isAssessed,
  reloadAssessList,
  subscribeScores,
} from "../_shared/scores";
import {
  buildScoreExport,
  downloadAoa,
  parseScoreImport,
  type ScoreExportStudent,
} from "../_shared/score-import";

export default function ScoreClient() {
  const router = useRouter();
  const [selection, setSelection] =
    useState<DrillDownSelection>(EMPTY_SELECTION);
  // Re-render when the period's assess list lands in the cache.
  useSyncExternalStore(subscribeScores, getScoresVersion, getScoresVersion);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  // BulkImportResult + a UI-only count of rows skipped for being already assessed.
  const [importResult, setImportResult] = useState<
    (BulkImportResult & { skipped?: number }) | null
  >(null);

  const periodId = selection.periodId ? Number(selection.periodId) : 0;

  useEffect(() => {
    if (periodId !== 0) ensureAssessListLoaded(periodId);
  }, [periodId]);

  const ready = periodId !== 0;
  const all = ready ? getAssessList(periodId) : [];
  const rows = selection.dojang
    ? all.filter((r) => r.DojangName === selection.dojang)
    : all;

  const handleExport = async () => {
    if (!ready) return;
    setBusy(true);
    setInfo(null);
    try {
      if (rows.length === 0) {
        setInfo("Tidak ada peserta ujian untuk period ini.");
        return;
      }
      // Columns = every assessment item up to the highest belt level present
      // (items are cumulative by ScoreLevel, so the top belt's set is a superset).
      const maxBeltLevel = rows.reduce(
        (m, r) => Math.max(m, r.BeltLevel ?? 0),
        0,
      );
      const items = await fetchAssessEntry(maxBeltLevel);

      // Pre-fill saved scores — only assessed students have any.
      const assessed = rows.filter((r) => isAssessed(r.TotalScore));
      const results = await Promise.all(
        assessed.map((r) =>
          fetchAssessResult({
            studentId: r.UserDataId,
            programMsId: r.ProgramMsId,
            schPeriodId: periodId,
          }).then((res) => ({ id: r.UserDataId, res })),
        ),
      );
      const scoresByStudent = new Map<number, Map<number, number>>();
      for (const { id, res } of results) {
        const m = new Map<number, number>();
        res.forEach((x) => m.set(x.AssessTempDtId, x.AssessScore));
        scoresByStudent.set(id, m);
      }

      const students: ScoreExportStudent[] = rows.map((r) => ({
        meta: r,
        scores: scoresByStudent.get(r.UserDataId) ?? new Map<number, number>(),
      }));
      downloadAoa(
        `scores_P${periodId}.xlsx`,
        buildScoreExport(students, items),
        "Scores",
      );
    } catch (e) {
      setInfo(e instanceof ApiError ? e.message : "Gagal mengekspor nilai.");
    } finally {
      setBusy(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !ready) return;
    setBusy(true);
    setInfo(null);
    try {
      const importRows = await fetchStudentImportAssessList({
        schPeriodId: periodId,
      });
      if (importRows.length === 0) {
        setImportResult({
          ok: false,
          nothingToImport: true,
          message: "",
          errors: [],
        });
        return;
      }
      const periodTitle = importRows[0].PeriodTitle ?? "";
      const list = await parseScoreImport(file, periodTitle);
      if (list.length === 0) {
        setInfo("File tidak berisi baris data yang valid.");
        return;
      }
      // Fill-only: drop rows for students already assessed (the backend rejects
      // them). Their pre-filled scores in the export are read-only.
      const assessedNoIds = new Set(
        getAssessList(periodId)
          .filter((r) => isAssessed(r.TotalScore))
          .map((r) => (r.UserNoId ?? "").trim()),
      );
      const toSend = list.filter((r) => !assessedNoIds.has(r.UserNoId.trim()));
      const skipped = list.length - toSend.length;
      if (toSend.length === 0) {
        setInfo(
          skipped > 0
            ? `Semua ${skipped} baris pada file sudah dinilai — tidak ada nilai baru untuk diimpor.`
            : "File tidak berisi baris data yang valid.",
        );
        return;
      }
      const result = await saveStudentAssessBulk({
        SchPeriodId: periodId,
        ListDataImport: toSend,
      });
      setImportResult({ ...result, skipped });
      if (result.ok || result.errors.length > 0) {
        await reloadAssessList(periodId);
      }
    } catch (err) {
      setImportResult({
        ok: false,
        nothingToImport: false,
        message: err instanceof ApiError ? err.message : "Import gagal.",
        errors: [],
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Score Management" />
      <StudentDrillDown
        selection={selection}
        onChange={setSelection}
        hideProgram
      />

      {ready && (
        <div className="bg-paper rounded-sm border border-ink/10 p-4 mb-6 flex flex-wrap items-center gap-2">
          <div className="text-[11px] uppercase tracking-widest font-bold text-muted mr-2">
            Bulk via Excel:
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={busy}
          >
            <Download size={14} /> {busy ? "Working…" : "Export Scores"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
          >
            <Upload size={14} /> {busy ? "Working…" : "Import Excel"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleImportFile}
          />
        </div>
      )}

      {!ready ? (
        <div className="bg-paper rounded-sm border border-ink/10 p-12 text-center">
          <p className="text-muted uppercase tracking-widest text-xs font-bold">
            Pilih Period untuk melihat peserta ujian
          </p>
        </div>
      ) : (
        <div className="bg-paper rounded-sm border border-ink/10 overflow-hidden">
          <div className="px-6 py-4 bg-paper-soft border-b border-ink/10">
            <div className="text-[11px] font-bold uppercase tracking-widest text-muted">
              Showing
            </div>
            <div className="text-ink font-display font-bold mt-1">
              {selection.dojang || "Semua Dojang"}
              {rows.length > 0 ? ` · ${rows[0].PeriodTitle}` : ""}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-ink/15 bg-paper-soft font-display text-[11px] font-bold uppercase tracking-widest text-ink/70">
                  <th className="text-left px-4 py-3.5 whitespace-nowrap">
                    No. Reg
                  </th>
                  <th className="text-left px-4 py-3.5 whitespace-nowrap">
                    Nama Lengkap
                  </th>
                  <th className="text-left px-4 py-3.5 whitespace-nowrap">
                    Dojang
                  </th>
                  <th className="text-left px-4 py-3.5 whitespace-nowrap">
                    Sabuk
                  </th>
                  <th className="text-right px-4 py-3.5 whitespace-nowrap">
                    Attendance
                  </th>
                  <th className="text-left px-4 py-3.5 whitespace-nowrap">
                    Bukti Bayar
                  </th>
                  <th className="text-right px-4 py-3.5 whitespace-nowrap">
                    Total Score
                  </th>
                  <th className="text-right px-4 py-3.5 whitespace-nowrap">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center px-4 py-16 text-muted uppercase tracking-widest text-xs font-bold"
                    >
                      Belum ada peserta ujian untuk period ini
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => {
                    const assessed = isAssessed(r.TotalScore);
                    const lowAttendance =
                      r.FgLackAtd === "Y" || r.TotalAtd < MIN_ATTENDANCE;
                    const proof = fileUrl(r.ExamPaymentFile);
                    return (
                      <tr
                        key={`${r.UserDataId}-${r.ProgramMsId}`}
                        className="border-b border-ink/5 hover:bg-paper-soft/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-ink font-medium whitespace-nowrap">
                          {r.UserNoId}
                        </td>
                        <td className="px-4 py-3 text-ink whitespace-nowrap">
                          {r.UserName}
                        </td>
                        <td className="px-4 py-3 text-ink whitespace-nowrap">
                          {r.DojangName}
                        </td>
                        <td className="px-4 py-3 text-ink whitespace-nowrap">
                          {r.BeltName || "-"}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <span
                            className={cn(
                              "font-display font-bold",
                              lowAttendance ? "text-brand" : "text-ink",
                            )}
                          >
                            {r.TotalAtd}
                          </span>
                          <span className="text-muted text-xs ml-1">
                            / {MIN_ATTENDANCE}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {proof ? (
                            <a
                              href={proof}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-accent hover:underline"
                            >
                              <FileText size={12} />
                              Lihat
                            </a>
                          ) : (
                            <span className="text-[10px] uppercase tracking-widest text-muted font-bold">
                              Cash / —
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-display font-bold text-ink whitespace-nowrap">
                          {assessed ? r.TotalScore.toFixed(1) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {assessed ? (
                            <button
                              onClick={() =>
                                router.push(
                                  `/app/student/score/view/${r.UserDataId}/${r.ProgramMsId}/${periodId}`,
                                )
                              }
                              className="inline-flex items-center gap-1.5 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm hover:brightness-95 transition"
                            >
                              <Eye size={12} />
                              Show Score
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                router.push(
                                  `/app/student/score/submit/${r.UserDataId}/${r.ProgramMsId}/${periodId}`,
                                )
                              }
                              className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm hover:brightness-95 transition"
                            >
                              Submit Score
                              {lowAttendance && (
                                <AlertCircle size={12} className="text-brand" />
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info / error notice */}
      <Modal
        open={info !== null}
        onClose={() => setInfo(null)}
        title="Bulk Excel"
        size="sm"
      >
        <p className="text-sm text-ink/80">{info}</p>
        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={() => setInfo(null)}>
            Close
          </Button>
        </div>
      </Modal>

      {/* Import result */}
      <Modal
        open={importResult !== null}
        onClose={() => setImportResult(null)}
        title="Import Result"
        size="md"
      >
        {importResult && (
          <div className="space-y-4">
            {importResult.skipped ? (
              <p className="text-xs text-muted">
                {importResult.skipped} baris dilewati karena siswanya sudah
                dinilai (nilai lama tidak diubah).
              </p>
            ) : null}
            {importResult.nothingToImport ? (
              <p className="text-sm text-ink/80">
                Tidak ada siswa yang bisa diimpor untuk period ini (semua sudah
                dinilai atau belum ada peserta ujian).
              </p>
            ) : importResult.errors.length === 0 && importResult.ok ? (
              <p className="text-sm text-emerald-700 font-medium">
                Semua nilai berhasil diimpor.
              </p>
            ) : importResult.errors.length > 0 ? (
              <>
                <p className="text-sm text-brand font-medium">
                  Sebagian baris gagal diimpor ({importResult.errors.length}).
                  Baris lain yang valid tetap tersimpan.
                </p>
                <div className="max-h-64 overflow-auto border border-ink/10 rounded-sm">
                  <table className="w-full text-xs">
                    <thead className="bg-paper-soft">
                      <tr className="text-left font-display uppercase tracking-widest text-ink/70">
                        <th className="px-3 py-2">No. Reg</th>
                        <th className="px-3 py-2">Nama</th>
                        <th className="px-3 py-2">Dojang</th>
                        <th className="px-3 py-2">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importResult.errors.map((er, i) => (
                        <tr key={i} className="border-t border-ink/5">
                          <td className="px-3 py-2">{er.StudentNoId}</td>
                          <td className="px-3 py-2">{er.StudentName}</td>
                          <td className="px-3 py-2">{er.DojangName}</td>
                          <td className="px-3 py-2 text-brand">{er.ErrDesc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className="text-sm text-brand font-medium">
                {importResult.message || "Import gagal."}
              </p>
            )}
          </div>
        )}
        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={() => setImportResult(null)}>
            Close
          </Button>
        </div>
      </Modal>
    </>
  );
}
