// src/app/app/(authenticated)/dashboard/AdminDashboard.tsx
"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import {
  Users,
  TrendingUp,
  TrendingDown,
  CalendarCheck,
  Star,
  Award,
  GraduationCap,
} from "lucide-react";
import { useRole } from "@/lib/role-context";
import { getCurrentDisplayName } from "@/lib/current-user";
import { getStudents, subscribeStudents } from "../student/_shared/students";
import { getCoaches, subscribeCoaches } from "../coach/_shared/coaches";
import { getSchedules, subscribeSchedules } from "../coach/_shared/schedules";
import {
  getSessionAttendance,
  subscribeSessionAttendance,
} from "../coach/_shared/session-attendance";
import {
  getRecommendations,
  subscribeRecommendations,
} from "../coach/_shared/recommendations";
import { getScores, subscribeScores } from "../student/_shared/scores";
import {
  getActiveMemberCount,
  getMemberGrowthPct,
  getOccupancyPct,
  getNewMemberTimeline,
  getClassActivity,
  getBeltDistribution,
} from "./_shared/admin-metrics";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const { role } = useRole();
  const displayName = getCurrentDisplayName(role);

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
  const sessionAttendance = useSyncExternalStore(
    subscribeSessionAttendance,
    getSessionAttendance,
    getSessionAttendance,
  );
  const recommendations = useSyncExternalStore(
    subscribeRecommendations,
    getRecommendations,
    getRecommendations,
  );
  const scores = useSyncExternalStore(subscribeScores, getScores, getScores);

  // Derived metrics
  const totalMembers = useMemo(
    () => getActiveMemberCount(students),
    [students],
  );
  const growthPct = useMemo(() => getMemberGrowthPct(students), [students]);
  const occupancy = useMemo(
    () => getOccupancyPct(students, schedules),
    [students, schedules],
  );
  const newMemberTimeline = useMemo(
    () => getNewMemberTimeline(students, 7),
    [students],
  );
  const classActivity = useMemo(
    () => getClassActivity(sessionAttendance, schedules, 10),
    [sessionAttendance, schedules],
  );
  const beltDist = useMemo(() => getBeltDistribution(students), [students]);

  const activeCoaches = coaches.filter((c) => c.status === "Active").length;
  const activeSchedules = schedules.filter((s) => s.status === "Active").length;
  const pendingApprovals = recommendations.length;
  const recentScores = [...scores]
    .sort((a, b) => b.submitDate.localeCompare(a.submitDate))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight text-ink">
          Welcome, {displayName}
        </h1>
        <p className="text-sm text-muted mt-1">
          Your classes are running smoothly!
          {pendingApprovals > 0 && (
            <>
              {" "}
              You have{" "}
              <Link
                href="/app/coach/recommendation"
                className="text-brand font-bold hover:text-brand-hover transition-colors"
              >
                {pendingApprovals} approval request
                {pendingApprovals > 1 ? "s" : ""}!!
              </Link>
            </>
          )}
        </p>
      </div>

      {/* Top stat row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Member total + growth */}
        <div className="bg-paper rounded-sm border border-ink/10 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-display text-[11px] font-bold uppercase tracking-widest text-muted">
                Member Total
              </p>
              <p className="font-display text-4xl font-bold text-ink mt-2 leading-none">
                {totalMembers}
              </p>
              <div
                className={cn(
                  "mt-3 inline-flex items-center gap-1 text-xs font-bold",
                  growthPct >= 0 ? "text-emerald-600" : "text-brand",
                )}
              >
                {growthPct >= 0 ? (
                  <TrendingUp size={14} />
                ) : (
                  <TrendingDown size={14} />
                )}
                {growthPct >= 0 ? "+" : ""}
                {growthPct}%
                <span className="text-muted font-normal ml-1">vs last 30d</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-sm bg-accent flex items-center justify-center text-accent-foreground">
              <Users size={20} />
            </div>
          </div>
        </div>

        {/* Occupancy donut */}
        <div className="bg-paper rounded-sm border border-ink/10 p-5">
          <p className="font-display text-[11px] font-bold uppercase tracking-widest text-muted">
            Occupancy
          </p>
          <div className="mt-2 flex items-center gap-4">
            <DonutChart percent={occupancy} />
            <div className="text-xs text-ink/70 leading-relaxed">
              <span className="font-bold text-ink block mb-1">
                Active enrollments
              </span>
              {occupancy}% of active members enrolled in at least one class.
            </div>
          </div>
        </div>

        {/* New member sparkline */}
        <div className="bg-paper rounded-sm border border-ink/10 p-5">
          <div className="flex items-start justify-between">
            <p className="font-display text-[11px] font-bold uppercase tracking-widest text-muted">
              New Members
            </p>
            <span className="text-[10px] uppercase tracking-widest text-muted">
              Last 7 months
            </span>
          </div>
          <div className="mt-4">
            <Sparkline
              data={newMemberTimeline.map((b) => b.count)}
              labels={newMemberTimeline.map((b) => b.label)}
            />
          </div>
        </div>
      </div>

      {/* Class activity bar chart */}
      <div className="bg-paper rounded-sm border border-ink/10 p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-display text-base font-bold uppercase tracking-widest text-ink">
              Class Activity
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Sessions submitted per week vs target
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <LegendDot color="bg-accent" label="Activity" />
            <LegendDot color="bg-ink" label="Goal" />
          </div>
        </div>
        <BarChart data={classActivity} />
      </div>

      {/* Secondary stat row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <MiniStat
          icon={<GraduationCap size={16} />}
          label="Active Coaches"
          value={activeCoaches}
        />
        <MiniStat
          icon={<CalendarCheck size={16} />}
          label="Active Schedules"
          value={activeSchedules}
        />
        <MiniStat
          icon={<Star size={16} />}
          label="Pending Recommendations"
          value={pendingApprovals}
          tone="accent"
        />
        <MiniStat
          icon={<Award size={16} />}
          label="Scores Submitted"
          value={scores.length}
        />
      </div>

      {/* Bottom grid: belt distribution + recent score activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
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

        <div className="lg:col-span-2 bg-paper rounded-sm border border-ink/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-sm font-bold uppercase tracking-widest text-ink">
              Recent Score Submissions
            </h2>
            <Link
              href="/app/student/score"
              className="text-[10px] font-bold uppercase tracking-widest text-brand hover:text-brand-hover transition-colors"
            >
              View All
            </Link>
          </div>
          {recentScores.length === 0 ? (
            <p className="text-sm text-muted">No submissions yet</p>
          ) : (
            <ul className="space-y-3">
              {recentScores.map((s) => {
                const student = students.find(
                  (st) => st.username === s.studentUsername,
                );
                return (
                  <li
                    key={`${s.studentUsername}-${s.periodId}`}
                    className="flex items-center justify-between gap-2 pb-3 border-b border-ink/5 last:border-b-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-ink font-medium truncate">
                        {student?.namaLengkap ?? s.studentUsername}
                      </p>
                      <p className="text-[11px] text-muted">
                        Period {s.periodId} · {s.sabukAtSubmit}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-display font-bold text-ink">
                        {s.total.toFixed(1)}
                      </p>
                      <span
                        className={cn(
                          "inline-block text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm",
                          s.result === "Lulus"
                            ? "bg-emerald-500/10 text-emerald-700"
                            : "bg-brand/10 text-brand",
                        )}
                      >
                        {s.result}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Chart components (inline SVG) ──────────────────────────────────── */

function DonutChart({ percent }: { percent: number }) {
  const size = 80;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--color-paper-soft)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--color-brand)"
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        className="font-display font-bold fill-ink"
        fontSize="18"
      >
        {percent}%
      </text>
    </svg>
  );
}

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

function BarChart({
  data,
}: {
  data: { label: string; activity: number; goal: number }[];
}) {
  const max = Math.max(...data.map((d) => Math.max(d.activity, d.goal)), 1);
  return (
    <div>
      <div className="grid grid-cols-10 gap-2 h-[180px] items-end">
        {data.map((d) => {
          const activityPct = (d.activity / max) * 100;
          const goalPct = (d.goal / max) * 100;
          return (
            <div
              key={d.label}
              className="flex items-end justify-center gap-0.5 h-full relative group"
            >
              <div
                className="w-1/2 bg-accent rounded-t-sm transition-all hover:brightness-95"
                style={{ height: `${activityPct}%` }}
              />
              <div
                className="w-1/2 bg-ink rounded-t-sm transition-all"
                style={{ height: `${goalPct}%` }}
              />
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-ink text-paper text-[10px] px-2 py-1 rounded-sm whitespace-nowrap z-10">
                {d.activity} / {d.goal}
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-10 gap-2 mt-2">
        {data.map((d) => (
          <div
            key={d.label}
            className="text-center text-[10px] uppercase tracking-widest text-muted font-bold"
          >
            {d.label}
          </div>
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

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-2.5 w-2.5 rounded-full", color)} />
      <span className="text-muted font-bold uppercase tracking-widest text-[10px]">
        {label}
      </span>
    </span>
  );
}

function MiniStat({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: "default" | "accent";
}) {
  return (
    <div className="bg-paper rounded-sm border border-ink/10 p-4">
      <div
        className={cn(
          "flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest",
          tone === "accent" ? "text-brand" : "text-muted",
        )}
      >
        {icon}
        {label}
      </div>
      <div className="mt-1.5 font-display text-2xl font-bold text-ink leading-none">
        {value}
      </div>
    </div>
  );
}
