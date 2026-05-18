// src/app/app/(authenticated)/coach/_shared/coach-attendance.ts

export type CoachAttendanceRecord = {
  coachUsername: string;
  date: string; // YYYY-MM-DD
  scheduleId: string;
  programId: string;
  dojang: string;
  periodId: string;
};

// Mock: ~15 sessions for Period 32 across coaches and programs.
export const COACH_ATTENDANCE: CoachAttendanceRecord[] = [
  // Marvin Hadi (C0001) — Taekwondo Mondays + Fridays
  {
    coachUsername: "C0001",
    date: "2026-01-05",
    scheduleId: "SCH-0001",
    programId: "TKD",
    dojang: "Kedoya Sport Club",
    periodId: "32",
  },
  {
    coachUsername: "C0001",
    date: "2026-01-12",
    scheduleId: "SCH-0001",
    programId: "TKD",
    dojang: "Kedoya Sport Club",
    periodId: "32",
  },
  {
    coachUsername: "C0001",
    date: "2026-01-19",
    scheduleId: "SCH-0001",
    programId: "TKD",
    dojang: "Kedoya Sport Club",
    periodId: "32",
  },
  {
    coachUsername: "C0001",
    date: "2026-02-02",
    scheduleId: "SCH-0001",
    programId: "TKD",
    dojang: "Kedoya Sport Club",
    periodId: "32",
  },
  {
    coachUsername: "C0001",
    date: "2026-01-09",
    scheduleId: "SCH-0005",
    programId: "TKD",
    dojang: "Kedoya Sport Club",
    periodId: "32",
  },
  {
    coachUsername: "C0001",
    date: "2026-01-16",
    scheduleId: "SCH-0005",
    programId: "TKD",
    dojang: "Kedoya Sport Club",
    periodId: "32",
  },
  {
    coachUsername: "C0001",
    date: "2026-01-23",
    scheduleId: "SCH-0005",
    programId: "TKD",
    dojang: "Kedoya Sport Club",
    periodId: "32",
  },
  {
    coachUsername: "C0001",
    date: "2026-02-06",
    scheduleId: "SCH-0005",
    programId: "TKD",
    dojang: "Kedoya Sport Club",
    periodId: "32",
  },
  // Carolina (C0002) — Tuesdays Taekwondo
  {
    coachUsername: "C0002",
    date: "2026-01-06",
    scheduleId: "SCH-0002",
    programId: "TKD",
    dojang: "Kedoya Sport Club",
    periodId: "32",
  },
  {
    coachUsername: "C0002",
    date: "2026-01-13",
    scheduleId: "SCH-0002",
    programId: "TKD",
    dojang: "Kedoya Sport Club",
    periodId: "32",
  },
  {
    coachUsername: "C0002",
    date: "2026-01-20",
    scheduleId: "SCH-0002",
    programId: "TKD",
    dojang: "Kedoya Sport Club",
    periodId: "32",
  },
  {
    coachUsername: "C0002",
    date: "2026-02-03",
    scheduleId: "SCH-0002",
    programId: "TKD",
    dojang: "Kedoya Sport Club",
    periodId: "32",
  },
  // Reza (C0003) — Wednesdays Taekwondo + Sundays Gymnastic
  {
    coachUsername: "C0003",
    date: "2026-01-07",
    scheduleId: "SCH-0003",
    programId: "TKD",
    dojang: "Kedoya Sport Club",
    periodId: "32",
  },
  {
    coachUsername: "C0003",
    date: "2026-01-14",
    scheduleId: "SCH-0003",
    programId: "TKD",
    dojang: "Kedoya Sport Club",
    periodId: "32",
  },
  {
    coachUsername: "C0003",
    date: "2026-01-04",
    scheduleId: "SCH-0007",
    programId: "GYM",
    dojang: "Kedoya Sport Club",
    periodId: "32",
  },
  {
    coachUsername: "C0003",
    date: "2026-01-11",
    scheduleId: "SCH-0007",
    programId: "GYM",
    dojang: "Kedoya Sport Club",
    periodId: "32",
  },
  // Kiky (C0005) — Saturdays Nunchaku
  {
    coachUsername: "C0005",
    date: "2026-01-10",
    scheduleId: "SCH-0006",
    programId: "NCK",
    dojang: "Kedoya Sport Club",
    periodId: "32",
  },
  {
    coachUsername: "C0005",
    date: "2026-01-17",
    scheduleId: "SCH-0006",
    programId: "NCK",
    dojang: "Kedoya Sport Club",
    periodId: "32",
  },
];

// Aggregate by coach × program × period × dojang (with optional month filter)
export type AggregatedAttendance = {
  coachUsername: string;
  programId: string;
  dojang: string;
  periodId: string;
  count: number;
  dates: string[];
};

export function aggregateAttendance(opts: {
  monthFilter?: string; // YYYY-MM
  dojangFilter?: string;
  periodFilter?: string;
  coachUsernameFilter?: string;
  nameMatcher?: (coachUsername: string) => boolean;
}): AggregatedAttendance[] {
  const filtered = COACH_ATTENDANCE.filter((r) => {
    if (opts.monthFilter && !r.date.startsWith(opts.monthFilter)) return false;
    if (opts.dojangFilter && r.dojang !== opts.dojangFilter) return false;
    if (opts.periodFilter && r.periodId !== opts.periodFilter) return false;
    if (
      opts.coachUsernameFilter &&
      r.coachUsername !== opts.coachUsernameFilter
    )
      return false;
    if (opts.nameMatcher && !opts.nameMatcher(r.coachUsername)) return false;
    return true;
  });
  const map = new Map<string, AggregatedAttendance>();
  for (const r of filtered) {
    const key = `${r.coachUsername}|${r.programId}|${r.dojang}|${r.periodId}`;
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
      existing.dates.push(r.date);
    } else {
      map.set(key, {
        coachUsername: r.coachUsername,
        programId: r.programId,
        dojang: r.dojang,
        periodId: r.periodId,
        count: 1,
        dates: [r.date],
      });
    }
  }
  return Array.from(map.values()).sort(
    (a, b) =>
      a.coachUsername.localeCompare(b.coachUsername) ||
      a.programId.localeCompare(b.programId),
  );
}
