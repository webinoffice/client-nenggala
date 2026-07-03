// src/app/app/(authenticated)/me/schedule/ScheduleClient.tsx
"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { AlertTriangle, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/session";
import {
  getSchedules,
  subscribeSchedules,
  getCurrentPeriod,
  DAYS_OF_WEEK,
} from "../../coach/_shared/schedules";
import {
  getProgramById,
  getSubProgramById,
  useAcademic,
} from "../../student/_shared/academic";
import {
  getAttendance,
  ensureStudentAtdLoaded,
  subscribeAttendance,
  getAttendanceVersion,
  MIN_ATTENDANCE,
} from "../../student/_shared/attendance";
import {
  ensureExamLoaded,
  getExamEligibility,
  getExamRegistrations,
  getExamVersion,
  subscribeExam,
  type ExamEligibility,
} from "../../student/_shared/exam";
import ExamRegistrationModal from "./ExamRegistrationModal";

export default function ScheduleClient() {
  const session = useSession();
  const username = session?.noReg ?? "";
  const userDataId = session?.userDataId ?? 0;
  useAcademic(); // subscribe so program names re-render on master change/hydrate

  const schedules = useSyncExternalStore(
    subscribeSchedules,
    getSchedules,
    getSchedules,
  );
  // Re-render when a period's attendance lands in the cache.
  useSyncExternalStore(
    subscribeAttendance,
    getAttendanceVersion,
    getAttendanceVersion,
  );
  // Re-render when the period's exam eligibility/registration lands in the cache.
  useSyncExternalStore(subscribeExam, getExamVersion, getExamVersion);

  // Every class this student is enrolled in (the store spans all periods)…
  const enrolled = useMemo(
    () => schedules.filter((s) => s.studentUsernames.includes(username)),
    [schedules, username],
  );
  // …scoped to the current period (derived from the enrolled classes' dates).
  const currentPeriod = useMemo(() => getCurrentPeriod(enrolled), [enrolled]);
  const periodId = currentPeriod?.id ?? 0;

  const mySchedules = useMemo(
    () =>
      enrolled
        .filter((s) => periodId !== 0 && s.schPeriodId === periodId)
        .sort(
          (a, b) =>
            DAYS_OF_WEEK.indexOf(a.dayOfWeek) -
            DAYS_OF_WEEK.indexOf(b.dayOfWeek),
        ),
    [enrolled, periodId],
  );

  // Self-scoped attendance + exam status for the current period.
  useEffect(() => {
    if (periodId !== 0) ensureStudentAtdLoaded(periodId);
    if (periodId !== 0 && userDataId !== 0) {
      ensureExamLoaded(periodId, userDataId);
    }
  }, [periodId, userDataId]);

  const eligibility = getExamEligibility(periodId);
  const registrations = getExamRegistrations(periodId);

  // Attendance summary grouped by program for this student
  const attendanceRows = useMemo(() => {
    const byProgram = new Map<
      number,
      { programId: number; subProgramId: number; count: number }
    >();
    mySchedules.forEach((s) => {
      const key = s.programId;
      const existing = byProgram.get(key);
      if (existing) return; // one row per program (figma shows program, not per-schedule)
      byProgram.set(key, {
        programId: s.programId,
        subProgramId: s.subProgramId,
        count: getAttendance(username, periodId),
      });
    });
    return Array.from(byProgram.values());
  }, [mySchedules, username, periodId]);

  const alertCount = attendanceRows.filter(
    (r) => r.count < MIN_ATTENDANCE,
  ).length;

  const [registering, setRegistering] = useState<ExamEligibility | null>(null);

  return (
    <>
      {/* CLASS SCHEDULE */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight text-ink">
            Class Schedule
          </h1>
          <span className="text-[11px] uppercase tracking-widest font-bold text-muted">
            {currentPeriod?.title ?? "—"}
          </span>
        </div>

        <div className="bg-paper rounded-sm border border-ink/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-ink/15 bg-paper-soft font-display text-[11px] font-bold uppercase tracking-widest text-ink/70">
                  <th className="text-left px-4 py-3.5">Day / Week</th>
                  <th className="text-left px-4 py-3.5">Class</th>
                  <th className="text-left px-4 py-3.5">Coach</th>
                  <th className="text-left px-4 py-3.5">Start Time</th>
                  <th className="text-left px-4 py-3.5">End Time</th>
                </tr>
              </thead>
              <tbody>
                {mySchedules.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center px-4 py-16 text-muted uppercase tracking-widest text-xs font-bold"
                    >
                      No classes enrolled this period
                    </td>
                  </tr>
                ) : (
                  mySchedules.map((s) => {
                    const program = getProgramById(s.programId);
                    return (
                      <tr
                        key={s.id}
                        className="border-b border-ink/5 hover:bg-paper-soft/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-ink font-medium">
                          {s.dayOfWeek}
                        </td>
                        <td className="px-4 py-3 text-ink">
                          {program?.name ?? s.programId}
                        </td>
                        <td className="px-4 py-3 text-ink/70">
                          {s.primaryCoachName || s.primaryCoachUsername}
                        </td>
                        <td className="px-4 py-3 text-ink/70">{s.startTime}</td>
                        <td className="px-4 py-3 text-ink/70">{s.endTime}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* YOUR ATTENDANCES */}
      <section>
        <h2 className="font-display text-xl md:text-2xl font-bold uppercase tracking-tight text-ink mb-2">
          Your Attendances
        </h2>
        {alertCount > 0 && (
          <div className="inline-flex items-center gap-2 text-brand text-sm mb-4">
            <AlertTriangle size={14} />
            <span>
              <span className="font-medium">Watchout!</span> You have{" "}
              <span className="font-bold">{alertCount} Alert Attendance</span>
              {alertCount > 1 ? "s" : ""}!!
            </span>
          </div>
        )}

        <div className="bg-paper rounded-sm border border-ink/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-ink/15 bg-paper-soft font-display text-[11px] font-bold uppercase tracking-widest text-ink/70">
                  <th className="text-left px-4 py-3.5">No</th>
                  <th className="text-left px-4 py-3.5">Class</th>
                  <th className="text-left px-4 py-3.5">Type</th>
                  <th className="text-right px-4 py-3.5">Attendance</th>
                  <th className="text-right px-4 py-3.5">Attendance %</th>
                  <th className="text-right px-4 py-3.5">Action</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center px-4 py-16 text-muted uppercase tracking-widest text-xs font-bold"
                    >
                      No attendance records
                    </td>
                  </tr>
                ) : (
                  attendanceRows.map((row, i) => {
                    const program = getProgramById(row.programId);
                    const subProgram = getSubProgramById(row.subProgramId);
                    const pct = Math.round((row.count / MIN_ATTENDANCE) * 100);
                    const low = row.count < MIN_ATTENDANCE;
                    const elig = eligibility.find(
                      (e) => e.programMsId === row.programId,
                    );
                    const reg = registrations.find(
                      (r) => r.programMsId === row.programId,
                    );
                    return (
                      <tr
                        key={row.programId}
                        className="border-b border-ink/5 hover:bg-paper-soft/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-ink font-medium">
                          {i + 1}
                        </td>
                        <td className="px-4 py-3 text-ink">
                          {program?.name ?? row.programId}
                        </td>
                        <td className="px-4 py-3 text-ink/70">
                          {subProgram?.name ?? row.subProgramId}
                        </td>
                        <td
                          className={cn(
                            "px-4 py-3 text-right font-display font-bold",
                            low ? "text-brand" : "text-ink",
                          )}
                        >
                          {row.count}x
                        </td>
                        <td
                          className={cn(
                            "px-4 py-3 text-right font-display font-bold",
                            low ? "text-brand" : "text-ink",
                          )}
                        >
                          {pct}%
                        </td>
                        <td className="px-4 py-3 text-right">
                          {elig ? (
                            <button
                              onClick={() => setRegistering(elig)}
                              className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm hover:brightness-95 transition"
                            >
                              <Award size={12} />
                              Ikut Ujian
                            </button>
                          ) : reg ? (
                            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-emerald-700 font-bold">
                              Sudah Terdaftar
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase tracking-widest text-muted font-bold">
                              —
                            </span>
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
        <p className="text-[11px] text-muted mt-2 italic">
          The &ldquo;Ikut Ujian&rdquo; button registers you for this period&rsquo;s
          grading exam. Low attendance does not block registration, but admin will
          review it.
        </p>
      </section>

      <ExamRegistrationModal
        eligibility={registering}
        schPeriodId={periodId}
        onClose={() => setRegistering(null)}
      />
    </>
  );
}
