// src/app/app/(authenticated)/coach-me/report/CoachReportClient.tsx
"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { useRole } from "@/lib/role-context";
import { getCurrentUsername } from "@/lib/current-user";
import {
  aggregateAttendance,
  type AggregatedAttendance,
} from "../../coach/_shared/coach-attendance";
import {
  PERIODS,
  formatPeriod,
  formatMonth,
  monthRange,
  getProgramById,
} from "../../student/_shared/academic";

export default function CoachReportClient() {
  const { role } = useRole();
  const username = getCurrentUsername(role);

  const [periodInput, setPeriodInput] = useState("32");
  const [monthInput, setMonthInput] = useState("");
  const [applied, setApplied] = useState({ period: "32", month: "" });
  const [detail, setDetail] = useState<AggregatedAttendance | null>(null);

  const monthOptions = useMemo(() => {
    const periods =
      periodInput === "All"
        ? PERIODS
        : PERIODS.filter((p) => p.id === periodInput);
    const set = new Set<string>();
    periods.forEach((p) =>
      monthRange(p.startMonth, p.endMonth).forEach((m) => set.add(m)),
    );
    return Array.from(set).sort();
  }, [periodInput]);

  const rows = useMemo(
    () =>
      aggregateAttendance({
        coachUsernameFilter: username,
        periodFilter: applied.period === "All" ? undefined : applied.period,
        monthFilter: applied.month || undefined,
      }),
    [username, applied],
  );

  return (
    <>
      <h1 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight text-ink mb-2">
        Attendance Report
      </h1>
      <p className="text-sm text-muted mb-8">
        Sessions you&apos;ve taught, grouped by program &amp; period.
      </p>

      {/* Filters */}
      <div className="bg-paper rounded-sm border border-ink/10 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 max-w-2xl">
          <Select
            label="Period"
            value={periodInput}
            onChange={(e) => {
              setPeriodInput(e.target.value);
              setMonthInput("");
            }}
          >
            <option value="All">All</option>
            {PERIODS.map((p) => (
              <option key={p.id} value={p.id}>
                {formatPeriod(p)}
              </option>
            ))}
          </Select>
          <Select
            label="Bulan"
            value={monthInput}
            onChange={(e) => setMonthInput(e.target.value)}
          >
            <option value="">Semua Bulan</option>
            {monthOptions.map((m) => (
              <option key={m} value={m}>
                {formatMonth(m)}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-center justify-end gap-2 mt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setPeriodInput("32");
              setMonthInput("");
              setApplied({ period: "32", month: "" });
            }}
          >
            Reset
          </Button>
          <Button
            variant="secondary"
            onClick={() => setApplied({ period: periodInput, month: monthInput })}
          >
            <Search size={16} />
            Search
          </Button>
        </div>
      </div>

      {/* Records table */}
      <div className="bg-paper rounded-sm border border-ink/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-ink/15 bg-paper-soft font-display text-[11px] font-bold uppercase tracking-widest text-ink/70">
              <th className="text-left px-4 py-3.5">Program</th>
              <th className="text-left px-4 py-3.5">Periode</th>
              <th className="text-right px-4 py-3.5">Attendance</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="text-center px-4 py-16 text-muted uppercase tracking-widest text-xs font-bold"
                >
                  No data
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const prog = getProgramById(r.programId);
                return (
                  <tr
                    key={`${r.programId}-${r.periodId}`}
                    className="border-b border-ink/5 hover:bg-paper-soft/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-ink">
                      {prog?.name ?? r.programId}
                    </td>
                    <td className="px-4 py-3 text-ink/70">{r.periodId}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setDetail(r)}
                        className="font-display font-bold text-ink underline decoration-accent decoration-2 underline-offset-4 hover:text-brand transition"
                      >
                        {r.count}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={detail !== null}
        onClose={() => setDetail(null)}
        title="Session dates"
        size="md"
      >
        {detail && (
          <div className="space-y-3">
            <div className="text-xs text-muted uppercase tracking-widest font-bold">
              {getProgramById(detail.programId)?.name} · Period{" "}
              {detail.periodId}
            </div>
            <div className="text-sm text-ink">
              <span className="font-display font-bold text-2xl mr-2">
                {detail.count}
              </span>
              <span className="text-muted">sessions taught</span>
            </div>
            <div className="border border-ink/10 rounded-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-paper-soft font-display text-[11px] font-bold uppercase tracking-widest text-ink/70">
                  <tr>
                    <th className="text-left px-3 py-2">Date</th>
                    <th className="text-left px-3 py-2">Dojang</th>
                  </tr>
                </thead>
                <tbody>
                  {[...detail.sessions]
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((s) => (
                      <tr
                        key={`${s.date}-${s.dojang}`}
                        className="border-t border-ink/5"
                      >
                        <td className="px-3 py-2 text-ink">{s.date}</td>
                        <td className="px-3 py-2 text-ink/70">{s.dojang}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
