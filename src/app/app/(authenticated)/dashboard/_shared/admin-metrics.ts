// src/app/app/(authenticated)/dashboard/_shared/admin-metrics.ts
import type { Student } from "../../student/_shared/students";
import type { Schedule } from "../../coach/_shared/schedules";
import type { SessionAttendance } from "../../coach/_shared/session-attendance";
import { getBeltNames } from "../../master/_shared/belts";

export type MonthlyBucket = {
  label: string; // "Jan", "Feb"...
  ym: string; // "2026-01"
  count: number;
};

export type ActivityBucket = {
  label: string; // "W1", "W2"... or "Jan"
  activity: number;
  goal: number;
};

/** Count of active students. */
export function getActiveMemberCount(students: Student[]): number {
  return students.filter((s) => s.status === "Active").length;
}

/**
 * "Member growth" — last 30 days new members vs the 30 days before.
 * Returns a signed percentage; +25% means 25% more new students this period vs last.
 */
export function getMemberGrowthPct(students: Student[]): number {
  const now = Date.now();
  const day = 86_400_000;
  const inLast30 = students.filter((s) => {
    if (!s.mulaiLatihan) return false;
    const d = new Date(s.mulaiLatihan).getTime();
    return d >= now - 30 * day;
  }).length;
  const inPrev30 = students.filter((s) => {
    if (!s.mulaiLatihan) return false;
    const d = new Date(s.mulaiLatihan).getTime();
    return d >= now - 60 * day && d < now - 30 * day;
  }).length;
  if (inPrev30 === 0) return inLast30 > 0 ? 100 : 0;
  return Math.round(((inLast30 - inPrev30) / inPrev30) * 100);
}

/**
 * Occupancy = % of active students enrolled in at least one active schedule.
 */
export function getOccupancyPct(
  students: Student[],
  schedules: Schedule[],
): number {
  const activeStudents = students.filter((s) => s.status === "Active");
  if (activeStudents.length === 0) return 0;
  const enrolledUsernames = new Set<string>();
  schedules
    .filter((s) => s.status === "Active")
    .forEach((s) =>
      s.studentUsernames.forEach((u) => enrolledUsernames.add(u)),
    );
  const enrolledActive = activeStudents.filter((s) =>
    enrolledUsernames.has(s.username),
  ).length;
  return Math.round((enrolledActive / activeStudents.length) * 100);
}

/**
 * New-member timeline: count of students who joined in each of the last N months.
 */
export function getNewMemberTimeline(
  students: Student[],
  months = 7,
): MonthlyBucket[] {
  const monthsShort = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const now = new Date();
  const buckets: MonthlyBucket[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.push({ label: monthsShort[d.getMonth()], ym, count: 0 });
  }
  students.forEach((s) => {
    if (!s.mulaiLatihan) return;
    const ym = s.mulaiLatihan.slice(0, 7);
    const b = buckets.find((b) => b.ym === ym);
    if (b) b.count += 1;
  });
  return buckets;
}

/**
 * Class Activity: sessions submitted per recent week, vs a goal line.
 */
export function getClassActivity(
  records: SessionAttendance[],
  schedules: Schedule[],
  weeks = 10,
): ActivityBucket[] {
  const now = new Date();
  const buckets: ActivityBucket[] = [];

  // Active schedule count = weekly goal (one session per schedule per week is the target).
  const weeklyGoal = schedules.filter((s) => s.status === "Active").length || 5;

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - i * 7 - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const count = records.filter((r) => {
      const d = new Date(r.date).getTime();
      return d >= weekStart.getTime() && d < weekEnd.getTime();
    }).length;

    buckets.push({
      label: `W${weeks - i}`,
      activity: count,
      goal: weeklyGoal,
    });
  }
  return buckets;
}

/**
 * Belt distribution across active students.
 */
export function getBeltDistribution(students: Student[]) {
  const active = students.filter((s) => s.status === "Active");
  const counts = new Map<string, number>();
  active.forEach((s) => {
    const key = s.sabuk || "-";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  // Preserve the canonical belt order (by level) from the belt master.
  return getBeltNames()
    .filter((b) => counts.has(b))
    .map((b) => ({
      sabuk: b,
      count: counts.get(b) ?? 0,
    }));
}