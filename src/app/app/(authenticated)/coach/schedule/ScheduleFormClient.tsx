// src/app/app/(authenticated)/coach/schedule/ScheduleFormClient.tsx
"use client";
import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import PageHeader from "@/components/app/PageHeader";
import {
  type Schedule,
  type DayOfWeek,
  DAYS_OF_WEEK,
  getScheduleById,
  saveSchedule,
} from "../_shared/schedules";
import { fetchInstructorSchTrans } from "@/lib/api/schedules";
import { useAcademic } from "../../student/_shared/academic";
import {
  getSchedulePeriods,
  subscribeSchedulePeriods,
} from "../../master/_shared/schedule-periods";
import { getStudents, subscribeStudents } from "../../student/_shared/students";
import { useDojangOptions } from "../../master/_shared/dojangs";
import { getCoaches, subscribeCoaches } from "../_shared/coaches";

// Selectable additional-coach pool entry (get-instructor-schtrans: type-I
// coaches UNION type-S students flagged FgAssist='Y').
type CoachPoolEntry = {
  coachId: number;
  username: string;
  name: string;
  isAssistant: boolean;
};

interface Props {
  mode: "new" | "edit";
  id?: string;
}

export default function ScheduleFormClient({ mode, id }: Props) {
  const router = useRouter();
  const isEditing = mode === "edit";
  const { programs, subPrograms } = useAcademic();
  const dojangOptions = useDojangOptions();
  const periods = useSyncExternalStore(
    subscribeSchedulePeriods,
    getSchedulePeriods,
    getSchedulePeriods,
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

  const [editing] = useState<Schedule | null>(() =>
    isEditing && id ? getScheduleById(Number(id)) : null,
  );

  const [dojang, setDojang] = useState(editing?.dojang ?? "");
  // Program/sub-program/period selects are string-native; converted to numeric
  // (ProgramMsId/ProgramDtId/SchPeriodId) when building the write payload.
  const [programId, setProgramId] = useState(
    editing ? String(editing.programId) : "",
  );
  const [subProgramId, setSubProgramId] = useState(
    editing ? String(editing.subProgramId) : "",
  );
  const [primaryCoach, setPrimaryCoach] = useState(
    editing?.primaryCoachUsername ?? "",
  );
  // Additional coaches/assistants are a single flat ScheduleCoach list (keyed by
  // UserDataId), sourced from get-instructor-schtrans.
  const [additionalCoachIds, setAdditionalCoachIds] = useState<number[]>(
    editing?.additionalCoaches.map((c) => c.coachId) ?? [],
  );
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek | "">(
    editing?.dayOfWeek ?? "",
  );
  const [startTime, setStartTime] = useState(editing?.startTime ?? "");
  const [endTime, setEndTime] = useState(editing?.endTime ?? "");
  const [periodId, setPeriodId] = useState(
    editing ? String(editing.schPeriodId) : "",
  );
  const [dateStart, setDateStart] = useState(editing?.dateStart ?? "");
  const [dateEnd, setDateEnd] = useState(editing?.dateEnd ?? "");
  const [enrolledStudents, setEnrolledStudents] = useState<string[]>(
    editing?.studentUsernames ?? [],
  );

  // additional-coach pool (fetched once)
  const [coachPool, setCoachPool] = useState<CoachPoolEntry[]>([]);
  useEffect(() => {
    let alive = true;
    fetchInstructorSchTrans()
      .then((rows) => {
        if (!alive) return;
        setCoachPool(
          (rows ?? []).map((r) => ({
            coachId: r.CoachId,
            username: r.CoachNoId ?? "",
            name: r.CoachName ?? r.CoachNoId ?? "",
            isAssistant: r.FgAssist === "Y",
          })),
        );
      })
      .catch(() => {
        /* leave the pool empty; the picker just shows nothing to add */
      });
    return () => {
      alive = false;
    };
  }, []);

  // pickers
  const [additionalPick, setAdditionalPick] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // ── hooks (must always run, in stable order) ──
  const coachByUsername = useMemo(
    () => new Map(coaches.map((c) => [c.username, c])),
    [coaches],
  );
  const studentByUsername = useMemo(
    () => new Map(students.map((s) => [s.username, s])),
    [students],
  );
  // username → UserDataId (StudentId), merging the live store with the loaded
  // schedule's own members so edit-mode rosters always resolve.
  const studentIdByUsername = useMemo(() => {
    const m = new Map<string, number>();
    students.forEach((s) => {
      if (s.userDataId) m.set(s.username, s.userDataId);
    });
    (editing?.members ?? []).forEach((mem) => m.set(mem.username, mem.studentId));
    return m;
  }, [students, editing]);
  // coachId → display, merging the pool with the loaded schedule's coaches.
  const coachNameById = useMemo(() => {
    const m = new Map<number, string>();
    coachPool.forEach((c) =>
      m.set(c.coachId, c.isAssistant ? `${c.name} (Assistant)` : c.name),
    );
    (editing?.additionalCoaches ?? []).forEach((c) => {
      if (!m.has(c.coachId)) m.set(c.coachId, c.name || c.username);
    });
    return m;
  }, [coachPool, editing]);
  const availableSubPrograms = useMemo(
    () =>
      programId
        ? subPrograms.filter((sp) => String(sp.programId) === programId)
        : [],
    [programId, subPrograms],
  );
  // Periods are per-dojang; once a dojang is chosen only its periods apply.
  const availablePeriods = useMemo(
    () => (dojang ? periods.filter((p) => p.dojang === dojang) : periods),
    [dojang, periods],
  );
  // The chosen period bounds the schedule's dates (backend enforces this too).
  // periodEnd may be "" for an open-ended period → no upper bound.
  const selectedPeriod = useMemo(
    () => periods.find((p) => String(p.id) === periodId) ?? null,
    [periods, periodId],
  );
  const primaryCoachId = coachByUsername.get(primaryCoach)?.userDataId ?? 0;
  const availableAdditional = useMemo(
    () =>
      coachPool.filter(
        (c) =>
          c.coachId !== primaryCoachId &&
          !additionalCoachIds.includes(c.coachId),
      ),
    [coachPool, primaryCoachId, additionalCoachIds],
  );
  const studentResults = useMemo(() => {
    const q = studentSearch.toLowerCase().trim();
    if (!q) return [];
    return students
      .filter(
        (s) =>
          !enrolledStudents.includes(s.username) &&
          (s.namaLengkap.toLowerCase().includes(q) ||
            s.username.toLowerCase().includes(q)),
      )
      .slice(0, 8);
  }, [studentSearch, students, enrolledStudents]);

  // ── early return only AFTER all hooks ──
  if (isEditing && !editing) {
    return (
      <>
        <PageHeader title="Schedule Not Found" />
        <div className="bg-paper rounded-sm border border-ink/10 p-10 text-center">
          <p className="text-muted text-sm">
            No schedule with id{" "}
            <span className="text-ink font-medium">{id}</span>.
          </p>
          <div className="mt-6 flex justify-center">
            <Button
              variant="outline"
              onClick={() => router.push("/app/coach/schedule")}
            >
              <ArrowLeft size={16} /> Back
            </Button>
          </div>
        </div>
      </>
    );
  }

  const validate = () => {
    const e: Record<string, string> = {};
    if (!dojang) e.dojang = "Required";
    if (!programId) e.programId = "Required";
    if (!subProgramId) e.subProgramId = "Required";
    if (!primaryCoach) e.primaryCoach = "Required";
    if (!dayOfWeek) e.dayOfWeek = "Required";
    if (!startTime) e.startTime = "Required";
    if (!endTime) e.endTime = "Required";
    else if (startTime && endTime && endTime <= startTime)
      e.endTime = "Must be after start";
    if (!periodId) e.periodId = "Required";
    if (!dateStart) e.dateStart = "Required";
    if (!dateEnd) e.dateEnd = "Required";
    else if (dateStart && dateEnd && dateEnd < dateStart)
      e.dateEnd = "Must be after start";
    // A schedule must stay within its period's date range.
    if (selectedPeriod) {
      if (dateStart && dateStart < selectedPeriod.periodStart)
        e.dateStart = `Cannot be before period start (${selectedPeriod.periodStart})`;
      if (
        dateEnd &&
        selectedPeriod.periodEnd &&
        dateEnd > selectedPeriod.periodEnd
      )
        e.dateEnd = `Cannot be after period end (${selectedPeriod.periodEnd})`;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaveError("");
    setSaving(true);
    const memberIds = enrolledStudents
      .map((u) => studentIdByUsername.get(u) ?? 0)
      .filter((n) => n > 0);
    const coachIds = additionalCoachIds.filter((cid) => cid !== primaryCoachId);
    try {
      await saveSchedule({
        id: editing?.id ?? null,
        schPeriodId: Number(periodId),
        dateStart,
        dateEnd,
        startTime,
        endTime,
        dayScheduleNum: DAYS_OF_WEEK.indexOf(dayOfWeek as DayOfWeek),
        subProgramId: Number(subProgramId),
        primaryCoachId,
        memberIds,
        coachIds,
      });
      router.push("/app/coach/schedule");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save schedule");
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title={isEditing ? "Update Schedule" : "Add Schedule"}
        description={isEditing ? `Editing #${editing?.id}` : "New schedule"}
        actions={
          <Button
            variant="outline"
            onClick={() => router.push("/app/coach/schedule")}
          >
            <ArrowLeft size={16} /> Back
          </Button>
        }
      />

      <div className="space-y-6 max-w-4xl">
        <FormSection title="Schedule Info">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <Select
              label="Dojang"
              value={dojang}
              onChange={(e) => {
                setDojang(e.target.value);
                setPeriodId(""); // ← reset period when dojang changes
              }}
              error={errors.dojang}
              disabled={isEditing}
            >
              <option value="">Pilih Dojang</option>
              {dojangOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
            <Select
              label="Program (Class)"
              value={programId}
              onChange={(e) => {
                setProgramId(e.target.value);
                setSubProgramId(""); // ← reset sub-program when program changes
              }}
              error={errors.programId}
              disabled={isEditing}
            >
              <option value="">Pilih Program</option>
              {programs.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.name}
                </option>
              ))}
            </Select>
            <Select
              label="Type (Sub Program)"
              value={subProgramId}
              onChange={(e) => setSubProgramId(e.target.value)}
              error={errors.subProgramId}
              disabled={!programId || isEditing}
            >
              <option value="">
                {programId ? "Pilih Sub Program" : "Pilih Program dulu"}
              </option>
              {availableSubPrograms.map((sp) => (
                <option key={sp.id} value={String(sp.id)}>
                  {sp.name}
                </option>
              ))}
            </Select>
            <Select
              label="Day of Week"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
              error={errors.dayOfWeek}
              disabled={isEditing}
            >
              <option value="">Pilih Hari</option>
              {DAYS_OF_WEEK.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
            <Input
              label="Start Time (24H)"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              error={errors.startTime}
              disabled={isEditing}
            />
            <Input
              label="End Time (24H)"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              error={errors.endTime}
            />
          </div>
        </FormSection>

        <FormSection title="Period & Dates">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
            <Select
              label="Period"
              value={periodId}
              onChange={(e) => setPeriodId(e.target.value)}
              error={errors.periodId}
              disabled={!dojang || isEditing}
            >
              <option value="">
                {dojang ? "Pilih Period" : "Pilih Dojang dulu"}
              </option>
              {availablePeriods.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.periodName}
                </option>
              ))}
            </Select>
            <Input
              label="Date Start"
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              error={errors.dateStart}
              disabled={isEditing}
              min={selectedPeriod?.periodStart || undefined}
              max={selectedPeriod?.periodEnd || undefined}
            />
            <Input
              label="Date End"
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              error={errors.dateEnd}
              min={dateStart || selectedPeriod?.periodStart || undefined}
              max={selectedPeriod?.periodEnd || undefined}
            />
          </div>
        </FormSection>

        <FormSection title="Coaches">
          <div className="space-y-5">
            <Select
              label="Primary Coach (responsible for attendance)"
              value={primaryCoach}
              onChange={(e) => {
                setPrimaryCoach(e.target.value);
                // Drop the new PIC from the additional list if present.
                const pid = coachByUsername.get(e.target.value)?.userDataId;
                if (pid != null)
                  setAdditionalCoachIds((arr) =>
                    arr.filter((cid) => cid !== pid),
                  );
              }}
              error={errors.primaryCoach}
              disabled={!programId || isEditing}
            >
              <option value="">
                {programId ? "Pilih Coach" : "Pilih Program dulu"}
              </option>
              {coaches.map((c) => (
                <option key={c.username} value={c.username}>
                  {c.namaLengkap}
                </option>
              ))}
            </Select>

            <ChipPicker
              label="Additional Coaches & Assistants (optional)"
              selected={additionalCoachIds.map((cid) => ({
                value: String(cid),
                label: coachNameById.get(cid) ?? String(cid),
              }))}
              pickerValue={additionalPick}
              setPickerValue={setAdditionalPick}
              options={availableAdditional.map((c) => ({
                value: String(c.coachId),
                label: c.isAssistant ? `${c.name} (Assistant)` : c.name,
              }))}
              onAdd={() => {
                if (additionalPick) {
                  setAdditionalCoachIds((arr) => [...arr, Number(additionalPick)]);
                  setAdditionalPick("");
                }
              }}
              onRemove={(v) =>
                setAdditionalCoachIds((arr) =>
                  arr.filter((cid) => cid !== Number(v)),
                )
              }
              emptyHint="No additional coaches assigned."
            />
          </div>
        </FormSection>

        <FormSection title="Members">
          <div className="space-y-4">
            <div className="relative">
              <Input
                label="Search Members"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Type name or No. Reg..."
              />
              {studentResults.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-paper border border-ink/15 rounded-sm shadow-lg max-h-64 overflow-y-auto">
                  {studentResults.map((s) => (
                    <button
                      key={s.username}
                      type="button"
                      onClick={() => {
                        setEnrolledStudents((arr) => [...arr, s.username]);
                        setStudentSearch("");
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-paper-soft border-b border-ink/5 last:border-0 flex items-center justify-between"
                    >
                      <span>
                        <span className="font-medium text-ink">
                          {s.username}
                        </span>
                        <span className="text-ink ml-2">{s.namaLengkap}</span>
                      </span>
                      <span className="text-xs text-muted">
                        {s.dojang} · {s.sabuk}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="border border-ink/10 rounded-sm overflow-hidden">
              {enrolledStudents.length === 0 ? (
                <div className="text-center py-8 text-muted uppercase tracking-widest text-xs font-bold">
                  No members enrolled yet
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-paper-soft font-display text-[11px] font-bold uppercase tracking-widest text-ink/70">
                    <tr>
                      <th className="text-left px-3 py-2">No. Reg</th>
                      <th className="text-left px-3 py-2">Nama</th>
                      <th className="text-left px-3 py-2">Dojang</th>
                      <th className="text-left px-3 py-2">Sabuk</th>
                      <th className="text-right px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrolledStudents.map((u) => {
                      const s = studentByUsername.get(u);
                      return (
                        <tr key={u} className="border-t border-ink/5">
                          <td className="px-3 py-2 font-medium text-ink">
                            {u}
                          </td>
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
                                setEnrolledStudents((arr) =>
                                  arr.filter((x) => x !== u),
                                )
                              }
                              className="text-muted hover:text-brand transition"
                              title="Remove"
                            >
                              <X size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </FormSection>

        {saveError && (
          <div className="bg-brand/10 border border-brand/30 rounded-sm px-4 py-3 text-sm text-brand">
            {saveError}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 pb-4">
          <Button
            variant="outline"
            onClick={() => router.push("/app/coach/schedule")}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving
              ? "Saving…"
              : isEditing
                ? "Save Changes"
                : "Add Schedule"}
          </Button>
        </div>
      </div>
    </>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-paper rounded-sm border border-ink/10 p-6">
      <h2 className="font-display text-sm font-bold uppercase tracking-widest text-ink mb-5">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ChipPicker({
  label,
  selected,
  options,
  pickerValue,
  setPickerValue,
  onAdd,
  onRemove,
  emptyHint,
}: {
  label: string;
  selected: { value: string; label: string }[];
  options: { value: string; label: string }[];
  pickerValue: string;
  setPickerValue: (v: string) => void;
  onAdd: () => void;
  onRemove: (v: string) => void;
  emptyHint: string;
}) {
  return (
    <div>
      <div className="font-display text-[11px] font-bold uppercase tracking-widest text-ink mb-2">
        {label}
      </div>
      {selected.length === 0 ? (
        <div className="text-xs text-muted italic mb-3">{emptyHint}</div>
      ) : (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {selected.map((s) => (
            <span
              key={s.value}
              className="inline-flex items-center gap-1.5 bg-paper-soft border border-ink/15 text-sm text-ink px-2 py-1 rounded-sm"
            >
              {s.label}
              <button
                onClick={() => onRemove(s.value)}
                className="text-muted hover:text-brand transition"
                title="Remove"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <select
          value={pickerValue}
          onChange={(e) => setPickerValue(e.target.value)}
          className="flex-1 rounded-sm border border-ink/15 px-3 py-2 text-sm focus:outline-none focus:border-ink/40 bg-paper"
        >
          <option value="">Select to add...</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Button
          variant="outline"
          size="sm"
          onClick={onAdd}
          disabled={!pickerValue}
        >
          <Plus size={14} /> Add
        </Button>
      </div>
    </div>
  );
}
