// src/app/app/(authenticated)/coach/recommendation/RecommendationClient.tsx
"use client";
import { useMemo, useState, useSyncExternalStore } from "react";
import { Search } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import PageHeader from "@/components/app/PageHeader";
import {
  getRecommendations,
  subscribeRecommendations,
} from "../_shared/recommendations";
import { getCoaches, subscribeCoaches } from "../_shared/coaches";
import { getStudents, subscribeStudents } from "../../student/_shared/students";
import { DOJANG_OPTIONS } from "../../student/_shared/students";

export default function RecommendationClient() {
  const recommendations = useSyncExternalStore(
    subscribeRecommendations,
    getRecommendations,
    getRecommendations,
  );
  const coaches = useSyncExternalStore(
    subscribeCoaches,
    getCoaches,
    getCoaches,
  );
  const students = useSyncExternalStore(
    subscribeStudents,
    getStudents,
    getStudents,
  );
  const coachByUsername = useMemo(
    () => new Map(coaches.map((c) => [c.username, c])),
    [coaches],
  );
  const studentByUsername = useMemo(
    () => new Map(students.map((s) => [s.username, s])),
    [students],
  );

  const [searchInput, setSearchInput] = useState("");
  const [dojangInput, setDojangInput] = useState("All");
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");
  const [applied, setApplied] = useState({
    search: "",
    dojang: "All",
    startDate: "",
    endDate: "",
  });

  const filtered = useMemo(
    () =>
      recommendations
        .filter((r) => {
          if (applied.dojang !== "All" && r.dojang !== applied.dojang)
            return false;
          if (applied.startDate && r.recommendationDate < applied.startDate)
            return false;
          if (applied.endDate && r.recommendationDate > applied.endDate)
            return false;
          if (applied.search) {
            const q = applied.search.toLowerCase().trim();
            const student = studentByUsername.get(r.studentUsername);
            const coach = coachByUsername.get(r.coachUsername);
            const haystack = [
              r.studentUsername,
              student?.namaLengkap ?? "",
              coach?.namaLengkap ?? "",
              r.category,
            ]
              .join(" ")
              .toLowerCase();
            if (!haystack.includes(q)) return false;
          }
          return true;
        })
        .sort((a, b) =>
          b.recommendationDate.localeCompare(a.recommendationDate),
        ),
    [recommendations, applied, studentByUsername, coachByUsername],
  );

  return (
    <>
      <PageHeader title="Student Recommendation" />

      <div className="bg-paper rounded-sm border border-ink/10 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
          <div className="lg:col-span-2">
            <Input
              label="Search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Student / coach / category..."
            />
          </div>
          <Select
            label="Dojang"
            value={dojangInput}
            onChange={(e) => setDojangInput(e.target.value)}
          >
            <option value="All">All</option>
            {DOJANG_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Start Date"
              type="date"
              value={startDateInput}
              onChange={(e) => setStartDateInput(e.target.value)}
            />
            <Input
              label="End Date"
              type="date"
              value={endDateInput}
              onChange={(e) => setEndDateInput(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchInput("");
              setDojangInput("All");
              setStartDateInput("");
              setEndDateInput("");
              setApplied({
                search: "",
                dojang: "All",
                startDate: "",
                endDate: "",
              });
            }}
          >
            Reset
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              setApplied({
                search: searchInput,
                dojang: dojangInput,
                startDate: startDateInput,
                endDate: endDateInput,
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
              <th className="text-left px-4 py-3.5 whitespace-nowrap">No</th>
              <th className="text-left px-4 py-3.5 whitespace-nowrap">
                Nama Lengkap
              </th>
              <th className="text-left px-4 py-3.5 whitespace-nowrap">
                Dojang
              </th>
              <th className="text-left px-4 py-3.5 whitespace-nowrap">Sabuk</th>
              <th className="text-left px-4 py-3.5 whitespace-nowrap">
                Category
              </th>
              <th className="text-left px-4 py-3.5 whitespace-nowrap">Coach</th>
              <th className="text-left px-4 py-3.5 whitespace-nowrap">
                Period
              </th>
              <th className="text-left px-4 py-3.5 whitespace-nowrap">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="text-center px-4 py-16 text-muted uppercase tracking-widest text-xs font-bold"
                >
                  No recommendations found
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const student = studentByUsername.get(r.studentUsername);
                const coach = coachByUsername.get(r.coachUsername);
                return (
                  <tr
                    key={r.id}
                    className="border-b border-ink/5 hover:bg-paper-soft/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-ink font-medium whitespace-nowrap">
                      {r.studentUsername}
                    </td>
                    <td className="px-4 py-3 text-ink whitespace-nowrap">
                      {student?.namaLengkap ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-ink whitespace-nowrap">
                      {r.dojang}
                    </td>
                    <td className="px-4 py-3 text-ink whitespace-nowrap">
                      {r.sabuk}
                    </td>
                    <td className="px-4 py-3 text-ink whitespace-nowrap">
                      {r.category}
                    </td>
                    <td className="px-4 py-3 text-ink whitespace-nowrap">
                      {coach?.namaLengkap ?? r.coachUsername}
                    </td>
                    <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                      Period {r.periodId}
                    </td>
                    <td className="px-4 py-3 text-ink/70 whitespace-nowrap text-xs">
                      {r.recommendationDate}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
