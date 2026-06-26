// src/app/app/(authenticated)/student/score/ScoreClient.tsx
"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Download,
  Eye,
  FileSpreadsheet,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/app/PageHeader";
import StudentDrillDown, {
  EMPTY_SELECTION,
  type DrillDownSelection,
} from "../_shared/StudentDrillDown";
import {
  formatPeriod,
  getEnrolledUsernamesByDojang,
  getPeriodById,
  useAcademic,
  useEnrollments,
} from "../_shared/academic";
import {
  getStudents,
  subscribeStudents,
  type Student,
} from "../_shared/students";
import {
  getAttendance,
  getAttendanceVersion,
  ensureStudentAtdLoaded,
  subscribeAttendance,
  MIN_ATTENDANCE,
} from "../_shared/attendance";
import {
  getScoreFor,
  getScores,
  subscribeScores,
  SCORE_CATEGORIES,
  isCategoryApplicable,
} from "../_shared/scores";
import * as XLSX from "xlsx";

function downloadXLSX(
  filename: string,
  rows: (string | number)[][],
  sheetName: string,
) {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}

export default function ScoreClient() {
  const router = useRouter();
  useAcademic(); // subscribe so period labels re-render on master change/hydrate
  const [selection, setSelection] =
    useState<DrillDownSelection>(EMPTY_SELECTION);
  const students = useSyncExternalStore(
    subscribeStudents,
    getStudents,
    getStudents,
  );
  // subscribe to scores so submitted-status flips reactively
  useSyncExternalStore(subscribeScores, getScores, getScores);
  const enrollments = useEnrollments(); // schedules-derived; drives the roster
  // re-render when a period's attendance hydrates
  useSyncExternalStore(
    subscribeAttendance,
    getAttendanceVersion,
    getAttendanceVersion,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // load attendance for the selected period (get-student-atd)
  useEffect(() => {
    if (selection.periodId) {
      void ensureStudentAtdLoaded(Number(selection.periodId));
    }
  }, [selection.periodId]);

  const ready = selection.periodId && selection.dojang;

  const enrolled = useMemo<Student[]>(() => {
    if (!(selection.periodId && selection.dojang)) return [];
    return getEnrolledUsernamesByDojang(
      enrollments,
      selection.periodId,
      selection.dojang,
    )
      .map((u) => students.find((s) => s.username === u))
      .filter((s): s is Student => s !== undefined);
  }, [selection.periodId, selection.dojang, students, enrollments]);

  const period = selection.periodId ? getPeriodById(selection.periodId) : null;

  const headers = [
    "No",
    "Nama Lengkap",
    "Dojang",
    "Sabuk",
    "Periode",
    "Total Attendance",
    ...SCORE_CATEGORIES.map((c) => c.label),
  ];

  const handleDownloadTemplate = () => {
    if (!ready) return;
    const rows: (string | number)[][] = [headers];
    enrolled.forEach((s) => {
      rows.push([
        s.username,
        s.namaLengkap,
        s.dojang,
        s.sabuk,
        selection.periodId,
        getAttendance(s.username, selection.periodId),
        ...SCORE_CATEGORIES.map((c) =>
          isCategoryApplicable(c, s.sabuk) ? "" : "N/A",
        ),
      ]);
    });
    downloadXLSX(
      `score-template_${selection.dojang.replace(/\s+/g, "-")}_P${selection.periodId}.xlsx`,
      rows,
      "Template",
    );
  };

  const handleExport = () => {
    if (!ready) return;
    const rows: (string | number)[][] = [headers];
    enrolled.forEach((s) => {
      const score = getScoreFor(s.username, selection.periodId);
      rows.push([
        s.username,
        s.namaLengkap,
        s.dojang,
        s.sabuk,
        selection.periodId,
        getAttendance(s.username, selection.periodId),
        ...SCORE_CATEGORIES.map((c) => {
          if (!score) return "";
          if (!isCategoryApplicable(c, s.sabuk)) return "N/A";
          return score[c.key] ?? "";
        }),
      ]);
    });
    downloadXLSX(
      `scores_${selection.dojang.replace(/\s+/g, "-")}_P${selection.periodId}.xlsx`,
      rows,
      "Scores",
    );
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const firstSheetName = wb.SheetNames[0];
        const firstSheet = wb.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json<unknown[]>(firstSheet, {
          header: 1,
        });
        alert(
          `🚧 Import preview\n\nFile: ${file.name}\nSheet: ${firstSheetName}\nRows: ${rows.length}\n\nIn production this would validate each row against the current sub-program roster and show a confirmation table before applying. Backend integration required.`,
        );
      } catch (err) {
        alert(
          `Failed to read Excel file: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      <PageHeader title="Score Management" />
      <StudentDrillDown
        selection={selection}
        onChange={setSelection}
        hideProgram
      />

      {!ready ? (
        <div className="bg-paper rounded-sm border border-ink/10 p-12 text-center">
          <p className="text-muted uppercase tracking-widest text-xs font-bold">
            Pilih Period dan Dojang untuk melihat score
          </p>
        </div>
      ) : (
        <>
          {/* Bulk actions */}
          <div className="bg-paper rounded-sm border border-ink/10 p-4 mb-6 flex flex-wrap items-center gap-2">
            <div className="text-[11px] uppercase tracking-widest font-bold text-muted mr-2">
              Bulk via Excel:
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
            >
              <FileSpreadsheet size={14} /> Download Template
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download size={14} /> Export Scores
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={14} /> Import Excel
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleImportFile}
            />
          </div>

          <div className="bg-paper rounded-sm border border-ink/10 overflow-hidden">
            <div className="px-6 py-4 bg-paper-soft border-b border-ink/10">
              <div className="text-[11px] font-bold uppercase tracking-widest text-muted">
                Showing
              </div>
              <div className="text-ink font-display font-bold mt-1">
                {selection.dojang} ·{" "}
                {period ? formatPeriod(period) : selection.periodId}
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
                    <th className="text-left px-4 py-3.5 whitespace-nowrap">
                      Periode
                    </th>
                    <th className="text-right px-4 py-3.5 whitespace-nowrap">
                      Total Attendance
                    </th>
                    <th className="text-right px-4 py-3.5 whitespace-nowrap">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {enrolled.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center px-4 py-16 text-muted uppercase tracking-widest text-xs font-bold"
                      >
                        No students enrolled
                      </td>
                    </tr>
                  ) : (
                    enrolled.map((s) => {
                      const attendance = getAttendance(
                        s.username,
                        selection.periodId,
                      );
                      const score = getScoreFor(s.username, selection.periodId);
                      const submitted = score !== null;
                      const lowAttendance = attendance < MIN_ATTENDANCE;
                      return (
                        <tr
                          key={s.username}
                          className="border-b border-ink/5 hover:bg-paper-soft/50 transition-colors"
                        >
                          <td className="px-4 py-3 text-ink font-medium whitespace-nowrap">
                            {s.username}
                          </td>
                          <td className="px-4 py-3 text-ink whitespace-nowrap">
                            {s.namaLengkap}
                          </td>
                          <td className="px-4 py-3 text-ink whitespace-nowrap">
                            {s.dojang}
                          </td>
                          <td className="px-4 py-3 text-ink whitespace-nowrap">
                            {s.sabuk || "-"}
                          </td>
                          <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                            {selection.periodId}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <span
                              className={cn(
                                "font-display font-bold",
                                lowAttendance ? "text-brand" : "text-ink",
                              )}
                            >
                              {attendance}
                            </span>
                            <span className="text-muted text-xs ml-1">
                              / {MIN_ATTENDANCE}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            {submitted ? (
                              <button
                                onClick={() =>
                                  router.push(
                                    `/app/student/score/view/${s.username}/${selection.periodId}`,
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
                                    `/app/student/score/submit/${s.username}/${selection.periodId}`,
                                  )
                                }
                                className={cn(
                                  "inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm transition",
                                  "bg-accent text-accent-foreground hover:brightness-95",
                                )}
                              >
                                Submit Score
                                {lowAttendance && (
                                  <AlertCircle
                                    size={12}
                                    className="text-brand"
                                  />
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
        </>
      )}
    </>
  );
}
