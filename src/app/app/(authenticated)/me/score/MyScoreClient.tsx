// src/app/app/(authenticated)/me/score/MyScoreClient.tsx
//
// The student's own grading history (Step 3d). There is no cross-period "my
// scores" endpoint, so we fan out get-student-assess-list over the periods the
// student is enrolled in (from their schedules) and keep only their own rows.
// Reuses the shared score-list cache.
"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { Award, Eye, TrendingUp, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/session";
import {
  getSchedules,
  subscribeSchedules,
} from "../../coach/_shared/schedules";
import {
  ensureAssessListLoaded,
  getAssessList,
  getScoresVersion,
  isAssessed,
  passPercentage,
  resultLabel,
  subscribeScores,
} from "../../student/_shared/scores";

export default function MyScoreClient() {
  const session = useSession();
  const username = session?.noReg ?? "";
  const userDataId = session?.userDataId ?? 0;

  const schedules = useSyncExternalStore(
    subscribeSchedules,
    getSchedules,
    getSchedules,
  );
  // Re-render when a period's assess list lands in the cache.
  useSyncExternalStore(subscribeScores, getScoresVersion, getScoresVersion);

  // Distinct periods this student is enrolled in.
  const myPeriods = useMemo(() => {
    const map = new Map<number, string>();
    schedules
      .filter((s) => s.studentUsernames.includes(username))
      .forEach((s) => {
        if (!map.has(s.schPeriodId)) map.set(s.schPeriodId, s.periodTitle);
      });
    return Array.from(map, ([id, title]) => ({ id, title }));
  }, [schedules, username]);

  useEffect(() => {
    myPeriods.forEach((p) => ensureAssessListLoaded(p.id));
  }, [myPeriods]);

  // Computed inline so it always reflects the latest cache (the subscription
  // above triggers re-render on hydrate).
  const history = myPeriods
    .flatMap((p) =>
      getAssessList(p.id)
        .filter((r) => r.UserDataId === userDataId)
        .map((r) => ({ row: r, periodId: p.id })),
    )
    .sort((a, b) => b.periodId - a.periodId);

  const assessed = history.filter((h) => isAssessed(h.row.TotalScore));
  const totalPeriods = history.length;
  const totalPassed = assessed.filter(
    (h) =>
      resultLabel(h.row.TotalScore, h.row.MaxScore, h.row.BeltMasterId) ===
      "Lulus",
  ).length;
  const passRate =
    assessed.length > 0 ? (totalPassed / assessed.length) * 100 : 0;
  // Scores are shown normalised to a 0–100 scale (curr / max × 100), matching
  // the pass threshold; the raw item-sum total is not directly comparable.
  const bestScore =
    assessed.length > 0
      ? Math.max(
          ...assessed.map(
            (h) => passPercentage(h.row.TotalScore, h.row.MaxScore) ?? 0,
          ),
        )
      : 0;

  return (
    <>
      <h1 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight text-ink mb-2">
        My Taekwondo Score
      </h1>
      <p className="text-sm text-muted mb-8">
        Your grading history across all training periods.
      </p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        <StatCard
          icon={<Calendar size={18} />}
          label="Exams Taken"
          value={String(totalPeriods)}
        />
        <StatCard
          icon={<Award size={18} />}
          label="Passed"
          value={`${totalPassed} / ${assessed.length}`}
          tone={
            assessed.length > 0 && totalPassed === assessed.length
              ? "success"
              : "default"
          }
        />
        <StatCard
          icon={<TrendingUp size={18} />}
          label="Pass Rate"
          value={assessed.length > 0 ? `${passRate.toFixed(0)}%` : "—"}
        />
        <StatCard
          icon={<Award size={18} />}
          label="Best Score"
          value={assessed.length > 0 ? bestScore.toFixed(1) : "—"}
          tone="accent"
        />
      </div>

      {/* Score history */}
      <section>
        <h2 className="font-display text-sm font-bold uppercase tracking-widest text-ink mb-4">
          Score History
        </h2>

        {history.length === 0 ? (
          <div className="bg-paper rounded-sm border border-ink/10 p-12 text-center text-sm text-muted uppercase tracking-widest font-bold">
            No exam history yet
          </div>
        ) : (
          <div className="bg-paper rounded-sm border border-ink/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-ink/15 bg-paper-soft font-display text-[11px] font-bold uppercase tracking-widest text-ink/70">
                    <th className="text-left px-4 py-3.5">Period</th>
                    <th className="text-left px-4 py-3.5">Program</th>
                    <th className="text-left px-4 py-3.5">Sabuk</th>
                    <th className="text-right px-4 py-3.5">Total Score</th>
                    <th className="text-left px-4 py-3.5">Result</th>
                    <th className="text-right px-4 py-3.5">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(({ row, periodId }) => {
                    const done = isAssessed(row.TotalScore);
                    const result = resultLabel(
                      row.TotalScore,
                      row.MaxScore,
                      row.BeltMasterId,
                    );
                    const passed = result === "Lulus";
                    return (
                      <tr
                        key={`${periodId}-${row.ProgramMsId}`}
                        className="border-b border-ink/5 hover:bg-paper-soft/50 transition-colors last:border-b-0"
                      >
                        <td className="px-4 py-3 text-ink font-medium whitespace-nowrap">
                          {row.PeriodTitle}
                        </td>
                        <td className="px-4 py-3 text-ink whitespace-nowrap">
                          {row.ProgramName}
                        </td>
                        <td className="px-4 py-3 text-ink whitespace-nowrap">
                          {row.BeltName || "-"}
                        </td>
                        <td
                          className={cn(
                            "px-4 py-3 text-right font-display font-bold text-base whitespace-nowrap",
                            !done
                              ? "text-muted"
                              : passed
                                ? "text-ink"
                                : "text-brand",
                          )}
                        >
                          {done
                            ? (
                                passPercentage(row.TotalScore, row.MaxScore) ??
                                row.TotalScore
                              ).toFixed(1)
                            : "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={cn(
                              "inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm",
                              !done
                                ? "bg-paper-soft text-muted"
                                : passed
                                  ? "bg-emerald-500/10 text-emerald-700"
                                  : "bg-brand/10 text-brand",
                            )}
                          >
                            {done ? result : "Awaiting"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {done ? (
                            <Link
                              href={`/app/student/score/view/${row.UserDataId}/${row.ProgramMsId}/${periodId}`}
                              className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm hover:brightness-95 transition"
                            >
                              <Eye size={12} />
                              View Detail
                            </Link>
                          ) : (
                            <span className="text-[10px] uppercase tracking-widest text-muted font-bold">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "default" | "success" | "accent";
}) {
  return (
    <div className="bg-paper rounded-sm border border-ink/10 p-4">
      <div
        className={cn(
          "flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest",
          tone === "success" && "text-emerald-700",
          tone === "accent" && "text-brand",
          tone === "default" && "text-muted",
        )}
      >
        {icon}
        {label}
      </div>
      <div className="mt-2 font-display text-2xl md:text-3xl font-bold text-ink leading-none">
        {value}
      </div>
    </div>
  );
}
