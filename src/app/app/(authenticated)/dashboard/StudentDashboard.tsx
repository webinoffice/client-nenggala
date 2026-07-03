// src/app/app/(authenticated)/dashboard/StudentDashboard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, ArrowUpRight } from "lucide-react";
import { useEvents, formatEventDate } from "@/lib/events";
import { useBelts } from "../master/_shared/belts";
import { passPercentage, resultLabel } from "../student/_shared/scores";
import {
  fetchStudentDashboard,
  type StudentDashboardData,
} from "@/lib/api/dashboard";
import { cn } from "@/lib/utils";
import StudentExamCard from "./StudentExamCard";
import JointTrainingHighlight from "../joint-training/_shared/JointTrainingHighlight";
import UploadedImage from "@/components/app/UploadedImage";

export default function StudentDashboard() {
  const events = useEvents();
  // Belts hydrate the pass-score lookup that resultLabel() reads; subscribing
  // re-renders the last-score badge once the belt master lands.
  useBelts();

  // The student's own profile + last exam score come from the student-scoped
  // dashboard endpoint (get-user-data is admin-only and 403s for a student).
  const [profile, setProfile] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchStudentDashboard()
      .then((data) => {
        if (alive) setProfile(data);
      })
      .catch(() => {
        if (alive) setFailed(true);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const hasScore = (profile?.LastScore ?? 0) > 0;
  const lastResult = profile
    ? resultLabel(profile.LastScore, profile.MaxScore, profile.BeltMasterId)
    : "—";
  // Headline score is normalised to 0–100 (curr / max × 100), matching the pass
  // threshold; falls back to the raw total if the max is unknown.
  const lastScoreDisplay = profile
    ? passPercentage(profile.LastScore, profile.MaxScore) ?? profile.LastScore
    : 0;

  if (loading) {
    return (
      <div className="bg-paper rounded-sm border border-ink/10 p-10 text-center">
        <p className="text-muted text-sm uppercase tracking-widest font-bold">
          Loading…
        </p>
      </div>
    );
  }

  if (failed || !profile) {
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
          Welcome, {profile.UserName}
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
                alt={profile.UserName}
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
          </div>

          {/* Info */}
          <div className="space-y-2">
            <InfoRow label="Name" value={profile.UserName} />
            <InfoRow label="No. Reg" value={profile.UserNoId} />
            <InfoRow label="Club" value={profile.DojangName || "-"} />
            <InfoRow label="Level" value={profile.BeltName || "-"} />
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
              {hasScore ? (
                <>
                  <p className="font-display text-5xl font-bold text-ink mt-2 leading-none">
                    {lastScoreDisplay.toFixed(1)}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-muted mt-2">
                    {profile.PeriodTitle ?? "—"}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest text-ink/70 mt-3 font-bold">
                    {profile.BeltName}
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
                <UploadedImage
                  src={event.image}
                  alt={event.title}
                  className="absolute inset-0 h-full w-full object-cover"
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

      <JointTrainingHighlight />
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
