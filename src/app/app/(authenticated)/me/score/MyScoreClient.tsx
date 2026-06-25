// src/app/app/(authenticated)/me/score/MyScoreClient.tsx
"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { Award, Eye, TrendingUp, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrentUsername } from "@/lib/current-user";
import { getStudents, subscribeStudents } from "../../student/_shared/students";
import {
  getScores,
  subscribeScores,
  getPassingThreshold,
} from "../../student/_shared/scores";
import {
  formatPeriod,
  getPeriodById,
  useAcademic,
} from "../../student/_shared/academic";

export default function MyScoreClient() {
  const username = getCurrentUsername();
  useAcademic(); // subscribe so period labels re-render on master change/hydrate

  const students = useSyncExternalStore(
    subscribeStudents,
    getStudents,
    getStudents,
  );
  const scores = useSyncExternalStore(subscribeScores, getScores, getScores);

  const student = students.find((s) => s.username === username);

  const myScores = useMemo(
    () =>
      scores
        .filter((s) => s.studentUsername === username)
        .sort((a, b) => b.periodId.localeCompare(a.periodId)),
    [scores, username],
  );

  const totalPeriods = myScores.length;
  const totalPassed = myScores.filter((s) => s.result === "Lulus").length;
  const passRate = totalPeriods > 0 ? (totalPassed / totalPeriods) * 100 : 0;
  const bestScore =
    myScores.length > 0 ? Math.max(...myScores.map((s) => s.total)) : 0;

  if (!student) {
    return (
      <div className="bg-paper rounded-sm border border-ink/10 p-10 text-center">
        <p className="text-muted text-sm">Could not load your profile.</p>
      </div>
    );
  }

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
          label="Periods Taken"
          value={String(totalPeriods)}
        />
        <StatCard
          icon={<Award size={18} />}
          label="Passed"
          value={`${totalPassed} / ${totalPeriods}`}
          tone={
            totalPeriods > 0 && totalPassed === totalPeriods
              ? "success"
              : "default"
          }
        />
        <StatCard
          icon={<TrendingUp size={18} />}
          label="Pass Rate"
          value={totalPeriods > 0 ? `${passRate.toFixed(0)}%` : "—"}
        />
        <StatCard
          icon={<Award size={18} />}
          label="Best Score"
          value={totalPeriods > 0 ? bestScore.toFixed(1) : "—"}
          tone="accent"
        />
      </div>

      {/* Score history */}
      <section>
        <h2 className="font-display text-sm font-bold uppercase tracking-widest text-ink mb-4">
          Score History
        </h2>

        {myScores.length === 0 ? (
          <div className="bg-paper rounded-sm border border-ink/10 p-12 text-center text-sm text-muted uppercase tracking-widest font-bold">
            No score history yet
          </div>
        ) : (
          <div className="bg-paper rounded-sm border border-ink/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-ink/15 bg-paper-soft font-display text-[11px] font-bold uppercase tracking-widest text-ink/70">
                    <th className="text-left px-4 py-3.5">Period</th>
                    <th className="text-left px-4 py-3.5">Sabuk</th>
                    <th className="text-right px-4 py-3.5">Total Score</th>
                    <th className="text-right px-4 py-3.5">Min</th>
                    <th className="text-left px-4 py-3.5">Result</th>
                    <th className="text-left px-4 py-3.5">Submitted</th>
                    <th className="text-right px-4 py-3.5">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myScores.map((s) => {
                    const period = getPeriodById(s.periodId);
                    const threshold = getPassingThreshold(s.sabukAtSubmit);
                    const passed = s.result === "Lulus";
                    return (
                      <tr
                        key={s.periodId}
                        className="border-b border-ink/5 hover:bg-paper-soft/50 transition-colors last:border-b-0"
                      >
                        <td className="px-4 py-3 text-ink font-medium whitespace-nowrap">
                          {period
                            ? formatPeriod(period)
                            : `Period ${s.periodId}`}
                        </td>
                        <td className="px-4 py-3 text-ink whitespace-nowrap">
                          {s.sabukAtSubmit}
                        </td>
                        <td
                          className={cn(
                            "px-4 py-3 text-right font-display font-bold text-base whitespace-nowrap",
                            passed ? "text-ink" : "text-brand",
                          )}
                        >
                          {s.total.toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-right text-ink/60 text-xs whitespace-nowrap">
                          {threshold}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={cn(
                              "inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm",
                              passed
                                ? "bg-emerald-500/10 text-emerald-700"
                                : "bg-brand/10 text-brand",
                            )}
                          >
                            {s.result}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-ink/60 text-xs whitespace-nowrap">
                          {new Date(s.submitDate).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <Link
                            href={`/app/student/score/view/${username}/${s.periodId}`}
                            className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm hover:brightness-95 transition"
                          >
                            <Eye size={12} />
                            View Detail
                          </Link>
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
