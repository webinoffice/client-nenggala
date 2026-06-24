// src/app/app/(authenticated)/student/attendance/AttendanceClient.tsx
"use client";

import { useState, useSyncExternalStore } from "react";
import PageHeader from "@/components/app/PageHeader";
import StudentDrillDown, {
  EMPTY_SELECTION,
  type DrillDownSelection,
} from "../_shared/StudentDrillDown";
import {
  formatPeriod,
  getEnrolledUsernames,
  getPeriodById,
  getSubProgramById,
} from "../_shared/academic";
import {
  getStudents,
  subscribeStudents,
  type Student,
} from "../_shared/students";
import { getAttendance, MIN_ATTENDANCE } from "../_shared/attendance";
import { cn } from "@/lib/utils";

export default function AttendanceClient() {
  const [selection, setSelection] =
    useState<DrillDownSelection>(EMPTY_SELECTION);
  const students = useSyncExternalStore(
    subscribeStudents,
    getStudents,
    getStudents,
  );

  const ready =
    selection.periodId &&
    selection.dojang &&
    selection.programId &&
    selection.subProgramId;

  const enrolled: Student[] = ready
    ? getEnrolledUsernames(
        selection.periodId,
        selection.dojang,
        selection.subProgramId,
      )
        .map((u) => students.find((s) => s.username === u))
        .filter((s): s is Student => s !== undefined)
    : [];

  const period = selection.periodId ? getPeriodById(selection.periodId) : null;
  const subProgram = selection.subProgramId
    ? getSubProgramById(selection.subProgramId)
    : null;

  return (
    <>
      <PageHeader title="Attendance Report" />
      <StudentDrillDown selection={selection} onChange={setSelection} />

      {!ready ? (
        <div className="bg-paper rounded-sm border border-ink/10 p-12 text-center">
          <p className="text-muted uppercase tracking-widest text-xs font-bold">
            Pilih Period, Dojang, Program, dan Sub Program untuk melihat
            attendance
          </p>
        </div>
      ) : (
        <div className="bg-paper rounded-sm border border-ink/10 overflow-hidden">
          <div className="px-6 py-4 bg-paper-soft border-b border-ink/10">
            <div className="text-[11px] font-bold uppercase tracking-widest text-muted">
              Showing
            </div>
            <div className="text-ink font-display font-bold mt-1">
              {selection.dojang} ·{" "}
              {period ? formatPeriod(period) : selection.periodId} ·{" "}
              {subProgram?.name ?? selection.subProgramId}
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
                    Attendance
                  </th>
                </tr>
              </thead>
              <tbody>
                {enrolled.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center px-4 py-16 text-muted uppercase tracking-widest text-xs font-bold"
                    >
                      No students enrolled
                    </td>
                  </tr>
                ) : (
                  enrolled.map((s) => {
                    const count = getAttendance(s.username, selection.periodId);
                    const isLow = count < MIN_ATTENDANCE;
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
                              isLow ? "text-brand" : "text-ink",
                            )}
                          >
                            {count}
                          </span>
                          <span className="text-muted text-xs ml-1">
                            / {MIN_ATTENDANCE}
                          </span>
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
    </>
  );
}
