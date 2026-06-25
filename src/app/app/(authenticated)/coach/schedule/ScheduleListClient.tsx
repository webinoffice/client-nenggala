// src/app/app/(authenticated)/coach/schedule/ScheduleListClient.tsx
"use client";
import { getCurrentUsername } from "@/lib/current-user";
import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Pencil, Ban, Power, Eye, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageHeader from "@/components/app/PageHeader";
import {
  type Schedule,
  DAYS_OF_WEEK,
  getSchedules,
  subscribeSchedules,
  toggleScheduleStatus,
} from "../_shared/schedules";
import {
  useAcademic,
  formatPeriod,
  getProgramById,
  getPeriodById,
  getSubProgramById,
} from "../../student/_shared/academic";
import {
  getStudents,
  subscribeStudents,
} from "../../student/_shared/students";
import { useDojangOptions } from "../../master/_shared/dojangs";
import {
  addRecommendation,
  findRecommendation,
  getNextRecommendationId,
  getRecommendations,
  removeRecommendation,
  subscribeRecommendations,
} from "../_shared/recommendations";
import { getCoaches, subscribeCoaches } from "../_shared/coaches";


export default function ScheduleListClient() {
  const router = useRouter();
  const { programs, periods } = useAcademic();
  const dojangOptions = useDojangOptions();
  const schedules = useSyncExternalStore(
    subscribeSchedules,
    getSchedules,
    getSchedules,
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
  useSyncExternalStore(
    subscribeRecommendations,
    getRecommendations,
    getRecommendations,
  );

  const [kelasInput, setKelasInput] = useState("All");
  const [dojangInput, setDojangInput] = useState("All");
  const [periodInput, setPeriodInput] = useState("32");
  const [applied, setApplied] = useState({
    kelas: "All",
    dojang: "All",
    period: "32",
  });
  const [confirming, setConfirming] = useState<Schedule | null>(null);
  const [viewing, setViewing] = useState<Schedule | null>(null);

  const coachByUsername = useMemo(
    () => new Map(coaches.map((c) => [c.username, c])),
    [coaches],
  );
  const studentByUsername = useMemo(
    () => new Map(students.map((s) => [s.username, s])),
    [students],
  );

  const filtered = useMemo(
    () =>
      schedules
        .filter((s) => {
          if (applied.kelas !== "All" && String(s.programId) !== applied.kelas)
            return false;
          if (applied.dojang !== "All" && s.dojang !== applied.dojang)
            return false;
          if (applied.period !== "All" && s.periodId !== applied.period)
            return false;
          return true;
        })
        .sort(
          (a, b) =>
            DAYS_OF_WEEK.indexOf(a.dayOfWeek) -
            DAYS_OF_WEEK.indexOf(b.dayOfWeek),
        ),
    [schedules, applied],
  );

  const periodObj = getPeriodById(applied.period);

  const handleToggleRecommendation = (
    schedule: Schedule,
    studentUsername: string,
  ) => {
    const existing = findRecommendation(studentUsername, schedule.id);
    if (existing) {
      removeRecommendation(existing.id);
      return;
    }
    const student = studentByUsername.get(studentUsername);
    if (!student) return;
    const subProgram = getSubProgramById(schedule.subProgramId);
    addRecommendation({
      id: getNextRecommendationId(),
      studentUsername,
      scheduleId: schedule.id,
      dojang: student.dojang,
      sabuk: student.sabuk,
      category: subProgram?.name ?? String(schedule.subProgramId),
      coachUsername: schedule.primaryCoachUsername,
      periodId: schedule.periodId,
      recommendationDate: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <>
      <PageHeader
        title="Schedule Management"
        actions={
          <Button onClick={() => router.push("/app/coach/schedule/new")}>
            <Plus size={16} />
            Add Schedule
          </Button>
        }
      />

      <div className="bg-paper rounded-sm border border-ink/10 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
          <Select
            label="Kelas (Program)"
            value={kelasInput}
            onChange={(e) => setKelasInput(e.target.value)}
          >
            <option value="All">All</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
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
          <Select
            label="Period"
            value={periodInput}
            onChange={(e) => setPeriodInput(e.target.value)}
          >
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {formatPeriod(p)}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-center justify-end gap-2 mt-6">
          <Button
            variant="secondary"
            onClick={() =>
              setApplied({
                kelas: kelasInput,
                dojang: dojangInput,
                period: periodInput,
              })
            }
          >
            <Search size={16} />
            Search
          </Button>
        </div>
      </div>

      {periodObj && (
        <div className="font-display font-bold uppercase tracking-widest text-sm text-ink mb-3">
          {formatPeriod(periodObj)}
        </div>
      )}

      <div className="bg-paper rounded-sm border border-ink/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-ink/15 bg-paper-soft font-display text-[11px] font-bold uppercase tracking-widest text-ink/70">
                <th className="text-left px-4 py-3.5 whitespace-nowrap">
                  Day / Week
                </th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">
                  Class
                </th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">
                  Coach
                </th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">
                  Type
                </th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">
                  Member List
                </th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">
                  Start Time
                </th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">
                  End Time
                </th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">
                  Status
                </th>
                <th className="text-right px-4 py-3.5 whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center px-4 py-16 text-muted uppercase tracking-widest text-xs font-bold"
                  >
                    No schedules found
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const program = getProgramById(s.programId);
                  const primaryCoach = coachByUsername.get(
                    s.primaryCoachUsername,
                  );
                  const secondaryNames = s.secondaryCoachUsernames.map(
                    (u) => coachByUsername.get(u)?.panggilan ?? u,
                  );
                  const isActive = s.status === "Active";
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-ink/5 hover:bg-paper-soft/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-ink font-medium whitespace-nowrap">
                        {s.dayOfWeek}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {program?.name ?? s.programId}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {primaryCoach?.namaLengkap ?? s.primaryCoachUsername}
                        {secondaryNames.length > 0 && (
                          <span className="text-muted text-xs ml-1">
                            (+{secondaryNames.length})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {getSubProgramById(s.subProgramId)?.name ??
                          s.subProgramId}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setViewing(s)}
                          className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm hover:brightness-95 transition"
                        >
                          <Eye size={12} /> View ({s.studentUsernames.length})
                        </button>
                      </td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                        {s.startTime}
                      </td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                        {s.endTime}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-2 text-xs font-semibold">
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              isActive
                                ? "bg-emerald-500"
                                : "bg-muted-foreground",
                            )}
                          />
                          <span
                            className={isActive ? "text-ink" : "text-muted"}
                          >
                            {s.status}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() =>
                              router.push(`/app/coach/schedule/${s.id}/edit`)
                            }
                            title="Update"
                            className="bg-accent text-accent-foreground p-1.5 rounded-sm hover:brightness-95 transition"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setConfirming(s)}
                            title={isActive ? "Disable" : "Enable"}
                            className={cn(
                              "p-1.5 rounded-sm transition",
                              isActive
                                ? "bg-brand text-brand-foreground hover:bg-brand-hover"
                                : "bg-ink text-paper hover:bg-ink-soft",
                            )}
                          >
                            {isActive ? <Ban size={14} /> : <Power size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View students modal */}
      <Modal
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title={
          viewing
            ? `${viewing.dayOfWeek} · ${getProgramById(viewing.programId)?.name ?? viewing.programId} · ${getSubProgramById(viewing.subProgramId)?.name ?? viewing.subProgramId}`
            : ""
        }
        size="lg"
      >
        {viewing && (
          <div className="space-y-4">
            {/* Coaches */}
            <div>
              <div className="text-xs text-muted uppercase tracking-widest font-bold mb-2">
                Coaches
              </div>
              <div className="border border-ink/10 rounded-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-paper-soft font-display text-[11px] font-bold uppercase tracking-widest text-ink/70">
                    <tr>
                      <th className="text-left px-3 py-2">No. Reg</th>
                      <th className="text-left px-3 py-2">Nama</th>
                      <th className="text-left px-3 py-2">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-ink/5">
                      <td className="px-3 py-2 font-medium text-ink">
                        {viewing.primaryCoachUsername}
                      </td>
                      <td className="px-3 py-2 text-ink">
                        {coachByUsername.get(viewing.primaryCoachUsername)
                          ?.namaLengkap ?? viewing.primaryCoachUsername}
                      </td>
                      <td className="px-3 py-2 text-ink/70">Primary Coach</td>
                    </tr>
                    {viewing.secondaryCoachUsernames.map((u) => (
                      <tr key={u} className="border-t border-ink/5">
                        <td className="px-3 py-2 font-medium text-ink">{u}</td>
                        <td className="px-3 py-2 text-ink">
                          {coachByUsername.get(u)?.namaLengkap ?? u}
                        </td>
                        <td className="px-3 py-2 text-ink/70">Coach</td>
                      </tr>
                    ))}
                    {viewing.assistantUsernames.map((u) => (
                      <tr key={u} className="border-t border-ink/5">
                        <td className="px-3 py-2 font-medium text-ink">{u}</td>
                        <td className="px-3 py-2 text-ink">
                          {coachByUsername.get(u)?.namaLengkap ??
                            studentByUsername.get(u)?.namaLengkap ??
                            u}
                        </td>
                        <td className="px-3 py-2 text-ink/70">
                          {coachByUsername.has(u)
                            ? "Assistant (Coach)"
                            : "Assistant (Student)"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Members */}
            <div className="text-xs text-muted uppercase tracking-widest font-bold">
              {viewing.studentUsernames.length} members enrolled
            </div>
            <div className="border border-ink/10 rounded-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-paper-soft font-display text-[11px] font-bold uppercase tracking-widest text-ink/70">
                  <tr>
                    <th className="text-left px-3 py-2">No. Reg</th>
                    <th className="text-left px-3 py-2">Nama</th>
                    <th className="text-left px-3 py-2">Dojang</th>
                    <th className="text-left px-3 py-2">Sabuk</th>
                    <th className="text-right px-3 py-2">Recommend</th>
                  </tr>
                </thead>
                <tbody>
                  {viewing.studentUsernames.map((u) => {
                    const s = studentByUsername.get(u);
                    const recommended =
                      findRecommendation(u, viewing.id) !== null;
                    return (
                      <tr key={u} className="border-t border-ink/5">
                        <td className="px-3 py-2 font-medium text-ink">{u}</td>
                        <td className="px-3 py-2 text-ink">
                          {s?.namaLengkap ?? "-"}
                        </td>
                        <td className="px-3 py-2 text-ink/70">
                          {s?.dojang ?? "-"}
                        </td>
                        <td className="px-3 py-2 text-ink/70">
                          {s?.sabuk ?? "-"}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={() =>
                              handleToggleRecommendation(viewing, u)
                            }
                            title={
                              recommended
                                ? "Remove recommendation"
                                : "Mark as recommended"
                            }
                            className={cn(
                              "inline-flex items-center justify-center p-1.5 rounded-sm transition",
                              recommended
                                ? "bg-accent text-accent-foreground hover:brightness-95"
                                : "border border-ink/15 text-muted hover:text-ink hover:border-ink/30",
                            )}
                          >
                            <Star
                              size={14}
                              fill={recommended ? "currentColor" : "none"}
                            />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirming !== null}
        onClose={() => setConfirming(null)}
        onConfirm={() => {
          if (confirming) toggleScheduleStatus(confirming.id, getCurrentUsername());
        }}
        title={
          confirming?.status === "Inactive"
            ? "Enable Schedule"
            : "Disable Schedule"
        }
        description={
          confirming
            ? confirming.status === "Inactive"
              ? `Enable ${confirming.dayOfWeek} schedule (${confirming.id})?`
              : `Disable ${confirming.dayOfWeek} schedule (${confirming.id})?`
            : ""
        }
        confirmLabel={confirming?.status === "Inactive" ? "Enable" : "Disable"}
        variant={confirming?.status === "Inactive" ? "primary" : "destructive"}
      />
    </>
  );
}
