// src/app/app/(authenticated)/coach/schedule/ScheduleListClient.tsx
"use client";
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Pencil, Trash2, Eye, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageHeader from "@/components/app/PageHeader";
import {
  type Schedule,
  type ScheduleMember,
  DAYS_OF_WEEK,
  getSchedules,
  subscribeSchedules,
  deleteSchedule,
} from "../_shared/schedules";
import {
  useAcademic,
  getProgramById,
  getSubProgramById,
} from "../../student/_shared/academic";
import {
  getSchedulePeriods,
  subscribeSchedulePeriods,
} from "../../master/_shared/schedule-periods";
import { useDojangOptions } from "../../master/_shared/dojangs";
import {
  fetchStudentRecom,
  fetchStudentToRecom,
  saveStudentRecom,
} from "@/lib/api/recommendations";

export default function ScheduleListClient() {
  const router = useRouter();
  const { programs } = useAcademic();
  const dojangOptions = useDojangOptions();
  const schedules = useSyncExternalStore(
    subscribeSchedules,
    getSchedules,
    getSchedules,
  );
  const periods = useSyncExternalStore(
    subscribeSchedulePeriods,
    getSchedulePeriods,
    getSchedulePeriods,
  );

  const [kelasInput, setKelasInput] = useState("All");
  const [dojangInput, setDojangInput] = useState("All");
  const [periodInput, setPeriodInput] = useState("All");
  const [applied, setApplied] = useState({
    kelas: "All",
    dojang: "All",
    period: "All",
  });
  const [confirming, setConfirming] = useState<Schedule | null>(null);
  const [viewing, setViewing] = useState<Schedule | null>(null);
  const [actionError, setActionError] = useState("");

  // ── recommendations (per-period, fetched when the View modal opens) ──
  // A StudentRecommendation is keyed on (SchPeriodId, StudentId, main ProgramMsId)
  // and is INSERT-only — the backend has no un-recommend, so the star is one-way
  // and asks for confirmation. `recommendedIds` are students already recommended;
  // `candidateProgram` maps a still-recommendable student to the ProgramMsId to
  // save (the main program, from get-student-to-recom).
  const [recomLoading, setRecomLoading] = useState(false);
  const [recommendedIds, setRecommendedIds] = useState<Set<number>>(new Set());
  const [candidateProgram, setCandidateProgram] = useState<Map<number, number>>(
    new Map(),
  );
  const [recommending, setRecommending] = useState<ScheduleMember | null>(null);

  const loadRecommendations = useCallback(async (schPeriodId: number) => {
    setRecomLoading(true);
    try {
      const [recom, toRecom] = await Promise.all([
        fetchStudentRecom({ schPeriodId }),
        fetchStudentToRecom(schPeriodId),
      ]);
      setRecommendedIds(new Set(recom.map((r) => r.UserDataId)));
      setCandidateProgram(
        new Map(toRecom.map((c) => [c.StudentId, c.ProgramMsId])),
      );
    } catch {
      setRecommendedIds(new Set());
      setCandidateProgram(new Map());
    } finally {
      setRecomLoading(false);
    }
  }, []);

  const openView = (s: Schedule) => {
    setViewing(s);
    setRecommendedIds(new Set());
    setCandidateProgram(new Map());
    void loadRecommendations(s.schPeriodId);
  };

  const confirmRecommend = async () => {
    if (!viewing || !recommending) return;
    const programMsId = candidateProgram.get(recommending.studentId);
    const schPeriodId = viewing.schPeriodId;
    const studentId = recommending.studentId;
    setRecommending(null);
    if (!programMsId) return;
    try {
      await saveStudentRecom({
        SchPeriodId: schPeriodId,
        DataRecomStudent: [{ StudentId: studentId, ProgramMsId: programMsId }],
      });
      await loadRecommendations(schPeriodId);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to save recommendation",
      );
    }
  };

  const filtered = useMemo(
    () =>
      schedules
        .filter((s) => {
          if (applied.kelas !== "All" && String(s.programId) !== applied.kelas)
            return false;
          if (applied.dojang !== "All" && s.dojang !== applied.dojang)
            return false;
          if (
            applied.period !== "All" &&
            String(s.schPeriodId) !== applied.period
          )
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

  const periodObj =
    applied.period !== "All"
      ? periods.find((p) => String(p.id) === applied.period)
      : null;

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
            <option value="All">All</option>
            {periods.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.periodName}
                {p.dojang ? ` · ${p.dojang}` : ""}
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
          {periodObj.periodName}
          {periodObj.dojang ? ` · ${periodObj.dojang}` : ""}
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
                <th className="text-right px-4 py-3.5 whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center px-4 py-16 text-muted uppercase tracking-widest text-xs font-bold"
                  >
                    No schedules found
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const program = getProgramById(s.programId);
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
                        {s.primaryCoachName || s.primaryCoachUsername}
                        {s.additionalCoaches.length > 0 && (
                          <span className="text-muted text-xs ml-1">
                            (+{s.additionalCoaches.length})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {getSubProgramById(s.subProgramId)?.name ??
                          s.subProgramId}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openView(s)}
                          className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm hover:brightness-95 transition"
                        >
                          <Eye size={12} /> View ({s.members.length})
                        </button>
                      </td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                        {s.startTime}
                      </td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                        {s.endTime}
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
                            title="Delete"
                            className="bg-brand text-brand-foreground p-1.5 rounded-sm hover:bg-brand-hover transition"
                          >
                            <Trash2 size={14} />
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
                        {viewing.primaryCoachName ||
                          viewing.primaryCoachUsername}
                      </td>
                      <td className="px-3 py-2 text-ink/70">Primary Coach</td>
                    </tr>
                    {viewing.additionalCoaches.map((c) => (
                      <tr key={c.scheduleCoachId} className="border-t border-ink/5">
                        <td className="px-3 py-2 font-medium text-ink">
                          {c.username}
                        </td>
                        <td className="px-3 py-2 text-ink">
                          {c.name || c.username}
                        </td>
                        <td className="px-3 py-2 text-ink/70">Coach</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Members */}
            <div className="text-xs text-muted uppercase tracking-widest font-bold">
              {viewing.members.length} members enrolled
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
                  {viewing.members.map((m) => {
                    const recommended = recommendedIds.has(m.studentId);
                    const isCandidate = candidateProgram.has(m.studentId);
                    const disabled =
                      recomLoading || recommended || !isCandidate;
                    return (
                      <tr key={m.scheduleMbrId} className="border-t border-ink/5">
                        <td className="px-3 py-2 font-medium text-ink">
                          {m.username}
                        </td>
                        <td className="px-3 py-2 text-ink">{m.name || "-"}</td>
                        <td className="px-3 py-2 text-ink/70">
                          {m.dojang || "-"}
                        </td>
                        <td className="px-3 py-2 text-ink/70">
                          {m.belt || "-"}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={() => setRecommending(m)}
                            disabled={disabled}
                            title={
                              recommended
                                ? "Recommended (cannot be undone)"
                                : recomLoading
                                  ? "Loading…"
                                  : isCandidate
                                    ? "Mark as recommended"
                                    : "Not eligible for recommendation this period"
                            }
                            className={cn(
                              "inline-flex items-center justify-center p-1.5 rounded-sm transition",
                              recommended
                                ? "bg-accent text-accent-foreground"
                                : "border border-ink/15 text-muted",
                              disabled
                                ? "cursor-not-allowed opacity-60"
                                : "hover:text-ink hover:border-ink/30",
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
        onConfirm={async () => {
          if (!confirming) return;
          try {
            await deleteSchedule(confirming.id);
          } catch (err) {
            setActionError(
              err instanceof Error ? err.message : "Failed to delete schedule",
            );
          }
        }}
        title="Delete Schedule"
        description={
          confirming
            ? `Delete the ${confirming.dayOfWeek} ${confirming.startTime} schedule? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        variant="destructive"
      />

      <ConfirmDialog
        open={recommending !== null}
        onClose={() => setRecommending(null)}
        onConfirm={confirmRecommend}
        title="Confirm Recommendation"
        description={
          recommending
            ? `Mark ${recommending.name || recommending.username} as recommended for this period? This cannot be undone — there is no way to remove a recommendation once saved.`
            : ""
        }
        confirmLabel="Recommend"
        variant="primary"
      />

      <Modal
        open={actionError !== ""}
        onClose={() => setActionError("")}
        title="Cannot Delete Schedule"
        size="sm"
      >
        <p className="text-sm text-ink/80">{actionError}</p>
        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={() => setActionError("")}>
            Close
          </Button>
        </div>
      </Modal>
    </>
  );
}
