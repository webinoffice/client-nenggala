// src/app/app/(authenticated)/coach-me/report/CoachReportClient.tsx
"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Search } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useRole } from "@/lib/role-context";
import { getCurrentUsername } from "@/lib/current-user";
import {
  getSchedules,
  subscribeSchedules,
} from "../../coach/_shared/schedules";
import {
  getSessionAttendance,
  subscribeSessionAttendance,
} from "../../coach/_shared/session-attendance";
import {
  getProgramById,
  getSubProgramById,
} from "../../student/_shared/academic";

const CURRENT_PERIOD = "32";

export default function CoachReportClient() {
  const { role } = useRole();
  const username = getCurrentUsername(role);

  const schedules = useSyncExternalStore(
    subscribeSchedules,
    getSchedules,
    getSchedules,
  );
  const records = useSyncExternalStore(
    subscribeSessionAttendance,
    getSessionAttendance,
    getSessionAttendance,
  );

  const scheduleById = useMemo(
    () => new Map(schedules.map((s) => [s.id, s])),
    [schedules],
  );

  const [scheduleFilter, setScheduleFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("");
  const [applied, setApplied] = useState({
    scheduleId: "All",
    month: "",
  });

  const mySchedules = useMemo(
    () =>
      schedules.filter(
        (s) =>
          s.periodId === CURRENT_PERIOD &&
          (s.primaryCoachUsername === username ||
            s.secondaryCoachUsernames.includes(username) ||
            s.assistantUsernames.includes(username)),
      ),
    [schedules, username],
  );

  const filtered = useMemo(() => {
    return records
      .filter((r) => r.coachUsername === username)
      .filter((r) => {
        if (applied.scheduleId !== "All" && r.scheduleId !== applied.scheduleId)
          return false;
        if (applied.month && !r.date.startsWith(applied.month)) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [records, username, applied]);

  const totalSessions = filtered.length;
  const totalStudentMarks = filtered.reduce(
    (sum, r) => sum + r.attendingStudentUsernames.length,
    0,
  );

  return (
    <>
      <h1 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight text-ink mb-2">
        Attendance Report
      </h1>
      <p className="text-sm text-muted mb-8">
        Sessions you&apos;ve submitted attendance for.
      </p>

      {/* Filters */}
      <div className="bg-paper rounded-sm border border-ink/10 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
          <Select
            label="Class"
            value={scheduleFilter}
            onChange={(e) => setScheduleFilter(e.target.value)}
          >
            <option value="All">All Classes</option>
            {mySchedules.map((s) => {
              const program = getProgramById(s.programId);
              return (
                <option key={s.id} value={s.id}>
                  {s.dayOfWeek} · {program?.name ?? s.programId}
                </option>
              );
            })}
          </Select>
          <Input
            label="Month"
            type="month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-end gap-2 mt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setScheduleFilter("All");
              setMonthFilter("");
              setApplied({ scheduleId: "All", month: "" });
            }}
          >
            Reset
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              setApplied({ scheduleId: scheduleFilter, month: monthFilter })
            }
          >
            <Search size={16} />
            Search
          </Button>
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
        <div className="bg-paper rounded-sm border border-ink/10 p-4">
          <div className="text-[11px] font-bold uppercase tracking-widest text-muted">
            Sessions Submitted
          </div>
          <div className="mt-2 font-display text-2xl md:text-3xl font-bold text-ink leading-none">
            {totalSessions}
          </div>
        </div>
        <div className="bg-paper rounded-sm border border-ink/10 p-4">
          <div className="text-[11px] font-bold uppercase tracking-widest text-muted">
            Student Check-ins
          </div>
          <div className="mt-2 font-display text-2xl md:text-3xl font-bold text-ink leading-none">
            {totalStudentMarks}
          </div>
        </div>
      </div>

      {/* Records table */}
      <div className="bg-paper rounded-sm border border-ink/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-ink/15 bg-paper-soft font-display text-[11px] font-bold uppercase tracking-widest text-ink/70">
                <th className="text-left px-4 py-3.5">Date</th>
                <th className="text-left px-4 py-3.5">Class</th>
                <th className="text-left px-4 py-3.5">Type</th>
                <th className="text-right px-4 py-3.5">Present</th>
                <th className="text-left px-4 py-3.5">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center px-4 py-16 text-muted uppercase tracking-widest text-xs font-bold"
                  >
                    No submissions found
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const s = scheduleById.get(r.scheduleId);
                  const program = s ? getProgramById(s.programId) : null;
                  const subProgram = s
                    ? getSubProgramById(s.subProgramId)
                    : null;
                  const totalEnrolled = s?.studentUsernames.length ?? 0;
                  return (
                    <tr
                      key={r.id}
                      className="border-b border-ink/5 last:border-b-0 hover:bg-paper-soft/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-ink font-medium whitespace-nowrap">
                        {r.date}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {program?.name ?? s?.programId ?? r.scheduleId}
                      </td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                        {subProgram?.name ?? s?.subProgramId ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-right text-ink font-display font-bold whitespace-nowrap">
                        {r.attendingStudentUsernames.length}
                        <span className="text-muted text-xs font-normal">
                          {" "}
                          / {totalEnrolled}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink/60 text-xs whitespace-nowrap">
                        {new Date(r.submitDate).toLocaleString("id-ID")}
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
  );
}
