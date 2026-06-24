// src/app/app/(authenticated)/me/schedule/ScheduleClient.tsx
"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { AlertTriangle, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/role-context";
import { getCurrentUsername } from "@/lib/current-user";
import {
  getSchedules,
  subscribeSchedules,
  DAYS_OF_WEEK,
  type Schedule,
} from "../../coach/_shared/schedules";
import { getCoaches, subscribeCoaches } from "../../coach/_shared/coaches";
import {
  getProgramById,
  getSubProgramById,
} from "../../student/_shared/academic";
import {
  getAttendance,
  MIN_ATTENDANCE,
} from "../../student/_shared/attendance";
import ExamRegistrationModal from "./ExamRegistrationModal";

const CURRENT_PERIOD = "32";

export default function ScheduleClient() {
  const { role } = useRole();
  const username = getCurrentUsername(role);

  const schedules = useSyncExternalStore(
    subscribeSchedules,
    getSchedules,
    getSchedules,
  );
  const coaches = useSyncExternalStore(
    subscribeCoaches,
    getCoaches,
    getCoaches,
  );

  const coachByUsername = useMemo(
    () => new Map(coaches.map((c) => [c.username, c])),
    [coaches],
  );

  // Schedules this student is enrolled in (current period only)
  const mySchedules = useMemo(
    () =>
      schedules
        .filter(
          (s) =>
            s.studentUsernames.includes(username) &&
            s.periodId === CURRENT_PERIOD &&
            s.status === "Active",
        )
        .sort(
          (a, b) =>
            DAYS_OF_WEEK.indexOf(a.dayOfWeek) -
            DAYS_OF_WEEK.indexOf(b.dayOfWeek),
        ),
    [schedules, username],
  );

  // Attendance summary grouped by program for this student
  const attendanceRows = useMemo(() => {
    const byProgram = new Map<
      string,
      { programId: string; subProgramId: string; count: number }
    >();
    mySchedules.forEach((s) => {
      const key = s.programId;
      const existing = byProgram.get(key);
      if (existing) return; // one row per program (figma shows program, not per-schedule)
      byProgram.set(key, {
        programId: s.programId,
        subProgramId: s.subProgramId,
        count: getAttendance(username, CURRENT_PERIOD),
      });
    });
    return Array.from(byProgram.values());
  }, [mySchedules, username]);

  const alertCount = attendanceRows.filter(
    (r) => r.count < MIN_ATTENDANCE,
  ).length;

  const [registering, setRegistering] = useState<Schedule | null>(null);

  return (
    <>
      {/* CLASS SCHEDULE */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight text-ink">
            Class Schedule
          </h1>
          <span className="text-[11px] uppercase tracking-widest font-bold text-muted">
            Period {CURRENT_PERIOD}
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
                    const coach = coachByUsername.get(s.primaryCoachUsername);
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
                          {coach?.namaLengkap ?? s.primaryCoachUsername}
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
                    const schedule = mySchedules.find(
                      (s) => s.programId === row.programId,
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
                          {!low && schedule ? (
                            <button
                              onClick={() => setRegistering(schedule)}
                              className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm hover:brightness-95 transition"
                            >
                              <Award size={12} />
                              Ikut Ujian
                            </button>
                          ) : (
                            <span className="text-[10px] uppercase tracking-widest text-muted font-bold">
                              Not Eligible
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
          The &ldquo;Ikut Ujian&rdquo; button appears for classes where you meet
          the minimum attendance requirement.
        </p>
      </section>

      <ExamRegistrationModal
        schedule={registering}
        onClose={() => setRegistering(null)}
      />
    </>
  );
}
