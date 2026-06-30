// src/app/app/(authenticated)/joint-training/_shared/JointTrainingHighlight.tsx
"use client";

import { useState, useSyncExternalStore } from "react";
import { Users, Clock, CalendarDays } from "lucide-react";
import { fileUrl } from "@/lib/api/file-url";
import JointTrainingAttendanceModal from "../JointTrainingAttendanceModal";
import {
  getFeaturedJointTraining,
  subscribeJointTrainings,
} from "./joint-training";

/**
 * The single featured Latihan Gabungan, shown on the student / coach / admin
 * dashboards. Attendees are viewable by everyone (read-only here — recording
 * happens on the super-admin management page). Renders nothing when no event
 * exists at all.
 */
export default function JointTrainingHighlight() {
  const featured = useSyncExternalStore(
    subscribeJointTrainings,
    getFeaturedJointTraining,
    getFeaturedJointTraining,
  );
  const [viewing, setViewing] = useState(false);

  if (!featured) return null;

  const img = featured.ScheduleImage ? fileUrl(featured.ScheduleImage) : "";

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Users size={18} className="text-ink" />
        <h2 className="font-display text-xl font-bold uppercase tracking-widest text-ink">
          Latihan Gabungan
        </h2>
      </div>

      <article className="bg-paper rounded-sm border border-ink/10 overflow-hidden grid grid-cols-1 sm:grid-cols-[200px_1fr]">
        <div className="relative aspect-[4/3] sm:aspect-auto bg-ink/5">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img}
              alt={featured.ScheduleTitle ?? ""}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted">
              <Users size={40} />
            </div>
          )}
        </div>
        <div className="p-5 min-w-0">
          <h3 className="font-display text-lg font-bold uppercase tracking-wide text-ink">
            {featured.ScheduleTitle}
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-ink/70">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} />
              {featured.ScheduleDateStr}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={14} />
              {featured.TimeStart}–{featured.TimeEnd}
            </span>
          </div>
          {featured.ScheduleDesc && (
            <p className="text-sm text-ink/80 mt-3 line-clamp-3">
              {featured.ScheduleDesc}
            </p>
          )}
          <button
            onClick={() => setViewing(true)}
            className="mt-4 inline-flex items-center gap-1.5 bg-ink text-paper text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm hover:bg-ink-soft transition"
          >
            <Users size={12} />
            Lihat Peserta
          </button>
        </div>
      </article>

      <JointTrainingAttendanceModal
        event={viewing ? featured : null}
        editable={false}
        onClose={() => setViewing(false)}
      />
    </section>
  );
}
