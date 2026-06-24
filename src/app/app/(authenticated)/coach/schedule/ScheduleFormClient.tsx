// src/app/app/(authenticated)/coach/schedule/ScheduleFormClient.tsx
"use client";
import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
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
  addSchedule,
  getScheduleById,
  getNextScheduleId,
  updateSchedule,
} from "../_shared/schedules";
import {
  PROGRAMS,
  SUB_PROGRAMS,
  PERIODS,
  formatPeriod,
} from "../../student/_shared/academic";
import {
  DOJANG_OPTIONS,
  getStudents,
  subscribeStudents,
} from "../../student/_shared/students";
import { getCoaches, subscribeCoaches } from "../_shared/coaches";

const CURRENT_USER = "Carolina";

interface Props {
  mode: "new" | "edit";
  id?: string;
}

export default function ScheduleFormClient({ mode, id }: Props) {
  const router = useRouter();
  const isEditing = mode === "edit";
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
    isEditing && id ? getScheduleById(id) : null,
  );
  const [scheduleId] = useState(() => editing?.id ?? getNextScheduleId());

  const [dojang, setDojang] = useState(editing?.dojang ?? "");
  const [programId, setProgramId] = useState(editing?.programId ?? "");
  const [subProgramId, setSubProgramId] = useState(editing?.subProgramId ?? "");
  const [primaryCoach, setPrimaryCoach] = useState(
    editing?.primaryCoachUsername ?? "",
  );
  const [secondaryCoaches, setSecondaryCoaches] = useState<string[]>(
    editing?.secondaryCoachUsernames ?? [],
  );
  const [assistants, setAssistants] = useState<string[]>(
    editing?.assistantUsernames ?? [],
  );
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek | "">(
    editing?.dayOfWeek ?? "",
  );
  const [startTime, setStartTime] = useState(editing?.startTime ?? "");
  const [endTime, setEndTime] = useState(editing?.endTime ?? "");
  const [periodId, setPeriodId] = useState(editing?.periodId ?? "");
  const [startSchedule, setStartSchedule] = useState(
    editing?.startSchedule ?? "",
  );
  const [endSchedule, setEndSchedule] = useState(editing?.endSchedule ?? "");
  const [enrolledStudents, setEnrolledStudents] = useState<string[]>(
    editing?.studentUsernames ?? [],
  );

  // pickers
  const [secondaryPick, setSecondaryPick] = useState("");
  const [assistantPick, setAssistantPick] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── hooks (must always run, in stable order) ──
  const coachByUsername = useMemo(
    () => new Map(coaches.map((c) => [c.username, c])),
    [coaches],
  );
  const studentByUsername = useMemo(
    () => new Map(students.map((s) => [s.username, s])),
    [students],
  );
  const availableSubPrograms = useMemo(
    () =>
      programId ? SUB_PROGRAMS.filter((sp) => sp.programId === programId) : [],
    [programId],
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

  // ── plain derived values (no hooks) can live below the early return ──
  const availableSecondary = coaches.filter(
    (c) =>
      c.username !== primaryCoach && !secondaryCoaches.includes(c.username),
  );
  const availableAssistants = [
    ...coaches
      .filter((c) => !assistants.includes(c.username))
      .map((c) => ({ value: c.username, label: `${c.namaLengkap} (Coach)` })),
    ...students
      .filter((s) => !assistants.includes(s.username))
      .map((s) => ({ value: s.username, label: `${s.namaLengkap} (Student)` })),
  ];

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
    if (!startSchedule) e.startSchedule = "Required";
    if (!endSchedule) e.endSchedule = "Required";
    else if (startSchedule && endSchedule && endSchedule < startSchedule)
      e.endSchedule = "Must be after start";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const payload: Schedule = {
      id: scheduleId,
      dojang,
      programId,
      subProgramId,
      primaryCoachUsername: primaryCoach,
      secondaryCoachUsernames: secondaryCoaches,
      assistantUsernames: assistants,
      dayOfWeek: dayOfWeek as DayOfWeek,
      startTime,
      endTime,
      periodId,
      startSchedule,
      endSchedule,
      studentUsernames: enrolledStudents,
      status: editing?.status ?? "Active",
      updatedBy: CURRENT_USER,
      updateDate: new Date().toISOString(),
    };
    if (isEditing) updateSchedule(scheduleId, payload);
    else addSchedule(payload);
    router.push("/app/coach/schedule");
  };

  return (
    <>
      <PageHeader
        title={isEditing ? "Update Schedule" : "Add Schedule"}
        description={
          isEditing ? `Editing ${scheduleId}` : `New schedule · ${scheduleId}`
        }
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
              onChange={(e) => setDojang(e.target.value)}
              error={errors.dojang}
              disabled={isEditing}
            >
              <option value="">Pilih Dojang</option>
              {DOJANG_OPTIONS.map((d) => (
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
              {PROGRAMS.map((p) => (
                <option key={p.id} value={p.id}>
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
                <option key={sp.id} value={sp.id}>
                  {sp.id} · {sp.name}
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
              disabled={isEditing}
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
              disabled={isEditing}
            >
              <option value="">Pilih Period</option>
              {PERIODS.map((p) => (
                <option key={p.id} value={p.id}>
                  {formatPeriod(p)}
                </option>
              ))}
            </Select>
            <Input
              label="Start Schedule"
              type="month"
              value={startSchedule}
              onChange={(e) => setStartSchedule(e.target.value)}
              error={errors.startSchedule}
              disabled={isEditing}
            />
            <Input
              label="End Schedule"
              type="month"
              value={endSchedule}
              onChange={(e) => setEndSchedule(e.target.value)}
              error={errors.endSchedule}
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
                // Remove if previously in secondary
                setSecondaryCoaches((arr) =>
                  arr.filter((u) => u !== e.target.value),
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
              label="Secondary Coaches (optional)"
              selected={secondaryCoaches.map((u) => ({
                value: u,
                label: coachByUsername.get(u)?.namaLengkap ?? u,
              }))}
              pickerValue={secondaryPick}
              setPickerValue={setSecondaryPick}
              options={availableSecondary.map((c) => ({
                value: c.username,
                label: c.namaLengkap,
              }))}
              onAdd={() => {
                if (secondaryPick) {
                  setSecondaryCoaches((arr) => [...arr, secondaryPick]);
                  setSecondaryPick("");
                }
              }}
              onRemove={(v) =>
                setSecondaryCoaches((arr) => arr.filter((u) => u !== v))
              }
              emptyHint="No secondary coaches assigned."
            />

            <ChipPicker
              label="Assistants (Student or Coach)"
              selected={assistants.map((u) => {
                const c = coachByUsername.get(u);
                const s = studentByUsername.get(u);
                return {
                  value: u,
                  label: c
                    ? `${c.namaLengkap} (Coach)`
                    : s
                      ? `${s.namaLengkap} (Student)`
                      : u,
                };
              })}
              pickerValue={assistantPick}
              setPickerValue={setAssistantPick}
              options={availableAssistants}
              onAdd={() => {
                if (assistantPick) {
                  setAssistants((arr) => [...arr, assistantPick]);
                  setAssistantPick("");
                }
              }}
              onRemove={(v) =>
                setAssistants((arr) => arr.filter((u) => u !== v))
              }
              emptyHint="No assistants assigned."
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

        <div className="flex items-center justify-end gap-2 pt-2 pb-4">
          <Button
            variant="outline"
            onClick={() => router.push("/app/coach/schedule")}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {isEditing ? "Save Changes" : "Add Schedule"}
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
