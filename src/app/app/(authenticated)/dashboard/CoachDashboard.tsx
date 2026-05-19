// src/app/app/(authenticated)/dashboard/CoachDashboard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { Users, CalendarDays, ClipboardCheck, ArrowRight } from "lucide-react";
import { useRole } from "@/lib/role-context";
import { getCurrentUsername } from "@/lib/current-user";
import {
  getSchedules,
  subscribeSchedules,
  DAYS_OF_WEEK,
} from "../coach/_shared/schedules";
import { getCoaches, subscribeCoaches } from "../coach/_shared/coaches";
import {
  getSessionAttendance,
  subscribeSessionAttendance,
} from "../coach/_shared/session-attendance";
import { getProgramById, getSubProgramById } from "../student/_shared/academic";

const CURRENT_PERIOD = "32";

function formatJoinedDate(iso: string) {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export default function CoachDashboard() {
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
  const sessionAttendance = useSyncExternalStore(
    subscribeSessionAttendance,
    getSessionAttendance,
    getSessionAttendance,
  );

  const coach = coaches.find((c) => c.username === username);

  // Schedules where this coach is primary or secondary (current period)
  const mySchedules = useMemo(
    () =>
      schedules
        .filter(
          (s) =>
            s.periodId === CURRENT_PERIOD &&
            s.status === "Active" &&
            (s.primaryCoachUsername === username ||
              s.secondaryCoachUsernames.includes(username)),
        )
        .sort(
          (a, b) =>
            DAYS_OF_WEEK.indexOf(a.dayOfWeek) -
            DAYS_OF_WEEK.indexOf(b.dayOfWeek),
        ),
    [schedules, username],
  );

  // Unique students under this coach
  const totalStudents = useMemo(() => {
    const set = new Set<string>();
    mySchedules.forEach((s) => s.studentUsernames.forEach((u) => set.add(u)));
    return set.size;
  }, [mySchedules]);

  // Submissions by this coach
  const mySubmissions = useMemo(
    () => sessionAttendance.filter((r) => r.coachUsername === username),
    [sessionAttendance, username],
  );

  if (!coach) {
    return (
      <div className="bg-paper rounded-sm border border-ink/10 p-10 text-center">
        <p className="text-muted text-sm">
          Could not load your profile. Please contact admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight text-ink">
          Welcome, {coach.panggilan || coach.namaLengkap}
        </h1>
        <p className="text-sm text-muted mt-1">
          Period {CURRENT_PERIOD} · Let&apos;s shape the next champions.
        </p>
      </div>

      {/* Profile card */}
      <section className="bg-paper rounded-sm border border-ink/10 p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 md:gap-8 items-center">
          <div className="flex justify-center lg:justify-start">
            <div className="relative h-28 w-28 md:h-32 md:w-32 rounded-sm overflow-hidden bg-paper-soft border border-ink/10">
              <Image
                src="/images/coach-1.jpg"
                alt={coach.namaLengkap}
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
          </div>
          <div className="space-y-2">
            <InfoRow label="Name" value={coach.namaLengkap} />
            <InfoRow
              label="Joined Since"
              value={formatJoinedDate(coach.mulaiLatihan)}
            />
            <InfoRow label="Dojang" value={coach.dojang} />
            <InfoRow label="Level" value={coach.sabuk} />
            <InfoRow label="Phone" value={coach.noHandphone2 || "-"} />
          </div>
        </div>
      </section>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <StatCard
          icon={<CalendarDays size={18} />}
          label="Classes This Week"
          value={String(mySchedules.length)}
        />
        <StatCard
          icon={<Users size={18} />}
          label="Total Students"
          value={String(totalStudents)}
        />
        <StatCard
          icon={<ClipboardCheck size={18} />}
          label="Attendance Submitted"
          value={String(mySubmissions.length)}
        />
      </div>

      {/* Today's schedule preview */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold uppercase tracking-widest text-ink">
            Your Schedule
          </h2>
          <Link
            href="/app/coach-me/schedule"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand hover:text-brand-hover transition-colors"
          >
            View All
            <ArrowRight size={14} />
          </Link>
        </div>

        {mySchedules.length === 0 ? (
          <div className="bg-paper rounded-sm border border-ink/10 p-12 text-center text-sm text-muted uppercase tracking-widest font-bold">
            No classes assigned this period
          </div>
        ) : (
          <div className="bg-paper rounded-sm border border-ink/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-ink/15 bg-paper-soft font-display text-[11px] font-bold uppercase tracking-widest text-ink/70">
                  <th className="text-left px-4 py-3.5">Day</th>
                  <th className="text-left px-4 py-3.5">Class</th>
                  <th className="text-left px-4 py-3.5">Type</th>
                  <th className="text-left px-4 py-3.5">Time</th>
                  <th className="text-right px-4 py-3.5">Students</th>
                </tr>
              </thead>
              <tbody>
                {mySchedules.slice(0, 5).map((s) => {
                  const program = getProgramById(s.programId);
                  const subProgram = getSubProgramById(s.subProgramId);
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-ink/5 last:border-b-0 hover:bg-paper-soft/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-ink font-medium">
                        {s.dayOfWeek}
                      </td>
                      <td className="px-4 py-3 text-ink">
                        {program?.name ?? s.programId}
                      </td>
                      <td className="px-4 py-3 text-ink/70">
                        {subProgram?.name ?? s.subProgramId}
                      </td>
                      <td className="px-4 py-3 text-ink/70">
                        {s.startTime} – {s.endTime}
                      </td>
                      <td className="px-4 py-3 text-right text-ink">
                        {s.studentUsernames.length}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[110px_auto_1fr] gap-2 items-baseline text-sm">
      <span className="font-display text-[11px] font-bold uppercase tracking-widest text-muted">
        {label}
      </span>
      <span className="text-muted">:</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-paper rounded-sm border border-ink/10 p-4">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted">
        {icon}
        {label}
      </div>
      <div className="mt-2 font-display text-2xl md:text-3xl font-bold text-ink leading-none">
        {value}
      </div>
    </div>
  );
}
