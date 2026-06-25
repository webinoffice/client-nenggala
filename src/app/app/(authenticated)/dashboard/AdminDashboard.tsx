// src/app/app/(authenticated)/dashboard/AdminDashboard.tsx
"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Users, GraduationCap, CalendarCheck } from "lucide-react";
import { getCurrentDisplayName } from "@/lib/current-user";
import { getStudents, subscribeStudents } from "../student/_shared/students";
import { getCoaches, subscribeCoaches } from "../coach/_shared/coaches";
import { getSchedules, subscribeSchedules } from "../coach/_shared/schedules";
import {
  getNewMemberTimeline,
  getBeltDistribution,
} from "./_shared/admin-metrics";

export default function AdminDashboard() {
  const displayName = getCurrentDisplayName();

  const students = useSyncExternalStore(
    subscribeStudents,
    getStudents,
    getStudents,
  );
  const coaches = useSyncExternalStore(
    subscribeCoaches,
    getCoaches,
    getCoaches,
  );
  const schedules = useSyncExternalStore(
    subscribeSchedules,
    getSchedules,
    getSchedules,
  );

  // Derived metrics
  const totalStudents = students.length; // Students = all records
  const activeCoaches = coaches.filter((c) => c.status === "Active").length;
  const activeSchedules = schedules.filter((s) => s.status === "Active").length;

  const newStudentTimeline = useMemo(
    () => getNewMemberTimeline(students, 7),
    [students],
  );
  const beltDist = useMemo(() => getBeltDistribution(students), [students]);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight text-ink">
          Welcome, {displayName}
        </h1>
        <p className="text-sm text-muted mt-1">
          Here&apos;s a quick overview of your dojo today.
        </p>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<Users size={20} />}
          label="Student Total"
          value={totalStudents}
        />
        <StatCard
          icon={<GraduationCap size={20} />}
          label="Coach Total"
          value={activeCoaches}
        />
        <StatCard
          icon={<CalendarCheck size={20} />}
          label="Active Schedules"
          value={activeSchedules}
        />
      </div>

      {/* New students + belt distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* New students (last 7 months) */}
        <div className="lg:col-span-2 bg-paper rounded-sm border border-ink/10 p-5 flex flex-col">
          <div className="flex items-start justify-between">
            <h2 className="font-display text-sm font-bold uppercase tracking-widest text-ink">
              New Students
            </h2>
            <span className="text-[10px] uppercase tracking-widest text-muted">
              Last 7 months
            </span>
          </div>
          <div className="mt-4 flex-1 flex items-center">
            <div className="w-full">
              <Sparkline
                data={newStudentTimeline.map((b) => b.count)}
                labels={newStudentTimeline.map((b) => b.label)}
              />
            </div>
          </div>
        </div>

        {/* Belt distribution */}
        <div className="lg:col-span-3 bg-paper rounded-sm border border-ink/10 p-5">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-ink mb-4">
            Belt Distribution
          </h2>
          {beltDist.length === 0 ? (
            <p className="text-sm text-muted">No data</p>
          ) : (
            <BeltDistChart data={beltDist} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Stat card ──────────────────────────────────────────────────────── */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-paper rounded-sm border border-ink/10 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-[11px] font-bold uppercase tracking-widest text-muted">
            {label}
          </p>
          <p className="font-display text-4xl font-bold text-ink mt-2 leading-none">
            {value}
          </p>
        </div>
        <div className="h-10 w-10 rounded-sm bg-accent flex items-center justify-center text-accent-foreground">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ─── Chart components (inline SVG) ──────────────────────────────────── */

function Sparkline({ data, labels }: { data: number[]; labels: string[] }) {
  const w = 220;
  const h = 60;
  const padding = 4;
  const max = Math.max(...data, 1);
  const stepX = (w - padding * 2) / Math.max(data.length - 1, 1);

  const points = data.map((v, i) => {
    const x = padding + i * stepX;
    const y = h - padding - (v / max) * (h - padding * 2);
    return { x, y, v };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const fillD =
    `M ${points[0].x} ${h - padding} ` +
    points.map((p) => `L ${p.x} ${p.y}`).join(" ") +
    ` L ${points[points.length - 1].x} ${h - padding} Z`;

  return (
    <div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full"
        preserveAspectRatio="none"
      >
        <path d={fillD} fill="var(--color-brand)" fillOpacity="0.1" />
        <path
          d={pathD}
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="var(--color-brand)" />
        ))}
      </svg>
      <div className="flex justify-between mt-1 text-[9px] uppercase tracking-widest text-muted font-bold">
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  );
}

function BeltDistChart({ data }: { data: { sabuk: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="space-y-2">
      {data.map((d) => {
        const pct = (d.count / max) * 100;
        return (
          <div key={d.sabuk} className="flex items-center gap-3 text-sm">
            <div className="w-32 shrink-0 text-xs text-ink/80 truncate">
              {d.sabuk}
            </div>
            <div className="flex-1 h-5 bg-paper-soft rounded-sm overflow-hidden">
              <div
                className="h-full bg-brand transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="w-8 text-right font-display font-bold text-ink shrink-0">
              {d.count}
            </div>
          </div>
        );
      })}
    </div>
  );
}
