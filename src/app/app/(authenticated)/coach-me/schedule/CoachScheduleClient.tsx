// src/app/app/(authenticated)/coach-me/schedule/CoachScheduleClient.tsx
"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Users, ClipboardCheck } from "lucide-react";
import { getCurrentUsername } from "@/lib/current-user";
import {
  getSchedules,
  subscribeSchedules,
  DAYS_OF_WEEK,
  type Schedule,
} from "../../coach/_shared/schedules";
import { getCoaches, subscribeCoaches } from "../../coach/_shared/coaches";
import { getStudents, subscribeStudents } from "../../student/_shared/students";
import {
  getProgramById,
  getSubProgramById,
  useAcademic,
} from "../../student/_shared/academic";
import ClassListModal from "./ClassListModal";
import SubmitAttendanceModal from "./SubmitAttendanceModal";

const CURRENT_PERIOD = "32";

export default function CoachScheduleClient() {
  const username = getCurrentUsername();
  useAcademic(); // subscribe so program names re-render on master change/hydrate

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
  const students = useSyncExternalStore(
    subscribeStudents,
    getStudents,
    getStudents,
  );

  // Lookup maps
  const coachByUsername = useMemo(
    () => new Map(coaches.map((c) => [c.username, c])),
    [coaches],
  );
  const studentByUsername = useMemo(
    () => new Map(students.map((s) => [s.username, s])),
    [students],
  );

  // Schedules where this coach is involved (primary or additional).
  // TODO(me-view-pass): scope to the coach's current period via
  // get-instructor-schedule; the store now spans all periods.
  const mySchedules = useMemo(
    () =>
      schedules
        .filter(
          (s) =>
            s.primaryCoachUsername === username ||
            s.secondaryCoachUsernames.includes(username) ||
            s.assistantUsernames.includes(username),
        )
        .sort(
          (a, b) =>
            DAYS_OF_WEEK.indexOf(a.dayOfWeek) -
            DAYS_OF_WEEK.indexOf(b.dayOfWeek),
        ),
    [schedules, username],
  );

  const [viewingClass, setViewingClass] = useState<Schedule | null>(null);
  const [submitting, setSubmitting] = useState<Schedule | null>(null);

  return (
    <>
      <h1 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight text-ink mb-2">
        Coaching Schedule
      </h1>
      <p className="text-sm text-muted mb-8">
        Period {CURRENT_PERIOD} · Your weekly classes & attendance submissions.
      </p>

      <div className="bg-paper rounded-sm border border-ink/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-ink/15 bg-paper-soft font-display text-[11px] font-bold uppercase tracking-widest text-ink/70">
                <th className="text-left px-4 py-3.5">Day / Week</th>
                <th className="text-left px-4 py-3.5">Class</th>
                <th className="text-left px-4 py-3.5">Type</th>
                <th className="text-left px-4 py-3.5">Member List</th>
                <th className="text-left px-4 py-3.5">Attendance</th>
                <th className="text-left px-4 py-3.5">Start Time</th>
                <th className="text-left px-4 py-3.5">End Time</th>
              </tr>
            </thead>
            <tbody>
              {mySchedules.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center px-4 py-16 text-muted uppercase tracking-widest text-xs font-bold"
                  >
                    No classes assigned this period
                  </td>
                </tr>
              ) : (
                mySchedules.map((s) => {
                  const program = getProgramById(s.programId);
                  const subProgram = getSubProgramById(s.subProgramId);
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-ink/5 last:border-b-0 hover:bg-paper-soft/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-ink font-medium whitespace-nowrap">
                        {s.dayOfWeek}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {program?.name ?? s.programId}
                      </td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                        {subProgram?.name ?? s.subProgramId}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={() => setViewingClass(s)}
                          className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm hover:brightness-95 transition"
                        >
                          <Users size={12} />
                          View ({s.studentUsernames.length})
                        </button>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={() => setSubmitting(s)}
                          className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm transition bg-emerald-500 text-white hover:brightness-95"
                        >
                          <ClipboardCheck size={12} />
                          Submit
                        </button>
                      </td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                        {s.startTime}
                      </td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                        {s.endTime}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ClassListModal
        schedule={viewingClass}
        onClose={() => setViewingClass(null)}
        coachByUsername={coachByUsername}
        studentByUsername={studentByUsername}
      />

      <SubmitAttendanceModal
        schedule={submitting}
        onClose={() => setSubmitting(null)}
      />
    </>
  );
}
