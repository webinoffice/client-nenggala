// src/app/app/(authenticated)/coach/attendance/CoachAttendanceClient.tsx
"use client";
import { useMemo, useState, useSyncExternalStore } from "react";
import { Search } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/app/PageHeader";
import {
  aggregateAttendance,
  type AggregatedAttendance,
} from "../_shared/coach-attendance";
import { getCoaches, subscribeCoaches } from "../_shared/coaches";
import {
  useAcademic,
  formatPeriod,
  formatMonth,
  monthRange,
  getProgramById,
} from "../../student/_shared/academic";

export default function CoachAttendanceClient() {
  const coaches = useSyncExternalStore(
    subscribeCoaches,
    getCoaches,
    getCoaches,
  );
  const coachByUsername = useMemo(
    () => new Map(coaches.map((c) => [c.username, c])),
    [coaches],
  );

  // Subscribe so program names re-render when the master store changes/hydrates.
  const { periods: allPeriods } = useAcademic();

  const [namaInput, setNamaInput] = useState("");
  const [periodInput, setPeriodInput] = useState("32");
  const [noInput, setNoInput] = useState("");
  const [monthInput, setMonthInput] = useState(""); // YYYY-MM
  const [applied, setApplied] = useState({
    nama: "",
    period: "32",
    no: "",
    month: "",
  });
  const [detail, setDetail] = useState<AggregatedAttendance | null>(null);

  // Months available depend on the selected period.
  const monthOptions = useMemo(() => {
    const periods =
      periodInput === "All"
        ? allPeriods
        : allPeriods.filter((p) => p.id === periodInput);
    const set = new Set<string>();
    periods.forEach((p) =>
      monthRange(p.startMonth, p.endMonth).forEach((m) => set.add(m)),
    );
    return Array.from(set).sort();
  }, [periodInput, allPeriods]);

  const rows = useMemo(() => {
    return aggregateAttendance({
      monthFilter: applied.month || undefined,
      periodFilter: applied.period === "All" ? undefined : applied.period,
      coachUsernameFilter: applied.no.trim() || undefined,
      nameMatcher: applied.nama.trim()
        ? (u) => {
            const c = coachByUsername.get(u);
            return (
              !!c &&
              c.namaLengkap
                .toLowerCase()
                .includes(applied.nama.toLowerCase().trim())
            );
          }
        : undefined,
    });
  }, [applied, coachByUsername]);

  return (
    <>
      <PageHeader title="Coach Attendance Report" />

      <div className="bg-paper rounded-sm border border-ink/10 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
          <Input
            label="Nama"
            value={namaInput}
            onChange={(e) => setNamaInput(e.target.value)}
            placeholder="e.g. Marvin Hadi"
          />
          <Select
            label="Period"
            value={periodInput}
            onChange={(e) => {
              setPeriodInput(e.target.value);
              setMonthInput(""); // reset month when period changes
            }}
          >
            <option value="All">All</option>
            {allPeriods.map((p) => (
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
          <Input
            label="No. Reg"
            value={noInput}
            onChange={(e) => setNoInput(e.target.value)}
            placeholder="e.g. C0001"
          />
        </div>
        <div className="flex items-center justify-end gap-2 mt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setNamaInput("");
              setPeriodInput("32");
              setNoInput("");
              setMonthInput("");
              setApplied({
                nama: "",
                period: "32",
                no: "",
                month: "",
              });
            }}
          >
            Reset
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              setApplied({
                nama: namaInput,
                period: periodInput,
                no: noInput,
                month: monthInput,
              })
            }
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
              <th className="text-left px-4 py-3.5 whitespace-nowrap">
                No. Reg
              </th>
              <th className="text-left px-4 py-3.5 whitespace-nowrap">
                Nama Lengkap
              </th>
              <th className="text-left px-4 py-3.5 whitespace-nowrap">
                Program
              </th>
              <th className="text-left px-4 py-3.5 whitespace-nowrap">
                Periode
              </th>
              <th className="text-right px-4 py-3.5 whitespace-nowrap">
                Attendance
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center px-4 py-16 text-muted uppercase tracking-widest text-xs font-bold"
                >
                  No data
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const c = coachByUsername.get(r.coachUsername);
                const prog = getProgramById(r.programId);
                return (
                  <tr
                    key={`${r.coachUsername}-${r.programId}-${r.periodId}`}
                    className="border-b border-ink/5 hover:bg-paper-soft/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-ink font-medium whitespace-nowrap">
                      {r.coachUsername}
                    </td>
                    <td className="px-4 py-3 text-ink whitespace-nowrap">
                      {c?.namaLengkap ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-ink whitespace-nowrap">
                      {prog?.name ?? r.programId}
                    </td>
                    <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                      {r.periodId}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
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
        title={
          detail
            ? `Session dates · ${coachByUsername.get(detail.coachUsername)?.namaLengkap}`
            : ""
        }
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
