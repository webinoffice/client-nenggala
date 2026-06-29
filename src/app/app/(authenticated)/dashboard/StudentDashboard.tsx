// src/app/app/(authenticated)/dashboard/StudentDashboard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { Bell, ArrowUpRight } from "lucide-react";
import { useSession } from "@/lib/session";
import { useEvents, formatEventDate } from "@/lib/events";
import { getStudents, subscribeStudents } from "../student/_shared/students";
import { resultLabel } from "../student/_shared/scores";
import {
  getSchedules,
  subscribeSchedules,
  getCurrentPeriod,
} from "../coach/_shared/schedules";
import {
  ensureExamLoaded,
  getExamRegistrations,
  getExamVersion,
  subscribeExam,
} from "../student/_shared/exam";
import { cn } from "@/lib/utils";
import StudentExamCard from "./StudentExamCard";

function formatJoinedDate(iso: string) {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export default function StudentDashboard() {
  const session = useSession();
  const username = session?.noReg ?? "";
  const userDataId = session?.userDataId ?? 0;

  const students = useSyncExternalStore(
    subscribeStudents,
    getStudents,
    getStudents,
  );
  const schedules = useSyncExternalStore(
    subscribeSchedules,
    getSchedules,
    getSchedules,
  );
  useSyncExternalStore(subscribeExam, getExamVersion, getExamVersion);
  const events = useEvents();

  // Current period (from the student's own classes) → this period's exam score.
  const enrolled = useMemo(
    () => schedules.filter((s) => s.studentUsernames.includes(username)),
    [schedules, username],
  );
  const currentPeriod = useMemo(() => getCurrentPeriod(enrolled), [enrolled]);
  const periodId = currentPeriod?.id ?? 0;

  useEffect(() => {
    if (periodId !== 0 && userDataId !== 0) {
      ensureExamLoaded(periodId, userDataId);
    }
  }, [periodId, userDataId]);

  const registrations = getExamRegistrations(periodId);
  const lastScore = registrations.find((r) => r.assessed) ?? null;
  const lastResult = lastScore
    ? resultLabel(lastScore.totalScore, lastScore.beltMasterId)
    : "—";

  const student = students.find((s) => s.username === username);

  if (!student) {
    return (
      <div className="bg-paper rounded-sm border border-ink/10 p-10 text-center">
        <p className="text-muted text-sm">
          Could not load your profile. Please contact admin.
        </p>
      </div>
    );
  }

  // Show the 4 most recent active events
  const recentEvents = events
    .filter((e) => e.status === "Active")
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight text-ink">
          Welcome, {student.panggilan || student.namaLengkap}
        </h1>
        <p className="text-sm text-muted mt-1">
          You are very disciplined! Keep training, keep growing.
        </p>
      </div>

      {/* Profile + Last Score card */}
      <section className="bg-paper rounded-sm border border-ink/10 p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-6 md:gap-8 items-center">
          {/* Avatar */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative h-28 w-28 md:h-32 md:w-32 rounded-sm overflow-hidden bg-paper-soft border border-ink/10">
              <Image
                src="/images/coach-1.jpg"
                alt={student.namaLengkap}
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
          </div>

          {/* Info */}
          <div className="space-y-2">
            <InfoRow label="Name" value={student.namaLengkap} />
            <InfoRow
              label="Joined Since"
              value={formatJoinedDate(student.mulaiLatihan)}
            />
            <InfoRow label="Club" value={student.dojang} />
            <InfoRow label="Level" value={student.sabuk || "-"} />
            <InfoRow
              label="Motivation"
              value="I want to be a Champion"
              valueClassName="italic text-ink/80"
            />
          </div>

          {/* Last score */}
          <div className="border-t lg:border-t-0 lg:border-l border-ink/10 pt-6 lg:pt-0 lg:pl-8">
            <div className="text-center min-w-[180px]">
              <p className="font-display text-[11px] font-bold uppercase tracking-widest text-muted">
                Your Last Score
              </p>
              {lastScore ? (
                <>
                  <p className="font-display text-5xl font-bold text-ink mt-2 leading-none">
                    {lastScore.totalScore.toFixed(1)}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-muted mt-2">
                    {currentPeriod?.title ?? "—"}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-ink/70 mt-3 font-bold">
                    {lastScore.beltName}
                  </p>
                  <p
                    className={cn(
                      "mt-3 inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm",
                      lastResult === "Lulus"
                        ? "bg-emerald-500/10 text-emerald-700"
                        : lastResult === "Tidak Lulus"
                          ? "bg-brand/10 text-brand"
                          : "bg-paper-soft text-muted",
                    )}
                  >
                    {lastResult}
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted mt-4 italic">
                  No score submitted yet
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Exam registration (Ikut Ujian) */}
      <StudentExamCard />

      {/* Events */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Bell size={18} className="text-ink" />
          <h2 className="font-display text-xl font-bold uppercase tracking-widest text-ink">
            Event
          </h2>
        </div>

        <div className="space-y-3">
          {recentEvents.map((event) => (
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

function InfoRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="grid grid-cols-[110px_auto_1fr] gap-2 items-baseline text-sm">
      <span className="font-display text-[11px] font-bold uppercase tracking-widest text-muted">
        {label}
      </span>
      <span className="text-muted">:</span>
      <span className={cn("text-ink", valueClassName)}>{value}</span>
    </div>
  );
}
