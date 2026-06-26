// src/app/app/(authenticated)/coach/recommendation/RecommendationClient.tsx
"use client";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Search } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import PageHeader from "@/components/app/PageHeader";
import {
  fetchStudentRecom,
  type StudentRecomRow,
} from "@/lib/api/recommendations";
import {
  getSchedulePeriods,
  subscribeSchedulePeriods,
} from "../../master/_shared/schedule-periods";
import { useDojangOptions } from "../../master/_shared/dojangs";

export default function RecommendationClient() {
  const dojangOptions = useDojangOptions();
  const periods = useSyncExternalStore(
    subscribeSchedulePeriods,
    getSchedulePeriods,
    getSchedulePeriods,
  );

  const [periodInput, setPeriodInput] = useState("");
  const [dojangInput, setDojangInput] = useState("All");
  const [searchInput, setSearchInput] = useState("");
  const [applied, setApplied] = useState({
    schPeriodId: 0,
    dojang: "All",
    search: "",
  });
  const [rows, setRows] = useState<StudentRecomRow[]>([]);
  const [loading, setLoading] = useState(false);

  // get-student-recom is per period; load on applied-period change.
  useEffect(() => {
    if (applied.schPeriodId <= 0) return;
    let alive = true;
    fetchStudentRecom({ schPeriodId: applied.schPeriodId })
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
  }, [applied.schPeriodId]);

  const filtered = useMemo(() => {
    const q = applied.search.toLowerCase().trim();
    return rows.filter((r) => {
      if (applied.dojang !== "All" && r.DojangName !== applied.dojang)
        return false;
      if (q) {
        const haystack = [r.UserNoId, r.UserName, r.BeltName, r.ProgramName]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [rows, applied.dojang, applied.search]);

  const runSearch = () => {
    const id = Number(periodInput) || 0;
    if (id > 0) setLoading(true);
    setApplied({ schPeriodId: id, dojang: dojangInput, search: searchInput });
  };

  return (
    <>
      <PageHeader title="Student Recommendation" />

      <div className="bg-paper rounded-sm border border-ink/10 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
          <Select
            label="Period"
            value={periodInput}
            onChange={(e) => setPeriodInput(e.target.value)}
          >
            <option value="">Select period…</option>
            {periods.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.periodName}
                {p.dojang ? ` · ${p.dojang}` : ""}
              </option>
            ))}
          </Select>
          <Select
            label="Dojang"
            value={dojangInput}
            onChange={(e) => setDojangInput(e.target.value)}
          >
            <option value="All">All</option>
            {dojangOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
          <div className="lg:col-span-2">
            <Input
              label="Search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="No. Reg / Nama / Sabuk..."
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setPeriodInput("");
              setDojangInput("All");
              setSearchInput("");
              setApplied({ schPeriodId: 0, dojang: "All", search: "" });
            }}
          >
            Reset
          </Button>
          <Button variant="secondary" onClick={runSearch} disabled={!periodInput}>
            <Search size={16} />
            Search
          </Button>
        </div>
      </div>

      <div className="bg-paper rounded-sm border border-ink/10 overflow-hidden">
        <div className="overflow-x-auto">
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
                  Dojang
                </th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">Sabuk</th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">
                  Program
                </th>
                <th className="text-right px-4 py-3.5 whitespace-nowrap">
                  Total Atd
                </th>
                <th className="text-right px-4 py-3.5 whitespace-nowrap">
                  Total Score
                </th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">
                  Recommended By
                </th>
              </tr>
            </thead>
            <tbody>
              {applied.schPeriodId <= 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center px-4 py-16 text-muted uppercase tracking-widest text-xs font-bold"
                  >
                    Select a period to view recommendations
                  </td>
                </tr>
              ) : loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center px-4 py-16 text-muted uppercase tracking-widest text-xs font-bold"
                  >
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center px-4 py-16 text-muted uppercase tracking-widest text-xs font-bold"
                  >
                    No recommendations found
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr
                    key={`${r.UserDataId}-${r.ProgramMsId}`}
                    className="border-b border-ink/5 hover:bg-paper-soft/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-ink font-medium whitespace-nowrap">
                      {r.UserNoId}
                    </td>
                    <td className="px-4 py-3 text-ink whitespace-nowrap">
                      {r.UserName ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-ink whitespace-nowrap">
                      {r.DojangName ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-ink whitespace-nowrap">
                      {r.BeltName ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-ink whitespace-nowrap">
                      {r.ProgramName ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-ink/70 text-right whitespace-nowrap">
                      {r.TotalAtd}
                    </td>
                    <td className="px-4 py-3 text-ink/70 text-right whitespace-nowrap">
                      {r.TotalScore ?? 0}
                    </td>
                    <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                      {r.RecomendationBy ?? "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
