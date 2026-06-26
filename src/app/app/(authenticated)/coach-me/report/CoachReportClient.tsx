// src/app/app/(authenticated)/coach-me/report/CoachReportClient.tsx
"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { useSession } from "@/lib/session";
import {
  fetchCoachAtd,
  fetchCoachAtdDetail,
  type CoachAtdRow,
  type CoachAtdDetailRow,
} from "@/lib/api/attendance";

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export default function CoachReportClient() {
  const session = useSession();
  const coachId = session?.userDataId ?? 0;

  const [monthInput, setMonthInput] = useState(currentMonth());
  const [month, setMonth] = useState(currentMonth());
  const [rows, setRows] = useState<CoachAtdRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [detail, setDetail] = useState<CoachAtdRow | null>(null);
  const [detailRows, setDetailRows] = useState<CoachAtdDetailRow[]>([]);

  // get-coach-atd is per-month; load on month change (and on mount).
  useEffect(() => {
    if (!coachId || !month) return;
    let alive = true;
    fetchCoachAtd({ monthPeriod: month, coachId })
      .then((r) => {
        if (alive) setRows(r ?? []);
      })
      .catch(() => {
        if (alive) setRows([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [coachId, month]);

  const openDetail = (row: CoachAtdRow) => {
    setDetail(row);
    setDetailRows([]);
    fetchCoachAtdDetail({ monthPeriod: month, programMsId: row.ProgramMsId })
      .then((r) => setDetailRows(r ?? []))
      .catch(() => setDetailRows([]));
  };

  return (
    <>
      <h1 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight text-ink mb-2">
        Attendance Report
      </h1>
      <p className="text-sm text-muted mb-8">
        Sessions you&apos;ve taught in a month, grouped by program.
      </p>

      <div className="bg-paper rounded-sm border border-ink/10 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 max-w-2xl">
          <Input
            label="Bulan"
            type="month"
            value={monthInput}
            onChange={(e) => setMonthInput(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-end gap-2 mt-6">
          <Button
            variant="secondary"
            onClick={() => {
              setLoading(true);
              setMonth(monthInput);
            }}
            disabled={!monthInput}
          >
            <Search size={16} />
            Search
          </Button>
        </div>
      </div>

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
            {loading ? (
              <tr>
                <td
                  colSpan={3}
                  className="text-center px-4 py-16 text-muted uppercase tracking-widest text-xs font-bold"
                >
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="text-center px-4 py-16 text-muted uppercase tracking-widest text-xs font-bold"
                >
                  No data
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr
                  key={`${r.ProgramMsId}-${r.PeriodTitle}`}
                  className="border-b border-ink/5 hover:bg-paper-soft/50 transition-colors"
                >
                  <td className="px-4 py-3 text-ink">{r.ProgramName}</td>
                  <td className="px-4 py-3 text-ink/70">{r.PeriodTitle}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openDetail(r)}
                      className="font-display font-bold text-ink underline decoration-accent decoration-2 underline-offset-4 hover:text-brand transition"
                    >
                      {r.TotalAtd}
                    </button>
                  </td>
                </tr>
              ))
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
              {detail.ProgramName} · {detail.PeriodTitle}
            </div>
            <div className="text-sm text-ink">
              <span className="font-display font-bold text-2xl mr-2">
                {detail.TotalAtd}
              </span>
              <span className="text-muted">sessions taught</span>
            </div>
            <div className="border border-ink/10 rounded-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-paper-soft font-display text-[11px] font-bold uppercase tracking-widest text-ink/70">
                  <tr>
                    <th className="text-left px-3 py-2">Date</th>
                    <th className="text-left px-3 py-2">Dojang</th>
                    <th className="text-left px-3 py-2">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {detailRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center px-3 py-6 text-muted text-xs uppercase tracking-widest font-bold"
                      >
                        No sessions
                      </td>
                    </tr>
                  ) : (
                    detailRows.map((s, i) => (
                      <tr key={i} className="border-t border-ink/5">
                        <td className="px-3 py-2 text-ink">{s.ScheduleDate}</td>
                        <td className="px-3 py-2 text-ink/70">{s.DojangName}</td>
                        <td className="px-3 py-2 text-ink/70">
                          {s.ProgramDtName}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
