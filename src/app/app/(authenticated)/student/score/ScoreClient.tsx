// src/app/app/(authenticated)/student/score/ScoreClient.tsx
//
// Admin "Score Management" = the exam/score table (Step 3d). Rows come from
// get-student-assess-list — i.e. only students REGISTERED for the period's exam
// (via the student self-service or admin cash flow). The period is required; the
// dojang acts as a client-side filter. The Excel bulk toolbar downloads a
// score-entry template (get-student-import-assess-list), exports the summary, and
// imports filled templates (save-student-assess-bulk).
"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/app/PageHeader";
import { fileUrl } from "@/lib/api/file-url";
import { ApiError } from "@/lib/api/client";
import {
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
  resultLabel,
  subscribeScores,
} from "../_shared/scores";
import {
  buildScoreTemplate,
  downloadAoa,
  parseScoreImport,
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
  const [importResult, setImportResult] = useState<BulkImportResult | null>(
    null,
  );

  const periodId = selection.periodId ? Number(selection.periodId) : 0;

  useEffect(() => {
    if (periodId !== 0) ensureAssessListLoaded(periodId);
  }, [periodId]);

  const ready = periodId !== 0;
  const all = ready ? getAssessList(periodId) : [];
  const rows = selection.dojang
    ? all.filter((r) => r.DojangName === selection.dojang)
    : all;

  const handleDownloadTemplate = async () => {
    if (!ready) return;
    setBusy(true);
    setInfo(null);
    try {
      const importRows = await fetchStudentImportAssessList({
        schPeriodId: periodId,
      });
      if (importRows.length === 0) {
        setInfo(
          "Tidak ada siswa yang perlu diinput nilainya untuk period ini (semua sudah dinilai atau belum ada peserta).",
        );
        return;
      }
      downloadAoa(
        `score-template_P${periodId}.xlsx`,
        buildScoreTemplate(importRows),
        "Template",
      );
    } catch (e) {
      setInfo(e instanceof ApiError ? e.message : "Gagal membuat template.");
    } finally {
      setBusy(false);
    }
  };

  const handleExport = () => {
    if (!ready) return;
    const header = [
      "No. Reg",
      "Nama Lengkap",
      "Dojang",
      "Sabuk",
      "Total Absen",
      "Total Score",
      "Hasil",
    ];
    const aoa: (string | number)[][] = [
      header,
      ...rows.map((r) => [
        r.UserNoId ?? "",
        r.UserName ?? "",
        r.DojangName ?? "",
        r.BeltName ?? "",
        r.TotalAtd,
        isAssessed(r.TotalScore) ? r.TotalScore : "",
        isAssessed(r.TotalScore)
          ? resultLabel(r.TotalScore, r.BeltMasterId)
          : "",
      ]),
    ];
    downloadAoa(`scores_P${periodId}.xlsx`, aoa, "Scores");
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
      const result = await saveStudentAssessBulk({
        SchPeriodId: periodId,
        ListDataImport: list,
      });
      setImportResult(result);
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
            onClick={handleDownloadTemplate}
            disabled={busy}
          >
            <FileSpreadsheet size={14} /> Download Template
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={busy}
          >
            <Download size={14} /> Export Scores
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
