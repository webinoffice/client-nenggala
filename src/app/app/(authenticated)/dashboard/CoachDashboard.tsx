// src/app/app/(authenticated)/dashboard/CoachDashboard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { ArrowRight, ArrowUpRight, Bell } from "lucide-react";
import { getCurrentUsername } from "@/lib/current-user";
import { useEvents, formatEventDate } from "@/lib/events";
import {
  getSchedules,
  subscribeSchedules,
  DAYS_OF_WEEK,
} from "../coach/_shared/schedules";
import { getCoaches, subscribeCoaches } from "../coach/_shared/coaches";
import {
  getProgramById,
  getSubProgramById,
  useAcademic,
} from "../student/_shared/academic";

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

  const coach = coaches.find((c) => c.username === username);

  const events = useEvents();

  // All active events, most recent first
  const allEvents = useMemo(
    () =>
      events
        .filter((e) => e.status === "Active")
        .sort((a, b) => b.date.localeCompare(a.date)),
    [events],
  );

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

      {/* Events */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Bell size={18} className="text-ink" />
          <h2 className="font-display text-xl font-bold uppercase tracking-widest text-ink">
            Event
          </h2>
        </div>

        <div className="space-y-3">
          {allEvents.map((event) => (
            <article
              key={event.id}
              className="bg-paper rounded-sm border border-ink/10 p-4 grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4 hover:border-ink/30 transition-colors"
            >
              <div className="relative aspect-[4/3] sm:aspect-auto overflow-hidden rounded-sm bg-ink">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover"
                  sizes="160px"
                />
              </div>
              <div className="min-w-0">
                <Link
                  href={`https://${event.registerUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display text-base font-bold uppercase tracking-wide text-ink underline underline-offset-4 hover:text-brand transition-colors inline-flex items-center gap-1.5"
                >
                  {event.title}
                  <ArrowUpRight size={14} />
                </Link>
                <p className="text-xs text-ink/70 mt-1">
                  {formatEventDate(event.date)}
                </p>
                <p className="text-sm text-ink/80 mt-2 line-clamp-2">
                  {event.description}
                </p>
                <p className="text-xs mt-2">
                  <span className="text-muted">Daftar disini: </span>
                  <a
                    href={`https://${event.registerUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand underline underline-offset-4 hover:text-brand-hover"
                  >
                    {event.registerUrl}
                  </a>
                </p>
              </div>
            </article>
          ))}
        </div>
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
